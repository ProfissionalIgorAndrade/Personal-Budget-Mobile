import { apiRequest } from '@/api/client';
import type { CreateTransactionBody } from '@/features/transactions/transactionPayload';

type CreateTransactionResponse = { transactionId?: string; transferId?: string };

// POST /api/transactions (expense, income, installments, fixed and transfers).
export const createTransaction = (body: CreateTransactionBody) =>
  apiRequest<CreateTransactionResponse>('/api/transactions', { method: 'POST', auth: true, body });
