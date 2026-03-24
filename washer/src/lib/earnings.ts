import { createBrowserClient } from '@supabase/ssr'
import { SERVICE_TYPES } from './constants'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const BONUS_RATES: Record<string, number> = {
  standard_wash: 20000,
  professional: 35000,
  elite_wash: 50000,
  interior_detail: 50000,
  exterior_detail: 50000,
  window_detail: 30000,
  tire_rims: 15000,
  full_detail: 150000,
}

const BASE_SALARY = 6600000
const QUALITY_BONUS = 500000
const ATTENDANCE_BONUS = 300000
const QUALITY_MIN_AVG_RATING = 4.8

export interface ServiceBreakdownItem {
  type: string
  label: string
  count: number
  bonus: number
}

export interface MonthlyEarnings {
  baseSalary: number
  serviceBreakdown: ServiceBreakdownItem[]
  totalServiceBonus: number
  qualityBonus: number
  qualityQualified: boolean
  avgRating: number | null
  complaintCount: number
  attendanceBonus: number
  totalComp: number
}

export async function getMonthlyEarnings(
  washerId: string,
  year: number,
  month: number
): Promise<MonthlyEarnings> {
  // month is 1-indexed (1=Jan, 12=Dec)
  const startDate = new Date(year, month - 1, 1).toISOString()
  const endDate = new Date(year, month, 1).toISOString()

  // Fetch completed jobs for this washer in the given month, join bookings for service_type
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('id, rating, bookings(service_type)')
    .eq('washer_id', washerId)
    .gte('completed_at', startDate)
    .lt('completed_at', endDate)

  if (error) {
    console.error('Error fetching jobs for earnings:', error)
  }

  const jobList = jobs || []

  // Count jobs by service type
  const serviceCounts: Record<string, number> = {}
  let totalRating = 0
  let ratedCount = 0
  let complaintCount = 0

  for (const job of jobList) {
    // bookings is a joined object; handle both array and single object from supabase
    const booking = Array.isArray(job.bookings) ? job.bookings[0] : job.bookings
    const serviceType = booking?.service_type || 'standard_wash'

    serviceCounts[serviceType] = (serviceCounts[serviceType] || 0) + 1

    if (job.rating != null) {
      totalRating += job.rating
      ratedCount++
      if (job.rating <= 2) {
        complaintCount++
      }
    }
  }

  // Build service breakdown
  const serviceBreakdown: ServiceBreakdownItem[] = Object.entries(serviceCounts).map(
    ([type, count]) => ({
      type,
      label: SERVICE_TYPES[type]?.label || type,
      count,
      bonus: (BONUS_RATES[type] || 0) * count,
    })
  )

  const totalServiceBonus = serviceBreakdown.reduce((sum, item) => sum + item.bonus, 0)

  const avgRating = ratedCount > 0 ? totalRating / ratedCount : null

  // Quality bonus: 0 ratings <= 2 AND avg rating >= 4.8
  const qualityQualified =
    complaintCount === 0 && avgRating !== null && avgRating >= QUALITY_MIN_AVG_RATING
  const qualityBonus = qualityQualified ? QUALITY_BONUS : 0

  // Attendance bonus: always true unless manually noted (no data to check, default true)
  const attendanceBonus = ATTENDANCE_BONUS

  const totalComp = BASE_SALARY + totalServiceBonus + qualityBonus + attendanceBonus

  return {
    baseSalary: BASE_SALARY,
    serviceBreakdown,
    totalServiceBonus,
    qualityBonus,
    qualityQualified,
    avgRating: avgRating !== null ? Math.round(avgRating * 100) / 100 : null,
    complaintCount,
    attendanceBonus,
    totalComp,
  }
}
