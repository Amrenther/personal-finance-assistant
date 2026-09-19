"use client"

import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  Lightbulb,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Suggestion } from "@/lib/suggestions"

const iconMap = {
  warning:     AlertTriangle,
  destructive: AlertCircle,
  info:        Info,
  success:     CheckCircle2,
}

const styleMap = {
  warning: {
    border:  "border-amber-500/30",
    bg:      "bg-amber-500/10",
    icon:    "text-amber-400",
    title:   "text-amber-300",
    desc:    "text-amber-200/70",
    badge:   "border-amber-500/30 bg-amber-500/15 text-amber-300",
  },
  destructive: {
    border:  "border-red-500/30",
    bg:      "bg-red-500/10",
    icon:    "text-red-400",
    title:   "text-red-300",
    desc:    "text-red-200/70",
    badge:   "border-red-500/30 bg-red-500/15 text-red-300",
  },
  info: {
    border:  "border-violet-500/30",
    bg:      "bg-violet-500/10",
    icon:    "text-violet-400",
    title:   "text-violet-300",
    desc:    "text-violet-200/70",
    badge:   "border-violet-500/30 bg-violet-500/15 text-violet-300",
  },
  success: {
    border:  "border-emerald-500/30",
    bg:      "bg-emerald-500/10",
    icon:    "text-emerald-400",
    title:   "text-emerald-300",
    desc:    "text-emerald-200/70",
    badge:   "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
  },
}

const badgeLabelMap = {
  warning:     "Warning",
  destructive: "Alert",
  info:        "Info",
  success:     "Great",
}

type Props = {
  suggestions: Suggestion[]
}

export function SuggestionsSection({ suggestions }: Props) {
  const warnings     = suggestions.filter((s) => s.type === "destructive" || s.type === "warning")
  const infos        = suggestions.filter((s) => s.type === "info")
  const successes    = suggestions.filter((s) => s.type === "success")

  return (
    <section id="suggestions" className="scroll-mt-20 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
      <div className="mb-6 flex items-center gap-3">
        <Lightbulb className="h-6 w-6 text-violet-400" />
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Financial Suggestions</h2>
        {suggestions.length > 0 && (
          <Badge variant="secondary" className="ml-auto text-xs">
            {suggestions.length} insight{suggestions.length !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {suggestions.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
          <p className="text-base font-semibold text-foreground">Looking great!</p>
          <p className="mt-1 text-sm text-muted-foreground">
            No suggestions at this time. Your finances are on track — keep it up!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => {
            const Icon   = iconMap[suggestion.type]
            const styles = styleMap[suggestion.type]
            const label  = badgeLabelMap[suggestion.type]

            return (
              <div
                key={index}
                className={`glass-card p-4 border ${styles.border} ${styles.bg} transition-all duration-200 hover:scale-[1.01]`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${styles.bg} border ${styles.border}`}>
                    <Icon className={`h-4 w-4 ${styles.icon}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`text-sm font-semibold ${styles.title}`}>{suggestion.title}</p>
                      <Badge
                        variant="outline"
                        className={`ml-auto shrink-0 h-4 px-1.5 text-[9px] font-semibold uppercase tracking-wider ${styles.badge}`}
                      >
                        {label}
                      </Badge>
                    </div>
                    <p className={`text-sm leading-relaxed ${styles.desc}`}>{suggestion.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}