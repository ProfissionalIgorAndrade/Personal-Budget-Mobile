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

## Structure

```
src/
  app/            Expo Router screens (_layout, login, index = dashboard)
  api/            HTTP client and auth endpoint
  auth/           AuthContext + secure token storage
  config.ts       Environment configuration
  theme.ts        Colors and spacing
```

Routes are guarded with `Stack.Protected`: signed-out users only see `login`,
signed-in users only see the dashboard.
