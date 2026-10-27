import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { login as loginRequest, logout as logoutRequest, type LoginCredentials } from '@/api/authApi';
import { onSessionExpired } from '@/auth/sessionEvents';
import { clearTokens, getTokens, saveTokens } from '@/auth/tokenStorage';

type AuthState = {
  isSignedIn: boolean;
  isLoading: boolean;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Restore the session from secure storage on app start.
  useEffect(() => {
    let active = true;
    getTokens()
      .then((tokens) => {
        if (active) setIsSignedIn(tokens !== null);
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

  // The API client signals when the refresh token was rejected.
  useEffect(() => onSessionExpired(() => setIsSignedIn(false)), []);

  const signIn = useCallback(async (credentials: LoginCredentials) => {
    const tokens = await loginRequest(credentials);
    await saveTokens(tokens);
    setIsSignedIn(true);
  }, []);

  const signOut = useCallback(async () => {
    const tokens = await getTokens();
    if (tokens) await logoutRequest(tokens.refreshToken);
    await clearTokens();
    setIsSignedIn(false);
  }, []);

  const value = useMemo(() => ({ isSignedIn, isLoading, signIn, signOut }), [isSignedIn, isLoading, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
