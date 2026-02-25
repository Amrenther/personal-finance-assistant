import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from "lucide-react"
import type { Suggestion } from "@/lib/suggestions"

const iconMap = {
  warning: AlertTriangle,
  destructive: AlertCircle,
  info: Info,
  success: CheckCircle2,
}

const colorMap = {
  warning: {
    border: "border-amber-200",
    bg: "bg-amber-50",
    icon: "text-amber-600",
    title: "text-amber-900",
    desc: "text-amber-800",
  },
  destructive: {
    border: "border-red-200",
    bg: "bg-red-50",
    icon: "text-red-600",
    title: "text-red-900",
    desc: "text-red-800",
  },
  info: {
    border: "border-blue-200",
    bg: "bg-blue-50",
    icon: "text-blue-600",
    title: "text-blue-900",
    desc: "text-blue-800",
  },
  success: {
    border: "border-emerald-200",
    bg: "bg-emerald-50",
    icon: "text-emerald-600",
    title: "text-emerald-900",
    desc: "text-emerald-800",
  },
}

type Props = {
  suggestions: Suggestion[]
}

export function SuggestionsSection({ suggestions }: Props) {
  return (
    <section id="suggestions" className="scroll-mt-20">
      <h2 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">Financial Suggestions</h2>

      {suggestions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border py-12 text-center">
          <CheckCircle2 className="mb-3 h-8 w-8 text-emerald-500" />
          <p className="text-sm font-medium text-foreground">Looking good!</p>
          <p className="text-sm text-muted-foreground">No suggestions at this time. Keep up the good work.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => {
            const Icon = iconMap[suggestion.type]
            const colors = colorMap[suggestion.type]
            return (
              <Alert
                key={index}
                className={`${colors.border} ${colors.bg}`}
              >
                <Icon className={`h-4 w-4 ${colors.icon}`} />
                <AlertTitle className={colors.title}>{suggestion.title}</AlertTitle>
                <AlertDescription className={colors.desc}>
                  {suggestion.description}
                </AlertDescription>
              </Alert>
            )
          })}
        </div>
      )}
    </section>
  )
}
