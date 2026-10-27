import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatMonthYear, isSameMonth, currentYearMonth, shiftMonth, type YearMonth } from '@/lib/format';
import { colors, radius, spacing } from '@/theme';

type Props = {
  value: YearMonth;
  onChange: (next: YearMonth) => void;
};

export function MonthSelector({ value, onChange }: Props) {
  const isCurrent = isSameMonth(value, currentYearMonth());

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => onChange(shiftMonth(value, -1))}
        style={styles.arrow}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Mês anterior"
      >
        <Text style={styles.arrowText}>‹</Text>
      </Pressable>

      <Pressable
        onPress={() => onChange(currentYearMonth())}
        disabled={isCurrent}
        accessibilityRole="button"
        accessibilityLabel="Voltar ao mês atual"
        style={styles.label}
      >
        <Text style={styles.labelText}>{formatMonthYear(value)}</Text>
        {!isCurrent ? <Text style={styles.hint}>Toque para voltar ao mês atual</Text> : null}
      </Pressable>

      <Pressable
        onPress={() => onChange(shiftMonth(value, 1))}
        style={styles.arrow}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Próximo mês"
      >
        <Text style={styles.arrowText}>›</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.track,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  arrow: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  arrowText: { fontSize: 28, color: colors.primary, fontWeight: '600', lineHeight: 32 },
  label: { alignItems: 'center', flex: 1 },
  labelText: { fontSize: 17, fontWeight: '700', color: colors.text },
  hint: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
});
