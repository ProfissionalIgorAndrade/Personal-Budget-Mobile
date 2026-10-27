import { useCallback, useEffect, useRef, useState } from 'react';

import {
  fetchAccountsSummary,
  fetchCategoryGroups,
  fetchOpportunities,
  fetchRecentTransactions,
  fetchSummary,
  fetchTrends,
  type AccountsSummary,
  type CategoryGroups,
  type DashboardSummary,
  type MonthlyTrend,
  type SavingsOpportunity,
  type Transaction,
} from '@/api/dashboardApi';
import { onDataChanged } from '@/lib/dataEvents';
import type { YearMonth } from '@/lib/format';

export type Section<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
};

export type DashboardState = {
  summary: Section<DashboardSummary>;
  trends: Section<MonthlyTrend[]>;
  categories: Section<CategoryGroups>;
  opportunities: Section<SavingsOpportunity[]>;
  recent: Section<Transaction[]>;
  accounts: Section<AccountsSummary>;
};

const idle = <T,>(): Section<T> => ({ data: null, error: null, loading: true });

const INITIAL: DashboardState = {
  summary: idle(),
  trends: idle(),
  categories: idle(),
  opportunities: idle(),
  recent: idle(),
  accounts: idle(),
};

function messageOf(reason: unknown): string {
  return reason instanceof Error ? reason.message : 'Não foi possível carregar esta seção.';
}

// Each section loads independently: one failing endpoint must not blank the
// whole dashboard.
export function useDashboard(period: YearMonth) {
  const [state, setState] = useState<DashboardState>(INITIAL);
  const [refreshing, setRefreshing] = useState(false);
  // Drops responses that belong to a month the user already navigated away from.
  const requestId = useRef(0);

  const load = useCallback(
    async (isRefresh: boolean) => {
      const id = ++requestId.current;
      if (isRefresh) setRefreshing(true);
      else setState(INITIAL);

      const [summary, trends, categories, opportunities, recent, accounts] = await Promise.allSettled([
        fetchSummary(period),
        fetchTrends(period),
        fetchCategoryGroups(period),
        fetchOpportunities(period),
        fetchRecentTransactions(period),
        fetchAccountsSummary(),
      ]);

      if (id !== requestId.current) return;

      const toSection = <T,>(result: PromiseSettledResult<T>): Section<T> =>
        result.status === 'fulfilled'
          ? { data: result.value, error: null, loading: false }
          : { data: null, error: messageOf(result.reason), loading: false };

      setState({
        summary: toSection(summary),
        trends: toSection(trends),
        categories: toSection(categories),
        opportunities: toSection(opportunities),
        recent: toSection(recent),
        accounts: toSection(accounts),
      });
      setRefreshing(false);
    },
    [period],
  );

  useEffect(() => {
    load(false);
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);

  // A new transaction (or account, card...) changes the numbers: reload
  // quietly so the dashboard is current when the form closes.
  useEffect(() => onDataChanged(() => void load(true)), [load]);

  return { state, refreshing, refresh };
}
