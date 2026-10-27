import { apiRequest } from '@/api/client';
import type { YearMonth } from '@/lib/format';

// Types mirror the backend DTOs (PersonalBudget.Application/DTOs). The active
// household is resolved by the backend (first household of the user) because
// the X-Household-Id header is not sent yet.

export type DashboardSummary = {
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  fixedExpenses: number;
  variableExpenses: number;
  installmentsThisMonth: number;
  creditCardInvoice: number;
  committedIncomePercent: number;
  savingsPercent: number;
  transactionCount: number;
};

export type MonthlyTrend = {
  month: number;
  year: number;
  label: string;
  totalIncome: number;
  totalExpense: number;
  fixedExpenses: number;
  variableExpenses: number;
  balance: number;
};

export type SavingsOpportunity = {
  categoryId: string;
  categoryName: string;
  currentMonthAmount: number;
  rollingAverage: number;
  excessAmount: number;
  excessPercent: number;
};

export type CategoryTotal = {
  categoryId: string | null;
  categoryName: string | null;
  total: number;
  transactionCount: number;
};

export type CategoryGroups = {
  expenses: CategoryTotal[];
  incomes: CategoryTotal[];
};

export type AccountsSummary = {
  totalBalance: number;
  accounts: { id: string; name: string; bank: string; balance: number }[];
};

export type Transaction = {
  id: string;
  type: 'Income' | 'Expense' | string;
  paymentMethod: string;
  frequency: 'Fixed' | 'Variable' | 'Installments' | string;
  amount: number;
  date: string;
  description: string;
  categoryName: string | null;
  creditCardName: string | null;
  correspondentDisplayName: string;
};

type PaginatedTransactions = {
  items: Transaction[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  periodTotalIncome: number;
  periodTotalExpense: number;
};

export const fetchSummary = ({ month, year }: YearMonth) =>
  apiRequest<DashboardSummary>(`/api/dashboard/summary?month=${month}&year=${year}`, { auth: true });

export const fetchTrends = ({ month, year }: YearMonth, months = 6) =>
  apiRequest<MonthlyTrend[]>(`/api/dashboard/trends?months=${months}&endMonth=${month}&endYear=${year}`, { auth: true });

export const fetchOpportunities = ({ month, year }: YearMonth, lookbackMonths = 3) =>
  apiRequest<SavingsOpportunity[]>(
    `/api/dashboard/opportunities?month=${month}&year=${year}&lookbackMonths=${lookbackMonths}`,
    { auth: true },
  );

export const fetchCategoryGroups = ({ month, year }: YearMonth) =>
  apiRequest<CategoryGroups>(`/api/transactions/month/${month}/year/${year}/grouped-by-category`, { auth: true });

export const fetchAccountsSummary = () => apiRequest<AccountsSummary>('/api/accounts/summary', { auth: true });

// First page (15 items) of the month; sorted by date descending on the client
// so "recent" does not depend on the server ordering.
export async function fetchRecentTransactions({ month, year }: YearMonth, limit = 6): Promise<Transaction[]> {
  const page = await apiRequest<PaginatedTransactions>(`/api/transactions/month/${month}/year/${year}?page=1`, {
    auth: true,
  });
  return [...(page?.items ?? [])].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
}
