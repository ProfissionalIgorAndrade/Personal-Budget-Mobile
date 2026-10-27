import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  icon?: string | null;
  // Accent dot (category/card color).
  color?: string | null;
  disabled?: boolean;
  accessibilityLabel?: string;
};

export function Chip({ label, selected = false, onPress, icon, color, disabled, accessibilityLabel }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.selected,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {icon ? <Text style={styles.icon}>{icon}</Text> : color ? <View style={[styles.dot, { backgroundColor: color }]} /> : null}
      <Text style={[styles.label, selected && styles.labelSelected]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

// Wrapping row of chips.
export function ChipGroup({ children }: { children: React.ReactNode }) {
  return <View style={styles.group}>{children}</View>;
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    minHeight: 40,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    maxWidth: '100%',
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.4 },
  icon: { fontSize: 16 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  label: { fontSize: 14, color: colors.text, fontWeight: '500', flexShrink: 1 },
  labelSelected: { color: colors.primaryText, fontWeight: '700' },
  group: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
