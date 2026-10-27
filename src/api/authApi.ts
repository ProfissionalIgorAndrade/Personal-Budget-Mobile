import { apiRequest, ApiError } from '@/api/client';
import { LOGIN_PATH, USE_MOCK } from '@/config';

export type LoginCredentials = {
  email: string;
  password: string;
};

// ASSUMED CONTRACT (adjust to the real backend):
//   POST {LOGIN_PATH}  { "email": string, "password": string }
//   200 -> { "token": string }   (accessToken / access_token are also accepted)
// This is the only place that knows the login request/response shape.
export async function login({ email, password }: LoginCredentials): Promise<string> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return 'mock-token';
  }

  const data = await apiRequest<Record<string, unknown>>(LOGIN_PATH, {
    method: 'POST',
    body: { email, password },
  });

  const token = data?.token ?? data?.accessToken ?? data?.access_token;
  if (typeof token !== 'string' || token.length === 0) {
    throw new ApiError('Unexpected login response: no token found.');
  }
  return token;
}
