'use client'

import { useState, useEffect } from 'react'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { getEmployees, calculatePayslip } from '@/lib/admin/team'
import { formatCurrency } from '@/lib/admin/constants'
import type { EmployeeExtended, PayslipResult } from '@/lib/admin/types'
import AdminSelect from '@/components/admin/AdminSelect'

const SERVICE_LABELS: Record<string, string> = {
  standard_wash: 'Standard Wash',
  professional: 'Professional',
  elite_wash: 'Elite Wash',
  interior_detail: 'Interior Detail',
  exterior_detail: 'Exterior Detail',
  window_detail: 'Window Detail',
  tire_rims: 'Tire & Rims',
  full_detail: 'Full Detail',
  premium_wash: 'Premium Wash',
  ceramic_coating: 'Ceramic Coating',
  paint_correction: 'Paint Correction',
  engine_bay: 'Engine Bay',
  subscription_wash: 'Subscription Wash',
}

const SERVICE_BONUS_RATES: Record<string, number> = {
  standard_wash: 20_000,
  professional: 35_000,
  elite_wash: 50_000,
  interior_detail: 50_000,
  exterior_detail: 50_000,
  window_detail: 30_000,
  tire_rims: 15_000,
  full_detail: 150_000,
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export default function PayslipCalculator() {
  const now = new Date()
  const [employees, setEmployees] = useState<EmployeeExtended[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [attendanceBonus, setAttendanceBonus] = useState(true)
  const [payslip, setPayslip] = useState<PayslipResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingEmployees, setLoadingEmployees] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const list = await getEmployees({ status: 'active' })
        setEmployees(list)
      } catch (err) {
        console.error('Failed to load employees:', err)
      } finally {
        setLoadingEmployees(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!selectedId) {
      setPayslip(null)
      return
    }
    async function calc() {
      setLoading(true)
      try {
        const result = await calculatePayslip(selectedId, year, month, attendanceBonus)
        setPayslip(result)
      } catch (err) {
        console.error('Failed to calculate payslip:', err)
        setPayslip(null)
      } finally {
        setLoading(false)
      }
    }
    calc()
  }, [selectedId, year, month, attendanceBonus])

  const selectClasses =
    'rounded-lg border border-white/10 bg-[#0A0A0A] px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500'

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Selectors */}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs text-white/40 mb-1.5">Employee</label>
          <AdminSelect
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="min-w-[200px]"
            disabled={loadingEmployees}
          >
            <option value="">Select employee...</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </AdminSelect>
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1.5">Month</label>
          <AdminSelect
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={i} value={i + 1}>{name}</option>
            ))}
          </AdminSelect>
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1.5">Year</label>
          <AdminSelect
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </AdminSelect>
        </div>
      </div>

      {/* Payslip Card */}
      {!selectedId ? (
        <div className="rounded-lg border border-white/10 bg-[#171717] p-10 text-center">
          <p className="text-white/40 text-sm">Select an employee to view their payslip.</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 text-orange-500 animate-spin" />
        </div>
      ) : payslip ? (
        <div className="rounded-lg border border-white/10 bg-[#171717] p-6 space-y-6">
          {/* Header */}
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-lg font-bold text-white">
              Payslip — {MONTH_NAMES[month - 1]} {year}
            </h3>
            <p className="text-sm text-white/40 mt-1">
              {payslip.jobCount} jobs completed | Avg rating: {payslip.avgRating > 0 ? payslip.avgRating.toFixed(1) : 'N/A'}
            </p>
          </div>

          {/* Base Salary */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Base Salary</span>
            <span className="text-sm text-white font-medium">{formatCurrency(payslip.baseSalary)}</span>
          </div>

          {/* Service Bonuses Table */}
          <div>
            <h4 className="text-sm font-medium text-white/80 mb-3">Service Bonuses</h4>
            {payslip.serviceBreakdown.length === 0 ? (
              <p className="text-xs text-white/30">No completed services this period.</p>
            ) : (
              <div className="rounded-lg border border-white/5 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-white/40">
                      <th className="px-3 py-2 text-left font-medium text-xs">Service Type</th>
                      <th className="px-3 py-2 text-right font-medium text-xs">Count</th>
                      <th className="px-3 py-2 text-right font-medium text-xs">Bonus/Job</th>
                      <th className="px-3 py-2 text-right font-medium text-xs">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {payslip.serviceBreakdown.map((s) => (
                      <tr key={s.type}>
                        <td className="px-3 py-2 text-white/60">{SERVICE_LABELS[s.type] ?? s.type}</td>
                        <td className="px-3 py-2 text-white/60 text-right">{s.count}</td>
                        <td className="px-3 py-2 text-white/60 text-right">
                          {formatCurrency(SERVICE_BONUS_RATES[s.type] ?? 0)}
                        </td>
                        <td className="px-3 py-2 text-white font-medium text-right">
                          {formatCurrency(s.bonus)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
              <span className="text-sm text-white/60">Total Service Bonus</span>
              <span className="text-sm text-white font-medium">{formatCurrency(payslip.totalServiceBonus)}</span>
            </div>
          </div>

          {/* Quality Bonus */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/60">Quality Bonus</span>
              {payslip.qualityBonus > 0 ? (
                <span className="flex items-center gap-1 text-xs text-green-400">
                  <CheckCircle className="h-3 w-3" /> 0 complaints, avg {'>'}= 4.8
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-white/30">
                  <XCircle className="h-3 w-3" /> Criteria not met
                </span>
              )}
            </div>
            <span className="text-sm text-white font-medium">{formatCurrency(payslip.qualityBonus)}</span>
          </div>

          {/* Attendance Bonus */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-white/60">Attendance Bonus</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={attendanceBonus}
                  onChange={(e) => setAttendanceBonus(e.target.checked)}
                  className="rounded border-white/20 bg-[#0A0A0A] text-orange-500 focus:ring-orange-500 focus:ring-offset-0 h-4 w-4"
                />
                <span className="text-xs text-white/40">Eligible</span>
              </label>
            </div>
            <span className="text-sm text-white font-medium">{formatCurrency(payslip.attendanceBonus)}</span>
          </div>

          {/* Total */}
          <div className="border-t border-white/10 pt-4 flex items-center justify-between">
            <span className="text-lg font-bold text-white">TOTAL COMPENSATION</span>
            <span className="text-xl font-bold text-orange-500">{formatCurrency(payslip.totalComp)}</span>
          </div>
        </div>
      ) : null}
    </div>
  )
}
