'use client'

import { useEffect, useState, useCallback } from 'react'
import { Loader2, CheckCircle } from 'lucide-react'
import { getFollowUpsDue, markFollowUpComplete } from '@/lib/admin/conversations'
import { formatDate } from '@/lib/admin/constants'
import type { ConversationWithCustomer } from '@/lib/admin/types'

function ChannelBadge({ channel }: { channel: string }) {
  const styles: Record<string, string> = {
    whatsapp: 'bg-green-500/20 text-green-400',
    phone: 'bg-blue-500/20 text-blue-400',
    instagram: 'bg-purple-500/20 text-purple-400',
    in_person: 'bg-gray-500/20 text-gray-400',
    email: 'bg-gray-500/20 text-gray-400',
  }
  const labels: Record<string, string> = {
    whatsapp: 'WhatsApp',
    phone: 'Phone',
    instagram: 'Instagram',
    in_person: 'In Person',
    email: 'Email',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[channel] ?? styles.email}`}>
      {labels[channel] ?? channel}
    </span>
  )
}

function daysDiff(dateStr: string): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.floor((now.getTime() - target.getTime()) / (1000 * 60 * 60 * 24))
}

interface GroupedFollowUps {
  overdue: ConversationWithCustomer[]
  today: ConversationWithCustomer[]
  thisWeek: ConversationWithCustomer[]
  later: ConversationWithCustomer[]
}

function groupFollowUps(items: ConversationWithCustomer[]): GroupedFollowUps {
  const groups: GroupedFollowUps = { overdue: [], today: [], thisWeek: [], later: [] }

  for (const item of items) {
    if (!item.follow_up_due_at) continue
    const diff = daysDiff(item.follow_up_due_at)
    if (diff > 0) {
      groups.overdue.push(item)
    } else if (diff === 0) {
      groups.today.push(item)
    } else if (diff >= -7) {
      groups.thisWeek.push(item)
    } else {
      groups.later.push(item)
    }
  }

  return groups
}

export default function FollowUpTracker() {
  const [followUps, setFollowUps] = useState<ConversationWithCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [markingIds, setMarkingIds] = useState<Set<string>>(new Set())

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getFollowUpsDue()
      setFollowUps(data)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleMarkComplete(id: string) {
    setMarkingIds((prev) => new Set(prev).add(id))
    try {
      await markFollowUpComplete(id)
      setFollowUps((prev) => prev.filter((f) => f.id !== id))
    } catch {
      // silent
    } finally {
      setMarkingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/40">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading follow-ups...
      </div>
    )
  }

  if (followUps.length === 0) {
    return (
      <div className="text-center py-16 text-white/40">
        No pending follow-ups. All caught up!
      </div>
    )
  }

  const groups = groupFollowUps(followUps)

  const sections = [
    { key: 'overdue', label: 'Overdue', items: groups.overdue, color: 'text-red-400', borderColor: 'border-red-500/30' },
    { key: 'today', label: 'Today', items: groups.today, color: 'text-orange-400', borderColor: 'border-orange-500/30' },
    { key: 'thisWeek', label: 'This Week', items: groups.thisWeek, color: 'text-yellow-400', borderColor: 'border-yellow-500/30' },
    { key: 'later', label: 'Upcoming', items: groups.later, color: 'text-white/50', borderColor: 'border-white/10' },
  ]

  return (
    <div className="space-y-6">
      {sections.map(
        (section) =>
          section.items.length > 0 && (
            <div key={section.key}>
              <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${section.color}`}>
                {section.label} ({section.items.length})
              </h3>
              <div className="space-y-2">
                {section.items.map((item) => {
                  const overdueDays = daysDiff(item.follow_up_due_at!)
                  return (
                    <div
                      key={item.id}
                      className={`bg-[#171717] border ${section.borderColor} rounded-lg p-4 flex items-start gap-4`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium text-sm">
                            {item.customer_name ?? 'Unknown'}
                          </span>
                          <ChannelBadge channel={item.channel} />
                        </div>
                        <p className="text-white/50 text-sm truncate">
                          {item.summary.length > 100 ? `${item.summary.slice(0, 100)}...` : item.summary}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
                          <span>Due: {formatDate(item.follow_up_due_at)}</span>
                          {overdueDays > 0 && (
                            <span className="text-red-400">{overdueDays} day{overdueDays > 1 ? 's' : ''} overdue</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleMarkComplete(item.id)}
                        disabled={markingIds.has(item.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-green-500/20 text-green-400 hover:bg-green-500/30 disabled:opacity-50 transition-colors whitespace-nowrap"
                      >
                        {markingIds.has(item.id) ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle className="h-3.5 w-3.5" />
                        )}
                        Mark Complete
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )
      )}
    </div>
  )
}
