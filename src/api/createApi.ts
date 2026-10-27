import { apiRequest } from '@/api/client';
import type { CategoryType } from '@/api/catalogApi';
import type { CreateTransactionBody } from '@/features/transactions/transactionPayload';

// POST endpoints of the backend. Each returns the id the server created.

type IdResponse = { id?: string; transactionId?: string; transferId?: string };

export const createTransaction = (body: CreateTransactionBody) =>
  apiRequest<IdResponse>('/api/transactions', { method: 'POST', auth: true, body });

export type CreateCategoryBody = { name: string; type: CategoryType; color?: string; icon?: string };

export const createCategory = (body: CreateCategoryBody) =>
  apiRequest<IdResponse>('/api/categories', { method: 'POST', auth: true, body });

export type CreateCreditCardBody = {
  name: string;
  limit: number;
  dueDay: number;
  color?: string;
  memberId?: string;
};

export const createCreditCard = (body: CreateCreditCardBody) =>
  apiRequest<IdResponse>('/api/credit-cards', { method: 'POST', auth: true, body });

export type CreateAccountBody = { bank: string; memberId: string; name?: string };

export const createAccount = (body: CreateAccountBody) =>
  apiRequest<IdResponse>('/api/accounts', { method: 'POST', auth: true, body });

export type CreateSavingsBoxBody = { parentAccountId: string; name: string };

export const createSavingsBox = (body: CreateSavingsBoxBody) =>
  apiRequest<IdResponse>('/api/accounts/savings-boxes', { method: 'POST', auth: true, body });

export type CreateProfileBody = { displayName: string; emoji?: string; color?: string };

export const createMemberProfile = (householdId: string, body: CreateProfileBody) =>
  apiRequest<IdResponse>(`/api/households/${householdId}/profiles`, { method: 'POST', auth: true, body });

export type UpsertBudgetBody = { categoryId: string; month: number; year: number; limitAmount: number };

export const upsertBudget = (body: UpsertBudgetBody) =>
  apiRequest<IdResponse>('/api/budgets', { method: 'POST', auth: true, body });
