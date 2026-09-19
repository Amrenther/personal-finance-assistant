"use client"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"
import type { MonthlyStats, CategoryBreakdown } from "@/app/actions"
import { generateSpendingInsights, type SpendingInsight } from "@/lib/spending-insights"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Info } from "lucide-react"

// Theme-aware chart colors matching the new indigo/emerald/violet palette
const CHART_COLORS = {
  income: "oklch(0.65 0.18 162)",      // emerald
  expenses: "oklch(0.55 0.22 25)",     // red
  trend: "oklch(0.65 0.22 280)",       // violet
  grid: "oklch(1 0 0 / 0.1)",
  text: "oklch(0.7 0.02 265)",
}

const PIE_COLORS = [
  "oklch(0.65 0.22 280)",   // violet
  "oklch(0.65 0.18 162)",   // emerald
  "oklch(0.7 0.15 200)",    // teal
  "oklch(0.72 0.18 60)",    // amber
  "oklch(0.6 0.22 320)",    // pink
  "oklch(0.55 0.25 25)",    // red
  "oklch(0.6 0.2 30)",      // orange
]

function formatMonth(month: string) {
  const [year, m] = month.split("-")
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return `${months[parseInt(m, 10) - 1]} ${year.slice(2)}`
}

type Props = {
  monthlyStats: MonthlyStats[]
  categoryBreakdown: CategoryBreakdown[]
}

function InsightBadge({ insight }: { insight: SpendingInsight }) {
  const iconMap = {
    positive: CheckCircle2,
    warning: AlertTriangle,
    neutral: Info,
  }
  const colorMap = {
    positive: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    neutral: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  }
  const Icon = iconMap[insight.type]

  return (
    <div className={`glass-card p-3 flex items-start gap-3 border ${colorMap[insight.type]}`}>
      <Icon className="h-4 w-4 shrink-0 mt-0.5" />
      <p className="text-sm leading-relaxed">{insight.text}</p>
    </div>
  )
}

export function ChartsSection({ monthlyStats, categoryBreakdown }: Props) {
  const spendingInsights = generateSpendingInsights(
    monthlyStats.flatMap((m) => [
      { type: "income", category: "Income", amount: m.income, date: `${m.month}-01` },
      { type: "expense", category: "Expenses", amount: m.expenses, date: `${m.month}-01` },
    ])
  )

  // Build pie chart data with colors
  const pieData = categoryBreakdown.map((item, idx) => ({
    ...item,
    fill: PIE_COLORS[idx % PIE_COLORS.length],
  }))

  const totalExpenses = categoryBreakdown.reduce((s, c) => s + c.total, 0)

  const barChartConfig = {
    income: { label: "Income", color: CHART_COLORS.income },
    expenses: { label: "Expenses", color: CHART_COLORS.expenses },
  }

  const lineChartConfig = {
    expenses: { label: "Expenses", color: CHART_COLORS.trend },
  }

  const pieChartConfig: Record<string, { label: string; color: string }> = {}
  categoryBreakdown.forEach((item, idx) => {
    pieChartConfig[item.category] = {
      label: item.category,
      color: PIE_COLORS[idx % PIE_COLORS.length],
    }
  })

  return (
    <section id="charts" className="scroll-mt-20 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Charts</h2>
        <Badge variant="secondary" className="text-xs">
          {monthlyStats.length} months of data
        </Badge>
      </div>

      {/* Monthly Income vs Expenses Bar Chart */}
      <div className="glass-card p-5 mb-6">
        <h3 className="mb-4 text-base font-medium text-foreground">Monthly Income vs Expenses</h3>
        <ChartContainer config={barChartConfig} className="aspect-4/3 w-full">
          <BarChart data={monthlyStats} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_COLORS.grid} />
            <XAxis
              dataKey="month"
              tickFormatter={formatMonth}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tick={{ fill: CHART_COLORS.text }}
            />
            <YAxis
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`}
              tick={{ fill: CHART_COLORS.text }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`}
                />
              }
            />
            <Bar dataKey="income" fill={CHART_COLORS.income} radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="expenses" fill={CHART_COLORS.expenses} radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ChartContainer>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Category Breakdown Pie Chart */}
        <div className="glass-card p-5">
          <h3 className="mb-4 text-base font-medium text-foreground">Expense Breakdown (This Month)</h3>
          {categoryBreakdown.length === 0 ? (
            <div className="flex aspect-4/3 items-center justify-center text-sm text-muted-foreground">
              No expense data for this month.
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <ChartContainer config={pieChartConfig} className="aspect-square w-full max-w-70">
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`}
                      />
                    }
                  />
                  <Pie
                    data={pieData}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    strokeWidth={2}
                    stroke="var(--background)"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 w-full">
                {pieData.map((item) => (
                  <div key={item.category} className="flex items-center gap-1.5">
                    <div
                      className="h-2.5 w-2.5 rounded-sm"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {item.category} ({Math.round((item.total / totalExpenses) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Spending Trend Line Chart */}
        <div className="glass-card p-5">
          <h3 className="mb-4 text-base font-medium text-foreground">Spending Trend</h3>
          <ChartContainer config={lineChartConfig} className="aspect-3/1 w-full">
            <LineChart data={monthlyStats} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_COLORS.grid} />
              <XAxis
                dataKey="month"
                tickFormatter={formatMonth}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tick={{ fill: CHART_COLORS.text }}
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`}
                tick={{ fill: CHART_COLORS.text }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke={CHART_COLORS.trend}
                strokeWidth={2}
                dot={{ fill: CHART_COLORS.trend, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        </div>
      </div>

      {/* Spending Insights Panel */}
      {spendingInsights.length > 0 && (
        <div className="glass-card p-5 mt-6 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-violet-400" />
            <h3 className="text-base font-medium text-foreground">Spending Insights</h3>
            <Badge variant="secondary" className="text-xs ml-auto">
              AI Generated
            </Badge>
          </div>
          <div className="space-y-3">
            {spendingInsights.slice(0, 5).map((insight, index) => (
              <InsightBadge key={index} insight={insight} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}