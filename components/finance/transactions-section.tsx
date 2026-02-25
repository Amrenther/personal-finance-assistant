"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Trash2, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { addTransaction, deleteTransaction, type Transaction } from "@/app/actions"
import { toast } from "sonner"

const EXPENSE_CATEGORIES = [
  "Rent",
  "Groceries",
  "Transport",
  "Entertainment",
  "Education",
  "Utilities",
  "Dining Out",
  "Shopping",
  "Healthcare",
  "Other",
]

const INCOME_CATEGORIES = ["Salary", "Freelance", "Gifts", "Investments", "Other"]

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value)
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

type Props = {
  transactions: Transaction[]
}

export function TransactionsSection({ transactions: initialTransactions }: Props) {
  const [transactions, setTransactions] = useState(initialTransactions)
  const [typeFilter, setTypeFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Form state
  const [formType, setFormType] = useState<"income" | "expense">("expense")
  const [formCategory, setFormCategory] = useState("")
  const [formAmount, setFormAmount] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0])

  const categories = formType === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  const filteredTransactions = transactions.filter((t) => {
    if (typeFilter !== "all" && t.type !== typeFilter) return false
    if (categoryFilter !== "all" && t.category !== categoryFilter) return false
    return true
  })

  const allCategories = Array.from(new Set(transactions.map((t) => t.category))).sort()

  function handleSubmit() {
    if (!formCategory || !formAmount || Number(formAmount) <= 0) {
      toast.error("Please fill in all required fields with valid values.")
      return
    }

    startTransition(async () => {
      try {
        await addTransaction({
          type: formType,
          category: formCategory,
          amount: Number(formAmount),
          description: formDescription,
          date: formDate,
        })
        toast.success("Transaction added successfully!")
        setDialogOpen(false)
        setFormCategory("")
        setFormAmount("")
        setFormDescription("")
        setFormDate(new Date().toISOString().split("T")[0])
        // Optimistically update
        const newTxn: Transaction = {
          id: Date.now(),
          type: formType,
          category: formCategory,
          amount: formAmount,
          description: formDescription,
          date: formDate,
          created_at: new Date().toISOString(),
        }
        setTransactions((prev) => [newTxn, ...prev])
      } catch {
        toast.error("Failed to add transaction. Please try again.")
      }
    })
  }

  function handleDelete(id: number) {
    startTransition(async () => {
      try {
        await deleteTransaction(id)
        setTransactions((prev) => prev.filter((t) => t.id !== id))
        toast.success("Transaction deleted.")
      } catch {
        toast.error("Failed to delete transaction.")
      }
    })
  }

  return (
    <section id="transactions" className="scroll-mt-20">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Transactions</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Transaction</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="flex gap-2">
                <Button
                  variant={formType === "expense" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => { setFormType("expense"); setFormCategory("") }}
                >
                  Expense
                </Button>
                <Button
                  variant={formType === "income" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => { setFormType("income"); setFormCategory("") }}
                >
                  Income
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">{"Amount (\u20B9)"}</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What was this for?"
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={isPending}
              >
                {isPending ? "Adding..." : "Add Transaction"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border border-border">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle className="text-base font-medium text-foreground">All Transactions</CardTitle>
            <div className="ml-auto flex items-center gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-8 w-[120px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-8 w-[140px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {allCategories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="pr-6 text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell className="pl-6 text-sm text-muted-foreground">
                        {formatDate(txn.date)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {txn.type === "income" ? (
                            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
                          )}
                          <Badge
                            variant={txn.type === "income" ? "secondary" : "outline"}
                            className="text-xs capitalize"
                          >
                            {txn.type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-foreground">{txn.category}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                        {txn.description || "-"}
                      </TableCell>
                      <TableCell
                        className={`text-right text-sm font-medium tabular-nums ${
                          txn.type === "income" ? "text-emerald-600" : "text-red-500"
                        }`}
                      >
                        {txn.type === "income" ? "+" : "-"}
                        {formatCurrency(Number(txn.amount))}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500"
                          onClick={() => handleDelete(txn.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Delete transaction</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
