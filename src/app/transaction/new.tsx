import { useLocalSearchParams } from 'expo-router';

import { QuickAddForm } from '@/features/transactions/QuickAddForm';
import type { TxKind } from '@/features/transactions/transactionPayload';

const KINDS: TxKind[] = ['expense', 'income', 'transfer'];

export default function NewTransactionScreen() {
  const { kind } = useLocalSearchParams<{ kind?: string }>();
  const initialKind = KINDS.find((k) => k === kind);
  return <QuickAddForm initialKind={initialKind} />;
}
