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
        description: `You've spent ₹${Math.round(spent).toLocaleString("en-IN")} on ${budget.category} this month, exceeding your ₹${Math.round(Number(budget.monthly_limit)).toLocaleString("en-IN")} budget by ₹${Math.round(spent - Number(budget.monthly_limit)).toLocaleString("en-IN")}.`,
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
        description: `You've used ${Math.round(ratio * 100)}% of your ${budget.category} budget (₹${Math.round(spent).toLocaleString("en-IN")} of ₹${Math.round(Number(budget.monthly_limit)).toLocaleString("en-IN")}). Consider slowing down.`,
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
          description: `Your ${category} spending is up ${Math.round(increase)}% compared to last month (₹${Math.round(previous).toLocaleString("en-IN")} to ₹${Math.round(current).toLocaleString("en-IN")}).`,
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
      description: `Great job! You have ₹${Math.round(savings).toLocaleString("en-IN")} in net savings this month. Consider setting aside some for an emergency fund.`,
    })
  }

  // Rule 6: Expense categories without budgets
  const budgetedCategories = new Set(budgets.map((b) => b.category))
  const unbudgeted = Object.keys(currentSpending).filter(
    (c) => !budgetedCategories.has(c)
  )
  if (unbudgeted.length > 0) {
    suggestions.push({
      type: "info",
      title: "Categories without budgets",
      description: `Consider setting budgets for: ${unbudgeted.join(", ")}. This helps you track and control spending.`,
    })
  }

  // Rule 7: Recurring expense detection
  const recurringTransactions = transactions.filter((t) => t.type === "expense" && t.date.startsWith(currentMonth))
  const recurringByCategory: Record<string, number> = {}
  for (const t of recurringTransactions) {
    recurringByCategory[t.category] = (recurringByCategory[t.category] || 0) + Number(t.amount)
  }
  const recurringTotal = Object.values(recurringByCategory).reduce((sum, v) => sum + v, 0)
  if (recurringTotal > 0 && totalExpenses > 0 && recurringTotal / totalExpenses > 0.5) {
    suggestions.push({
      type: "info",
      title: "High recurring expenses",
      description: `Recurring expenses make up ${Math.round((recurringTotal / totalExpenses) * 100)}% of your spending this month. Review subscriptions and recurring bills for potential savings.`,
    })
  }

  // Rule 8: Budget overspend alert by percentage (early warning)
  for (const budget of budgets) {
    const spent = currentSpending[budget.category] || 0
    const ratio = spent / Number(budget.monthly_limit)
    if (ratio > 0.9 && ratio <= 1.0) {
      suggestions.push({
        type: "warning",
        title: `${budget.category} almost at limit`,
        description: `You've used ${Math.round(ratio * 100)}% of your ${budget.category} budget. Only ₹${Math.round(Number(budget.monthly_limit) - spent).toLocaleString("en-IN")} remains this month.`,
      })
    }
  }

  // Rule 9: Savings rate calculation
  if (totalIncome > 0) {
    const savingsRate = (totalIncome - totalExpenses) / totalIncome
    if (savingsRate >= 0.3) {
      suggestions.push({
        type: "success",
        title: "Excellent savings rate",
        description: `You're saving ${Math.round(savingsRate * 100)}% of your income this month. Great financial discipline!`,
      })
    } else if (savingsRate < 0.1) {
      suggestions.push({
        type: "warning",
        title: "Low savings rate",
        description: `You're only saving ${Math.round(savingsRate * 100)}% of your income. Consider setting a goal to save at least 10% each month.`,
      })
    }
  }

  // Rule 10: Spending velocity (spending faster than last month)
  const currentDays = new Date().getDate()
  const currentMonthToDate = totalExpenses
  const previousMonthToDate = Object.values(previousSpending).reduce((sum, v) => sum + v, 0)
  if (previousMonthToDate > 0 && currentMonthToDate > previousMonthToDate * 1.15) {
    const increase = Math.round(((currentMonthToDate - previousMonthToDate) / previousMonthToDate) * 100)
    suggestions.push({
      type: "warning",
      title: "Spending faster than last month",
      description: `You're spending ${increase}% more than at this point last month. Consider reviewing your recent purchases to stay on track.`,
    })
  }

  // Rule 11: Top category comparison month-over-month
  const currentTopCategory = Object.entries(currentSpending).sort((a, b) => b[1] - a[1])[0]
  const previousTopCategory = Object.entries(previousSpending).sort((a, b) => b[1] - a[1])[0]
  if (currentTopCategory && previousTopCategory && currentTopCategory[0] === previousTopCategory[0]) {
    const change = ((currentTopCategory[1] - previousTopCategory[1]) / previousTopCategory[1]) * 100
    if (Math.abs(change) >= 15) {
      suggestions.push({
        type: change > 0 ? "info" : "success",
        title: `${currentTopCategory[0]} spending ${change > 0 ? "increased" : "decreased"}`,
        description: `Your ${currentTopCategory[0]} spending ${change > 0 ? "increased" : "decreased"} by ${Math.round(Math.abs(change))}% compared to last month.`,
      })
    }
  }

  // Rule 12: No income recorded
  if (totalIncome === 0 && totalExpenses > 0) {
    suggestions.push({
      type: "warning",
      title: "No income recorded",
      description: `You've recorded ₹${Math.round(totalExpenses).toLocaleString("en-IN")} in expenses this month but no income. Make sure to log all your income sources.`,
    })
  }

  return suggestions
}