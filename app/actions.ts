"use server"

import sql from "@/lib/db"
import { generateSuggestions, type Suggestion } from "@/lib/suggestions"
import { revalidatePath } from "next/cache"

export type Transaction = {
  id: number
  type: string
  category: string
  amount: string
  description: string | null
  date: string
  created_at: string
}

export type Budget = {
  id: number
  category: string
  monthly_limit: string
  created_at: string
}

export type MonthlyStats = {
  month: string
  income: number
  expenses: number
}

export type CategoryBreakdown = {
  category: string
  total: number
}

export async function getTransactions(): Promise<Transaction[]> {
  const rows = await sql`SELECT * FROM transactions ORDER BY date DESC, created_at DESC`
  return rows as Transaction[]
}

export async function addTransaction(data: {
  type: string
  category: string
  amount: number
  description: string
  date: string
}) {
  await sql`
    INSERT INTO transactions (type, category, amount, description, date)
    VALUES (${data.type}, ${data.category}, ${data.amount}, ${data.description}, ${data.date})
  `
  revalidatePath("/")
}

export async function deleteTransaction(id: number) {
  await sql`DELETE FROM transactions WHERE id = ${id}`
  revalidatePath("/")
}

export async function getMonthlyStats(): Promise<MonthlyStats[]> {
  const rows = await sql`
    SELECT
      TO_CHAR(date, 'YYYY-MM') as month,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
    FROM transactions
    GROUP BY TO_CHAR(date, 'YYYY-MM')
    ORDER BY month ASC
  `
  return rows.map((r) => ({
    month: r.month as string,
    income: Number(r.income),
    expenses: Number(r.expenses),
  }))
}

export async function getCategoryBreakdown(): Promise<CategoryBreakdown[]> {
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  const rows = await sql`
    SELECT category, SUM(amount) as total
    FROM transactions
    WHERE type = 'expense' AND TO_CHAR(date, 'YYYY-MM') = ${currentMonth}
    GROUP BY category
    ORDER BY total DESC
  `
  return rows.map((r) => ({
    category: r.category as string,
    total: Number(r.total),
  }))
}

export async function getBudgets(): Promise<Budget[]> {
  const rows = await sql`SELECT * FROM budgets ORDER BY category ASC`
  return rows as Budget[]
}

export async function setBudget(category: string, monthlyLimit: number) {
  await sql`
    INSERT INTO budgets (category, monthly_limit)
    VALUES (${category}, ${monthlyLimit})
    ON CONFLICT (category) DO UPDATE SET monthly_limit = ${monthlyLimit}
  `
  revalidatePath("/")
}

export async function deleteBudget(id: number) {
  await sql`DELETE FROM budgets WHERE id = ${id}`
  revalidatePath("/")
}

export async function getSuggestions(): Promise<Suggestion[]> {
  const transactions = await sql`SELECT * FROM transactions ORDER BY date DESC`
  const budgets = await sql`SELECT * FROM budgets`

  const txns = transactions.map((t) => ({
    id: Number(t.id),
    type: t.type as string,
    category: t.category as string,
    amount: Number(t.amount),
    description: t.description as string | null,
    date: typeof t.date === "string" ? t.date : new Date(t.date as string).toISOString().split("T")[0],
  }))

  const bdgs = budgets.map((b) => ({
    id: Number(b.id),
    category: b.category as string,
    monthly_limit: Number(b.monthly_limit),
  }))

  return generateSuggestions(txns, bdgs)
}

export async function getDashboardSummary() {
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`

  const totals = await sql`
    SELECT
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses
    FROM transactions
  `

  const monthTotals = await sql`
    SELECT
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as month_expenses,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as month_income
    FROM transactions
    WHERE TO_CHAR(date, 'YYYY-MM') = ${currentMonth}
  `

  const recentTxns = await sql`
    SELECT * FROM transactions ORDER BY date DESC, created_at DESC LIMIT 5
  `

  return {
    totalIncome: Number(totals[0]?.total_income || 0),
    totalExpenses: Number(totals[0]?.total_expenses || 0),
    netBalance: Number(totals[0]?.total_income || 0) - Number(totals[0]?.total_expenses || 0),
    monthExpenses: Number(monthTotals[0]?.month_expenses || 0),
    monthIncome: Number(monthTotals[0]?.month_income || 0),
    recentTransactions: recentTxns as Transaction[],
  }
}
