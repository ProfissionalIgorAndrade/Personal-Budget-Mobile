import { apiRequest } from '@/api/client';

// Reference data used by the create forms. Shapes follow what the backend
// serializes (camelCase, enums as strings).

export type CategoryType = 'Income' | 'Expense';

export type Category = {
  id: string;
  name: string;
  type: CategoryType;
  color: string | null;
  icon: string | null;
};

export type CreditCard = {
  id: string;
  name: string;
  limit: number;
  dueDay: number;
  color: string | null;
  memberId: string | null;
};

export type Account = {
  id: string;
  bank: string;
  balance: number;
  memberProfileId: string | null;
  memberName: string | null;
  displayName: string;
  isActive: boolean;
  kind: 'Checking' | 'Savings' | string;
  parentAccountId: string | null;
  name: string | null;
};

export type Household = { id: string; name: string };

export type MemberProfile = {
  id: string;
  displayName: string;
  kind: 'LinkedUser' | 'Joint' | string;
  userId: string | null;
  emoji: string | null;
  color: string | null;
};

export const fetchHouseholds = () => apiRequest<Household[]>('/api/households', { auth: true });

export const fetchProfiles = (householdId: string) =>
  apiRequest<MemberProfile[]>(`/api/households/${householdId}/profiles`, { auth: true });

export const fetchCategories = () => apiRequest<Category[]>('/api/categories', { auth: true });

export const fetchCreditCards = () => apiRequest<CreditCard[]>('/api/credit-cards', { auth: true });

export const fetchAccounts = () => apiRequest<Account[]>('/api/accounts', { auth: true });
