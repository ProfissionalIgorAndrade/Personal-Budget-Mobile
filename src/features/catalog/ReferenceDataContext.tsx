import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import {
  fetchAccounts,
  fetchCategories,
  fetchCreditCards,
  fetchHouseholds,
  fetchProfiles,
  type Account,
  type Category,
  type CreditCard,
  type Household,
  type MemberProfile,
} from '@/api/catalogApi';
import { setActiveHouseholdId } from '@/api/client';
import { userIdFromToken } from '@/auth/jwt';
import { getTokens } from '@/auth/tokenStorage';
import { onDataChanged } from '@/lib/dataEvents';

type ReferenceData = {
  household: Household | null;
  profiles: MemberProfile[];
  // Member profile linked to the signed-in user (default owner of new cards/accounts).
  myProfileId: string | null;
  categories: Category[];
  cards: CreditCard[];
  accounts: Account[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
};

const ReferenceDataContext = createContext<ReferenceData | null>(null);

const byName = <T,>(getName: (item: T) => string) => (a: T, b: T) =>
  getName(a).localeCompare(getName(b), 'pt-BR', { sensitivity: 'base' });

// Loads the lists every create form chooses from. Mirrors the web app: the
// active household is the first one of the user, and it is sent as
// X-Household-Id on every request from then on.
export function ReferenceDataProvider({ children }: { children: ReactNode }) {
  const [household, setHousehold] = useState<Household | null>(null);
  const [profiles, setProfiles] = useState<MemberProfile[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const reload = useCallback(async () => {
    const id = ++requestId.current;
    setError(null);
    try {
      const households = (await fetchHouseholds()) ?? [];
      const active = households[0] ?? null;
      if (!active) throw new Error('Nenhum lar encontrado na sua conta.');
      setActiveHouseholdId(active.id);

      const [profs, cats, cds, accs, tokens] = await Promise.all([
        fetchProfiles(active.id),
        fetchCategories(),
        fetchCreditCards(),
        fetchAccounts(),
        getTokens(),
      ]);
      if (id !== requestId.current) return;

      setUserId(tokens ? userIdFromToken(tokens.accessToken) : null);
      setHousehold(active);
      setProfiles([...(profs ?? [])].sort(byName((p) => p.displayName)));
      setCategories([...(cats ?? [])].sort(byName((c) => c.name)));
      setCards([...(cds ?? [])].sort(byName((c) => c.name)));
      setAccounts([...(accs ?? [])].filter((a) => a.isActive !== false).sort(byName((a) => a.displayName)));
    } catch (e) {
      if (id === requestId.current) setError(e instanceof Error ? e.message : 'Não foi possível carregar os cadastros.');
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
    return () => setActiveHouseholdId(null);
  }, [reload]);

  useEffect(() => onDataChanged(() => void reload()), [reload]);

  const myProfileId = useMemo(
    () => (userId ? profiles.find((p) => p.userId === userId)?.id ?? null : null),
    [profiles, userId],
  );

  const value = useMemo(
    () => ({ household, profiles, myProfileId, categories, cards, accounts, loading, error, reload }),
    [household, profiles, myProfileId, categories, cards, accounts, loading, error, reload],
  );

  return <ReferenceDataContext.Provider value={value}>{children}</ReferenceDataContext.Provider>;
}

export function useReferenceData(): ReferenceData {
  const context = useContext(ReferenceDataContext);
  if (!context) throw new Error('useReferenceData must be used inside <ReferenceDataProvider>');
  return context;
}
