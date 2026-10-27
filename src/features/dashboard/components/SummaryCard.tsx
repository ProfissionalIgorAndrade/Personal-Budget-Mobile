import { StyleSheet, Text, View } from 'react-native';

import type { DashboardSummary } from '@/api/dashboardApi';
import { SectionCard } from '@/features/dashboard/components/SectionCard';
import type { Section } from '@/features/dashboard/useDashboard';
import { formatCurrency, formatPercent } from '@/lib/format';
import { colors, spacing } from '@/theme';

export function SummaryCard({ section }: { section: Section<DashboardSummary> }) {
  return (
    <SectionCard title="Resumo do mês" section={section}>
      {(s) => (
        <View style={styles.wrap}>
          <View>
            <Text style={styles.caption}>Saldo</Text>
            <Text style={[styles.balance, { color: s.balance < 0 ? colors.expense : colors.text }]}>
              {formatCurrency(s.balance)}
            </Text>
            <Text style={styles.caption}>
              {s.totalIncome > 0 ? `Poupança de ${formatPercent(s.savingsPercent)} da renda` : 'Sem receitas no mês'}
            </Text>
          </View>

          <View style={styles.row}>
            <Metric label="Receitas" value={formatCurrency(s.totalIncome)} color={colors.income} />
            <Metric label="Despesas" value={formatCurrency(s.totalExpense)} color={colors.expense} />
          </View>

          <Text style={styles.footer}>{s.transactionCount} lançamentos no mês</Text>
        </View>
      )}
    </SectionCard>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.caption}>{label}</Text>
      <Text style={[styles.metricValue, { color }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  caption: { fontSize: 13, color: colors.textMuted },
  balance: { fontSize: 32, fontWeight: '800', marginVertical: 2 },
  row: { flexDirection: 'row', gap: spacing.md },
  metric: { flex: 1, backgroundColor: colors.background, borderRadius: 12, padding: spacing.md, gap: 2 },
  metricValue: { fontSize: 18, fontWeight: '700' },
  footer: { fontSize: 12, color: colors.textMuted },
});
