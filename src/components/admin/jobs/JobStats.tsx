'use client'

import { useState, useEffect } from 'react'
import { getJobStats, type JobStats as JobStatsType } from '@/lib/admin/jobs'

function StatCard({
  label,
  value,
  suffix,
  children,
}: {
  label: string
  value: string | number
  suffix?: string
  children?: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#171717] p-4">
      <p className="text-xs font-medium text-white/40 uppercase tracking-wider">{label}</p>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-orange-500">{value}</span>
        {suffix && <span className="text-sm text-white/40">{suffix}</span>}
      </div>
      {children}
    </div>
  )
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5 mt-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-sm ${star <= Math.round(rating) ? 'text-orange-400' : 'text-white/10'}`}
        >
          ★
        </span>
      ))}
    </div>
  )
}

export default function JobStats() {
  const [stats, setStats] = useState<JobStatsType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await getJobStats()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="rounded-lg border border-white/10 bg-[#171717] p-4 animate-pulse">
            <div className="h-3 w-20 rounded bg-white/5" />
            <div className="mt-3 h-7 w-12 rounded bg-white/5" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
        {error}
      </div>
    )
  }

  if (!stats) return null

  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date())

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Quality Dashboard</h2>
        <span className="text-xs text-white/40">{monthName}</span>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Avg Rating" value={stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '—'}>
          {stats.avgRating > 0 && <StarDisplay rating={stats.avgRating} />}
        </StatCard>

        <StatCard label="Total Jobs" value={stats.totalJobs} suffix="this month" />

        <StatCard label="Avg Duration" value={stats.avgDuration > 0 ? stats.avgDuration : '—'} suffix="min" />

        <StatCard label="Upsell Rate" value={stats.upsellRate} suffix="%" />

        <StatCard label="Upsell Conversion" value={stats.upsellConversion} suffix="%" />
      </div>
    </div>
  )
}
