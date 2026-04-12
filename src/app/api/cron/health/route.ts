import { NextResponse } from 'next/server'
import { sendText } from '@/lib/agents/waha'

export const dynamic = 'force-dynamic'

/**
 * Health check cron — runs every 15 minutes.
 * Checks if WAHA WhatsApp session is connected AND media delivery works.
 * If disconnected, attempts to restart. If media fails, restarts session.
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
      // Session is connected — also test media delivery
      // Send a tiny test image to our own number to verify media pipeline works
      const ownNumber = session.me?.id // e.g. "6285591222000@c.us"
      let mediaHealthy = true

      if (ownNumber) {
        try {
          const testImageUrl = 'https://placehold.co/1x1/png' // 1x1 pixel, minimal bandwidth
          const sendRes = await fetch(`${WAHA_API_URL}/api/sendImage`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Api-Key': WAHA_API_KEY,
            },
            body: JSON.stringify({
              session: 'default',
              chatId: ownNumber,
              file: { url: testImageUrl, mimetype: 'image/png' },
              caption: '',
            }),
          })

          if (!sendRes.ok) {
            console.error(`[health] Media test failed: HTTP ${sendRes.status}`)
            mediaHealthy = false
          } else {
            // Wait briefly then verify delivery
            await new Promise(r => setTimeout(r, 3000))
            const msgRes = await fetch(
              `${WAHA_API_URL}/api/default/chats/${ownNumber}/messages?limit=3&downloadMedia=false`,
              { headers: { 'X-Api-Key': WAHA_API_KEY } }
            )
            if (msgRes.ok) {
              const msgs = await msgRes.json()
              const hasRecentMedia = Array.isArray(msgs) && msgs.some((m: any) => m.fromMe && m.hasMedia)
              if (!hasRecentMedia) {
                console.error('[health] Media test: image accepted but not delivered — session may be degraded')
                mediaHealthy = false
              }
            }
          }
        } catch (mediaErr: any) {
          console.error('[health] Media test error:', mediaErr.message)
          mediaHealthy = false
        }

        // If media is broken but session is "WORKING", restart to fix
        if (!mediaHealthy) {
          console.warn('[health] Media delivery broken — restarting WAHA session')
          try {
            await fetch(`${WAHA_API_URL}/api/sessions/default/stop`, {
              method: 'POST',
              headers: { 'X-Api-Key': WAHA_API_KEY },
            })
            await new Promise(r => setTimeout(r, 3000))
            await fetch(`${WAHA_API_URL}/api/sessions/default/start`, {
              method: 'POST',
              headers: { 'X-Api-Key': WAHA_API_KEY },
            })
          } catch {}
          return NextResponse.json({ status: 'media_degraded', action: 'session_restarted', whatsapp: 'connected_but_media_broken' })
        }
      }

      return NextResponse.json({ status: 'healthy', whatsapp: 'connected', media: 'working', phone: ownNumber })
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
