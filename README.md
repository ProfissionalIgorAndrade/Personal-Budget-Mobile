# PersonalBudget Mobile

React Native (Expo SDK 58, TypeScript, Expo Router) mobile client for PersonalBudget.

Current scope: **login** and an **empty dashboard** with log out.

## Run on your iPhone (Expo Go)

1. Install **Expo Go** from the App Store.
2. Make sure the iPhone and the computer are on the same Wi-Fi network.
3. In this folder:

   ```bash
   npm install
   cp .env.example .env      # then edit EXPO_PUBLIC_API_URL
   npx expo start -c
   ```

4. Scan the QR code with the iPhone camera and open it in Expo Go.

If the iPhone cannot reach the dev server, try `npx expo start --tunnel`.

## Configuration

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | Base URL of the production API |
| `EXPO_PUBLIC_LOGIN_PATH` | Login endpoint path (default `/auth/login`) |
| `EXPO_PUBLIC_USE_MOCK` | `true` = accept any credentials locally, no network |

## Login contract (assumed, adjust if needed)

`src/api/authApi.ts` is the only file that knows the request/response shape:

```
POST {EXPO_PUBLIC_LOGIN_PATH}   { "email": string, "password": string }
200 -> { "token": string }      (accessToken / access_token also accepted)
```

The token is stored in the iOS Keychain (`expo-secure-store`) and sent as
`Authorization: Bearer <token>` by `src/api/client.ts`.

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
