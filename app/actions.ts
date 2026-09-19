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
  is_recurring?: boolean
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

export type Goal = {
  id: number
  name: string
  target_amount: string
  current_amount: string
  deadline: string | null
  icon: string
  created_at: string
}

export type Bill = {
  id: number
  name: string
  amount: string
  due_date: string
  is_paid: boolean
  category: string | null
  is_recurring: boolean
  created_at: string
}

export type NetWorthEntry = {
  id: number
  entry_date: string
  assets: string
  liabilities: string
  notes: string | null
  created_at: string
}

// ─── Transactions ───────────────────────────────────────

// Helper to normalize Neon DATE columns (returned as Date objects) to YYYY-MM-DD strings
function normDate(d: unknown): string {
  if (!d) return ""
  if (typeof d === "string") return d.split("T")[0]
  if (d instanceof Date) return d.toISOString().split("T")[0]
  return String(d).split("T")[0]
}

export async function getTransactions(): Promise<Transaction[]> {
  const rows = await sql`SELECT * FROM transactions ORDER BY date DESC, created_at DESC`
  return rows.map((t) => ({ ...t, date: normDate(t.date) }) as unknown as Transaction)
}

export async function addTransaction(data: {
  type: string
  category: string
  amount: number
  description: string
  date: string
  is_recurring?: boolean
}) {
  await sql`
    INSERT INTO transactions (type, category, amount, description, date, is_recurring)
    VALUES (${data.type}, ${data.category}, ${data.amount}, ${data.description}, ${data.date}, ${data.is_recurring ?? false})
  `
  revalidatePath("/")
}

export async function deleteTransaction(id: number) {
  await sql`DELETE FROM transactions WHERE id = ${id}`
  revalidatePath("/")
}

// ─── Monthly Stats ───────────────────────────────────────

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
  return rows.map((r) => ({ category: r.category as string, total: Number(r.total) }))
}

// ─── Budgets ────────────────────────────────────────────

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

// ─── Suggestions ────────────────────────────────────────

export async function getSuggestions(): Promise<Suggestion[]> {
  const transactions = await sql`SELECT * FROM transactions ORDER BY date DESC`
  const budgets = await sql`SELECT * FROM budgets`

  const txns = transactions.map((t) => ({
    id: Number(t.id),
    type: t.type as string,
    category: t.category as string,
    amount: Number(t.amount),
    description: t.description as string | null,
    date: normDate(t.date),
  }))

  const bdgs = budgets.map((b) => ({
    id: Number(b.id),
    category: b.category as string,
    monthly_limit: Number(b.monthly_limit),
  }))

  return generateSuggestions(txns, bdgs)
}

// ─── Dashboard Summary ─────────────────────────────────

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
    totalIncome:       Number(totals[0]?.total_income || 0),
    totalExpenses:     Number(totals[0]?.total_expenses || 0),
    netBalance:        Number(totals[0]?.total_income || 0) - Number(totals[0]?.total_expenses || 0),
    monthExpenses:     Number(monthTotals[0]?.month_expenses || 0),
    monthIncome:       Number(monthTotals[0]?.month_income || 0),
    recentTransactions: recentTxns.map((t) => ({ ...t, date: normDate(t.date) }) as unknown as Transaction),
  }
}

// ─── Goals ──────────────────────────────────────────────

export async function getGoals(): Promise<Goal[]> {
  try {
    const rows = await sql`SELECT * FROM goals ORDER BY created_at DESC`
    return rows.map((g) => ({ ...g, deadline: g.deadline ? normDate(g.deadline) : null }) as unknown as Goal)
  } catch { return [] }
}

export async function addGoal(data: {
  name: string
  target_amount: number
  current_amount: number
  deadline?: string | null
  icon?: string
}): Promise<Goal> {
  const rows = await sql`
    INSERT INTO goals (name, target_amount, current_amount, deadline, icon)
    VALUES (${data.name}, ${data.target_amount}, ${data.current_amount}, ${data.deadline ?? null}, ${data.icon ?? "target"})
    RETURNING *
  `
  revalidatePath("/")
  return rows[0] as Goal
}

export async function updateGoalAmount(id: number, current_amount: number) {
  await sql`UPDATE goals SET current_amount = ${current_amount} WHERE id = ${id}`
  revalidatePath("/")
}

export async function deleteGoal(id: number) {
  await sql`DELETE FROM goals WHERE id = ${id}`
  revalidatePath("/")
}

// ─── Bills ──────────────────────────────────────────────

export async function getBills(): Promise<Bill[]> {
  try {
    const rows = await sql`SELECT * FROM bills ORDER BY due_date ASC`
    return rows.map((b) => ({ ...b, due_date: normDate(b.due_date) }) as unknown as Bill)
  } catch { return [] }
}

export async function addBill(data: {
  name: string
  amount: number
  due_date: string
  category?: string | null
  is_recurring?: boolean
}): Promise<Bill> {
  const rows = await sql`
    INSERT INTO bills (name, amount, due_date, category, is_recurring)
    VALUES (${data.name}, ${data.amount}, ${data.due_date}, ${data.category ?? null}, ${data.is_recurring ?? false})
    RETURNING *
  `
  revalidatePath("/")
  return rows[0] as Bill
}

export async function markBillPaid(id: number, isPaid: boolean) {
  await sql`UPDATE bills SET is_paid = ${isPaid} WHERE id = ${id}`
  revalidatePath("/")
}

export async function deleteBill(id: number) {
  await sql`DELETE FROM bills WHERE id = ${id}`
  revalidatePath("/")
}

// ─── Net Worth ───────────────────────────────────────────

export async function getNetWorthEntries(): Promise<NetWorthEntry[]> {
  try {
    const rows = await sql`SELECT * FROM net_worth_entries ORDER BY entry_date ASC`
    return rows.map((r) => ({ ...r, entry_date: normDate(r.entry_date) }) as unknown as NetWorthEntry)
  } catch { return [] }
}

export async function upsertNetWorthEntry(data: {
  entry_date: string
  assets: number
  liabilities: number
  notes?: string | null
}) {
  await sql`
    INSERT INTO net_worth_entries (entry_date, assets, liabilities, notes)
    VALUES (${data.entry_date}, ${data.assets}, ${data.liabilities}, ${data.notes ?? null})
    ON CONFLICT (entry_date) DO UPDATE
      SET assets = ${data.assets}, liabilities = ${data.liabilities}, notes = ${data.notes ?? null}
  `
  revalidatePath("/")
}

export async function deleteNetWorthEntry(id: number) {
  await sql`DELETE FROM net_worth_entries WHERE id = ${id}`
  revalidatePath("/")
}
