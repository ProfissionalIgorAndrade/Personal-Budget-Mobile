import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'personalbudget.auth.accessToken';
const REFRESH_TOKEN_KEY = 'personalbudget.auth.refreshToken';

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

// On iOS/Android the tokens live in the Keychain / Keystore (expo-secure-store).
// SecureStore does not exist in the browser, so the web preview falls back to
// localStorage. That is only meant for local development in the browser.
const isWeb = Platform.OS === 'web';

async function readItem(key: string): Promise<string | null> {
  if (isWeb) return globalThis.localStorage?.getItem(key) ?? null;
  return SecureStore.getItemAsync(key);
}

async function writeItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    globalThis.localStorage?.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function removeItem(key: string): Promise<void> {
  if (isWeb) {
    globalThis.localStorage?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export async function getTokens(): Promise<Tokens | null> {
  const [accessToken, refreshToken] = await Promise.all([readItem(ACCESS_TOKEN_KEY), readItem(REFRESH_TOKEN_KEY)]);
  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
}

export async function saveTokens({ accessToken, refreshToken }: Tokens): Promise<void> {
  await Promise.all([writeItem(ACCESS_TOKEN_KEY, accessToken), writeItem(REFRESH_TOKEN_KEY, refreshToken)]);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([removeItem(ACCESS_TOKEN_KEY), removeItem(REFRESH_TOKEN_KEY)]);
}
