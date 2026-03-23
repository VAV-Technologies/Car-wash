'use client'

import { useEffect, useState } from 'react'
import { Loader2, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { getMonthlyPL, getRevenueBreakdown, getExpensesByCategory } from '@/lib/admin/finance'
import { getMonthNumber, getTargetsForMonth } from '@/lib/admin/dashboard'
import { formatCurrency, SERVICE_TYPES } from '@/lib/admin/constants'
import type { MonthlyPLData } from '@/lib/admin/finance'

function getCategoryLabel(category: string): string {
  const found = SERVICE_TYPES.find((s) => s.value === category)
  return found?.label ?? category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function getStatusColor(actual: number, worst: number, base: number): string {
  if (actual >= base) return 'text-green-400'
  if (actual >= worst) return 'text-yellow-400'
  return 'text-red-400'
}

function StatusIndicator({ actual, worst, base }: { actual: number; worst: number; base: number }) {
  if (actual >= base) {
    return (
      <span className="flex items-center gap-1 text-green-400 text-xs font-medium">
        <TrendingUp className="h-3.5 w-3.5" />
        On Track
      </span>
    )
  }
  if (actual >= worst) {
    return (
      <span className="flex items-center gap-1 text-yellow-400 text-xs font-medium">
        <AlertTriangle className="h-3.5 w-3.5" />
        Below Target
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 text-red-400 text-xs font-medium">
      <TrendingDown className="h-3.5 w-3.5" />
      Critical
    </span>
  )
}

export default function MonthlyPL() {
  const [pl, setPL] = useState<MonthlyPLData | null>(null)
  const [revenueBreakdown, setRevenueBreakdown] = useState<{ category: string; total: number }[]>([])
  const [expenseBreakdown, setExpenseBreakdown] = useState<{ category: string; total: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth() + 1

        const [plData, revBreak, expBreak] = await Promise.all([
          getMonthlyPL(year, month),
          getRevenueBreakdown(year, month),
          getExpensesByCategory(year, month),
        ])

        setPL(plData)
        setRevenueBreakdown(revBreak)
        setExpenseBreakdown(expBreak)
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading || !pl) {
    return (
      <div className="flex items-center justify-center py-20 text-white/40">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading P&L data...
      </div>
    )
  }

  const monthNum = getMonthNumber()
  const targets = getTargetsForMonth(monthNum)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-white/10 bg-[#171717] rounded-lg p-4">
          <p className="text-white/50 text-xs uppercase tracking-wide mb-1">Total Revenue</p>
          <p className={`text-2xl font-bold ${getStatusColor(pl.revenue, targets.worst.revenue, targets.base.revenue)}`}>
            {formatCurrency(pl.revenue)}
          </p>
          <div className="mt-2">
            <StatusIndicator
              actual={pl.revenue}
              worst={targets.worst.revenue}
              base={targets.base.revenue}
            />
          </div>
          <p className="text-white/30 text-xs mt-1">
            Target: {formatCurrency(targets.base.revenue)}
          </p>
        </div>

        <div className="border border-white/10 bg-[#171717] rounded-lg p-4">
          <p className="text-white/50 text-xs uppercase tracking-wide mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-red-400">
            {formatCurrency(pl.expenses)}
          </p>
        </div>

        <div className="border border-white/10 bg-[#171717] rounded-lg p-4">
          <p className="text-white/50 text-xs uppercase tracking-wide mb-1">Net Profit / Loss</p>
          <p className={`text-2xl font-bold ${pl.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {pl.net >= 0 ? '+' : ''}{formatCurrency(pl.net)}
          </p>
        </div>
      </div>

      {/* Pending Revenue */}
      {pl.pendingRevenue > 0 && (
        <div className="border border-yellow-500/20 bg-yellow-500/5 rounded-lg p-4">
          <p className="text-yellow-400 text-sm font-medium">
            Pending Revenue: {formatCurrency(pl.pendingRevenue)}
          </p>
          <p className="text-white/40 text-xs mt-1">
            This amount is not yet counted in the P&L above. Confirm payments to include them.
          </p>
        </div>
      )}

      {/* Scenario Comparison */}
      <div className="border border-white/10 bg-[#171717] rounded-lg p-4">
        <h3 className="text-sm font-medium text-white mb-3">Month {monthNum} Target Comparison</h3>
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="text-white/40">Scenario</div>
          <div className="text-white/40 text-right">Worst</div>
          <div className="text-white/40 text-right">Base</div>
          <div className="text-white/40 text-right">Best</div>

          <div className="text-white/60">Revenue</div>
          <div className="text-right text-red-400/60">{formatCurrency(targets.worst.revenue)}</div>
          <div className="text-right text-yellow-400/60">{formatCurrency(targets.base.revenue)}</div>
          <div className="text-right text-green-400/60">{formatCurrency(targets.best.revenue)}</div>

          <div className="text-white font-medium">Actual</div>
          <div className="col-span-3 text-right">
            <span className={`font-medium ${getStatusColor(pl.revenue, targets.worst.revenue, targets.base.revenue)}`}>
              {formatCurrency(pl.revenue)}
            </span>
          </div>
        </div>
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Revenue Breakdown */}
        <div className="border border-white/10 bg-[#171717] rounded-lg p-4">
          <h3 className="text-sm font-medium text-white mb-3">Revenue by Category</h3>
          {revenueBreakdown.length === 0 ? (
            <p className="text-white/40 text-sm">No revenue data yet.</p>
          ) : (
            <div className="space-y-2">
              {revenueBreakdown.map((item) => (
                <div key={item.category} className="flex items-center justify-between text-sm">
                  <span className="text-white/70">{getCategoryLabel(item.category)}</span>
                  <span className="text-green-400 font-medium">{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expense Breakdown */}
        <div className="border border-white/10 bg-[#171717] rounded-lg p-4">
          <h3 className="text-sm font-medium text-white mb-3">Expenses by Category</h3>
          {expenseBreakdown.length === 0 ? (
            <p className="text-white/40 text-sm">No expense data yet.</p>
          ) : (
            <div className="space-y-2">
              {expenseBreakdown.map((item) => (
                <div key={item.category} className="flex items-center justify-between text-sm">
                  <span className="text-white/70">{getCategoryLabel(item.category)}</span>
                  <span className="text-red-400 font-medium">{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
