import crypto from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase'
import { createBooking } from '@/lib/admin/bookings'
import { REQUIRED_BOOKING_FIELDS, ALL_SERVICES, DETAILING_VALUES, AREAS, BOOKING_LEAD_TIME_DAYS, BOOKING_OPEN_WINDOW_DAYS } from '@/lib/booking-form-constants'
import type { ServiceType } from '@/lib/admin/types'

// ─── Types ──────────────────────────────────────────────────────────

export interface BookingLink {
  id: string
  token: string
  phone: string
  customer_id: string | null
  chat_id: string | null
  form_data: Record<string, unknown>
  status: 'active' | 'submitted' | 'expired'
  booking_id: string | null
  created_at: string
  updated_at: string
  submitted_at: string | null
  last_opened_at: string | null
}

export interface FormCompletionStatus {
  filled: string[]
  missing: string[]
  formData: Record<string, unknown>
  status: string
  token: string | null
}

// ─── Token Generation ───────────────────────────────────────────────

function generateToken(): string {
  return crypto.randomBytes(6).toString('base64url').slice(0, 8)
}

// ─── Core Functions ─────────────────────────────────────────────────

export async function getOrCreateBookingLink(
  phone: string,
  chatId: string,
  customerId?: string | null,
): Promise<{ token: string; isNew: boolean }> {
  const supabase = getSupabaseAdmin()

  // Look for existing link by phone
  const { data: existing } = await supabase
    .from('booking_links')
    .select('token, status, customer_id')
    .eq('phone', phone)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing) {
    // If previously submitted, reset for new booking but keep same token
    if (existing.status === 'submitted') {
      // Pre-fill from customer record if available
      let prefill: Record<string, unknown> = {}
      const cid = customerId || existing.customer_id
      if (cid) {
        const { data: customer } = await supabase
          .from('customers')
          .select('name, phone, car_model, plate_number, address, neighborhood')
          .eq('id', cid)
          .single()
        if (customer) {
          prefill = {
            name: customer.name !== 'WhatsApp User' ? customer.name : '',
            phone: customer.phone || phone,
            car_model: customer.car_model || '',
            plate_number: customer.plate_number || '',
            address: customer.address || '',
            area: (customer as any).neighborhood || '',
          }
        }
      }

      await supabase
        .from('booking_links')
        .update({
          status: 'active',
          form_data: prefill,
          booking_id: null,
          submitted_at: null,
          updated_at: new Date().toISOString(),
          chat_id: chatId,
          ...(customerId ? { customer_id: customerId } : {}),
        })
        .eq('token', existing.token)
    } else {
      // Update chat_id and customer_id if provided
      const updates: Record<string, unknown> = { chat_id: chatId }
      if (customerId) updates.customer_id = customerId
      await supabase.from('booking_links').update(updates).eq('token', existing.token)
    }

    return { token: existing.token, isNew: false }
  }

  // Create new link
  let token = generateToken()
  // Retry once on collision (extremely unlikely)
  const { error } = await supabase.from('booking_links').insert({
    token,
    phone,
    chat_id: chatId,
    customer_id: customerId || null,
    form_data: {},
    status: 'active',
  })

  if (error?.code === '23505') {
    // Unique violation — regenerate
    token = generateToken()
    await supabase.from('booking_links').insert({
      token,
      phone,
      chat_id: chatId,
      customer_id: customerId || null,
      form_data: {},
      status: 'active',
    })
  }

  return { token, isNew: true }
}

export async function getBookingLinkByToken(token: string): Promise<BookingLink | null> {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('booking_links')
    .select('*')
    .eq('token', token)
    .neq('status', 'expired')
    .single()

  if (!data) return null

  // Record that the form was opened
  await supabase
    .from('booking_links')
    .update({ last_opened_at: new Date().toISOString() })
    .eq('token', token)

  return data as BookingLink
}

export async function updateFormData(
  token: string,
  partialData: Record<string, unknown>,
): Promise<void> {
  const supabase = getSupabaseAdmin()

  // Get current form_data and merge
  const { data: link } = await supabase
    .from('booking_links')
    .select('form_data')
    .eq('token', token)
    .single()

  if (!link) return

  const merged = { ...(link.form_data as Record<string, unknown>), ...partialData }

  await supabase
    .from('booking_links')
    .update({ form_data: merged, updated_at: new Date().toISOString() })
    .eq('token', token)
}

export async function getFormCompletionStatus(phone: string): Promise<FormCompletionStatus> {
  const supabase = getSupabaseAdmin()
  const { data: link } = await supabase
    .from('booking_links')
    .select('token, form_data, status')
    .eq('phone', phone)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!link) {
    return { filled: [], missing: [...REQUIRED_BOOKING_FIELDS], formData: {}, status: 'none', token: null }
  }

  const formData = (link.form_data || {}) as Record<string, unknown>
  const filled: string[] = []
  const missing: string[] = []

  for (const field of REQUIRED_BOOKING_FIELDS) {
    const val = formData[field]
    if (val && String(val).trim().length > 0) {
      filled.push(field)
    } else {
      missing.push(field)
    }
  }

  return { filled, missing, formData, status: link.status, token: link.token }
}

// ─── Reset for new booking (multi-car) ──────────────────────────────

export async function resetBookingLink(token: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseAdmin()

  const { data: link } = await supabase
    .from('booking_links')
    .select('token, phone, customer_id, status')
    .eq('token', token)
    .maybeSingle()

  if (!link) return { ok: false, error: 'Link tidak ditemukan' }

  // Only reset submitted links. Active links don't need resetting.
  if ((link as any).status !== 'submitted') {
    return { ok: true }
  }

  // Pre-fill identity/location only (name, phone, address, area).
  // Car model + plate are intentionally cleared so multi-car customers
  // can fill in the next vehicle's details. Service/date/time also
  // reset so each booking picks its own.
  let prefill: Record<string, unknown> = { phone: (link as any).phone }
  const cid = (link as any).customer_id
  if (cid) {
    const { data: customer } = await supabase
      .from('customers')
      .select('name, phone, address, neighborhood')
      .eq('id', cid)
      .single()
    if (customer) {
      // Try to pull area from the last booking_link submission (form_data.area)
      // since customers.neighborhood isn't being written (check-constraint mismatch).
      const { data: lastSubmittedLink } = await supabase
        .from('booking_links')
        .select('form_data')
        .eq('phone', (link as any).phone)
        .eq('status', 'submitted')
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      const lastArea = (lastSubmittedLink as any)?.form_data?.area || (customer as any).neighborhood || ''

      prefill = {
        name: (customer as any).name !== 'WhatsApp User' ? (customer as any).name : '',
        phone: (customer as any).phone || (link as any).phone,
        address: (customer as any).address || '',
        area: lastArea,
      }
    }
  }

  await supabase
    .from('booking_links')
    .update({
      status: 'active',
      form_data: prefill,
      booking_id: null,
      submitted_at: null,
      updated_at: new Date().toISOString(),
    } as any)
    .eq('token', token)

  return { ok: true }
}

// ─── Phone Cleaning (shared with shera.ts / book API) ───────────────

function cleanPhone(phone: string): string {
  let p = phone.replace(/[\s\-+()]/g, '')
  if (p.startsWith('08')) p = '62' + p.slice(1)
  if (p.startsWith('8') && p.length >= 10) p = '62' + p
  return p
}

// ─── Submit Booking ─────────────────────────────────────────────────

const VALID_SERVICES = ALL_SERVICES.map(s => s.value)
const DETAILING_SET = new Set(DETAILING_VALUES)

export async function submitBookingLink(
  token: string,
  formData: Record<string, unknown>,
): Promise<{ ok: true; bookingIds: string[] } | { ok: false; errors: Record<string, string> }> {
  const supabase = getSupabaseAdmin()

  // Get the link
  const { data: link } = await supabase
    .from('booking_links')
    .select('*')
    .eq('token', token)
    .eq('status', 'active')
    .single()

  if (!link) {
    return { ok: false, errors: { _form: 'Link tidak valid atau sudah digunakan' } }
  }

  const { name, phone, service_type, car_model, plate_number, area, address, date, time, add_wash } = formData

  // Validate
  const errors: Record<string, string> = {}
  if (!name || String(name).trim().length < 2) errors.name = 'Nama wajib diisi (min 2 karakter)'
  if (!phone || String(phone).trim().length < 8) errors.phone = 'Nomor HP wajib diisi'
  if (!service_type || !VALID_SERVICES.includes(String(service_type))) errors.service_type = 'Pilih layanan'
  if (!car_model || String(car_model).trim().length < 2) errors.car_model = 'Model mobil wajib diisi'
  if (!plate_number || String(plate_number).trim().length < 3) errors.plate_number = 'Plat nomor wajib diisi'
  if (!area || !(AREAS as readonly string[]).includes(String(area))) errors.area = 'Pilih area'
  if (!address || String(address).trim().length < 5) errors.address = 'Alamat wajib diisi (min 5 karakter)'
  if (!date) errors.date = 'Pilih tanggal'
  if (!time) errors.time = 'Pilih jam'

  if (date) {
    const d = new Date(String(date) + 'T00:00:00+07:00')
    if (d.getDay() === 1) errors.date = 'Senin libur, pilih hari lain'
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (d < today) errors.date = 'Tidak bisa booking tanggal yang sudah lewat'
    // Fixed booking window: must be within [today + lead, today + lead + open)
    const firstBookable = new Date(today)
    firstBookable.setDate(firstBookable.getDate() + BOOKING_LEAD_TIME_DAYS)
    const lastBookableExclusive = new Date(firstBookable)
    lastBookableExclusive.setDate(lastBookableExclusive.getDate() + BOOKING_OPEN_WINDOW_DAYS)
    if (!errors.date && d < firstBookable) {
      errors.date = `Tanggal ini fully booked. Pilih mulai ${firstBookable.toISOString().split('T')[0]} atau setelahnya.`
    }
    if (!errors.date && d >= lastBookableExclusive) {
      const lastBookable = new Date(lastBookableExclusive.getTime() - 86400000)
      errors.date = `Booking hanya dibuka ${BOOKING_OPEN_WINDOW_DAYS} hari. Tanggal terakhir yang bisa dipilih: ${lastBookable.toISOString().split('T')[0]}.`
    }
  }

  if (time) {
    const hour = parseInt(String(time).split(':')[0])
    if (hour < 10 || hour > 17) errors.time = 'Jam kerja 10:00-18:00'
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors }
  }

  // Create or update customer
  const cleanedPhone = cleanPhone(String(phone))
  let { data: customer } = await supabase
    .from('customers')
    .select('id')
    .or(`phone.ilike.%${cleanedPhone}%`)
    .limit(1)
    .single()

  // NOTE: `customers.neighborhood` has a DB check constraint that only accepts
  // Jakarta Selatan sub-neighborhoods (pondok_indah, kemang, etc.), not the
  // city-level Jabodetabek values used by the form Area picker. Area is
  // preserved on booking_links.form_data.area. Until a DB migration relaxes
  // that constraint, we skip writing it to customers.
  if (customer) {
    await supabase
      .from('customers')
      .update({
        name: String(name).trim(),
        car_model: String(car_model).trim(),
        plate_number: String(plate_number).trim().toUpperCase(),
        address: String(address).trim(),
      })
      .eq('id', customer.id)
  } else {
    const { data: newCustomer, error } = await supabase
      .from('customers')
      .insert({
        name: String(name).trim(),
        phone: cleanedPhone,
        car_model: String(car_model).trim(),
        plate_number: String(plate_number).trim().toUpperCase(),
        address: String(address).trim(),
        segment: 'new',
        acquisition_source: 'whatsapp',
      })
      .select('id')
      .single()

    if (error) {
      console.error('[submitBookingLink] Customer insert failed:', error)
      return { ok: false, errors: { _form: 'Gagal membuat data customer' } }
    }
    customer = newCustomer
  }

  // Create booking(s)
  const bookingIds: string[] = []

  const booking = await createBooking({
    customer_id: customer!.id,
    service_type: String(service_type) as ServiceType,
    scheduled_date: String(date),
    scheduled_time: String(time),
    location_address: String(address).trim(),
    status: 'confirmed',
    notes: `${String(car_model).trim()} - ${String(plate_number).trim().toUpperCase()}`,
  } as any)
  bookingIds.push(booking.id)

  // Detailing + wash prereq
  if (add_wash && DETAILING_SET.has(String(service_type))) {
    const washBooking = await createBooking({
      customer_id: customer!.id,
      service_type: 'standard_wash' as ServiceType,
      scheduled_date: String(date),
      scheduled_time: String(time),
      location_address: String(address).trim(),
      status: 'confirmed',
      notes: `Wash prereq for detailing - ${String(car_model).trim()} - ${String(plate_number).trim().toUpperCase()}`,
    } as any)
    bookingIds.push(washBooking.id)
  }

  // Mark link as submitted
  await supabase
    .from('booking_links')
    .update({
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      booking_id: bookingIds[0],
      form_data: formData,
      customer_id: customer!.id,
      updated_at: new Date().toISOString(),
    })
    .eq('token', token)

  return { ok: true, bookingIds }
}
