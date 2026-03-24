'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { getMonthlyEarnings, MonthlyEarnings } from '@/lib/earnings'
import { formatCurrency } from '@/lib/constants'
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const BONUS_REFERENCE = [
  { label: 'Standard Wash', amount: 20000 },
  { label: 'Professional', amount: 35000 },
  { label: 'Elite Wash', amount: 50000 },
  { label: 'Interior Detail', amount: 50000 },
  { label: 'Exterior Detail', amount: 50000 },
  { label: 'Window Detail', amount: 30000 },
  { label: 'Tire & Rims', amount: 15000 },
  { label: 'Full Detail', amount: 150000 },
]

export default function EarningsPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [earnings, setEarnings] = useState<MonthlyEarnings | null>(null)
  const [loading, setLoading] = useState(true)

  const monthLabel = new Date(year, month - 1).toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  })

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1

  useEffect(() => {
    async function load() {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      const data = await getMonthlyEarnings(user.id, year, month)
      setEarnings(data)
      setLoading(false)
    }
    load()
  }, [year, month])

  function prevMonth() {
    if (month === 1) {
      setYear(year - 1)
      setMonth(12)
    } else {
      setMonth(month - 1)
    }
  }

  function nextMonth() {
    if (isCurrentMonth) return
    if (month === 12) {
      setYear(year + 1)
      setMonth(1)
    } else {
      setMonth(month + 1)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-4 pt-6 pb-20">
      <h1 className="text-xl font-bold mb-4">Earnings</h1>

      {/* Month selector */}
      <div className="flex items-center justify-between mb-6 bg-[#171717] rounded-xl px-4 py-3">
        <button onClick={prevMonth} className="p-1 text-white/60 hover:text-white">
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-medium">{monthLabel}</span>
        <button
          onClick={nextMonth}
          className={`p-1 ${isCurrentMonth ? 'text-white/20 cursor-not-allowed' : 'text-white/60 hover:text-white'}`}
          disabled={isCurrentMonth}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-orange-500" size={28} />
        </div>
      ) : earnings ? (
        <div className="space-y-4">
          {/* Payslip Card */}
          <div className="bg-[#171717] rounded-xl border border-white/10 p-5 space-y-4">
            {/* Base Salary */}
            <div className="flex justify-between items-center">
              <span className="text-white/70">Base Salary</span>
              <span className="font-medium">{formatCurrency(earnings.baseSalary)}</span>
            </div>

            <div className="border-t border-white/10" />

            {/* Per-Service Bonuses */}
            <div>
              <p className="text-white/50 text-xs uppercase tracking-wide mb-3">
                Per-Service Bonuses
              </p>
              {earnings.serviceBreakdown.length === 0 ? (
                <p className="text-white/30 text-sm">No completed jobs this month</p>
              ) : (
                <div className="space-y-2">
                  {earnings.serviceBreakdown.map((item) => (
                    <div key={item.type} className="flex justify-between items-center text-sm">
                      <span className="text-white/70">
                        {item.label}{' '}
                        <span className="text-white/40">({item.count}x)</span>
                      </span>
                      <span>{formatCurrency(item.bonus)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-white/10" />

            {/* Service Bonus Subtotal */}
            <div className="flex justify-between items-center">
              <span className="text-white/70">Service Bonus Subtotal</span>
              <span className="font-medium">{formatCurrency(earnings.totalServiceBonus)}</span>
            </div>

            <div className="border-t border-white/10" />

            {/* Quality Bonus */}
            <div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-white/70">Quality Bonus</span>
                  {earnings.qualityQualified ? (
                    <CheckCircle2 size={16} className="text-green-400" />
                  ) : (
                    <XCircle size={16} className="text-red-400" />
                  )}
                </div>
                <span className={earnings.qualityQualified ? 'font-medium' : 'text-white/30 line-through'}>
                  {formatCurrency(500000)}
                </span>
              </div>
              <p className="text-xs text-white/40 mt-1">
                {earnings.avgRating !== null
                  ? `${earnings.complaintCount} complaint${earnings.complaintCount !== 1 ? 's' : ''}, avg ${earnings.avgRating} stars`
                  : 'No ratings yet'}
              </p>
            </div>

            {/* Attendance Bonus */}
            <div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-white/70">Attendance Bonus</span>
                  <CheckCircle2 size={16} className="text-green-400" />
                </div>
                <span className="font-medium">{formatCurrency(earnings.attendanceBonus)}</span>
              </div>
              <p className="text-xs text-white/40 mt-1">0 unexcused absences</p>
            </div>

            <div className="border-t border-white/10" />

            {/* Total */}
            <div className="flex justify-between items-center pt-1">
              <span className="text-lg font-bold">TOTAL COMPENSATION</span>
              <span className="text-lg font-bold text-orange-500">
                {formatCurrency(earnings.totalComp)}
              </span>
            </div>
          </div>

          {/* Bonus Rates Reference */}
          <div className="bg-[#171717] rounded-xl border border-white/10 p-5">
            <p className="text-white/50 text-xs uppercase tracking-wide mb-3">
              Bonus Rates Reference
            </p>
            <div className="space-y-2">
              {BONUS_REFERENCE.map((item) => (
                <div key={item.label} className="flex justify-between items-center text-sm">
                  <span className="text-white/60">{item.label}</span>
                  <span className="text-white/80">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
