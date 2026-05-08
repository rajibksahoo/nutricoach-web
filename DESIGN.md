# NutriCoach Web — Design System

Reference document for UI/UX decisions in `nutricoach-web`. Use this when building new pages, components, or reviewing consistency.

---

## Design Philosophy

- **Calm & clinical** — coaches are professionals; the UI should feel like a good SaaS tool, not a consumer app.
- **Density over decoration** — show data clearly, skip ornamental flourishes.
- **One interaction at a time** — forms, modals, and actions should be focused. No clutter.
- **India-first context** — currency in ₹, phone-based auth (no email/password), dates in DD MMM YYYY format.

---

## Color Palette

### Semantic Roles

| Role | Tailwind token | Hex | Usage |
|------|---------------|-----|-------|
| Primary action | `emerald-600` | `#059669` | CTA buttons, active nav item, key icons |
| Primary hover | `emerald-700` | `#047857` | Button hover state |
| Primary light | `emerald-50` | `#ecfdf5` | Active status badge background |
| Danger | `red-600` | `#dc2626` | Delete actions, error badges |
| Warning | `amber-600` | `#d97706` | Paused status, warnings |
| Info | `blue-600` | `#2563eb` | Onboarding status, informational badges |

### Surface Colors

| Surface | Tailwind token | Hex | Usage |
|---------|---------------|-----|-------|
| Page background | `slate-50` | `#f8fafc` | Body (`--background`) |
| Card background | `white` | `#ffffff` | Cards, panels, modals |
| Sidebar background | `slate-900` | `#0f172a` | Left navigation |
| Sidebar item hover | `slate-800` | `#1e293b` | Nav hover state |
| Border default | `slate-200` | `#e2e8f0` | Card borders, input borders |
| Border subtle | `slate-100` | `#f1f5f9` | CardHeader dividers |

### Text Colors

| Role | Tailwind token | Hex | Usage |
|------|---------------|-----|-------|
| Primary text | `slate-900` | `#0f172a` | Headings, body copy (`--foreground`) |
| Secondary text | `slate-600` | `#475569` | Labels, descriptions |
| Muted text | `slate-500` | `#64748b` | Placeholders, timestamps |
| Disabled text | `slate-400` | `#94a3b8` | Inactive nav items |
| Inverse text | `white` | `#ffffff` | Text on dark/colored backgrounds |

---

## Typography

**Font stack:** `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
System fonts only — no custom webfonts. Renders crisply on Windows (Segoe UI) and macOS (SF Pro).

### Scale

| Use | Tailwind class | Size | Weight |
|-----|---------------|------|--------|
| Page title | `text-xl font-semibold` | 20px / 600 | |
| Section heading | `text-base font-semibold` | 16px / 600 | |
| Card title | `text-sm font-semibold` | 14px / 600 | |
| Body / table row | `text-sm` | 14px / 400 | |
| Label / caption | `text-xs font-medium` | 12px / 500 | |
| Sidebar nav item | `text-sm font-medium` | 14px / 500 | |

Anti-aliasing: `-webkit-font-smoothing: antialiased` applied globally.

---

## Layout

### App Shell

```
┌──────────────┬─────────────────────────────────────┐
│              │                                     │
│   Sidebar    │   Main content area                 │
│   w-60       │   ml-60, min-h-screen, bg-slate-50  │
│   (240px)    │   p-6 or p-8                        │
│   fixed      │                                     │
│              │                                     │
└──────────────┴─────────────────────────────────────┘
```

- Sidebar: `fixed inset-y-0 left-0 w-60 bg-slate-900 z-10`
- Main: `ml-60 min-h-screen bg-slate-50 p-6`
- Max content width: none currently — full width within main area

### Auth Pages

Centered card layout, no sidebar:
```
┌────────────────────────────────────┐
│         bg-slate-50                │
│                                    │
│    ┌────────────────────────┐      │
│    │  White card, p-8       │      │
│    │  max-w-sm, mx-auto     │      │
│    │  rounded-xl shadow-sm  │      │
│    └────────────────────────┘      │
│                                    │
└────────────────────────────────────┘
```

### Page Structure (Dashboard pages)

```
<main className="ml-60 min-h-screen bg-slate-50 p-6">
  {/* Page header */}
  <div className="mb-6">
    <h1 className="text-xl font-semibold text-slate-900">Page Title</h1>
    <p className="text-sm text-slate-500 mt-1">Optional description</p>
  </div>

  {/* Stats row (if applicable) */}
  <div className="grid grid-cols-4 gap-4 mb-6">...</div>

  {/* Main content */}
  <Card>...</Card>
</main>
```

---

## Components

### Button

Four variants, three sizes.

```tsx
<Button variant="primary" size="md">Save</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="ghost">View</Button>
<Button variant="danger">Delete</Button>
<Button loading>Saving...</Button>
```

| Variant | Background | Text | Border | Focus ring |
|---------|-----------|------|--------|------------|
| primary | `emerald-600` → hover `emerald-700` | white | — | `emerald-500` |
| secondary | white → hover `slate-50` | `slate-700` | `slate-200` | `slate-300` |
| ghost | transparent → hover `slate-100` | `slate-600` | — | `slate-300` |
| danger | `red-600` → hover `red-700` | white | — | `red-500` |

| Size | Padding | Font size |
|------|---------|-----------|
| sm | `px-3 py-1.5` | `text-sm` |
| md | `px-4 py-2` | `text-sm` |
| lg | `px-6 py-3` | `text-base` |

All buttons: `rounded-lg`, `font-medium`, `disabled:opacity-50 disabled:cursor-not-allowed`. Loading state shows spinner + disables the button.

---

### Input

```tsx
<Input label="Phone Number" error="Required" placeholder="+91 98765 43210" />
```

- Label: `text-sm font-medium text-slate-700 mb-1`
- Input: `w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500`
- Error state: border turns `red-300`, error message in `text-xs text-red-600 mt-1`

---

### Card

Compound component: `Card > CardHeader + CardContent`.

```tsx
<Card>
  <CardHeader>
    <h2 className="text-sm font-semibold text-slate-900">Section Title</h2>
  </CardHeader>
  <CardContent>
    {/* content */}
  </CardContent>
</Card>
```

- Card: `bg-white rounded-xl border border-slate-200 shadow-sm`
- CardHeader: `px-5 py-4 border-b border-slate-100`
- CardContent: `px-5 py-4`

---

### Badge

Inline status indicators. Always `text-xs font-medium`, `rounded-md`, `px-2 py-0.5`.

| Variant | Background | Text | Ring |
|---------|-----------|------|------|
| green | `emerald-50` | `emerald-700` | `emerald-200` |
| yellow | `amber-50` | `amber-700` | `amber-200` |
| red | `red-50` | `red-700` | `red-200` |
| blue | `blue-50` | `blue-700` | `blue-200` |
| slate | `slate-100` | `slate-600` | `slate-200` |

**Client status mapping:**
- `ACTIVE` → green
- `ONBOARDING` → blue
- `PAUSED` → yellow
- `INACTIVE` → slate

---

### Two-Pane Section Layout (standard)

The pattern first introduced for **Library** is the canonical layout for any top-level dashboard section that contains multiple sub-views (statuses, categories, sub-tabs, saved views). New sections (Clients, Meal Plans, Progress, …) should adopt it instead of inventing per-page chrome.

```
┌──────────┬───────────────┬─────────────────────────────────────────┐
│          │ Section pane  │   Page area                             │
│  Primary │  w-[212px]    │   header + filter bar + table           │
│  sidebar │  bg-slate-50  │   padding: 20px 28px 80px               │
│  w-60    │  border-r     │                                         │
│  fixed   │  slate-200    │                                         │
└──────────┴───────────────┴─────────────────────────────────────────┘
```

**Anatomy**
- **Primary sidebar** (`components/layout/Sidebar.tsx`) — global nav, always present.
- **Section pane** (`components/<section>/<Section>Sidebar.tsx`) — fixed-width 212px, sub-nav for the section. Sits flush against the primary sidebar.
- **Page area** — full-bleed: no centered `max-w-6xl` wrapper. The dashboard layout opts the section into full-bleed via a path check.

**Section pane spec**
- `aside` with `width: 212px`, `bg-slate-50/60`, `border-r border-slate-200`, `shrink-0`.
- Header strip: `padding: 16px 18px 12px`, `border-b border-slate-200`, title in `text-[13px] font-semibold tracking-[-0.005em]`.
- Nav: `padding-top: 8px`, items as `Link` with:
  - Layout: `flex items-center gap-2.5 px-4 py-1.5 text-[12.5px] font-medium border-l-2 transition-colors`
  - Active: `bg-emerald-50 text-emerald-700 border-emerald-600`
  - Idle: `text-slate-600 border-transparent hover:bg-slate-100 hover:text-slate-900`
  - Icon: `w-[15px] h-[15px] shrink-0` from lucide
  - Optional `NEW` badge: `px-1.5 py-[1px] text-[9px] font-bold tracking-wide rounded bg-emerald-600 text-white`
- Active match uses `pathname === href || pathname.startsWith(href + "/")` so detail/edit routes stay highlighted.

**Page area spec**
- Outer wrapper: `flex flex-col gap-4` with `padding: 20px 28px 80px`.
- Page header: `h1` is `flex items-center gap-2`, `fontSize: 24, fontWeight: 700, letterSpacing: -0.02em`, leading icon in `emerald-600 w-5 h-5`. Right side holds secondary actions, a vertical divider (`w-px h-5 bg-slate-200`), then the primary `New …` action in `emerald-600`.
- Filter bar: white card, `border-slate-200 rounded-lg`, `padding: 12px 14px`, `gap: 10`. Search field uses `padding: 7px 36px 7px 32px`, `fontSize: 12.5`, leading `Search` icon and trailing `⌘K` kbd hint. Chips for facet filters use the `Chip` component pattern (rounded-full, `text-[11.5px]`, active = tinted bg + colored text + `border-current`).
- Table: `border border-slate-200 rounded-lg bg-white`. Header row: `bg-slate-50/60`, columns are `text-[10.5px] font-semibold uppercase tracking-[0.05em] text-slate-500`, padding `9px 13px`. Body rows: `border-t border-slate-100`, `hover:bg-slate-50/60`, cell padding `10px 13px`, click row to open detail/edit. Selected row: `bg-emerald-50/40`. Hover-only row actions: `opacity-0 group-hover:opacity-100` cluster of icon buttons + a `MoreHorizontal` button.
- Pagination footer inside the same card border, `bg-slate-50/60`, `text-[11.5px]`.
- Floating bulk-action bar: `fixed bottom-6 left-1/2 -translate-x-1/2`, `bg-slate-900 text-white rounded-xl shadow-lg`, appears only when selection > 0.

**Routing**
- Use a `(list)` route group when the section also has `[id]` / `new` detail routes that should keep the centered dashboard wrapper. The `(list)/layout.tsx` mounts the section sidebar; `[id]` and `new` siblings stay outside the group.
- The dashboard shell (`app/(dashboard)/layout.tsx`) decides full-bleed by path:
  ```ts
  const fullBleed =
    pathname.startsWith("/library") ||
    pathname === "/clients";
  ```
  Add the section's list path here when adopting the pattern.
- `/<section>` should `redirect()` to the default sub-view (e.g. `/library` → `/library/exercises`). Filter-style sub-views may instead live as `?status=` query params on a single `(list)/page.tsx`.

**When to use**
- Any section with ≥3 mutually exclusive sub-views or saved-filter sets.
- Skip for single-purpose pages (Profile, Billing) — those keep the centered dashboard wrapper.

### Sidebar

Fixed, always visible on all dashboard pages.

- Width: `w-60` (240px)
- Background: `slate-900`
- Logo area: `Leaf` icon in `emerald-500` rounded square + "NutriCoach" text in white
- Nav items: active = `bg-emerald-600 text-white`, inactive = `text-slate-400 hover:bg-slate-800 hover:text-white`
- Icon size: `w-4 h-4`
- Coach name/phone shown in footer above logout button

**Nav items (in order):**
1. Dashboard — `LayoutDashboard`
2. Clients — `Users`
3. Meal Plans — `UtensilsCrossed`
4. Progress — `TrendingUp`
5. Billing — `CreditCard`
6. Profile — `UserCircle`

---

### Spinner

Used for loading states within buttons or standalone.

```tsx
<Spinner />
<Spinner className="h-8 w-8" />
```

Default size: `h-5 w-5`. Color: `text-emerald-600`.

---

### UpgradePrompt

Modal triggered automatically on HTTP 402 responses from the API. Prompts the coach to upgrade their plan. Not triggered manually.

---

### Modal (form modal pattern)

Used for create/edit forms (e.g. `AddExerciseModal`). **Single-screen, never wizard.** If the form has supporting context (preview, summary, calculation), use a 2-column body with the form on the left and an aside on the right.

**Backdrop & shell**
- Backdrop: `fixed inset-0 bg-slate-900/55` — clicking it closes the modal
- Shell: `bg-white rounded-xl shadow-2xl max-h-[calc(100vh-48px)] flex flex-col overflow-hidden`
- Width: `max-w-3xl` (~768px) for 2-column form modals; `max-w-md` for confirm/single-field modals
- Click inside the shell does **not** close (`stopPropagation`)

**Sections**
- Header (`px-6 py-4 border-b border-slate-200`): title `text-[17px] font-semibold tracking-tight`, optional subtitle in `text-xs text-slate-500`, close `X` icon button on the right
- Body (`px-6 py-5 overflow-y-auto`): form fields in a `flex flex-col gap-4`. For 2-column layouts use `grid grid-cols-[1fr_280px] gap-6`; right column gets `border-l border-slate-200 pl-6`
- Footer (`px-6 py-3 border-t border-slate-200 bg-slate-50`): keyboard hint on the left, `Cancel` (secondary) + primary action on the right

**Field pattern**
- Use the local `Field` helper: label `text-[11.5px] font-semibold text-slate-700`, required asterisk in `text-red-500`, hint in `text-[11px] text-slate-400`
- Inputs: `px-3 py-1.5 text-[13px] border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500`
- Selects use the same `inputCls` for visual consistency
- Inline icon prefixes (e.g. video link): absolute-positioned `w-3.5 h-3.5 text-slate-400` at `left-3`, input gets `pl-9`

**Tile pickers (e.g. Category)**
- 5-tile `grid grid-cols-5 gap-1.5`; each tile is `flex flex-col items-center gap-1.5 px-1.5 py-2.5 rounded-lg border`
- Selected: tinted background + colored text + accent border (e.g. `bg-orange-50 text-orange-700 border-orange-400`)
- Unselected: `bg-white text-slate-600 border-slate-200 hover:bg-slate-50`
- Pair with a contextual hint card below in the same tint, explaining what changes when this option is selected

**Preview aside**
- 280px column with section header `text-[10.5px] font-semibold uppercase tracking-wider text-slate-500`
- Hero block: `aspect-[4/3] rounded-lg` with category-tinted background and a large icon — replaced by media if a video URL is set
- Summary block: live name, muscle/equipment line, badges (category + pattern)
- Bottom callout: tinted info card (e.g. violet "Custom exercise") pinned with `mt-auto`

**Keyboard**
- `Esc` closes
- `⌘/Ctrl + Enter` triggers primary action
- Always autofocus the first text input
- Show hints in the footer using the `Kbd` helper (`font-mono text-[10px] bg-white border px-1.5 py-0.5 rounded`)

**Don'ts**
- No multi-step wizards for create/edit forms — show all fields at once
- No `backdrop-blur` on the overlay — flat translucent `slate-900/55` only
- No free-text inputs for fields with a known small set (muscle group, equipment, movement pattern) — use `<select>` with the canonical list

---

## Iconography

Library: **lucide-react** — consistent 24px stroke-based icons.

- Dashboard pages use `w-4 h-4` (16px) for inline/nav icons
- Larger decorative icons: `w-5 h-5` or `w-6 h-6`
- Always use `shrink-0` on icons inside flex containers
- Brand icon: `Leaf` (used in sidebar logo)

---

## Status & Feedback

### Toast Notifications

Library: **react-hot-toast**, configured in root layout.

- Position: top-right
- Duration: 3 seconds (default)
- Use `toast.success()` for confirmations, `toast.error()` for failures
- Keep messages short: "Client saved." / "Failed to save client."

### Loading States

- Button actions: use `loading` prop on `Button` — shows inline spinner, disables click
- Page/data loading: full-area `Spinner` centered in the content region
- Never show skeleton screens — a spinner is sufficient at this scale

### Empty States

- Show inside a Card with centered text
- Pattern: icon + heading + subtext + optional CTA button
- Example: "No clients yet. Add your first client to get started."

### Error States

- API errors: `toast.error(message)` for transient errors
- Form validation: inline `error` prop on `Input` component
- 401: automatic redirect to `/login` via axios interceptor
- 402: automatic `UpgradePrompt` modal via axios interceptor

---

## Spacing

Based on Tailwind's default 4px base unit.

| Token | px | Common use |
|-------|-----|-----------|
| `gap-2` | 8px | Tight icon + label pairs |
| `gap-3` | 12px | Nav item icon + label |
| `gap-4` | 16px | Grid columns, card grid |
| `gap-6` | 24px | Section spacing |
| `p-6` | 24px | Main content padding |
| `px-5 py-4` | 20/16px | Card header/content padding |
| `px-3 py-2.5` | 12/10px | Nav item padding |
| `mb-6` | 24px | Page header bottom margin |

---

## Data Formatting

Handled by `lib/utils.ts`:

| Data type | Format | Example |
|-----------|--------|---------|
| Currency | `formatCurrency(paise)` — paise to ₹ | `₹1,500` |
| Date | `formatDate(isoString)` — DD MMM YYYY | `15 Jan 2025` |
| Phone | Display as-is from backend | `+91 98765 43210` |

---

## Responsive Behavior

This app is **desktop-only** for the MVP. No mobile breakpoints are implemented. The sidebar is fixed-width and the layout assumes a minimum viewport of ~1024px wide.

Do not add responsive classes (`sm:`, `md:`, `lg:`) unless a page is specifically designed to be responsive.

---

## Do / Don't

| Do | Don't |
|----|-------|
| Use `emerald-600` for all primary actions | Mix in other accent colors (purple, teal, orange) |
| Use the `Card` component for all content panels | Use raw `div` with ad-hoc shadow/border styles |
| Use `toast` for feedback after actions | Use alert() or inline success banners |
| Use `Badge` for status labels | Use custom colored text spans |
| Use Lucide icons | Mix in other icon sets |
| Keep forms focused — one purpose per page | Put multiple unrelated forms on one page |
| Derive color from semantic role (primary, danger) | Use arbitrary hex values inline |
