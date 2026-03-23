'use client'

import { useEffect, useState } from 'react'
import { getAllScorecards, type ScorecardData } from '@/lib/admin/scorecard'
import { formatCurrency } from '@/lib/admin/constants'

const STATUS_COLORS = {
  green: 'border-green-500/40 bg-green-500/5',
  yellow: 'border-yellow-500/40 bg-yellow-500/5',
  red: 'border-red-500/40 bg-red-500/5',
}

const STATUS_DOT = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
}

function overallStatus(data: ScorecardData): 'green' | 'yellow' | 'red' {
  if (data.status.services === 'green' && data.status.revenue === 'green') return 'green'
  if (data.status.services === 'red' || data.status.revenue === 'red') return 'red'
  return 'yellow'
}

export default function ScorecardTimeline() {
  const [scorecards, setScorecards] = useState<ScorecardData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllScorecards().then((d) => {
      setScorecards(d)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-white/5 rounded-lg" />
        ))}
      </div>
    )
  }

  if (scorecards.length === 0) {
    return <p className="text-white/40 text-sm">No scorecard data available yet.</p>
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
      {scorecards.map((sc) => {
        const status = overallStatus(sc)
        return (
          <div
            key={sc.monthNum}
            className={`rounded-lg border p-3 transition-colors ${STATUS_COLORS[status]}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/60 font-medium">{sc.monthLabel}</span>
              <div className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[status]}`} />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Services</span>
                <span className="text-white">
                  {sc.actuals.services}
                  <span className="text-white/30"> / {sc.targets.base.services}</span>
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Revenue</span>
                <span className="text-white text-[11px]">
                  {formatCurrency(sc.actuals.revenue)}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5 mt-1">
                <div
                  className={`h-1.5 rounded-full transition-all ${STATUS_DOT[status]}`}
                  style={{
                    width: `${Math.min(100, (sc.actuals.services / sc.targets.base.services) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
