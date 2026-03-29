import { NextResponse } from 'next/server'
import { trackRankings } from '@/lib/agents/dimas/tracker'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const result = await trackRankings()
    return NextResponse.json({ ok: true, ...result })
  } catch (err: any) {
    console.error('[dimas-track] Error:', err)
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
