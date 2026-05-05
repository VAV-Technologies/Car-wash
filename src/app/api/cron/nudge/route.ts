// Hourly cron that finds WhatsApp leads who got the booking link and never
// filled the form, and posts a tiered alert to the "Castudio Nudge" Telegram
// group. The human operator clicks the wa.me link in the alert and sends a
// nudge from their own WhatsApp — this bot never messages customers.
//
// Three escalating tiers per link send:
//   t1 — fired ≥4h after link sent
//   t2 — fired ≥24h after link sent
//   t3 — fired ≥7 days after link sent (final follow-up)
//
// Each tier fires at most once per link send. We never backfill: if the cron
// was down for the t1 window, we skip t1 and fire t2 directly when its
// threshold is crossed.
//
// Signal: an assistant message in `whatsapp_conversations.messages` with
//   context === 'auto-booking-link' (written by the WhatsApp webhook on
//   first contact) or containing 'castudio.id/book' substring.
//
// Idempotency: per-tier markers in the messages array with
//   context === 'nudge-alert-sent-t{1,2,3}'.
import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import {
  isShareNudgeEnabled,
  postNudgeAlert,
  type NudgeAlertMessage,
  type NudgeTier,
} from '@/lib/agents/shera-nudge-tg'

export const dynamic = 'force-dynamic'

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

const T1_MS = 4 * HOUR
const T2_MS = 24 * HOUR
const T3_MS = 7 * DAY
const HARD_CAP_MS = 8 * DAY              // give up entirely after 8 days

const ACTIVE_BOOKING_STATUSES = ['requested', 'confirmed', 'en_route', 'in_progress'] as const

type ConvoMessage = {
  role?: string
  content?: string
  timestamp?: string
  context?: string
}

function findLatestByPredicate(
  msgs: ConvoMessage[],
  pred: (m: ConvoMessage) => boolean,
): ConvoMessage | null {
  for (let i = msgs.length - 1; i >= 0; i--) {
    if (pred(msgs[i])) return msgs[i]
  }
  return null
}

function cleanPhone(raw: string | null | undefined): string {
  return String(raw || '').replace(/[+\s\-()]/g, '').replace(/\D/g, '')
}

function tierMarker(tier: NudgeTier): string {
  return `nudge-alert-sent-${tier}`
}

// Decide which tier to fire (if any) given elapsed time and existing markers.
// Cumulative gating: a higher tier supersedes lower ones, so once t2 is sent
// we never go back and fire t1 (and likewise t3 supersedes t2 and t1). This
// also handles the gap case where t1 was missed entirely (cron downtime) —
// we just fire t2 directly when its threshold is crossed.
function pickTier(elapsedMs: number, markers: Set<string>): NudgeTier | null {
  const t3Sent = markers.has(tierMarker('t3'))
  const t2Sent = markers.has(tierMarker('t2'))
  const t1Sent = markers.has(tierMarker('t1'))
  if (elapsedMs >= T3_MS && !t3Sent) return 't3'
  if (elapsedMs >= T2_MS && !t2Sent && !t3Sent) return 't2'
  if (elapsedMs >= T1_MS && !t1Sent && !t2Sent && !t3Sent) return 't1'
  return null
}

function draftFor(tier: NudgeTier, firstName: string | null): string {
  const greeting = firstName ? `Hai kak ${firstName}!` : 'Hai kak!'
  if (tier === 't3') {
    return `${greeting} Mau check terakhir aja — kalau masih ada minat buat cuci mobilnya, kasih tau aja kapan enaknya. Kalau lagi sibuk gpp, kabarin aja kalau mau lagi nanti`
  }
  if (tier === 't2') {
    return `${greeting} Masih ada minat buat cuci mobilnya kak? Kalau mau aku bantu langsung jadwalin di sini juga bisa, kasih tau aja jamnya`
  }
  return `${greeting} Mau bantu kalau ada yang masih bingung sama form bookingnya. Boleh aku bantu jadwalin langsung di sini?`
}

export async function GET(req: Request) {
  // Vercel cron sends Authorization: Bearer <CRON_SECRET>
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (process.env.SHERA_NUDGE_DISABLED === 'true') {
    return NextResponse.json({ ok: true, skipped: 'SHERA_NUDGE_DISABLED' })
  }

  if (!isShareNudgeEnabled()) {
    return NextResponse.json({ ok: true, skipped: 'nudge bot env vars not set' })
  }

  const supabase = getSupabaseAdmin()
  const now = Date.now()
  const windowStart = new Date(now - HARD_CAP_MS).toISOString()

  try {
    // Pull conversations with any activity in the last 8 days. We don't filter
    // by an upper bound on last_message_at because the link send timestamp
    // (inside the messages array) is what we actually care about — a customer
    // can have replied recently while the link is still 24h+ old.
    const { data: conversations, error: convErr } = await supabase
      .from('whatsapp_conversations')
      .select('id, chat_id, phone, customer_id, messages, last_message_at')
      .gte('last_message_at', windowStart)
      .order('last_message_at', { ascending: false })
      .limit(100)

    if (convErr) throw convErr
    if (!conversations || conversations.length === 0) {
      return NextResponse.json({ ok: true, sent: 0, scanned: 0 })
    }

    let sent = 0
    let scanned = 0
    const tierCounts: Record<NudgeTier, number> = { t1: 0, t2: 0, t3: 0 }

    for (const conv of conversations) {
      scanned++
      const msgs: ConvoMessage[] = Array.isArray((conv as any).messages) ? (conv as any).messages : []
      if (!msgs.length) continue

      // Most recent booking-link send in this conversation.
      const linkMsg = findLatestByPredicate(
        msgs,
        (m) =>
          m.role === 'assistant' &&
          (m.context === 'auto-booking-link' ||
            (typeof m.content === 'string' && m.content.includes('castudio.id/book'))),
      )
      if (!linkMsg?.timestamp) continue

      const linkSentAt = Date.parse(linkMsg.timestamp)
      if (!Number.isFinite(linkSentAt)) continue

      const elapsed = now - linkSentAt
      if (elapsed < T1_MS) continue            // too fresh — wait for t1 window
      if (elapsed > HARD_CAP_MS) continue      // too cold — give up

      // Collect existing tier markers that fall AFTER this link send. Older
      // markers belong to a previous link cycle and are ignored, so a re-sent
      // link gets a fresh nudge sequence.
      const markers = new Set<string>()
      for (const m of msgs) {
        if (!m.context || !m.context.startsWith('nudge-alert-sent-')) continue
        const ts = m.timestamp ? Date.parse(m.timestamp) : NaN
        if (Number.isFinite(ts) && ts >= linkSentAt) markers.add(m.context)
      }

      const tier = pickTier(elapsed, markers)
      if (!tier) continue

      // Customer-side check: did they actually book since the link was sent?
      // Also bail if any active booking exists in any state — they probably
      // booked offline or by phone, and we shouldn't pester.
      const customerId = (conv as any).customer_id
      if (customerId) {
        const linkSentIso = new Date(linkSentAt).toISOString()
        const { count: postLinkBookings } = await supabase
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .eq('customer_id', customerId)
          .gte('created_at', linkSentIso)
        if ((postLinkBookings ?? 0) > 0) continue

        const { count: activeBookings } = await supabase
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .eq('customer_id', customerId)
          .in('status', ACTIVE_BOOKING_STATUSES as unknown as string[])
        if ((activeBookings ?? 0) > 0) continue
      }

      // Look up the customer (no FK embed — fetch separately).
      let customerName: string | null = null
      let customerPhone: string | null = null
      if (customerId) {
        const { data: customerRow } = await supabase
          .from('customers')
          .select('name, phone')
          .eq('id', customerId)
          .maybeSingle()
        customerName = (customerRow as any)?.name ?? null
        customerPhone = (customerRow as any)?.phone ?? null
      }

      const phone = cleanPhone(customerPhone || (conv as any).phone)
      if (!phone) continue
      const firstName = customerName ? customerName.split(' ')[0] : null

      const lastMessages: NudgeAlertMessage[] = msgs
        .slice(-4)
        .filter(
          (m) =>
            (m.role === 'user' || m.role === 'assistant') &&
            typeof m.content === 'string' &&
            !(m.context && m.context.startsWith('nudge-alert-sent-')),
        )
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content as string,
          ts: m.timestamp || '',
        }))

      const hoursSinceLink = Math.round(elapsed / HOUR)

      try {
        await postNudgeAlert({
          tier,
          name: customerName,
          phone,
          linkSentAt: new Date(linkSentAt).toISOString(),
          hoursSinceLink,
          lastMessages,
          draftText: draftFor(tier, firstName),
        })

        const updatedMsgs = [
          ...msgs,
          {
            role: 'assistant',
            content: `[internal] nudge alert ${tier} posted to Telegram`,
            timestamp: new Date().toISOString(),
            context: tierMarker(tier),
          },
        ]
        await supabase
          .from('whatsapp_conversations')
          .update({ messages: updatedMsgs.slice(-30) })
          .eq('id', (conv as any).id)

        sent++
        tierCounts[tier]++
      } catch (err) {
        console.error(`[nudge] Failed to post ${tier} alert for ${phone}:`, err)
        // Don't update the marker on failure — we'll retry next hour.
      }
    }

    return NextResponse.json({ ok: true, sent, scanned, tiers: tierCounts })
  } catch (err: any) {
    console.error('[nudge] Error:', err)
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
