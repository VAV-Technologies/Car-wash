'use client'

import { useEffect, useState } from 'react'
import { Loader2, Users, Trophy } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface TopReferrer {
  name: string
  referral_count: number
}

export default function ReferralDashboard() {
  const [loading, setLoading] = useState(true)
  const [totalReferrals, setTotalReferrals] = useState(0)
  const [topReferrers, setTopReferrers] = useState<TopReferrer[]>([])
  const [repeatCount, setRepeatCount] = useState(0)
  const [referredCount, setReferredCount] = useState(0)

  useEffect(() => {
    async function load() {
      try {
        // Customers with referred_by set
        const { data: referredCustomers, error } = await supabase
          .from('customers')
          .select('id, referred_by')
          .not('referred_by', 'is', null)

        if (error) throw error

        const referred = referredCustomers ?? []
        setTotalReferrals(referred.length)
        setReferredCount(referred.length)

        // Group by referred_by to find top referrers
        const referrerCounts: Record<string, number> = {}
        for (const c of referred) {
          const refId = c.referred_by as string
          referrerCounts[refId] = (referrerCounts[refId] ?? 0) + 1
        }

        // Get referrer names
        const referrerIds = Object.keys(referrerCounts)
        if (referrerIds.length > 0) {
          const { data: referrerData } = await supabase
            .from('customers')
            .select('id, name')
            .in('id', referrerIds)

          const nameMap: Record<string, string> = {}
          for (const r of referrerData ?? []) {
            nameMap[r.id] = r.name
          }

          const sorted = Object.entries(referrerCounts)
            .map(([id, count]) => ({
              name: nameMap[id] ?? 'Unknown',
              referral_count: count,
            }))
            .sort((a, b) => b.referral_count - a.referral_count)

          setTopReferrers(sorted.slice(0, 10))
        }

        // Referral conversion: how many referred customers have >1 service
        if (referred.length > 0) {
          const referredIds = referred.map((c) => c.id)
          const { data: statsData } = await supabase
            .from('customer_stats')
            .select('customer_id, total_services')
            .in('customer_id', referredIds)
            .gt('total_services', 1)

          setRepeatCount((statsData ?? []).length)
        }
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
        Loading referral data...
      </div>
    )
  }

  const conversionRate =
    referredCount > 0 ? ((repeatCount / referredCount) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-white/10 bg-[#171717] rounded-lg p-5">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-white/30" />
            <p className="text-xs text-white/50 uppercase tracking-wide">Total Referrals</p>
          </div>
          <p className="text-2xl font-bold text-white">{totalReferrals}</p>
          <p className="text-xs text-white/40 mt-1">customers with a referrer</p>
        </div>

        <div className="border border-white/10 bg-[#171717] rounded-lg p-5">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-4 w-4 text-white/30" />
            <p className="text-xs text-white/50 uppercase tracking-wide">Top Referrers</p>
          </div>
          <p className="text-2xl font-bold text-white">{topReferrers.length}</p>
          <p className="text-xs text-white/40 mt-1">unique referrers</p>
        </div>

        <div className="border border-white/10 bg-[#171717] rounded-lg p-5">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-white/30" />
            <p className="text-xs text-white/50 uppercase tracking-wide">Referral Conversion</p>
          </div>
          <p className="text-2xl font-bold text-white">{conversionRate}%</p>
          <p className="text-xs text-white/40 mt-1">
            {repeatCount} of {referredCount} became repeat customers
          </p>
        </div>
      </div>

      {/* Top Referrers Table */}
      <div className="border border-white/10 bg-[#171717] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10">
          <h3 className="text-sm font-medium text-white/70">Top Referrers</h3>
        </div>
        {topReferrers.length === 0 ? (
          <div className="text-center py-10 text-white/40 text-sm">
            No referrals recorded yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-4 py-3 text-white/50 font-medium">Rank</th>
                <th className="text-left px-4 py-3 text-white/50 font-medium">Customer</th>
                <th className="text-right px-4 py-3 text-white/50 font-medium">Referrals</th>
              </tr>
            </thead>
            <tbody>
              {topReferrers.map((r, i) => (
                <tr key={r.name + i} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-white/30">#{i + 1}</td>
                  <td className="px-4 py-3 text-white/70">{r.name}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-orange-500/20 text-orange-400 font-medium">
                      {r.referral_count}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
