import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'personalbudget.auth.accessToken';
const REFRESH_TOKEN_KEY = 'personalbudget.auth.refreshToken';

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

// Backed by the iOS Keychain / Android Keystore.
export async function getTokens(): Promise<Tokens | null> {
  const [accessToken, refreshToken] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
  ]);
  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
}

export async function saveTokens({ accessToken, refreshToken }: Tokens): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
  ]);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
}
