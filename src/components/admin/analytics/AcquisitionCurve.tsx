'use client'

import { useEffect, useState } from 'react'
import { getCustomerAcquisitionCurve, type AcquisitionMonth } from '@/lib/admin/analytics'
import { getTargetsForMonth } from '@/lib/admin/dashboard'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function AcquisitionCurve() {
  const [data, setData] = useState<AcquisitionMonth[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCustomerAcquisitionCurve(6).then((d) => {
      setData(d)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-40 bg-white/5 rounded" />
      </div>
    )
  }

  if (data.length === 0) {
    return <p className="text-white/40 text-sm">No acquisition data available yet.</p>
  }

  const maxCount = Math.max(...data.map((m) => m.newCustomers), 1)

  // Map each month to its business month number to get targets
  function getBusinessMonthNum(year: number, month: number): number {
    return (year - 2026) * 12 + (month - 3) + 1
  }

  return (
    <div className="space-y-4">
      {/* Bar chart */}
      <div className="flex items-end gap-2 h-44">
        {data.map((month) => {
          const heightPct = (month.newCustomers / maxCount) * 100
          const bMonthNum = getBusinessMonthNum(month.year, month.month)
          const targets = bMonthNum >= 1 && bMonthNum <= 12 ? getTargetsForMonth(bMonthNum) : null
          const baseTarget = targets?.base.services ?? 0

          return (
            <div
              key={`${month.year}-${month.month}`}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <span className="text-xs text-white/60">{month.newCustomers}</span>
              <div className="w-full relative flex flex-col justify-end" style={{ height: '120px' }}>
                <div
                  className="w-full bg-orange-500 rounded-t transition-all"
                  style={{ height: `${heightPct}%`, minHeight: month.newCustomers > 0 ? '4px' : '0' }}
                />
                {baseTarget > 0 && (
                  <div
                    className="absolute left-0 right-0 border-t-2 border-dashed border-white/30"
                    style={{ bottom: `${(baseTarget / maxCount) * 100}%` }}
                    title={`Base target: ${baseTarget}`}
                  />
                )}
              </div>
              <span className="text-[10px] text-white/40">
                {MONTH_NAMES[month.month - 1]}
              </span>
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-4 text-xs text-white/40">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-orange-500 rounded-sm" />
          New Customers
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 border-t-2 border-dashed border-white/30" />
          Base Target
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-xs text-white/60 mt-2">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-2 text-white/40">Month</th>
            <th className="text-right py-2 text-white/40">New Customers</th>
            <th className="text-right py-2 text-white/40">Base Target (Services)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((month) => {
            const bMonthNum = getBusinessMonthNum(month.year, month.month)
            const targets = bMonthNum >= 1 && bMonthNum <= 12 ? getTargetsForMonth(bMonthNum) : null
            return (
              <tr key={`${month.year}-${month.month}`} className="border-b border-white/5">
                <td className="py-1.5">
                  {MONTH_NAMES[month.month - 1]} {month.year}
                </td>
                <td className="text-right py-1.5">{month.newCustomers}</td>
                <td className="text-right py-1.5">{targets?.base.services ?? '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
