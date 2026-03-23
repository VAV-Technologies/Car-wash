'use client'

import { useEffect, useState } from 'react'
import { getScorecardData, getMonthLabel, type ScorecardData, type ScorecardStatus } from '@/lib/admin/scorecard'
import { getMonthNumber } from '@/lib/admin/dashboard'
import { formatCurrency } from '@/lib/admin/constants'
import { ChevronLeft, ChevronRight } from 'lucide-react'

function StatusBadge({ status }: { status: ScorecardStatus }) {
  const config = {
    green: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'On Track' },
    yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'At Risk' },
    red: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Behind' },
  }
  const c = config[status]
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  )
}

export default function MonthlyScorecard() {
  const [monthNum, setMonthNum] = useState(getMonthNumber())
  const [data, setData] = useState<ScorecardData | null>(null)
  const [loading, setLoading] = useState(true)

  const currentMonth = getMonthNumber()

  useEffect(() => {
    setLoading(true)
    getScorecardData(monthNum).then((d) => {
      setData(d)
      setLoading(false)
    })
  }, [monthNum])

  const overallStatus = data
    ? data.status.services === 'green' && data.status.revenue === 'green'
      ? 'ahead of base'
      : data.status.services === 'red' || data.status.revenue === 'red'
      ? 'below worst'
      : 'between worst and base'
    : ''

  return (
    <div className="space-y-4">
      {/* Month selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMonthNum((p) => Math.max(1, p - 1))}
          disabled={monthNum <= 1}
          className="p-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4 text-white/60" />
        </button>
        <span className="text-white font-medium text-sm min-w-[100px] text-center">
          {getMonthLabel(monthNum)} (Month {monthNum})
        </span>
        <button
          onClick={() => setMonthNum((p) => Math.min(currentMonth, p + 1))}
          disabled={monthNum >= currentMonth}
          className="p-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="h-4 w-4 text-white/60" />
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-white/5 rounded" />
          ))}
        </div>
      ) : data ? (
        <>
          {/* Scorecard table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/40 text-xs">
                  <th className="text-left py-2.5 pr-3">Metric</th>
                  <th className="text-right py-2.5 px-3">Worst</th>
                  <th className="text-right py-2.5 px-3">Base</th>
                  <th className="text-right py-2.5 px-3">Best</th>
                  <th className="text-right py-2.5 px-3">Actual</th>
                  <th className="text-center py-2.5 pl-3">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="py-2.5 pr-3 text-white/80">Services</td>
                  <td className="text-right py-2.5 px-3 text-white/40">{data.targets.worst.services}</td>
                  <td className="text-right py-2.5 px-3 text-white/60">{data.targets.base.services}</td>
                  <td className="text-right py-2.5 px-3 text-white/40">{data.targets.best.services}</td>
                  <td className="text-right py-2.5 px-3 text-white font-semibold">{data.actuals.services}</td>
                  <td className="text-center py-2.5 pl-3">
                    <StatusBadge status={data.status.services} />
                  </td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2.5 pr-3 text-white/80">Revenue</td>
                  <td className="text-right py-2.5 px-3 text-white/40">{formatCurrency(data.targets.worst.revenue)}</td>
                  <td className="text-right py-2.5 px-3 text-white/60">{formatCurrency(data.targets.base.revenue)}</td>
                  <td className="text-right py-2.5 px-3 text-white/40">{formatCurrency(data.targets.best.revenue)}</td>
                  <td className="text-right py-2.5 px-3 text-white font-semibold">{formatCurrency(data.actuals.revenue)}</td>
                  <td className="text-center py-2.5 pl-3">
                    <StatusBadge status={data.status.revenue} />
                  </td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2.5 pr-3 text-white/80">Avg Rev/Service</td>
                  <td className="text-right py-2.5 px-3 text-white/40">
                    {data.targets.worst.services > 0 ? formatCurrency(Math.round(data.targets.worst.revenue / data.targets.worst.services)) : '—'}
                  </td>
                  <td className="text-right py-2.5 px-3 text-white/60">
                    {data.targets.base.services > 0 ? formatCurrency(Math.round(data.targets.base.revenue / data.targets.base.services)) : '—'}
                  </td>
                  <td className="text-right py-2.5 px-3 text-white/40">
                    {data.targets.best.services > 0 ? formatCurrency(Math.round(data.targets.best.revenue / data.targets.best.services)) : '—'}
                  </td>
                  <td className="text-right py-2.5 px-3 text-white font-semibold">{formatCurrency(data.actuals.avgRevPerService)}</td>
                  <td className="text-center py-2.5 pl-3">
                    <StatusBadge status={data.status.avgRevPerService} />
                  </td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2.5 pr-3 text-white/80">Capacity Utilization</td>
                  <td className="text-right py-2.5 px-3 text-white/40">
                    {Math.round((data.targets.worst.services / 65) * 100)}%
                  </td>
                  <td className="text-right py-2.5 px-3 text-white/60">
                    {Math.round((data.targets.base.services / 65) * 100)}%
                  </td>
                  <td className="text-right py-2.5 px-3 text-white/40">
                    {Math.round((data.targets.best.services / 65) * 100)}%
                  </td>
                  <td className="text-right py-2.5 px-3 text-white font-semibold">{data.actuals.capacityUtil}%</td>
                  <td className="text-center py-2.5 pl-3">
                    <StatusBadge status={data.status.capacityUtil} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary text */}
          <div className={`text-sm rounded-lg px-4 py-3 ${
            overallStatus === 'ahead of base'
              ? 'bg-green-500/10 text-green-400'
              : overallStatus === 'below worst'
              ? 'bg-red-500/10 text-red-400'
              : 'bg-yellow-500/10 text-yellow-400'
          }`}>
            You are tracking <span className="font-semibold">{overallStatus}</span> for Month {monthNum}.
          </div>
        </>
      ) : null}
    </div>
  )
}
