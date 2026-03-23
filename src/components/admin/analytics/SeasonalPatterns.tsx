'use client'

import { useEffect, useState } from 'react'
import { getSeasonalPatterns, type SeasonalData } from '@/lib/admin/analytics'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function SeasonalPatterns() {
  const [data, setData] = useState<SeasonalData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSeasonalPatterns().then((d) => {
      setData(d)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-32 bg-white/5 rounded" />
        <div className="h-32 bg-white/5 rounded" />
      </div>
    )
  }

  if (!data) {
    return <p className="text-white/40 text-sm">No seasonal data available yet.</p>
  }

  const maxDayCount = Math.max(...data.byDayOfWeek.map((d) => d.count), 1)
  // Show hours 7am to 7pm
  const hourRange = data.byHour.filter((h) => h.hour >= 7 && h.hour <= 19)
  const maxHourCount = Math.max(...hourRange.map((h) => h.count), 1)

  return (
    <div className="space-y-6">
      {/* Day of week */}
      <div>
        <h4 className="text-xs text-white/40 uppercase tracking-wider mb-3">Bookings by Day of Week</h4>
        <div className="flex items-end gap-2 h-28">
          {data.byDayOfWeek.map((d) => {
            const heightPct = (d.count / maxDayCount) * 100
            return (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-white/50">{d.count}</span>
                <div className="w-full flex flex-col justify-end" style={{ height: '80px' }}>
                  <div
                    className="w-full bg-blue-500 rounded-t transition-all"
                    style={{ height: `${heightPct}%`, minHeight: d.count > 0 ? '4px' : '0' }}
                  />
                </div>
                <span className="text-[10px] text-white/40">{DAY_LABELS[d.day]}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Hour distribution */}
      <div>
        <h4 className="text-xs text-white/40 uppercase tracking-wider mb-3">Bookings by Hour (7AM - 7PM)</h4>
        <div className="flex items-end gap-1 h-28">
          {hourRange.map((h) => {
            const heightPct = (h.count / maxHourCount) * 100
            return (
              <div key={h.hour} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] text-white/50">{h.count > 0 ? h.count : ''}</span>
                <div className="w-full flex flex-col justify-end" style={{ height: '80px' }}>
                  <div
                    className="w-full bg-purple-500 rounded-t transition-all"
                    style={{ height: `${heightPct}%`, minHeight: h.count > 0 ? '4px' : '0' }}
                  />
                </div>
                <span className="text-[9px] text-white/40">{h.hour}:00</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
