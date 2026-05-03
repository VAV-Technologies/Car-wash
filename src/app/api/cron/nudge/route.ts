// Disabled while a human handler runs outreach manually. Re-enable when Shera
// is brought back online and we have a non-token signal for "form not yet
// submitted" worth nudging on.
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ ok: true, disabled: true })
}
