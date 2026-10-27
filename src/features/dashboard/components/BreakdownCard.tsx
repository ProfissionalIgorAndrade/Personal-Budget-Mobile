import { StyleSheet, Text, View } from 'react-native';

import type { DashboardSummary } from '@/api/dashboardApi';
import { SectionCard } from '@/features/dashboard/components/SectionCard';
import type { Section } from '@/features/dashboard/useDashboard';
import { formatCurrency, formatPercent } from '@/lib/format';
import { colors, spacing } from '@/theme';

export function BreakdownCard({ section }: { section: Section<DashboardSummary> }) {
  return (
    <SectionCard title="Para onde vai o dinheiro" section={section}>
      {(s) => {
        // Above 100% the bar is capped, but the number still shows the real value.
        const committed = Math.max(0, Math.min(100, s.committedIncomePercent));
        const overCommitted = s.committedIncomePercent > 70;

        return (
          <View style={styles.wrap}>
            <Row label="Despesas fixas" value={s.fixedExpenses} />
            <Row label="Despesas variáveis" value={s.variableExpenses} />
            <Row label="Parcelas do mês" value={s.installmentsThisMonth} />
            <Row label="Fatura do cartão" value={s.creditCardInvoice} />

            {s.totalIncome > 0 ? (
              <View style={styles.committed}>
                <View style={styles.committedHeader}>
                  <Text style={styles.label}>Renda comprometida com fixas</Text>
                  <Text style={[styles.value, overCommitted && { color: colors.warning }]}>
                    {formatPercent(s.committedIncomePercent)}
                  </Text>
                </View>
                <View style={styles.track}>
                  <View
                    style={[
                      styles.fill,
                      { width: `${committed}%`, backgroundColor: overCommitted ? colors.warning : colors.primary },
                    ]}
                  />
                </View>
              </View>
            ) : null}
          </View>
        );
      }}
    </SectionCard>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{formatCurrency(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 2 },
  label: { fontSize: 14, color: colors.textMuted },
  value: { fontSize: 15, fontWeight: '600', color: colors.text },
  committed: { marginTop: spacing.sm, gap: 6 },
  committedHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.track, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
});
