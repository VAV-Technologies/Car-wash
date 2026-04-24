import { NextRequest, NextResponse } from 'next/server'
import { resetBookingLink } from '@/lib/booking-links'

// Reset a submitted booking link back to 'active' so the customer can
// book another car using the same link. Pre-fills name/phone/car/etc
// from the customer record so they don't re-type everything.
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params
  const result = await resetBookingLink(token)
  if (!result.ok) {
    return NextResponse.json(result, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}
