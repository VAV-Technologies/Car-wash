import { supabase } from '@/lib/supabase'

// ─── Scenario Targets ────────────────────────────────────────────────

// Business launched March 2026 = month 1
const SCENARIO_TARGETS = [
  { month: 1, worst: { services: 15, revenue: 5200000 }, base: { services: 20, revenue: 11230000 }, best: { services: 30, revenue: 16850000 } },
  { month: 2, worst: { services: 22, revenue: 7700000 }, base: { services: 28, revenue: 15730000 }, best: { services: 40, revenue: 22470000 } },
  { month: 3, worst: { services: 30, revenue: 10500000 }, base: { services: 35, revenue: 19670000 }, best: { services: 50, revenue: 28100000 } },
  { month: 4, worst: { services: 38, revenue: 13300000 }, base: { services: 40, revenue: 22470000 }, best: { services: 55, revenue: 30910000 } },
  { month: 5, worst: { services: 44, revenue: 15400000 }, base: { services: 45, revenue: 25280000 }, best: { services: 60, revenue: 33720000 } },
  { month: 6, worst: { services: 50, revenue: 17500000 }, base: { services: 48, revenue: 26960000 }, best: { services: 62, revenue: 34840000 } },
  { month: 7, worst: { services: 55, revenue: 19200000 }, base: { services: 50, revenue: 28100000 }, best: { services: 75, revenue: 42150000 } },
  { month: 8, worst: { services: 57, revenue: 19900000 }, base: { services: 52, revenue: 29220000 }, best: { services: 85, revenue: 47780000 } },
  { month: 9, worst: { services: 60, revenue: 20900000 }, base: { services: 54, revenue: 30350000 }, best: { services: 95, revenue: 53370000 } },
  { month: 10, worst: { services: 63, revenue: 22000000 }, base: { services: 55, revenue: 30910000 }, best: { services: 100, revenue: 56160000 } },
  { month: 11, worst: { services: 65, revenue: 22700000 }, base: { services: 56, revenue: 31470000 }, best: { services: 105, revenue: 58960000 } },
  { month: 12, worst: { services: 65, revenue: 22700000 }, base: { services: 58, revenue: 32600000 }, best: { services: 110, revenue: 61780000 } },
]

// ─── Month Utilities ─────────────────────────────────────────────────

export function getMonthNumber(): number {
  const now = new Date()
  const launchYear = 2026
  const launchMonth = 3 // March
  const monthNum =
    (now.getFullYear() - launchYear) * 12 + (now.getMonth() + 1 - launchMonth) + 1
  return Math.max(1, monthNum)
}

export function getTargetsForMonth(monthNum: number) {
  const clamped = Math.min(Math.max(1, monthNum), SCENARIO_TARGETS.length)
  return SCENARIO_TARGETS[clamped - 1]
}

// ─── Dashboard Stats ─────────────────────────────────────────────────

export interface DashboardStatsData {
  servicesThisMonth: number
  revenueThisMonth: number
  pendingPayments: { count: number; total: number }
  avgRevenuePerService: number
  activeSubscriptions: {
    basic: number
    standard: number
    premium: number
    vip: number
    totalMRR: number
  }
  followUpsDue: number
  cashPosition: {
    balance: number
    burnRate: number
    runwayMonths: number
  }
  capacityUtilization: number
  recentNotifications: {
    id: string
    message: string
    type: string
    created_at: string
  }[]
}

export async function getDashboardStats(): Promise<DashboardStatsData> {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate =
    month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, '0')}-01`

  // Services this month (completed jobs)
  const { count: servicesCount } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')
    .gte('completed_at', startDate)
    .lt('completed_at', endDate)

  const servicesThisMonth = servicesCount ?? 0

  // Revenue this month (confirmed)
  const { data: revenueRows } = await supabase
    .from('transactions')
    .select('amount')
    .eq('type', 'revenue')
    .eq('payment_status', 'confirmed')
    .gte('created_at', startDate)
    .lt('created_at', endDate)

  const revenueThisMonth = (revenueRows ?? []).reduce(
    (sum: number, r: { amount: number }) => sum + r.amount,
    0
  )

  // Pending payments
  const { data: pendingRows } = await supabase
    .from('transactions')
    .select('amount')
    .eq('payment_status', 'pending')

  const pendingPayments = {
    count: (pendingRows ?? []).length,
    total: (pendingRows ?? []).reduce(
      (sum: number, r: { amount: number }) => sum + r.amount,
      0
    ),
  }

  // Average revenue per service
  const avgRevenuePerService =
    servicesThisMonth > 0 ? revenueThisMonth / servicesThisMonth : 0

  // Active subscriptions by tier
  const { data: subRows } = await supabase
    .from('subscriptions')
    .select('tier')
    .eq('is_active', true)

  const tierCounts = { basic: 0, standard: 0, premium: 0, vip: 0 }
  const tierPrices: Record<string, number> = {
    basic: 999000,
    standard: 1499000,
    premium: 2499000,
    vip: 3999000,
  }
  let totalMRR = 0
  for (const sub of subRows ?? []) {
    const tier = sub.tier as keyof typeof tierCounts
    if (tier in tierCounts) {
      tierCounts[tier]++
      totalMRR += tierPrices[tier] ?? 0
    }
  }

  // Follow-ups due (from customer_stats)
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const d14 = new Date(now)
  d14.setDate(d14.getDate() - 14)
  const d30 = new Date(now)
  d30.setDate(d30.getDate() - 30)
  const d60 = new Date(now)
  d60.setDate(d60.getDate() - 60)

  const { count: fu1 } = await supabase
    .from('customer_stats')
    .select('*', { count: 'exact', head: true })
    .eq('last_service_date', yesterday.toISOString().split('T')[0])

  const { count: fu14 } = await supabase
    .from('customer_stats')
    .select('*', { count: 'exact', head: true })
    .lte('last_service_date', d14.toISOString().split('T')[0])
    .gt('last_service_date', d30.toISOString().split('T')[0])

  const { count: fu30 } = await supabase
    .from('customer_stats')
    .select('*', { count: 'exact', head: true })
    .lte('last_service_date', d30.toISOString().split('T')[0])
    .gt('last_service_date', d60.toISOString().split('T')[0])

  const { count: fu60 } = await supabase
    .from('customer_stats')
    .select('*', { count: 'exact', head: true })
    .lte('last_service_date', d60.toISOString().split('T')[0])

  const followUpsDue = (fu1 ?? 0) + (fu14 ?? 0) + (fu30 ?? 0) + (fu60 ?? 0)

  // ─── Cash Position ──────────────────────────────────────────────
  // Cumulative revenue - cumulative expenses (all time)
  const { data: allRevenue } = await supabase
    .from('transactions')
    .select('amount')
    .eq('type', 'revenue')
    .eq('payment_status', 'confirmed')

  const { data: allExpenses } = await supabase
    .from('transactions')
    .select('amount, created_at')
    .eq('type', 'expense')

  const totalRevenue = (allRevenue ?? []).reduce(
    (sum: number, r: { amount: number }) => sum + r.amount,
    0
  )
  const totalExpenses = (allExpenses ?? []).reduce(
    (sum: number, r: { amount: number }) => sum + r.amount,
    0
  )
  const cashBalance = totalRevenue - totalExpenses

  // Burn rate: average monthly expenses over the last 3 months
  const threeMonthsAgo = new Date(now)
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
  const recentExpenses = (allExpenses ?? []).filter(
    (e: { amount: number; created_at: string }) =>
      new Date(e.created_at) >= threeMonthsAgo
  )
  const recentExpenseTotal = recentExpenses.reduce(
    (sum: number, r: { amount: number }) => sum + r.amount,
    0
  )
  const burnRate = recentExpenseTotal / 3
  const runwayMonths = burnRate > 0 ? cashBalance / burnRate : 99

  // ─── Capacity Utilization ───────────────────────────────────────
  const MAX_MONTHLY_CAPACITY = 65
  const capacityUtilization = (servicesThisMonth / MAX_MONTHLY_CAPACITY) * 100

  // ─── Recent Notifications ──────────────────────────────────────
  const { data: notifRows } = await supabase
    .from('notifications')
    .select('id, message, type, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(5)

  const recentNotifications = (notifRows ?? []) as {
    id: string
    message: string
    type: string
    created_at: string
  }[]

  return {
    servicesThisMonth,
    revenueThisMonth,
    pendingPayments,
    avgRevenuePerService,
    activeSubscriptions: { ...tierCounts, totalMRR },
    followUpsDue,
    cashPosition: {
      balance: cashBalance,
      burnRate,
      runwayMonths,
    },
    capacityUtilization,
    recentNotifications,
  }
}
