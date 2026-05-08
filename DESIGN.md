# NutriCoach Web — Design System

> **Source of truth:** the Claude Design bundle at `nutricoach-workout-builder/` (extracted locally at `C:\Users\rajib\AppData\Local\Temp\design\nutricoach-workout-builder\`). Tokens below mirror that bundle's `colors_and_type.css`. When the bundle and this file disagree, the bundle wins — update this file.
>
> Brand migration is **complete** as of `feat/design-polish` — every screen consumes the indigo + teal token set. Earlier "legacy" notes referring to emerald are kept here for historical context only.

---

## Design Philosophy

- **Calm & clinical** — coaches are professionals; the UI feels like a good SaaS tool, not a consumer app.
- **Density over decoration** — show data clearly, skip ornamental flourishes.
- **One interaction at a time** — forms, modals, and actions should be focused. No clutter.
- **India-first** — ₹ currency, phone-based auth, dates in DD MMM YYYY, WhatsApp share is a first-class action.
- **Desktop-only** for MVP — minimum viewport ~1024px wide. No `sm:`/`md:`/`lg:` classes unless a page is intentionally responsive.

---

## Brand Tokens

All tokens live as CSS variables on `:root` (see `colors_and_type.css` in the design bundle). Reference them via `var(--…)` in component styles or via Tailwind `bg-[var(--…)]` arbitrary values. **Do not hardcode hex values in components.**

### Brand

| Token | Hex | Usage |
|-------|-----|-------|
| `--brand-primary` | `#4F46E5` (Indigo 600) | CTAs, active nav, key icons, focus ring base |
| `--brand-primary-hover` | `#4338CA` | Primary button hover |
| `--brand-primary-50` | `#EEF2FF` | Soft primary surfaces, active list-item bg |
| `--brand-primary-100` | `#E0E7FF` | Hover for soft primary |
| `--brand-primary-200` | `#C7D2FE` | Dashed borders on soft primary buttons |
| `--brand-primary-500` | `#6366F1` | Loading spinner accent |
| `--brand-secondary` | `#14B8A6` (Teal 500) | Secondary accents (charts, micro-actions) |
| `--brand-secondary-50` / `-100` / `-600` | `#F0FDFA` / `#CCFBF1` / `#0D9488` | Teal surface tints |

> **Migration:** the old emerald palette (`emerald-600 #059669`) was retired across the codebase in `feat/design-polish` (2026-05-09). All current code uses `--brand-primary`.

### Semantic

| Token | Hex | Usage |
|-------|-----|-------|
| `--success` / `-50` / `-700` | `#22C55E` / `#F0FDF4` / `#15803D` | Success badges, confirmations |
| `--warning` / `-50` / `-700` | `#EAB308` / `#FEFCE8` / `#A16207` | Paused, warnings |
| `--danger` / `-50` / `-700` | `#EF4444` / `#FEF2F2` / `#B91C1C` | Delete, errors |
| `--info` / `-50` / `-700` | `#2563EB` / `#EFF6FF` / `#1D4ED8` | Onboarding, informational |
| `--whatsapp` / `--whatsapp-dark` | `#25D366` / `#128C7E` | WhatsApp share buttons only |

### Surfaces & borders

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#F8FAFC` | Page background |
| `--bg-subtle` | `#F1F5F9` | Subtle panel fills, kbd background |
| `--surface` | `#FFFFFF` | Cards, panels, modals |
| `--surface-alt` | `#F8FAFC` | Alt rows |
| `--sidebar` | `#0F172A` | Primary left nav |
| `--sidebar-hover` | `#1E293B` | Sidebar item hover |
| `--overlay` | `rgba(15, 23, 42, 0.40)` | Modal backdrop |
| `--border` | `#E2E8F0` | Default borders |
| `--border-subtle` | `#F1F5F9` | Card-header dividers |
| `--border-strong` | `#CBD5E1` | Hover borders on secondary buttons |

### Text

| Token | Hex | Usage |
|-------|-----|-------|
| `--fg1` | `#0F172A` | Primary text |
| `--fg2` | `#475569` | Secondary text, labels |
| `--fg3` | `#64748B` | Muted, timestamps, placeholders |
| `--fg4` | `#94A3B8` | Disabled |
| `--fg5` | `#CBD5E1` | Faint placeholder |
| `--fg-inverse` | `#FFFFFF` | Text on dark/colored backgrounds |

---

## Typography

**Font family:** **Inter** loaded via `next/font/google` (locked decision). The design bundle ships optical-size variants (`Inter Display` 24pt, `Inter XL` 28pt); we collapse those to Inter weight steps — `--font-display` and `--font-display-xl` resolve to Inter at the appropriate weight rather than separate font files. Monospace fallback is **JetBrains Mono** (also via `next/font/google`).

```css
--font-sans:       "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
--font-display:    "Inter Display", "Inter", …;
--font-display-xl: "Inter XL", "Inter Display", "Inter", …;
--font-mono:       "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
```

### Scale (14px base)

| Token | Size | Common use |
|-------|------|-----------|
| `--text-xs` | 12px | Labels, captions, badge text |
| `--text-sm` | 14px | Body, table rows |
| `--text-base` | 16px | Section subtitles |
| `--text-lg` | 18px | Card titles |
| `--text-xl` | 20px | Page title |
| `--text-2xl` | 24px | h1 / hero block |
| `--text-3xl` | 30px | Marketing display |
| `--text-4xl` | 36px | Marketing hero |

### Semantic styles

`.h1` — `Inter XL`, 24px, 700, `letter-spacing: -0.015em`
`.h2` — `Inter Display`, 20px, 600, `-0.01em`
`.h3` — `Inter`, 16px, 600
`.h4` — `Inter`, 14px, 600
`.body` — 14px, 400, 1.5 line-height
`.caption` — 12px, 500, `--fg3`, `letter-spacing: 0.01em`
`.label` — 12px, 600, `--fg2`, **uppercase**, `letter-spacing: 0.06em`

Anti-aliasing: `-webkit-font-smoothing: antialiased` globally.

---

## Radii, shadows, motion

| Token | Value | Use |
|-------|-------|-----|
| `--radius-sm` | 6px | Pills, kbd |
| `--radius-md` | 8px | Buttons, inputs |
| `--radius-lg` | 12px | Cards |
| `--radius-xl` | 16px | Modals |
| `--radius-2xl` | 20px | Hero blocks |
| `--radius-full` | 9999px | Avatars, dot badges |
| `--shadow-xs` … `--shadow-xl` | see CSS | Card / modal elevation steps |
| `--ring-focus` | `0 0 0 3px rgba(79,70,229,0.30)` | All focus rings (indigo, never emerald) |
| `--ease-out` / `--ease-in-out` | `cubic-bezier(…)` | Default transitions |
| `--dur-fast` / `-base` / `-slow` | 120ms / 180ms / 280ms | Hover, panel, modal motion |

---

## Spacing (4px base)

`--space-1` 4px · `--space-2` 8px · `--space-3` 12px · `--space-4` 16px · `--space-5` 20px · `--space-6` 24px · `--space-8` 32px · `--space-10` 40px · `--space-12` 48px · `--space-16` 64px

---

## Layout

### App Shell

```
┌──────────────┬─────────────────────────────────────┐
│              │                                     │
│   Sidebar    │   Main content area                 │
│   w-60       │   ml-60, min-h-screen, bg-[--bg]    │
│   (240px)    │   p-6 / p-8                         │
│   fixed      │                                     │
└──────────────┴─────────────────────────────────────┘
```

- Sidebar: `fixed inset-y-0 left-0 w-[212px]` with `background: var(--sidebar)`, `z-10`. Main column offsets with `ml-[212px]`.
- Logo lockup: `Leaf` (lucide, 16px) on a 28×28 `--brand-primary` square (`--radius-sm`) + “NutriCoach” in `--fg-inverse`, Inter Display 15px / 600.
- Nav items: `flex items-center gap-2.5 px-2.5 py-[7px] rounded-md text-[12.5px] font-medium`, icon 15px. Active = `background: var(--brand-primary)` + white text. Idle = `text-slate-400` + `hover:bg-[var(--sidebar-hover)] hover:text-white`.
- Coach footer: 28px avatar with indigo-tinted background (`--brand-primary-50`) + indigo-800 initial; logout icon (`LogOut`) 14px.

**Nav items (in order, matches design's `shared.jsx` NAV):**
1. Dashboard — `LayoutDashboard`
2. Clients — `Users`
3. Meal plans — `Utensils`
4. Library — `BookOpen` (active prefix matches `/library` and `/workout-builder`)
5. Progress — `TrendingUp`
6. Messaging — `MessageCircle` (badge = unread count)
7. Billing — `CreditCard`
8. Profile — `UserCircle` (kept beyond the design — production-only)

### Library — grouped section pane (matches the design)

The Library uses a **232px left section pane** with **grouped item lists**, not horizontal tabs. The four groups (`Fitness · Nutrition · Habits · Forms`) appear as uppercase 10.5px headers; their items render as plain rows underneath. Source of truth: `library.jsx` `navGroups`.

> **Correction (2026-05-09):** an earlier version of this doc claimed Library was migrating to top tabs. That was wrong — the design's library.jsx is a section pane all along. Reverted.

**Pane container**
- `aside` `width: 232px`, `background: var(--surface)` (white), `border-right: 1px solid var(--border)`.
- Padding: `22px 0 40px`. Flex column.

**Page title**
- Outside any group: padding `0 22px 14px`.
- `h2` in `var(--font-display-xl)` 17px / 700, `letter-spacing: -0.01em`, `color: var(--fg1)`.

**Group**
- Padding: `4px 10px`. `margin-top: 10px` for groups after the first.
- Group header: padding `6px 12px 4px`, 10.5px / 700, `color: var(--fg4)`, **uppercase**, `letter-spacing: 0.08em`.

**Item (Link)**
- `flex items-center justify-between`, padding `8px 12px`, `border-radius: 7px`, font `13px / 500`, `margin-bottom: 1px`.
- Active: `background: var(--brand-primary-50)`, `color: var(--brand-primary)`, font weight `600`. **No border-l accent.**
- Idle: `background: transparent`, `color: var(--fg2)`. Hover: `background: var(--bg)`.
- Active match uses `pathname === href || pathname.startsWith(href + "/")`. Items can declare `matchPrefixes` so legacy + new paths (e.g. `/library/exercises` and `/library/fitness/exercises`) both light up the same row.

**Optional `NEW` pill** (right side of an item)
- 9px / 700, padding `1px 6px`, `border-radius: 9px`, `background: #7C3AED` (violet), `color: #fff`, `letter-spacing: 0.04em`.

**Groups + items (matches `navGroups` in `library.jsx`):**
- **Fitness** — Exercises · Workouts · Sections · Programs
- **Nutrition** — Meal Plan Templates · Recipes · Ingredients · Recipe Books `[NEW]`
- **Habits** — Tasks · Metric Groups
- **Forms** — Forms & Questionnaires

Implemented in `components/library/LibrarySidebar.tsx`; mounted in `app/(dashboard)/library/layout.tsx`. `/library/` redirects to `/library/exercises` (Fitness's first item).

### Section pane (legacy, for sections that aren't Library)

Used by sections with ≥3 sub-views that don't fit the tabs pattern.

- `aside` `width: 212px`, `background: color-mix(in srgb, var(--bg) 60%, transparent)`, `border-right: 1px solid var(--border)`, `shrink-0`.
- Header strip: `padding: 16px 18px 12px`, `border-bottom: 1px solid var(--border)`, title `text-[13px] font-semibold tracking-[-0.005em]`.
- Nav items: `flex items-center gap-2 px-4 py-1.5 text-[12.5px] font-medium border-l-2`.
  - Active: `bg-[var(--brand-primary-50)] text-[var(--brand-primary)] border-[var(--brand-primary)]`.
  - Idle: `color: var(--fg2)`, `border-transparent`, `hover:bg-[var(--bg-subtle)] hover:text-[var(--fg1)]`.
  - **Icons removed** in the design — labels only. Optional `NEW` pill: `text-[9px] font-bold uppercase tracking-wide rounded bg-[var(--brand-primary)] text-white px-1.5 py-[1px]`.

### Clients — sub-pane + tabbed detail (matches design)

Two-column screen: a 280px white sub-pane (search + alphabetical list) on the left, and a detail dashboard on the right with a sticky header (avatar + name + status pill + tabs) over a per-tab body.

- **Container** — `display: grid; gridTemplateColumns: "280px 1fr"`, `min-height: 100vh`, `background: var(--bg)`.
- **Sub-pane** — `var(--surface)` background, right border, internal "Clients / All Clients" header (10px uppercase eyebrow + 22px Inter Display XL), search input + sort toggle, scrollable client rows (avatar 36, name + goal + last-active + status dot), footer with `n of total` + soft-primary `Add client` pill.
- **Detail header** — sticky `var(--surface)` strip with 56px avatar, 22px name in Inter Display XL, status pill, tabs row (`Overview · Training · Tasks · Metrics · Food Journal · Meal Plan · Settings`), and right-aligned icon actions (Search / Cal / Bell). Active tab uses indigo bottom border.
- **Overview tab** — 3-column grid `minmax(0,1.4fr) minmax(280px,1fr) minmax(280px,1fr)`. Col A: Training (3 stat tiles + Last Workout strip) + Body Metrics Overview (Weight + Body Fat sparklines). Col B: Goal countdown (amber tint), Notes (indigo left-bar), Limitations (red left-bar), Progress Photos. Col C: Profile + Updates feed.
- **Metrics tab** — left list (Body / Exercise segmented switch + table) + right `All Metrics` chart grid (Weight chart spans full row, Body Fat / Steps below).
- **Tabs not yet implemented** show a centered "coming soon" card matching the design's placeholder.
- Visual primitives implemented in `components/clients/ClientsScreen.tsx`: `ClientAvatar` (initials in tinted circle), `StatusPill`, `Spark` (SVG sparkline + area + axis lines + endpoint dot), `Delta` (↑/↓ pill, green/red), `Card`, `CardTitle`, `TrainStat`, `MetricRow`, `MetricChartCard`, `RangeSelect`.
- Static fixture (5 clients with weight/BF/steps arrays) in `components/clients/data.ts`. Backend wiring is a separate concern — the current `/clients/[id]` and `/clients/new` routes are untouched.

### Inbox / Messaging — 3-pane

`/messages` is a 3-column screen: conversations sub-pane (320px) + thread (flex 1) + profile/notes/updates pane (320px). Container `min-height: 100vh`, `background: var(--bg)`.

- **Conversations sub-pane** — `Inbox` 24px header in Inter Display XL with broadcast (orange-dot ↑) + compose icon buttons; "MY MESSAGES (n)" eyebrow with search affordance; `All / Unread / Groups` filter pills (active uses `--brand-primary-100` + brand color); search input; scrollable thread list. Each row: 40px avatar, name (bold if unread), date, preview (1-line clamp), unread count pill in brand color. Active row gets `--brand-primary-50` background + 3px brand-color tab on the left edge.
- **Thread** — header strip with 36px avatar, name, online dot + timezone, More icon. Body is `#FAFBFC` background with date dividers (centered, fg4) and message bubbles. Outgoing bubbles use `--brand-primary` background, white text, asymmetric border radius (`14 14 4 14`); incoming use white surface with `--shadow-sm` and inverse border radius. Each bubble has a 28px sender avatar and a tabular-nums timestamp underneath. Footer is a rounded 24px input "pill" containing photo / voice / GIF / saved (with orange-dot bookmark) action buttons + the input + a circular brand-color send button.
- **Right pane** — large 84px avatar + name + timezone, then `Notes` (indigo left-bar quotes) and `Updates` (filter pill + list).
- Implemented in `components/messages/InboxScreen.tsx`. Static `INBOX_THREADS` fixture; client metadata (name, avatarTone, notes, updates) is enriched from `components/clients/data.ts` so the right pane lights up with real client context when both screens are loaded together.
- Both `/clients` and `/messages` are added to the dashboard's `fullBleed` path list so the screens fill the main column without the centered wrapper.

### Auth pages

Centered card, no sidebar. White card, `--radius-xl`, `--shadow-sm`, `max-w-sm mx-auto`, `padding: var(--space-8)` over `--bg`.

---

## Components

### Button

Variants: `primary`, `secondary`, `ghost`, `danger`, plus `soft-primary` (dashed indigo, used for inline “add section” / “add exercise” affordances inside the builder).

| Variant | Background | Text | Border |
|---------|-----------|------|--------|
| primary | `--brand-primary` → hover `--brand-primary-hover` | `--fg-inverse` | — |
| secondary | `--surface` → hover `--bg` | `--fg1` | `--border` → hover `--border-strong` |
| ghost | transparent → hover `--bg-subtle` | `--fg2` → `--fg1` | — |
| danger | `--danger` → `--danger-700` | `--fg-inverse` | — |
| soft-primary | `--brand-primary-50` → `--brand-primary-100` | `--brand-primary` | `1px dashed --brand-primary-200` (becomes solid on hover) |

| Size | Padding | Font |
|------|---------|------|
| sm | `5px 9px` | 12px |
| md | `7px 12px` | 12.5px |
| lg | `10px 18px` | 14px |

All buttons: `--radius-md`, `font-weight: 500`, `disabled:opacity-45 cursor-not-allowed`. Loading state shows inline spinner and disables click.

### Input

- Label `text-[11.5px] font-semibold` `--fg2`; required `*` in `--danger`; hint `text-[11px]` `--fg4`.
- Input/select/textarea: `padding: 6px 10px`, `font-size: 13px`, `border: 1px solid var(--border)`, `--radius-md`. `:focus` → `border-color: var(--brand-primary)`, `box-shadow: var(--ring-focus)`.

### Card

```
Card: bg-[var(--surface)], border 1px var(--border), --radius-lg, shadow-sm
CardHeader: padding 12px 16px, border-bottom 1px var(--border-subtle)
CardContent: padding 12px 16px
```

### Badge

`text-xs font-medium`, `--radius-sm`, `padding: 1px 8px`. Variants pull from semantic tokens (`success`, `warning`, `danger`, `info`, `slate`) using the `*-50` background + `*-700` text + `*` ring.

**Client status mapping:** `ACTIVE` → success, `ONBOARDING` → info, `PAUSED` → warning, `INACTIVE` → slate.

### Modal

- Backdrop: `var(--overlay)`. No backdrop-blur.
- Shell: `bg-[var(--surface)] --radius-xl --shadow-xl max-h-[calc(100vh-48px)] flex flex-col overflow-hidden`.
- Width: `max-w-3xl` (~768px) for 2-column form modals; `max-w-md` for confirms.
- Header: `padding 16px 20px`, `border-bottom 1px var(--border)`, title `text-[17px] font-semibold tracking-tight`, close `X` icon button on the right.
- Body: `padding 20px`, `overflow-y: auto`. 2-column form layout uses `grid grid-cols-[1fr_280px] gap-6` with the right column `border-l border-[var(--border)] pl-6`.
- Footer: `padding 12px 20px`, `border-top 1px var(--border)`, `bg-[var(--bg)]`. Keyboard hint left, `Cancel` (secondary) + primary right.
- Keyboard: `Esc` closes, `⌘/Ctrl+Enter` confirms primary, autofocus first text input.
- Hints rendered with `Kbd`: `font-mono text-[10px] bg-[var(--surface)] border px-1.5 py-0.5 rounded`.
- **No multi-step wizards.** Single-screen forms only. If supporting context exists (preview / summary), use the 2-column layout.

### Toast

`react-hot-toast`, top-right, 3s default. `toast.success("…")` / `toast.error("…")`. Keep messages short.

### Spinner

22px circle, `border: 2.5px solid rgba(0,0,0,0.08)`, top border `--brand-primary`, `animation: spin 700ms linear infinite`.

### UpgradePrompt

Modal triggered automatically on HTTP 402. Not invoked manually.

---

## Workout Builder section palettes

The builder colors workout sections (warmup / main / accessory / finisher / cooldown) using a tweakable palette. Three options exist; **`cool` is the default**.

| Palette | Warmup | Main | Accessory | Finisher | Cooldown |
|---------|--------|------|-----------|----------|----------|
| cool | indigo | violet | sky | teal | slate |
| warm | amber | orange | rose | red | stone |
| mono | slate-300 | slate-500 | slate-400 | slate-600 | slate-200 |

Source: `shared.jsx` → `SECTION_PALETTES`. Replicate as a small lookup table in `nutricoach-web/lib/section-palettes.ts`.

---

## Iconography

`lucide-react` only. `w-4 h-4` (16px) for inline/nav, `w-5 h-5` for headers, `shrink-0` whenever inside flex. Brand mark = `Leaf`.

---

## Status & Feedback

- **Toast** for completed actions.
- **Inline `error` prop** on `Input` for validation.
- **Spinner** for page/data loading — never skeletons at this scale.
- **Empty states** inside a Card: icon + heading + subtext + optional CTA.
- **401** → redirect to `/login` (axios interceptor). **402** → `UpgradePrompt` modal (axios interceptor).

---

## Data formatting

`lib/utils.ts`: `formatCurrency(paise)` → `₹1,500`; `formatDate(iso)` → `15 Jan 2025`; phone displayed as-is (`+91 98765 43210`).

---

## Do / Don't

| Do | Don't |
|----|-------|
| Use `var(--brand-primary)` for primary actions | Mix in emerald/purple/orange accents |
| Reference design tokens via CSS variables | Hardcode hex values inline |
| Use `Card` for content panels | Build ad-hoc bordered `div`s |
| Use `toast` for action feedback | Use `alert()` or inline success banners |
| Use `Badge` for status labels | Use custom colored text spans |
| Use Lucide icons | Mix in another icon set |
| Single-screen modals | Multi-step wizards for create/edit |
| Inter (`--font-sans`) | System-only stacks |

---

## Migration notes (historical)

- `feat/design-polish` (2026-05-09) finished the emerald → indigo migration. All `bg-emerald-*` / `text-emerald-*` / `focus:ring-emerald-*` Tailwind utilities are gone. The Badge `green` variant maps to Tailwind `green-*` (success palette), not the brand.
- `text-xl font-semibold` (20/600) was the old page-title spec; current design uses `.h1` (24/700, Inter XL).
- Library's section pane previously rendered per-item lucide icons; the design drops them — labels only.