import { API_URL } from '@/config';
import { emitSessionExpired } from '@/auth/sessionEvents';
import { clearTokens, getTokens, saveTokens } from '@/auth/tokenStorage';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Every backend response is wrapped as { success, message, data }.
type Envelope<T> = { success: boolean; message?: string; data?: T };

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  // When true, sends the access token and transparently renews it on a 401.
  auth?: boolean;
  headers?: Record<string, string>;
  timeoutMs?: number;
};

type RawResponse = { status: number; ok: boolean; payload: unknown };

// Same rule as the web app: every authenticated request is scoped to the
// household whose members/categories/cards the user is choosing from, so a
// profile id from one household is never sent to another.
let activeHouseholdId: string | null = null;

export function setActiveHouseholdId(id: string | null): void {
  activeHouseholdId = id;
}

const REFRESH_PATH = '/api/authentication/refresh';

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const tokens = options.auth ? await getTokens() : null;
  if (options.auth && !tokens) {
    emitSessionExpired();
    throw new ApiError('Sua sessão expirou. Entre novamente.', 401);
  }

  let response = await send(path, options, tokens?.accessToken ?? null);

  if (options.auth && response.status === 401) {
    const renewedToken = await refreshAccessToken();
    if (!renewedToken) {
      await clearTokens();
      emitSessionExpired();
      throw new ApiError('Sua sessão expirou. Entre novamente.', 401);
    }
    response = await send(path, options, renewedToken);
  }

  return unwrap<T>(response);
}

// Single-flight: concurrent 401s share one refresh, because the backend
// rotates the refresh token and the old one stops working after use.
let refreshInFlight: Promise<string | null> | null = null;

function refreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = doRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

async function doRefresh(): Promise<string | null> {
  const tokens = await getTokens();
  if (!tokens) return null;

  // Network failures throw (and keep the session); only a rejection logs out.
  const response = await send(REFRESH_PATH, { method: 'POST', body: { refreshToken: tokens.refreshToken } }, null);
  if (!response.ok) return null;

  const data = extractData(response.payload) as { token?: unknown; refreshToken?: unknown } | undefined;
  if (typeof data?.token !== 'string' || typeof data?.refreshToken !== 'string') return null;

  await saveTokens({ accessToken: data.token, refreshToken: data.refreshToken });
  return data.token;
}

async function send(path: string, options: RequestOptions, accessToken: string | null): Promise<RawResponse> {
  const { method = 'GET', body, headers, timeoutMs = 15000 } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(accessToken && activeHouseholdId ? { 'X-Household-Id': activeHouseholdId } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const text = await response.text();
    return { status: response.status, ok: response.ok, payload: text ? safeParse(text) : undefined };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('A requisição demorou demais. Verifique sua conexão e tente novamente.');
    }
    throw new ApiError('Não foi possível acessar o servidor. Verifique sua conexão e tente novamente.');
  } finally {
    clearTimeout(timer);
  }
}

function unwrap<T>(response: RawResponse): T {
  if (!response.ok) {
    throw new ApiError(extractMessage(response.payload) ?? `Falha na requisição (status ${response.status})`, response.status);
  }
  return extractData(response.payload) as T;
}

function extractData(payload: unknown): unknown {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as Envelope<unknown>).data;
  }
  return payload;
}

function extractMessage(payload: unknown): string | undefined {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const message = (payload as { message: unknown }).message;
    if (typeof message === 'string' && message.length > 0) return message;
  }
  return undefined;
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}
