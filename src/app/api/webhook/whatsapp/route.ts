import { NextRequest, NextResponse } from 'next/server'
import { processMessage } from '@/lib/agents/shera'
import { sendText, sendSeen } from '@/lib/agents/waha'
import { detectHints } from '@/lib/agents/shera-preprocessor'
import { alertLLMFailure } from '@/lib/agents/shera-alerts'
import { trackMetric } from '@/lib/agents/shera-metrics'
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

    // Bot loop detection: if 10+ messages from same sender in last 3 minutes, stop replying
    try {
      const { getSupabaseAdmin: getAdmin } = await import('@/lib/supabase')
      const db = getAdmin()
      const { data: recentConvo } = await db
        .from('whatsapp_conversations')
        .select('messages')
        .eq('chat_id', from)
        .maybeSingle()

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
    } catch {
      // Bot loop check failed — continue processing anyway
    }

    const messageText: string | undefined = message.body
    const mediaType: string | undefined = message.type // chat, image, video, sticker, document, audio, ptt

    // Extract quoted/reply context from WAHA payload
    const contextInfo = message._data?.contextInfo
    let quotedContext: string | null = null
    if (contextInfo?.quotedMessage) {
      const imgCaption = contextInfo.quotedMessage.imageMessage?.caption
      const textBody = contextInfo.quotedMessage.conversation
        || contextInfo.quotedMessage.extendedTextMessage?.text
      quotedContext = imgCaption || textBody || null
    }

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

    // Empty / undefined body (allow through if replying to a message)
    if (!messageText && !quotedContext) {
      return NextResponse.json({ ok: true, skipped: 'empty body' })
    }

    // Prepend quoted context so Claude understands what the customer is replying to
    let enrichedText = messageText || ''
    if (quotedContext) {
      enrichedText = `[Customer replied to: "${quotedContext}"]\n${enrichedText}`.trim()
    }

    // ── Extract identifiers ────────────────────────────────────────
    let chatId = from // e.g. "6281234567890@c.us" or "116015774097507@lid"
    let phone: string

    if (from.includes('@lid')) {
      // @lid format doesn't contain real phone — resolve via WAHA contacts API
      let resolvedPhone = ''
      try {
        const WAHA_API_URL = process.env.WAHA_API_URL!
        const WAHA_API_KEY = process.env.WAHA_API_KEY!
        const controller = new AbortController()
        setTimeout(() => controller.abort(), 5000)
        const contactRes = await fetch(`${WAHA_API_URL}/api/contacts?session=default&contactId=${from}`, {
          headers: { 'X-Api-Key': WAHA_API_KEY },
          signal: controller.signal,
        })
        if (contactRes.ok) {
          const contact = await contactRes.json()
          resolvedPhone = contact?.number || contact?.id?.user || ''
        }
      } catch {}

      // Clean resolved phone
      resolvedPhone = resolvedPhone.replace(/[\s+\-()]/g, '')
      if (!resolvedPhone || resolvedPhone.length < 8) {
        resolvedPhone = from.replace('@lid', '')
      }

      phone = '+' + resolvedPhone
      // Normalize chat_id to @c.us format so conversations are consistent
      // regardless of @lid changes between sessions
      chatId = resolvedPhone + '@c.us'
    } else {
      phone = '+' + from.replace('@c.us', '')
    }

    // ── Mark as seen after a brief pause ─────────────────────────
    const seenDelay = 2000 + Math.random() * 2000
    setTimeout(() => { sendSeen(from).catch(() => {}) }, seenDelay) // sendSeen uses original from (works with both @lid and @c.us)

    // ── Message buffering ──────────────────────────────────────────
    // When people send multiple messages quickly (e.g. splitting one
    // thought into 2-3 texts), we buffer them and process together.
    //
    // How it works:
    // 1. Save incoming message to a pending_messages array in the conversation
    // 2. Wait 8 seconds for more messages to arrive
    // 3. After waiting, check if new messages were added during the wait
    // 4. Combine all pending messages into one and process together
    // 5. Clear the pending buffer

    const { getSupabaseAdmin } = await import('@/lib/supabase')
    const supabase = getSupabaseAdmin()

    // Get or create conversation
    let { data: convo } = await supabase
      .from('whatsapp_conversations')
      .select('messages')
      .eq('chat_id', chatId)
      .single()

    const isFirstMessage = !convo || !convo.messages || (Array.isArray(convo.messages) && convo.messages.length === 0)

    if (isFirstMessage) {
      trackMetric(chatId, 'conversation_started', { phone }).catch(() => {})
    }

    const msgTimestamp = Date.now()

    // ── Phase 1: Initial buffer (5s) — catch burst messages ──────
    const BUFFER_WAIT = 5000
    await new Promise(resolve => setTimeout(resolve, BUFFER_WAIT))

    // ── Phase 2: Dedup — check if we're the latest message ───────
    const { data: freshConvo } = await supabase
      .from('whatsapp_conversations')
      .select('messages')
      .eq('chat_id', chatId)
      .single()

    if (freshConvo?.messages && Array.isArray(freshConvo.messages)) {
      const recentUserMsgs = freshConvo.messages.filter(
        (m: any) => m.role === 'user' && m.timestamp && new Date(m.timestamp).getTime() > msgTimestamp
      )
      if (recentUserMsgs.length > 0) {
        return NextResponse.json({ ok: true, skipped: 'buffered — newer message will process' })
      }
    }

    // ── Phase 3: Collect pending messages ─────────────────────────
    function collectPending(): string {
      const allMsgs = Array.isArray(freshConvo?.messages) ? freshConvo.messages : (Array.isArray(convo?.messages) ? convo.messages : [])
      const pendingTexts: string[] = []
      for (let i = allMsgs.length - 1; i >= 0; i--) {
        if (allMsgs[i].role === 'user') pendingTexts.unshift(allMsgs[i].content)
        else break
      }
      const combined = pendingTexts.length > 0
        ? [...pendingTexts, enrichedText].filter((v, i, a) => a.indexOf(v) === i).join('\n')
        : enrichedText
      const hints = detectHints(combined)
      return hints.length > 0 ? `[SYSTEM HINTS: ${hints.join(', ')}]\n${combined}` : combined
    }

    // ── Phase 4: LLM processing with interrupt monitoring ────────
    // Start LLM immediately. In parallel, poll for new messages.
    // If a new message arrives during processing, abort LLM, merge, restart.
    const MAX_INTERRUPTS = 2
    let interrupts = 0
    let reply!: string
    let lastErr: unknown = null
    let succeeded = false

    while (interrupts <= MAX_INTERRUPTS && !succeeded) {
      const processedMessage = collectPending()
      const abortController = new AbortController()

      // LLM promise (with retries)
      const llmPromise = (async (): Promise<{ type: 'reply'; reply: string }> => {
        let attempt = 0
        const MAX_RETRIES = 2
        while (attempt <= MAX_RETRIES) {
          try {
            const r = await processMessage(chatId, phone, processedMessage, abortController.signal)
            return { type: 'reply', reply: r }
          } catch (err) {
            if (abortController.signal.aborted) throw new Error('aborted')
            lastErr = err
            attempt++
            console.error(`[shera-error] Attempt ${attempt} failed:`, err)
            if (attempt <= MAX_RETRIES) await new Promise(r => setTimeout(r, 1000))
          }
        }
        throw new Error('all retries failed')
      })()

      // Interrupt detector — polls DB every 2s for new messages
      const interruptPromise = (async (): Promise<{ type: 'interrupted' }> => {
        const checkStart = Date.now()
        while (!abortController.signal.aborted) {
          await new Promise(r => setTimeout(r, 2000))
          if (abortController.signal.aborted) break
          try {
            const { data } = await supabase
              .from('whatsapp_conversations')
              .select('messages')
              .eq('chat_id', chatId)
              .single()
            const msgs = Array.isArray(data?.messages) ? data.messages : []
            const hasNew = msgs.some(
              (m: any) => m.role === 'user' && m.timestamp && new Date(m.timestamp).getTime() > checkStart
            )
            if (hasNew) return { type: 'interrupted' as const }
          } catch { /* DB check failed — continue */ }
        }
        // If aborted (LLM finished first), hang forever so LLM wins the race
        return new Promise<never>(() => {})
      })()

      try {
        const result = await Promise.race([llmPromise, interruptPromise])

        if (result.type === 'interrupted') {
          interrupts++
          abortController.abort()
          console.log(`[shera] Interrupt ${interrupts}/${MAX_INTERRUPTS} — new message during processing`)
          await new Promise(r => setTimeout(r, 3000)) // let new message settle
          continue
        }

        // LLM completed — stop the interrupt poller and use the reply
        abortController.abort()
        reply = result.reply
        succeeded = true
      } catch (err: any) {
        abortController.abort()
        if (err.message === 'aborted') {
          // Was interrupted — loop will restart
          continue
        }
        // All retries failed
        break
      }
    }

    if (!succeeded) {
      // All attempts + interrupts exhausted — send fallback
      console.error('[shera-error] All attempts exhausted, queuing background retry')
      alertLLMFailure(chatId, phone, String(lastErr)).catch(() => {})
      trackMetric(chatId, 'llm_failure', { phone, error: String(lastErr).slice(0, 200) }).catch(() => {})
      trackMetric(chatId, 'llm_fallback_sent', { phone }).catch(() => {})
      try {
        await sendText(chatId, 'Halo! Aku lagi proses pesanannya, sebentar lagi aku kabarin lagi ya 🙏')
      } catch { /* WAHA down */ }

      try {
        const retryAt = new Date(Date.now() + 20 * 60 * 1000).toISOString()
        await supabase
          .from('whatsapp_conversations')
          .update({
            retry_queue: {
              message: collectPending(),
              chat_id: chatId,
              phone,
              attempts: 0,
              max_attempts: 5,
              next_retry_at: retryAt,
              created_at: new Date().toISOString(),
            },
          })
          .eq('chat_id', chatId)
      } catch (queueErr) {
        console.error('[shera-error] Failed to queue retry:', queueErr)
      }

      return NextResponse.json({ ok: false, error: 'LLM failed — fallback sent, retry queued' }, { status: 200 })
    }

    // ── Send reply back via WAHA ───────────────────────────────────
    await sendText(chatId, reply)

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('[whatsapp-webhook] Error processing message:', error)
    // Return actual error for debugging — change to generic message in production
    return NextResponse.json({ ok: false, error: error?.message || String(error) }, { status: 200 })
  }
}

// ─── GET — health check ──────────────────────────────────────────────
export async function GET() {
  return NextResponse.json({ status: 'ok', agent: 'Shera' })
}
