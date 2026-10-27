import { useEffect, useMemo, useRef, useState, type ComponentRef } from 'react';
import { ActivityIndicator, Keyboard, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

import { createTransaction } from '@/api/createApi';
import type { Account, Category } from '@/api/catalogApi';
import { AmountInput } from '@/components/ui/AmountInput';
import { Chip, ChipGroup } from '@/components/ui/Chip';
import { DateChips } from '@/components/ui/DateChips';
import { ErrorBanner, Field, FormScreen, PrimaryButton, SuccessBanner, TextField } from '@/components/ui/Form';
import { Segmented } from '@/components/ui/Segmented';
import { useReferenceData } from '@/features/catalog/ReferenceDataContext';
import {
  DEFAULT_PREFERENCES,
  loadPreferences,
  savePreferences,
  type QuickAddPreferences,
} from '@/features/transactions/quickAddPreferences';
import {
  allowedFrequencies,
  buildTransactionBody,
  installmentPlan,
  MAX_INSTALLMENTS,
  validateDraft,
  type InstallmentAmountMode,
  type PaymentSource,
  type TransactionDraft,
  type TxFrequency,
  type TxKind,
} from '@/features/transactions/transactionPayload';
import { emitDataChanged } from '@/lib/dataEvents';
import { shortMonthLabel, statementDueLabel, statementFor, todayIso } from '@/lib/dates';
import { formatCurrency } from '@/lib/format';
import { colors, radius, spacing } from '@/theme';

const KIND_OPTIONS = [
  { value: 'expense' as const, label: 'Despesa', color: colors.expense },
  { value: 'income' as const, label: 'Receita', color: colors.income },
  { value: 'transfer' as const, label: 'Transferência', color: colors.text },
];

const KIND_NOUN: Record<TxKind, string> = { expense: 'despesa', income: 'receita', transfer: 'transferência' };

const INSTALLMENT_SHORTCUTS = [2, 3, 4, 5, 6, 10, 12];
const STATEMENT_OFFSETS = [-1, 0, 1, 2];
// Above this many categories a search field is shown above the lists.
const SEARCH_THRESHOLD = 12;
// The backend's own category for transfers; it is never picked by hand.
const TRANSFER_CATEGORY = 'transferência';

const isSavings = (account: Account) => account.kind === 'Savings';
type SourceOption = { source: PaymentSource; label: string; icon: string };
type SourceGroup = { title: string; options: SourceOption[] };

const sameSource = (a: PaymentSource | null, b: PaymentSource | null) => !!a && !!b && a.type === b.type && a.id === b.id;

export function QuickAddForm({ initialKind }: { initialKind?: TxKind }) {
  const { categories, cards, accounts, profiles, loading, error: loadError, reload } = useReferenceData();
  const amountRef = useRef<ComponentRef<typeof TextInput>>(null);

  const [prefs, setPrefs] = useState<QuickAddPreferences | null>(null);
  const [kind, setKind] = useState<TxKind>(initialKind ?? 'expense');
  const [amountCents, setAmountCents] = useState(0);
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [source, setSource] = useState<PaymentSource | null>(null);
  const [frequency, setFrequency] = useState<TxFrequency>('variable');
  const [installments, setInstallments] = useState(2);
  const [amountMode, setAmountMode] = useState<InstallmentAmountMode>('total');
  const [statementOffset, setStatementOffset] = useState(0);
  const [date, setDate] = useState(todayIso);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [fromAccountId, setFromAccountId] = useState<string | null>(null);
  const [toAccountId, setToAccountId] = useState<string | null>(null);
  const [categoryQuery, setCategoryQuery] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const initialized = useRef(false);
  const previousKind = useRef<TxKind | null>(null);

  const checkingAccounts = useMemo(() => accounts.filter((a) => !isSavings(a)), [accounts]);

  // Every registered card and account is listed. Two cards with the same name
  // (e.g. one Nubank per person) are told apart by the owner's name.
  const cardOptions = useMemo((): SourceOption[] => {
    const nameCount = new Map<string, number>();
    cards.forEach((c) => nameCount.set(c.name, (nameCount.get(c.name) ?? 0) + 1));
    return cards.map((c) => {
      const owner = profiles.find((p) => p.id === c.memberId)?.displayName;
      return {
        source: { type: 'card' as const, id: c.id },
        label: (nameCount.get(c.name) ?? 0) > 1 && owner ? `${c.name} · ${owner}` : c.name,
        icon: '💳',
      };
    });
  }, [cards, profiles]);

  const accountOptions = useMemo(
    (): SourceOption[] =>
      checkingAccounts.map((a) => ({
        source: { type: 'account' as const, id: a.id },
        label: a.displayName,
        icon: '🏦',
      })),
    [checkingAccounts],
  );

  // Cards first for expenses (most purchases), accounts first for income.
  const sourceGroups = useMemo((): SourceGroup[] => {
    const cardGroup = { title: 'Cartões', options: cardOptions };
    const accountGroup = { title: 'Contas', options: accountOptions };
    return kind === 'income' ? [accountGroup, cardGroup] : [cardGroup, accountGroup];
  }, [cardOptions, accountOptions, kind]);

  const sourceOptions = useMemo(() => sourceGroups.flatMap((g) => g.options), [sourceGroups]);

  const sourceExists = (s: PaymentSource | null | undefined) =>
    !!s && sourceOptions.some((option) => sameSource(option.source, s));

  // Restore remembered choices once the lists and preferences are available.
  useEffect(() => {
    loadPreferences().then(setPrefs);
  }, []);

  useEffect(() => {
    if (initialized.current || !prefs || loading) return;
    initialized.current = true;
    const startKind = initialKind ?? prefs.lastKind;
    setKind(startKind);
    if (prefs.memberId && profiles.some((p) => p.id === prefs.memberId)) setMemberId(prefs.memberId);
    if (prefs.fromAccountId && accounts.some((a) => a.id === prefs.fromAccountId)) setFromAccountId(prefs.fromAccountId);
    if (prefs.toAccountId && accounts.some((a) => a.id === prefs.toAccountId)) setToAccountId(prefs.toAccountId);
  }, [prefs, loading, initialKind, profiles, accounts]);

  // On a kind change, use the source remembered for that kind. When only the
  // lists reload, keep the current choice if it still exists.
  useEffect(() => {
    if (kind === 'transfer' || !prefs) return;
    const kindChanged = previousKind.current !== kind;
    previousKind.current = kind;
    const remembered = prefs.sourceByKind[kind];
    setSource((current) => {
      if (!kindChanged && sourceExists(current)) return current;
      if (sourceExists(remembered)) return remembered ?? null;
      if (sourceExists(current)) return current;
      return sourceOptions[0]?.source ?? null;
    });
    // sourceExists is derived from sourceOptions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, prefs, sourceOptions]);

  // Each card remembers how far its statement usually is from the purchase.
  useEffect(() => {
    if (source?.type === 'card') setStatementOffset(prefs?.statementOffsetByCard[source.id] ?? 0);
  }, [source, prefs]);

  // All registered categories, expenses and incomes, each group sorted by how
  // often it is used, then by name. The group of the current kind comes first.
  const selectableCategories = useMemo(
    () => categories.filter((c) => c.name.trim().toLowerCase() !== TRANSFER_CATEGORY),
    [categories],
  );

  const categoryGroups = useMemo(() => {
    const usage = prefs?.categoryUsage ?? {};
    const query = categoryQuery.trim().toLowerCase();
    const pick = (type: Category['type']) =>
      selectableCategories
        .filter((c) => c.type === type && (!query || c.name.toLowerCase().includes(query)))
        .sort((a, b) => (usage[b.id] ?? 0) - (usage[a.id] ?? 0) || a.name.localeCompare(b.name, 'pt-BR'));
    const expense = { type: 'Expense' as const, title: 'Despesas', items: pick('Expense') };
    const income = { type: 'Income' as const, title: 'Receitas', items: pick('Income') };
    return kind === 'income' ? [income, expense] : [expense, income];
  }, [selectableCategories, categoryQuery, prefs, kind]);

  const selectedCategory: Category | undefined = categories.find((c) => c.id === categoryId);
  const selectedCard = source?.type === 'card' ? cards.find((c) => c.id === source.id) : undefined;
  const allowed = allowedFrequencies(kind, source);
  const effectiveFrequency: TxFrequency = allowed.includes(frequency) ? frequency : 'variable';
  const statement = statementFor(date, statementOffset);
  const plan = installmentPlan(amountCents, installments, amountMode);

  function changeKind(next: TxKind) {
    setKind(next);
    setError(null);
    setSuccess(null);
    if (selectedCategory && selectedCategory.type !== (next === 'income' ? 'Income' : 'Expense')) setCategoryId(null);
  }

  // Picking an income category while on "Despesa" (or the opposite) switches
  // the kind, so any registered category can be chosen from one list.
  function selectCategory(category: Category) {
    setError(null);
    setSuccess(null);
    Keyboard.dismiss();
    if (category.id === categoryId) {
      setCategoryId(null);
      return;
    }
    const categoryKind: TxKind = category.type === 'Income' ? 'income' : 'expense';
    if (kind !== categoryKind) setKind(categoryKind);
    setCategoryId(category.id);
  }

  function draftFromState(): TransactionDraft {
    const fallbackDescription = kind === 'transfer' ? 'Transferência' : selectedCategory?.name ?? '';
    return {
      kind,
      amountCents,
      description: description.trim() || fallbackDescription,
      categoryId: kind === 'transfer' ? null : categoryId,
      source: kind === 'transfer' ? null : source,
      frequency: kind === 'transfer' ? 'variable' : effectiveFrequency,
      installments,
      installmentAmountMode: amountMode,
      statementMonth: source?.type === 'card' ? statement.month : null,
      statementYear: source?.type === 'card' ? statement.year : null,
      date,
      memberId,
      notes,
      fromAccountId,
      toAccountId,
    };
  }

  async function rememberChoices() {
    const base = prefs ?? DEFAULT_PREFERENCES;
    const next: QuickAddPreferences = {
      ...base,
      lastKind: kind,
      memberId,
      sourceByKind: kind === 'transfer' || !source ? base.sourceByKind : { ...base.sourceByKind, [kind]: source },
      statementOffsetByCard:
        source?.type === 'card' && kind !== 'transfer'
          ? { ...base.statementOffsetByCard, [source.id]: statementOffset }
          : base.statementOffsetByCard,
      categoryUsage:
        categoryId && kind !== 'transfer'
          ? { ...base.categoryUsage, [categoryId]: (base.categoryUsage[categoryId] ?? 0) + 1 }
          : base.categoryUsage,
      fromAccountId: kind === 'transfer' ? fromAccountId : base.fromAccountId,
      toAccountId: kind === 'transfer' ? toAccountId : base.toAccountId,
    };
    setPrefs(next);
    await savePreferences(next);
  }

  async function submit(addAnother: boolean) {
    setError(null);
    setSuccess(null);
    const draft = draftFromState();
    const errors = validateDraft(draft);
    if (errors.length > 0) {
      setError(errors[0]);
      return;
    }

    setSubmitting(true);
    try {
      await createTransaction(buildTransactionBody(draft));
      await rememberChoices();
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      emitDataChanged();

      if (!addAnother) {
        router.back();
        return;
      }
      const savedAmount = effectiveFrequency === 'installments' ? plan.totalCents : amountCents;
      setSuccess(`${capitalize(KIND_NOUN[kind])} de ${formatCurrency(savedAmount / 100)} salva.`);
      setAmountCents(0);
      setDescription('');
      setCategoryId(null);
      setNotes('');
      setFrequency('variable');
      setInstallments(2);
      setCategoryQuery('');
      amountRef.current?.focus();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível salvar.');
    } finally {
      setSubmitting(false);
    }
  }

  const amountColor = kind === 'expense' ? colors.expense : kind === 'income' ? colors.income : colors.text;
  const saveLabel = amountCents > 0
    ? `Salvar ${KIND_NOUN[kind]} · ${formatCurrency((effectiveFrequency === 'installments' ? plan.totalCents : amountCents) / 100)}`
    : `Salvar ${KIND_NOUN[kind]}`;

  if (loading && !initialized.current) {
    return (
      <FormScreen title="Novo lançamento">
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      </FormScreen>
    );
  }

  if (loadError) {
    return (
      <FormScreen title="Novo lançamento">
        <ErrorBanner message={loadError} />
        <PrimaryButton title="Tentar de novo" onPress={() => void reload()} />
      </FormScreen>
    );
  }

  return (
    <FormScreen
      title="Novo lançamento"
      footer={
        <>
          <ErrorBanner message={error} />
          <SuccessBanner message={success} />
          <PrimaryButton title={saveLabel} onPress={() => void submit(false)} loading={submitting} />
          <PrimaryButton title="Salvar e lançar outra" variant="secondary" onPress={() => void submit(true)} disabled={submitting} />
        </>
      }
    >
      <Segmented options={KIND_OPTIONS} value={kind} onChange={changeKind} />

      <View style={styles.amountBox}>
        <Text style={styles.amountCaption}>
          {effectiveFrequency === 'installments' && kind !== 'transfer'
            ? amountMode === 'total'
              ? 'Valor total da compra'
              : 'Valor de cada parcela'
            : 'Valor'}
        </Text>
        <AmountInput
          ref={amountRef}
          cents={amountCents}
          onChangeCents={(c) => {
            setAmountCents(c);
            setSuccess(null);
          }}
          size="large"
          color={amountColor}
          autoFocus
          accessibilityLabel="Valor"
        />
      </View>

      {kind === 'transfer' ? (
        <TransferFields
          accounts={accounts}
          fromAccountId={fromAccountId}
          toAccountId={toAccountId}
          onFrom={(id) => {
            setFromAccountId(id);
            if (id === toAccountId) setToAccountId(null);
          }}
          onTo={setToAccountId}
        />
      ) : (
        <>
          <Field label="Categoria">
            {selectableCategories.length > SEARCH_THRESHOLD ? (
              <TextField
                value={categoryQuery}
                onChangeText={setCategoryQuery}
                placeholder="Buscar categoria"
                autoCorrect={false}
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
            ) : null}
            {selectableCategories.length === 0 ? (
              <Text style={styles.empty}>Nenhuma categoria cadastrada. Cadastre pela versão web.</Text>
            ) : (
              categoryGroups.map((group) => (
                <View key={group.type} style={styles.subGroup}>
                  <Text style={styles.subLabel}>
                    {group.title} ({group.items.length})
                  </Text>
                  {group.items.length === 0 ? (
                    <Text style={styles.empty}>{categoryQuery ? 'Nenhuma encontrada.' : 'Nenhuma cadastrada.'}</Text>
                  ) : (
                    <ChipGroup>
                      {group.items.map((c) => (
                        <Chip
                          key={c.id}
                          label={c.name}
                          icon={c.icon}
                          color={c.color}
                          selected={c.id === categoryId}
                          onPress={() => selectCategory(c)}
                        />
                      ))}
                    </ChipGroup>
                  )}
                </View>
              ))
            )}
          </Field>

          <Field
            label={kind === 'income' ? 'Recebido em' : 'Pagamento'}
            hint={kind === 'income' && source?.type === 'card' ? 'Receita no cartão entra como estorno na fatura.' : null}
          >
            {sourceOptions.length === 0 ? (
              <Text style={styles.empty}>Nenhuma conta ou cartão cadastrado. Cadastre pela versão web.</Text>
            ) : (
              sourceGroups.map((group) =>
                group.options.length === 0 ? null : (
                  <View key={group.title} style={styles.subGroup}>
                    <Text style={styles.subLabel}>
                      {group.title} ({group.options.length})
                    </Text>
                    <ChipGroup>
                      {group.options.map((option) => (
                        <Chip
                          key={`${option.source.type}-${option.source.id}`}
                          label={option.label}
                          icon={option.icon}
                          selected={sameSource(option.source, source)}
                          onPress={() => {
                            setSource(option.source);
                            setError(null);
                          }}
                        />
                      ))}
                    </ChipGroup>
                  </View>
                ),
              )
            )}
          </Field>

          {source ? (
            <FrequencyFields
              kind={kind}
              sourceType={source.type}
              allowed={allowed}
              frequency={effectiveFrequency}
              onFrequency={setFrequency}
              installments={installments}
              onInstallments={setInstallments}
              amountMode={amountMode}
              onAmountMode={setAmountMode}
              planText={
                amountCents > 0
                  ? `${plan.count}x de ${formatCurrency(plan.perInstallmentCents / 100)}` +
                    (plan.lastInstallmentCents !== plan.perInstallmentCents
                      ? ` (última ${formatCurrency(plan.lastInstallmentCents / 100)})`
                      : '') +
                    ` · total ${formatCurrency(plan.totalCents / 100)}`
                  : null
              }
              fixedDay={Number(date.slice(8, 10))}
            />
          ) : null}

          {selectedCard ? (
            <Field
              label={effectiveFrequency === 'installments' ? 'Fatura da 1ª parcela' : 'Fatura'}
              hint={(() => {
                const due = statementDueLabel(selectedCard.dueDay, statement);
                return due ? `Vence em ${due}. Lembramos a sua escolha para este cartão.` : null;
              })()}
            >
              <ChipGroup>
                {STATEMENT_OFFSETS.map((offset) => (
                  <Chip
                    key={offset}
                    label={shortMonthLabel(statementFor(date, offset))}
                    selected={offset === statementOffset}
                    onPress={() => setStatementOffset(offset)}
                  />
                ))}
              </ChipGroup>
            </Field>
          ) : null}
        </>
      )}

      <Field
        label="Descrição"
        hint={kind !== 'transfer' && !description.trim() && selectedCategory ? `Se ficar vazia, usamos “${selectedCategory.name}”.` : null}
      >
        <TextField
          value={description}
          onChangeText={setDescription}
          placeholder={kind === 'transfer' ? 'Transferência' : selectedCategory?.name ?? 'Ex.: Mercado, Uber, Salário'}
          maxLength={200}
          returnKeyType="done"
          autoCapitalize="sentences"
        />
      </Field>

      <Field label="Data">
        <DateChips value={date} onChange={setDate} />
      </Field>

      <Pressable onPress={() => setShowMore((v) => !v)} accessibilityRole="button" style={styles.moreToggle}>
        <Text style={styles.moreText}>
          {showMore ? '▾' : '▸'} Mais opções
          {!showMore ? ` · ${profiles.find((p) => p.id === memberId)?.displayName ?? 'Você'}${notes.trim() ? ' · com observação' : ''}` : ''}
        </Text>
      </Pressable>

      {showMore ? (
        <>
          <Field label="Quem" hint="Por padrão, o lançamento fica no seu perfil.">
            <ChipGroup>
              <Chip label="Você (padrão)" selected={memberId === null} onPress={() => setMemberId(null)} />
              {profiles.map((p) => (
                <Chip
                  key={p.id}
                  label={p.displayName}
                  icon={p.emoji}
                  selected={p.id === memberId}
                  onPress={() => setMemberId(p.id)}
                />
              ))}
            </ChipGroup>
          </Field>
          <Field label="Observações">
            <TextField value={notes} onChangeText={setNotes} placeholder="Opcional" multiline style={styles.notes} />
          </Field>
        </>
      ) : null}
    </FormScreen>
  );
}

function FrequencyFields({
  kind,
  sourceType,
  allowed,
  frequency,
  onFrequency,
  installments,
  onInstallments,
  amountMode,
  onAmountMode,
  planText,
  fixedDay,
}: {
  kind: TxKind;
  sourceType: 'card' | 'account';
  allowed: TxFrequency[];
  frequency: TxFrequency;
  onFrequency: (f: TxFrequency) => void;
  installments: number;
  onInstallments: (n: number) => void;
  amountMode: InstallmentAmountMode;
  onAmountMode: (m: InstallmentAmountMode) => void;
  planText: string | null;
  fixedDay: number;
}) {
  if (allowed.length < 2) return null;

  const labels: Record<TxFrequency, string> = {
    variable: sourceType === 'card' ? 'À vista' : 'Única',
    fixed: 'Fixa (todo mês)',
    installments: 'Parcelado',
  };

  return (
    <Field
      label="Recorrência"
      hint={
        frequency === 'fixed'
          ? `Cria este ${kind === 'income' ? 'recebimento' : 'pagamento'} todo dia ${fixedDay} pelos próximos 12 meses.`
          : null
      }
    >
      <ChipGroup>
        {allowed.map((f) => (
          <Chip key={f} label={labels[f]} selected={f === frequency} onPress={() => onFrequency(f)} />
        ))}
      </ChipGroup>

      {frequency === 'installments' ? (
        <View style={styles.installments}>
          <View style={styles.stepper}>
            <Pressable
              onPress={() => onInstallments(Math.max(2, installments - 1))}
              style={styles.stepButton}
              accessibilityLabel="Menos parcelas"
            >
              <Text style={styles.stepText}>−</Text>
            </Pressable>
            <Text style={styles.stepValue}>{installments}x</Text>
            <Pressable
              onPress={() => onInstallments(Math.min(MAX_INSTALLMENTS, installments + 1))}
              style={styles.stepButton}
              accessibilityLabel="Mais parcelas"
            >
              <Text style={styles.stepText}>+</Text>
            </Pressable>
          </View>
          <ChipGroup>
            {INSTALLMENT_SHORTCUTS.map((n) => (
              <Chip key={n} label={`${n}x`} selected={n === installments} onPress={() => onInstallments(n)} />
            ))}
          </ChipGroup>
          <Segmented
            options={[
              { value: 'total', label: 'Digitei o total' },
              { value: 'perInstallment', label: 'Digitei a parcela' },
            ]}
            value={amountMode}
            onChange={onAmountMode}
          />
          {planText ? <Text style={styles.plan}>{planText}</Text> : null}
        </View>
      ) : null}
    </Field>
  );
}

function TransferFields({
  accounts,
  fromAccountId,
  toAccountId,
  onFrom,
  onTo,
}: {
  accounts: Account[];
  fromAccountId: string | null;
  toAccountId: string | null;
  onFrom: (id: string) => void;
  onTo: (id: string) => void;
}) {
  // Same rule as the web: a savings box is never the origin of a transfer.
  const origins = accounts.filter((a) => !isSavings(a));
  const destinations = accounts.filter((a) => a.id !== fromAccountId);

  if (accounts.length < 2) {
    return (
      <Text style={styles.empty}>Transferência precisa de pelo menos duas contas. Cadastre pela versão web.</Text>
    );
  }

  return (
    <>
      <Field label="De">
        <ChipGroup>
          {origins.map((a) => (
            <Chip key={a.id} icon="🏦" label={a.displayName} selected={a.id === fromAccountId} onPress={() => onFrom(a.id)} />
          ))}
        </ChipGroup>
      </Field>
      <Field label="Para">
        <ChipGroup>
          {destinations.map((a) => (
            <Chip
              key={a.id}
              icon={isSavings(a) ? '🐷' : '🏦'}
              label={a.displayName}
              selected={a.id === toAccountId}
              onPress={() => onTo(a.id)}
            />
          ))}
        </ChipGroup>
      </Field>
    </>
  );
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const styles = StyleSheet.create({
  amountBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.track,
  },
  amountCaption: { textAlign: 'center', fontSize: 13, color: colors.textMuted },
  empty: { fontSize: 14, color: colors.textMuted },
  subGroup: { gap: spacing.sm },
  subLabel: { fontSize: 13, fontWeight: '600', color: colors.text },
  installments: { gap: spacing.md, marginTop: spacing.xs },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  stepButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { fontSize: 22, color: colors.primary, fontWeight: '700' },
  stepValue: { fontSize: 24, fontWeight: '800', color: colors.text, minWidth: 64, textAlign: 'center' },
  plan: { fontSize: 14, color: colors.text, fontWeight: '600', textAlign: 'center' },
  moreToggle: { paddingVertical: spacing.xs },
  moreText: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  notes: { minHeight: 72, textAlignVertical: 'top' },
});
