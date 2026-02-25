"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
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
import { Plus, Pencil, Trash2 } from "lucide-react"
import { setBudget, deleteBudget, type Budget, type CategoryBreakdown } from "@/app/actions"
import { toast } from "sonner"

const ALL_CATEGORIES = [
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value)
}

type Props = {
  budgets: Budget[]
  categoryBreakdown: CategoryBreakdown[]
}

export function BudgetsSection({ budgets: initialBudgets, categoryBreakdown }: Props) {
  const [budgets, setBudgets] = useState(initialBudgets)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [formCategory, setFormCategory] = useState("")
  const [formLimit, setFormLimit] = useState("")
  const [isPending, startTransition] = useTransition()

  const spendingMap = new Map(categoryBreakdown.map((c) => [c.category, c.total]))
  const budgetedCategories = new Set(budgets.map((b) => b.category))
  const availableCategories = ALL_CATEGORIES.filter((c) => !budgetedCategories.has(c))

  function openEditDialog(budget: Budget) {
    setEditingBudget(budget)
    setFormCategory(budget.category)
    setFormLimit(String(budget.monthly_limit))
    setDialogOpen(true)
  }

  function openAddDialog() {
    setEditingBudget(null)
    setFormCategory("")
    setFormLimit("")
    setDialogOpen(true)
  }

  function handleSubmit() {
    const category = editingBudget ? editingBudget.category : formCategory
    if (!category || !formLimit || Number(formLimit) <= 0) {
      toast.error("Please provide a valid category and limit.")
      return
    }

    startTransition(async () => {
      try {
        await setBudget(category, Number(formLimit))
        toast.success(editingBudget ? "Budget updated!" : "Budget added!")
        setDialogOpen(false)

        if (editingBudget) {
          setBudgets((prev) =>
            prev.map((b) =>
              b.id === editingBudget.id ? { ...b, monthly_limit: formLimit } : b
            )
          )
        } else {
          setBudgets((prev) => [
            ...prev,
            {
              id: Date.now(),
              category,
              monthly_limit: formLimit,
              created_at: new Date().toISOString(),
            },
          ])
        }
      } catch {
        toast.error("Failed to save budget.")
      }
    })
  }

  function handleDelete(budget: Budget) {
    startTransition(async () => {
      try {
        await deleteBudget(budget.id)
        setBudgets((prev) => prev.filter((b) => b.id !== budget.id))
        toast.success("Budget deleted.")
      } catch {
        toast.error("Failed to delete budget.")
      }
    })
  }

  function getProgressColor(ratio: number) {
    if (ratio > 0.9) return "bg-red-500"
    if (ratio > 0.75) return "bg-amber-500"
    return "bg-emerald-500"
  }

  return (
    <section id="budgets" className="scroll-mt-20">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Budgets</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5" onClick={openAddDialog}>
              <Plus className="h-4 w-4" />
              Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>{editingBudget ? "Edit Budget" : "Add Budget"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              {editingBudget ? (
                <div className="space-y-2">
                  <Label>Category</Label>
                  <p className="text-sm font-medium text-foreground">{editingBudget.category}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="budget-category">Category</Label>
                  <Select value={formCategory} onValueChange={setFormCategory}>
                    <SelectTrigger id="budget-category" className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCategories.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="budget-limit">{"Monthly Limit (\u20B9)"}</Label>
                <Input
                  id="budget-limit"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={formLimit}
                  onChange={(e) => setFormLimit(e.target.value)}
                />
              </div>
              <Button className="w-full" onClick={handleSubmit} disabled={isPending}>
                {isPending ? "Saving..." : editingBudget ? "Update Budget" : "Add Budget"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {budgets.length === 0 ? (
        <Card className="border border-border">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">No budgets set yet. Add one to start tracking!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {budgets.map((budget) => {
            const limit = Number(budget.monthly_limit)
            const spent = spendingMap.get(budget.category) || 0
            const ratio = limit > 0 ? spent / limit : 0
            const progressValue = Math.min(ratio * 100, 100)

            return (
              <Card key={budget.id} className="border border-border">
                <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">
                    {budget.category}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground"
                      onClick={() => openEditDialog(budget)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span className="sr-only">Edit budget</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500"
                      onClick={() => handleDelete(budget)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only">Delete budget</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-semibold tabular-nums text-foreground">
                      {formatCurrency(spent)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      of {formatCurrency(limit)}
                    </span>
                  </div>
                  <div className="relative">
                    <Progress value={progressValue} className="h-2.5" />
                    <div
                      className={`absolute inset-0 h-2.5 rounded-full ${getProgressColor(ratio)} transition-all`}
                      style={{ width: `${progressValue}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {ratio > 1
                      ? `Over budget by ${formatCurrency(spent - limit)}`
                      : `${formatCurrency(limit - spent)} remaining`}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </section>
  )
}
