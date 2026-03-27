'use client'

import { useEffect, useState } from 'react'
import { Loader2, AlertTriangle, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { SERVICE_TYPES } from '@/lib/admin/constants'

// Expected durations from spec (minutes)
const EXPECTED_DURATIONS: Record<string, number> = {
  standard_wash: 45,
  professional: 75,
  elite_wash: 120,
  interior_detail: 120,
  exterior_detail: 150,
  window_detail: 60,
  tire_rims: 45,
  full_detail: 240,
}

interface TimeRow {
  service_type: string
  label: string
  expected: number
  avg: number
  min: number
  max: number
  count: number
  overTarget: boolean
}

export default function TimeAnalysis() {
  const [data, setData] = useState<TimeRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data: jobs, error } = await supabase
          .from('jobs')
          .select('service_type, actual_duration_min')
          .not('completed_at', 'is', null)
          .not('actual_duration_min', 'is', null)

        if (error) throw error

        // Group by service_type
        const grouped: Record<string, number[]> = {}
        for (const job of jobs ?? []) {
          const type = job.service_type as string
          const dur = job.actual_duration_min as number
          if (!grouped[type]) grouped[type] = []
          grouped[type].push(dur)
        }

        const rows: TimeRow[] = Object.entries(grouped)
          .map(([serviceType, durations]) => {
            const avg = durations.reduce((s, d) => s + d, 0) / durations.length
            const minDur = Math.min(...durations)
            const maxDur = Math.max(...durations)
            const expected = EXPECTED_DURATIONS[serviceType] ?? 60
            const label =
              SERVICE_TYPES.find((s) => s.value === serviceType)?.label ??
              serviceType.replace(/_/g, ' ')
            return {
              service_type: serviceType,
              label,
              expected,
              avg: Math.round(avg),
              min: minDur,
              max: maxDur,
              count: durations.length,
              overTarget: avg > expected * 1.1, // >10% over expected
            }
          })
          .sort((a, b) => {
            // Show over-target first, then by avg descending
            if (a.overTarget !== b.overTarget) return a.overTarget ? -1 : 1
            return b.avg - a.avg
          })

        setData(rows)
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/40">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading time analysis...
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-16 text-white/40">
        No completed jobs with recorded durations yet.
      </div>
    )
  }

  const overTargetCount = data.filter((d) => d.overTarget).length

  return (
    <div className="space-y-4">
      {overTargetCount > 0 && (
        <div className="flex items-center gap-3 border border-yellow-500/30 bg-yellow-500/5 rounded-lg p-4">
          <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0" />
          <p className="text-sm text-yellow-400">
            {overTargetCount} service type{overTargetCount > 1 ? 's' : ''} consistently
            taking &gt;10% longer than expected
          </p>
        </div>
      )}

      <div className="border border-white/10 bg-[#171717] rounded-lg overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
          <Clock className="h-4 w-4 text-white/30" />
          <h3 className="text-sm font-medium text-white/70">Duration Analysis by Service Type</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-4 py-3 text-white/50 font-medium">Service Type</th>
              <th className="text-right px-4 py-3 text-white/50 font-medium">Expected</th>
              <th className="text-right px-4 py-3 text-white/50 font-medium">Avg Actual</th>
              <th className="text-right px-4 py-3 text-white/50 font-medium">Min</th>
              <th className="text-right px-4 py-3 text-white/50 font-medium">Max</th>
              <th className="text-right px-4 py-3 text-white/50 font-medium">Jobs</th>
              <th className="text-center px-4 py-3 text-white/50 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={row.service_type}
                className={`border-b border-white/5 ${
                  row.overTarget ? 'bg-yellow-500/[0.03]' : 'hover:bg-white/[0.02]'
                }`}
              >
                <td className="px-4 py-3 text-white/70">{row.label}</td>
                <td className="px-4 py-3 text-right text-white/40">{row.expected} min</td>
                <td className={`px-4 py-3 text-right font-medium ${
                  row.overTarget ? 'text-yellow-400' : 'text-white'
                }`}>
                  {row.avg} min
                </td>
                <td className="px-4 py-3 text-right text-white/40">{row.min} min</td>
                <td className="px-4 py-3 text-right text-white/40">{row.max} min</td>
                <td className="px-4 py-3 text-right text-white/50">{row.count}</td>
                <td className="px-4 py-3 text-center">
                  {row.overTarget ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-yellow-500/20 text-yellow-400">
                      <AlertTriangle className="h-3 w-3" />
                      Over
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">
                      On track
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
