---
name: shipping-web-changes
description: Use when writing or modifying any nutricoach-web code — pages, components, API modules, or e2e tests — before claiming the change is complete.
---

# Shipping Production-Ready Web Changes

## Overview
This repo has no unit-test runner — the only gates are the TypeScript compiler, the Playwright e2e suite, and your own eyes on the running app. That makes the done-bar discipline stricter, not looser.

**REQUIRED BACKGROUND:** `CLAUDE.md` (architecture, tokens, e2e) and `DESIGN.md` for visuals. They win on any conflict.

## Next.js 16 rule (read before any Next-specific code)
This is a bleeding-edge Next release; APIs and conventions may differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` first and heed deprecation notices. Do not port patterns from older Next versions on memory.

## Definition of done — all five
1. **`npx tsc --noEmit` clean** — there is no `npm test`; the typechecker is gate one. Run it, don't assume.
2. **Contract types are generated, not hand-written** — if the backend API changed, start the backend and run `npm run gen:api`; import from `types/api.ts`. Hand-rolled response types drift silently.
3. **Right auth side** — coach pages use `lib/api.ts`/`lib/auth.ts` (`nc_token`); client portal pages under `(client)` use `lib/client-api.ts`/`lib/client-auth.ts` (`nc_client_token`). Mixing them logs users into the wrong world.
4. **Tokens, not hex** — colors/type/shadows come from the CSS variables in `app/globals.css` (`var(--brand-primary)` etc.). A hardcoded hex is a design-system bug.
5. **Verified in the running app** — drive the changed flow at `http://localhost:3000` against the real local backend (dev OTP `111111`), or extend the Playwright suite (`e2e/`, Page Objects in `e2e/pages/`, auth pre-saved by `auth.setup.ts`). A screenshot you looked at beats a build that passed.

## Traps
| Trap | Reality |
|---|---|
| Writing Next code from memory | Next 16 broke conventions; check `node_modules/next/dist/docs/` first. |
| New fetch logic inline in a page | Per-domain API modules live in `lib/*-api.ts` — extend those. |
| Handling 401 manually | `lib/api.ts` already redirects on 401; don't duplicate or bypass it. |
| Mocking the backend in e2e | The suite runs against the real local backend by design. |
| Currency math in rupees | Backend sends paise; use `formatCurrency` from `lib/utils.ts`. |

## Red flags — stop and fix
- "tsc probably passes" (run it)
- "I remember how Next layouts work" (Next 16 — read the doc)
- "I'll verify visually after the PR"
