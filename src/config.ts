// Runtime configuration, read from EXPO_PUBLIC_* variables (see .env.example).

export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');

// Path of the login endpoint, relative to API_URL.
export const LOGIN_PATH = process.env.EXPO_PUBLIC_LOGIN_PATH ?? '/auth/login';

// When true, login succeeds locally with any credentials (no network).
// Useful to validate the UI flow before the real API contract is wired.
export const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';
