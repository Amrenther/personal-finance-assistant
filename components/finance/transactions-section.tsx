"use client"

import { useState, useTransition, useMemo } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import {
  Calendar,
  ChevronsRight,
  ChevronsLeft,
} from "lucide-react"
import { format, addDays, startOfMonth, endOfMonth, subMonths, isSameDay, isBefore, isAfter } from "date-fns"
import { Plus, Trash2, ArrowUpRight, ArrowDownRight, Search, Filter, Download, RotateCcw, Clock, Calendar as CalendarIcon } from "lucide-react"
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
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Form state
  const [formType, setFormType] = useState<"income" | "expense">("expense")
  const [formCategory, setFormCategory] = useState("")
  const [formAmount, setFormAmount] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0])
  const [formRecurring, setFormRecurring] = useState(false)

  const categories = formType === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (typeFilter !== "all" && t.type !== typeFilter) return false
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false

      const txnDate = new Date(t.date)
      if (dateRange.from && isBefore(txnDate, startOfDay(dateRange.from))) return false
      if (dateRange.to && isAfter(txnDate, endOfDay(dateRange.to))) return false

      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const desc = (t.description || "").toLowerCase()
        const cat = t.category.toLowerCase()
        if (!desc.includes(query) && !cat.includes(query)) return false
      }

      return true
    })
  }, [transactions, typeFilter, categoryFilter, dateRange, searchQuery])

  const allCategories = useMemo(
    () => Array.from(new Set(transactions.map((t) => t.category))).sort(),
    [transactions]
  )

  function startOfDay(d: Date) {
    const date = new Date(d)
    date.setHours(0, 0, 0, 0)
    return date
  }

  function endOfDay(d: Date) {
    const date = new Date(d)
    date.setHours(23, 59, 59, 999)
    return date
  }

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
          is_recurring: formRecurring,
        })
        toast.success("Transaction added successfully!")
        setDialogOpen(false)
        setFormCategory("")
        setFormAmount("")
        setFormDescription("")
        setFormDate(new Date().toISOString().split("T")[0])
        setFormRecurring(false)
        // Optimistically update
        const newTxn: Transaction = {
          id: Date.now(),
          type: formType,
          category: formCategory,
          amount: formAmount,
          description: formDescription,
          date: formDate,
          created_at: new Date().toISOString(),
          is_recurring: formRecurring,
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

  function handleExportCSV() {
    if (filteredTransactions.length === 0) {
      toast.info("No transactions to export.")
      return
    }

    const headers = ["Date", "Type", "Category", "Description", "Amount (INR)", "Recurring"]
    const rows = filteredTransactions.map((t) => [
      formatDate(t.date),
      t.type,
      t.category,
      t.description || "",
      t.type === "income" ? `+${Number(t.amount).toFixed(2)}` : `-${Number(t.amount).toFixed(2)}`,
      t.is_recurring ? "Yes" : "No",
    ])

    const csvContent = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `fintrack-transactions-${format(new Date(), "yyyy-MM-dd")}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success("Transactions exported!")
  }

  function handleDateRangeSelect(range: { from: Date | undefined; to: Date | undefined }) {
    setDateRange(range)
  }

  const dateRangeOptions = [
    { label: "This Month", from: startOfMonth(new Date()), to: endOfMonth(new Date()) },
    { label: "Last Month", from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) },
    { label: "Last 3 Months", from: startOfMonth(subMonths(new Date(), 3)), to: endOfMonth(new Date()) },
    { label: "Last 6 Months", from: startOfMonth(subMonths(new Date(), 6)), to: endOfMonth(new Date()) },
    { label: "This Year", from: new Date(new Date().getFullYear(), 0, 1), to: new Date() },
    { label: "All Time", from: undefined, to: undefined },
  ]

  return (
    <section id="transactions" className="scroll-mt-20 animate-fade-in-up">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Transactions</h2>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative min-w-50 max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Type Filter */}
          <Select value={typeFilter} onValueChange={setTypeFilter as (v: "all" | "income" | "expense") => void}>
            <SelectTrigger className="h-9 w-32.5">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-9 w-37.5">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {allCategories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Range Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-9 gap-2 px-3">
                <CalendarIcon className="h-4 w-4" />
                <span className="text-xs">
                  {dateRange.from
                    ? `${format(dateRange.from, "MMM d")} - ${dateRange.to ? format(dateRange.to!, "MMM d") : "Present"}`
                    : "All Time"}
                </span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" sideOffset={5}>
              <div className="p-3 space-y-1">
                {dateRangeOptions.map((option) => (
                  <Button
                    key={option.label}
                    variant={!dateRange.from && !option.from ? "default" : "ghost"}
                    className="w-full justify-start gap-2"
                    onClick={() => handleDateRangeSelect(option)}
                  >
                    {option.label}
                  </Button>
                ))}
                <div className="border-t my-1" />
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-muted-foreground"
                  onClick={() => handleDateRangeSelect({ from: undefined, to: undefined })}
                >
                  <RotateCcw className="h-4 w-4" />
                  Clear
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Add Transaction Button */}
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
                    onClick={() => {
                      setFormType("expense")
                      setFormCategory("")
                    }}
                  >
                    Expense
                  </Button>
                  <Button
                    variant={formType === "income" ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setFormType("income")
                      setFormCategory("")
                    }}
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
                  <Label htmlFor="amount">{"Amount (₹)"}</Label>
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

                <div className="flex items-center gap-2">
                  <Input
                    id="recurring"
                    type="checkbox"
                    checked={formRecurring}
                    onChange={(e) => setFormRecurring(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="recurring" className="text-sm font-normal cursor-pointer">
                    Recurring transaction
                  </Label>
                </div>

                <Button className="w-full" onClick={handleSubmit} disabled={isPending}>
                  {isPending ? "Adding..." : "Add Transaction"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* CSV Export */}
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExportCSV} disabled={filteredTransactions.length === 0}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/10">
                <TableHead className="pl-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Amount</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recurring</TableHead>
                <TableHead className="pr-6 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Search className="h-8 w-8 opacity-50" />
                      <p className="text-sm">No transactions found.</p>
                      <p className="text-xs">Try adjusting your filters or search query.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((txn) => (
                  <TableRow
                    key={txn.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <TableCell className="pl-6 text-sm text-muted-foreground">{formatDate(txn.date)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {txn.type === "income" ? (
                          <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <ArrowDownRight className="h-3.5 w-3.5 text-red-400" />
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
                    <TableCell className="max-w-50 truncate text-sm text-muted-foreground">
                      {txn.description || "-"}
                    </TableCell>
                    <TableCell
                      className={`text-right text-sm font-medium tabular-nums ${
                        txn.type === "income" ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {txn.type === "income" ? "+" : "−"}{formatCurrency(Number(txn.amount))}
                    </TableCell>
                    <TableCell className="text-center">
                      {txn.is_recurring && (
                        <Badge variant="secondary" className="gap-1 h-5 px-2 text-[10px]">
                          <Clock className="h-2.5 w-2.5" />
                          Recurring
                        </Badge>
                      )}
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
      </div>
    </section>
  )
}