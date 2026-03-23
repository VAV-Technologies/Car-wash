'use client'

import { useEffect, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { getMonthlyInvoiceSummary, type MonthlyInvoiceSummary as SummaryData } from '@/lib/admin/invoicing'
import { formatCurrency } from '@/lib/admin/constants'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export default function MonthlySummary() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<SummaryData | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getMonthlyInvoiceSummary(year, month)
      setSummary(data)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => {
    loadData()
  }, [loadData])

  function prevMonth() {
    if (month === 1) {
      setMonth(12)
      setYear((y) => y - 1)
    } else {
      setMonth((m) => m - 1)
    }
  }

  function nextMonth() {
    if (month === 12) {
      setMonth(1)
      setYear((y) => y + 1)
    } else {
      setMonth((m) => m + 1)
    }
  }

  return (
    <div>
      {/* Month Selector */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <button
          onClick={prevMonth}
          className="p-2 rounded-md hover:bg-white/10 transition-colors text-white/50 hover:text-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-semibold text-white min-w-[200px] text-center">
          {MONTH_NAMES[month - 1]} {year}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 rounded-md hover:bg-white/10 transition-colors text-white/50 hover:text-white"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-white/40">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Loading summary...
        </div>
      ) : !summary ? (
        <div className="text-center py-16 text-white/40">
          No data available.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#171717] border border-white/10 rounded-lg p-5">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Confirmed Revenue</p>
              <p className="text-2xl font-bold text-green-400">{formatCurrency(summary.totalConfirmed)}</p>
            </div>
            <div className="bg-[#171717] border border-white/10 rounded-lg p-5">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Pending Revenue</p>
              <p className="text-2xl font-bold text-yellow-400">{formatCurrency(summary.totalPending)}</p>
            </div>
            <div className="bg-[#171717] border border-white/10 rounded-lg p-5">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Total Transactions</p>
              <p className="text-2xl font-bold text-white">{summary.transactionCount}</p>
            </div>
          </div>

          {/* Payment Method Breakdown */}
          <div className="bg-[#171717] border border-white/10 rounded-lg p-5">
            <h3 className="text-white/60 text-xs uppercase tracking-wider mb-4">By Payment Method</h3>
            <div className="space-y-3">
              {[
                { label: 'Bank Transfer', value: summary.byPaymentMethod.bank_transfer, color: 'bg-blue-500' },
                { label: 'QRIS', value: summary.byPaymentMethod.qris, color: 'bg-purple-500' },
                { label: 'Cash', value: summary.byPaymentMethod.cash, color: 'bg-green-500' },
                { label: 'Other', value: summary.byPaymentMethod.other, color: 'bg-gray-500' },
              ].map((item) => {
                const total = summary.totalConfirmed + summary.totalPending
                const pct = total > 0 ? (item.value / total) * 100 : 0
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white/70 text-sm">{item.label}</span>
                      <span className="text-white text-sm font-medium">{formatCurrency(item.value)}</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
