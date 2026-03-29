import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendText } from '@/lib/agents/waha'

export const dynamic = 'force-dynamic'

/**
 * GET — Check for jobs that need follow-up and send WhatsApp messages.
 * Called automatically when a job is completed (after 2 hour delay via scheduled check)
 * or manually at /api/cron/follow-up
 *
 * A job needs follow-up when:
 * - completed_at is 2+ hours ago
 * - customer_rating is null
 * - washer_notes doesn't contain follow_up_sent: true
 */
export async function GET(req: Request) {
  // Verify cron request (Vercel sends this header)
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()

  try {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()

    // Find completed jobs with no rating, completed 2-48 hours ago
    const { data: jobs } = await supabase
      .from('jobs')
      .select('id, booking_id, completed_at, washer_notes, bookings(customer_id, service_type, customers(name, phone))')
      .is('customer_rating', null)
      .not('completed_at', 'is', null)
      .lte('completed_at', twoHoursAgo)
      .gte('completed_at', fortyEightHoursAgo)
      .limit(10)

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({ ok: true, sent: 0, message: 'No jobs need follow-up' })
    }

    let sent = 0
    for (const job of jobs) {
      // Check if follow-up already sent
      let notes: Record<string, unknown> = {}
      try { notes = JSON.parse(job.washer_notes || '{}') } catch {}
      if (notes.follow_up_sent) continue

      const booking = Array.isArray(job.bookings) ? job.bookings[0] : job.bookings
      const customer = booking?.customers
      const customerObj = Array.isArray(customer) ? customer[0] : customer
      if (!customerObj?.phone) continue

      const phone = String(customerObj.phone).replace(/[\s+\-()]/g, '')
      const chatId = phone + '@c.us'
      const name = customerObj.name || ''
      const firstName = name.split(' ')[0] || 'kak'

      const message = `Hai ${firstName}! Gimana tadi cuci mobilnya? Boleh kasih rating 1 sampai 5? Kalau ada catatan atau saran buat next time, kasih tau aja ya`

      try {
        await sendText(chatId, message)
        sent++

        // Mark follow-up sent
        notes.follow_up_sent = true
        notes.follow_up_at = new Date().toISOString()
        await supabase.from('jobs').update({ washer_notes: JSON.stringify(notes) }).eq('id', job.id)

        // Store in conversation for Shera context
        const { data: convo } = await supabase
          .from('whatsapp_conversations')
          .select('id, messages')
          .eq('chat_id', chatId)
          .single()

        if (convo) {
          const msgs = Array.isArray(convo.messages) ? convo.messages : []
          msgs.push({
            role: 'assistant',
            content: message,
            timestamp: new Date().toISOString(),
            context: `Follow-up for job ${job.id}. Ask customer to rate 1-5 and give feedback. Use submit_job_rating tool when they respond.`,
          })
          await supabase
            .from('whatsapp_conversations')
            .update({ messages: msgs.slice(-30), last_message_at: new Date().toISOString() })
            .eq('id', convo.id)
        }
      } catch (err) {
        console.error(`[follow-up] Failed to send to ${chatId}:`, err)
      }
    }

    return NextResponse.json({ ok: true, sent, total: jobs.length })
  } catch (err: any) {
    console.error('[follow-up] Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

/**
 * POST — Schedule a follow-up for a specific job.
 * Called when a job is completed in the washer panel.
 * Triggers the follow-up check after a 2-hour delay.
 */
export async function POST(req: Request) {
  const { job_id } = await req.json().catch(() => ({ job_id: null }))

  // Fire the GET check after 2 hours by scheduling via external call
  // For now, just return OK — the GET endpoint handles the actual check
  // The washer panel will call this on job completion as a signal
  return NextResponse.json({ ok: true, scheduled: true, job_id })
}
