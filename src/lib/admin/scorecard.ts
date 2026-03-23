import { supabase } from '@/lib/supabase'
import { getTargetsForMonth } from './dashboard'

// ─── Types ──────────────────────────────────────────────────────────

export type ScorecardStatus = 'green' | 'yellow' | 'red'

export interface ScorecardData {
  monthNum: number
  monthLabel: string
  targets: {
    worst: { services: number; revenue: number }
    base: { services: number; revenue: number }
    best: { services: number; revenue: number }
  }
  actuals: {
    services: number
    revenue: number
    subscriptions: number
    avgRevPerService: number
    capacityUtil: number
  }
  status: {
    services: ScorecardStatus
    revenue: ScorecardStatus
    avgRevPerService: ScorecardStatus
    capacityUtil: ScorecardStatus
  }
}

// Month 1 = March 2026
function getMonthDates(monthNum: number): { startDate: string; endDate: string } {
  // month 1 => March 2026 (index 2)
  const baseYear = 2026
  const baseMonthIndex = 2 // March = index 2
  const totalMonths = baseMonthIndex + (monthNum - 1)
  const year = baseYear + Math.floor(totalMonths / 12)
  const month = (totalMonths % 12) + 1

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endMonth = month === 12 ? 1 : month + 1
  const endYear = month === 12 ? year + 1 : year
  const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`

  return { startDate, endDate }
}

export function getMonthLabel(monthNum: number): string {
  const baseYear = 2026
  const baseMonthIndex = 2
  const totalMonths = baseMonthIndex + (monthNum - 1)
  const year = baseYear + Math.floor(totalMonths / 12)
  const monthIndex = totalMonths % 12
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${monthNames[monthIndex]} ${year}`
}

function computeStatus(actual: number, worst: number, base: number): ScorecardStatus {
  if (actual >= base) return 'green'
  if (actual >= worst) return 'yellow'
  return 'red'
}

// ─── Get Scorecard Data ─────────────────────────────────────────────

export async function getScorecardData(monthNum: number): Promise<ScorecardData> {
  const { startDate, endDate } = getMonthDates(monthNum)
  const targets = getTargetsForMonth(monthNum)

  // Services count (completed jobs)
  const { count: servicesCount } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')
    .gte('completed_at', startDate)
    .lt('completed_at', endDate)

  const services = servicesCount ?? 0

  // Revenue (confirmed)
  const { data: revenueRows } = await supabase
    .from('transactions')
    .select('amount')
    .eq('type', 'revenue')
    .eq('payment_status', 'confirmed')
    .gte('created_at', startDate)
    .lt('created_at', endDate)

  const revenue = (revenueRows ?? []).reduce(
    (sum: number, r: { amount: number }) => sum + r.amount,
    0
  )

  // Active subscriptions (at that time — approximate with current)
  const { count: subsCount } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  const subscriptions = subsCount ?? 0
  const avgRevPerService = services > 0 ? Math.round(revenue / services) : 0
  const capacityUtil = Math.round((services / 65) * 100)

  // Compute avg rev targets from revenue/services targets
  const worstAvg = targets.worst.services > 0 ? Math.round(targets.worst.revenue / targets.worst.services) : 0
  const baseAvg = targets.base.services > 0 ? Math.round(targets.base.revenue / targets.base.services) : 0

  // Capacity utilization targets (based on services / 65)
  const worstCapacity = Math.round((targets.worst.services / 65) * 100)
  const baseCapacity = Math.round((targets.base.services / 65) * 100)

  return {
    monthNum,
    monthLabel: getMonthLabel(monthNum),
    targets: {
      worst: targets.worst,
      base: targets.base,
      best: targets.best,
    },
    actuals: {
      services,
      revenue,
      subscriptions,
      avgRevPerService,
      capacityUtil,
    },
    status: {
      services: computeStatus(services, targets.worst.services, targets.base.services),
      revenue: computeStatus(revenue, targets.worst.revenue, targets.base.revenue),
      avgRevPerService: computeStatus(avgRevPerService, worstAvg, baseAvg),
      capacityUtil: computeStatus(capacityUtil, worstCapacity, baseCapacity),
    },
  }
}

// ─── Get All Scorecards ─────────────────────────────────────────────

export async function getAllScorecards(): Promise<ScorecardData[]> {
  const now = new Date()
  const launchYear = 2026
  const launchMonth = 3
  const currentMonthNum =
    (now.getFullYear() - launchYear) * 12 + (now.getMonth() + 1 - launchMonth) + 1
  const maxMonth = Math.max(1, currentMonthNum)

  const results: ScorecardData[] = []
  for (let m = 1; m <= maxMonth; m++) {
    results.push(await getScorecardData(m))
  }

  return results
}
