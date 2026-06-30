# E2E tests (Playwright)

End-to-end browser tests that drive real coach workflows against the **real local
backend**, using the dev-mode OTP bypass (`111111`).

## Prerequisites

1. **Backend running** with the `local` profile and the `pg-test` DB up:
   ```bash
   docker start pg-test
   cd ../nutricoach && mvn spring-boot:run -Dspring-boot.run.profiles=local
   ```
2. **`.env.local`** in this repo has:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8080
   NEXT_PUBLIC_DEV_MODE=true
   ```
   (`NEXT_PUBLIC_DEV_MODE=true` enables the `111111` OTP. Playwright also forces it on
   the dev server it starts.)

The Playwright config auto-starts `npm run dev` (and reuses a running one).

## Run

```bash
npm run test:e2e          # headless, all specs
npm run test:e2e:ui       # interactive UI mode (step through visually)
npm run test:e2e:headed   # headed browser
npx playwright test e2e/clients.spec.ts   # a single spec
npx playwright show-report                # open the last HTML report
```

## How it's structured

- `auth.setup.ts` — authenticates **once** via the dev-only `demo-login` API
  (no OTP, so the per-phone OTP rate limit can't block it) and saves `nc_token` +
  `nc_coach` to `.auth/coach.json` (git-ignored). Every other spec starts
  authenticated via `storageState`.
- `auth.spec.ts` — the one spec that exercises the real login UI (happy path +
  invalid OTP); it runs unauthenticated with a fresh phone per run.
- `pages/` — Page Objects (selectors + actions live here, specs read like stories).
- `helpers/api.ts` — fast API setup: `uniquePhone()`/`uniqueName()`, `seedClient`,
  `seedExercise`/`seedWorkout`/`seedProgram`, `ensureClientName` and
  `ensureClientSlot` (work around the trial 5-client cap on a shared DB).

## Coverage

- `clients.spec.ts` — create a client → appears in the list.
- `meal-plans.spec.ts` — create a meal plan for a client.
- `library-exercises.spec.ts` — exercise create / read / update / delete.
- `library-workouts.spec.ts` — workout create / read / update / delete + assign to a client.
- `library-programs.spec.ts` — program create / read / update / delete + assign to a client.

## Adding a workflow test

1. Add a Page Object in `pages/` for the screen.
2. Write `<workflow>.spec.ts`; it's authenticated by default.
3. Use unique data (`uniquePhone()`, `Date.now()` in names) so re-runs don't collide.
4. Prefer role/label/placeholder selectors; add `data-testid` to source only when the
   DOM is genuinely ambiguous.
