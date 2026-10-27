import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import type { Section } from '@/features/dashboard/useDashboard';
import { colors, radius, spacing } from '@/theme';

type Props<T> = {
  title: string;
  section: Section<T>;
  // Rendered only when the section has data.
  children: (data: T) => ReactNode;
};

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <View style={styles.card}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {children}
    </View>
  );
}

// Card with built-in loading and error states for one dashboard section.
export function SectionCard<T>({ title, section, children }: Props<T>) {
  return (
    <Card title={title}>
      {section.loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : section.error || section.data === null ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{section.error ?? 'Sem dados disponíveis.'}</Text>
          <Text style={styles.errorHint}>Puxe a tela para baixo para tentar de novo.</Text>
        </View>
      ) : (
        children(section.data)
      )}
    </Card>
  );
}

export function EmptyText({ children }: { children: ReactNode }) {
  return <Text style={styles.empty}>{children}</Text>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.track,
  },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  centered: { paddingVertical: spacing.lg, alignItems: 'center' },
  errorBox: { backgroundColor: colors.dangerBg, borderRadius: radius.md, padding: spacing.md, gap: spacing.xs },
  errorText: { color: colors.danger, fontSize: 14 },
  errorHint: { color: colors.textMuted, fontSize: 12 },
  empty: { color: colors.textMuted, fontSize: 14, paddingVertical: spacing.sm },
});
