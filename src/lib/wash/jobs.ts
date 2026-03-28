import { supabase } from '@/lib/supabase'

// ── helpers ────────────────────────────────────────────────
function todayRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()
  return { start, end }
}

function tomorrowRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 8).toISOString() // next 7 days
  return { start, end }
}

const BOOKING_SELECT = `
  *,
  customers (
    id, name, phone, car_model, plate_number, neighborhood, segment, address
  )
`

// ── queries ────────────────────────────────────────────────

/** Today's active bookings (confirmed / en_route / in_progress) */
export async function getTodaysBookings(washerId: string) {
  const { start, end } = todayRange()
  const { data, error } = await supabase
    .from('bookings')
    .select(BOOKING_SELECT)
    .eq('washer_id', washerId)
    .in('status', ['confirmed', 'en_route', 'in_progress'])
    .gte('scheduled_date', start)
    .lt('scheduled_date', end)
    .order('scheduled_time', { ascending: true })

  if (error) throw error
  return data ?? []
}

/** Upcoming bookings (tomorrow+), confirmed only */
export async function getUpcomingBookings(washerId: string) {
  const { start, end } = tomorrowRange()
  const { data, error } = await supabase
    .from('bookings')
    .select(BOOKING_SELECT)
    .eq('washer_id', washerId)
    .in('status', ['confirmed'])
    .gte('scheduled_date', start)
    .lt('scheduled_date', end)
    .order('scheduled_date', { ascending: true })
    .order('scheduled_time', { ascending: true })

  if (error) throw error
  return data ?? []
}

/** Completed bookings today */
export async function getCompletedToday(washerId: string) {
  const { start, end } = todayRange()
  const { data, error } = await supabase
    .from('bookings')
    .select(BOOKING_SELECT)
    .eq('washer_id', washerId)
    .eq('status', 'completed')
    .gte('scheduled_date', start)
    .lt('scheduled_date', end)
    .order('scheduled_time', { ascending: true })

  if (error) throw error
  return data ?? []
}

/** Update booking status (forward transitions only) */
export async function updateBookingStatus(
  bookingId: string,
  status: 'en_route' | 'in_progress' | 'completed'
) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .select()
    .single()

  if (error) throw error
  return data
}

/** Create a job record when washer starts a booking */
export async function createJobRecord(data: {
  booking_id: string
  washer_id: string
  started_at: string
  service_type?: string
}) {
  const { data: job, error } = await supabase
    .from('jobs')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return job
}

/** Update job record (completion, notes, upsell, rating, feedback, etc.) */
export async function updateJobRecord(
  jobId: string,
  data: {
    completed_at?: string
    actual_duration_min?: number
    washer_notes?: string
    upsell_attempted?: boolean
    upsell_converted?: boolean
    customer_rating?: number
    customer_feedback?: string
  }
) {
  const { data: job, error } = await supabase
    .from('jobs')
    .update(data)
    .eq('id', jobId)
    .select()
    .single()

  if (error) throw error
  return job
}

/** Get the current in-progress job with booking + customer details */
export async function getActiveJob(washerId: string) {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      bookings (
        *,
        customers (
          id, name, phone, car_model, plate_number, neighborhood, segment
        )
      )
    `)
    .eq('washer_id', washerId)
    .is('completed_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

/** Get a specific job by ID with full details */
export async function getJobById(jobId: string) {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      bookings (
        *,
        customers (
          id, name, phone, car_model, plate_number, neighborhood, segment
        )
      ),
      job_photos (*)
    `)
    .eq('id', jobId)
    .single()

  if (error) throw error
  return data
}

/** Get job by booking ID */
export async function getJobByBookingId(bookingId: string) {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      bookings (
        *,
        customers (
          id, name, phone, car_model, plate_number, neighborhood, segment
        )
      ),
      job_photos (*)
    `)
    .eq('booking_id', bookingId)
    .maybeSingle()

  if (error) throw error
  return data
}
