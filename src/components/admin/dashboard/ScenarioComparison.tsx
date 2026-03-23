'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { getDashboardStats, getMonthNumber, getTargetsForMonth, type DashboardStatsData } from '@/lib/admin/dashboard'
import { formatCurrency } from '@/lib/admin/constants'

function StatusBadge({ actual, worst, base }: { actual: number; worst: number; base: number }) {
  if (actual >= base) {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
        On Track
      </span>
    )
  }
  if (actual >= worst) {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
        Below Target
      </span>
    )
  }
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
      Critical
    </span>
  )
}

export default function ScenarioComparison() {
  const [stats, setStats] = useState<DashboardStatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getDashboardStats()
        setStats(data)
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center py-10 text-white/40">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading scenario data...
      </div>
    )
  }

  const monthNum = getMonthNumber()
  const targets = getTargetsForMonth(monthNum)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]
  const now = new Date()
  const currentMonthName = monthNames[now.getMonth()]

  return (
    <div className="border border-white/10 bg-[#171717] rounded-lg p-4">
      <h2 className="text-lg font-semibold text-white mb-1">
        Scenario Comparison
      </h2>
      <p className="text-white/40 text-sm mb-4">
        {currentMonthName} {now.getFullYear()} (Month {monthNum})
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-white/50 text-xs uppercase">
              <th className="text-left py-2 px-3 font-medium">Metric</th>
              <th className="text-right py-2 px-3 font-medium">Worst</th>
              <th className="text-right py-2 px-3 font-medium">Base</th>
              <th className="text-right py-2 px-3 font-medium">Best</th>
              <th className="text-right py-2 px-3 font-medium">Actual</th>
              <th className="text-center py-2 px-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {/* Services Row */}
            <tr className="border-b border-white/5">
              <td className="py-3 px-3 text-white font-medium">Services</td>
              <td className="py-3 px-3 text-right text-red-400/60">
                {targets.worst.services}
              </td>
              <td className="py-3 px-3 text-right text-yellow-400/60">
                {targets.base.services}
              </td>
              <td className="py-3 px-3 text-right text-green-400/60">
                {targets.best.services}
              </td>
              <td className="py-3 px-3 text-right text-white font-bold">
                {stats.servicesThisMonth}
              </td>
              <td className="py-3 px-3 text-center">
                <StatusBadge
                  actual={stats.servicesThisMonth}
                  worst={targets.worst.services}
                  base={targets.base.services}
                />
              </td>
            </tr>

            {/* Revenue Row */}
            <tr className="border-b border-white/5">
              <td className="py-3 px-3 text-white font-medium">Revenue</td>
              <td className="py-3 px-3 text-right text-red-400/60">
                {formatCurrency(targets.worst.revenue)}
              </td>
              <td className="py-3 px-3 text-right text-yellow-400/60">
                {formatCurrency(targets.base.revenue)}
              </td>
              <td className="py-3 px-3 text-right text-green-400/60">
                {formatCurrency(targets.best.revenue)}
              </td>
              <td className="py-3 px-3 text-right text-white font-bold">
                {formatCurrency(stats.revenueThisMonth)}
              </td>
              <td className="py-3 px-3 text-center">
                <StatusBadge
                  actual={stats.revenueThisMonth}
                  worst={targets.worst.revenue}
                  base={targets.base.revenue}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
