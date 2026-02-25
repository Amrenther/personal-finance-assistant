"use client"

import { Wallet, LayoutDashboard, ArrowRightLeft, BarChart3, PiggyBank, Lightbulb } from "lucide-react"

const navItems = [
  { label: "Overview", href: "#overview", icon: LayoutDashboard },
  { label: "Transactions", href: "#transactions", icon: ArrowRightLeft },
  { label: "Charts", href: "#charts", icon: BarChart3 },
  { label: "Budgets", href: "#budgets", icon: PiggyBank },
  { label: "Suggestions", href: "#suggestions", icon: Lightbulb },
]

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Wallet className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-foreground">Personal Finance Assistant</span>
        </div>
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
