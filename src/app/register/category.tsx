import { useLocalSearchParams } from 'expo-router';

import { CategoryForm } from '@/features/register/CategoryForm';

export default function NewCategoryScreen() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  return <CategoryForm initialType={type === 'Income' ? 'Income' : 'Expense'} />;
}
