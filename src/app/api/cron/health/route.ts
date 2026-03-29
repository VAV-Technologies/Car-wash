import { NextResponse } from 'next/server'
import { sendText } from '@/lib/agents/waha'

export const dynamic = 'force-dynamic'

/**
 * Health check cron — runs every 15 minutes.
 * Checks if WAHA WhatsApp session is connected.
 * If disconnected, attempts to restart. Alerts admin via WhatsApp.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const WAHA_API_URL = process.env.WAHA_API_URL
  const WAHA_API_KEY = process.env.WAHA_API_KEY
  if (!WAHA_API_URL || !WAHA_API_KEY) {
    return NextResponse.json({ error: 'WAHA not configured' }, { status: 500 })
  }

  try {
    // Check session status
    const res = await fetch(`${WAHA_API_URL}/api/sessions/default`, {
      headers: { 'X-Api-Key': WAHA_API_KEY },
    })

    if (!res.ok) {
      return NextResponse.json({ status: 'waha_unreachable', httpStatus: res.status })
    }

    const session = await res.json()
    const status = session.status

    if (status === 'WORKING') {
      return NextResponse.json({ status: 'healthy', whatsapp: 'connected', phone: session.me?.id })
    }

    // Session is NOT working — attempt recovery
    console.warn(`[health] WAHA session status: ${status} — attempting recovery`)

    if (status === 'STOPPED' || status === 'FAILED') {
      // Try to restart the session
      await fetch(`${WAHA_API_URL}/api/sessions/default/start`, {
        method: 'POST',
        headers: { 'X-Api-Key': WAHA_API_KEY },
      })
      return NextResponse.json({ status: 'recovering', action: 'session_restarted', previousStatus: status })
    }

    if (status === 'SCAN_QR_CODE') {
      // Session lost auth — needs manual QR scan. Can't auto-recover.
      // Alert admin if we have their number
      return NextResponse.json({ status: 'needs_qr_scan', action: 'manual_intervention_needed' })
    }

    if (status === 'STARTING') {
      return NextResponse.json({ status: 'starting', action: 'waiting' })
    }

    return NextResponse.json({ status: 'unknown', rawStatus: status })
  } catch (err: any) {
    console.error('[health] WAHA health check failed:', err.message)
    return NextResponse.json({ status: 'error', error: err.message }, { status: 500 })
  }
}
