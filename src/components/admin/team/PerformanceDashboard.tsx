'use client'

import { useState, useEffect } from 'react'
import { Loader2, Star, Briefcase, TrendingUp, Target } from 'lucide-react'
import { getEmployees, getEmployeeStats } from '@/lib/admin/team'
import type { EmployeeExtended, EmployeePerformanceStats } from '@/lib/admin/types'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export default function PerformanceDashboard() {
  const now = new Date()
  const [employees, setEmployees] = useState<EmployeeExtended[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [stats, setStats] = useState<EmployeePerformanceStats | null>(null)
  const [prevStats, setPrevStats] = useState<EmployeePerformanceStats | null>(null)
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
      setStats(null)
      setPrevStats(null)
      return
    }
    async function load() {
      setLoading(true)
      try {
        const current = await getEmployeeStats(selectedId, year, month)
        setStats(current)

        // Previous month
        const prevMonth = month === 1 ? 12 : month - 1
        const prevYear = month === 1 ? year - 1 : year
        try {
          const prev = await getEmployeeStats(selectedId, prevYear, prevMonth)
          setPrevStats(prev)
        } catch {
          setPrevStats(null)
        }
      } catch (err) {
        console.error('Failed to load stats:', err)
        setStats(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [selectedId, year, month])

  function renderDelta(current: number, previous: number | undefined, suffix: string = '') {
    if (previous === undefined || previous === null) return null
    const diff = current - previous
    if (diff === 0) return <span className="text-xs text-white/30">No change</span>
    const isPositive = diff > 0
    return (
      <span className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? '+' : ''}{diff.toFixed(suffix === '%' ? 1 : 0)}{suffix} vs prev month
      </span>
    )
  }

  function renderStars(rating: number) {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${i <= Math.round(rating) ? 'text-orange-400 fill-orange-400' : 'text-white/20'}`}
        />
      )
    }
    return <div className="flex items-center gap-0.5">{stars}</div>
  }

  const selectClasses =
    'rounded-lg border border-white/10 bg-[#0A0A0A] px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500'

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Selectors */}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs text-white/40 mb-1.5">Employee</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className={`${selectClasses} min-w-[200px]`}
            disabled={loadingEmployees}
          >
            <option value="">Select employee...</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1.5">Month</label>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className={selectClasses}
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={i} value={i + 1}>{name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1.5">Year</label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className={selectClasses}
          >
            {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {!selectedId ? (
        <div className="rounded-lg border border-white/10 bg-[#171717] p-10 text-center">
          <p className="text-white/40 text-sm">Select an employee to view performance.</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 text-orange-500 animate-spin" />
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Jobs This Month */}
          <div className="rounded-lg border border-white/10 bg-[#171717] p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-lg bg-blue-500/20 p-2">
                <Briefcase className="h-4 w-4 text-blue-400" />
              </div>
              <span className="text-sm text-white/40">Jobs This Month</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.jobsThisMonth}</p>
            <div className="mt-2">
              {renderDelta(stats.jobsThisMonth, prevStats?.jobsThisMonth)}
            </div>
          </div>

          {/* Average Rating */}
          <div className="rounded-lg border border-white/10 bg-[#171717] p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-lg bg-orange-500/20 p-2">
                <Star className="h-4 w-4 text-orange-400" />
              </div>
              <span className="text-sm text-white/40">Avg Rating</span>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-2xl font-bold text-white">
                {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : 'N/A'}
              </p>
              {stats.avgRating > 0 && renderStars(stats.avgRating)}
            </div>
            <div className="mt-2">
              {renderDelta(stats.avgRating, prevStats?.avgRating)}
            </div>
          </div>

          {/* Upsell Attempt Rate */}
          <div className="rounded-lg border border-white/10 bg-[#171717] p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-lg bg-purple-500/20 p-2">
                <TrendingUp className="h-4 w-4 text-purple-400" />
              </div>
              <span className="text-sm text-white/40">Upsell Attempt Rate</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.upsellAttemptRate.toFixed(1)}%</p>
            <div className="mt-2">
              {renderDelta(stats.upsellAttemptRate, prevStats?.upsellAttemptRate, '%')}
            </div>
          </div>

          {/* Upsell Conversion Rate */}
          <div className="rounded-lg border border-white/10 bg-[#171717] p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-lg bg-green-500/20 p-2">
                <Target className="h-4 w-4 text-green-400" />
              </div>
              <span className="text-sm text-white/40">Upsell Conversion Rate</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.upsellConversionRate.toFixed(1)}%</p>
            <div className="mt-2">
              {renderDelta(stats.upsellConversionRate, prevStats?.upsellConversionRate, '%')}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
