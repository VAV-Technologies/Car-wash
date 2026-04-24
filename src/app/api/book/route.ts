import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { createBooking } from '@/lib/admin/bookings'
import { SERVICE_TYPES } from '@/lib/admin/constants'
import type { ServiceType } from '@/lib/admin/types'

const VALID_SERVICES = SERVICE_TYPES.map(s => s.value)
const DETAILING_SERVICES: ServiceType[] = ['interior_detail', 'exterior_detail', 'window_detail', 'tire_rims', 'full_detail']

function cleanPhone(phone: string): string {
  let p = phone.replace(/[\s\-+()]/g, '')
  if (p.startsWith('08')) p = '62' + p.slice(1)
  if (p.startsWith('8') && p.length >= 10) p = '62' + p
  return p
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, phone, service_type, car_model, plate_number, address, date, time, add_wash } = body

    // ── Server-side validation ────────────────────────────────────
    const errors: Record<string, string> = {}
    if (!name || name.trim().length < 2) errors.name = 'Nama wajib diisi (min 2 karakter)'
    if (!phone || phone.trim().length < 8) errors.phone = 'Nomor HP wajib diisi'
    if (!service_type || !VALID_SERVICES.includes(service_type)) errors.service_type = 'Pilih layanan'
    if (!car_model || car_model.trim().length < 2) errors.car_model = 'Model mobil wajib diisi'
    if (!plate_number || plate_number.trim().length < 3) errors.plate_number = 'Plat nomor wajib diisi'
    if (!address || address.trim().length < 5) errors.address = 'Alamat wajib diisi (min 5 karakter)'
    if (!date) errors.date = 'Pilih tanggal'
    if (!time) errors.time = 'Pilih jam'

    // Validate date is Mon-Sat and not in the past
    if (date) {
      const d = new Date(date + 'T00:00:00+07:00')
      if (d.getDay() === 0) errors.date = 'Minggu libur, pilih hari lain'
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (d < today) errors.date = 'Tidak bisa booking tanggal yang sudah lewat'
    }

    // Validate time is within business hours
    if (time) {
      const hour = parseInt(time.split(':')[0])
      if (hour < 8 || hour > 16) errors.time = 'Jam kerja 08:00-16:00'
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
        })
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
          segment: 'new',
          acquisition_source: 'form',
        })
        .select('id')
        .single()

      if (error) {
        return NextResponse.json({ ok: false, error: 'Gagal membuat data customer' }, { status: 500 })
      }
      customer = newCustomer
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
