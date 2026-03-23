'use client'

import { useEffect, useState } from 'react'
import { Loader2, Target } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const BREAK_EVEN_MIXED = 32
const BREAK_EVEN_STANDARD_ONLY = 57

export default function BreakEvenMonitor() {
  const [loading, setLoading] = useState(true)
  const [servicesCount, setServicesCount] = useState(0)

  useEffect(() => {
    async function load() {
      try {
        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth() + 1
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`
        const endDate =
          month === 12
            ? `${year + 1}-01-01`
            : `${year}-${String(month + 1).padStart(2, '0')}-01`

        const { count } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed')
          .gte('completed_at', startDate)
          .lt('completed_at', endDate)

        setServicesCount(count ?? 0)
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
        Loading break-even data...
      </div>
    )
  }

  const mixedPct = Math.min((servicesCount / BREAK_EVEN_MIXED) * 100, 100)
  const standardPct = Math.min((servicesCount / BREAK_EVEN_STANDARD_ONLY) * 100, 100)

  const mixedReached = servicesCount >= BREAK_EVEN_MIXED
  const standardReached = servicesCount >= BREAK_EVEN_STANDARD_ONLY

  return (
    <div className="space-y-6">
      {/* Current Count */}
      <div className="border border-white/10 bg-[#171717] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-4 w-4 text-orange-400" />
          <h3 className="text-sm font-medium text-white/70">Current Month Services</h3>
        </div>
        <p className="text-4xl font-bold text-white">{servicesCount}</p>
        <p className="text-sm text-white/40 mt-1">completed services this month</p>
      </div>

      {/* Mixed Break-Even */}
      <div className="border border-white/10 bg-[#171717] rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-white/70">
            Break-Even (Mixed Service Mix)
          </h3>
          <span className={`text-sm font-bold ${mixedReached ? 'text-green-400' : 'text-yellow-400'}`}>
            {servicesCount} / {BREAK_EVEN_MIXED}
          </span>
        </div>
        <p className="text-xs text-white/40 mb-3">
          Assumes a mix of standard, professional, and premium services
        </p>
        <div className="w-full h-4 bg-white/5 rounded-full relative overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              mixedReached ? 'bg-green-500' : 'bg-orange-500'
            }`}
            style={{ width: `${mixedPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-white/30">
          <span>0</span>
          <span>{BREAK_EVEN_MIXED} services</span>
        </div>
        {mixedReached && (
          <p className="text-xs text-green-400 mt-2">Break-even reached for mixed service model</p>
        )}
      </div>

      {/* Standard-Only Break-Even */}
      <div className="border border-white/10 bg-[#171717] rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-white/70">
            Break-Even (Standard Only)
          </h3>
          <span className={`text-sm font-bold ${standardReached ? 'text-green-400' : 'text-yellow-400'}`}>
            {servicesCount} / {BREAK_EVEN_STANDARD_ONLY}
          </span>
        </div>
        <p className="text-xs text-white/40 mb-3">
          Assumes all services are standard wash at Rp 349.000
        </p>
        <div className="w-full h-4 bg-white/5 rounded-full relative overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              standardReached ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${standardPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-white/30">
          <span>0</span>
          <span>{BREAK_EVEN_STANDARD_ONLY} services</span>
        </div>
        {standardReached && (
          <p className="text-xs text-green-400 mt-2">Break-even reached for standard-only model</p>
        )}
      </div>
    </div>
  )
}
