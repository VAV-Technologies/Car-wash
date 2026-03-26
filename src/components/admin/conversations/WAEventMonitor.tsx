'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import {
  Loader2,
  Activity,
  MessageSquare,
  CheckCheck,
  Phone,
  UserPlus,
  UserMinus,
  Bell,
  Heart,
  Trash2,
  RefreshCw,
  Pause,
  Play,
  ArrowDown,
  Filter,
  X,
} from 'lucide-react'

interface WAEvent {
  id: string
  event: string
  timestamp: string
  session: string
  from?: string
  to?: string
  body?: string
  ack?: string
  participant?: string
  raw: Record<string, unknown>
}

const EVENT_ICONS: Record<string, React.ElementType> = {
  'message': MessageSquare,
  'message.any': MessageSquare,
  'message.ack': CheckCheck,
  'message.reaction': Heart,
  'message.revoked': Trash2,
  'session.status': Activity,
  'call': Phone,
  'presence.update': UserPlus,
  'group.join': UserPlus,
  'group.leave': UserMinus,
  'state.change': Bell,
}

const EVENT_COLORS: Record<string, string> = {
  'message': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'message.any': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'message.ack': 'text-green-400 bg-green-500/10 border-green-500/20',
  'message.reaction': 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  'message.revoked': 'text-red-400 bg-red-500/10 border-red-500/20',
  'session.status': 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  'call': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  'state.change': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
}

function getEventColor(event: string): string {
  return EVENT_COLORS[event] ?? 'text-white/50 bg-white/5 border-white/10'
}

function getEventIcon(event: string): React.ElementType {
  return EVENT_ICONS[event] ?? Activity
}

function formatPhone(id: string | undefined): string {
  if (!id) return ''
  const digits = id.replace('@c.us', '').replace('@s.whatsapp.net', '')
  if (digits.startsWith('62')) return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 9)} ${digits.slice(9)}`
  return `+${digits}`
}

function formatTime(ts: string): string {
  return new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function WAEventMonitor() {
  const [events, setEvents] = useState<WAEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [paused, setPaused] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)
  const [filter, setFilter] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchEvents = useCallback(async () => {
    if (paused) return
    try {
      const res = await fetch('/api/admin/whatsapp?action=events')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          setEvents(prev => {
            const existingIds = new Set(prev.map(e => e.id))
            const newEvents = data.filter((e: WAEvent) => !existingIds.has(e.id))
            if (newEvents.length === 0) return prev
            const combined = [...prev, ...newEvents].slice(-200) // Keep last 200
            return combined
          })
        }
      }
    } catch {} finally { setLoading(false) }
  }, [paused])

  useEffect(() => {
    fetchEvents()
    pollRef.current = setInterval(fetchEvents, 3000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [fetchEvents])

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [events, autoScroll])

  const filteredEvents = filter
    ? events.filter(e => e.event.includes(filter) || e.body?.toLowerCase().includes(filter.toLowerCase()) || e.from?.includes(filter))
    : events

  const eventCounts: Record<string, number> = {}
  events.forEach(e => { eventCounts[e.event] = (eventCounts[e.event] ?? 0) + 1 })

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPaused(!paused)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              paused ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-yellow-600 hover:bg-yellow-500 text-white'
            }`}
          >
            {paused ? <><Play className="h-3.5 w-3.5" /> Resume</> : <><Pause className="h-3.5 w-3.5" /> Pause</>}
          </button>

          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
              autoScroll ? 'border-orange-500/30 text-orange-400 bg-orange-500/10' : 'border-white/10 text-white/50 bg-white/5'
            }`}
          >
            <ArrowDown className="h-3.5 w-3.5" />
            Auto-scroll {autoScroll ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => setEvents([])}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-white/10 text-white/50 bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
            <input
              type="text"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Filter events..."
              className="pl-8 pr-8 py-1.5 text-xs bg-white/5 border border-white/10 rounded-md text-white placeholder:text-white/30 focus:border-orange-500 focus:outline-none w-48"
            />
            {filter && (
              <button onClick={() => setFilter('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <span className="text-xs text-white/30">{filteredEvents.length} events</span>
        </div>
      </div>

      {/* Event type summary */}
      {Object.keys(eventCounts).length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(eventCounts).sort((a, b) => b[1] - a[1]).map(([event, count]) => (
            <button
              key={event}
              onClick={() => setFilter(filter === event ? '' : event)}
              className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                filter === event ? 'border-orange-500 text-orange-400 bg-orange-500/10' : getEventColor(event)
              }`}
            >
              {event} ({count})
            </button>
          ))}
        </div>
      )}

      {/* Event log */}
      <div
        ref={scrollRef}
        className="bg-[#0f0f0f] border border-white/10 rounded-xl overflow-y-auto font-mono text-xs"
        style={{ height: '500px' }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full text-white/30">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Connecting to event stream...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/30">
            <Activity className="h-8 w-8 mb-2 opacity-30" />
            <p>{paused ? 'Event monitoring paused' : 'Waiting for events...'}</p>
            <p className="text-[10px] mt-1">Events will appear here as WhatsApp activity occurs</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredEvents.map((evt) => {
              const Icon = getEventIcon(evt.event)
              const isExpanded = expandedId === evt.id
              return (
                <div key={evt.id} className="hover:bg-white/[0.02] transition-colors">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : evt.id)}
                    className="w-full text-left px-3 py-2 flex items-start gap-3"
                  >
                    <span className="text-white/20 shrink-0 mt-0.5 w-16">{formatTime(evt.timestamp)}</span>
                    <Icon className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${getEventColor(evt.event).split(' ')[0]}`} />
                    <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] border ${getEventColor(evt.event)}`}>{evt.event}</span>
                    <span className="text-white/40 truncate flex-1">
                      {evt.from && <span className="text-white/50">{formatPhone(evt.from)}</span>}
                      {evt.body && <span className="ml-2 text-white/60">{evt.body.slice(0, 80)}{evt.body.length > 80 ? '...' : ''}</span>}
                      {evt.ack && <span className="ml-2 text-green-400/60">ack: {evt.ack}</span>}
                      {!evt.from && !evt.body && !evt.ack && <span>session: {evt.session}</span>}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="px-3 pb-3 pl-[104px]">
                      <pre className="bg-black/30 rounded p-2 text-[10px] text-white/40 overflow-x-auto max-h-48">
                        {JSON.stringify(evt.raw, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {paused && (
        <div className="text-center text-xs text-yellow-400/60">
          Event monitoring paused — click Resume to continue
        </div>
      )}
    </div>
  )
}
