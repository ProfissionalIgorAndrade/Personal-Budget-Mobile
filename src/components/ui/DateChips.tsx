import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { Chip, ChipGroup } from '@/components/ui/Chip';
import { addDaysIso, formatDayMonth, fromIsoDate, toIsoDate, todayIso } from '@/lib/dates';
import { colors, radius } from '@/theme';

// "Hoje" / "Ontem" cover most entries in one tap; "Outra data" opens the
// native calendar.
export function DateChips({ value, onChange }: { value: string; onChange: (iso: string) => void }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const today = todayIso();
  const yesterday = addDaysIso(today, -1);
  const isOther = value !== today && value !== yesterday;
  const canPick = Platform.OS !== 'web';

  function handlePicked(event: DateTimePickerEvent, date?: Date) {
    // Android shows a dialog: close it on any outcome. iOS stays inline until
    // a date is chosen.
    if (Platform.OS === 'android' || event.type !== 'set') setPickerOpen(false);
    if (event.type === 'set' && date) {
      onChange(toIsoDate(date));
      setPickerOpen(false);
    }
  }

  return (
    <View style={styles.wrap}>
      <ChipGroup>
        <Chip label="Hoje" selected={value === today} onPress={() => onChange(today)} />
        <Chip label="Ontem" selected={value === yesterday} onPress={() => onChange(yesterday)} />
        {canPick ? (
          <Chip
            icon="📅"
            label={isOther ? formatDayMonth(value) : 'Outra data'}
            selected={isOther}
            onPress={() => setPickerOpen((open) => !open)}
          />
        ) : null}
      </ChipGroup>

      {pickerOpen && canPick ? (
        <View style={Platform.OS === 'ios' ? styles.inline : undefined}>
          <DateTimePicker
            value={fromIsoDate(value)}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={handlePicked}
            locale="pt-BR"
            accentColor={colors.primary}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  inline: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
});
