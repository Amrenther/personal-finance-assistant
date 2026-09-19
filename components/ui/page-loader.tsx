"use client"

import { useEffect, useState } from "react"

export function PageLoader() {
  const [visible, setVisible] = useState(true)
  const [hiding, setHiding] = useState(false)

  useEffect(() => {
    // Only show once per session
    const shown = sessionStorage.getItem("fintrack-loader-shown")
    if (shown) {
      setVisible(false)
      return
    }
    sessionStorage.setItem("fintrack-loader-shown", "1")

    // After 2.2s start fade out
    const timer = setTimeout(() => {
      setHiding(true)
      setTimeout(() => setVisible(false), 400)
    }, 2200)

    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-9999 flex flex-col items-center justify-center ${hiding ? "animate-fade-out" : ""}`}
      style={{
        background:
          "radial-gradient(ellipse at 30% 30%, oklch(0.45 0.25 280 / 0.5) 0%, transparent 60%), radial-gradient(ellipse at 70% 70%, oklch(0.45 0.22 162 / 0.3) 0%, transparent 60%), oklch(0.07 0.03 265)",
      }}
    >
      {/* Logo mark */}
      <div className="animate-fade-in-up mb-6 flex flex-col items-center gap-4">
        {/* Animated coin / chart icon */}
        <div className="relative flex h-20 w-20 items-center justify-center">
          {/* Outer spinning ring */}
          <svg
            className="animate-spin-slow absolute inset-0 h-20 w-20"
            viewBox="0 0 80 80"
            fill="none"
          >
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke="url(#loaderGrad)"
              strokeWidth="3"
              strokeDasharray="20 6"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="loaderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
          {/* Center icon */}
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-violet-600 to-emerald-500 shadow-lg">
            <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="20" x2="12" y2="10" />
              <line x1="18" y1="20" x2="18" y2="4" />
              <line x1="6"  y1="20" x2="6"  y2="16" />
            </svg>
          </div>
        </div>

        {/* App name */}
        <div className="text-center">
          <h1
            className="text-4xl font-bold tracking-tight"
            style={{
              background: "linear-gradient(135deg, #a78bfa 0%, #10b981 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            FinTrack
          </h1>
          <p className="mt-1 text-sm text-white/50">Personal Finance Assistant</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-48 overflow-hidden rounded-full bg-white/10">
        <div
          className="animate-loader-bar h-1 rounded-full"
          style={{
            background: "linear-gradient(90deg, #7c3aed, #10b981)",
          }}
        />
      </div>

      <p className="mt-4 text-xs text-white/30">Loading your financial dashboard...</p>
    </div>
  )
}
