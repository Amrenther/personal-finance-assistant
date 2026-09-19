import { Sidebar } from "@/components/finance/sidebar"
import { OverviewSection } from "@/components/finance/overview-section"
import { TransactionsSection } from "@/components/finance/transactions-section"
import { ChartsSection } from "@/components/finance/charts-section"
import { BudgetsSection } from "@/components/finance/budgets-section"
import { SuggestionsSection } from "@/components/finance/suggestions-section"
import { GoalsSection } from "@/components/finance/goals-section"
import { BillsSection } from "@/components/finance/bills-section"
import { NetWorthSection } from "@/components/finance/net-worth-section"
import {
  getDashboardSummary,
  getTransactions,
  getMonthlyStats,
  getCategoryBreakdown,
  getBudgets,
  getSuggestions,
  getGoals,
  getBills,
  getNetWorthEntries,
} from "@/app/actions"
import { calculateHealthScore } from "@/lib/health-score"

export default async function Page() {
  const [
    summary,
    transactions,
    monthlyStats,
    categoryBreakdown,
    budgets,
    suggestions,
    goals,
    bills,
    netWorthEntries,
  ] = await Promise.all([
    getDashboardSummary(),
    getTransactions(),
    getMonthlyStats(),
    getCategoryBreakdown(),
    getBudgets(),
    getSuggestions(),
    getGoals(),
    getBills(),
    getNetWorthEntries(),
  ])

  // Normalize dates: Neon returns DATE columns as JS Date objects, not strings.
  // Convert to 'YYYY-MM-DD' string so utility functions can call .startsWith().
  function toDateStr(d: string | Date | null | undefined): string {
    if (!d) return ""
    if (typeof d === "string") return d.split("T")[0]
    return d.toISOString().split("T")[0]
  }

  const txnsForScore = transactions.map((t) => ({
    type: t.type,
    category: t.category,
    amount: Number(t.amount),
    date: toDateStr(t.date as string | Date),
  }))
  const budgetsForScore = budgets.map((b) => ({
    category: b.category,
    monthly_limit: Number(b.monthly_limit),
  }))
  const healthScore = calculateHealthScore(txnsForScore, budgetsForScore)

  return (
    <div className="relative flex min-h-screen">
      <Sidebar />

      {/* Main content — offset by sidebar width */}
      <main className="relative z-10 ml-60 flex-1 px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-10">
          <OverviewSection
            totalIncome={summary.totalIncome}
            totalExpenses={summary.totalExpenses}
            netBalance={summary.netBalance}
            monthExpenses={summary.monthExpenses}
            recentTransactions={summary.recentTransactions}
            healthScore={healthScore}
          />

          <TransactionsSection transactions={transactions} />

          <ChartsSection
            monthlyStats={monthlyStats}
            categoryBreakdown={categoryBreakdown}
          />

          <BudgetsSection
            budgets={budgets}
            categoryBreakdown={categoryBreakdown}
          />

          <GoalsSection goals={goals} />

          <BillsSection bills={bills} />

          <NetWorthSection entries={netWorthEntries} />

          <SuggestionsSection suggestions={suggestions} />
        </div>
      </main>
    </div>
  )
}
