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
import { Plus, Trash2, TrendingUp, TrendingDown, Calculator } from "lucide-react"
import { upsertNetWorthEntry, deleteNetWorthEntry, type NetWorthEntry } from "@/app/actions"
import { toast } from "sonner"
import { format, parseISO } from "date-fns"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ChartContainer } from "@/components/ui/chart"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value)
}

function formatDate(dateStr: string) {
  const date = parseISO(dateStr)
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

type Props = {
  entries: NetWorthEntry[]
}

export function NetWorthSection({ entries: initialEntries }: Props) {
  const [entries, setEntries] = useState(initialEntries)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Form state
  const [formEntryDate, setFormEntryDate] = useState(new Date().toISOString().split("T")[0])
  const [formAssets, setFormAssets] = useState("")
  const [formLiabilities, setFormLiabilities] = useState("")
  const [formNotes, setFormNotes] = useState("")

  const chartData = entries.map((entry) => ({
    date: formatDate(entry.entry_date),
    netWorth: Number(entry.assets) - Number(entry.liabilities),
    assets: Number(entry.assets),
    liabilities: Number(entry.liabilities),
  }))

  const latestEntry = entries[entries.length - 1]
  const previousEntry = entries.length > 1 ? entries[entries.length - 2] : null
  const latestNetWorth = latestEntry ? Number(latestEntry.assets) - Number(latestEntry.liabilities) : 0
  const previousNetWorth = previousEntry ? Number(previousEntry.assets) - Number(previousEntry.liabilities) : 0
  const netWorthDelta = previousEntry ? latestNetWorth - previousNetWorth : 0
  const totalAssets = latestEntry ? Number(latestEntry.assets) : 0
  const totalLiabilities = latestEntry ? Number(latestEntry.liabilities) : 0

  function openAddDialog() {
    setFormEntryDate(new Date().toISOString().split("T")[0])
    setFormAssets("")
    setFormLiabilities("")
    setFormNotes("")
    setDialogOpen(true)
  }

  function handleSubmit() {
    if (!formEntryDate) {
      toast.error("Please select a date.")
      return
    }

    const assets = Number(formAssets) || 0
    const liabilities = Number(formLiabilities) || 0

    startTransition(async () => {
      try {
        await upsertNetWorthEntry({
          entry_date: formEntryDate,
          assets,
          liabilities,
          notes: formNotes || null,
        })
        toast.success("Net worth entry saved!")
        setEntries((prev) => {
          const filtered = prev.filter((e) => e.entry_date !== formEntryDate)
          return [
            ...filtered,
            {
              id: Date.now(),
              entry_date: formEntryDate,
              assets: String(assets),
              liabilities: String(liabilities),
              notes: formNotes || null,
              created_at: new Date().toISOString(),
            },
          ].sort((a, b) => a.entry_date.localeCompare(b.entry_date))
        })
        setDialogOpen(false)
      } catch {
        toast.error("Failed to save net worth entry.")
      }
    })
  }

  function handleDelete(id: number) {
    startTransition(async () => {
      try {
        await deleteNetWorthEntry(id)
        setEntries((prev) => prev.filter((e) => e.id !== id))
        toast.success("Net worth entry deleted.")
      } catch {
        toast.error("Failed to delete net worth entry.")
      }
    })
  }

  const netWorthChartConfig = {
    netWorth: { label: "Net Worth", color: "oklch(0.65 0.22 280)" },
    assets: { label: "Assets", color: "oklch(0.65 0.18 162)" },
    liabilities: { label: "Liabilities", color: "oklch(0.55 0.22 25)" },
  }

  return (
    <section id="networth" className="scroll-mt-20 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Net Worth</h2>
          <p className="text-sm text-muted-foreground">
            Track your assets and liabilities over time
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5" onClick={openAddDialog}>
              <Plus className="h-4 w-4" />
              Log Net Worth
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Log Net Worth</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="entry-date">Date</Label>
                <Input
                  id="entry-date"
                  type="date"
                  value={formEntryDate}
                  onChange={(e) => setFormEntryDate(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="assets">Assets (₹)</Label>
                  <Input
                    id="assets"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formAssets}
                    onChange={(e) => setFormAssets(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="liabilities">Liabilities (₹)</Label>
                  <Input
                    id="liabilities"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formLiabilities}
                    onChange={(e) => setFormLiabilities(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input
                  id="notes"
                  placeholder="e.g., Added new investment"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                />
              </div>
              <Button className="w-full" onClick={handleSubmit} disabled={isPending}>
                {isPending ? "Saving..." : "Save Entry"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Total Assets</p>
          <p className="text-xl font-bold text-emerald-400">{formatCurrency(totalAssets)}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Total Liabilities</p>
          <p className="text-xl font-bold text-red-400">{formatCurrency(totalLiabilities)}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Net Worth</p>
          <p className="text-xl font-bold text-foreground">{formatCurrency(latestNetWorth)}</p>
          {previousEntry && (
            <p className={`text-xs ${netWorthDelta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {netWorthDelta >= 0 ? "+" : "−"}{formatCurrency(Math.abs(netWorthDelta))} this period
            </p>
          )}
        </div>
      </div>

      {/* Net Worth Chart */}
      <div className="glass-card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-medium text-foreground">Net Worth Over Time</h3>
          {entries.length > 0 && (
            <span className="text-xs text-muted-foreground">{entries.length} entries</span>
          )}
        </div>
        {entries.length === 0 ? (
          <div className="flex aspect-3/1 items-center justify-center text-sm text-muted-foreground">
            No net worth data yet. Log your first entry to start tracking.
          </div>
        ) : (
          <ChartContainer config={netWorthChartConfig} className="aspect-3/1 w-full">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.65 0.22 280)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="oklch(0.65 0.22 280)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="assetsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.65 0.18 162)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="oklch(0.65 0.18 162)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(1 0 0 / 0.1)" />
              <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`}
              />
              <Tooltip
                formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, ""]}
                labelFormatter={(label) => label}
              />
              <Area
                type="monotone"
                dataKey="netWorth"
                stroke="oklch(0.65 0.22 280)"
                strokeWidth={2}
                fill="url(#netWorthGradient)"
              />
              <Area
                type="monotone"
                dataKey="assets"
                stroke="oklch(0.65 0.18 162)"
                strokeWidth={1.5}
                fill="url(#assetsGradient)"
              />
              <Area
                type="monotone"
                dataKey="liabilities"
                stroke="oklch(0.55 0.22 25)"
                strokeWidth={1.5}
                fill="none"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </div>

      {/* Recent Entries */}
      {entries.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base font-medium text-foreground">Recent Entries</h3>
          <div className="glass-card divide-y divide-white/5">
            {entries.slice().reverse().slice(0, 5).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/20">
                    <Calculator className="h-4 w-4 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{formatDate(entry.entry_date)}</p>
                    {entry.notes && (
                      <p className="text-xs text-muted-foreground">{entry.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-emerald-400">
                    Assets: {formatCurrency(Number(entry.assets))}
                  </span>
                  <span className="text-xs text-red-400">
                    Liabilities: {formatCurrency(Number(entry.liabilities))}
                  </span>
                  <span className="text-sm font-medium tabular-nums text-foreground">
                    {formatCurrency(Number(entry.assets) - Number(entry.liabilities))}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500"
                    onClick={() => handleDelete(entry.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="sr-only">Delete entry</span>
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