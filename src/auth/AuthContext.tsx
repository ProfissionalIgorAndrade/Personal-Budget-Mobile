import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { login as loginRequest, type LoginCredentials } from '@/api/authApi';
import { clearToken, getToken, saveToken } from '@/auth/tokenStorage';

type AuthState = {
  token: string | null;
  isLoading: boolean;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore the session from secure storage on app start.
  useEffect(() => {
    let active = true;
    getToken()
      .then((stored) => {
        if (active) setToken(stored);
      })
      .catch(() => {
        // Unreadable storage: treat as signed out.
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (credentials: LoginCredentials) => {
    const newToken = await loginRequest(credentials);
    await saveToken(newToken);
    setToken(newToken);
  }, []);

  const signOut = useCallback(async () => {
    await clearToken();
    setToken(null);
  }, []);

  const value = useMemo(() => ({ token, isLoading, signIn, signOut }), [token, isLoading, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
