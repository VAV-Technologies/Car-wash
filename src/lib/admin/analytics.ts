import { supabase } from '@/lib/supabase'

// ─── Service Mix Trend ──────────────────────────────────────────────

export interface ServiceMixMonth {
  month: number
  year: number
  standard_wash: number
  premium_wash: number
  interior_detail: number
  exterior_detail: number
  full_detail: number
  ceramic_coating: number
  paint_correction: number
  engine_bay: number
  subscription_wash: number
  total: number
}

const SERVICE_KEYS = [
  'standard_wash',
  'premium_wash',
  'interior_detail',
  'exterior_detail',
  'full_detail',
  'ceramic_coating',
  'paint_correction',
  'engine_bay',
  'subscription_wash',
] as const

export async function getServiceMixTrend(months: number): Promise<ServiceMixMonth[]> {
  const results: ServiceMixMonth[] = []
  const now = new Date()

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const year = d.getFullYear()
    const month = d.getMonth() + 1
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endMonth = month === 12 ? 1 : month + 1
    const endYear = month === 12 ? year + 1 : year
    const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`

    const { data } = await supabase
      .from('jobs')
      .select('service_type')
      .eq('status', 'completed')
      .gte('completed_at', startDate)
      .lt('completed_at', endDate)

    const counts: Record<string, number> = {}
    for (const key of SERVICE_KEYS) counts[key] = 0
    let total = 0
    for (const row of data ?? []) {
      const st = row.service_type as string
      if (st in counts) counts[st]++
      total++
    }

    results.push({
      month,
      year,
      standard_wash: counts.standard_wash,
      premium_wash: counts.premium_wash,
      interior_detail: counts.interior_detail,
      exterior_detail: counts.exterior_detail,
      full_detail: counts.full_detail,
      ceramic_coating: counts.ceramic_coating,
      paint_correction: counts.paint_correction,
      engine_bay: counts.engine_bay,
      subscription_wash: counts.subscription_wash,
      total,
    })
  }

  return results
}

// ─── Customer Acquisition Curve ─────────────────────────────────────

export interface AcquisitionMonth {
  month: number
  year: number
  newCustomers: number
}

export async function getCustomerAcquisitionCurve(months: number): Promise<AcquisitionMonth[]> {
  const results: AcquisitionMonth[] = []
  const now = new Date()

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const year = d.getFullYear()
    const month = d.getMonth() + 1
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endMonth = month === 12 ? 1 : month + 1
    const endYear = month === 12 ? year + 1 : year
    const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`

    const { count } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate)
      .lt('created_at', endDate)

    results.push({ month, year, newCustomers: count ?? 0 })
  }

  return results
}

// ─── Retention Cohorts ──────────────────────────────────────────────

export interface RetentionCohort {
  cohortMonth: number
  cohortYear: number
  acquired: number
  returned_month1: number
  returned_month2: number
  returned_month3: number
  pct_month1: number
  pct_month2: number
  pct_month3: number
}

export async function getRetentionCohorts(): Promise<RetentionCohort[]> {
  const results: RetentionCohort[] = []
  const now = new Date()

  // Go back up to 6 months for cohort analysis
  for (let i = 6; i >= 1; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const cohortYear = d.getFullYear()
    const cohortMonth = d.getMonth() + 1
    const cohortStart = `${cohortYear}-${String(cohortMonth).padStart(2, '0')}-01`
    const nextM = cohortMonth === 12 ? 1 : cohortMonth + 1
    const nextY = cohortMonth === 12 ? cohortYear + 1 : cohortYear
    const cohortEnd = `${nextY}-${String(nextM).padStart(2, '0')}-01`

    // Get customers acquired this month
    const { data: cohortCustomers } = await supabase
      .from('customers')
      .select('id')
      .gte('created_at', cohortStart)
      .lt('created_at', cohortEnd)

    const acquired = cohortCustomers?.length ?? 0
    if (acquired === 0) {
      results.push({
        cohortMonth, cohortYear, acquired: 0,
        returned_month1: 0, returned_month2: 0, returned_month3: 0,
        pct_month1: 0, pct_month2: 0, pct_month3: 0,
      })
      continue
    }

    const customerIds = cohortCustomers!.map((c) => c.id)

    // Check returns for months 1, 2, 3 after cohort month
    const returned = [0, 0, 0]
    for (let m = 1; m <= 3; m++) {
      const mDate = new Date(cohortYear, cohortMonth - 1 + m, 1)
      const mYear = mDate.getFullYear()
      const mMonth = mDate.getMonth() + 1
      if (mDate > now) break

      const mStart = `${mYear}-${String(mMonth).padStart(2, '0')}-01`
      const mNextM = mMonth === 12 ? 1 : mMonth + 1
      const mNextY = mMonth === 12 ? mYear + 1 : mYear
      const mEnd = `${mNextY}-${String(mNextM).padStart(2, '0')}-01`

      const { data: returnedJobs } = await supabase
        .from('jobs')
        .select('customer_id')
        .in('customer_id', customerIds)
        .eq('status', 'completed')
        .gte('completed_at', mStart)
        .lt('completed_at', mEnd)

      const uniqueReturned = new Set((returnedJobs ?? []).map((j) => j.customer_id))
      returned[m - 1] = uniqueReturned.size
    }

    results.push({
      cohortMonth,
      cohortYear,
      acquired,
      returned_month1: returned[0],
      returned_month2: returned[1],
      returned_month3: returned[2],
      pct_month1: acquired > 0 ? Math.round((returned[0] / acquired) * 100) : 0,
      pct_month2: acquired > 0 ? Math.round((returned[1] / acquired) * 100) : 0,
      pct_month3: acquired > 0 ? Math.round((returned[2] / acquired) * 100) : 0,
    })
  }

  return results
}

// ─── Revenue Concentration ──────────────────────────────────────────

export interface RevenueConcentrationData {
  topCustomers: { name: string; phone: string; totalSpent: number }[]
  top10Pct: number
}

export async function getRevenueConcentration(): Promise<RevenueConcentrationData> {
  // Get all confirmed revenue transactions with customer info
  const { data } = await supabase
    .from('transactions')
    .select('customer_id, amount, customers!left(name, phone)')
    .eq('type', 'revenue')
    .eq('payment_status', 'confirmed')

  if (!data || data.length === 0) {
    return { topCustomers: [], top10Pct: 0 }
  }

  // Group by customer
  const byCustomer: Record<string, { name: string; phone: string; total: number }> = {}
  let totalRevenue = 0

  for (const row of data) {
    const cust = row.customers as unknown as { name: string; phone: string } | null
    const cid = row.customer_id as string
    if (!cid) continue
    totalRevenue += row.amount
    if (!byCustomer[cid]) {
      byCustomer[cid] = {
        name: cust?.name ?? 'Unknown',
        phone: cust?.phone ?? '',
        total: 0,
      }
    }
    byCustomer[cid].total += row.amount
  }

  // Sort by total descending, take top 10
  const sorted = Object.values(byCustomer).sort((a, b) => b.total - a.total)
  const top10 = sorted.slice(0, 10)
  const top10Total = top10.reduce((s, c) => s + c.total, 0)

  return {
    topCustomers: top10.map((c) => ({
      name: c.name,
      phone: c.phone,
      totalSpent: c.total,
    })),
    top10Pct: totalRevenue > 0 ? Math.round((top10Total / totalRevenue) * 100) : 0,
  }
}

// ─── Seasonal Patterns ──────────────────────────────────────────────

export interface SeasonalData {
  byDayOfWeek: { day: number; count: number }[]
  byHour: { hour: number; count: number }[]
}

export async function getSeasonalPatterns(): Promise<SeasonalData> {
  const { data } = await supabase
    .from('bookings')
    .select('scheduled_date, scheduled_time')
    .in('status', ['confirmed', 'completed', 'in_progress'])

  const dayCounts = Array.from({ length: 7 }, (_, i) => ({ day: i, count: 0 }))
  const hourCounts = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }))

  for (const row of data ?? []) {
    if (row.scheduled_date) {
      const dayOfWeek = new Date(row.scheduled_date).getDay()
      dayCounts[dayOfWeek].count++
    }
    if (row.scheduled_time) {
      const hour = parseInt(row.scheduled_time.split(':')[0], 10)
      if (hour >= 0 && hour < 24) {
        hourCounts[hour].count++
      }
    }
  }

  return {
    byDayOfWeek: dayCounts,
    byHour: hourCounts,
  }
}

// ─── Upsell Effectiveness ───────────────────────────────────────────

export interface UpsellData {
  overall: { attempted: number; converted: number; rate: number }
  byService: { service_type: string; attempted: number; converted: number; rate: number }[]
}

export async function getUpsellEffectiveness(): Promise<UpsellData> {
  const { data } = await supabase
    .from('jobs')
    .select('service_type, upsell_attempted, upsell_converted')
    .eq('status', 'completed')

  let totalAttempted = 0
  let totalConverted = 0
  const byService: Record<string, { attempted: number; converted: number }> = {}

  for (const row of data ?? []) {
    const st = row.service_type as string
    if (!byService[st]) byService[st] = { attempted: 0, converted: 0 }

    if (row.upsell_attempted) {
      totalAttempted++
      byService[st].attempted++
    }
    if (row.upsell_converted) {
      totalConverted++
      byService[st].converted++
    }
  }

  return {
    overall: {
      attempted: totalAttempted,
      converted: totalConverted,
      rate: totalAttempted > 0 ? Math.round((totalConverted / totalAttempted) * 100) : 0,
    },
    byService: Object.entries(byService)
      .map(([service_type, stats]) => ({
        service_type,
        attempted: stats.attempted,
        converted: stats.converted,
        rate: stats.attempted > 0 ? Math.round((stats.converted / stats.attempted) * 100) : 0,
      }))
      .sort((a, b) => b.attempted - a.attempted),
  }
}
