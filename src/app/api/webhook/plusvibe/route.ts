import { NextRequest, NextResponse } from 'next/server'
import { processEmailReply } from '@/lib/agents/plusvibe'

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()

    // Only handle email replies
    const event = payload.webhook_event || payload.event
    if (event !== 'ALL_EMAIL_REPLIES') {
      return NextResponse.json({ ok: true, skipped: `event: ${event}` })
    }

    // Skip outgoing messages
    if (payload.direction === 'OUT') {
      return NextResponse.json({ ok: true, skipped: 'outgoing' })
    }

    // Skip bounces
    if (event === 'BOUNCED_EMAIL') {
      return NextResponse.json({ ok: true, skipped: 'bounce' })
    }

    // Process the reply
    const result = await processEmailReply(payload)

    return NextResponse.json({ ok: true, ...result })
  } catch (error: any) {
    console.error('[plusvibe-webhook] Error:', error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 200 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok', agent: 'Plusvibe Email Reply Agent' })
}
