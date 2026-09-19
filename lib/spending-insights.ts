type Transaction = {
  type: string
  category: string
  amount: number
  date: string
}

export type SpendingInsight = {
  emoji: string
  text: string
  type: "positive" | "warning" | "neutral"
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

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n)
}

export function generateSpendingInsights(transactions: Transaction[]): SpendingInsight[] {
  const currentMonth = getCurrentMonth()
  const previousMonth = getPreviousMonth()
  const insights: SpendingInsight[] = []

  const currentExpenses = transactions.filter(
    (t) => t.type === "expense" && t.date.startsWith(currentMonth)
  )
  const prevExpenses = transactions.filter(
    (t) => t.type === "expense" && t.date.startsWith(previousMonth)
  )
  const currentIncome = transactions
    .filter((t) => t.type === "income" && t.date.startsWith(currentMonth))
    .reduce((s, t) => s + t.amount, 0)

  const totalCurrent = currentExpenses.reduce((s, t) => s + t.amount, 0)
  const totalPrev = prevExpenses.reduce((s, t) => s + t.amount, 0)

  // Spending by category this month
  const byCategory: Record<string, number> = {}
  currentExpenses.forEach((t) => {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount
  })

  const prevByCategory: Record<string, number> = {}
  prevExpenses.forEach((t) => {
    prevByCategory[t.category] = (prevByCategory[t.category] || 0) + t.amount
  })

  // Insight 1: Overall spend change
  if (totalPrev > 0 && totalCurrent > 0) {
    const pct = Math.round(((totalCurrent - totalPrev) / totalPrev) * 100)
    if (pct > 10) {
      insights.push({
        emoji: "📈",
        text: `You spent ${pct}% more overall this month (${formatINR(totalCurrent)}) compared to last month (${formatINR(totalPrev)}).`,
        type: "warning",
      })
    } else if (pct < -10) {
      insights.push({
        emoji: "📉",
        text: `Great! You spent ${Math.abs(pct)}% less this month (${formatINR(totalCurrent)}) vs last month (${formatINR(totalPrev)}).`,
        type: "positive",
      })
    } else {
      insights.push({
        emoji: "📊",
        text: `Your spending is consistent this month (${formatINR(totalCurrent)}), similar to last month (${formatINR(totalPrev)}).`,
        type: "neutral",
      })
    }
  }

  // Insight 2: Top spending category this month
  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]
  if (topCategory) {
    const pctOfTotal = totalCurrent > 0 ? Math.round((topCategory[1] / totalCurrent) * 100) : 0
    insights.push({
      emoji: "🏆",
      text: `Your biggest expense this month is ${topCategory[0]} at ${formatINR(topCategory[1])} (${pctOfTotal}% of total spending).`,
      type: pctOfTotal > 40 ? "warning" : "neutral",
    })
  }

  // Insight 3: Savings rate
  if (currentIncome > 0) {
    const savings = currentIncome - totalCurrent
    const rate = Math.round((savings / currentIncome) * 100)
    if (savings > 0) {
      insights.push({
        emoji: "💰",
        text: `You're saving ${formatINR(savings)} this month — a ${rate}% savings rate. ${rate >= 20 ? "Excellent!" : "Try to aim for 20% or more."}`,
        type: rate >= 20 ? "positive" : "neutral",
      })
    } else {
      insights.push({
        emoji: "⚠️",
        text: `You're spending more than you earn this month by ${formatINR(Math.abs(savings))}. Time to cut back!`,
        type: "warning",
      })
    }
  }

  // Insight 4: Category spikes
  for (const [cat, amount] of Object.entries(byCategory)) {
    const prev = prevByCategory[cat] || 0
    if (prev > 0) {
      const pct = Math.round(((amount - prev) / prev) * 100)
      if (pct >= 30) {
        insights.push({
          emoji: "🔺",
          text: `${cat} spending jumped ${pct}% this month (${formatINR(amount)} vs ${formatINR(prev)} last month).`,
          type: "warning",
        })
        break // Only show one spike for conciseness
      }
    }
  }

  // Insight 5: Positive — category reduction
  for (const [cat, prev] of Object.entries(prevByCategory)) {
    const current = byCategory[cat] || 0
    if (prev > 0 && current < prev * 0.7) {
      insights.push({
        emoji: "✅",
        text: `Nice! You reduced ${cat} spending by ${Math.round(((prev - current) / prev) * 100)}% this month (${formatINR(prev)} → ${formatINR(current)}).`,
        type: "positive",
      })
      break // Only show one
    }
  }

  return insights.slice(0, 5)
}
