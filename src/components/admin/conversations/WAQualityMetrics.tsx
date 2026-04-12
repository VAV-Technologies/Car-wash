'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Image,
  BarChart3,
} from 'lucide-react'

interface MetricsSummary {
  totalConversations: number
  totalBookings: number
  conversionRate: number
  avgMessagesToBooking: number
  dropOffsByState: Record<string, number>
  errorRate: number
  imageSuccessRate: number
  dailyConversations: Array<{ date: string; count: number }>
  dailyBookings: Array<{ date: string; count: number }>
}

const STATE_LABELS: Record<string, string> = {
  greeting: 'Greeting',
  awaiting_name: 'Awaiting Name',
  awaiting_intent: 'Awaiting Intent',
  showing_packages: 'Showing Packages',
  collecting_info: 'Collecting Info',
  confirming_booking: 'Confirming',
  booking_complete: 'Completed',
  general_chat: 'General Chat',
  unknown: 'Unknown',
}

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string
  value: string | number
  sub?: string
  icon: any
  color: string
}) {
  return (
    <div className="border border-white/10 bg-[#171717] rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-white/40 uppercase tracking-wide">{label}</span>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-white/40 mt-1">{sub}</div>}
    </div>
  )
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export default function WAQualityMetrics() {
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  const fetchMetrics = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/whatsapp?action=shera-metrics&days=${days}`)
      if (res.ok) setMetrics(await res.json())
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/40">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading metrics...
      </div>
    )
  }

  if (!metrics) {
    return <div className="text-center py-16 text-white/40">Failed to load metrics</div>
  }

  const dropOffEntries = Object.entries(metrics.dropOffsByState).sort((a, b) => b[1] - a[1])
  const maxDropOff = dropOffEntries.length > 0 ? dropOffEntries[0][1] : 0

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/70 uppercase tracking-wide">Quality Metrics</h3>
        <div className="flex items-center gap-2">
          {[7, 14, 30].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                days === d
                  ? 'bg-orange-500 text-white'
                  : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Conversations"
          value={metrics.totalConversations}
          sub={`Last ${days} days`}
          icon={MessageSquare}
          color="text-blue-400"
        />
        <StatCard
          label="Bookings"
          value={metrics.totalBookings}
          sub={`${metrics.conversionRate}% conversion`}
          icon={Calendar}
          color="text-green-400"
        />
        <StatCard
          label="Avg Messages/Booking"
          value={metrics.avgMessagesToBooking || '-'}
          sub="Lower is better"
          icon={metrics.avgMessagesToBooking <= 10 ? TrendingDown : TrendingUp}
          color={metrics.avgMessagesToBooking <= 10 ? 'text-green-400' : 'text-orange-400'}
        />
        <StatCard
          label="Error Rate"
          value={`${metrics.errorRate}%`}
          sub="LLM failures"
          icon={metrics.errorRate <= 5 ? CheckCircle2 : AlertTriangle}
          color={metrics.errorRate <= 5 ? 'text-green-400' : 'text-red-400'}
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Image Delivery */}
        <div className="border border-white/10 bg-[#171717] rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-white/40 uppercase tracking-wide">Image Delivery</span>
            <Image className="h-4 w-4 text-purple-400" />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-white">{metrics.imageSuccessRate}%</div>
            <div className="flex-1">
              <MiniBar value={metrics.imageSuccessRate} max={100} color="bg-purple-500" />
            </div>
          </div>
          <div className="text-xs text-white/40 mt-2">
            {metrics.imageSuccessRate >= 95 ? 'Healthy' : metrics.imageSuccessRate >= 80 ? 'Degraded — check WAHA' : 'Critical — images failing'}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="border border-white/10 bg-[#171717] rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-white/40 uppercase tracking-wide">Conversion Rate</span>
            <BarChart3 className="h-4 w-4 text-green-400" />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-white">{metrics.conversionRate}%</div>
            <div className="flex-1">
              <MiniBar value={metrics.conversionRate} max={100} color="bg-green-500" />
            </div>
          </div>
          <div className="text-xs text-white/40 mt-2">
            {metrics.totalConversations} conversations → {metrics.totalBookings} bookings
          </div>
        </div>
      </div>

      {/* Drop-offs by State */}
      {dropOffEntries.length > 0 && (
        <div className="border border-white/10 bg-[#171717] rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-white/40 uppercase tracking-wide">Drop-offs by Stage</span>
            <TrendingDown className="h-4 w-4 text-red-400" />
          </div>
          <div className="space-y-3">
            {dropOffEntries.map(([state, count]) => (
              <div key={state} className="flex items-center gap-3">
                <span className="text-xs text-white/60 w-32 truncate">{STATE_LABELS[state] || state}</span>
                <div className="flex-1">
                  <MiniBar value={count} max={maxDropOff} color="bg-red-500/60" />
                </div>
                <span className="text-xs text-white/40 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
