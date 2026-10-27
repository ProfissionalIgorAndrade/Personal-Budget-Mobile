import { StyleSheet, Text, View } from 'react-native';

import type { Transaction } from '@/api/dashboardApi';
import { EmptyText, SectionCard } from '@/features/dashboard/components/SectionCard';
import type { Section } from '@/features/dashboard/useDashboard';
import { formatCurrency, formatShortDate } from '@/lib/format';
import { colors, spacing } from '@/theme';

export function RecentCard({ section }: { section: Section<Transaction[]> }) {
  return (
    <SectionCard title="Últimos lançamentos" section={section}>
      {(items) =>
        items.length === 0 ? (
          <EmptyText>Nenhum lançamento neste mês.</EmptyText>
        ) : (
          <View>
            {items.map((tx, index) => {
              const isIncome = tx.type === 'Income';
              const meta = [tx.categoryName, tx.creditCardName, tx.correspondentDisplayName].filter(Boolean).join(' · ');
              return (
                <View key={tx.id} style={[styles.row, index > 0 && styles.divider]}>
                  <View style={styles.left}>
                    <Text style={styles.description} numberOfLines={1}>
                      {tx.description}
                    </Text>
                    <Text style={styles.meta} numberOfLines={1}>
                      {formatShortDate(tx.date)}
                      {meta ? ` · ${meta}` : ''}
                    </Text>
                  </View>
                  <Text style={[styles.amount, { color: isIncome ? colors.income : colors.expense }]}>
                    {isIncome ? '+' : '-'}
                    {formatCurrency(tx.amount)}
                  </Text>
                </View>
              );
            })}
          </View>
        )
      }
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, gap: spacing.sm },
  divider: { borderTopWidth: 1, borderTopColor: colors.track },
  left: { flex: 1, gap: 2 },
  description: { fontSize: 15, color: colors.text, fontWeight: '500' },
  meta: { fontSize: 12, color: colors.textMuted },
  amount: { fontSize: 15, fontWeight: '700' },
});
