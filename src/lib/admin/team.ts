import { supabase } from '@/lib/supabase'
import type {
  Employee,
  EmployeeExtended,
  EmployeeStatus,
  PayslipResult,
  EmployeePerformanceStats,
} from './types'

// ─── Per-Service Bonus Rates ────────────────────────────────────────

const SERVICE_BONUS_RATES: Record<string, number> = {
  standard_wash: 20_000,
  professional: 35_000,
  elite_wash: 50_000,
  interior_detail: 50_000,
  exterior_detail: 50_000,
  window_detail: 30_000,
  tire_rims: 15_000,
  full_detail: 150_000,
}

const BASE_SALARY = 6_600_000
const QUALITY_BONUS = 500_000
const ATTENDANCE_BONUS = 300_000

// ─── List Employees ─────────────────────────────────────────────────

export async function getEmployees(
  params?: { status?: EmployeeStatus }
): Promise<EmployeeExtended[]> {
  let query = supabase
    .from('employees')
    .select('*')
    .order('name')

  if (params?.status) {
    query = query.eq('status', params.status)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch employees: ${error.message}`)
  }

  return (data ?? []) as EmployeeExtended[]
}

// ─── Get Single Employee ────────────────────────────────────────────

export async function getEmployeeById(
  id: string
): Promise<EmployeeExtended | null> {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch employee: ${error.message}`)
  }

  return data as EmployeeExtended
}

// ─── Create Employee ────────────────────────────────────────────────

export async function createEmployee(
  data: Omit<EmployeeExtended, 'id' | 'created_at' | 'updated_at'>
): Promise<EmployeeExtended> {
  const { data: created, error } = await supabase
    .from('employees')
    .insert(data)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create employee: ${error.message}`)
  }

  return created as EmployeeExtended
}

// ─── Update Employee ────────────────────────────────────────────────

export async function updateEmployee(
  id: string,
  data: Partial<Omit<EmployeeExtended, 'id' | 'created_at' | 'updated_at'>>
): Promise<EmployeeExtended> {
  const { data: updated, error } = await supabase
    .from('employees')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update employee: ${error.message}`)
  }

  return updated as EmployeeExtended
}

// ─── Employee Stats ─────────────────────────────────────────────────

export async function getEmployeeStats(
  employeeId: string,
  year: number,
  month: number
): Promise<EmployeePerformanceStats> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate =
    month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, '0')}-01`

  // Get completed jobs this month
  const { data: jobs, error: jobsErr } = await supabase
    .from('jobs')
    .select('id, service_type, completed_at')
    .eq('employee_id', employeeId)
    .eq('status', 'completed')
    .gte('completed_at', startDate)
    .lt('completed_at', endDate)

  if (jobsErr) {
    throw new Error(`Failed to fetch jobs: ${jobsErr.message}`)
  }

  const jobCount = jobs?.length ?? 0

  // Get ratings for this employee's completed jobs this month
  const { data: ratings } = await supabase
    .from('ratings')
    .select('score')
    .eq('employee_id', employeeId)
    .gte('created_at', startDate)
    .lt('created_at', endDate)

  const ratingScores = (ratings ?? []).map((r: { score: number }) => r.score)
  const avgRating =
    ratingScores.length > 0
      ? ratingScores.reduce((a: number, b: number) => a + b, 0) / ratingScores.length
      : 0

  // Upsell stats — count bookings where employee had an upsell attempt
  const { data: upsellData } = await supabase
    .from('upsell_attempts')
    .select('id, converted')
    .eq('employee_id', employeeId)
    .gte('created_at', startDate)
    .lt('created_at', endDate)

  const upsellAttempts = upsellData?.length ?? 0
  const upsellConverted = (upsellData ?? []).filter((u: { converted: boolean }) => u.converted).length
  const upsellAttemptRate = jobCount > 0 ? (upsellAttempts / jobCount) * 100 : 0
  const upsellConversionRate =
    upsellAttempts > 0 ? (upsellConverted / upsellAttempts) * 100 : 0

  return {
    jobsThisMonth: jobCount,
    avgRating,
    upsellAttemptRate,
    upsellConversionRate,
  }
}

// ─── Calculate Payslip ──────────────────────────────────────────────

export async function calculatePayslip(
  employeeId: string,
  year: number,
  month: number,
  attendanceBonusEnabled: boolean = true
): Promise<PayslipResult> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate =
    month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, '0')}-01`

  // Get completed jobs this month, joining to bookings for service_type
  const { data: jobs, error: jobsErr } = await supabase
    .from('jobs')
    .select('id, service_type, booking_id')
    .eq('employee_id', employeeId)
    .eq('status', 'completed')
    .gte('completed_at', startDate)
    .lt('completed_at', endDate)

  if (jobsErr) {
    throw new Error(`Failed to fetch jobs: ${jobsErr.message}`)
  }

  const jobList = jobs ?? []

  // Count service types
  const serviceCounts: Record<string, number> = {}
  for (const job of jobList) {
    const type = job.service_type as string
    serviceCounts[type] = (serviceCounts[type] || 0) + 1
  }

  // Build service breakdown
  const serviceBreakdown = Object.entries(serviceCounts).map(([type, count]) => ({
    type,
    count,
    bonus: (SERVICE_BONUS_RATES[type] ?? 0) * count,
  }))

  const totalServiceBonus = serviceBreakdown.reduce((sum, s) => sum + s.bonus, 0)

  // Quality bonus check — get ratings
  const { data: ratings } = await supabase
    .from('ratings')
    .select('score')
    .eq('employee_id', employeeId)
    .gte('created_at', startDate)
    .lt('created_at', endDate)

  const ratingScores = (ratings ?? []).map((r: { score: number }) => r.score)
  const avgRating =
    ratingScores.length > 0
      ? ratingScores.reduce((a: number, b: number) => a + b, 0) / ratingScores.length
      : 0
  const hasComplaints = ratingScores.some((s: number) => s <= 2)
  const qualityBonus = !hasComplaints && avgRating >= 4.8 ? QUALITY_BONUS : 0

  const attendanceBonus = attendanceBonusEnabled ? ATTENDANCE_BONUS : 0

  const totalComp = BASE_SALARY + totalServiceBonus + qualityBonus + attendanceBonus

  return {
    baseSalary: BASE_SALARY,
    serviceBreakdown,
    totalServiceBonus,
    qualityBonus,
    attendanceBonus,
    totalComp,
    jobCount: jobList.length,
    avgRating,
  }
}
