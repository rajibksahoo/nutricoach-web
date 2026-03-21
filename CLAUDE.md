# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project
Frontend for NutriCoach — B2B SaaS for nutritionists and fitness coaches in India.
Connects to the Spring Boot backend at `nutricoach-api`.

## Commands

```bash
npm run dev        # Start dev server (http://localhost:3000)
npm run build      # Production build
npm run typecheck  # npx tsc --noEmit
```

## Tech Stack
- Next.js 16 (App Router, Turbopack)
- TypeScript + Tailwind CSS v4
- Axios for API calls
- react-hot-toast for notifications
- lucide-react for icons

## Architecture

### Route groups
- `(auth)` — unauthenticated pages (login, otp). Centered card layout.
- `(dashboard)` — authenticated pages with sidebar. Redirects to `/login` if no token.

### Key files
- `lib/api.ts` — Axios instance; attaches JWT from `localStorage`, redirects to `/login` on 401
- `lib/auth.ts` — `saveAuth`, `getCoach`, `clearAuth`, `isAuthenticated` helpers
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
- Primary: `emerald-600` (#059669)
- Sidebar: `slate-900`
- Card background: white, `border-slate-200`, `shadow-sm`
- Body background: `#f8fafc` (slate-50)

## Environment
```
NEXT_PUBLIC_API_URL=http://localhost:8080   # dev
NEXT_PUBLIC_API_URL=https://your-app.up.railway.app  # prod
```
