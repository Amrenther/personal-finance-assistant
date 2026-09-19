"use client"

import { useState, useTransition } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Plus, Pencil, Trash2, AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react"
import { setBudget, deleteBudget, type Budget, type CategoryBreakdown } from "@/app/actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

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

function BudgetProgress({ spent, limit, category }: { spent: number; limit: number; category: string }) {
  const ratio = limit > 0 ? spent / limit : 0
  const progressValue = Math.min(ratio * 100, 100)

  function getProgressColor(ratio: number) {
    if (ratio > 0.9) return "bg-red-500"
    if (ratio > 0.75) return "bg-amber-500"
    return "bg-emerald-500"
  }

  function getProgressGlow(ratio: number) {
    if (ratio > 0.9) return "glow-red"
    if (ratio > 0.75) return "glow-amber"
    return "glow-emerald"
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <span className="text-lg font-semibold tabular-nums text-foreground">
          {formatCurrency(spent)}
        </span>
        <span className="text-sm text-muted-foreground">of {formatCurrency(limit)}</span>
      </div>
      <div className="relative">
        <Progress value={progressValue} className="h-2.5" />
        <div
          className={`absolute inset-0 h-2.5 rounded-full transition-all duration-1000 ease-out ${getProgressColor(ratio)} ${getProgressGlow(ratio)}`}
          style={{ width: `${progressValue}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {ratio > 1
          ? `Over budget by ${formatCurrency(spent - limit)}`
          : `${formatCurrency(limit - spent)} remaining`}
      </p>
    </div>
  )
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

  return (
    <section id="budgets" className="scroll-mt-20 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
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
                <Label htmlFor="budget-limit">{"Monthly Limit (₹)"}</Label>
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
        <div className="glass-card flex flex-col items-center justify-center py-12 text-center">
          <CheckCircle2 className="mb-3 h-8 w-8 text-emerald-500" />
          <p className="text-sm text-muted-foreground">No budgets set yet.</p>
          <p className="text-xs text-muted-foreground">Add a budget to start tracking your spending limits.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => {
            const limit = Number(budget.monthly_limit)
            const spent = spendingMap.get(budget.category) || 0
            const ratio = limit > 0 ? spent / limit : 0
            const isOverBudget = ratio > 1
            const isNearBudget = ratio > 0.75 && ratio <= 1

            return (
              <div
                key={budget.id}
                className={`glass-card p-5 transition-all duration-300 ${
                  isOverBudget ? "border-red-500/30" : isNearBudget ? "border-amber-500/30" : ""
                } hover:scale-[1.02]`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{budget.category}</p>
                    <p className="text-xs text-muted-foreground">Monthly budget</p>
                  </div>
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
                </div>

                <BudgetProgress spent={spent} limit={limit} category={budget.category} />

                {/* Status badge */}
                <div className="mt-3 flex items-center gap-1.5">
                  {isOverBudget && (
                    <Badge variant="destructive" className="gap-1 h-5 px-2 text-[10px]">
                      <AlertCircle className="h-2.5 w-2.5" />
                      Over Budget
                    </Badge>
                  )}
                  {isNearBudget && !isOverBudget && (
                    <Badge variant="secondary" className="gap-1 h-5 px-2 text-[10px] border-amber-500/30 bg-amber-500/10 text-amber-300">
                      <AlertTriangle className="h-2.5 w-2.5" />
                      Near Limit
                    </Badge>
                  )}
                  {ratio <= 0.75 && (
                    <Badge variant="secondary" className="gap-1 h-5 px-2 text-[10px] border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      On Track
                    </Badge>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}