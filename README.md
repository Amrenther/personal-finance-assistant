# 💎 FinTrack — Personal Finance Assistant (v2.0)

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.2-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Neon Database](https://img.shields.io/badge/Neon-PostgreSQL-00E599?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> > **FinTrack** is a modern, full-stack personal finance and wealth management platform built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Neon Serverless PostgreSQL**.

> **FinTrack is an independently designed and developed project by Amrenther.**

🔗 **Live Production Application:** [https://v0-personal-finance-assistant-omega.vercel.app/](https://finance-assistant-v2.vercel.app/)  
📁 **GitHub Repository:** [https://github.com/Amrenther/personal-finance-assistant](https://github.com/Amrenther/personal-finance-assistant)

---

## 📑 Table of Contents

- [📌 Executive Overview](#-executive-overview)
- [✨ Key Features & Functional Modules](#-key-features--functional-modules)
  - [1. 🛡️ Financial Health Score Engine (0–100)](#1-️-financial-health-score-engine-0100)
  - [2. 📊 Executive Overview & KPI Stat Cards](#2--executive-overview--kpi-stat-cards)
  - [3. 💸 Transaction Ledger & Cash Flow Management](#3--transaction-ledger--cash-flow-management)
  - [4. 📈 Interactive Visual Analytics & Narrative Insights](#4--interactive-visual-analytics--narrative-insights)
  - [5. 🎯 Dynamic Budgeting & Threshold Monitoring](#5--dynamic-budgeting--threshold-monitoring)
  - [6. 🏆 Financial Goals & Savings Milestones](#6--financial-goals--savings-milestones)
  - [7. 🔔 Bill Reminders & Obligation Tracker](#7--bill-reminders--obligation-tracker)
  - [8. 💎 Net Worth & Balance Sheet Evolution](#8--net-worth--balance-sheet-evolution)
  - [9. 💡 Rule-Based Heuristic Financial Advisory Engine](#9--rule-based-heuristic-financial-advisory-engine)
- [🎨 Design System & User Interface Architecture](#-design-system--user-interface-architecture)
- [🧮 Core Financial Formulations & Metric Definitions](#-core-financial-formulations--metric-definitions)
- [🏗️ System Architecture & Data Flow](#️-system-architecture--data-flow)
- [🗄️ Database Schema & Entity Definitions](#️-database-schema--entity-definitions)
- [🛠️ Technology Stack](#️-technology-stack)
- [📂 Project Directory Structure](#-project-directory-structure)
- [🚀 Getting Started & Local Installation](#-getting-started--local-installation)
  - [Prerequisites](#prerequisites)
  - [Step-by-Step Setup](#step-by-step-setup)
  - [Database Migration](#database-migration)
- [🔒 Security & Data Integrity](#-security--data-integrity)
- [👨‍💻 Author & Contributions](#-author--contributions)
- [📄 License](#-license)

---

## 📌 Executive Overview

Traditional personal finance tools are frequently fragmented: budgeting exists in one app, bills in another, investment tracking in spreadsheets, and transaction logging in manual notebooks.

**FinTrack (v2.0)** unifies the complete personal finance lifecycle into an all-in-one financial cockpit. Engineered with high-performance server-side rendering (SSR), reactive client state management, and real-time database queries, FinTrack provides:

1. **Holistic Financial Visibility**: Monitor net balance, monthly income, cumulative expenses, and budget utilization in Indian Rupee (`₹` INR) currency format.
2. **Actionable Financial Scoring**: A 3-pillar algorithm that grades personal financial habits (Grade A to F) using savings rate, budget discipline, and spending stability.
3. **Automated Intelligence**: Heuristic rules and narrative spending insights that analyze month-over-month variances, identify unbudgeted categories, and flag subscription drains without requiring complex third-party AI tokens.
4. **Visual Excellence**: A desktop-and-mobile optimized glassmorphism aesthetic with animated gradient ambient glow orbs, frosted glass bento cards, count-up number animations, and SVG circular progress rings.

---

## ✨ Key Features & Functional Modules

### 1. 🛡️ Financial Health Score Engine (0–100)

FinTrack features an algorithmic scoring model implemented in [`lib/health-score.ts`](file:///c:/Dev/Projects/personal-finance-assistant/lib/health-score.ts) that computes a score from **0 to 100** based on three financial pillars:

```text
┌──────────────────────────────────────────────────────────────┐
│                  Financial Health Score (100 pts)             │
├──────────────────────────────┬───────────────────────────────┤
│  Pillar 1: Savings Rate      │  Max 40 Points                │
│  Pillar 2: Budget Adherence  │  Max 30 Points                │
│  Pillar 3: Spending Stability│  Max 30 Points                │
└──────────────────────────────┴───────────────────────────────┘
```

#### Score Components & Mathematical Definitions:
* **Savings Rate Component (Up to 40 Points):**  
  Measures the portion of monthly income retained after expenses:
  $$\text{Savings Rate} = \max\left(0, \frac{\text{Income}_{\text{current}} - \text{Expenses}_{\text{current}}}{\text{Income}_{\text{current}}}\right)$$
  $$\text{Savings Score} = \min(40, \text{round}(\text{Savings Rate} \times 133))$$
  *(Saving $\ge 30\%$ of income awards the full 40 points; zero income falls back to a neutral 20 points).*

* **Budget Adherence Component (Up to 30 Points):**  
  Measures adherence against established category budgets. For each budget $i$, the ratio of expense to limit is calculated:
  $$r_i = \min\left(1, \frac{\text{Spent}_i}{\text{Limit}_i}\right)$$
  $$\text{Budget Adherence} = 1 - \frac{1}{N}\sum_{i=1}^{N} r_i$$
  $$\text{Budget Score} = \max(0, \text{round}(\text{Budget Adherence} \times 30))$$

* **Spending Stability Component (Up to 30 Points):**  
  Evaluates month-over-month expense volatility to reward predictable financial habits:
  $$\Delta_{\text{expense}} = \frac{|\text{Expenses}_{\text{current}} - \text{Expenses}_{\text{previous}}|}{\text{Expenses}_{\text{previous}}}$$
  $$\text{Stability} = \max(0, 1 - \Delta_{\text{expense}})$$
  $$\text{Stability Score} = \max(0, \text{round}(\text{Stability} \times 30))$$

#### Grade Scales & Color Semantics:
| Score Range | Grade | Label | Color Indicator | Definition |
|---|:---:|:---:|:---:|---|
| **85 – 100** | `A` | **Excellent** | `#10b981` (Emerald) | Superior savings discipline, stable cash flow, and strong budget adherence. |
| **70 – 84** | `B` | **Good** | `#6ee7b7` (Mint) | Healthy financial profile with minor budget variances or moderate savings. |
| **55 – 69** | `C` | **Fair** | `#f59e0b` (Amber) | Balanced finances; potential overspending in specific discretionary categories. |
| **40 – 54** | `D` | **Needs Work** | `#f97316` (Orange) | Low savings margin ($<10\%$) or volatile month-over-month expenditure spikes. |
| **0 – 39** | `F` | **Critical** | `#ef4444` (Rose) | Expenses exceed income or multiple category budgets heavily breached. |

---

### 2. 📊 Executive Overview & KPI Stat Cards

Located in [`components/finance/overview-section.tsx`](file:///c:/Dev/Projects/personal-finance-assistant/components/finance/overview-section.tsx), this module delivers instant situational awareness:
* **Total Income:** Cumulative lifetime and monthly earnings with emerald linear-gradient styling.
* **Total Expenses:** Aggregated cash outflows with rose-red linear-gradient badge.
* **Net Balance:** Calculated in real-time as $(\text{Total Income} - \text{Total Expenses})$ with blue/violet glow.
* **Month Expenses:** Running expenses for the active calendar month.
* **Animated Number Counters:** Client-side easing (`useCountUp` hook with cubic-bezier ease-out) that animates values from zero upon mounting.
* **Interactive SVG Circular Gauge:** Visualizes the Financial Health Score with animated SVG `strokeDashoffset` transitions.
* **Recent Transactions Feed:** Displays the latest 5 ledger activities with category icons and relative dates.

---

### 3. 💸 Transaction Ledger & Cash Flow Management

Located in [`components/finance/transactions-section.tsx`](file:///c:/Dev/Projects/personal-finance-assistant/components/finance/transactions-section.tsx), providing full lifecycle management for income and expenses:
* **Real-Time Search:** Client-side debounced search matching descriptions and categories.
* **Multi-Criteria Filter Chips:** Filter instantaneously by transaction type (**All**, **Income**, **Expense**) and granular categories.
* **Date Range Filters:** Filter transactions across custom periods.
* **Recurring Obligations Indicator:** Badges transactions marked as recurring (subscriptions, rent, utilities) with recurrence frequency (Weekly, Monthly, Yearly).
* **Glassmorphic Transaction Dialog:** Add income or expenses with category pickers, amount validation, date selection, and recurring toggles.
* **Instant Client-Side CSV Export:** Generate formatted CSV ledger files on the fly via `URL.createObjectURL(Blob)` without server round-trips.
* **Optimistic Deletion:** Delete transactions with instant UI feedback and Sonner toast notifications backed by PostgreSQL Server Actions.

---

### 4. 📈 Interactive Visual Analytics & Narrative Insights

Located in [`components/finance/charts-section.tsx`](file:///c:/Dev/Projects/personal-finance-assistant/components/finance/charts-section.tsx) and powered by **Recharts**:
* **Monthly Cash Flow Comparison (Bar Chart):** Dual-bar visualization comparing monthly gross income against gross expenses across time.
* **Expense Category Breakdown (Donut Chart):** Distribution of expenses by category (Housing, Food, Transport, Utilities, Entertainment, Healthcare, Shopping) with active hover tooltips.
* **Automated Spending Insights Engine ([`lib/spending-insights.ts`](file:///c:/Dev/Projects/personal-finance-assistant/lib/spending-insights.ts)):**
  - Evaluates month-over-month percentage variances (e.g., *"You spent 18% less this month vs last month"*).
  - Highlights top spending category dominance and its exact share of total monthly expenditure.
  - Computes net savings margins and provides qualitative performance badges (`positive`, `warning`, `neutral`).

---

### 5. 🎯 Dynamic Budgeting & Threshold Monitoring

Located in [`components/finance/budgets-section.tsx`](file:///c:/Dev/Projects/personal-finance-assistant/components/finance/budgets-section.tsx):
* **Category Spending Caps:** Set and adjust monthly limits for individual categories.
* **Three-Tier Alert Progress Bars:**
  - 🟢 **Safe Zone ($< 70\%$ utilized):** Emerald progress bar indicating healthy budget leeway.
  - 🟡 **Caution Zone ($70\% - 90\%$ utilized):** Amber progress bar warning of approaching limit.
  - 🔴 **Breach / Danger Zone ($> 90\%$ utilized):** Rose-red progress bar with pulse effect signifying budget overspend.
* **Upsert Capability:** Directly add or modify category limits with automatic SQL conflict handling (`ON CONFLICT (category) DO UPDATE`).

---

### 6. 🏆 Financial Goals & Savings Milestones

Located in [`components/finance/goals-section.tsx`](file:///c:/Dev/Projects/personal-finance-assistant/components/finance/goals-section.tsx):
* **Target Management:** Create specific financial targets (e.g., Emergency Fund, House Down Payment, New Vehicle, Vacation).
* **SVG Progress Ring:** Renders an interactive circular progress gauge calculating the percentage saved toward the target:
  $$\text{Progress \%} = \min\left(100, \frac{\text{Current Amount}}{\text{Target Amount}} \times 100\right)$$
* **Deadline Tracking & Overdue Warnings:** Calculates time remaining until target date, displaying red alerts when deadlines have lapsed.
* **Quick Deposit Dialog:** Increment savings toward any goal with an inline deposit modal.

---

### 7. 🔔 Bill Reminders & Obligation Tracker

Located in [`components/finance/bills-section.tsx`](file:///c:/Dev/Projects/personal-finance-assistant/components/finance/bills-section.tsx):
* **Upcoming Bills Calendar:** Chronologically lists pending bills (Rent, Utilities, Credit Cards, Subscriptions) sorted by due date.
* **Overdue Detection:** Identifies unpaid bills whose due date has passed today, displaying prominent red glow indicators.
* **One-Click Settlement:** Toggle bills between **Unpaid** and **Paid** with instant PostgreSQL status updates.
* **Financial Commitments Summary:** Displays aggregate unpaid balance vs. cleared payments for the current billing cycle.

---

### 8. 💎 Net Worth & Balance Sheet Evolution

Located in [`components/finance/net-worth-section.tsx`](file:///c:/Dev/Projects/personal-finance-assistant/components/finance/net-worth-section.tsx):
* **Balance Sheet Formulation:**
  $$\text{Net Worth} = \text{Total Assets} - \text{Total Liabilities}$$
* **Historical Trend Area Chart:** Visualizes net worth progression over time with smooth emerald area gradients.
* **Snapshot Logging:** Record periodic assets (bank balances, investments, property) and liabilities (loans, mortgages, credit balances) with date stamps and descriptive notes.

---

### 9. 💡 Rule-Based Heuristic Financial Advisory Engine

Implemented in [`lib/suggestions.ts`](file:///c:/Dev/Projects/personal-finance-assistant/lib/suggestions.ts), this engine evaluates transactions and budgets against **12 financial rules**:

1. **Budget Exceeded:** Identifies categories where expenditure exceeds the limit and calculates exact overspend.
2. **Budget Critical Warning (75%–100%):** Flags categories rapidly approaching their ceiling.
3. **High Spending-to-Income Ratio:** Issues an alert when monthly expenses surpass 80% of total income.
4. **Category Spending Spike:** Detects when a category's spend surges by $>20\%$ compared to the previous month.
5. **Positive Savings Celebration:** Acknowledges positive net savings and prompts allocation into emergency reserves.
6. **Unbudgeted Category Detection:** Identifies categories with significant spending that lack established budget caps.
7. **Recurring Expense Drag:** Flags when fixed subscriptions and recurring bills exceed 50% of total expenses.
8. **Pre-Emptive Budget Alert ($>90\%$):** Signals imminent budget exhaustion and reports remaining spendable balance.
9. **Savings Rate Tier Assessment:** Celebrates savings rates $\ge 30\%$ and warns when savings rates fall below $10\%$.
10. **Spending Velocity Acceleration:** Compares month-to-date velocity against the previous month; flags an alert if spending pace is $>15\%$ faster.
11. **Primary Category Trend Shift:** Evaluates month-over-month swings in the user's highest spending category.
12. **Zero Income Anomaly:** Detects when expenditures are recorded without corresponding income entries.

---

## 🎨 Design System & User Interface Architecture

FinTrack v2.0 implements a **Glassmorphism Fintech Aesthetic** designed from the ground up:

* **Color Palette:**
  - Background: Deep Void Indigo (`#080518` to `#0f0a2e`)
  - Accents: Electric Violet (`#7c3aed`), Emerald Mint (`#10b981`), Amber Gold (`#f59e0b`)
  - Card Glass: Semi-transparent white (`rgba(255, 255, 255, 0.05)`) with `backdrop-filter: blur(20px)` and subtle borders (`rgba(255, 255, 255, 0.10)`).
* **Ambient Background Orbs:** Continuous CSS `@keyframes blob` floating orbs bleeding subtle neon hues through frosted glass cards.
* **Bento Grid Architecture:** Adaptive CSS grid layout where primary cards dynamically span columns and rows for hierarchical visual emphasis.
* **Fixed Glass Sidebar:** Left-aligned 240px navigation bar with smooth hash scrolling, active link indicators, and theme toggling.
* **FinTrack Splash Loader ([`components/ui/page-loader.tsx`](file:///c:/Dev/Projects/personal-finance-assistant/components/ui/page-loader.tsx)):** Fullscreen loading screen with animated gradient typography, rotating coin/chart glyphs, and a 1.5s progress bar saved to `sessionStorage`.
* **Dark & Light Mode Support:** Complete two-way theme switching enabled through `next-themes`.

---

## 🧮 Core Financial Formulations & Metric Definitions

| Metric | Mathematical Formula | Definition & Purpose |
|---|---|---|
| **Net Balance** | $\text{Balance} = \sum \text{Income} - \sum \text{Expenses}$ | Current net liquidity available across all recorded activity. |
| **Monthly Savings** | $\text{Savings}_m = \text{Income}_m - \text{Expenses}_m$ | Net capital retained during month $m$. |
| **Savings Rate** | $\text{Rate} = \left(\frac{\text{Savings}_m}{\text{Income}_m}\right) \times 100$ | Percentage of monthly gross income converted to wealth. |
| **Budget Utilization** | $\text{Utilization}_c = \left(\frac{\text{Spent}_c}{\text{Budget}_c}\right) \times 100$ | Exhaustion percentage of category $c$'s allocated budget. |
| **Financial Health Score** | $\text{Score} = \text{Pillar}_1 (40) + \text{Pillar}_2 (30) + \text{Pillar}_3 (30)$ | Composite 0–100 index evaluating savings, adherence, and stability. |
| **Net Worth** | $\text{Net Worth} = \sum \text{Assets} - \sum \text{Liabilities}$ | Total economic value representing personal solvency and wealth. |
| **Goal Progress** | $\text{Progress} = \left(\frac{\text{Current Saved}}{\text{Target Amount}}\right) \times 100$ | Milestone completion percentage toward a financial objective. |

---

## 🏗️ System Architecture & Data Flow

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT BROWSER                                │
│                                                                         │
│  ┌───────────────────────┐  ┌────────────────────────────────────────┐  │
│  │     Fixed Sidebar     │  │           Bento Grid Layout            │  │
│  │  - Nav Hash Links     │  │  - Stat Cards (CountUp Animation)      │  │
│  │  - Dark/Light Switch  │  │  - Health Gauge (SVG Stroke Arc)       │  │
│  │  - Brand Identity     │  │  - Recharts (Cash Flow & Categories)   │  │
│  └───────────────────────┘  │  - Transactions, Budgets, Goals, Bills │  │
│                             └────────────────────────────────────────┘  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Server Actions / Revalidation
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     NEXT.JS 16 APPLICATION SERVER                       │
│                                                                         │
│  ┌───────────────────────┐  ┌────────────────────────────────────────┐  │
│  │   App Router (SSR)    │  │        Analytical Engines (lib/)       │  │
│  │  - app/page.tsx       │  │  - health-score.ts (3-Pillar 0-100)    │  │
│  │  - app/layout.tsx     │  │  - suggestions.ts (12 Rules Heuristics)│  │
│  │  - app/actions.ts     │  │  - spending-insights.ts (MoM Analytics)│  │
│  └───────────────────────┘  └────────────────────────────────────────┘  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Tagged SQL Template Queries
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    NEON SERVERLESS POSTGRESQL                           │
│                                                                         │
│   [transactions]     [budgets]     [goals]     [bills]     [net_worth]  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema & Entity Definitions

The platform uses a relational PostgreSQL database hosted on **Neon**. Schemas are configured in [`scripts/001-create-tables.sql`](file:///c:/Dev/Projects/personal-finance-assistant/scripts/001-create-tables.sql) and [`scripts/migrate-v2.sql`](file:///c:/Dev/Projects/personal-finance-assistant/scripts/migrate-v2.sql):

### 1. `transactions`
Represents individual financial inflows and outflows.
```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  description VARCHAR(255),
  date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_type VARCHAR(20), -- 'monthly', 'weekly', 'yearly'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. `budgets`
Defines monthly spending ceilings per expense category.
```sql
CREATE TABLE budgets (
  id SERIAL PRIMARY KEY,
  category VARCHAR(100) NOT NULL UNIQUE,
  monthly_limit DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. `goals`
Tracks dedicated financial milestones and target funds.
```sql
CREATE TABLE goals (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  target_amount DECIMAL(12, 2) NOT NULL,
  current_amount DECIMAL(12, 2) DEFAULT 0,
  deadline DATE,
  icon VARCHAR(50) DEFAULT 'target',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. `bills`
Maintains recurring and one-off bill payment obligations.
```sql
CREATE TABLE bills (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  due_date DATE NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  category VARCHAR(100),
  is_recurring BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5. `net_worth_entries`
Records periodic balance sheet entries for asset/liability progression.
```sql
CREATE TABLE net_worth_entries (
  id SERIAL PRIMARY KEY,
  entry_date DATE NOT NULL UNIQUE,
  assets DECIMAL(12, 2) DEFAULT 0,
  liabilities DECIMAL(12, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🛠️ Technology Stack

| Layer | Technology | Version | Purpose & Implementation |
|---|---|---|---|
| **Framework** | **Next.js** | `16.1.6` | App Router, React Server Components (RSC), Server Actions (`"use server"`), route caching. |
| **UI Library** | **React** | `19.2.4` | Modern component architecture, Transitions (`useTransition`), and hooks. |
| **Language** | **TypeScript** | `5.7.3` | End-to-end type safety across database queries, models, and UI props. |
| **Styling** | **Tailwind CSS** | `4.2.0` | Modern CSS-first configuration, CSS custom properties, responsive breakpoints. |
| **Database** | **Neon PostgreSQL** | `@neondatabase/serverless` | Serverless PostgreSQL with tagged template literal SQL query execution. |
| **Theming** | **Next Themes** | `0.4.6` | Dark and light mode synchronization and local storage persistence. |
| **Charts** | **Recharts** | `2.15.0` | Responsive SVG charts (Bar charts, Donut charts, Net worth area charts). |
| **Primitives** | **Radix UI** | `^1.2` | Accessible modal dialogs, select dropdowns, tooltips, and progress bars. |
| **Toasts** | **Sonner** | `1.7.1` | Rich notification toasts for mutations and user feedback. |
| **Icons** | **Lucide React** | `0.564.0` | Crisp SVG iconography across navigation, actions, and categories. |
| **Dates** | **date-fns** | `4.1.0` | ISO date parsing, comparison, formatting, and deadline checking. |
| **Hosting** | **Vercel** | Platform | Serverless edge deployment and real-time performance analytics. |

---

## 📂 Project Directory Structure

```text
personal-finance-assistant/
├── app/
│   ├── actions.ts             # Server actions (transactions, budgets, goals, bills, net worth)
│   ├── globals.css            # Glassmorphism tokens, dark/light theme palettes, orb animations
│   ├── layout.tsx             # Root layout, ThemeProvider, PageLoader, Sonner Toaster
│   └── page.tsx               # Main dashboard controller with parallel data hydration
├── components/
│   ├── finance/
│   │   ├── bills-section.tsx         # Upcoming bill obligations, payment toggles, overdue detection
│   │   ├── budgets-section.tsx       # Category limits, three-tier progress bars, budget upsert
│   │   ├── charts-section.tsx        # Income vs. Expense bar chart & category breakdown donut
│   │   ├── goals-section.tsx         # Savings targets, SVG progress rings, deposit modal
│   │   ├── net-worth-section.tsx     # Assets vs. liabilities logging & net worth area chart
│   │   ├── overview-section.tsx      # KPI cards, count-up numbers, SVG health gauge
│   │   ├── sidebar.tsx               # Fixed glass navigation sidebar with theme toggle
│   │   ├── suggestions-section.tsx   # 12-rule heuristic financial advisory cards
│   │   └── transactions-section.tsx  # Searchable ledger, filter chips, CSV export, add/delete
│   ├── theme-provider.tsx     # Next-themes context provider
│   └── ui/                    # Reusable Radix UI & styled component primitives
├── lib/
│   ├── db.ts                  # Neon Serverless PostgreSQL client configuration
│   ├── health-score.ts        # 3-pillar (0-100) Financial Health Score algorithm
│   ├── spending-insights.ts   # Month-over-month narrative analysis engine
│   ├── suggestions.ts         # 12 heuristic financial evaluation rules
│   └── utils.ts               # Class merging (clsx + tailwind-merge)
├── public/                    # Static brand assets, favicon icons, and images
├── scripts/
│   ├── 001-create-tables.sql  # Initial schema migration
│   ├── 002-seed-data.sql      # Seed financial records
│   ├── 003-reseed-inr.sql     # Seed records calibrated for INR (₹)
│   ├── migrate-v2.sql         # v2.0 schema migration (goals, bills, net_worth, recurring)
│   └── run-migration.mjs      # Node migration runner script
├── .env.local                 # Local environment variables (DATABASE_URL)
├── next.config.mjs            # Next.js configuration
├── package.json               # Project dependencies and npm scripts
├── tsconfig.json              # TypeScript configuration
└── README.md                  # Comprehensive project documentation
```

---

## 🚀 Getting Started & Local Installation

### Prerequisites

Ensure the following runtimes are installed on your workstation:
* **Node.js**: `v18.18.0` or higher (Node.js 20+ recommended)
* **Package Manager**: `npm` (v9+), `pnpm`, or `yarn`
* **PostgreSQL Database**: A free serverless database from [Neon](https://neon.tech/)

Check versions:
```bash
node -v
npm -v
```

---

### Step-by-Step Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Amrenther/personal-finance-assistant.git
   cd personal-finance-assistant
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**  
   Create a `.env.local` file in the project root:
   ```env
   # Neon Serverless PostgreSQL Connection String
   DATABASE_URL=postgresql://<user>:<password>@<neon-hostname>/<dbname>?sslmode=require
   ```

   > [!IMPORTANT]
   > Never commit `.env` or `.env.local` files containing live database credentials to any public GitHub repository.

4. **Initialize Database Tables:**  
   Run the schema migration against your Neon database using the provided SQL script:
   ```bash
   node scripts/run-migration.mjs
   ```
   *Alternatively, execute the queries inside [`scripts/migrate-v2.sql`](file:///c:/Dev/Projects/personal-finance-assistant/scripts/migrate-v2.sql) directly in your Neon SQL Web Console.*

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```

6. **Access the Application:**  
   Open your browser and navigate to:
   ```text
   http://localhost:3000
   ```

---

### Production Build

To test and compile the production bundle:
```bash
npm run build
npm run start
```

---

## 🔒 Security & Data Integrity

Financial data integrity is central to FinTrack's architecture:

1. **Parameterized Queries:** All database interactions in [`app/actions.ts`](file:///c:/Dev/Projects/personal-finance-assistant/app/actions.ts) utilize tagged template literal queries via `@neondatabase/serverless` (`sql`...``), preventing SQL injection vulnerabilities.
2. **Server-Side Execution:** Sensitive financial computations, database credentials, and mutations run exclusively on the server (`"use server"`).
3. **Optimistic Isolation:** Mutations trigger granular path revalidation (`revalidatePath("/")`), ensuring immediate data consistency across client views.
4. **Environment Isolation:** Secrets are isolated in non-version-controlled environment variables (`.env.local`).

---

## 👨‍💻 Author & Contributions

**Amrenther**  
*Bachelor of Computer Science Engineering*  
*Specialized in Full-Stack Web Development, Next.js, React, TypeScript, and FinTech Interfaces.*

* **GitHub:** [@Amrenther](https://github.com/Amrenther)
* **Project Repository:** [personal-finance-assistant](https://github.com/Amrenther/personal-finance-assistant)

---

## 📄 License

This project is open-source and released under the terms of the [MIT License](https://opensource.org/licenses/MIT).
