import { Header } from "@/components/finance/header"
import { OverviewSection } from "@/components/finance/overview-section"
import { TransactionsSection } from "@/components/finance/transactions-section"
import { ChartsSection } from "@/components/finance/charts-section"
import { BudgetsSection } from "@/components/finance/budgets-section"
import { SuggestionsSection } from "@/components/finance/suggestions-section"
import { Separator } from "@/components/ui/separator"
import {
  getDashboardSummary,
  getTransactions,
  getMonthlyStats,
  getCategoryBreakdown,
  getBudgets,
  getSuggestions,
} from "@/app/actions"

export default async function Page() {
  const [summary, transactions, monthlyStats, categoryBreakdown, budgets, suggestions] =
    await Promise.all([
      getDashboardSummary(),
      getTransactions(),
      getMonthlyStats(),
      getCategoryBreakdown(),
      getBudgets(),
      getSuggestions(),
    ])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="space-y-12">
          <OverviewSection
            totalIncome={summary.totalIncome}
            totalExpenses={summary.totalExpenses}
            netBalance={summary.netBalance}
            monthExpenses={summary.monthExpenses}
            recentTransactions={summary.recentTransactions}
          />

          <Separator />

          <TransactionsSection transactions={transactions} />

          <Separator />

          <ChartsSection
            monthlyStats={monthlyStats}
            categoryBreakdown={categoryBreakdown}
          />

          <Separator />

          <BudgetsSection
            budgets={budgets}
            categoryBreakdown={categoryBreakdown}
          />

          <Separator />

          <SuggestionsSection suggestions={suggestions} />
        </div>
      </main>
    </div>
  )
}
