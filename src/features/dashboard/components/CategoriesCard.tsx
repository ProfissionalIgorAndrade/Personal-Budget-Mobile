import { StyleSheet, Text, View } from 'react-native';

import type { CategoryGroups } from '@/api/dashboardApi';
import { EmptyText, SectionCard } from '@/features/dashboard/components/SectionCard';
import type { Section } from '@/features/dashboard/useDashboard';
import { formatCurrency, formatPercent } from '@/lib/format';
import { chartPalette, colors, spacing } from '@/theme';

const MAX_VISIBLE = 6;

export function CategoriesCard({ section }: { section: Section<CategoryGroups> }) {
  return (
    <SectionCard title="Despesas por categoria" section={section}>
      {(groups) => {
        const expenses = [...groups.expenses].filter((c) => c.total > 0).sort((a, b) => b.total - a.total);
        if (expenses.length === 0) return <EmptyText>Nenhuma despesa registrada neste mês.</EmptyText>;

        const total = expenses.reduce((sum, c) => sum + c.total, 0);
        const visible = expenses.slice(0, MAX_VISIBLE);
        const rest = expenses.slice(MAX_VISIBLE);
        const restTotal = rest.reduce((sum, c) => sum + c.total, 0);

        const rows = [
          ...visible.map((c) => ({ key: c.categoryId ?? 'none', name: c.categoryName ?? 'Sem categoria', total: c.total })),
          ...(rest.length > 0 ? [{ key: 'others', name: `Outras (${rest.length})`, total: restTotal }] : []),
        ];

        return (
          <View style={styles.wrap}>
            {rows.map((row, index) => {
              const share = total > 0 ? (row.total / total) * 100 : 0;
              const color = chartPalette[index % chartPalette.length];
              return (
                <View key={row.key} style={styles.item}>
                  <View style={styles.header}>
                    <View style={styles.nameWrap}>
                      <View style={[styles.dot, { backgroundColor: color }]} />
                      <Text style={styles.name} numberOfLines={1}>
                        {row.name}
                      </Text>
                    </View>
                    <Text style={styles.amount}>{formatCurrency(row.total)}</Text>
                  </View>
                  <View style={styles.track}>
                    <View style={[styles.fill, { width: `${share}%`, backgroundColor: color }]} />
                  </View>
                  <Text style={styles.share}>{formatPercent(share)} das despesas</Text>
                </View>
              );
            })}
          </View>
        );
      }}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  item: { gap: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  nameWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  name: { fontSize: 14, color: colors.text, flexShrink: 1 },
  amount: { fontSize: 14, fontWeight: '600', color: colors.text },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.track, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  share: { fontSize: 11, color: colors.textMuted },
});
