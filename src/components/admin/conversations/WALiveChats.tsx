'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2, MessageSquare, RefreshCw, User, Clock, CheckCircle2, AlertTriangle } from 'lucide-react'

interface LiveChat {
  id: string
  chat_id: string
  phone: string
  customer_name: string
  state: string
  message_count: number
  last_message_at: string
  last_message_preview: string
  last_message_role: string | null
  has_images_sent: boolean
  has_booking: boolean
  created_at: string
}

interface ChatDetail {
  messages: Array<{ role: string; content: string; timestamp?: string; from_human?: boolean }>
  phone: string
  customer_id: string | null
}

const STATE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  greeting: { label: 'New', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: '👋' },
  awaiting_name: { label: 'Awaiting Name', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: '❓' },
  awaiting_intent: { label: 'Awaiting Intent', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: '🤔' },
  showing_packages: { label: 'Showing Packages', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: '📋' },
  collecting_info: { label: 'Collecting Info', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', icon: '📝' },
  confirming_booking: { label: 'Confirming', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: '✅' },
  booking_complete: { label: 'Booked', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: '🎉' },
  general_chat: { label: 'Chat', color: 'bg-white/10 text-white/60 border-white/20', icon: '💬' },
}

function StateBadge({ state }: { state: string }) {
  const config = STATE_CONFIG[state] || STATE_CONFIG.general_chat
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border ${config.color}`}>
      <span>{config.icon}</span> {config.label}
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

export default function WALiveChats() {
  const [chats, setChats] = useState<LiveChat[]>([])
  const [selected, setSelected] = useState<LiveChat | null>(null)
  const [chatDetail, setChatDetail] = useState<ChatDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const fetchChats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/whatsapp?action=list-live-chats')
      if (res.ok) setChats(await res.json())
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchChats()
    const interval = setInterval(fetchChats, 15000)
    return () => clearInterval(interval)
  }, [fetchChats])

  useEffect(() => {
    if (!selected) { setChatDetail(null); return }
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/admin/whatsapp?action=escalation-chat&chat_id=${encodeURIComponent(selected.chat_id)}`)
        if (res.ok && !cancelled) setChatDetail(await res.json())
      } catch { /* silent */ }
    })()
    return () => { cancelled = true }
  }, [selected])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatDetail])

  const activeChats = chats.filter(c => c.state !== 'booking_complete' || Date.now() - new Date(c.last_message_at).getTime() < 86400000)
  const awaitingResponse = chats.filter(c => c.last_message_role === 'user' && !['booking_complete', 'greeting'].includes(c.state))

  return (
    <div className="flex h-[calc(100vh-180px)] rounded-xl overflow-hidden border border-white/10 bg-[#0A0A0A]">
      {/* LEFT PANEL — Chat list */}
      <div className="w-80 lg:w-96 flex-shrink-0 border-r border-white/10 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#171717]">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white">Live Chats</h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400">
              {activeChats.length}
            </span>
            {awaitingResponse.length > 0 && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white" title="Awaiting response">
                {awaitingResponse.length}
              </span>
            )}
          </div>
          <button
            onClick={() => { setLoading(true); fetchChats() }}
            className="text-xs text-white/40 hover:text-white transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && chats.length === 0 && (
            <div className="text-white/30 text-sm text-center py-12">
              <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
              Loading...
            </div>
          )}
          {!loading && chats.length === 0 && (
            <div className="text-white/30 text-sm text-center py-12">No conversations yet</div>
          )}
          {chats.map((chat) => {
            const isSelected = selected?.id === chat.id
            const isWaiting = chat.last_message_role === 'user' && !['booking_complete', 'greeting'].includes(chat.state)
            return (
              <button
                key={chat.id}
                onClick={() => setSelected(chat)}
                className={`w-full text-left px-4 py-3 border-b border-white/5 transition-colors ${
                  isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                } ${isWaiting ? 'border-l-2 border-l-red-500' : 'border-l-2 border-l-transparent'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white font-medium truncate">
                    {chat.customer_name !== 'WhatsApp User' && chat.customer_name !== 'Unknown'
                      ? chat.customer_name
                      : chat.phone ? `+${chat.phone}` : 'Unknown'}
                  </span>
                  <span className="text-[10px] text-white/30 flex-shrink-0 ml-2">
                    {timeAgo(chat.last_message_at)}
                  </span>
                </div>
                <div className="text-xs text-white/40 truncate mb-1.5">
                  {chat.last_message_preview.replace('[IMAGES_SENT]\n', '').replace('[SYSTEM HINTS:', '').slice(0, 60)}
                </div>
                <div className="flex items-center gap-2">
                  <StateBadge state={chat.state} />
                  <span className="text-[10px] text-white/20">{chat.message_count} msgs</span>
                  {chat.has_booking && <CheckCircle2 className="h-3 w-3 text-green-400" />}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* RIGHT PANEL — Chat detail */}
      <div className="flex-1 flex flex-col min-w-0">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-white/20 text-sm">
            <MessageSquare className="h-5 w-5 mr-2 opacity-50" />
            Select a conversation to view
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-[#171717]">
              <div className="flex items-center gap-3 min-w-0">
                <User className="h-4 w-4 text-white/30" />
                <span className="text-sm font-semibold text-white truncate">
                  {selected.customer_name !== 'WhatsApp User' && selected.customer_name !== 'Unknown'
                    ? selected.customer_name
                    : `+${selected.phone}`}
                </span>
                <StateBadge state={selected.state} />
                <span className="text-xs text-white/30 hidden sm:block">
                  <Clock className="h-3 w-3 inline mr-1" />
                  {timeAgo(selected.last_message_at)}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {!chatDetail ? (
                <div className="text-white/20 text-xs text-center py-6">Loading chat...</div>
              ) : (
                chatDetail.messages.map((msg, i) => {
                  const isUser = msg.role === 'user'
                  const content = (msg.content || '')
                    .replace('[IMAGES_SENT]\n', '')
                    .replace(/\[SYSTEM HINTS:.*?\]\n?/g, '')
                  return (
                    <div key={i} className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}>
                      <div
                        className={`max-w-[75%] rounded-xl px-4 py-2.5 text-sm ${
                          isUser
                            ? 'bg-white/10 text-white'
                            : msg.from_human
                              ? 'bg-green-500/10 text-green-100'
                              : 'bg-orange-500/10 text-orange-100'
                        }`}
                      >
                        {msg.from_human && (
                          <span className="inline-block text-[10px] font-semibold text-green-400 bg-green-500/10 rounded px-1.5 py-0.5 mb-1 mr-1">
                            Human
                          </span>
                        )}
                        {msg.content?.includes('[IMAGES_SENT]') && (
                          <span className="inline-block text-[10px] font-semibold text-purple-400 bg-purple-500/10 rounded px-1.5 py-0.5 mb-1 mr-1">
                            Images Sent
                          </span>
                        )}
                        <span className="whitespace-pre-wrap break-words">{content}</span>
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
          </>
        )}
      </div>
    </div>
  )
}
