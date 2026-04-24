import { NextRequest, NextResponse } from 'next/server'
import {
  getBookingLinkByToken,
  updateFormData,
  submitBookingLink,
} from '@/lib/booking-links'
import { getSupabaseAdmin } from '@/lib/supabase'

// ─── GET — Load form data for a booking link token ──────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params
  const link = await getBookingLinkByToken(token)

  if (!link) {
    return NextResponse.json({ ok: false, error: 'Link tidak ditemukan' }, { status: 404 })
  }

  // If there's a customer_id, enrich form_data with customer info
  let customerData: Record<string, unknown> = {}
  if (link.customer_id) {
    const supabase = getSupabaseAdmin()
    const { data: customer } = await supabase
      .from('customers')
      .select('name, phone, car_model, plate_number, address')
      .eq('id', link.customer_id)
      .single()

    if (customer) {
      customerData = {
        name: customer.name !== 'WhatsApp User' && customer.name !== 'Unknown' ? customer.name : '',
        phone: customer.phone || link.phone,
        car_model: customer.car_model || '',
        plate_number: customer.plate_number || '',
        address: customer.address || '',
      }
    }
  }

  // Merge: customer data as base, form_data overrides (user's own edits take priority)
  const formData = { ...customerData, phone: link.phone, ...(link.form_data as Record<string, unknown>) }
  // Ensure phone is always present from the link
  if (!formData.phone) formData.phone = link.phone

  return NextResponse.json({
    ok: true,
    token: link.token,
    status: link.status,
    formData,
    submittedAt: link.submitted_at,
  })
}

// ─── PATCH — Auto-save partial form data ────────────────────────────

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params

  try {
    const body = await req.json()
    await updateFormData(token, body)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'Gagal menyimpan' }, { status: 500 })
  }
}

// ─── POST — Submit completed booking form ───────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params

  try {
    const body = await req.json()
    const result = await submitBookingLink(token, body)

    if (!result.ok) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json({
      ok: true,
      booking_ids: result.bookingIds,
      message: result.bookingIds.length > 1
        ? 'Booking detailing + cuci berhasil dibuat!'
        : 'Booking berhasil dibuat!',
    })
  } catch (err: any) {
    console.error('[book-token-api] Error:', err)
    return NextResponse.json({ ok: false, error: 'Terjadi kesalahan, coba lagi' }, { status: 500 })
  }
}
