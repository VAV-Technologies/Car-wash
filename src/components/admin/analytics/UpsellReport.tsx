'use client'

import { useEffect, useState } from 'react'
import { getUpsellEffectiveness, type UpsellData } from '@/lib/admin/analytics'

const SERVICE_LABELS: Record<string, string> = {
  standard_wash: 'Standard Wash',
  premium_wash: 'Premium Wash',
  interior_detail: 'Interior Detail',
  exterior_detail: 'Exterior Detail',
  full_detail: 'Full Detail',
  ceramic_coating: 'Ceramic Coating',
  paint_correction: 'Paint Correction',
  engine_bay: 'Engine Bay',
  subscription_wash: 'Subscription Wash',
}

export default function UpsellReport() {
  const [data, setData] = useState<UpsellData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUpsellEffectiveness().then((d) => {
      setData(d)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-16 bg-white/5 rounded" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-6 bg-white/5 rounded" />
        ))}
      </div>
    )
  }

  if (!data || data.overall.attempted === 0) {
    return <p className="text-white/40 text-sm">No upsell data available yet.</p>
  }

  // Find best and worst performing services
  const servicesWithAttempts = data.byService.filter((s) => s.attempted > 0)
  const bestService = servicesWithAttempts.length > 0
    ? servicesWithAttempts.reduce((a, b) => (a.rate > b.rate ? a : b))
    : null
  const worstService = servicesWithAttempts.length > 1
    ? servicesWithAttempts.reduce((a, b) => (a.rate < b.rate ? a : b))
    : null

  return (
    <div className="space-y-4">
      {/* Overall stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-white">{data.overall.attempted}</p>
          <p className="text-xs text-white/40">Upsells Attempted</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-white">{data.overall.converted}</p>
          <p className="text-xs text-white/40">Converted</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-orange-500">{data.overall.rate}%</p>
          <p className="text-xs text-white/40">Conversion Rate</p>
        </div>
      </div>

      {/* Table by service */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-white/40 text-xs">
              <th className="text-left py-2 pr-2">Service</th>
              <th className="text-right py-2 px-2">Attempts</th>
              <th className="text-right py-2 px-2">Conversions</th>
              <th className="text-right py-2 pl-2">Rate</th>
            </tr>
          </thead>
          <tbody>
            {data.byService.map((row) => {
              const isBest = bestService && row.service_type === bestService.service_type
              const isWorst = worstService && row.service_type === worstService.service_type && !isBest
              return (
                <tr key={row.service_type} className="border-b border-white/5">
                  <td className="py-2 pr-2 text-white/80">
                    {SERVICE_LABELS[row.service_type] ?? row.service_type}
                    {isBest && (
                      <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded">
                        Best
                      </span>
                    )}
                    {isWorst && (
                      <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded">
                        Lowest
                      </span>
                    )}
                  </td>
                  <td className="text-right py-2 px-2 text-white/60">{row.attempted}</td>
                  <td className="text-right py-2 px-2 text-white/60">{row.converted}</td>
                  <td className="text-right py-2 pl-2">
                    <span
                      className={`font-medium ${
                        row.rate >= 50
                          ? 'text-green-400'
                          : row.rate >= 25
                          ? 'text-yellow-400'
                          : 'text-red-400'
                      }`}
                    >
                      {row.rate}%
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
