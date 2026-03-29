import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendText } from '@/lib/agents/waha'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()

  try {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()

    // Find conversations where last message was 2-6 hours ago
    const { data: convos } = await supabase
      .from('whatsapp_conversations')
      .select('chat_id, phone, messages, last_message_at')
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

      const firstName = msgs.find((m: any) => m.role === 'assistant' && m.content?.includes('Hai '))?.content?.match(/Hai (\w+)/)?.[1] || 'kak'

      const nudges = [
        `Hai ${firstName}! Ga ada rush ya, kalau nanti mau lanjut tinggal chat aja`,
        `${firstName}, kalau ada pertanyaan lagi nanti kabarin aja ya. Aku standby kok`,
        `No worries ${firstName}, kapan aja mau lanjut aku disini ya`,
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
