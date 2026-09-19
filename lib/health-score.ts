export type HealthScore = {
  score: number          // 0-100
  grade: "A" | "B" | "C" | "D" | "F"
  color: string
  label: string
  savingsRate: number    // 0-1
  budgetAdherence: number // 0-1
  stability: number      // 0-1
  insights: string[]
}

type Transaction = {
  type: string
  category: string
  amount: number
  date: string
}

type Budget = {
  category: string
  monthly_limit: number
}

function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

function getPreviousMonth(): string {
  const now = new Date()
  now.setMonth(now.getMonth() - 1)
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

export function calculateHealthScore(
  transactions: Transaction[],
  budgets: Budget[]
): HealthScore {
  const currentMonth = getCurrentMonth()
  const previousMonth = getPreviousMonth()

  const currentTxns = transactions.filter((t) => t.date.startsWith(currentMonth))
  const prevTxns = transactions.filter((t) => t.date.startsWith(previousMonth))

  const currentIncome = currentTxns
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0)

  const currentExpenses = currentTxns
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0)

  const prevExpenses = prevTxns
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0)

  // --- Component 1: Savings Rate (40 pts) ---
  // Best: saving ≥30% of income. Zero income = neutral 20pts.
  let savingsRate = 0
  let savingsScore = 20
  if (currentIncome > 0) {
    savingsRate = Math.max(0, (currentIncome - currentExpenses) / currentIncome)
    savingsScore = Math.min(40, Math.round(savingsRate * 133)) // 30% savings → 40pts
  }

  // --- Component 2: Budget Adherence (30 pts) ---
  // For each budget, check if within limit. Average ratio across budgets.
  let budgetAdherence = 1
  let budgetScore = 30
  if (budgets.length > 0) {
    const spendingByCategory: Record<string, number> = {}
    currentTxns
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + t.amount
      })

    const ratios = budgets.map((b) => {
      const spent = spendingByCategory[b.category] || 0
      return Math.min(1, spent / (b.monthly_limit || 1))
    })

    budgetAdherence = 1 - ratios.reduce((s, r) => s + r, 0) / ratios.length
    budgetScore = Math.max(0, Math.round(budgetAdherence * 30))
  }

  // --- Component 3: Spending Stability (30 pts) ---
  // Compare this month vs previous month. High volatility = lower score.
  let stability = 1
  let stabilityScore = 30
  if (prevExpenses > 0 && currentExpenses > 0) {
    const change = Math.abs(currentExpenses - prevExpenses) / prevExpenses
    stability = Math.max(0, 1 - change)
    stabilityScore = Math.max(0, Math.round(stability * 30))
  }

  const score = savingsScore + budgetScore + stabilityScore

  // Grade
  const grade: HealthScore["grade"] =
    score >= 85 ? "A" :
    score >= 70 ? "B" :
    score >= 55 ? "C" :
    score >= 40 ? "D" : "F"

  const color =
    score >= 85 ? "#10b981" :
    score >= 70 ? "#6ee7b7" :
    score >= 55 ? "#f59e0b" :
    score >= 40 ? "#f97316" : "#ef4444"

  const label =
    score >= 85 ? "Excellent" :
    score >= 70 ? "Good" :
    score >= 55 ? "Fair" :
    score >= 40 ? "Needs Work" : "Critical"

  // Insights
  const insights: string[] = []
  if (savingsRate < 0.1 && currentIncome > 0) {
    insights.push("Try to save at least 10% of your monthly income.")
  }
  if (savingsRate >= 0.2) {
    insights.push(`You're saving ${Math.round(savingsRate * 100)}% of income — great discipline!`)
  }
  if (budgetAdherence < 0.5 && budgets.length > 0) {
    insights.push("Several budgets are at risk. Review your spending limits.")
  }
  if (stability < 0.5 && prevExpenses > 0) {
    insights.push("Your spending is volatile. Consistent spending habits improve stability.")
  }

  return { score, grade, color, label, savingsRate, budgetAdherence, stability, insights }
}
