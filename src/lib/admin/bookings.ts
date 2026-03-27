import { supabase } from '@/lib/supabase'
import type { Booking, BookingStatus, ServiceType, PaginatedResponse } from './types'

// ─── Types ──────────────────────────────────────────────────────────

export interface BookingWithDetails extends Booking {
  customer?: { name: string; phone: string; car_model: string | null; plate_number: string | null } | null
  washer?: { name: string } | null
}

export interface BookingQueryParams {
  page: number
  limit: number
  status: BookingStatus | ''
  service_type: ServiceType | ''
  date_from: string
  date_to: string
  washer_id: string
}

// ─── List Bookings (paginated) ──────────────────────────────────────

export async function getBookings(
  params: Partial<BookingQueryParams> = {}
): Promise<PaginatedResponse<BookingWithDetails>> {
  const {
    page = 1,
    limit = 25,
    status = '',
    service_type = '',
    date_from = '',
    date_to = '',
    washer_id = '',
  } = params

  let query = supabase
    .from('bookings')
    .select('*, customer:customers(name, phone, car_model, plate_number), washer:employees(name)', { count: 'exact' })

  if (status) query = query.eq('status', status)
  if (service_type) query = query.eq('service_type', service_type)
  if (date_from) query = query.gte('scheduled_date', date_from)
  if (date_to) query = query.lte('scheduled_date', date_to)
  if (washer_id) query = query.eq('employee_id', washer_id)

  query = query.order('scheduled_date', { ascending: false }).order('scheduled_time', { ascending: false })

  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch bookings: ${error.message}`)
  }

  return {
    data: (data ?? []) as BookingWithDetails[],
    count: count ?? 0,
  }
}

// ─── Get Single Booking ─────────────────────────────────────────────

export async function getBookingById(id: string): Promise<BookingWithDetails | null> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, customer:customers(name, phone, car_model, plate_number), washer:employees(name)')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch booking: ${error.message}`)
  }

  return data as BookingWithDetails
}

// ─── Create Booking ─────────────────────────────────────────────────

export async function createBooking(
  data: Omit<Booking, 'id' | 'created_at' | 'updated_at'>
): Promise<Booking> {
  const { data: created, error } = await supabase
    .from('bookings')
    .insert(data)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create booking: ${error.message}`)
  }

  return created as Booking
}

// ─── Update Booking ─────────────────────────────────────────────────

export async function updateBooking(
  id: string,
  data: Partial<Omit<Booking, 'id' | 'created_at' | 'updated_at'>>
): Promise<Booking> {
  const { data: updated, error } = await supabase
    .from('bookings')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update booking: ${error.message}`)
  }

  return updated as Booking
}

// ─── Delete Booking ─────────────────────────────────────────────────

export async function deleteBooking(id: string): Promise<void> {
  const { error } = await supabase.from('bookings').delete().eq('id', id)
  if (error) throw new Error(`Failed to delete booking: ${error.message}`)
}

// ─── Today's Bookings ───────────────────────────────────────────────

export async function getTodaysBookings(): Promise<BookingWithDetails[]> {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('bookings')
    .select('*, customer:customers(name, phone, car_model, plate_number), washer:employees(name)')
    .eq('scheduled_date', today)
    .order('scheduled_time', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch today's bookings: ${error.message}`)
  }

  return (data ?? []) as BookingWithDetails[]
}

// ─── Booking Queue (pending bookings) ───────────────────────────────

export async function getBookingQueue(): Promise<BookingWithDetails[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, customer:customers(name, phone, car_model, plate_number), washer:employees(name)')
    .eq('status', 'pending')
    .order('scheduled_date', { ascending: true })
    .order('scheduled_time', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch booking queue: ${error.message}`)
  }

  return (data ?? []) as BookingWithDetails[]
}

// ─── Bookings by Date ───────────────────────────────────────────────

export async function getBookingsByDate(date: string): Promise<BookingWithDetails[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, customer:customers(name, phone, car_model, plate_number), washer:employees(name)')
    .eq('scheduled_date', date)
    .order('scheduled_time', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch bookings for date: ${error.message}`)
  }

  return (data ?? []) as BookingWithDetails[]
}

// ─── Get Employees (washers) ────────────────────────────────────────

export async function getWashers(): Promise<{ id: string; name: string }[]> {
  const { data, error } = await supabase
    .from('employees')
    .select('id, name')
    .eq('role', 'washer')
    .eq('status', 'active')
    .order('name')

  if (error) {
    throw new Error(`Failed to fetch washers: ${error.message}`)
  }

  return (data ?? []) as { id: string; name: string }[]
}

// ─── Search Customers ───────────────────────────────────────────────

export async function searchCustomers(
  query: string
): Promise<{ id: string; name: string; phone: string; car_model: string | null; plate_number: string | null }[]> {
  if (!query.trim()) return []

  const { data, error } = await supabase
    .from('customers')
    .select('id, name, phone, car_model, plate_number')
    .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
    .limit(10)

  if (error) {
    throw new Error(`Failed to search customers: ${error.message}`)
  }

  return (data ?? []) as { id: string; name: string; phone: string; car_model: string | null; plate_number: string | null }[]
}
