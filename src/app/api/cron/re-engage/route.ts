import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendText } from '@/lib/agents/waha'

export const dynamic = 'force-dynamic'

/**
 * Finds one-time customers who last washed 30+ days ago
 * and sends a friendly re-engagement WhatsApp message.
 * Runs daily via Vercel cron.
 */
export async function GET() {
  const supabase = getSupabaseAdmin()

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const thirtyFiveDaysAgo = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Find bookings completed around 30 days ago
    const { data: oldBookings } = await supabase
      .from('bookings')
      .select('customer_id, scheduled_date, customers(id, name, phone, segment)')
      .eq('status', 'completed')
      .lte('scheduled_date', thirtyDaysAgo)
      .gte('scheduled_date', thirtyFiveDaysAgo)

    if (!oldBookings || oldBookings.length === 0) {
      return NextResponse.json({ ok: true, sent: 0, message: 'No customers to re-engage' })
    }

    // Group by customer, check they only had 1 booking and are not subscribers
    const customerIds = [...new Set(oldBookings.map(b => b.customer_id))]
    let sent = 0

    for (const customerId of customerIds) {
      // Count total bookings for this customer
      const { count } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', customerId)
        .eq('status', 'completed')

      if (!count || count > 1) continue // Skip repeat customers

      // Check they don't have any recent bookings (upcoming or confirmed)
      const { count: upcoming } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', customerId)
        .in('status', ['confirmed', 'en_route', 'in_progress'])

      if (upcoming && upcoming > 0) continue // Already has upcoming booking

      // Get customer info
      const booking = oldBookings.find(b => b.customer_id === customerId)
      const customer = Array.isArray(booking?.customers) ? booking.customers[0] : booking?.customers
      if (!customer?.phone || customer.segment === 'subscriber') continue

      const phone = String(customer.phone).replace(/[\s+\-()]/g, '')
      const chatId = phone + '@c.us'
      const firstName = (customer.name || '').split(' ')[0] || 'kak'

      // Check if we already sent a re-engagement (look in conversations)
      const { data: convo } = await supabase
        .from('whatsapp_conversations')
        .select('messages')
        .eq('chat_id', chatId)
        .single()

      if (convo?.messages) {
        const msgs = Array.isArray(convo.messages) ? convo.messages : []
        const alreadySent = msgs.some((m: any) => m.context === 're-engagement-30d')
        if (alreadySent) continue
      }

      // Send re-engagement message
      const message = `Hai ${firstName}! Udah sebulan nih dari terakhir cuci mobil. Mau dijadwalin lagi? Mobilnya pasti udah kangen bersih hehe`

      try {
        await sendText(chatId, message)
        sent++

        // Store in conversation with marker
        if (convo) {
          const msgs = Array.isArray(convo.messages) ? convo.messages : []
          msgs.push({
            role: 'assistant',
            content: message,
            timestamp: new Date().toISOString(),
            context: 're-engagement-30d',
          })
          await supabase
            .from('whatsapp_conversations')
            .update({ messages: msgs.slice(-30), last_message_at: new Date().toISOString() })
            .eq('chat_id', chatId)
        } else {
          await supabase.from('whatsapp_conversations').insert({
            chat_id: chatId,
            phone,
            messages: [{
              role: 'assistant',
              content: message,
              timestamp: new Date().toISOString(),
              context: 're-engagement-30d',
            }],
          })
        }
      } catch (err) {
        console.error(`[re-engage] Failed to send to ${chatId}:`, err)
      }
    }

    return NextResponse.json({ ok: true, sent, checked: customerIds.length })
  } catch (err: any) {
    console.error('[re-engage] Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
