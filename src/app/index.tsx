import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/auth/AuthContext';
import { colors, spacing } from '@/theme';

// Placeholder dashboard: intentionally empty until the next step
// (monthly summary, credit card invoices, latest transactions).
export default function DashboardScreen() {
  const { signOut } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Pressable onPress={signOut} hitSlop={12} accessibilityRole="button" accessibilityLabel="Log out">
          <Text style={styles.logout}>Log out</Text>
        </Pressable>
      </View>

      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>You are signed in</Text>
        <Text style={styles.emptyText}>The dashboard content will show up here in the next step.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: colors.text },
  logout: { fontSize: 16, color: colors.primary, fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  emptyText: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
});
