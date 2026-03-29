import { NextResponse } from 'next/server'
import { trackRankings } from '@/lib/agents/dimas/tracker'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  // Verify cron request (Vercel sends this header)
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await trackRankings()
    return NextResponse.json({ ok: true, ...result })
  } catch (err: any) {
    console.error('[dimas-track] Error:', err)
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
