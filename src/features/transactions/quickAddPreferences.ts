import AsyncStorage from '@react-native-async-storage/async-storage';

import type { PaymentSource, TxKind } from '@/features/transactions/transactionPayload';

// What the quick-add form remembers between entries, like the web form's
// "sticky" fields: the last payment source per kind, the member, how far
// ahead each card's statement usually is, and how often each category is used
// (to show the most used first). Stored per device, never sent to the server.

export type QuickAddPreferences = {
  lastKind: TxKind;
  sourceByKind: Partial<Record<'expense' | 'income', PaymentSource>>;
  memberId: string | null;
  statementOffsetByCard: Record<string, number>;
  categoryUsage: Record<string, number>;
  fromAccountId: string | null;
  toAccountId: string | null;
};

const KEY = 'personalbudget.quickAdd.preferences.v1';

export const DEFAULT_PREFERENCES: QuickAddPreferences = {
  lastKind: 'expense',
  sourceByKind: {},
  memberId: null,
  statementOffsetByCard: {},
  categoryUsage: {},
  fromAccountId: null,
  toAccountId: null,
};

export async function loadPreferences(): Promise<QuickAddPreferences> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...(JSON.parse(raw) as Partial<QuickAddPreferences>) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export async function savePreferences(preferences: QuickAddPreferences): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(preferences));
  } catch {
    // Preferences are a convenience; failing to store them must not block saving.
  }
}
