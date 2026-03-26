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
  Shield,
  Cpu,
  HardDrive,
  Globe,
  Webhook,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Activity,
} from 'lucide-react'

interface SessionInfo {
  name: string
  status: string
  me?: { id: string; pushName?: string }
  engine?: { engine?: string; WWebVersion?: string; state?: string }
  config?: {
    webhooks?: { url: string; events?: string[] }[]
    proxy?: string | null
  }
  timestamps?: { activity?: string | null }
  presence?: { status?: string } | null
}

interface ServerInfo {
  version?: string
  engine?: string
  tier?: string
  browser?: string
  platform?: string
}

interface StatsData {
  today: number
  total: number
  lastMessage: string | null
}

function StatCard({ title, icon: Icon, children, accent }: { title: string; icon: React.ElementType; children: React.ReactNode; accent?: string }) {
  return (
    <div className={`border bg-[#171717] rounded-lg p-4 ${accent || 'border-white/10'}`}>
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
    WORKING: 'bg-green-500', CONNECTED: 'bg-green-500',
    STOPPED: 'bg-red-500', FAILED: 'bg-red-500',
    STARTING: 'bg-yellow-500 animate-pulse',
    SCAN_QR_CODE: 'bg-orange-500 animate-pulse',
  }
  return <div className={`w-3 h-3 rounded-full ${colorMap[status] ?? 'bg-gray-500'} shrink-0`} />
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    WORKING: 'bg-green-500/20 text-green-400', CONNECTED: 'bg-green-500/20 text-green-400',
    STOPPED: 'bg-red-500/20 text-red-400', FAILED: 'bg-red-500/20 text-red-400',
    STARTING: 'bg-yellow-500/20 text-yellow-400', SCAN_QR_CODE: 'bg-orange-500/20 text-orange-400',
  }
  const labels: Record<string, string> = {
    WORKING: 'Connected', CONNECTED: 'Connected', STOPPED: 'Disconnected',
    FAILED: 'Failed', STARTING: 'Starting...', SCAN_QR_CODE: 'Waiting for QR Scan',
  }
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] ?? 'bg-gray-500/20 text-gray-400'}`}>
      {labels[status] || status}
    </span>
  )
}

function formatPhone(waId: string): string {
  const digits = waId.replace('@c.us', '').replace('@s.whatsapp.net', '')
  if (digits.startsWith('62')) return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 9)} ${digits.slice(9)}`
  return `+${digits}`
}

function InfoRow({ icon: Icon, label, value, mono }: { icon: React.ElementType; label: string; value: string | React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-white/20 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-white/30">{label}</p>
        <p className={`text-sm text-white/70 ${mono ? 'font-mono' : ''} break-all`}>{value}</p>
      </div>
    </div>
  )
}

export default function WADashboard() {
  const [sessions, setSessions] = useState<SessionInfo[]>([])
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null)
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [sessionsRes, statsRes, serverRes] = await Promise.all([
        fetch('/api/admin/whatsapp?action=sessions'),
        fetch('/api/admin/whatsapp?action=stats'),
        fetch('/api/admin/whatsapp?action=server-info').catch(() => null),
      ])
      if (sessionsRes.ok) {
        const data = await sessionsRes.json()
        setSessions(Array.isArray(data) ? data : [data])
      }
      if (statsRes.ok) setStats(await statsRes.json())
      if (serverRes?.ok) setServerInfo(await serverRes.json())
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [fetchData])

  async function handleAction(action: 'start' | 'stop') {
    setActionLoading(action)
    try {
      await fetch(`/api/admin/whatsapp?action=${action}&session=default`, { method: 'POST' })
      await new Promise(r => setTimeout(r, 2000))
      await fetchData()
    } catch {} finally { setActionLoading(null) }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/40">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />Loading WhatsApp dashboard...
      </div>
    )
  }

  const session = sessions.find(s => s.name === 'default') ?? sessions[0]
  const status = session?.status ?? 'UNKNOWN'
  const phone = session?.me?.id ? formatPhone(session.me.id) : null
  const isConnected = status === 'WORKING' || status === 'CONNECTED'
  const isStopped = status === 'STOPPED' || status === 'FAILED'
  const isQR = status === 'SCAN_QR_CODE'
  const isStarting = status === 'STARTING'
  const webhooks = session?.config?.webhooks ?? []
  const engineName = typeof session?.engine === 'object' ? session.engine.engine : session?.engine
  const webVersion = typeof session?.engine === 'object' ? session.engine.WWebVersion : null

  return (
    <div className="space-y-6">
      {/* Refresh bar */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/30">Auto-refreshes every 15 seconds</p>
        <button onClick={fetchData} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-white/50 hover:text-white/80 hover:bg-white/5 transition-colors">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* Row 1: Status cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Session Status */}
        <StatCard title="Session Status" icon={isConnected ? Wifi : WifiOff} accent={isConnected ? 'border-green-500/30' : isStopped ? 'border-red-500/20' : 'border-orange-500/20'}>
          <div className="flex items-center gap-3">
            <StatusDot status={status} />
            <div>
              <StatusBadge status={status} />
              {phone && <p className="text-sm text-white/50 mt-1.5">{phone}</p>}
              {session?.me?.pushName && <p className="text-xs text-white/30">{session.me.pushName}</p>}
            </div>
          </div>
        </StatCard>

        {/* Shera Agent */}
        <StatCard title="Shera Agent" icon={Bot} accent={isConnected ? 'border-green-500/30' : 'border-white/10'}>
          <div className="flex items-center gap-2 mb-1">
            {isConnected ? (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Live</span>
            ) : isQR ? (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Needs QR</span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 flex items-center gap-1"><XCircle className="w-3 h-3" /> Offline</span>
            )}
          </div>
          <p className="text-xs text-white/30">{isConnected ? 'Responding to customers' : 'Not connected to WhatsApp'}</p>
        </StatCard>

        {/* Messages */}
        <StatCard title="Messages Today" icon={MessageSquare}>
          <p className="text-2xl font-bold text-white">{stats?.today ?? 0}</p>
          <p className="text-xs text-white/30 mt-0.5">{stats?.total ?? 0} total conversations</p>
        </StatCard>

        {/* Server */}
        <StatCard title="WAHA Server" icon={Server}>
          <p className="text-sm font-medium text-white">{serverInfo?.version ?? 'Running'}</p>
          <p className="text-xs text-white/30 mt-0.5">{serverInfo?.tier ?? 'Core'} &middot; {serverInfo?.platform ?? 'Linux'}</p>
          <p className="text-xs text-white/30">Azure Container Instance</p>
        </StatCard>
      </div>

      {/* Row 2: Session Control */}
      <div className="border border-white/10 bg-[#171717] rounded-lg p-5">
        <h3 className="text-sm font-medium text-white/70 uppercase tracking-wide mb-4">Session Control</h3>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <StatusBadge status={status} />
          {engineName && <span className="text-xs text-white/40 flex items-center gap-1"><Cpu className="w-3 h-3" /> {engineName}</span>}
          {webVersion && <span className="text-xs text-white/30">v{webVersion}</span>}
          {phone && <span className="text-xs text-white/40 flex items-center gap-1"><Phone className="w-3 h-3" /> {phone}</span>}
        </div>

        <div className="flex flex-wrap gap-3 pt-3 border-t border-white/5">
          {(isStopped || isQR) && (
            <button onClick={() => handleAction('start')} disabled={actionLoading !== null} className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium bg-green-600 hover:bg-green-500 text-white transition-colors disabled:opacity-50">
              {actionLoading === 'start' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Start Session
            </button>
          )}
          {isConnected && (
            <button onClick={() => handleAction('stop')} disabled={actionLoading !== null} className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50">
              {actionLoading === 'stop' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Square className="h-4 w-4" />} Stop Session
            </button>
          )}
          {isStarting && (
            <span className="flex items-center gap-2 text-sm text-yellow-400"><Loader2 className="h-4 w-4 animate-spin" /> Session is starting...</span>
          )}
          {isQR && (
            <span className="flex items-center gap-2 text-sm text-orange-400"><AlertTriangle className="h-4 w-4" /> Go to Sessions tab to scan QR code</span>
          )}
        </div>
      </div>

      {/* Row 3: Configuration Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Webhook Config */}
        <div className="border border-white/10 bg-[#171717] rounded-lg p-5">
          <h3 className="text-sm font-medium text-white/70 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Webhook className="h-4 w-4" /> Webhook Configuration
          </h3>
          <div className="space-y-3">
            {webhooks.length > 0 ? webhooks.map((wh, i) => (
              <div key={i} className="bg-black/20 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                  <span className="text-xs text-green-400">Active</span>
                </div>
                <p className="text-xs text-white/50 font-mono break-all">{wh.url}</p>
                {wh.events && (
                  <div className="flex flex-wrap gap-1">
                    {wh.events.map(ev => (
                      <span key={ev} className="text-[10px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-white/40">{ev}</span>
                    ))}
                  </div>
                )}
              </div>
            )) : (
              <div className="flex items-center gap-2 text-sm text-white/30">
                <XCircle className="h-4 w-4" /> No webhooks configured
              </div>
            )}
          </div>
        </div>

        {/* System Info */}
        <div className="border border-white/10 bg-[#171717] rounded-lg p-5">
          <h3 className="text-sm font-medium text-white/70 uppercase tracking-wide mb-4 flex items-center gap-2">
            <HardDrive className="h-4 w-4" /> System Information
          </h3>
          <div className="space-y-3">
            <InfoRow icon={Globe} label="Webhook URL" value="https://castudio.id/api/webhook/whatsapp" mono />
            <InfoRow icon={Server} label="Host" value="Azure Container Instance (Southeast Asia)" />
            <InfoRow icon={Cpu} label="Engine" value={engineName ?? 'WEBJS'} />
            <InfoRow icon={Shield} label="API Auth" value="X-Api-Key header" />
            {stats?.lastMessage && (
              <InfoRow icon={Clock} label="Last Message" value={new Date(stats.lastMessage).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} />
            )}
            <InfoRow icon={Activity} label="Sessions" value={`${sessions.length} session${sessions.length !== 1 ? 's' : ''}`} />
          </div>
        </div>
      </div>
    </div>
  )
}
