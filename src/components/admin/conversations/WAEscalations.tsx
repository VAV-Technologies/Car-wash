'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Escalation {
  id: string
  chat_id: string
  phone: string
  reason: string
  category: string
  customer_message: string | null
  status: 'pending' | 'resolved'
  created_at: string
  resolved_at: string | null
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
  from_human?: boolean
}

interface ChatData {
  messages: ChatMessage[]
  phone: string
  customer_id: string | null
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CATEGORY_COLORS: Record<string, string> = {
  bulk_order: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  access_permission: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  complaint: 'bg-red-500/20 text-red-400 border-red-500/30',
  custom_request: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  partnership: 'bg-green-500/20 text-green-400 border-green-500/30',
  other: 'bg-white/10 text-white/60 border-white/20',
}

function categoryBadge(category: string) {
  const cls = CATEGORY_COLORS[category] || CATEGORY_COLORS.other
  return (
    <span className={`inline-block text-[11px] px-2 py-0.5 rounded-full border ${cls}`}>
      {category.replace(/_/g, ' ')}
    </span>
  )
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function formatTime(ts?: string): string {
  if (!ts) return ''
  try {
    return new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function WAEscalations() {
  const [escalations, setEscalations] = useState<Escalation[]>([])
  const [selected, setSelected] = useState<Escalation | null>(null)
  const [chat, setChat] = useState<ChatData | null>(null)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Fetch escalation list
  const fetchEscalations = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/whatsapp?action=list-escalations')
      if (res.ok) {
        const data: Escalation[] = await res.json()
        setEscalations(data)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto-refresh list every 30s
  useEffect(() => {
    fetchEscalations()
    const interval = setInterval(fetchEscalations, 30000)
    return () => clearInterval(interval)
  }, [fetchEscalations])

  // Fetch chat when selection changes
  useEffect(() => {
    if (!selected || !selected.chat_id || selected.chat_id === 'pending') {
      setChat(null)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/admin/whatsapp?action=escalation-chat&chat_id=${encodeURIComponent(selected.chat_id)}`)
        if (res.ok && !cancelled) {
          const data: ChatData = await res.json()
          setChat(data)
        }
      } catch {
        // silent
      }
    })()
    return () => { cancelled = true }
  }, [selected])

  // Scroll chat to bottom when chat or messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat])

  // Send reply
  const handleSend = async () => {
    if (!replyText.trim() || !selected) return
    setSending(true)
    try {
      await fetch('/api/admin/whatsapp?action=send-escalation-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: selected.chat_id, reply_text: replyText.trim() }),
      })
      setReplyText('')
      // Reload chat
      const res = await fetch(`/api/admin/whatsapp?action=escalation-chat&chat_id=${encodeURIComponent(selected.chat_id)}`)
      if (res.ok) setChat(await res.json())
    } catch {
      // silent
    } finally {
      setSending(false)
    }
  }

  // Resolve escalation
  const handleResolve = async (esc: Escalation) => {
    try {
      await fetch('/api/admin/whatsapp?action=resolve-escalation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: esc.id }),
      })
      await fetchEscalations()
      if (selected?.id === esc.id) {
        setSelected((prev) => prev ? { ...prev, status: 'resolved' } : null)
      }
    } catch {
      // silent
    }
  }

  const pendingCount = escalations.filter((e) => e.status === 'pending').length

  return (
    <div className="flex h-[calc(100vh-180px)] rounded-xl overflow-hidden border border-white/10 bg-[#0A0A0A]">
      {/* ---- LEFT PANEL ---- */}
      <div className="w-80 lg:w-96 flex-shrink-0 border-r border-white/10 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#171717]">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white">Needs Attention</h2>
            {pendingCount > 0 && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">
                {pendingCount}
              </span>
            )}
          </div>
          <button
            onClick={() => { setLoading(true); fetchEscalations() }}
            className="text-xs text-white/40 hover:text-white transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading && escalations.length === 0 && (
            <div className="text-white/30 text-sm text-center py-12">Loading...</div>
          )}
          {!loading && escalations.length === 0 && (
            <div className="text-white/30 text-sm text-center py-12">No escalations yet</div>
          )}
          {escalations.map((esc) => {
            const isPending = esc.status === 'pending'
            const isSelected = selected?.id === esc.id
            return (
              <button
                key={esc.id}
                onClick={() => setSelected(esc)}
                className={`w-full text-left px-4 py-3 border-b border-white/5 transition-colors ${
                  isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                } ${isPending ? 'border-l-2 border-l-orange-500' : 'border-l-2 border-l-green-500'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white font-medium truncate">
                    {esc.phone && esc.phone !== 'pending' ? esc.phone : 'Unknown'}
                  </span>
                  <span className="text-[10px] text-white/30 flex-shrink-0 ml-2">
                    {timeAgo(esc.created_at)}
                  </span>
                </div>
                <div className="text-xs text-white/40 truncate mb-1.5">
                  {esc.reason}
                </div>
                <div className="flex items-center gap-2">
                  {categoryBadge(esc.category)}
                  {isPending ? (
                    <span className="text-[10px] text-orange-400">Pending</span>
                  ) : (
                    <span className="text-[10px] text-green-400">Resolved</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ---- RIGHT PANEL ---- */}
      <div className="flex-1 flex flex-col min-w-0">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-white/20 text-sm">
            Select a conversation to view
          </div>
        ) : (
          <>
            {/* Header bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-[#171717]">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-sm font-semibold text-white truncate">
                  {selected.phone && selected.phone !== 'pending' ? selected.phone : 'Unknown'}
                </span>
                {categoryBadge(selected.category)}
                <span className="text-xs text-white/40 truncate hidden sm:block">
                  {selected.reason}
                </span>
              </div>
              {selected.status === 'pending' && (
                <button
                  onClick={() => handleResolve(selected)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white transition-colors flex-shrink-0"
                >
                  Mark Resolved
                </button>
              )}
              {selected.status === 'resolved' && (
                <span className="text-xs text-green-400 flex-shrink-0">Resolved</span>
              )}
            </div>

            {/* Chat area */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {/* Escalation notice */}
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg px-4 py-2.5 text-xs text-orange-300">
                <span className="font-semibold">Escalation:</span> {selected.reason}
                {selected.customer_message && (
                  <div className="mt-1 text-orange-200/70">
                    Customer said: &ldquo;{selected.customer_message}&rdquo;
                  </div>
                )}
              </div>

              {(!chat || !selected.chat_id || selected.chat_id === 'pending') ? (
                <div className="text-white/20 text-xs text-center py-6">
                  {selected.chat_id === 'pending' ? 'Chat not yet linked' : 'Loading chat...'}
                </div>
              ) : (
                chat.messages.map((msg, i) => {
                  const isUser = msg.role === 'user'
                  return (
                    <div key={i} className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}>
                      <div
                        className={`max-w-[75%] rounded-xl px-4 py-2.5 text-sm ${
                          isUser
                            ? 'bg-white/10 text-white'
                            : 'bg-orange-500/10 text-orange-100'
                        }`}
                      >
                        {msg.from_human && (
                          <span className="inline-block text-[10px] font-semibold text-green-400 bg-green-500/10 rounded px-1.5 py-0.5 mb-1 mr-1">
                            Human
                          </span>
                        )}
                        <span className="whitespace-pre-wrap break-words">{msg.content}</span>
                        {msg.timestamp && (
                          <div className={`text-[10px] mt-1 ${isUser ? 'text-white/30' : 'text-orange-300/40'}`}>
                            {formatTime(msg.timestamp)}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Bottom bar */}
            {selected.chat_id && selected.chat_id !== 'pending' && (
              <div className="border-t border-white/10 bg-[#171717] px-4 py-3 flex items-end gap-3">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder="Type your reply..."
                  rows={1}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 resize-none focus:outline-none focus:border-orange-500/50"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !replyText.trim()}
                  className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
