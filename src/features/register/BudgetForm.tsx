import { useState } from 'react';
import { Text } from 'react-native';

import { upsertBudget } from '@/api/createApi';
import { AmountInput } from '@/components/ui/AmountInput';
import { Chip, ChipGroup } from '@/components/ui/Chip';
import { ErrorBanner, Field, FormScreen, PrimaryButton } from '@/components/ui/Form';
import { useReferenceData } from '@/features/catalog/ReferenceDataContext';
import { MonthSelector } from '@/features/dashboard/components/MonthSelector';
import { useCreateAction } from '@/features/register/useCreateAction';
import { currentYearMonth, formatMonthYear, type YearMonth } from '@/lib/format';
import { colors } from '@/theme';

// Monthly spending limit for an expense category. The backend upserts: saving
// again for the same category and month replaces the previous limit.
export function BudgetForm() {
  const { categories } = useReferenceData();
  const expenseCategories = categories.filter((c) => c.type === 'Expense');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [period, setPeriod] = useState<YearMonth>(currentYearMonth);
  const [limitCents, setLimitCents] = useState(0);
  const { submitting, error, run } = useCreateAction('budget');

  const save = () =>
    run(
      () => {
        if (!categoryId) return 'Selecione a categoria.';
        if (!(limitCents > 0)) return 'O limite deve ser maior que zero.';
        return null;
      },
      () => upsertBudget({ categoryId: categoryId as string, month: period.month, year: period.year, limitAmount: limitCents / 100 }),
    );

  return (
    <FormScreen
      title="Novo orçamento"
      footer={
        <>
          <ErrorBanner message={error} />
          <PrimaryButton title="Salvar orçamento" onPress={() => void save()} loading={submitting} />
        </>
      }
    >
      <Field label="Mês">
        <MonthSelector value={period} onChange={setPeriod} />
      </Field>
      <Field label="Limite de gasto" hint={`Se já houver orçamento desta categoria em ${formatMonthYear(period)}, ele é substituído.`}>
        <AmountInput cents={limitCents} onChangeCents={setLimitCents} accessibilityLabel="Limite de gasto" />
      </Field>
      <Field label="Categoria">
        {expenseCategories.length === 0 ? (
          <Text style={{ color: colors.textMuted }}>Nenhuma categoria de despesa cadastrada.</Text>
        ) : (
          <ChipGroup>
            {expenseCategories.map((c) => (
              <Chip
                key={c.id}
                label={c.name}
                icon={c.icon}
                color={c.color}
                selected={c.id === categoryId}
                onPress={() => setCategoryId(c.id)}
              />
            ))}
          </ChipGroup>
        )}
      </Field>
    </FormScreen>
  );
}
