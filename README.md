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

## Install permanently (sideloading, no paid Apple account)

Apple free-account signatures expire after 7 days. [SideStore](https://sidestore.io)
re-signs the app on the device automatically, so no computer is needed after setup.

1. Push this repository to GitHub (private is fine).
2. Actions -> **Build unsigned iOS IPA** -> *Run workflow*. When it finishes,
   download the `PersonalBudget-ipa` artifact and unzip it to get `PersonalBudget.ipa`.
3. Install SideStore on the iPhone (follow the SideStore docs; it needs a computer once).
4. Open the `.ipa` with SideStore (Files -> share -> SideStore). It signs it with your Apple ID.

To update the app, run the workflow again and install the new `.ipa` over the old one.
The free account allows 3 active apps per device and 10 App IDs per week.

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

The active household is the first household of the user, as on the web.

## Creating transactions

The app only creates transactions; categories, cards, accounts and the rest
are managed on the web. The **+** button on the dashboard opens the entry form.

| Flow | Endpoint | Rules (same as backend and web) |
| --- | --- | --- |
| Expense / income | `POST /api/transactions` | Category required. Account: one-off or Fixed (12 monthly rows, `repeatCount: 12`). Card: one-off (`Variable`) or installments (expense only, 2-60x, `totalAmount` split by the backend); statement month/year required. Income on a card is a refund. |
| Transfer | `POST /api/transactions` | `paymentMethod: Transfer`, two different accounts, a savings box is never the origin. |

The payload rules live in `src/features/transactions/transactionPayload.ts`,
a port of the web's `createTransactionPayload.js`.

The form lists every registered category (Despesas and Receitas groups; picking
one from the other group switches the kind) and every card and account (Cartões
and Contas groups; cards with the same name show the owner). A search field
appears above 12 categories.

Quick entry is built for speed: amount (keypad style, always appends on the
right) -> category -> save. The form remembers, on the device only, the last
account/card per kind, the member, how many months ahead each card's statement
usually is, and the most used categories (shown first in each group). An empty
description falls back to the category name. "Salvar e lançar outra" keeps the
form open.

All authenticated requests carry `X-Household-Id` (first household of the
user, as on the web).

## Structure

```
src/
  app/            Expo Router screens (_layout, login, index = dashboard)
  api/            HTTP client, auth, dashboard, catalog and transaction endpoints
  components/ui/  Form building blocks (chips, amount keypad, dates, buttons)
  features/       dashboard, catalog (reference data), transactions
  lib/            Formatting, dates, keypad and data change events
  auth/           AuthContext + secure token storage
  config.ts       Environment configuration
  theme.ts        Colors and spacing
```

Routes are guarded with `Stack.Protected`: signed-out users only see `login`,
signed-in users see the dashboard and the transaction form (presented as a modal).
