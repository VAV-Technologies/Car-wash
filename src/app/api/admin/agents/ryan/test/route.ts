import { NextRequest, NextResponse } from 'next/server'
import { dryRunReply } from '@/lib/agents/plusvibe'

// Dry-run Ryan against an inbound email body. NO email is sent, NO Telegram
// is pinged, NO email_leads row is mutated. Used by the Test tab on the
// /admin/agents/plusvibe page so the team can preview replies before
// shipping prompt or rule changes.

export async function POST(req: NextRequest) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 })
  }

  const inboundText = typeof body?.inboundText === 'string' ? body.inboundText.trim() : ''
  if (!inboundText) {
    return NextResponse.json({ error: 'inboundText is required' }, { status: 400 })
  }

  const firstName = typeof body?.firstName === 'string' ? body.firstName : undefined
  const companyName = typeof body?.companyName === 'string' ? body.companyName : undefined
  const jobTitle = typeof body?.jobTitle === 'string' ? body.jobTitle : undefined
  const replyCount = typeof body?.replyCount === 'number' ? body.replyCount : undefined
  const objectionsRaised = Array.isArray(body?.objectionsRaised) ? body.objectionsRaised : undefined
  const classificationHistory = Array.isArray(body?.classificationHistory) ? body.classificationHistory : undefined

  try {
    const result = await dryRunReply({
      inboundText,
      firstName,
      companyName,
      jobTitle,
      replyCount,
      objectionsRaised,
      classificationHistory,
    })
    return NextResponse.json(result)
  } catch (err: any) {
    console.error('[ryan/test] failed:', err)
    return NextResponse.json(
      { error: err?.message || String(err) },
      { status: 500 },
    )
  }
}
