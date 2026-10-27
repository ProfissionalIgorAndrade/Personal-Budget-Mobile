import { apiRequest, ApiError } from '@/api/client';
import { USE_MOCK } from '@/config';
import type { Tokens } from '@/auth/tokenStorage';

export type LoginCredentials = {
  email: string;
  password: string;
};

type LoginData = {
  userId?: string;
  token?: string;
  refreshToken?: string;
};

// Backend contract (PersonalBudget.Api/Controllers/AuthenticationController.cs):
//   POST /api/authentication/login   { email, password }
//   200 -> { success, message, data: { userId, token, refreshToken } }
//   400 -> { success: false, message }   (unknown user or wrong password)
//   429 -> { success: false, message }   (auth rate limit: 5 attempts / minute)
export async function login({ email, password }: LoginCredentials): Promise<Tokens> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' };
  }

  let data: LoginData | undefined;
  try {
    data = await apiRequest<LoginData>('/api/authentication/login', {
      method: 'POST',
      body: { email, password },
    });
  } catch (error) {
    // The backend tells "user not found" apart from "wrong password"; show one
    // generic message so the app does not reveal which emails exist.
    if (error instanceof ApiError && error.status === 400) {
      throw new ApiError('E-mail ou senha incorretos.', 400);
    }
    throw error;
  }

  if (!data?.token || !data.refreshToken) {
    throw new ApiError('Resposta inesperada do servidor ao entrar.');
  }
  return { accessToken: data.token, refreshToken: data.refreshToken };
}

// Best effort: revokes the refresh token on the server. Local sign out must
// still succeed when the network is unavailable.
export async function logout(refreshToken: string): Promise<void> {
  if (USE_MOCK) return;
  try {
    await apiRequest('/api/authentication/logout', { method: 'POST', body: { refreshToken } });
  } catch {
    // Ignored on purpose.
  }
}
