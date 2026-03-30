import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendText, sendImage } from '@/lib/agents/waha'

export const dynamic = 'force-dynamic'

/**
 * Finds repeat customers (2+ completed bookings, not subscribers)
 * whose last wash was 30+ days ago, and sends a subscription upsell.
 * Runs daily via Vercel cron.
 */
export async function GET(req: Request) {
  // Verify cron request (Vercel sends this header)
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const fortyDaysAgo = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Get all completed bookings in the 30-40 day window
    const { data: oldBookings } = await supabase
      .from('bookings')
      .select('customer_id')
      .eq('status', 'completed')
      .lte('scheduled_date', thirtyDaysAgo)
      .gte('scheduled_date', fortyDaysAgo)

    if (!oldBookings || oldBookings.length === 0) {
      return NextResponse.json({ ok: true, sent: 0, message: 'No customers to upsell' })
    }

    const customerIds = [...new Set(oldBookings.map(b => b.customer_id))]
    let sent = 0

    for (const customerId of customerIds) {
      // Must have 2+ completed bookings total
      const { count } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', customerId)
        .eq('status', 'completed')

      if (!count || count < 2) continue

      // Skip if they have upcoming bookings
      const { count: upcoming } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', customerId)
        .in('status', ['confirmed', 'en_route', 'in_progress'])

      if (upcoming && upcoming > 0) continue

      // Get customer info, skip subscribers
      const { data: customer } = await supabase
        .from('customers')
        .select('name, phone, segment')
        .eq('id', customerId)
        .single()

      if (!customer?.phone || customer.segment === 'subscriber' || customer.segment === 'vip') continue

      const phone = String(customer.phone).replace(/[\s+\-()]/g, '')
      const chatId = phone + '@c.us'
      const firstName = (customer.name || '').split(' ')[0] || 'kak'

      // Check if upsell already sent
      const { data: convo } = await supabase
        .from('whatsapp_conversations')
        .select('messages')
        .eq('chat_id', chatId)
        .single()

      if (convo?.messages) {
        const msgs = Array.isArray(convo.messages) ? convo.messages : []
        if (msgs.some((m: any) => m.context === 'subscription-upsell')) continue
      }

      const message = `Hai ${firstName}! Karena udah beberapa kali cuci sama Castudio, mau ga coba paket langganan? Jadi lebih hemat lho. Cek ini ya:`

      try {
        await sendText(chatId, message)

        // Send subscription images with savings captions
        const SUB_CAPTIONS: Record<string, string> = {
          sub_essentials: 'Langganan Essentials - Rp 339.000/bulan (Hemat Rp 1.057.000)',
          sub_plus: 'Langganan Plus - Rp 449.000/bulan (Hemat Rp 2.147.000)',
          sub_elite: 'Langganan Elite - Rp 1.000.000/bulan (Hemat Rp 3.494.000)',
        }

        const { data: subImages } = await supabase
          .from('agent_knowledge')
          .select('file_name, content')
          .eq('agent_name', 'shera')
          .in('file_name', ['service_image_sub_essentials', 'service_image_sub_plus', 'service_image_sub_elite'])

        if (subImages && subImages.length > 0) {
          for (const img of subImages) {
            const key = img.file_name.replace('service_image_', '')
            const caption = SUB_CAPTIONS[key] || key
            try {
              await sendImage(chatId, img.content, caption)
              await new Promise(r => setTimeout(r, 1000))
            } catch {}
          }
        }

        sent++

        const msgs = convo?.messages && Array.isArray(convo.messages) ? convo.messages : []
        msgs.push({
          role: 'assistant',
          content: message,
          timestamp: new Date().toISOString(),
          context: 'subscription-upsell',
        })

        if (convo) {
          await supabase
            .from('whatsapp_conversations')
            .update({ messages: msgs.slice(-30), last_message_at: new Date().toISOString() })
            .eq('chat_id', chatId)
        } else {
          await supabase.from('whatsapp_conversations').insert({
            chat_id: chatId,
            phone,
            messages: msgs,
          })
        }
      } catch (err) {
        console.error(`[upsell] Failed to send to ${chatId}:`, err)
      }
    }

    return NextResponse.json({ ok: true, sent, checked: customerIds.length })
  } catch (err: any) {
    console.error('[upsell] Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
