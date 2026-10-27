import { StyleSheet, Text, View } from 'react-native';

import type { SavingsOpportunity } from '@/api/dashboardApi';
import { EmptyText, SectionCard } from '@/features/dashboard/components/SectionCard';
import type { Section } from '@/features/dashboard/useDashboard';
import { formatCurrency, formatPercent } from '@/lib/format';
import { colors, radius, spacing } from '@/theme';

export function OpportunitiesCard({ section }: { section: Section<SavingsOpportunity[]> }) {
  return (
    <SectionCard title="Onde dá para economizar" section={section}>
      {(items) =>
        items.length === 0 ? (
          <EmptyText>Nenhuma categoria acima da média dos últimos 3 meses. 🎉</EmptyText>
        ) : (
          <View style={styles.wrap}>
            <Text style={styles.subtitle}>Categorias com gasto pelo menos 20% acima da média dos 3 meses anteriores.</Text>
            {items.slice(0, 5).map((item) => (
              <View key={item.categoryId} style={styles.item}>
                <View style={styles.header}>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.categoryName || 'Sem categoria'}
                  </Text>
                  <Text style={styles.excess}>+{formatPercent(item.excessPercent, 0)}</Text>
                </View>
                <Text style={styles.detail}>
                  {formatCurrency(item.currentMonthAmount)} neste mês · média {formatCurrency(item.rollingAverage)} ·
                  excesso de {formatCurrency(item.excessAmount)}
                </Text>
              </View>
            ))}
          </View>
        )
      }
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  subtitle: { fontSize: 12, color: colors.textMuted },
  item: { backgroundColor: colors.warningBg, borderRadius: radius.md, padding: spacing.md, gap: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  name: { fontSize: 15, fontWeight: '600', color: colors.text, flex: 1 },
  excess: { fontSize: 15, fontWeight: '700', color: colors.warning },
  detail: { fontSize: 12, color: colors.textMuted },
});
