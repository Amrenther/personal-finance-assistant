export type Suggestion = {
  type: "warning" | "destructive" | "info" | "success"
  title: string
  description: string
}

type Transaction = {
  id: number
  type: string
  category: string
  amount: number
  description: string | null
  date: string
}

type Budget = {
  id: number
  category: string
  monthly_limit: number
}

type MonthlySpending = Record<string, Record<string, number>>

function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

function getPreviousMonth(): string {
  const now = new Date()
  now.setMonth(now.getMonth() - 1)
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

function getMonthlySpendingByCategory(transactions: Transaction[]): MonthlySpending {
  const spending: MonthlySpending = {}
  for (const t of transactions) {
    if (t.type !== "expense") continue
    const month = t.date.substring(0, 7)
    if (!spending[month]) spending[month] = {}
    if (!spending[month][t.category]) spending[month][t.category] = 0
    spending[month][t.category] += Number(t.amount)
  }
  return spending
}

export function generateSuggestions(
  transactions: Transaction[],
  budgets: Budget[]
): Suggestion[] {
  const suggestions: Suggestion[] = []
  const currentMonth = getCurrentMonth()
  const previousMonth = getPreviousMonth()
  const monthlySpending = getMonthlySpendingByCategory(transactions)
  const currentSpending = monthlySpending[currentMonth] || {}
  const previousSpending = monthlySpending[previousMonth] || {}

  const totalIncome = transactions
    .filter((t) => t.type === "income" && t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalExpenses = Object.values(currentSpending).reduce((sum, v) => sum + v, 0)

  // Rule 1: Budget exceeded
  for (const budget of budgets) {
    const spent = currentSpending[budget.category] || 0
    if (spent > Number(budget.monthly_limit)) {
      suggestions.push({
        type: "destructive",
        title: `${budget.category} over budget`,
        description: `You've spent \u20B9${Math.round(spent).toLocaleString("en-IN")} on ${budget.category} this month, exceeding your \u20B9${Math.round(Number(budget.monthly_limit)).toLocaleString("en-IN")} budget by \u20B9${Math.round(spent - Number(budget.monthly_limit)).toLocaleString("en-IN")}.`,
      })
    }
  }

  // Rule 2: Near budget (75-100%)
  for (const budget of budgets) {
    const spent = currentSpending[budget.category] || 0
    const ratio = spent / Number(budget.monthly_limit)
    if (ratio >= 0.75 && ratio <= 1.0) {
      suggestions.push({
        type: "warning",
        title: `${budget.category} nearing budget limit`,
        description: `You've used ${Math.round(ratio * 100)}% of your ${budget.category} budget (\u20B9${Math.round(spent).toLocaleString("en-IN")} of \u20B9${Math.round(Number(budget.monthly_limit)).toLocaleString("en-IN")}). Consider slowing down.`,
      })
    }
  }

  // Rule 3: High expense ratio
  if (totalIncome > 0 && totalExpenses / totalIncome > 0.8) {
    const ratio = Math.round((totalExpenses / totalIncome) * 100)
    suggestions.push({
      type: "warning",
      title: "High spending ratio",
      description: `You're spending ${ratio}% of your income this month. Try to keep expenses below 80% to build savings.`,
    })
  }

  // Rule 4: Spending spike vs previous month
  for (const category of Object.keys(currentSpending)) {
    const current = currentSpending[category]
    const previous = previousSpending[category]
    if (previous && previous > 0) {
      const increase = ((current - previous) / previous) * 100
      if (increase > 20) {
        suggestions.push({
          type: "info",
          title: `${category} spending increased`,
          description: `Your ${category} spending is up ${Math.round(increase)}% compared to last month (\u20B9${Math.round(previous).toLocaleString("en-IN")} to \u20B9${Math.round(current).toLocaleString("en-IN")}).`,
        })
      }
    }
  }

  // Rule 5: Positive savings encouragement
  if (totalIncome > 0 && totalIncome > totalExpenses) {
    const savings = totalIncome - totalExpenses
    suggestions.push({
      type: "success",
      title: "You're saving money!",
      description: `Great job! You have \u20B9${Math.round(savings).toLocaleString("en-IN")} in net savings this month. Consider setting aside some for an emergency fund.`,
    })
  }

  // Rule 6: Expense categories without budgets
  const budgetedCategories = new Set(budgets.map((b) => b.category))
  const unbugeted = Object.keys(currentSpending).filter(
    (c) => !budgetedCategories.has(c)
  )
  if (unbugeted.length > 0) {
    suggestions.push({
      type: "info",
      title: "Categories without budgets",
      description: `Consider setting budgets for: ${unbugeted.join(", ")}. This helps you track and control spending.`,
    })
  }

  return suggestions
}
