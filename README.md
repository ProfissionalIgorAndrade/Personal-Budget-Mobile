# PersonalBudget Mobile

React Native (Expo SDK 58, TypeScript, Expo Router) mobile client for PersonalBudget.

Current scope: **login** and an **empty dashboard** with log out.

## Run on your iPhone (Expo Go)

1. Install **Expo Go** from the App Store.
2. Make sure the iPhone and the computer are on the same Wi-Fi network.
3. In this folder:

   ```bash
   npm install
   npx expo start -c
   ```

4. Scan the QR code with the iPhone camera and open it in Expo Go.

If the iPhone cannot reach the dev server, try `npx expo start --tunnel`.

## Configuration

Defaults work out of the box (production API). Copy `.env.example` to `.env` only to override.

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | Base URL of the API (default `https://personalbudget.fly.dev`) |
| `EXPO_PUBLIC_USE_MOCK` | `true` = accept any credentials locally, no network |

## Authentication

Implemented against `AuthenticationController` of the backend:

```
POST /api/authentication/login    { email, password }
200 -> { success, message, data: { userId, token, refreshToken } }
POST /api/authentication/refresh  { refreshToken }   (rotates the refresh token)
POST /api/authentication/logout   { refreshToken }
```

- The access token (JWT, 60 min) and the refresh token are stored in the iOS
  Keychain (`expo-secure-store`).
- `src/api/client.ts` sends `Authorization: Bearer <token>` for `auth: true`
  requests and, on a 401, renews the token once (single-flight, because the
  refresh token rotates) and retries. If renewal is rejected, the session is
  cleared and the app returns to the login screen.
- The login endpoint is rate limited to 5 attempts per minute per client.

## Dashboard

The dashboard uses the aggregated endpoints of the backend (one request per
section, loaded in parallel; a failing section does not blank the screen):

| Section | Endpoint |
| --- | --- |
| Month summary + breakdown | `GET /api/dashboard/summary?month&year` |
| Cash flow (6 months) | `GET /api/dashboard/trends?months&endMonth&endYear` |
| Expenses by category | `GET /api/transactions/month/{m}/year/{y}/grouped-by-category` |
| Savings opportunities | `GET /api/dashboard/opportunities?month&year&lookbackMonths` |
| Latest transactions | `GET /api/transactions/month/{m}/year/{y}?page=1` |
| Accounts | `GET /api/accounts/summary` |

Pull down to refresh; use the arrows to change the month.

The active household is resolved by the backend (first household of the user).
The `X-Household-Id` header is not sent yet, so a household switcher is a
future step.

## Structure

```
src/
  app/            Expo Router screens (_layout, login, index = dashboard)
  api/            HTTP client, auth and dashboard endpoints
  features/       Feature code (dashboard hook and cards)
  lib/            Formatting helpers (BRL currency, months)
  auth/           AuthContext + secure token storage
  config.ts       Environment configuration
  theme.ts        Colors and spacing
```

Routes are guarded with `Stack.Protected`: signed-out users only see `login`,
signed-in users only see the dashboard.
