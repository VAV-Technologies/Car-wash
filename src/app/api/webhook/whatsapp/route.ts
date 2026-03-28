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

    // Skip group messages and channels
    if (from.includes('@g.us') || from.includes('@newsletter') || from.includes('@broadcast')) {
      return NextResponse.json({ ok: true, skipped: 'group/channel message' })
    }

    // Skip business/verified accounts (chatbots like Indosat, Telkomsel, etc.)
    if (message.isFromBusiness || message._data?.notifyName === '' || message._data?.isBusinessMessage) {
      return NextResponse.json({ ok: true, skipped: 'business account' })
    }

    // Known bot/service numbers blocklist (Indonesian telcos, WhatsApp official, etc.)
    const blockedPrefixes = [
      '628551',     // Indosat official
      '628112',     // Telkomsel
      '6221',       // Jakarta landlines
      '1500',       // Service numbers
      '155',        // Short codes
      '15517',      // WhatsApp official
    ]
    const senderNumber = from.replace('@c.us', '').replace('@lid', '')
    if (blockedPrefixes.some(p => senderNumber.startsWith(p)) || senderNumber.length < 8) {
      return NextResponse.json({ ok: true, skipped: 'blocked number' })
    }

    // Bot loop detection: if 5+ messages from same sender in last 3 minutes, stop replying
    const { getSupabaseAdmin: getAdmin } = await import('@/lib/supabase')
    const db = getAdmin()
    const { data: recentConvo } = await db
      .from('whatsapp_conversations')
      .select('messages')
      .eq('chat_id', from)
      .single()

    if (recentConvo?.messages && Array.isArray(recentConvo.messages)) {
      const threeMinAgo = Date.now() - 3 * 60 * 1000
      const recentMsgs = recentConvo.messages.filter(
        (m: any) => m.timestamp && new Date(m.timestamp).getTime() > threeMinAgo
      )
      if (recentMsgs.length >= 10) {
        console.warn(`[whatsapp-webhook] Bot loop detected for ${from} — ${recentMsgs.length} messages in 3 min`)
        return NextResponse.json({ ok: true, skipped: 'bot loop detected' })
      }
    }

    const messageText: string | undefined = message.body
    const mediaType: string | undefined = message.type // chat, image, video, sticker, document, audio, ptt

    // Stickers: silently ignore (like an emoji, no response needed)
    if (mediaType === 'sticker') {
      return NextResponse.json({ ok: true, skipped: 'sticker' })
    }

    // Images, videos, audio, documents WITHOUT text: escalate to human
    if (mediaType && ['image', 'video', 'audio', 'ptt', 'document'].includes(mediaType) && !messageText) {
      const { getSupabaseAdmin } = await import('@/lib/supabase')
      const supabase = getSupabaseAdmin()
      await supabase.from('human_escalations').insert({
        chat_id: from,
        phone: '+' + from.replace('@c.us', ''),
        reason: `Customer sent ${mediaType} — needs human review`,
        category: 'other',
        customer_message: `[${mediaType} attachment]`,
        status: 'pending',
      })

      const seenDelay = 2000 + Math.random() * 2000
      setTimeout(() => { sendSeen(from).catch(() => {}) }, seenDelay)
      await new Promise(r => setTimeout(r, 10000 + Math.random() * 10000))
      await sendText(from, 'Oke aku terima filenya. Nanti aku teruskan ke tim ya')
      return NextResponse.json({ ok: true, handled: 'media-escalated' })
    }

    // Empty / undefined body
    if (!messageText) {
      return NextResponse.json({ ok: true, skipped: 'empty body' })
    }

    // ── Extract identifiers ────────────────────────────────────────
    const chatId = from // e.g. "6281234567890@c.us" or "116015774097507@lid"
    let phone: string

    if (from.includes('@lid')) {
      // @lid format doesn't contain real phone number — resolve via WAHA contacts API
      try {
        const WAHA_API_URL = process.env.WAHA_API_URL!
        const WAHA_API_KEY = process.env.WAHA_API_KEY!
        const contactRes = await fetch(`${WAHA_API_URL}/api/contacts?session=default&contactId=${from}`, {
          headers: { 'X-Api-Key': WAHA_API_KEY },
        })
        if (contactRes.ok) {
          const contact = await contactRes.json()
          // Contact may have a phone in 'number' or nested 'id' with @c.us
          const realNumber = contact?.number || contact?.id?.user || from.replace('@lid', '')
          phone = realNumber.startsWith('+') ? realNumber : '+' + realNumber
        } else {
          phone = from.replace('@lid', '') // fallback: use lid number as-is
        }
      } catch {
        phone = from.replace('@lid', '')
      }
    } else {
      phone = '+' + from.replace('@c.us', '')
    }

    // ── Mark as seen after a brief pause ─────────────────────────
    const seenDelay = 2000 + Math.random() * 2000 // 2-4 seconds
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
      reply = 'Maaf nih, ada gangguan bentar. Coba kirim lagi pesannya ya'
    }

    // ── Human-like typing delay before sending ─────────────────────
    // First message: ~60 seconds
    // Subsequent: 10-20 seconds
    let minDelay: number, maxDelay: number
    if (isFirstMessage) {
      minDelay = 55000; maxDelay = 65000
    } else {
      minDelay = 10000; maxDelay = 20000
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
