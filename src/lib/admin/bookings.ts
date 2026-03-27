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
  if (washer_id) query = query.eq('washer_id', washer_id)

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

// ─── Neighborhood Proximity Clusters ──────────────────────────────

const NEIGHBORHOOD_CLUSTERS: Record<string, string[]> = {
  A: ['pondok_indah', 'kebayoran_baru', 'kebayoran_lama', 'senayan', 'permata_hijau', 'simprug'],
  B: ['cilandak', 'tb_simatupang', 'fatmawati', 'gandaria'],
  C: ['kemang', 'cipete'],
  D: ['pesanggrahan', 'bintaro'],
}

// Adjacent clusters for fallback routing
const ADJACENT_CLUSTERS: Record<string, string[]> = {
  A: ['B', 'C'],
  B: ['A', 'C', 'D'],
  C: ['A', 'B'],
  D: ['B'],
}

const SERVICE_DURATIONS: Record<string, number> = {
  standard_wash: 90, professional: 180, elite_wash: 240,
  interior_detail: 240, exterior_detail: 300, window_detail: 120,
  tire_rims: 90, full_detail: 480,
}

function getCluster(neighborhood: string): string | null {
  for (const [cluster, areas] of Object.entries(NEIGHBORHOOD_CLUSTERS)) {
    if (areas.includes(neighborhood)) return cluster
  }
  return null
}

function getAdjacentNeighborhoods(neighborhood: string): string[] {
  const cluster = getCluster(neighborhood)
  if (!cluster) return []
  const adjacent = ADJACENT_CLUSTERS[cluster] || []
  return adjacent.flatMap(c => NEIGHBORHOOD_CLUSTERS[c] || [])
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + (m || 0)
}

/** Auto-assign the best washer for a booking based on neighborhood proximity and availability */
export async function autoAssignWasher(
  neighborhood: string,
  scheduledDate: string,
  scheduledTime: string,
  serviceType: string
): Promise<string | null> {
  const duration = SERVICE_DURATIONS[serviceType] || 90
  const requestedStart = timeToMinutes(scheduledTime)
  const requestedEnd = requestedStart + duration

  // 1. Get all active washers
  const { data: washers } = await supabase
    .from('employees')
    .select('id, name, service_areas')
    .eq('role', 'washer')
    .eq('status', 'active')

  if (!washers || washers.length === 0) return null

  // 2. Get all bookings for this date
  const { data: dayBookings } = await supabase
    .from('bookings')
    .select('washer_id, scheduled_time, service_type')
    .eq('scheduled_date', scheduledDate)
    .not('status', 'in', '(cancelled,no_show)')

  const bookingsOnDay = dayBookings || []

  // 3. Score each washer
  type ScoredWasher = { id: string; score: number }
  const scored: ScoredWasher[] = []

  for (const washer of washers) {
    const areas: string[] = (washer as Record<string, unknown>).service_areas as string[] || []

    // Check for time conflicts
    const washerBookings = bookingsOnDay.filter(b => b.washer_id === washer.id)
    let hasConflict = false
    for (const existing of washerBookings) {
      const existStart = timeToMinutes(existing.scheduled_time)
      const existEnd = existStart + (SERVICE_DURATIONS[existing.service_type] || 90)
      if (requestedStart < existEnd && requestedEnd > existStart) {
        hasConflict = true
        break
      }
    }
    if (hasConflict) continue

    // Score: exact neighborhood match = 100, adjacent = 50, any = 10, no coverage = 5
    let locationScore = 5
    if (areas.includes(neighborhood)) {
      locationScore = 100
    } else {
      const adjacent = getAdjacentNeighborhoods(neighborhood)
      if (areas.some(a => adjacent.includes(a))) {
        locationScore = 50
      } else if (areas.length > 0) {
        locationScore = 10
      }
    }

    // Load balance: fewer bookings = higher score (max 30 points)
    const loadScore = Math.max(0, 30 - washerBookings.length * 5)

    scored.push({ id: washer.id, score: locationScore + loadScore })
  }

  if (scored.length === 0) return null

  // Pick highest score
  scored.sort((a, b) => b.score - a.score)
  return scored[0].id
}

// ─── Create Booking ─────────────────────────────────────────────────

export async function createBooking(
  data: Omit<Booking, 'id' | 'created_at' | 'updated_at'>
): Promise<Booking> {
  // Auto-assign washer if not provided
  if (!data.washer_id) {
    try {
      // Look up customer's neighborhood
      const { data: customer } = await supabase
        .from('customers')
        .select('neighborhood')
        .eq('id', data.customer_id)
        .single()

      if (customer?.neighborhood) {
        const washerId = await autoAssignWasher(
          customer.neighborhood,
          data.scheduled_date,
          data.scheduled_time,
          data.service_type
        )
        if (washerId) {
          data = { ...data, washer_id: washerId }
        }
      }
    } catch {
      // Auto-assign failed — proceed without washer
    }
  }

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
