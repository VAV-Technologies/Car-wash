'use client'

import { useEffect, useState } from 'react'
import { getServiceMixTrend, type ServiceMixMonth } from '@/lib/admin/analytics'

const SERVICE_COLORS: Record<string, { bg: string; label: string }> = {
  standard_wash: { bg: 'bg-orange-500', label: 'Standard Wash' },
  premium_wash: { bg: 'bg-blue-500', label: 'Premium Wash' },
  interior_detail: { bg: 'bg-green-500', label: 'Interior Detail' },
  exterior_detail: { bg: 'bg-purple-500', label: 'Exterior Detail' },
  full_detail: { bg: 'bg-pink-500', label: 'Full Detail' },
  ceramic_coating: { bg: 'bg-cyan-500', label: 'Ceramic Coating' },
  paint_correction: { bg: 'bg-yellow-500', label: 'Paint Correction' },
  engine_bay: { bg: 'bg-red-500', label: 'Engine Bay' },
  subscription_wash: { bg: 'bg-emerald-500', label: 'Subscription Wash' },
}

const SERVICE_KEYS = Object.keys(SERVICE_COLORS)

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function ServiceMixChart() {
  const [data, setData] = useState<ServiceMixMonth[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getServiceMixTrend(6).then((d) => {
      setData(d)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 bg-white/5 rounded" />
        ))}
      </div>
    )
  }

  if (data.length === 0 || data.every((m) => m.total === 0)) {
    return <p className="text-white/40 text-sm">No service data available yet.</p>
  }

  const maxTotal = Math.max(...data.map((m) => m.total), 1)

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {SERVICE_KEYS.map((key) => (
          <div key={key} className="flex items-center gap-1.5 text-xs text-white/60">
            <div className={`w-3 h-3 rounded-sm ${SERVICE_COLORS[key].bg}`} />
            {SERVICE_COLORS[key].label}
          </div>
        ))}
      </div>

      {/* Stacked bars */}
      <div className="space-y-2">
        {data.map((month) => (
          <div key={`${month.year}-${month.month}`} className="flex items-center gap-3">
            <span className="text-xs text-white/50 w-16 shrink-0">
              {MONTH_NAMES[month.month - 1]} {month.year}
            </span>
            <div className="flex-1 flex h-7 rounded overflow-hidden bg-white/5">
              {SERVICE_KEYS.map((key) => {
                const count = month[key as keyof ServiceMixMonth] as number
                if (!count) return null
                const widthPct = (count / maxTotal) * 100
                return (
                  <div
                    key={key}
                    className={`${SERVICE_COLORS[key].bg} h-full transition-all`}
                    style={{ width: `${widthPct}%` }}
                    title={`${SERVICE_COLORS[key].label}: ${count}`}
                  />
                )
              })}
            </div>
            <span className="text-xs text-white/40 w-8 text-right">{month.total}</span>
          </div>
        ))}
      </div>

      {/* Data table */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-xs text-white/60">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-2 pr-3 text-white/40">Month</th>
              {SERVICE_KEYS.map((key) => (
                <th key={key} className="text-right py-2 px-2 text-white/40">
                  {SERVICE_COLORS[key].label}
                </th>
              ))}
              <th className="text-right py-2 pl-2 text-white/40">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.map((month) => (
              <tr key={`${month.year}-${month.month}`} className="border-b border-white/5">
                <td className="py-1.5 pr-3">
                  {MONTH_NAMES[month.month - 1]} {month.year}
                </td>
                {SERVICE_KEYS.map((key) => (
                  <td key={key} className="text-right py-1.5 px-2">
                    {(month[key as keyof ServiceMixMonth] as number) || '—'}
                  </td>
                ))}
                <td className="text-right py-1.5 pl-2 text-white font-medium">{month.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
