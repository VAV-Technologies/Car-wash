'use client'

import { useEffect, useState } from 'react'
import { getRevenueConcentration, type RevenueConcentrationData } from '@/lib/admin/analytics'
import { formatCurrency } from '@/lib/admin/constants'

export default function RevenueConcentration() {
  const [data, setData] = useState<RevenueConcentrationData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getRevenueConcentration().then((d) => {
      setData(d)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-8 bg-white/5 rounded w-3/4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-6 bg-white/5 rounded" />
        ))}
      </div>
    )
  }

  if (!data || data.topCustomers.length === 0) {
    return <p className="text-white/40 text-sm">No revenue data available yet.</p>
  }

  const totalFromTop10 = data.topCustomers.reduce((s, c) => s + c.totalSpent, 0)

  return (
    <div className="space-y-4">
      {/* Alert banner */}
      {data.top10Pct > 40 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3 text-yellow-400 text-sm">
          Warning: Top 10 customers account for {data.top10Pct}% of total revenue. High concentration risk.
        </div>
      )}

      {/* Summary */}
      <p className="text-white/60 text-sm">
        Top 10 customers account for <span className="text-white font-semibold">{data.top10Pct}%</span> of total revenue.
      </p>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-white/40 text-xs">
              <th className="text-left py-2 pr-2">#</th>
              <th className="text-left py-2 px-2">Customer</th>
              <th className="text-right py-2 px-2">Total Spent</th>
              <th className="text-right py-2 pl-2">% of Total</th>
            </tr>
          </thead>
          <tbody>
            {data.topCustomers.map((customer, idx) => (
              <tr key={idx} className="border-b border-white/5">
                <td className="py-2 pr-2 text-white/40">{idx + 1}</td>
                <td className="py-2 px-2">
                  <span className="text-white">{customer.name}</span>
                  <span className="text-white/30 text-xs ml-2">{customer.phone}</span>
                </td>
                <td className="text-right py-2 px-2 text-white">
                  {formatCurrency(customer.totalSpent)}
                </td>
                <td className="text-right py-2 pl-2 text-white/60">
                  {totalFromTop10 > 0
                    ? `${Math.round((customer.totalSpent / (totalFromTop10 / (data.top10Pct / 100))) * 100)}%`
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
