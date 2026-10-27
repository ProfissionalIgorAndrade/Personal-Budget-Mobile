import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/auth/AuthContext';
import { AccountsCard } from '@/features/dashboard/components/AccountsCard';
import { BreakdownCard } from '@/features/dashboard/components/BreakdownCard';
import { CategoriesCard } from '@/features/dashboard/components/CategoriesCard';
import { MonthSelector } from '@/features/dashboard/components/MonthSelector';
import { OpportunitiesCard } from '@/features/dashboard/components/OpportunitiesCard';
import { RecentCard } from '@/features/dashboard/components/RecentCard';
import { SummaryCard } from '@/features/dashboard/components/SummaryCard';
import { TrendCard } from '@/features/dashboard/components/TrendCard';
import { useDashboard } from '@/features/dashboard/useDashboard';
import { currentYearMonth, type YearMonth } from '@/lib/format';
import { colors, spacing } from '@/theme';

export default function DashboardScreen() {
  const { signOut } = useAuth();
  const insets = useSafeAreaInsets();
  // State (not a derived object) so the identity only changes when the user navigates.
  const [period, setPeriod] = useState<YearMonth>(currentYearMonth);
  const { state, refreshing, refresh } = useDashboard(period);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xl },
      ]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Pressable onPress={signOut} hitSlop={12} accessibilityRole="button" accessibilityLabel="Sair">
          <Text style={styles.logout}>Sair</Text>
        </Pressable>
      </View>

      <MonthSelector value={period} onChange={setPeriod} />

      <SummaryCard section={state.summary} />
      <BreakdownCard section={state.summary} />
      <TrendCard section={state.trends} />
      <CategoriesCard section={state.categories} />
      <OpportunitiesCard section={state.opportunities} />
      <RecentCard section={state.recent} />
      <AccountsCard section={state.accounts} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.md, gap: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  logout: { fontSize: 16, color: colors.primary, fontWeight: '600' },
});
