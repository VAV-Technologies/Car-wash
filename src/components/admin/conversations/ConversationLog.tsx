'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
} from 'lucide-react'
import { getConversations, deleteConversation } from '@/lib/admin/conversations'
import { formatDate } from '@/lib/admin/constants'
import type { ConversationWithCustomer, ConversationChannel, MessageType } from '@/lib/admin/types'
import AdminSelect from '@/components/admin/AdminSelect'
import LogConversationForm from './LogConversationForm'

function ChannelBadge({ channel }: { channel: ConversationChannel }) {
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

function MessageTypeBadge({ type }: { type: MessageType }) {
  const label = type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white/60">
      {label}
    </span>
  )
}

function DirectionIcon({ direction }: { direction: 'inbound' | 'outbound' }) {
  return direction === 'inbound' ? (
    <ArrowDownLeft className="h-4 w-4 text-blue-400" />
  ) : (
    <ArrowUpRight className="h-4 w-4 text-orange-400" />
  )
}

function FollowUpBadge({ conversation }: { conversation: ConversationWithCustomer }) {
  if (!conversation.follow_up_due_at) return <span className="text-white/20">-</span>
  if (conversation.follow_up_completed) {
    return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">Done</span>
  }
  const isOverdue = new Date(conversation.follow_up_due_at) < new Date()
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
        isOverdue ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
      }`}
    >
      {isOverdue ? 'Overdue' : 'Pending'}
    </span>
  )
}

const LIMIT = 25

export default function ConversationLog() {
  const [conversations, setConversations] = useState<ConversationWithCustomer[]>([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  // Filters
  const [filterChannel, setFilterChannel] = useState<ConversationChannel | ''>('')
  const [filterType, setFilterType] = useState<MessageType | ''>('')
  const [filterFollowUp, setFilterFollowUp] = useState<'pending' | 'completed' | ''>('')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getConversations({
        page,
        limit: LIMIT,
        channel: filterChannel || undefined,
        message_type: filterType || undefined,
        follow_up_status: filterFollowUp || undefined,
      })
      setConversations(result.data)
      setCount(result.count)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [page, filterChannel, filterType, filterFollowUp])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    setPage(1)
  }, [filterChannel, filterType, filterFollowUp])

  async function handleDeleteConversation(id: string) {
    if (!confirm('Delete this conversation? This cannot be undone.')) return
    try {
      await deleteConversation(id)
      loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete conversation')
    }
  }

  const totalPages = Math.ceil(count / LIMIT)

  function formatDateTime(dateStr: string): string {
    const d = new Date(dateStr)
    return `${formatDate(dateStr)} ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <AdminSelect
          width="w-[170px]"
          value={filterChannel}
          onChange={(e) => setFilterChannel(e.target.value as ConversationChannel | '')}
        >
          <option value="">All Channels</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="phone">Phone</option>
          <option value="instagram">Instagram</option>
          <option value="in_person">In Person</option>
          <option value="email">Email</option>
        </AdminSelect>

        <AdminSelect
          width="w-[170px]"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as MessageType | '')}
        >
          <option value="">All Types</option>
          <option value="general">General</option>
          <option value="booking_request">Booking Request</option>
          <option value="follow_up">Follow Up</option>
          <option value="subscription_pitch">Subscription Pitch</option>
          <option value="complaint">Complaint</option>
          <option value="referral_ask">Referral Ask</option>
          <option value="reengagement">Re-engagement</option>
          <option value="receipt">Receipt</option>
        </AdminSelect>

        <AdminSelect
          width="w-[170px]"
          value={filterFollowUp}
          onChange={(e) => setFilterFollowUp(e.target.value as 'pending' | 'completed' | '')}
        >
          <option value="">All Follow-ups</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </AdminSelect>

        <div className="ml-auto">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-orange-500 hover:bg-orange-400 text-white transition-colors"
          >
            <Plus className="h-4 w-4" />
            Log Conversation
          </button>
        </div>
      </div>

      {/* Log Form */}
      {showForm && (
        <LogConversationForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false)
            loadData()
          }}
        />
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-white/40">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Loading conversations...
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-16 text-white/40">
          No conversations found.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/50 text-xs uppercase">
                  <th className="text-left py-2 px-3 font-medium">Date/Time</th>
                  <th className="text-left py-2 px-3 font-medium">Customer</th>
                  <th className="text-left py-2 px-3 font-medium">Channel</th>
                  <th className="text-center py-2 px-3 font-medium">Dir</th>
                  <th className="text-left py-2 px-3 font-medium">Type</th>
                  <th className="text-left py-2 px-3 font-medium">Content</th>
                  <th className="text-left py-2 px-3 font-medium">Follow-up</th>
                  <th className="py-2 px-3 font-medium w-10"></th>
                </tr>
              </thead>
              <tbody>
                {conversations.map((conv) => (
                  <tr
                    key={conv.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-2.5 px-3 text-white/70 whitespace-nowrap">
                      {formatDateTime(conv.sent_at)}
                    </td>
                    <td className="py-2.5 px-3 text-white">
                      {conv.customer_name ?? '-'}
                    </td>
                    <td className="py-2.5 px-3">
                      <ChannelBadge channel={conv.channel} />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <DirectionIcon direction={conv.direction} />
                    </td>
                    <td className="py-2.5 px-3">
                      <MessageTypeBadge type={conv.message_type} />
                    </td>
                    <td className="py-2.5 px-3 text-white/50 max-w-[250px] truncate">
                      {conv.summary.length > 100 ? `${conv.summary.slice(0, 100)}...` : conv.summary}
                    </td>
                    <td className="py-2.5 px-3">
                      <FollowUpBadge conversation={conv} />
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => handleDeleteConversation(conv.id)}
                        className="text-white/20 hover:text-red-400 p-1 transition-colors"
                        title="Delete conversation"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-white/50">
              <span>
                Page {page} of {totalPages} ({count} total)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
