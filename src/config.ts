// Runtime configuration, read from EXPO_PUBLIC_* variables (see .env.example).

export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'https://personalbudget.fly.dev').replace(/\/$/, '');

// When true, login succeeds locally with any credentials (no network).
// Useful to validate the UI flow without touching the production API.
export const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';
