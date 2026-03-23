'use client'

import { useEffect, useState } from 'react'
import { Loader2, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/admin/constants'

interface ProjectionMonth {
  label: string
  projected: number
}

export default function CashFlowProjection() {
  const [loading, setLoading] = useState(true)
  const [cashBalance, setCashBalance] = useState(0)
  const [avgMonthlyRevenue, setAvgMonthlyRevenue] = useState(0)
  const [avgMonthlyExpenses, setAvgMonthlyExpenses] = useState(0)
  const [projections, setProjections] = useState<ProjectionMonth[]>([])
  const [alertIn30Days, setAlertIn30Days] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        // Cumulative revenue
        const { data: revRows } = await supabase
          .from('transactions')
          .select('amount, created_at')
          .eq('type', 'revenue')
          .eq('payment_status', 'confirmed')

        // Cumulative expenses
        const { data: expRows } = await supabase
          .from('transactions')
          .select('amount, created_at')
          .eq('type', 'expense')

        const totalRev = (revRows ?? []).reduce((s, r) => s + r.amount, 0)
        const totalExp = (expRows ?? []).reduce((s, r) => s + r.amount, 0)
        const balance = totalRev - totalExp
        setCashBalance(balance)

        // Calculate avg monthly revenue/expenses from last 3 months
        const now = new Date()
        const threeMonthsAgo = new Date(now)
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

        const recentRev = (revRows ?? [])
          .filter((r) => new Date(r.created_at) >= threeMonthsAgo)
          .reduce((s, r) => s + r.amount, 0)
        const recentExp = (expRows ?? [])
          .filter((r) => new Date(r.created_at) >= threeMonthsAgo)
          .reduce((s, r) => s + r.amount, 0)

        const monthsOfData = Math.max(1, Math.min(3, Math.ceil(
          (now.getTime() - threeMonthsAgo.getTime()) / (30 * 24 * 60 * 60 * 1000)
        )))

        const avgRev = recentRev / monthsOfData
        const avgExp = recentExp / monthsOfData
        setAvgMonthlyRevenue(avgRev)
        setAvgMonthlyExpenses(avgExp)

        // 3-month forward projection
        const proj: ProjectionMonth[] = []
        let running = balance
        for (let i = 1; i <= 3; i++) {
          const futureDate = new Date(now)
          futureDate.setMonth(futureDate.getMonth() + i)
          running = running + avgRev - avgExp
          proj.push({
            label: futureDate.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
            projected: running,
          })
        }
        setProjections(proj)

        // Check 30-day projection
        const dailyNet = (avgRev - avgExp) / 30
        const in30Days = balance + dailyNet * 30
        setAlertIn30Days(in30Days < 10_000_000)
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/40">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading cash flow projection...
      </div>
    )
  }

  const monthlyNetFlow = avgMonthlyRevenue - avgMonthlyExpenses

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {alertIn30Days && (
        <div className="flex items-center gap-3 border border-red-500/30 bg-red-500/10 rounded-lg p-4">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-400">Cash Flow Warning</p>
            <p className="text-xs text-red-400/70 mt-0.5">
              Projected cash balance will drop below Rp 10.000.000 within 30 days based on current trends.
            </p>
          </div>
        </div>
      )}

      {/* Current Balance */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-white/10 bg-[#171717] rounded-lg p-5">
          <p className="text-xs text-white/50 uppercase tracking-wide">Current Cash Balance</p>
          <p className={`text-2xl font-bold mt-2 ${cashBalance >= 0 ? 'text-white' : 'text-red-400'}`}>
            {formatCurrency(cashBalance)}
          </p>
        </div>
        <div className="border border-white/10 bg-[#171717] rounded-lg p-5">
          <p className="text-xs text-white/50 uppercase tracking-wide">Avg Monthly Revenue</p>
          <p className="text-2xl font-bold mt-2 text-green-400">
            {formatCurrency(avgMonthlyRevenue)}
          </p>
        </div>
        <div className="border border-white/10 bg-[#171717] rounded-lg p-5">
          <p className="text-xs text-white/50 uppercase tracking-wide">Avg Monthly Expenses</p>
          <p className="text-2xl font-bold mt-2 text-red-400">
            {formatCurrency(avgMonthlyExpenses)}
          </p>
        </div>
      </div>

      {/* Net Flow */}
      <div className="border border-white/10 bg-[#171717] rounded-lg p-5">
        <p className="text-xs text-white/50 uppercase tracking-wide mb-2">Monthly Net Cash Flow</p>
        <p className={`text-xl font-bold ${monthlyNetFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {monthlyNetFlow >= 0 ? '+' : ''}{formatCurrency(monthlyNetFlow)}/mo
        </p>
      </div>

      {/* 3-Month Projection */}
      <div className="border border-white/10 bg-[#171717] rounded-lg p-6">
        <h3 className="text-sm font-medium text-white/70 mb-4">3-Month Forward Projection</h3>
        <div className="space-y-3">
          {projections.map((p) => {
            const isNegative = p.projected < 0
            const isDanger = p.projected < 10_000_000
            return (
              <div
                key={p.label}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  isNegative
                    ? 'border-red-500/30 bg-red-500/5'
                    : isDanger
                    ? 'border-yellow-500/30 bg-yellow-500/5'
                    : 'border-white/5 bg-white/[0.02]'
                }`}
              >
                <span className="text-sm text-white/70">{p.label}</span>
                <span
                  className={`text-sm font-bold ${
                    isNegative ? 'text-red-400' : isDanger ? 'text-yellow-400' : 'text-white'
                  }`}
                >
                  {formatCurrency(p.projected)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
