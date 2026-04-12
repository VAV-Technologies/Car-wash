import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { processMessage } from '@/lib/agents/shera'
import { sendText } from '@/lib/agents/waha'
import { alertRetryExhausted } from '@/lib/agents/shera-alerts'

export const dynamic = 'force-dynamic'

/**
 * Background retry cron — runs every 20 minutes.
 * Picks up conversations where the LLM failed and retries processing.
 * Max 5 retries per conversation, then gives up.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()
  const now = new Date().toISOString()

  // Find conversations with pending retries that are due
  const { data: pending } = await supabase
    .from('whatsapp_conversations')
    .select('id, chat_id, retry_queue')
    .not('retry_queue', 'is', null)
    .order('last_message_at', { ascending: true })
    .limit(10) // Process max 10 per cron run to stay within Vercel limits

  if (!pending || pending.length === 0) {
    return NextResponse.json({ status: 'ok', retried: 0 })
  }

  let retried = 0
  let succeeded = 0
  let exhausted = 0

  for (const convo of pending) {
    const queue = convo.retry_queue as {
      message: string
      chat_id: string
      phone: string
      attempts: number
      max_attempts: number
      next_retry_at: string
      created_at: string
    }

    if (!queue || !queue.message) {
      // Invalid queue entry — clear it
      await supabase.from('whatsapp_conversations').update({ retry_queue: null }).eq('id', convo.id)
      continue
    }

    // Check if it's time to retry
    if (new Date(queue.next_retry_at) > new Date(now)) {
      continue // Not due yet
    }

    // Check if max retries exceeded
    if (queue.attempts >= queue.max_attempts) {
      console.warn(`[shera-retry] Max retries (${queue.max_attempts}) exceeded for ${queue.chat_id} — giving up`)
      alertRetryExhausted(queue.chat_id, queue.phone, queue.attempts).catch(() => {})
      await supabase.from('whatsapp_conversations').update({ retry_queue: null }).eq('id', convo.id)
      exhausted++
      continue
    }

    // Attempt to process the message
    retried++
    const newAttempts = queue.attempts + 1

    try {
      const reply = await processMessage(queue.chat_id, queue.phone, queue.message)

      // Success — send the reply and clear the queue
      await sendText(queue.chat_id, reply)
      await supabase.from('whatsapp_conversations').update({ retry_queue: null }).eq('id', convo.id)
      succeeded++
      console.log(`[shera-retry] Success for ${queue.chat_id} on attempt ${newAttempts}`)
    } catch (err) {
      console.error(`[shera-retry] Attempt ${newAttempts}/${queue.max_attempts} failed for ${queue.chat_id}:`, err)

      if (newAttempts >= queue.max_attempts) {
        // Final attempt failed — clear queue, no more retries
        await supabase.from('whatsapp_conversations').update({ retry_queue: null }).eq('id', convo.id)
        exhausted++
      } else {
        // Schedule next retry in 20 minutes
        const nextRetry = new Date(Date.now() + 20 * 60 * 1000).toISOString()
        await supabase
          .from('whatsapp_conversations')
          .update({
            retry_queue: { ...queue, attempts: newAttempts, next_retry_at: nextRetry },
          })
          .eq('id', convo.id)
      }
    }
  }

  return NextResponse.json({ status: 'ok', retried, succeeded, exhausted })
}
