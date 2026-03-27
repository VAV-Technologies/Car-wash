import { supabase } from '@/lib/supabase'
import type { Job, PaginatedResponse } from './types'

// ─── Types ──────────────────────────────────────────────────────────

export interface JobWithDetails extends Job {
  booking?: {
    id: string
    service_type: string
    scheduled_date: string
    customer?: { name: string; phone: string; car_model: string | null } | null
  } | null
  washer?: { name: string } | null
}

export interface JobQueryParams {
  page: number
  limit: number
  washer_id: string
  date_from: string
  date_to: string
}

export interface JobStats {
  avgRating: number
  totalJobs: number
  avgDuration: number
  upsellRate: number
  upsellConversion: number
}

// ─── List Jobs (paginated) ──────────────────────────────────────────

export async function getJobs(
  params: Partial<JobQueryParams> = {}
): Promise<PaginatedResponse<JobWithDetails>> {
  const {
    page = 1,
    limit = 25,
    washer_id = '',
    date_from = '',
    date_to = '',
  } = params

  let query = supabase
    .from('jobs')
    .select(
      '*, booking:bookings(id, service_type, scheduled_date, customer:customers(name, phone, car_model)), washer:employees(name)',
      { count: 'exact' }
    )

  if (washer_id) query = query.eq('employee_id', washer_id)
  if (date_from) query = query.gte('created_at', date_from)
  if (date_to) query = query.lte('created_at', date_to + 'T23:59:59')

  query = query.order('created_at', { ascending: false })

  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch jobs: ${error.message}`)
  }

  return {
    data: (data ?? []) as JobWithDetails[],
    count: count ?? 0,
  }
}

// ─── Get Single Job ─────────────────────────────────────────────────

export async function getJobById(id: string): Promise<JobWithDetails | null> {
  const { data, error } = await supabase
    .from('jobs')
    .select(
      '*, booking:bookings(id, service_type, scheduled_date, customer:customers(name, phone, car_model)), washer:employees(name)'
    )
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch job: ${error.message}`)
  }

  return data as JobWithDetails
}

// ─── Job Stats (current month) ──────────────────────────────────────

export async function getJobStats(): Promise<JobStats> {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('*')
    .not('completed_at', 'is', null)
    .gte('completed_at', monthStart)
    .lte('completed_at', monthEnd)

  if (error) {
    throw new Error(`Failed to fetch job stats: ${error.message}`)
  }

  const completedJobs = jobs ?? []
  const totalJobs = completedJobs.length

  if (totalJobs === 0) {
    return { avgRating: 0, totalJobs: 0, avgDuration: 0, upsellRate: 0, upsellConversion: 0 }
  }

  // Calculate average duration in minutes
  let totalDuration = 0
  let durationCount = 0
  for (const job of completedJobs) {
    if (job.started_at && job.completed_at) {
      const start = new Date(job.started_at).getTime()
      const end = new Date(job.completed_at).getTime()
      const durationMin = (end - start) / (1000 * 60)
      if (durationMin > 0 && durationMin < 600) {
        totalDuration += durationMin
        durationCount++
      }
    }
  }
  const avgDuration = durationCount > 0 ? Math.round(totalDuration / durationCount) : 0

  // For rating, upsell: these fields may not exist on the base Job type but could be in the DB.
  // We compute from the raw data returned by supabase.
  type RawJob = Record<string, unknown>
  const rawJobs = completedJobs as unknown as RawJob[]

  const ratings = rawJobs.filter((j) => typeof j.customer_rating === 'number' && (j.customer_rating as number) > 0)
  const avgRating =
    ratings.length > 0
      ? Math.round((ratings.reduce((sum, j) => sum + (j.customer_rating as number), 0) / ratings.length) * 10) / 10
      : 0

  const upsellAttempted = rawJobs.filter((j) => j.upsell_attempted === true)
  const upsellAccepted = rawJobs.filter((j) => j.upsell_converted === true)
  const upsellRate = totalJobs > 0 ? Math.round((upsellAttempted.length / totalJobs) * 100) : 0
  const upsellConversion =
    upsellAttempted.length > 0
      ? Math.round((upsellAccepted.length / upsellAttempted.length) * 100)
      : 0

  return { avgRating, totalJobs, avgDuration, upsellRate, upsellConversion }
}

// ─── Recent Jobs ────────────────────────────────────────────────────

export async function getRecentJobs(limit = 10): Promise<JobWithDetails[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select(
      '*, booking:bookings(id, service_type, scheduled_date, customer:customers(name, phone, car_model)), washer:employees(name)'
    )
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to fetch recent jobs: ${error.message}`)
  }

  return (data ?? []) as JobWithDetails[]
}
