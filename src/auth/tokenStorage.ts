import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'personalbudget.auth.token';

// Backed by the iOS Keychain / Android Keystore.
export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
