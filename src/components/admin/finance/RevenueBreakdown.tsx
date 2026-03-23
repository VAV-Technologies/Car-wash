'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { getRevenueBreakdown } from '@/lib/admin/finance'
import { formatCurrency } from '@/lib/admin/constants'

interface BreakdownRow {
  category: string
  total: number
}

export default function RevenueBreakdown() {
  const [data, setData] = useState<BreakdownRow[]>([])
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  useEffect(() => {
    async function load() {
      try {
        const rows = await getRevenueBreakdown(year, month)
        setData(rows)
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [year, month])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/40">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading revenue breakdown...
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-16 text-white/40">
        No confirmed revenue data for this month.
      </div>
    )
  }

  const maxTotal = Math.max(...data.map((d) => d.total))
  const grandTotal = data.reduce((sum, d) => sum + d.total, 0)

  return (
    <div className="space-y-6">
      {/* Horizontal Bar Chart */}
      <div className="border border-white/10 bg-[#171717] rounded-lg p-6">
        <h3 className="text-sm font-medium text-white/70 mb-4">
          Revenue by Service Type — {now.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="space-y-3">
          {data.map((row) => {
            const pct = maxTotal > 0 ? (row.total / maxTotal) * 100 : 0
            const share = grandTotal > 0 ? ((row.total / grandTotal) * 100).toFixed(1) : '0'
            return (
              <div key={row.category} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70 capitalize">
                    {row.category.replace(/_/g, ' ')}
                  </span>
                  <span className="text-white font-medium">
                    {formatCurrency(row.total)}{' '}
                    <span className="text-white/30 text-xs">({share}%)</span>
                  </span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Table View */}
      <div className="border border-white/10 bg-[#171717] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-4 py-3 text-white/50 font-medium">Category</th>
              <th className="text-right px-4 py-3 text-white/50 font-medium">Revenue</th>
              <th className="text-right px-4 py-3 text-white/50 font-medium">Share</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.category} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-white/70 capitalize">
                  {row.category.replace(/_/g, ' ')}
                </td>
                <td className="px-4 py-3 text-right text-white font-medium">
                  {formatCurrency(row.total)}
                </td>
                <td className="px-4 py-3 text-right text-white/50">
                  {grandTotal > 0 ? ((row.total / grandTotal) * 100).toFixed(1) : '0'}%
                </td>
              </tr>
            ))}
            <tr className="bg-white/[0.03]">
              <td className="px-4 py-3 text-white font-bold">Total</td>
              <td className="px-4 py-3 text-right text-white font-bold">
                {formatCurrency(grandTotal)}
              </td>
              <td className="px-4 py-3 text-right text-white/50">100%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
