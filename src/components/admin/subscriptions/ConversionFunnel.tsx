'use client'

import { useEffect, useState } from 'react'
import { Loader2, TrendingUp, Target } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const CONVERSION_TARGET = 10 // 10% target

interface FunnelData {
  totalOneTime: number
  pitched: number
  converted: number
}

export default function ConversionFunnel() {
  const [loading, setLoading] = useState(true)
  const [funnel, setFunnel] = useState<FunnelData>({
    totalOneTime: 0,
    pitched: 0,
    converted: 0,
  })

  useEffect(() => {
    async function load() {
      try {
        const now = new Date()
        const thirtyDaysAgo = new Date(now)
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const cutoff = thirtyDaysAgo.toISOString()

        // Total one-time customers in last 30 days (completed jobs without active subscription)
        const { data: recentJobs } = await supabase
          .from('jobs')
          .select('customer_id')
          .eq('status', 'completed')
          .gte('completed_at', cutoff)

        const uniqueCustomerIds = [...new Set((recentJobs ?? []).map((j) => j.customer_id as string))]
        const totalOneTime = uniqueCustomerIds.length

        // Subscription pitched (conversations with subscription_pitched = true in last 30 days)
        const { count: pitchedCount } = await supabase
          .from('conversations')
          .select('*', { count: 'exact', head: true })
          .eq('subscription_pitched', true)
          .gte('created_at', cutoff)

        // Converted (pitch_result = 'converted' in last 30 days)
        const { count: convertedCount } = await supabase
          .from('conversations')
          .select('*', { count: 'exact', head: true })
          .eq('subscription_pitched', true)
          .eq('pitch_result', 'converted')
          .gte('created_at', cutoff)

        setFunnel({
          totalOneTime,
          pitched: pitchedCount ?? 0,
          converted: convertedCount ?? 0,
        })
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
        Loading conversion funnel...
      </div>
    )
  }

  const pitchRate =
    funnel.totalOneTime > 0
      ? ((funnel.pitched / funnel.totalOneTime) * 100).toFixed(1)
      : '0'
  const conversionRate =
    funnel.totalOneTime > 0
      ? ((funnel.converted / funnel.totalOneTime) * 100).toFixed(1)
      : '0'
  const hitTarget = parseFloat(conversionRate) >= CONVERSION_TARGET

  const stages = [
    {
      label: 'One-Time Customers (30d)',
      count: funnel.totalOneTime,
      color: 'bg-blue-500',
      width: 100,
    },
    {
      label: 'Subscription Pitched',
      count: funnel.pitched,
      color: 'bg-orange-500',
      width: funnel.totalOneTime > 0 ? (funnel.pitched / funnel.totalOneTime) * 100 : 0,
    },
    {
      label: 'Converted to Subscriber',
      count: funnel.converted,
      color: 'bg-green-500',
      width: funnel.totalOneTime > 0 ? (funnel.converted / funnel.totalOneTime) * 100 : 0,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Conversion Rate Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-white/10 bg-[#171717] rounded-lg p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-white/30" />
            <p className="text-xs text-white/50 uppercase tracking-wide">Pitch Rate</p>
          </div>
          <p className="text-2xl font-bold text-white">{pitchRate}%</p>
          <p className="text-xs text-white/40 mt-1">
            {funnel.pitched} of {funnel.totalOneTime} pitched
          </p>
        </div>

        <div className="border border-white/10 bg-[#171717] rounded-lg p-5">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-white/30" />
            <p className="text-xs text-white/50 uppercase tracking-wide">Conversion Rate</p>
          </div>
          <p className={`text-2xl font-bold ${hitTarget ? 'text-green-400' : 'text-yellow-400'}`}>
            {conversionRate}%
          </p>
          <p className="text-xs text-white/40 mt-1">Target: {CONVERSION_TARGET}%</p>
        </div>

        <div className="border border-white/10 bg-[#171717] rounded-lg p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-white/30" />
            <p className="text-xs text-white/50 uppercase tracking-wide">Converted</p>
          </div>
          <p className="text-2xl font-bold text-white">{funnel.converted}</p>
          <p className="text-xs text-white/40 mt-1">new subscribers in 30 days</p>
        </div>
      </div>

      {/* Funnel Visualization */}
      <div className="border border-white/10 bg-[#171717] rounded-lg p-6">
        <h3 className="text-sm font-medium text-white/70 mb-6">Subscription Conversion Funnel</h3>
        <div className="space-y-4">
          {stages.map((stage, i) => (
            <div key={stage.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/70">{stage.label}</span>
                <span className="text-sm font-bold text-white">{stage.count}</span>
              </div>
              <div className="flex justify-center">
                <div
                  className="h-10 rounded-lg transition-all relative overflow-hidden"
                  style={{ width: `${Math.max(stage.width, 5)}%` }}
                >
                  <div className={`absolute inset-0 ${stage.color} opacity-30 rounded-lg`} />
                  <div className={`absolute inset-0 ${stage.color} opacity-60 rounded-lg`}
                    style={{ width: `${Math.min(stage.width, 100)}%` }}
                  />
                </div>
              </div>
              {i < stages.length - 1 && (
                <div className="flex justify-center">
                  <div className="w-px h-3 bg-white/10" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Target line */}
        <div className="mt-6 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/40">
              Conversion vs {CONVERSION_TARGET}% target
            </span>
            <span
              className={`text-xs font-medium ${hitTarget ? 'text-green-400' : 'text-yellow-400'}`}
            >
              {hitTarget ? 'Target met' : `${(CONVERSION_TARGET - parseFloat(conversionRate)).toFixed(1)}% below target`}
            </span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full mt-2 relative">
            <div
              className={`h-full rounded-full transition-all ${hitTarget ? 'bg-green-500' : 'bg-yellow-500'}`}
              style={{ width: `${Math.min((parseFloat(conversionRate) / CONVERSION_TARGET) * 100, 100)}%` }}
            />
            {/* Target marker */}
            <div
              className="absolute top-0 h-full w-0.5 bg-white/30"
              style={{ left: '100%' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
