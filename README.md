# NutriCoach Web

Frontend for NutriCoach — B2B SaaS for nutritionists and fitness coaches in India.
Built with Next.js 16 (App Router), TypeScript, and Tailwind CSS v4.

## Prerequisites

- Node.js 18+
- [nutricoach-api](../nutricoach-api) Spring Boot backend running on port 8080

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

3. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing in Dev Mode (without SMS OTP)

Dev mode lets you bypass real SMS delivery and log in with a fixed OTP (`111111`).

### Enable Dev Mode

Add this to your `.env.local`:

```env
NEXT_PUBLIC_DEV_MODE=true
```

Restart the dev server after changing env vars.

### How It Works

1. Go to [http://localhost:3000/login](http://localhost:3000/login) and enter any registered phone number.
2. On the OTP page, a yellow **DEV MODE** banner appears at the top.
3. Either:
   - Type `111111` manually in the OTP boxes, or
   - Click **auto-fill** in the banner to fill it automatically.
4. Click **Verify OTP** — you will be redirected to the dashboard.

> **Note:** The OTP `111111` must also be accepted by the backend. Make sure your Spring Boot backend is configured to allow this dev OTP (e.g., via an `APP_DEV_MODE=true` environment variable on the backend side).

### Disable Dev Mode

Remove `NEXT_PUBLIC_DEV_MODE=true` from `.env.local` (or set it to `false`) and restart the server. The banner disappears and real SMS OTPs are required.

## Available Commands

```bash
npm run dev        # Start dev server with Turbopack (http://localhost:3000)
npm run build      # Production build
npm run typecheck  # Run TypeScript type checking
```

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend base URL | `http://localhost:8080` |
| `NEXT_PUBLIC_DEV_MODE` | Skip real SMS, use OTP `111111` | `false` |

## Project Structure

```
app/
  (auth)/         # Unauthenticated pages (login, otp)
  (dashboard)/    # Authenticated pages with sidebar
components/
  ui/             # Button, Input, Card, Badge, Spinner
  layout/         # Sidebar
lib/
  api.ts          # Axios instance with JWT injection + 401 redirect
  auth.ts         # saveAuth, getCoach, clearAuth, isAuthenticated
  utils.ts        # cn, formatCurrency (paise → ₹), formatDate
```
