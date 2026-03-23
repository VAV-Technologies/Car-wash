'use client'

import { useEffect, useState } from 'react'
import { Loader2, ChevronRight, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { SEGMENTS } from '@/lib/admin/constants'

interface SegmentCount {
  segment: string
  label: string
  count: number
  color: string
  bgClass: string
  textClass: string
}

interface SegmentCustomer {
  id: string
  name: string
  phone: string
  car_model: string | null
}

export default function SegmentView() {
  const [loading, setLoading] = useState(true)
  const [segments, setSegments] = useState<SegmentCount[]>([])
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null)
  const [customers, setCustomers] = useState<SegmentCustomer[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('segment')

        if (error) throw error

        // Count by segment
        const counts: Record<string, number> = {}
        for (const row of data ?? []) {
          const seg = (row.segment as string) ?? 'new'
          counts[seg] = (counts[seg] ?? 0) + 1
        }

        const result: SegmentCount[] = SEGMENTS.map((s) => ({
          segment: s.value,
          label: s.label,
          count: counts[s.value] ?? 0,
          color: s.color,
          bgClass: s.bgClass,
          textClass: s.textClass,
        })).sort((a, b) => b.count - a.count)

        setSegments(result)
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function loadSegmentCustomers(segment: string) {
    setSelectedSegment(segment)
    setLoadingCustomers(true)
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, phone, car_model')
        .eq('segment', segment)
        .order('name', { ascending: true })
        .limit(50)

      if (error) throw error

      setCustomers((data ?? []) as SegmentCustomer[])
    } catch {
      setCustomers([])
    } finally {
      setLoadingCustomers(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/40">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading segment data...
      </div>
    )
  }

  const totalCustomers = segments.reduce((s, seg) => s + seg.count, 0)
  const maxCount = Math.max(...segments.map((s) => s.count), 1)

  return (
    <div className="space-y-6">
      {/* Segment Bars */}
      <div className="border border-white/10 bg-[#171717] rounded-lg p-6">
        <h3 className="text-sm font-medium text-white/70 mb-4">
          Customer Segments ({totalCustomers} total)
        </h3>
        <div className="space-y-3">
          {segments.map((seg) => {
            const pct = (seg.count / maxCount) * 100
            const share =
              totalCustomers > 0 ? ((seg.count / totalCustomers) * 100).toFixed(1) : '0'
            const isSelected = selectedSegment === seg.segment
            return (
              <button
                key={seg.segment}
                onClick={() => loadSegmentCustomers(seg.segment)}
                className={`w-full text-left rounded-lg p-3 transition-colors border ${
                  isSelected
                    ? 'border-orange-500/50 bg-orange-500/5'
                    : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${seg.bgClass} ${seg.textClass}`}
                    >
                      {seg.label}
                    </span>
                    <span className="text-sm text-white font-medium">{seg.count}</span>
                    <span className="text-xs text-white/30">({share}%)</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-white/20" />
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: seg.color }}
                  />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Segment Customer List */}
      {selectedSegment && (
        <div className="border border-white/10 bg-[#171717] rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="text-sm font-medium text-white/70">
              {SEGMENTS.find((s) => s.value === selectedSegment)?.label ?? selectedSegment} Customers
            </h3>
            <button
              onClick={() => {
                setSelectedSegment(null)
                setCustomers([])
              }}
              className="text-white/30 hover:text-white/60"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {loadingCustomers ? (
            <div className="flex items-center justify-center py-10 text-white/40">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading...
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-10 text-white/40 text-sm">
              No customers in this segment.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-4 py-3 text-white/50 font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-white/50 font-medium">Phone</th>
                  <th className="text-left px-4 py-3 text-white/50 font-medium">Car</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-white/70">{c.name}</td>
                    <td className="px-4 py-3 text-white/50">{c.phone}</td>
                    <td className="px-4 py-3 text-white/40">{c.car_model ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
