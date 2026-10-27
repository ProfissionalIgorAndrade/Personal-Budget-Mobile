// Client-side validation and request body for POST /api/transactions.
//
// Port of the web app's application/createTransactionPayload.js, kept in sync
// with the backend rules in TransactionService.ValidateTransactionFrequency
// and the creation strategies:
//   - Category is required, except for transfers (backend uses its own).
//   - Fixed ("Fixa") only with an account; it materializes 12 monthly rows.
//   - Installments only with a credit card, expense only, 2+ installments.
//   - A credit card purchase needs the statement (month/year) it belongs to.
//   - A one-off card purchase uses frequency Variable.
//   - Transfers use frequency Variable and two different accounts.
// Pure module (no React) so it can be unit tested.

export type TxKind = 'expense' | 'income' | 'transfer';
export type TxFrequency = 'variable' | 'fixed' | 'installments';
export type InstallmentAmountMode = 'total' | 'perInstallment';

export type PaymentSource = { type: 'account'; id: string } | { type: 'card'; id: string };

export type TransactionDraft = {
  kind: TxKind;
  amountCents: number;
  description: string;
  categoryId: string | null;
  source: PaymentSource | null;
  frequency: TxFrequency;
  installments: number;
  installmentAmountMode: InstallmentAmountMode;
  statementMonth: number | null;
  statementYear: number | null;
  date: string; // yyyy-MM-dd
  memberId: string | null;
  notes: string;
  fromAccountId: string | null;
  toAccountId: string | null;
};

export type CreateTransactionBody = {
  type: 'Income' | 'Expense';
  frequency: 'Variable' | 'Fixed' | 'Installments';
  paymentMethod: 'Account' | 'CreditCard' | 'Transfer';
  amount: number;
  date: string;
  description: string;
  categoryId: string | null;
  attributionProfileId: string | null;
  accountId: string | null;
  creditCardId: string | null;
  fromAccountId?: string | null;
  toAccountId?: string | null;
  installmentCount?: number;
  totalAmount?: number;
  repeatCount?: number;
  statementMonth?: number;
  statementYear?: number;
  observations: string | null;
};

// Same window as the web (FIXED_WINDOW_MONTHS): "Fixa" creates 12 months.
export const FIXED_WINDOW_MONTHS = 12;
export const MAX_INSTALLMENTS = 60;
export const DESCRIPTION_MAX_LENGTH = 200;

// Which frequencies make sense for the chosen kind and payment source.
export function allowedFrequencies(kind: TxKind, source: PaymentSource | null): TxFrequency[] {
  if (kind === 'transfer') return ['variable'];
  if (source?.type === 'card') return kind === 'expense' ? ['variable', 'installments'] : ['variable'];
  return ['variable', 'fixed'];
}

// Half-to-even on cents, like decimal Math.Round in .NET (the backend splits
// installments with it), so the preview matches what will be saved.
function divideCentsHalfEven(total: number, parts: number): number {
  const exact = total / parts;
  const floor = Math.floor(exact);
  const diff = exact - floor;
  if (Math.abs(diff - 0.5) < 1e-9) return floor % 2 === 0 ? floor : floor + 1;
  return Math.round(exact);
}

export type InstallmentPlan = { count: number; perInstallmentCents: number; lastInstallmentCents: number; totalCents: number };

export function installmentPlan(amountCents: number, count: number, mode: InstallmentAmountMode): InstallmentPlan {
  const n = Math.max(1, Math.floor(count));
  if (mode === 'perInstallment') {
    return { count: n, perInstallmentCents: amountCents, lastInstallmentCents: amountCents, totalCents: amountCents * n };
  }
  const per = divideCentsHalfEven(amountCents, n);
  return { count: n, perInstallmentCents: per, lastInstallmentCents: amountCents - per * (n - 1), totalCents: amountCents };
}

export function validateDraft(d: TransactionDraft): string[] {
  const errors: string[] = [];

  if (!(d.amountCents > 0)) errors.push('Informe o valor.');

  // Order matters: the form shows the first error, and the description is
  // filled from the category, so the choices come before the text fields.
  const checkTextFields = () => {
    const description = d.description.trim();
    if (!description) errors.push('Informe a descrição.');
    else if (description.length > DESCRIPTION_MAX_LENGTH) errors.push(`A descrição pode ter até ${DESCRIPTION_MAX_LENGTH} caracteres.`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date)) errors.push('Informe a data.');
  };

  if (d.kind === 'transfer') {
    if (!d.fromAccountId || !d.toAccountId) errors.push('Selecione a conta de origem e a de destino.');
    else if (d.fromAccountId === d.toAccountId) errors.push('Origem e destino devem ser contas diferentes.');
    checkTextFields();
    return errors;
  }

  if (!d.categoryId) errors.push('Selecione uma categoria.');
  if (!d.source) {
    errors.push('Selecione a conta ou o cartão.');
    checkTextFields();
    return errors;
  }

  if (!allowedFrequencies(d.kind, d.source).includes(d.frequency)) {
    if (d.frequency === 'fixed') errors.push('Fixa é exclusiva de conta. No cartão use à vista ou parcelado.');
    else if (d.frequency === 'installments') errors.push('Parcelamento só é permitido em despesa no cartão de crédito.');
    else errors.push('Recorrência inválida para este pagamento.');
  }

  if (d.source.type === 'card') {
    const month = d.statementMonth ?? 0;
    if (month < 1 || month > 12 || !d.statementYear || d.statementYear < 2000) errors.push('Selecione a fatura.');
  }

  if (d.frequency === 'installments') {
    if (!Number.isInteger(d.installments) || d.installments < 2) errors.push('Parcelamento exige duas ou mais parcelas.');
    else if (d.installments > MAX_INSTALLMENTS) errors.push(`O máximo é ${MAX_INSTALLMENTS} parcelas.`);
  }

  checkTextFields();
  return errors;
}

const toReais = (cents: number) => Math.round(cents) / 100;

export function buildTransactionBody(d: TransactionDraft): CreateTransactionBody {
  const errors = validateDraft(d);
  if (errors.length > 0) throw new Error(errors[0]);

  const observations = d.notes.trim() || null;
  const description = d.description.trim();
  const attributionProfileId = d.memberId || null;

  if (d.kind === 'transfer') {
    return {
      type: 'Expense',
      frequency: 'Variable',
      paymentMethod: 'Transfer',
      amount: toReais(d.amountCents),
      date: d.date,
      description,
      categoryId: null,
      attributionProfileId,
      accountId: null,
      creditCardId: null,
      fromAccountId: d.fromAccountId,
      toAccountId: d.toAccountId,
      observations,
    };
  }

  const base = {
    type: d.kind === 'income' ? ('Income' as const) : ('Expense' as const),
    date: d.date,
    description,
    categoryId: d.categoryId,
    attributionProfileId,
    observations,
  };
  const source = d.source as PaymentSource;

  if (source.type === 'card') {
    const card = {
      ...base,
      paymentMethod: 'CreditCard' as const,
      creditCardId: source.id,
      accountId: null,
      statementMonth: d.statementMonth as number,
      statementYear: d.statementYear as number,
    };

    if (d.frequency === 'installments') {
      const plan = installmentPlan(d.amountCents, d.installments, d.installmentAmountMode);
      return {
        ...card,
        frequency: 'Installments',
        installmentCount: plan.count,
        amount: toReais(plan.perInstallmentCents),
        totalAmount: toReais(plan.totalCents),
      };
    }

    return { ...card, frequency: 'Variable', amount: toReais(d.amountCents) };
  }

  const account = {
    ...base,
    paymentMethod: 'Account' as const,
    accountId: source.id,
    creditCardId: null,
    amount: toReais(d.amountCents),
  };

  if (d.frequency === 'fixed') {
    return { ...account, frequency: 'Fixed', repeatCount: FIXED_WINDOW_MONTHS };
  }
  return { ...account, frequency: 'Variable' };
}
