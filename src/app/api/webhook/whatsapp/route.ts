import { NextRequest, NextResponse } from 'next/server'
import { processMessage } from '@/lib/agents/shera'
import { sendText, sendSeen } from '@/lib/agents/waha'
import crypto from 'crypto'

// ─── HMAC signature validation (optional) ────────────────────────────
function verifyHmac(body: string, signature: string | null): boolean {
  const secret = process.env.WAHA_WEBHOOK_SECRET
  if (!secret) return true // no secret configured → skip validation
  if (!signature) return false

  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected),
  )
}

// ─── POST — receive incoming WhatsApp messages from WAHA ─────────────
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()

    // Optional HMAC validation
    const signature = req.headers.get('x-waha-hmac') ?? req.headers.get('x-hub-signature-256')
    if (!verifyHmac(rawBody, signature)) {
      console.warn('[whatsapp-webhook] Invalid HMAC signature — rejecting')
      return NextResponse.json({ ok: false, error: 'invalid signature' }, { status: 401 })
    }

    const body = JSON.parse(rawBody)

    // WAHA uses either "payload" or "data" as the message key
    const message = body.payload ?? body.data
    const event: string = body.event

    // ── Guard clauses ──────────────────────────────────────────────
    if (event !== 'message') {
      return NextResponse.json({ ok: true, skipped: 'not a message event' })
    }

    if (!message) {
      return NextResponse.json({ ok: true, skipped: 'no payload/data' })
    }

    if (message.fromMe) {
      return NextResponse.json({ ok: true, skipped: 'outgoing message' })
    }

    const from: string | undefined = message.from
    if (!from) {
      return NextResponse.json({ ok: true, skipped: 'no from field' })
    }

    // Skip group messages
    if (from.includes('@g.us')) {
      return NextResponse.json({ ok: true, skipped: 'group message' })
    }

    const messageText: string | undefined = message.body
    const hasMedia: boolean = message.hasMedia ?? false

    // Media-only message (no text body)
    if (hasMedia && !messageText) {
      await sendText(
        from,
        'Maaf, saat ini saya hanya bisa memproses pesan teks. 😊',
      )
      return NextResponse.json({ ok: true, handled: 'media-only reply' })
    }

    // Empty / undefined body
    if (!messageText) {
      return NextResponse.json({ ok: true, skipped: 'empty body' })
    }

    // ── Extract identifiers ────────────────────────────────────────
    const chatId = from // e.g. "6281234567890@c.us"
    const phone = '+' + chatId.replace('@c.us', '')

    // ── Mark as seen after a brief pause ─────────────────────────
    const seenDelay = 3000 + Math.random() * 5000 // 3-8 seconds
    setTimeout(() => { sendSeen(chatId).catch(() => {}) }, seenDelay)

    // ── Check if this is the first message in the conversation ───
    const { getSupabaseAdmin } = await import('@/lib/supabase')
    const supabase = getSupabaseAdmin()
    const { data: convo } = await supabase
      .from('whatsapp_conversations')
      .select('messages')
      .eq('chat_id', chatId)
      .single()
    const isFirstMessage = !convo || !convo.messages || (Array.isArray(convo.messages) && convo.messages.length === 0)

    // ── Process with Shera agent ───────────────────────────────────
    let reply: string
    try {
      reply = await processMessage(chatId, phone, messageText)
    } catch (err) {
      console.error('[shera-error]', err)
      reply = 'Maaf ada error nih. Tim kami akan hubungi kamu segera ya'
    }

    // ── Human-like typing delay before sending ─────────────────────
    // First message: 90-120 seconds (like a person picking up the phone)
    // Subsequent: 40-60 seconds (like actually typing a reply)
    let minDelay: number, maxDelay: number
    if (isFirstMessage) {
      minDelay = 90000; maxDelay = 120000
    } else {
      minDelay = 40000; maxDelay = 60000
    }
    const typingDelay = minDelay + Math.random() * (maxDelay - minDelay)
    await new Promise(resolve => setTimeout(resolve, typingDelay))

    // ── Send reply back via WAHA ───────────────────────────────────
    await sendText(chatId, reply)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[whatsapp-webhook] Error processing message:', error)
    // Always return 200 so WAHA does not retry
    return NextResponse.json({ ok: false, error: 'internal error' }, { status: 200 })
  }
}

// ─── GET — health check ──────────────────────────────────────────────
export async function GET() {
  return NextResponse.json({ status: 'ok', agent: 'Shera' })
}
