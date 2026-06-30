# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project
Frontend for NutriCoach — B2B SaaS for nutritionists and fitness coaches in India.
Connects to the Spring Boot backend at `nutricoach-api`.

## Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npx tsc --noEmit     # Typecheck (no npm script for this)
npm run gen:api      # Regenerate types/api.ts from the running backend's OpenAPI spec
npm run test:e2e     # Playwright E2E (headless); :ui and :headed variants exist
```

## E2E Tests
Playwright tests under `e2e/` drive real coach workflows against the **real local backend**
using the dev-mode OTP bypass (`111111`). They are NOT mocked.

- Prereqs: backend up (`local` profile + `pg-test`) and `.env.local` with
  `NEXT_PUBLIC_API_URL=http://localhost:8080` and `NEXT_PUBLIC_DEV_MODE=true`.
- `e2e/auth.setup.ts` logs in once and saves `nc_token`/`nc_coach` to `e2e/.auth/coach.json`
  (git-ignored); every other spec reuses it via `storageState` and skips the OTP UI.
- Page Objects live in `e2e/pages/`; test-data helpers in `e2e/helpers/api.ts`.
- See `e2e/README.md` for the full guide.

## Tech Stack
- Next.js 16 (App Router, Turbopack)
- TypeScript + Tailwind CSS v4
- Axios for API calls
- react-hot-toast for notifications
- lucide-react for icons

## Architecture

### Route groups
- `(auth)` — unauthenticated coach pages (login, otp). Centered card layout.
- `(dashboard)` — authenticated coach pages with sidebar: dashboard, clients, meal-plans, library, workout-builder, messages, progress, billing, profile. Redirects to `/login` if no token.
- `(client)` — client-facing portal under `/portal`: its own login/otp, home, meal-plans, check-ins, chat, progress, profile. Separate auth from the coach side.

### Key files
- `lib/api.ts` — coach Axios instance; attaches JWT from `localStorage` (`nc_token`), redirects to `/login` on 401
- `lib/auth.ts` — coach `saveAuth`, `getCoach`, `clearAuth`, `isAuthenticated` helpers
- `lib/client-api.ts` / `lib/client-auth.ts` — same pattern for the client portal (`nc_client_token`)
- `lib/clients-api.ts`, `lib/messaging-api.ts`, `lib/workout-builder-api.ts` — typed per-domain API modules
- `lib/library-types.ts`, `lib/library-categories.ts` — library domain types/constants
- `lib/utils.ts` — `cn`, `formatCurrency` (paise → ₹), `formatDate`

### Components
- `components/ui/` — Button, Input, Card/CardHeader/CardContent, Badge, Spinner
- `components/layout/Sidebar.tsx` — fixed left sidebar with nav + logout

### Auth flow
1. `/login` → POST `/api/v1/auth/otp/send`
2. `/otp?phone=XXX` → POST `/api/v1/auth/otp/verify` → saves `nc_token` + `nc_coach` to localStorage
3. All authenticated routes check `isAuthenticated()` in layout, redirect to `/login` if false

## Backend API
Base URL: `NEXT_PUBLIC_API_URL` (default `http://localhost:8080`)
All protected endpoints require `Authorization: Bearer <jwt>` header (set automatically by `lib/api.ts`).

## Design Tokens
Tokens live as CSS variables on `:root` in `app/globals.css` — see `DESIGN.md` for the full table.
- Primary: `var(--brand-primary)` / `indigo-600` (#4F46E5)
- Secondary: `var(--brand-secondary)` / `teal-500` (#14B8A6)
- Sidebar: `var(--sidebar)` / `slate-900` (#0F172A)
- Card surface: `var(--surface)` / white, `1px solid var(--border)`, `var(--shadow-sm)`
- Body background: `var(--bg)` / `slate-50` (#F8FAFC)
- Type: Inter via `next/font/google` (`--font-sans` / `--font-display` / `--font-display-xl`)
- Focus ring: `var(--ring-focus)` (indigo, 30% alpha)

## Environment
```
NEXT_PUBLIC_API_URL=http://localhost:8080   # dev
NEXT_PUBLIC_API_URL=https://your-app.up.railway.app  # prod
```
