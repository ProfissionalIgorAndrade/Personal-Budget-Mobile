import { StyleSheet, Text, View } from 'react-native';

import type { AccountsSummary } from '@/api/dashboardApi';
import { EmptyText, SectionCard } from '@/features/dashboard/components/SectionCard';
import type { Section } from '@/features/dashboard/useDashboard';
import { formatCurrency } from '@/lib/format';
import { colors, spacing } from '@/theme';

export function AccountsCard({ section }: { section: Section<AccountsSummary> }) {
  return (
    <SectionCard title="Contas" section={section}>
      {(summary) => (
        <View style={styles.wrap}>
          <View>
            <Text style={styles.caption}>Saldo total</Text>
            <Text style={[styles.total, { color: summary.totalBalance < 0 ? colors.expense : colors.text }]}>
              {formatCurrency(summary.totalBalance)}
            </Text>
          </View>

          {summary.accounts.length === 0 ? (
            <EmptyText>Nenhuma conta cadastrada.</EmptyText>
          ) : (
            summary.accounts.map((account, index) => (
              <View key={account.id} style={[styles.row, index === 0 && styles.firstRow]}>
                <Text style={styles.name} numberOfLines={1}>
                  {account.name}
                </Text>
                <Text style={[styles.balance, { color: account.balance < 0 ? colors.expense : colors.text }]}>
                  {formatCurrency(account.balance)}
                </Text>
              </View>
            ))
          )}
        </View>
      )}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  caption: { fontSize: 13, color: colors.textMuted },
  total: { fontSize: 26, fontWeight: '800', marginBottom: spacing.sm },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.track,
  },
  firstRow: { marginTop: 0 },
  name: { fontSize: 14, color: colors.text, flex: 1 },
  balance: { fontSize: 14, fontWeight: '600' },
});
