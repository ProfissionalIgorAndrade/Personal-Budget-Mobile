import type { ComponentRef, Ref } from 'react';
import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { nextCents } from '@/lib/amountKeypad';
import { formatCurrency } from '@/lib/format';
import { colors } from '@/theme';

type Props = Omit<TextInputProps, 'value' | 'onChangeText'> & {
  ref?: Ref<ComponentRef<typeof TextInput>>;
  cents: number;
  onChangeCents: (cents: number) => void;
  size?: 'large' | 'normal';
  color?: string;
};

// Currency field in cents (no floating point drift), with keypad behavior:
// see nextCents.
export function AmountInput({ ref, cents, onChangeCents, size = 'normal', color, style, ...rest }: Props) {
  const text = formatCurrency(cents / 100);
  return (
    <TextInput
      ref={ref}
      value={text}
      onChangeText={(newText) => onChangeCents(nextCents(text, newText, cents))}
      keyboardType="number-pad"
      inputMode="numeric"
      selectTextOnFocus={false}
      // Keeps the caret visually at the end; correctness does not depend on it.
      selection={{ start: text.length, end: text.length }}
      style={[size === 'large' ? styles.large : styles.normal, { color: color ?? colors.text }, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  large: { fontSize: 40, fontWeight: '800', textAlign: 'center', paddingVertical: 8 },
  normal: {
    fontSize: 17,
    fontWeight: '600',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
