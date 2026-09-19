# FinTrack v2 — Complete UI & Feature Upgrade Plan

A complete transformation of the Personal Finance Assistant from a plain scrollable page into a professional, glassmorphism-style fintech dashboard with a fixed sidebar layout, website loader, dark mode, and 8 new features.

---

## Design Summary

| Aspect | v1 (Current) | v2 (New) |
|---|---|---|
| Layout | Single-page scroll | Fixed sidebar + **bento-grid** main content area |
| Theme | Light only, neutral grey | Dark default + light toggle, deep indigo/violet + emerald |
| Background | Plain `bg-background` | Animated gradient orbs (indigo/violet/emerald bleeding through glass) |
| Cards | Basic shadcn Card | **Frosted glass bento cards** — `backdrop-blur-xl`, `bg-white/5`, subtle white border (`border-white/10`), large radius |
| Card Layout | Uniform grid | **Varying-size bento grid** — some cards span 2 cols/rows (like reference image) |
| Loader | None | Animated SVG logo + spinning chart icon + fade-in |
| Nav | Top sticky header | Fixed sidebar with icons + labels + dark/light toggle |
| Animations | None | Number counters, skeleton loaders, hover glow effects |

### Glassmorphism Reference Style (from your image)

The reference shows a **light frosted glass** aesthetic. Your version adapts this to dark:

- **Reference**: White semi-transparent cards over bright room background
- **Your version**: White/5 opacity frosted cards over dark indigo background with glowing animated orbs
- **Card style**: `background: rgba(255,255,255,0.05)`, `backdrop-filter: blur(20px)`, `border: 1px solid rgba(255,255,255,0.1)`, `border-radius: 20px`, subtle `box-shadow: 0 8px 32px rgba(0,0,0,0.3)`
- **Bento grid**: Cards in a CSS grid with `grid-column: span 2` / `grid-row: span 2` for featured cards (like the big calendar/chart cards in the reference)

---

## Open Questions

> [!NOTE]
> All design decisions have been confirmed through the interview. No blocking questions remain.

---

## Proposed Changes

### Phase 1 — Database Schema Migrations

#### [MODIFY] [`actions.ts`](file:///c:/Dev/Projects/personal-finance-assistant/app/actions.ts)
Add new server actions for all new features.

#### [NEW] `scripts/migrate-v2.sql`
New migration script to create the following tables:
```sql
-- Goals Tracker
CREATE TABLE goals (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  current_amount DECIMAL(12,2) DEFAULT 0,
  deadline DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recurring Transactions
ALTER TABLE transactions ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE transactions ADD COLUMN recurrence_type VARCHAR(20); -- 'monthly','weekly','yearly'

-- Bill Reminders
CREATE TABLE bills (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  due_date DATE NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  category VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Net Worth Tracker
CREATE TABLE net_worth_entries (
  id SERIAL PRIMARY KEY,
  entry_date DATE NOT NULL,
  assets DECIMAL(12,2) DEFAULT 0,
  liabilities DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### Phase 2 — Global Styles & Theme

#### [MODIFY] [`globals.css`](file:///c:/Dev/Projects/personal-finance-assistant/app/globals.css)
Complete redesign of the CSS custom properties:
- **Dark mode palette**: Deep indigo (`#0f0a2e`), violet (`#7c3aed`), emerald (`#10b981`)
- **Glassmorphism tokens**: `--glass-bg`, `--glass-border`, `--glass-blur`
- **Gradient orb animations**: `@keyframes blob` for background blobs
- **Card glassmorphism**: `backdrop-filter: blur(16px)`, semi-transparent backgrounds
- **Typography**: Keep Geist font, increase heading weight

---

### Phase 3 — Website Loader

#### [NEW] [`components/ui/page-loader.tsx`](file:///c:/Dev/Projects/personal-finance-assistant/components/ui/page-loader.tsx)
A fullscreen animated loading splash screen:
- **FinTrack logo** with animated gradient text
- **Spinning coin/chart SVG icon** (CSS `rotate` keyframe animation)
- **Progress bar** that fills over ~1.5 seconds
- **Fade out** smoothly when data is ready
- Implemented as a client component using `useEffect` + `useState` with a `sessionStorage` flag (only shows on first visit per session)

#### [MODIFY] [`app/layout.tsx`](file:///c:/Dev/Projects/personal-finance-assistant/app/layout.tsx)
- Import `ThemeProvider` (next-themes) with `defaultTheme="dark"`
- Import and render `<PageLoader />` at root level

---

### Phase 4 — Sidebar Navigation

#### [NEW] [`components/finance/sidebar.tsx`](file:///c:/Dev/Projects/personal-finance-assistant/components/finance/sidebar.tsx)
A fixed-width left sidebar replacing the top header:
- **FinTrack logo** at the top with premium gradient icon
- **Navigation items** with active state highlighting (glass effect on active):
  - Overview, Transactions, Charts, Budgets, Suggestions
  - NEW: Goals, Bills, Net Worth
- **Dark/Light mode toggle** at the bottom of sidebar
- **Sidebar width**: 240px expanded

#### [DELETE] [`components/finance/header.tsx`](file:///c:/Dev/Projects/personal-finance-assistant/components/finance/header.tsx)
Replaced entirely by the sidebar.

#### [MODIFY] [`app/page.tsx`](file:///c:/Dev/Projects/personal-finance-assistant/app/page.tsx)
- Wrap content in a flex layout: `<Sidebar />` (fixed left) + `<main>` (flex-1, ml-[240px])
- Add data fetching for all new features (goals, bills, net worth, health score)

---

### Phase 5 — Overview Section Redesign

#### [MODIFY] [`components/finance/overview-section.tsx`](file:///c:/Dev/Projects/personal-finance-assistant/components/finance/overview-section.tsx)
- **Glass cards** instead of plain shadcn cards (frosted look with gradient borders)
- **Animated number counters** (count up from 0 on mount using `useEffect`)
- **Financial Health Score widget** — circular gauge showing score 0–100 with color gradient (red → amber → emerald)
- **Skeleton loading states** while data loads

---

### Phase 6 — Transactions Section Redesign

#### [MODIFY] [`components/finance/transactions-section.tsx`](file:///c:/Dev/Projects/personal-finance-assistant/components/finance/transactions-section.tsx)
- **Search bar** to filter by description/category
- **Filter chips** for type (Income/Expense) and category
- **Date range picker** filter
- **Recurring badge** on recurring transactions (new `is_recurring` field)
- **Glass modal/drawer** for adding transactions (replace inline form)
- **CSV Export button** — client-side export using `Blob` + `URL.createObjectURL`
- **Hover micro-animations** on rows (subtle translateY + shadow)

---

### Phase 7 — Charts Section Redesign

#### [MODIFY] [`components/finance/charts-section.tsx`](file:///c:/Dev/Projects/personal-finance-assistant/components/finance/charts-section.tsx)
- Glass card wrappers for all charts
- **Spending Insights panel** — rule-based generated narrative text comparing this month vs last month (e.g. "You spent 23% more on Food this month")
- Updated recharts colors to match new indigo/emerald palette

---

### Phase 8 — Budgets Section Redesign

#### [MODIFY] [`components/finance/budgets-section.tsx`](file:///c:/Dev/Projects/personal-finance-assistant/components/finance/budgets-section.tsx)
- Glass card design
- Animated progress bars (CSS transition on mount)
- Color-coded progress: green < 70%, amber 70–90%, red > 90%

---

### Phase 9 — New Feature Sections

#### [NEW] [`components/finance/goals-section.tsx`](file:///c:/Dev/Projects/personal-finance-assistant/components/finance/goals-section.tsx)
- Glass cards per goal with circular progress ring
- "Add Goal" glass modal with name, target amount, deadline
- Progress: manually update `current_amount` or auto-compute from tagged transactions

#### [NEW] [`components/finance/bills-section.tsx`](file:///c:/Dev/Projects/personal-finance-assistant/components/finance/bills-section.tsx)
- Upcoming bills list sorted by due date
- Overdue bills highlighted in red glow
- "Mark as Paid" button
- "Add Bill" form in glass modal

#### [NEW] [`components/finance/net-worth-section.tsx`](file:///c:/Dev/Projects/personal-finance-assistant/components/finance/net-worth-section.tsx)
- Area chart showing net worth over time
- Form to log assets and liabilities for current date
- Summary: Total Assets, Total Liabilities, Net Worth delta

#### [MODIFY] [`components/finance/suggestions-section.tsx`](file:///c:/Dev/Projects/personal-finance-assistant/components/finance/suggestions-section.tsx)
- Enhanced rule-based engine with 10+ rules
- Glass card design with color-coded suggestion badges (info/warning/danger)

---

### Phase 10 — Supporting Files

#### [MODIFY] [`lib/suggestions.ts`](file:///c:/Dev/Projects/personal-finance-assistant/lib/suggestions.ts)
Enhance with new rules:
- Recurring expense detection
- Budget overspend alert by percentage
- Savings rate calculation
- Spending velocity (spending faster than last month)
- Top category comparison month-over-month

#### [NEW] `lib/health-score.ts`
Calculate Financial Health Score (0–100):
- Savings rate component (40 pts)
- Budget adherence component (30 pts)
- Spending stability component (30 pts)

#### [NEW] `lib/spending-insights.ts`
Generate narrative spending insights text (rule-based string generation).

---

## Verification Plan

### Automated
- `npm run build` — ensure TypeScript compiles with no errors
- `npm run lint` — ensure no lint errors

### Manual
- Visit `localhost:3000` and confirm loader appears, then fades
- Verify sidebar is fixed and nav items scroll to correct sections
- Verify dark/light toggle persists via `next-themes`
- Add a transaction, goal, bill, and net worth entry — confirm they persist in DB
- Export CSV and verify it downloads correctly
- Verify Financial Health Score updates when transactions change
- Test on mobile viewport — sidebar should be hidden with a hamburger menu

---

## Implementation Order

1. DB migration SQL script
2. Global CSS + theme tokens
3. Page loader component
4. Sidebar + layout restructure
5. Overview section (glass + health score + counters)
6. Transactions (search/filter + CSV + glass modal)
7. Charts (glass + spending insights)
8. Budgets (glass + animated progress)
9. Goals, Bills, Net Worth new sections
10. Suggestions enhancement
11. Server actions for all new features
