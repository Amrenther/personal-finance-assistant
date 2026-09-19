"use client"

import { useState, useTransition } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar as CalendarIcon, Plus, CheckCircle2, Trash2, Edit } from "lucide-react"
import { getGoals, addGoal, updateGoalAmount, deleteGoal, type Goal } from "@/app/actions"
import { toast } from "sonner"
import { format, parseISO, isBefore, startOfDay } from "date-fns"
import { cn } from "@/lib/utils"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value)
}

function ProgressRing({ value, percentage }: { value: number; percentage: number }) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  // strokeDasharray = full circumference (constant)
  // strokeDashoffset = how much to hide (0 = full circle, circumference = nothing)
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference
  const color = value >= 100 ? "#10b981" : percentage > 50 ? "#f59e0b" : "#7c3aed"

  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      <svg className="absolute inset-0 h-24 w-24" style={{ transform: "rotate(-90deg)" }} viewBox="0 0 100 100">
        {/* Background track */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="8"
        />
        {/* Progress arc */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 1s ease-out", filter: `drop-shadow(0 0 6px ${color}88)` }}
        />
      </svg>
      {/* Center label */}
      <span className="relative text-sm font-bold" style={{ color }}>
        {Math.min(percentage, 100).toFixed(0)}%
      </span>
    </div>
  )
}

type Props = {
  goals: Goal[]
}

export function GoalsSection({ goals: initialGoals }: Props) {
  const [goals, setGoals] = useState(initialGoals)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [isPending, startTransition] = useTransition()

  // Form state
  const [formName, setFormName] = useState("")
  const [formTargetAmount, setFormTargetAmount] = useState("")
  const [formCurrentAmount, setFormCurrentAmount] = useState("0")
  const [formDeadline, setFormDeadline] = useState("")

  function openAddDialog() {
    setEditingGoal(null)
    setFormName("")
    setFormTargetAmount("")
    setFormCurrentAmount("0")
    setFormDeadline("")
    setDialogOpen(true)
  }

  function openEditDialog(goal: Goal) {
    setEditingGoal(goal)
    setFormName(goal.name)
    setFormTargetAmount(String(goal.target_amount))
    setFormCurrentAmount(String(goal.current_amount))
    setFormDeadline(goal.deadline ? goal.deadline.split("T")[0] : "")
    setDialogOpen(true)
  }

  function handleSubmit() {
    if (!formName || !formTargetAmount || Number(formTargetAmount) <= 0) {
      toast.error("Please provide a valid goal name and target amount.")
      return
    }

    startTransition(async () => {
      try {
        if (editingGoal) {
          await updateGoalAmount(editingGoal.id, Number(formCurrentAmount))
          setGoals((prev) =>
            prev.map((g) =>
              g.id === editingGoal.id
                ? { ...g, name: formName, target_amount: formTargetAmount, current_amount: formCurrentAmount, deadline: formDeadline || null }
                : g
            )
          )
          toast.success("Goal updated!")
        } else {
          const result = await addGoal({
            name: formName,
            target_amount: Number(formTargetAmount),
            current_amount: Number(formCurrentAmount) || 0,
            deadline: formDeadline || null,
          })
          if ("id" in result) {
            const newGoal = result as Goal
            setGoals((prev) => [...prev, newGoal])
          }
          toast.success("Goal added!")
        }
        setDialogOpen(false)
      } catch {
        toast.error("Failed to save goal.")
      }
    })
  }

  function handleDelete(id: number) {
    startTransition(async () => {
      try {
        await deleteGoal(id)
        setGoals((prev) => prev.filter((g) => g.id !== id))
        toast.success("Goal deleted.")
      } catch {
        toast.error("Failed to delete goal.")
      }
    })
  }

  function handleUpdateProgress(goalId: number) {
    const goal = goals.find((g) => g.id === goalId)
    if (!goal) return

    const newAmount = prompt("Enter current amount:", String(goal.current_amount))
    if (newAmount === null) return

    const amount = Number(newAmount)
    if (isNaN(amount) || amount < 0) {
      toast.error("Please enter a valid amount.")
      return
    }

    startTransition(async () => {
      try {
        await updateGoalAmount(goalId, amount)
        setGoals((prev) => prev.map((g) => g.id === goalId ? { ...g, current_amount: String(amount) } : g))
        toast.success("Goal progress updated!")
      } catch {
        toast.error("Failed to update goal.")
      }
    })
  }

  function getDaysUntilDeadline(deadline: string | null): number | null {
    if (!deadline) return null
    const target = parseISO(deadline)
    const now = startOfDay(new Date())
    if (isBefore(target, now)) return 0
    const diff = target.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const activeGoals = goals.filter((g) => Number(g.current_amount) < Number(g.target_amount))
  const completedGoals = goals.filter((g) => Number(g.current_amount) >= Number(g.target_amount))

  return (
    <section id="goals" className="scroll-mt-20 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Goals</h2>
          <p className="text-sm text-muted-foreground">
            Track your savings goals and progress
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5" onClick={openAddDialog}>
              <Plus className="h-4 w-4" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingGoal ? "Edit Goal" : "Add Goal"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="goal-name">Goal Name</Label>
                <Input
                  id="goal-name"
                  placeholder="e.g., Vacation, New Phone, Emergency Fund"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-amount">Target Amount (₹)</Label>
                <Input
                  id="target-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formTargetAmount}
                  onChange={(e) => setFormTargetAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="current-amount">Current Amount (₹)</Label>
                <Input
                  id="current-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formCurrentAmount}
                  onChange={(e) => setFormCurrentAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formDeadline}
                  onChange={(e) => setFormDeadline(e.target.value)}
                />
              </div>
              <Button className="w-full" onClick={handleSubmit} disabled={isPending}>
                {isPending ? "Saving..." : editingGoal ? "Update Goal" : "Add Goal"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Goal Summary Stats */}
      <div className="glass-card p-4 mb-6 flex items-center gap-6">
        <div>
          <p className="text-xs text-muted-foreground">Total Goals</p>
          <p className="text-xl font-bold text-foreground">{goals.length}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Completed</p>
          <p className="text-xl font-bold text-emerald-400">{completedGoals.length}</p>
        </div>
        {goals.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground">Total Saved</p>
            <p className="text-xl font-bold text-foreground">
              {formatCurrency(goals.reduce((s, g) => s + Number(g.current_amount), 0))}
            </p>
          </div>
        )}
      </div>

      {/* Active Goals Grid */}
      {activeGoals.length === 0 && completedGoals.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">No goals set yet. Add a goal to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Active Goals */}
          {activeGoals.map((goal) => {
            const target = Number(goal.target_amount)
            const current = Number(goal.current_amount)
            const percentage = target > 0 ? Math.min(100, (current / target) * 100) : 0
            const daysLeft = getDaysUntilDeadline(goal.deadline)

            return (
              <div key={goal.id} className="glass-card p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-foreground">{goal.name}</h3>
                    {daysLeft !== null && (
                      <p className="text-xs text-muted-foreground">
                        {daysLeft === 0 ? "Overdue!" : `${daysLeft} days left`}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground"
                      onClick={() => handleUpdateProgress(goal.id)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                      <span className="sr-only">Update progress</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500"
                      onClick={() => handleDelete(goal.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only">Delete goal</span>
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-center mb-4">
                  <ProgressRing value={current} percentage={percentage} />
                </div>

                <div className="text-center space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(current)} of {formatCurrency(target)}
                  </p>
                  <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        background: percentage >= 100 ? "#10b981" : percentage > 50 ? "#f59e0b" : "#7c3aed",
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })}

          {/* Completed Goals */}
          {completedGoals.map((goal) => (
            <div
              key={goal.id}
              className="glass-card p-5 border-emerald-500/30"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-medium text-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    {goal.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500"
                  onClick={() => handleDelete(goal.id)}
                  disabled={isPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="sr-only">Delete goal</span>
                </Button>
              </div>

              <div className="text-center py-2">
                <p className="text-sm font-medium text-foreground">
                  {formatCurrency(Number(goal.target_amount))} saved!
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}