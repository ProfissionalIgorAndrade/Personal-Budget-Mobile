import { StyleSheet, Text, View } from 'react-native';

import type { MonthlyTrend } from '@/api/dashboardApi';
import { EmptyText, SectionCard } from '@/features/dashboard/components/SectionCard';
import type { Section } from '@/features/dashboard/useDashboard';
import { formatCompact } from '@/lib/format';
import { colors, spacing } from '@/theme';

const CHART_HEIGHT = 120;

export function TrendCard({ section }: { section: Section<MonthlyTrend[]> }) {
  return (
    <SectionCard title="Fluxo de caixa (6 meses)" section={section}>
      {(trends) => {
        const max = Math.max(1, ...trends.flatMap((t) => [t.totalIncome, t.totalExpense]));
        const hasData = trends.some((t) => t.totalIncome > 0 || t.totalExpense > 0);
        if (!hasData) return <EmptyText>Sem movimentação nesses meses.</EmptyText>;

        return (
          <View style={styles.wrap}>
            <View style={styles.legend}>
              <LegendDot color={colors.income} label="Receitas" />
              <LegendDot color={colors.expense} label="Despesas" />
            </View>

            <View style={styles.chart}>
              {trends.map((t) => (
                <View key={`${t.year}-${t.month}`} style={styles.column}>
                  <View style={styles.bars}>
                    <Bar value={t.totalIncome} max={max} color={colors.income} />
                    <Bar value={t.totalExpense} max={max} color={colors.expense} />
                  </View>
                  <Text style={styles.monthLabel} numberOfLines={1}>
                    {t.label}
                  </Text>
                  <Text style={[styles.balance, { color: t.balance < 0 ? colors.expense : colors.textMuted }]} numberOfLines={1}>
                    {formatCompact(t.balance)}
                  </Text>
                </View>
              ))}
            </View>
            <Text style={styles.footnote}>Número abaixo de cada mês: saldo.</Text>
          </View>
        );
      }}
    </SectionCard>
  );
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  // Minimum of 2px so a small non-zero value is still visible.
  const height = value > 0 ? Math.max(2, (value / max) * CHART_HEIGHT) : 0;
  return <View style={[styles.bar, { height, backgroundColor: color }]} />;
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  legend: { flexDirection: 'row', gap: spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: colors.textMuted },
  chart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 4 },
  column: { flex: 1, alignItems: 'center', gap: 4 },
  bars: { height: CHART_HEIGHT, flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  bar: { width: 11, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  monthLabel: { fontSize: 11, color: colors.text, fontWeight: '600' },
  balance: { fontSize: 10 },
  footnote: { fontSize: 11, color: colors.textMuted },
});
