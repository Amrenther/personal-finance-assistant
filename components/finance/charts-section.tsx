"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"
import type { MonthlyStats, CategoryBreakdown } from "@/app/actions"

// Compute colors in JS, not CSS variables, per chart skill guidelines
const INCOME_COLOR = "#22c55e"
const EXPENSE_COLOR = "#ef4444"
const TREND_COLOR = "#3b82f6"

const PIE_COLORS = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#f97316",
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

export function ChartsSection({ monthlyStats, categoryBreakdown }: Props) {
  const barChartConfig = {
    income: { label: "Income", color: INCOME_COLOR },
    expenses: { label: "Expenses", color: EXPENSE_COLOR },
  }

  const lineChartConfig = {
    expenses: { label: "Expenses", color: TREND_COLOR },
  }

  const pieChartConfig: Record<string, { label: string; color: string }> = {}
  categoryBreakdown.forEach((item, idx) => {
    pieChartConfig[item.category] = {
      label: item.category,
      color: PIE_COLORS[idx % PIE_COLORS.length],
    }
  })

  const pieData = categoryBreakdown.map((item, idx) => ({
    ...item,
    fill: PIE_COLORS[idx % PIE_COLORS.length],
  }))

  const totalExpenses = categoryBreakdown.reduce((s, c) => s + c.total, 0)

  return (
    <section id="charts" className="scroll-mt-20">
      <h2 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">Charts</h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Income vs Expenses Bar Chart */}
        <Card className="border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-foreground">Monthly Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barChartConfig} className="aspect-[4/3] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyStats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickFormatter={formatMonth} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `\u20B9${Number(v).toLocaleString("en-IN")}`} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => `\u20B9${Number(value).toLocaleString("en-IN")}`}
                      />
                    }
                  />
                  <Bar dataKey="income" fill={INCOME_COLOR} radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="expenses" fill={EXPENSE_COLOR} radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown Pie Chart */}
        <Card className="border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-foreground">Expense Breakdown (This Month)</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryBreakdown.length === 0 ? (
              <div className="flex aspect-[4/3] items-center justify-center text-sm text-muted-foreground">
                No expense data for this month.
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <ChartContainer config={pieChartConfig} className="aspect-square w-full max-w-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value) => `\u20B9${Number(value).toLocaleString("en-IN")}`}
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
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
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
          </CardContent>
        </Card>
      </div>

      {/* Spending Trend Line Chart */}
      <Card className="mt-6 border border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-foreground">Spending Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={lineChartConfig} className="aspect-[3/1] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyStats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickFormatter={formatMonth} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `\u20B9${Number(v).toLocaleString("en-IN")}`} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => `\u20B9${Number(value).toLocaleString("en-IN")}`}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke={TREND_COLOR}
                  strokeWidth={2}
                  dot={{ fill: TREND_COLOR, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </section>
  )
}
