'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Loader2,
  Play,
  Square,
  RotateCcw,
  LogOut,
  QrCode,
  X,
  RefreshCw,
  Phone,
  Cpu,
  Smartphone,
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

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    WORKING: 'bg-green-500/20 text-green-400',
    CONNECTED: 'bg-green-500/20 text-green-400',
    STOPPED: 'bg-red-500/20 text-red-400',
    FAILED: 'bg-red-500/20 text-red-400',
    STARTING: 'bg-yellow-500/20 text-yellow-400 animate-pulse',
    SCAN_QR_CODE: 'bg-orange-500/20 text-orange-400 animate-pulse',
  }
  const style = styles[status] ?? 'bg-gray-500/20 text-gray-400'
  const label = status === 'SCAN_QR_CODE' ? 'Waiting for QR' : status
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${style}`}>
      {label}
    </span>
  )
}

function StatusDot({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    WORKING: 'bg-green-500',
    CONNECTED: 'bg-green-500',
    STOPPED: 'bg-red-500',
    FAILED: 'bg-red-500',
    STARTING: 'bg-yellow-500 animate-pulse',
    SCAN_QR_CODE: 'bg-orange-500 animate-pulse',
  }
  const color = colorMap[status] ?? 'bg-gray-500'
  return <div className={`w-2.5 h-2.5 rounded-full ${color} shrink-0`} />
}

function formatPhoneNumber(waId: string): string {
  const digits = waId.replace('@c.us', '').replace('@s.whatsapp.net', '')
  if (digits.startsWith('62')) {
    return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 9)} ${digits.slice(9)}`
  }
  return `+${digits}`
}

export default function WASessions() {
  const [sessions, setSessions] = useState<SessionInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [qrModal, setQrModal] = useState<{ session: string; image: string | null } | null>(null)
  const [qrLoading, setQrLoading] = useState(false)

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/whatsapp?action=sessions')
      if (res.ok) {
        const data = await res.json()
        setSessions(Array.isArray(data) ? data : [data])
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSessions()
    const interval = setInterval(fetchSessions, 30000)
    return () => clearInterval(interval)
  }, [fetchSessions])

  async function handleSessionAction(
    action: 'start' | 'stop' | 'restart' | 'logout',
    sessionName: string
  ) {
    const key = `${action}-${sessionName}`
    setActionLoading(key)
    try {
      await fetch(`/api/admin/whatsapp?action=${action}&session=${sessionName}`, {
        method: 'POST',
      })
      await new Promise((r) => setTimeout(r, 1500))
      await fetchSessions()
    } catch {
      // silent
    } finally {
      setActionLoading(null)
    }
  }

  async function fetchQRCode(sessionName: string) {
    setQrLoading(true)
    setQrModal({ session: sessionName, image: null })
    try {
      const res = await fetch(
        `/api/admin/whatsapp?action=screenshot&session=${sessionName}`
      )
      if (res.ok) {
        const data = await res.json()
        const imageSrc = data.image ?? data.screenshot ?? data.data ?? null
        setQrModal({ session: sessionName, image: imageSrc })
      }
    } catch {
      // silent
    } finally {
      setQrLoading(false)
    }
  }

  // Auto-refresh QR every 15 seconds when modal is open
  useEffect(() => {
    if (!qrModal) return
    const interval = setInterval(() => {
      fetchQRCode(qrModal.session)
    }, 15000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrModal?.session])

  function isActionDisabled(action: string, status: string): boolean {
    if (actionLoading !== null) return true
    switch (action) {
      case 'start':
        return status === 'WORKING' || status === 'CONNECTED' || status === 'STARTING'
      case 'stop':
        return status === 'STOPPED' || status === 'FAILED'
      case 'restart':
        return status === 'STOPPED' || status === 'FAILED'
      case 'logout':
        return status === 'STOPPED' || status === 'FAILED'
      case 'qr':
        return status !== 'SCAN_QR_CODE'
      default:
        return false
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/40">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading sessions...
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-16 text-white/40">
        No WhatsApp sessions found.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/70 uppercase tracking-wide">
          WhatsApp Sessions
        </h3>
        <button
          onClick={() => fetchSessions()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-white/50 hover:text-white/80 hover:bg-white/5 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Session Cards */}
      {sessions.map((session) => {
        const phoneNumber = session.me?.id
          ? formatPhoneNumber(session.me.id)
          : null
        const isQR = session.status === 'SCAN_QR_CODE'

        return (
          <div
            key={session.name}
            className="border border-white/10 bg-[#171717] rounded-lg p-5"
          >
            {/* Session header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-white/30" />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-white">
                      Session: {session.name}
                    </h4>
                    <StatusDot status={session.status} />
                  </div>
                </div>
              </div>
              <StatusBadge status={session.status} />
            </div>

            {/* Session details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {phoneNumber && (
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Phone className="h-3.5 w-3.5 text-white/30" />
                  <span>{phoneNumber}</span>
                </div>
              )}

              {session.engine && (
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Cpu className="h-3.5 w-3.5 text-white/30" />
                  <span>{session.engine}</span>
                </div>
              )}

              {session.me?.pushName && (
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <span className="text-white/30 text-xs">Name:</span>
                  <span>{session.me.pushName}</span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 pt-3 border-t border-white/5">
              <button
                onClick={() => handleSessionAction('start', session.name)}
                disabled={isActionDisabled('start', session.status)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-green-600/80 hover:bg-green-500 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {actionLoading === `start-${session.name}` ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Play className="h-3.5 w-3.5" />
                )}
                Start
              </button>

              <button
                onClick={() => handleSessionAction('stop', session.name)}
                disabled={isActionDisabled('stop', session.status)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-red-600/80 hover:bg-red-500 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {actionLoading === `stop-${session.name}` ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Square className="h-3.5 w-3.5" />
                )}
                Stop
              </button>

              <button
                onClick={() => handleSessionAction('restart', session.name)}
                disabled={isActionDisabled('restart', session.status)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-orange-600/80 hover:bg-orange-500 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {actionLoading === `restart-${session.name}` ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="h-3.5 w-3.5" />
                )}
                Restart
              </button>

              <button
                onClick={() => handleSessionAction('logout', session.name)}
                disabled={isActionDisabled('logout', session.status)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white/10 hover:bg-white/20 text-white/70 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {actionLoading === `logout-${session.name}` ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <LogOut className="h-3.5 w-3.5" />
                )}
                Logout
              </button>

              {isQR && (
                <button
                  onClick={() => fetchQRCode(session.name)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-orange-500 hover:bg-orange-400 text-white transition-colors"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  Show QR Code
                </button>
              )}
            </div>
          </div>
        )
      })}

      {/* QR Code Modal */}
      {qrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setQrModal(null)}
          />

          {/* Modal */}
          <div className="relative bg-[#171717] border border-white/10 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => setQrModal(null)}
              className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <QrCode className="h-5 w-5 text-orange-400" />
                <h3 className="text-lg font-semibold text-white">
                  Scan QR Code
                </h3>
              </div>

              <p className="text-sm text-white/50 mb-4">
                Session: <span className="text-white/70">{qrModal.session}</span>
              </p>

              {/* QR Image */}
              <div className="bg-white rounded-lg p-4 inline-block mb-4">
                {qrLoading ? (
                  <div className="w-64 h-64 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : qrModal.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrModal.image}
                    alt="WhatsApp QR Code"
                    className="w-64 h-64 object-contain"
                  />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center text-gray-400 text-sm">
                    Failed to load QR code
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-white/5 rounded-lg p-4 text-left mb-4">
                <p className="text-xs font-medium text-white/60 mb-2 uppercase tracking-wide">
                  Instructions
                </p>
                <ol className="text-sm text-white/50 space-y-1.5 list-decimal list-inside">
                  <li>Open WhatsApp on your phone</li>
                  <li>
                    Go to <span className="text-white/70">Settings</span> &rarr;{' '}
                    <span className="text-white/70">Linked Devices</span>
                  </li>
                  <li>
                    Tap <span className="text-white/70">Link a Device</span>
                  </li>
                  <li>Scan this QR code</li>
                </ol>
              </div>

              {/* Refresh button */}
              <button
                onClick={() => fetchQRCode(qrModal.session)}
                disabled={qrLoading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium bg-orange-500 hover:bg-orange-400 text-white transition-colors mx-auto disabled:opacity-50"
              >
                {qrLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh QR Code
              </button>

              <p className="text-xs text-white/30 mt-3">
                QR code expires in 60 seconds. Auto-refreshes every 15 seconds.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
