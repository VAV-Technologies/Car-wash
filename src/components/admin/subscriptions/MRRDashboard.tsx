'use client'

import { useState, useEffect } from 'react'
import { Loader2, TrendingUp, Users, Target } from 'lucide-react'
import { getActiveSubscriptionStats } from '@/lib/admin/subscriptions'
import { formatCurrency, SUBSCRIPTION_TIERS_V2 } from '@/lib/admin/constants'
import type { SubscriptionStats } from '@/lib/admin/types'

const ELITE_TARGET = 19

export default function MRRDashboard() {
  const [stats, setStats] = useState<SubscriptionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await getActiveSubscriptionStats()
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
      <div className="flex items-center justify-center py-20 text-white/40">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading MRR data...
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-400">{error}</div>
    )
  }

  if (!stats) return null

  const totalSubs = stats.byTier.essentials + stats.byTier.plus + stats.byTier.elite
  const eliteProgress = Math.min((stats.byTier.elite / ELITE_TARGET) * 100, 100)

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total MRR */}
        <div className="rounded-xl border border-white/10 bg-[#171717] p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-lg bg-orange-500/20 p-2">
              <TrendingUp className="h-5 w-5 text-orange-400" />
            </div>
            <p className="text-sm text-white/50">Total MRR</p>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalMRR)}</p>
        </div>

        {/* Total Active */}
        <div className="rounded-xl border border-white/10 bg-[#171717] p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-lg bg-green-500/20 p-2">
              <Users className="h-5 w-5 text-green-400" />
            </div>
            <p className="text-sm text-white/50">Active Subscribers</p>
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalActive}</p>
        </div>

        {/* Essentials Count */}
        <div className="rounded-xl border border-white/10 bg-[#171717] p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-block w-3 h-3 rounded-full bg-gray-500" />
            <p className="text-sm text-white/50">Essentials</p>
          </div>
          <p className="text-2xl font-bold text-white">{stats.byTier.essentials}</p>
          <p className="text-xs text-white/40 mt-1">{formatCurrency(339000)}/mo each</p>
        </div>

        {/* Plus Count */}
        <div className="rounded-xl border border-white/10 bg-[#171717] p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-block w-3 h-3 rounded-full bg-blue-500" />
            <p className="text-sm text-white/50">Plus</p>
          </div>
          <p className="text-2xl font-bold text-white">{stats.byTier.plus}</p>
          <p className="text-xs text-white/40 mt-1">{formatCurrency(449000)}/mo each</p>
        </div>
      </div>

      {/* Elite Target Progress */}
      <div className="rounded-xl border border-white/10 bg-[#171717] p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-lg bg-orange-500/20 p-2">
            <Target className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Elite Subscriber Target</p>
            <p className="text-xs text-white/40">
              {stats.byTier.elite} of {ELITE_TARGET} subscribers ({formatCurrency(1000000)}/mo each)
            </p>
          </div>
        </div>
        <div className="w-full h-4 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-500"
            style={{ width: `${eliteProgress}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-white/40">0</p>
          <p className="text-xs text-orange-400 font-medium">{Math.round(eliteProgress)}%</p>
          <p className="text-xs text-white/40">{ELITE_TARGET}</p>
        </div>
      </div>

      {/* Tier Distribution Bar */}
      <div className="rounded-xl border border-white/10 bg-[#171717] p-5">
        <p className="text-sm font-medium text-white mb-4">Tier Distribution</p>
        {totalSubs === 0 ? (
          <p className="text-sm text-white/40">No active subscriptions yet.</p>
        ) : (
          <div className="space-y-3">
            {SUBSCRIPTION_TIERS_V2.map((t) => {
              const count = stats.byTier[t.value as keyof typeof stats.byTier] ?? 0
              const pct = totalSubs > 0 ? (count / totalSubs) * 100 : 0
              return (
                <div key={t.value}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${t.textClass}`}>{t.label}</span>
                    <span className="text-sm text-white/50">
                      {count} ({Math.round(pct)}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        t.value === 'essentials'
                          ? 'bg-gray-500'
                          : t.value === 'plus'
                            ? 'bg-blue-500'
                            : 'bg-orange-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
