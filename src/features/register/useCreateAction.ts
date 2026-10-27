import { useState } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

import { emitDataChanged, type CreatedRecord } from '@/lib/dataEvents';

type Result = { id?: string } | undefined | null;

// Shared submit flow for the simple create forms: validate, call the API,
// confirm with a haptic, notify the rest of the app and close the screen.
export function useCreateAction(entity: CreatedRecord['entity']) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(validate: () => string | null, request: () => Promise<Result>) {
    const validationError = validate();
    setError(validationError);
    if (validationError) return;

    setSubmitting(true);
    try {
      const result = await request();
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      emitDataChanged({ entity, id: result?.id ?? null });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível salvar.');
      setSubmitting(false);
    }
  }

  return { submitting, error, setError, run };
}
