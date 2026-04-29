import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendText } from '@/lib/agents/waha'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (process.env.SHERA_DISABLED === 'true') {
    return NextResponse.json({ status: 'ok', skipped: 'shera disabled' })
  }

  const supabase = getSupabaseAdmin()

  try {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()

    // Find conversations where last message was 2-6 hours ago
    const { data: convos } = await supabase
      .from('whatsapp_conversations')
      .select('chat_id, phone, customer_id, messages, last_message_at')
      .lte('last_message_at', twoHoursAgo)
      .gte('last_message_at', sixHoursAgo)

    if (!convos || convos.length === 0) {
      return NextResponse.json({ ok: true, sent: 0, message: 'No idle conversations' })
    }

    let sent = 0
    for (const convo of convos) {
      const msgs = Array.isArray(convo.messages) ? convo.messages : []
      if (msgs.length === 0) continue

      const lastMsg = msgs[msgs.length - 1]

      // Only nudge if the last message was FROM the assistant (we replied, they ghosted)
      // If last message is from user, they said something and we should have replied already
      if (lastMsg.role !== 'assistant') continue

      // Don't nudge if already nudged
      if (msgs.some((m: any) => m.context === 'ghost-nudge')) continue

      // Don't nudge completed conversations (booking confirmed, etc)
      const lastContent = (lastMsg.content || '').toLowerCase()
      if (lastContent.includes('booking udah masuk') || lastContent.includes('done') || lastContent.includes('selesai')) continue

      // Skip chats that were silenced by a bulk_order escalation. Admin is
      // handling those manually — a nudge from Shera would contradict the
      // "I'll get back to you" message we sent earlier.
      const { data: muteEsc } = await supabase
        .from('human_escalations')
        .select('id')
        .eq('chat_id', (convo as any).chat_id)
        .eq('category', 'bulk_order')
        .limit(1)
        .maybeSingle()
      if (muteEsc) continue

      // Fetch the booking link for this chat. Only nudge when:
      // (a) a link was sent, AND
      // (b) it's still active (not yet submitted).
      // If there's no link at all, the customer was likely still mid-intro when
      // they ghosted — no point nudging about a form they never saw.
      const { data: link } = await supabase
        .from('booking_links')
        .select('status')
        .eq('phone', (convo as any).phone)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (!link) continue
      if ((link as any).status === 'submitted') continue

      // Resolve customer name — prefer DB record (authoritative) over regex on
      // assistant messages (Shera doesn't say "Hai [name]", so the old regex
      // almost always fell back to "kak").
      let firstName = 'kak'
      const customerId = (convo as any).customer_id
      if (customerId) {
        const { data: customer } = await supabase
          .from('customers')
          .select('name')
          .eq('id', customerId)
          .maybeSingle()
        const name = (customer as any)?.name
        if (name && name !== 'WhatsApp User' && name !== 'Unknown') {
          firstName = String(name).trim().split(/\s+/)[0] // first token only
        }
      }

      // Nudge message references the booking form explicitly and invites a
      // reply by asking about issues — opens the door for the customer to
      // either come back with a question or complete the form.
      const nudges = [
        `Hai ${firstName}, no rush ya kak — aku lihat form booking-nya belum masuk nih. Kalau ada kendala pas ngisi, kabarin aku ya 🙂`,
        `Hai ${firstName}, check-in aja kak — form booking-nya belum ada yang masuk. Kalau bingung atau ada yang mau ditanyain, chat aku ya`,
        `Hai ${firstName}, no rush kak 🙂 Form booking-nya belum aku terima nih. Ada yang bisa aku bantu kak?`,
      ]
      const nudge = nudges[Math.floor(Math.random() * nudges.length)]

      try {
        await sendText(convo.chat_id, nudge)
        sent++

        msgs.push({
          role: 'assistant',
          content: nudge,
          timestamp: new Date().toISOString(),
          context: 'ghost-nudge',
        })

        await supabase
          .from('whatsapp_conversations')
          .update({ messages: msgs.slice(-30), last_message_at: new Date().toISOString() })
          .eq('chat_id', convo.chat_id)
      } catch {
        // Failed to send — skip
      }
    }

    return NextResponse.json({ ok: true, sent, checked: convos.length })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
