'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Loader2,
  Wifi,
  WifiOff,
  MessageSquare,
  Bot,
  Play,
  Square,
  RefreshCw,
  Server,
  Phone,
  Link2,
} from 'lucide-react'

interface SessionInfo {
  name: string
  status: string
  me?: {
    id: string
    pushName?: string
  }
  engine?: string
}

interface StatsData {
  totalMessages?: number
  todayMessages?: number
  lastMessageAt?: string
}

function StatCard({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="border border-white/10 bg-[#171717] rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-white/30" />
        <p className="text-white/50 text-xs uppercase tracking-wide">{title}</p>
      </div>
      {children}
    </div>
  )
}

function StatusDot({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    WORKING: 'bg-green-500',
    CONNECTED: 'bg-green-500',
    STOPPED: 'bg-red-500',
    FAILED: 'bg-red-500',
    STARTING: 'bg-yellow-500 animate-pulse',
    SCAN_QR_CODE: 'bg-yellow-500 animate-pulse',
  }
  const color = colorMap[status] ?? 'bg-gray-500'
  return <div className={`w-3 h-3 rounded-full ${color} shrink-0`} />
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    WORKING: 'bg-green-500/20 text-green-400',
    CONNECTED: 'bg-green-500/20 text-green-400',
    STOPPED: 'bg-red-500/20 text-red-400',
    FAILED: 'bg-red-500/20 text-red-400',
    STARTING: 'bg-yellow-500/20 text-yellow-400',
    SCAN_QR_CODE: 'bg-orange-500/20 text-orange-400',
  }
  const style = styles[status] ?? 'bg-gray-500/20 text-gray-400'
  const label = status === 'SCAN_QR_CODE' ? 'Waiting for QR' : status
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${style}`}>
      {label}
    </span>
  )
}

function formatPhoneNumber(waId: string): string {
  const digits = waId.replace('@c.us', '').replace('@s.whatsapp.net', '')
  if (digits.startsWith('62')) {
    return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 9)} ${digits.slice(9)}`
  }
  return `+${digits}`
}

export default function WADashboard() {
  const [sessions, setSessions] = useState<SessionInfo[]>([])
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [sessionsRes, statsRes] = await Promise.all([
        fetch('/api/admin/whatsapp?action=sessions'),
        fetch('/api/admin/whatsapp?action=stats'),
      ])
      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json()
        setSessions(Array.isArray(sessionsData) ? sessionsData : [sessionsData])
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  async function handleAction(action: 'start' | 'stop') {
    setActionLoading(action)
    try {
      await fetch(`/api/admin/whatsapp?action=${action}&session=default`, {
        method: 'POST',
      })
      // Wait briefly for status to change
      await new Promise((r) => setTimeout(r, 1500))
      await fetchData()
    } catch {
      // silent
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/40">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading WhatsApp dashboard...
      </div>
    )
  }

  const defaultSession = sessions.find((s) => s.name === 'default') ?? sessions[0]
  const status = defaultSession?.status ?? 'STOPPED'
  const phoneNumber = defaultSession?.me?.id
    ? formatPhoneNumber(defaultSession.me.id)
    : null
  const isConnected = status === 'WORKING' || status === 'CONNECTED'
  const isStopped = status === 'STOPPED' || status === 'FAILED'
  const isQR = status === 'SCAN_QR_CODE'

  return (
    <div className="space-y-6">
      {/* Top Row: 3 stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Session Status */}
        <StatCard title="Session Status" icon={isConnected ? Wifi : WifiOff}>
          <div className="flex items-center gap-3">
            <StatusDot status={status} />
            <div>
              <p className="text-xl font-bold text-white">{status}</p>
              {phoneNumber && (
                <p className="text-sm text-white/50 mt-0.5">{phoneNumber}</p>
              )}
            </div>
          </div>
        </StatCard>

        {/* Today's Messages */}
        <StatCard title="Today&apos;s Messages" icon={MessageSquare}>
          <p className="text-2xl font-bold text-white">
            {stats?.todayMessages ?? 0}
          </p>
          {stats?.totalMessages !== undefined && (
            <p className="text-sm text-white/40 mt-1">
              {stats.totalMessages} total messages
            </p>
          )}
        </StatCard>

        {/* Shera Agent */}
        <StatCard title="Shera Agent" icon={Bot}>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
              Active
            </span>
          </div>
          <p className="text-xs text-white/40 font-mono truncate">
            Webhook connected
          </p>
        </StatCard>
      </div>

      {/* Middle Row: Session Control */}
      <div className="border border-white/10 bg-[#171717] rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-white/70 uppercase tracking-wide">
            Session Control
          </h3>
          <button
            onClick={() => fetchData()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-white/50 hover:text-white/80 hover:bg-white/5 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <StatusBadge status={status} />

          {defaultSession?.engine && (
            <span className="text-xs text-white/40">
              Engine: <span className="text-white/60">{defaultSession.engine}</span>
            </span>
          )}

          {phoneNumber && (
            <span className="flex items-center gap-1.5 text-xs text-white/40">
              <Phone className="h-3.5 w-3.5" />
              {phoneNumber}
            </span>
          )}

          {defaultSession?.me?.pushName && (
            <span className="text-xs text-white/40">
              Name: <span className="text-white/60">{defaultSession.me.pushName}</span>
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-white/5">
          {(isStopped || isQR) && (
            <button
              onClick={() => handleAction('start')}
              disabled={actionLoading !== null}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium bg-green-600 hover:bg-green-500 text-white transition-colors disabled:opacity-50"
            >
              {actionLoading === 'start' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Start Session
            </button>
          )}

          {isConnected && (
            <button
              onClick={() => handleAction('stop')}
              disabled={actionLoading !== null}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50"
            >
              {actionLoading === 'stop' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              Stop Session
            </button>
          )}

          {isQR && (
            <span className="flex items-center gap-2 text-sm text-orange-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Scan the QR code in WhatsApp to connect
            </span>
          )}
        </div>
      </div>

      {/* Bottom: Quick Info */}
      <div className="border border-white/10 bg-[#171717] rounded-lg p-5">
        <h3 className="text-sm font-medium text-white/70 uppercase tracking-wide mb-4">
          Quick Info
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Link2 className="h-4 w-4 text-white/30 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-white/40">Webhook URL</p>
              <p className="text-sm text-white/70 font-mono">
                https://castudio.id/api/webhook/whatsapp
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Server className="h-4 w-4 text-white/30 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-white/40">WAHA Server</p>
              <p className="text-sm text-white/70">Azure Container Instance</p>
            </div>
          </div>
          {stats?.lastMessageAt && (
            <div className="flex items-start gap-3">
              <MessageSquare className="h-4 w-4 text-white/30 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-white/40">Last Message</p>
                <p className="text-sm text-white/70">
                  {new Date(stats.lastMessageAt).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
