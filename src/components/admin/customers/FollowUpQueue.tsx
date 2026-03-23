'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getFollowUpCustomers } from '@/lib/admin/customers'
import { formatDate, daysSince } from '@/lib/admin/constants'
import type { CustomerWithStats } from '@/lib/admin/types'
import SegmentBadge from './SegmentBadge'

interface FollowUpGroup {
  title: string
  description: string
  color: string
  customers: CustomerWithStats[]
}

export default function FollowUpQueue() {
  const [groups, setGroups] = useState<FollowUpGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await getFollowUpCustomers()
        setGroups([
          {
            title: '24hr Follow-up',
            description: 'Completed service yesterday — send thank-you / feedback request',
            color: 'border-blue-500/50',
            customers: data.followUp24hr,
          },
          {
            title: '14-day Re-engagement',
            description: 'Last service 14+ days ago, non-subscriber — nudge for next wash',
            color: 'border-yellow-500/50',
            customers: data.reEngagement14d,
          },
          {
            title: '30-day Churn Risk',
            description: 'Last service 30+ days ago — at risk of churning',
            color: 'border-orange-500/50',
            customers: data.churnRisk30d,
          },
          {
            title: '60-day Win-back',
            description: 'Last service 60+ days ago with 2+ past services — worth a win-back offer',
            color: 'border-red-500/50',
            customers: data.winBack60d,
          },
        ])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load follow-ups')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-white/40">Loading follow-up queue...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  const totalCount = groups.reduce((sum, g) => sum + g.customers.length, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Follow-Up Queue</h1>
        <p className="text-sm text-white/50 mt-1">
          {totalCount} customer{totalCount !== 1 ? 's' : ''} need attention
        </p>
      </div>

      {groups.map((group) => (
        <div
          key={group.title}
          className={`rounded-lg border-l-4 ${group.color} border border-white/10 bg-[#171717] overflow-hidden`}
        >
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">{group.title}</h2>
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white/60">
                {group.customers.length}
              </span>
            </div>
            <p className="text-xs text-white/40 mt-0.5">{group.description}</p>
          </div>

          {group.customers.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-white/30">
              No customers in this group.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-white/40">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-white/40">
                    Phone
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-white/40">
                    Last Service
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-white/40">
                    Days Since
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-white/40">
                    Segment
                  </th>
                </tr>
              </thead>
              <tbody>
                {group.customers.map((c) => {
                  const days = daysSince(c.last_service_date)
                  return (
                    <tr
                      key={c.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/admin/customers/${c.id}`}
                          className="font-medium text-white hover:text-orange-400 transition-colors"
                        >
                          {c.name}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-white/60">{c.phone}</td>
                      <td className="px-4 py-2.5 text-white/60">
                        {formatDate(c.last_service_date)}
                      </td>
                      <td className="px-4 py-2.5 text-white/60">
                        {days !== null ? `${days}d` : '—'}
                      </td>
                      <td className="px-4 py-2.5">
                        <SegmentBadge segment={c.segment} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  )
}
