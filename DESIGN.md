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
