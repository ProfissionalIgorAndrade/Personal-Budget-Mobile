import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '@/theme';

export function ColorPicker({ options, value, onChange }: { options: string[]; value: string; onChange: (c: string) => void }) {
  return (
    <View style={styles.row}>
      {options.map((color) => {
        const selected = color === value;
        return (
          <Pressable
            key={color}
            onPress={() => onChange(color)}
            accessibilityRole="button"
            accessibilityLabel={`Cor ${color}`}
            accessibilityState={{ selected }}
            style={[styles.swatch, { backgroundColor: color }, selected && styles.selected]}
          />
        );
      })}
    </View>
  );
}

export function EmojiPicker({ options, value, onChange }: { options: string[]; value: string; onChange: (e: string) => void }) {
  return (
    <View style={styles.row}>
      {options.map((emoji) => {
        const selected = emoji === value;
        return (
          <Pressable
            key={emoji}
            onPress={() => onChange(emoji)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[styles.emoji, selected && styles.emojiSelected]}
          >
            <Text style={styles.emojiText}>{emoji}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  swatch: { width: 36, height: 36, borderRadius: 18 },
  selected: { borderWidth: 3, borderColor: colors.text },
  emoji: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.track,
  },
  emojiSelected: { borderColor: colors.primary, borderWidth: 2, backgroundColor: '#ECFDF3' },
  emojiText: { fontSize: 22 },
});
