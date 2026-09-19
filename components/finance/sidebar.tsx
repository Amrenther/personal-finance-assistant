"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import {
  LayoutDashboard,
  ArrowRightLeft,
  BarChart3,
  PiggyBank,
  Lightbulb,
  Target,
  Bell,
  TrendingUp,
  Sun,
  Moon,
  ChevronRight,
} from "lucide-react"

const navItems = [
  { label: "Overview",     href: "#overview",     icon: LayoutDashboard },
  { label: "Transactions", href: "#transactions",  icon: ArrowRightLeft   },
  { label: "Charts",       href: "#charts",        icon: BarChart3        },
  { label: "Budgets",      href: "#budgets",       icon: PiggyBank        },
  { label: "Goals",        href: "#goals",         icon: Target           },
  { label: "Bills",        href: "#bills",         icon: Bell             },
  { label: "Net Worth",    href: "#networth",      icon: TrendingUp       },
  { label: "Suggestions",  href: "#suggestions",   icon: Lightbulb        },
]

export function Sidebar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [activeHash, setActiveHash] = useState("")

  useEffect(() => {
    setMounted(true)
    setActiveHash(window.location.hash || "#overview")

    const onHashChange = () => setActiveHash(window.location.hash)
    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [])

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark")

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col glass-card rounded-none border-r border-(--glass-border)"
      style={{ background: "var(--sidebar)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-(--glass-border) px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-violet-600 to-emerald-500 shadow-lg">
          <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="20" x2="12" y2="10" />
            <line x1="18" y1="20" x2="18" y2="4" />
            <line x1="6"  y1="20" x2="6"  y2="16" />
          </svg>
        </div>
        <div>
          <span
            className="text-base font-bold tracking-tight"
            style={{
              background: "linear-gradient(135deg, #a78bfa 0%, #10b981 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            FinTrack
          </span>
          <p className="text-[10px] text-muted-foreground">Finance Assistant</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Dashboard
        </p>
        {navItems.map((item) => {
          const isActive = activeHash === item.href
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setActiveHash(item.href)}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "nav-active text-violet-300"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <item.icon
                className={`h-4 w-4 shrink-0 transition-colors ${
                  isActive ? "text-violet-400" : "text-muted-foreground group-hover:text-foreground"
                }`}
              />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <ChevronRight className="h-3 w-3 text-violet-400 opacity-60" />
              )}
            </a>
          )
        })}
      </nav>

      {/* Bottom: Theme toggle */}
      <div className="border-t border-(--glass-border) px-3 py-4">
        {mounted && (
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-white/5 hover:text-foreground"
          >
            {theme === "dark" ? (
              <>
                <Sun className="h-4 w-4 text-amber-400" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-violet-400" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        )}
        <p className="mt-3 px-3 text-[10px] text-muted-foreground">
          FinTrack v2.0 · Built with ❤️
        </p>
      </div>
    </aside>
  )
}
