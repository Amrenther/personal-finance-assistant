"use client"

import { useEffect, useRef, useState } from "react"
import { TrendingUp, TrendingDown, IndianRupee, CalendarDays, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Transaction } from "@/app/actions"
import type { HealthScore } from "@/lib/health-score"

type OverviewProps = {
  totalIncome: number
  totalExpenses: number
  netBalance: number
  monthExpenses: number
  recentTransactions: Transaction[]
  healthScore: HealthScore
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function useCountUp(target: number, duration = 1000) {
  const [value, setValue] = useState(0)
  const ref = useRef(false)
  useEffect(() => {
    if (ref.current) return
    ref.current = true
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * ease))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])
  return value
}

function StatCard({
  title, value, icon: Icon, gradient, glow,
}: {
  title: string
  value: number
  icon: React.ElementType
  gradient: string
  glow: string
}) {
  const animated = useCountUp(value, 1200)
  return (
    <div className={`glass-card p-5 transition-all duration-300 hover:scale-[1.02] ${glow}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p className="mt-1.5 text-2xl font-bold tabular-nums text-foreground animate-count">
            {formatCurrency(animated)}
          </p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br ${gradient}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  )
}

function HealthGauge({ score, grade, color, label }: Pick<HealthScore, "score" | "grade" | "color" | "label">) {
  const radius = 52
  const circ = 2 * Math.PI * radius
  const [dashOffset, setDashOffset] = useState(circ)
  useEffect(() => {
    const t = setTimeout(() => {
      setDashOffset(circ - (score / 100) * circ)
    }, 300)
    return () => clearTimeout(t)
  }, [score, circ])

  return (
    <div className="glass-card flex flex-col items-center justify-center p-6 text-center">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Financial Health
      </p>
      <div className="relative flex items-center justify-center">
        <svg width="128" height="128" viewBox="0 0 128 128">
          {/* Track */}
          <circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
          {/* Progress */}
          <circle
            cx="64" cy="64" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 64 64)"
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)", filter: `drop-shadow(0 0 8px ${color}88)` }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-bold" style={{ color }}>{score}</span>
          <span className="text-lg font-bold" style={{ color }}>{grade}</span>
        </div>
      </div>
      <p className="mt-2 text-sm font-semibold" style={{ color }}>{label}</p>
    </div>
  )
}

export function OverviewSection({
  totalIncome, totalExpenses, netBalance, monthExpenses,
  recentTransactions, healthScore,
}: OverviewProps) {
  const cards = [
    { title: "Total Income",    value: totalIncome,    icon: TrendingUp,   gradient: "from-emerald-500 to-teal-600",  glow: "hover:glow-emerald" },
    { title: "Total Expenses",  value: totalExpenses,  icon: TrendingDown, gradient: "from-red-500 to-rose-600",      glow: "hover:glow-red"     },
    { title: "Net Balance",     value: netBalance,     icon: IndianRupee,  gradient: "from-violet-600 to-indigo-600", glow: "hover:glow-violet"  },
    { title: "This Month",      value: monthExpenses,  icon: CalendarDays, gradient: "from-amber-500 to-orange-600",  glow: "hover:glow-amber"   },
  ]

  return (
    <section id="overview" className="scroll-mt-8">
      <h2 className="mb-5 text-xl font-bold tracking-tight text-foreground">
        Overview
        <span className="ml-2 text-sm font-normal text-muted-foreground">· Your financial snapshot</span>
      </h2>

      {/* Bento grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* 4 stat cards */}
        <div className="col-span-1 grid grid-cols-2 gap-4 sm:col-span-2 lg:col-span-2">
          {cards.map((c) => (
            <StatCard key={c.title} {...c} />
          ))}
        </div>

        {/* Health score gauge — spans 1 col, 2 rows visually */}
        <div className="row-span-1 lg:row-span-2">
          <HealthGauge
            score={healthScore.score}
            grade={healthScore.grade}
            color={healthScore.color}
            label={healthScore.label}
          />
          {/* Health insights */}
          {healthScore.insights.length > 0 && (
            <div className="glass-card mt-4 space-y-2 p-4">
              {healthScore.insights.map((insight, i) => (
                <p key={i} className="text-xs text-muted-foreground leading-relaxed">
                  💡 {insight}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions card — spans 2 cols */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-2">
          <div className="glass-card p-5">
            <p className="mb-4 text-sm font-semibold text-foreground">Recent Transactions</p>
            {recentTransactions.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No transactions yet.</p>
            ) : (
              <div className="space-y-2">
                {recentTransactions.map((txn) => (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2.5 transition-all hover:bg-white/8"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          txn.type === "income" ? "bg-emerald-500/20" : "bg-red-500/20"
                        }`}
                      >
                        {txn.type === "income" ? (
                          <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{txn.description || txn.category}</p>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="secondary" className="h-4 text-[10px]">{txn.category}</Badge>
                          <span className="text-[10px] text-muted-foreground">{formatDate(txn.date)}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`text-sm font-bold tabular-nums ${txn.type === "income" ? "text-emerald-400" : "text-red-400"}`}>
                      {txn.type === "income" ? "+" : "−"}{formatCurrency(Number(txn.amount))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
