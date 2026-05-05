import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { createBooking } from '@/lib/admin/bookings'
import { SERVICE_TYPES } from '@/lib/admin/constants'
import type { ServiceType } from '@/lib/admin/types'
import { AREAS } from '@/lib/booking-form-constants'

const VALID_SERVICES = SERVICE_TYPES.map(s => s.value)
const VALID_AREAS = AREAS as readonly string[]
const DETAILING_SERVICES: ServiceType[] = ['interior_detail', 'exterior_detail', 'window_detail', 'tire_rims', 'full_detail']

function cleanPhone(phone: string): string {
  let p = phone.replace(/[\s\-+()]/g, '')
  if (p.startsWith('08')) p = '62' + p.slice(1)
  if (p.startsWith('8') && p.length >= 10) p = '62' + p
  return p
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/
const PHONE_RE = /^[\d+\-()\s]+$/
const isStr = (v: unknown): v is string => typeof v === 'string'

export async function POST(req: NextRequest) {
  try {
    let body: any
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ ok: false, error: 'Body tidak valid (JSON parse error)' }, { status: 400 })
    }
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ ok: false, error: 'Body harus berupa object JSON' }, { status: 400 })
    }
    const { name, phone, service_type, car_model, plate_number, area, address, date, time, add_wash } = body

    // ── Server-side validation ────────────────────────────────────
    const errors: Record<string, string> = {}
    if (!isStr(name) || name.trim().length < 2) errors.name = 'Nama wajib diisi (min 2 karakter)'
    if (!isStr(phone) || phone.trim().length < 8) errors.phone = 'Nomor HP wajib diisi'
    else if (phone.length > 20) errors.phone = 'Nomor HP terlalu panjang'
    else if (!PHONE_RE.test(phone)) errors.phone = 'Nomor HP hanya boleh berisi angka'
    if (!isStr(service_type) || !VALID_SERVICES.includes(service_type)) errors.service_type = 'Pilih layanan'
    if (!isStr(car_model) || car_model.trim().length < 2) errors.car_model = 'Model mobil wajib diisi'
    if (!isStr(plate_number) || plate_number.trim().length < 3) errors.plate_number = 'Plat nomor wajib diisi'
    if (area !== undefined && area !== null && area !== '' && (!isStr(area) || !VALID_AREAS.includes(area))) errors.area = 'Pilih area dari daftar'
    if (!isStr(address) || address.trim().length < 5) errors.address = 'Alamat wajib diisi (min 5 karakter)'
    if (!isStr(date) || !DATE_RE.test(date)) errors.date = 'Pilih tanggal'
    if (!isStr(time) || !TIME_RE.test(time)) errors.time = 'Pilih jam'

    // Validate date is parseable, not Monday, not in the past
    if (!errors.date) {
      const d = new Date(date + 'T00:00:00+07:00')
      if (isNaN(d.getTime())) errors.date = 'Tanggal tidak valid'
      else if (d.getDay() === 1) errors.date = 'Senin libur, pilih hari lain'
      else {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        if (d < today) errors.date = 'Tidak bisa booking tanggal yang sudah lewat'
      }
    }

    // Validate time is within business hours (10:00-17:00 — last slot starts 17:00)
    if (!errors.time) {
      const hour = parseInt(time.split(':')[0], 10)
      if (hour < 10 || hour > 17) errors.time = 'Jam kerja 10:00-18:00'
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ ok: false, errors }, { status: 400 })
    }

    // ── Create or update customer ────────────────────────────────
    const supabase = getSupabaseAdmin()
    const cleanedPhone = cleanPhone(phone)

    let { data: customer } = await supabase
      .from('customers')
      .select('id')
      .or(`phone.ilike.%${cleanedPhone}%`)
      .limit(1)
      .single()

    if (customer) {
      await supabase
        .from('customers')
        .update({
          name: name.trim(),
          car_model: car_model.trim(),
          plate_number: plate_number.trim().toUpperCase(),
          address: address.trim(),
          ...(area ? { area } : {}),
        } as any)
        .eq('id', customer.id)
    } else {
      const { data: newCustomer, error } = await supabase
        .from('customers')
        .insert({
          name: name.trim(),
          phone: cleanedPhone,
          car_model: car_model.trim(),
          plate_number: plate_number.trim().toUpperCase(),
          address: address.trim(),
          ...(area ? { area } : {}),
          segment: 'new',
          acquisition_source: 'website',
        } as any)
        .select('id')
        .single()

      if (error) {
        return NextResponse.json({ ok: false, error: 'Gagal membuat data customer' }, { status: 500 })
      }
      customer = newCustomer
    }

    // ── Backfill WhatsApp conversation → customer link ───────────
    // If this person had chatted before submitting the form, the chat row
    // exists with chat_id like "6281234567890@c.us" but customer_id is null.
    // Phone-match populates the link so admin sees chat + booking together.
    try {
      await supabase
        .from('whatsapp_conversations')
        .update({ customer_id: customer!.id } as any)
        .ilike('chat_id', `%${cleanedPhone}%`)
        .is('customer_id', null)
    } catch {
      // Non-blocking: booking creation is the priority.
    }

    // ── Create booking(s) ────────────────────────────────────────
    const bookingIds: string[] = []

    // Main booking
    const booking = await createBooking({
      customer_id: customer!.id,
      service_type: service_type as ServiceType,
      scheduled_date: date,
      scheduled_time: time,
      location_address: address.trim(),
      status: 'confirmed',
      notes: `${car_model.trim()} - ${plate_number.trim().toUpperCase()}`,
    } as any)
    bookingIds.push(booking.id)

    // If detailing + add wash → create second booking for Standard Wash
    if (add_wash && DETAILING_SERVICES.includes(service_type as ServiceType)) {
      const washBooking = await createBooking({
        customer_id: customer!.id,
        service_type: 'standard_wash' as ServiceType,
        scheduled_date: date,
        scheduled_time: time,
        location_address: address.trim(),
        status: 'confirmed',
        notes: `Wash prereq for detailing - ${car_model.trim()} - ${plate_number.trim().toUpperCase()}`,
      } as any)
      bookingIds.push(washBooking.id)
    }

    return NextResponse.json({
      ok: true,
      booking_ids: bookingIds,
      message: bookingIds.length > 1
        ? 'Booking detailing + cuci berhasil dibuat!'
        : 'Booking berhasil dibuat!',
    })
  } catch (err: any) {
    console.error('[book-api] Error:', err)
    return NextResponse.json({ ok: false, error: 'Terjadi kesalahan, coba lagi' }, { status: 500 })
  }
}
