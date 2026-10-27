import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
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

const FAB_SIZE = 60;

export default function DashboardScreen() {
  const { signOut } = useAuth();
  const insets = useSafeAreaInsets();
  // State (not a derived object) so the identity only changes when the user navigates.
  const [period, setPeriod] = useState<YearMonth>(currentYearMonth);
  const { state, refreshing, refresh } = useDashboard(period);

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.content,
          // Room for the floating button over the last card.
          { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + FAB_SIZE + spacing.xl },
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <View style={styles.headerActions}>
            <Pressable onPress={() => router.push('/register')} hitSlop={12} accessibilityRole="button">
              <Text style={styles.headerLink}>Cadastros</Text>
            </Pressable>
            <Pressable onPress={signOut} hitSlop={12} accessibilityRole="button" accessibilityLabel="Sair">
              <Text style={styles.headerLink}>Sair</Text>
            </Pressable>
          </View>
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

      <Pressable
        onPress={() => router.push('/transaction/new')}
        onLongPress={() => router.push('/register')}
        accessibilityRole="button"
        accessibilityLabel="Novo lançamento"
        accessibilityHint="Toque e segure para ver todos os cadastros"
        style={({ pressed }) => [styles.fab, { bottom: insets.bottom + spacing.lg }, pressed && styles.fabPressed]}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.md, gap: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerActions: { flexDirection: 'row', gap: spacing.lg },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  headerLink: { fontSize: 16, color: colors.primary, fontWeight: '600' },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabPressed: { opacity: 0.85, transform: [{ scale: 0.96 }] },
  fabText: { color: colors.primaryText, fontSize: 32, fontWeight: '500', marginTop: -2 },
});
