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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, CheckCircle2, Clock, AlertCircle, Calendar as CalendarIcon } from "lucide-react"
import { getBills, addBill, markBillPaid, deleteBill, type Bill } from "@/app/actions"
import { toast } from "sonner"
import { format, parseISO, isBefore, startOfDay } from "date-fns"
import { cn } from "@/lib/utils"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value)
}

function formatDate(dateStr: string) {
  const date = parseISO(dateStr)
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

type Props = {
  bills: Bill[]
}

export function BillsSection({ bills: initialBills }: Props) {
  const [bills, setBills] = useState(initialBills)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Form state
  const [formName, setFormName] = useState("")
  const [formAmount, setFormAmount] = useState("")
  const [formDueDate, setFormDueDate] = useState("")
  const [formCategory, setFormCategory] = useState("")
  const [formRecurring, setFormRecurring] = useState(false)

  const BILL_CATEGORIES = ["Rent", "Utilities", "Internet", "Insurance", "Loan", "Subscription", "Other"]

  function openAddDialog() {
    setFormName("")
    setFormAmount("")
    setFormDueDate("")
    setFormCategory("")
    setFormRecurring(false)
    setDialogOpen(true)
  }

  function handleSubmit() {
    if (!formName || !formAmount || Number(formAmount) <= 0 || !formDueDate) {
      toast.error("Please fill in all required fields.")
      return
    }

    startTransition(async () => {
      try {
        const result = await addBill({
          name: formName,
          amount: Number(formAmount),
          due_date: formDueDate,
          category: formCategory || null,
          is_recurring: formRecurring,
        })
        if ("id" in result) {
          const newBill = result as Bill
          setBills((prev) => [...prev, newBill])
        }
        toast.success("Bill added!")
        setDialogOpen(false)
      } catch {
        toast.error("Failed to add bill.")
      }
    })
  }

  function handleMarkPaid(id: number, isPaid: boolean) {
    startTransition(async () => {
      try {
        await markBillPaid(id, isPaid)
        setBills((prev) => prev.map((b) => b.id === id ? { ...b, is_paid: isPaid } : b))
        toast.success(isPaid ? "Bill marked as paid." : "Bill marked as unpaid.")
      } catch {
        toast.error("Failed to update bill.")
      }
    })
  }

  function handleDelete(id: number) {
    startTransition(async () => {
      try {
        await deleteBill(id)
        setBills((prev) => prev.filter((b) => b.id !== id))
        toast.success("Bill deleted.")
      } catch {
        toast.error("Failed to delete bill.")
      }
    })
  }

  function getDaysUntilDue(dueDate: string): number {
    const target = parseISO(dueDate)
    const now = startOfDay(new Date())
    const diff = target.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const unpaidBills = bills.filter((b) => !b.is_paid).sort((a, b) => a.due_date.localeCompare(b.due_date))
  const paidBills = bills.filter((b) => b.is_paid).sort((a, b) => a.due_date.localeCompare(b.due_date))
  const overdueBills = unpaidBills.filter((b) => getDaysUntilDue(b.due_date) < 0)
  const upcomingBills = unpaidBills.filter((b) => getDaysUntilDue(b.due_date) >= 0)

  return (
    <section id="bills" className="scroll-mt-20 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Bills</h2>
          <p className="text-sm text-muted-foreground">
            Track upcoming bills and never miss a payment
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5" onClick={openAddDialog}>
              <Plus className="h-4 w-4" />
              Add Bill
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Bill</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="bill-name">Bill Name</Label>
                <Input
                  id="bill-name"
                  placeholder="e.g., Electricity Bill, Rent"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="bill-amount">Amount (₹)</Label>
                  <Input
                    id="bill-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bill-due">Due Date</Label>
                  <Input
                    id="bill-due"
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bill-category">Category</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger id="bill-category" className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {BILL_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="bill-recurring"
                  type="checkbox"
                  checked={formRecurring}
                  onChange={(e) => setFormRecurring(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="bill-recurring" className="text-sm font-normal cursor-pointer">
                  Recurring bill
                </Label>
              </div>
              <Button className="w-full" onClick={handleSubmit} disabled={isPending}>
                {isPending ? "Adding..." : "Add Bill"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Upcoming Bills</p>
          <p className="text-xl font-bold text-foreground">{upcomingBills.length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Overdue Bills</p>
          <p className="text-xl font-bold text-red-400">{overdueBills.length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Next Due</p>
          <p className="text-xl font-bold text-foreground">
            {upcomingBills.length > 0 ? formatDate(upcomingBills[0].due_date) : "—"}
          </p>
        </div>
      </div>

      {/* Upcoming Bills */}
      {upcomingBills.length > 0 && (
        <div className="space-y-3 mb-6">
          <h3 className="text-base font-medium text-foreground">Upcoming Bills</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingBills.map((bill) => {
              const daysLeft = getDaysUntilDue(bill.due_date)
              const isUrgent = daysLeft <= 3

              return (
                <div key={bill.id} className={`glass-card p-5 ${isUrgent ? "border-amber-500/30" : ""}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-foreground">{bill.name}</h3>
                      {bill.category && (
                        <p className="text-xs text-muted-foreground">{bill.category}</p>
                      )}
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {bill.is_recurring && <Clock className="h-2.5 w-2.5" />}
                      {bill.is_recurring ? "Recurring" : "One-time"}
                    </Badge>
                  </div>

                  <div className="flex items-baseline justify-between mb-3">
                    <span className="text-lg font-semibold text-foreground">{formatCurrency(Number(bill.amount))}</span>
                    <span className={`text-xs ${daysLeft <= 3 ? "text-amber-400" : "text-muted-foreground"}`}>
                      {daysLeft === 0 ? "Due today" : daysLeft === 1 ? "Due tomorrow" : `${daysLeft} days left`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {formatDate(bill.due_date)}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5"
                      onClick={() => handleMarkPaid(bill.id, true)}
                      disabled={isPending}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Mark Paid
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
                      onClick={() => handleDelete(bill.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only">Delete bill</span>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Overdue Bills */}
      {overdueBills.length > 0 && (
        <div className="space-y-3 mb-6">
          <h3 className="text-base font-medium text-foreground flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-400" />
            Overdue Bills
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {overdueBills.map((bill) => {
              const daysOverdue = Math.abs(getDaysUntilDue(bill.due_date))

              return (
                <div key={bill.id} className="glass-card p-5 border-red-500/30 glow-red">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-foreground">{bill.name}</h3>
                      {bill.category && (
                        <p className="text-xs text-muted-foreground">{bill.category}</p>
                      )}
                    </div>
                    <Badge variant="destructive" className="text-[10px]">Overdue</Badge>
                  </div>

                  <div className="flex items-baseline justify-between mb-3">
                    <span className="text-lg font-semibold text-foreground">{formatCurrency(Number(bill.amount))}</span>
                    <span className="text-xs text-red-400">
                      {daysOverdue === 1 ? "1 day overdue" : `${daysOverdue} days overdue`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {formatDate(bill.due_date)}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5"
                      onClick={() => handleMarkPaid(bill.id, true)}
                      disabled={isPending}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Mark Paid
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
                      onClick={() => handleDelete(bill.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only">Delete bill</span>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Paid Bills */}
      {paidBills.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base font-medium text-foreground">Paid Bills</h3>
          <div className="glass-card divide-y divide-white/5">
            {paidBills.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{bill.name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(bill.due_date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-emerald-400">{formatCurrency(Number(bill.amount))}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500"
                    onClick={() => handleDelete(bill.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="sr-only">Delete bill</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}