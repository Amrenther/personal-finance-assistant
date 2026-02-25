import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, CalendarDays, ArrowUpRight, ArrowDownRight } from "lucide-react"
import type { Transaction } from "@/app/actions"

type OverviewProps = {
  totalIncome: number
  totalExpenses: number
  netBalance: number
  monthExpenses: number
  recentTransactions: Transaction[]
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value)
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function OverviewSection({
  totalIncome,
  totalExpenses,
  netBalance,
  monthExpenses,
  recentTransactions,
}: OverviewProps) {
  const summaryCards = [
    {
      title: "Total Income",
      value: formatCurrency(totalIncome),
      icon: TrendingUp,
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Total Expenses",
      value: formatCurrency(totalExpenses),
      icon: TrendingDown,
      iconColor: "text-red-500",
      bgColor: "bg-red-50",
    },
    {
      title: "Net Balance",
      value: formatCurrency(netBalance),
      icon: DollarSign,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "This Month",
      value: formatCurrency(monthExpenses),
      icon: CalendarDays,
      iconColor: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ]

  return (
    <section id="overview" className="scroll-mt-20">
      <h2 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">Overview</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.title} className="border border-border">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="text-xl font-semibold tabular-nums text-foreground">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6 border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-foreground">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No transactions yet.</p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((txn) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        txn.type === "income" ? "bg-emerald-50" : "bg-red-50"
                      }`}
                    >
                      {txn.type === "income" ? (
                        <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{txn.description || txn.category}</p>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="text-xs"
                        >
                          {txn.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{formatDate(txn.date)}</span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-semibold tabular-nums ${
                      txn.type === "income" ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {txn.type === "income" ? "+" : "-"}
                    {formatCurrency(Number(txn.amount))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
