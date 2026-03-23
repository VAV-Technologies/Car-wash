'use client'

import { useEffect, useState } from 'react'
import { getRetentionCohorts, type RetentionCohort } from '@/lib/admin/analytics'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function pctColor(pct: number): string {
  if (pct > 50) return 'bg-green-500/20 text-green-400'
  if (pct >= 25) return 'bg-yellow-500/20 text-yellow-400'
  return 'bg-red-500/20 text-red-400'
}

export default function RetentionCohorts() {
  const [data, setData] = useState<RetentionCohort[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getRetentionCohorts().then((d) => {
      setData(d)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 bg-white/5 rounded" />
        ))}
      </div>
    )
  }

  if (data.length === 0 || data.every((c) => c.acquired === 0)) {
    return <p className="text-white/40 text-sm">No cohort data available yet.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-white/40 text-xs">
            <th className="text-left py-2 pr-4">Cohort</th>
            <th className="text-right py-2 px-3">Acquired</th>
            <th className="text-center py-2 px-3">Month 1</th>
            <th className="text-center py-2 px-3">Month 2</th>
            <th className="text-center py-2 px-3">Month 3</th>
          </tr>
        </thead>
        <tbody>
          {data.map((cohort) => (
            <tr
              key={`${cohort.cohortYear}-${cohort.cohortMonth}`}
              className="border-b border-white/5"
            >
              <td className="py-2 pr-4 text-white/60">
                {MONTH_NAMES[cohort.cohortMonth - 1]} {cohort.cohortYear}
              </td>
              <td className="text-right py-2 px-3 text-white">{cohort.acquired}</td>
              {[
                { pct: cohort.pct_month1, count: cohort.returned_month1 },
                { pct: cohort.pct_month2, count: cohort.returned_month2 },
                { pct: cohort.pct_month3, count: cohort.returned_month3 },
              ].map((m, idx) => (
                <td key={idx} className="text-center py-2 px-3">
                  {cohort.acquired > 0 && m.count > 0 ? (
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${pctColor(m.pct)}`}>
                      {m.pct}% ({m.count})
                    </span>
                  ) : (
                    <span className="text-white/20 text-xs">—</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
