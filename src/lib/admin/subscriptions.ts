import { supabase } from '@/lib/supabase'
import type {
  SubscriptionWithCustomer,
  SubscriptionStats,
  ChurnRiskSubscription,
  PaginatedResponse,
  SubscriptionTier,
} from './types'
import { SUBSCRIPTION_TIERS_V2 } from './constants'

// ─── Query Params ─────────────────────────────────────────────────────

export interface SubscriptionQueryParams {
  page: number
  limit: number
  status?: 'active' | 'paused' | 'cancelled' | 'expired' | ''
  tier?: SubscriptionTier | ''
}

// ─── Get Subscriptions (paginated, with customer info) ────────────────

export async function getSubscriptions(
  params: Partial<SubscriptionQueryParams> = {}
): Promise<PaginatedResponse<SubscriptionWithCustomer>> {
  const { page = 1, limit = 25, status = '', tier = '' } = params

  let query = supabase
    .from('subscriptions')
    .select(
      `
      *,
      customers!inner (name, phone)
    `,
      { count: 'exact' }
    )

  if (status) {
    query = query.eq('status', status)
  }
  if (tier) {
    query = query.eq('tier', tier)
  }

  query = query.order('created_at', { ascending: false })

  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch subscriptions: ${error.message}`)
  }

  const mapped = (data ?? []).map((row: Record<string, unknown>) => {
    const customer = row.customers as { name: string; phone: string } | null
    const tierConfig = SUBSCRIPTION_TIERS_V2.find((t) => t.value === row.tier)
    return {
      ...row,
      customer_name: customer?.name ?? 'Unknown',
      customer_phone: customer?.phone ?? '',
      washes_allocated: tierConfig?.washesPerMonth ?? 0,
      washes_used_this_month: (row.washes_used_this_month as number) ?? 0,
      monthly_price: tierConfig?.price ?? 0,
      renewal_date: (row.renewal_date as string) ?? (row.end_date as string),
      status: (row.status as string) ?? (row.is_active ? 'active' : 'expired'),
      last_service_date: (row.last_service_date as string) ?? null,
      customers: undefined,
    } as SubscriptionWithCustomer
  })

  return {
    data: mapped,
    count: count ?? 0,
  }
}

// ─── Get Single Subscription ──────────────────────────────────────────

export async function getSubscriptionById(
  id: string
): Promise<SubscriptionWithCustomer | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select(
      `
      *,
      customers!inner (name, phone)
    `
    )
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch subscription: ${error.message}`)
  }

  const customer = (data as Record<string, unknown>).customers as { name: string; phone: string } | null
  const tierConfig = SUBSCRIPTION_TIERS_V2.find((t) => t.value === data.tier)

  return {
    ...data,
    customer_name: customer?.name ?? 'Unknown',
    customer_phone: customer?.phone ?? '',
    washes_allocated: tierConfig?.washesPerMonth ?? 0,
    washes_used_this_month: (data as Record<string, unknown>).washes_used_this_month as number ?? 0,
    monthly_price: tierConfig?.price ?? 0,
    renewal_date: data.renewal_date ?? data.end_date,
    status: data.status ?? (data.is_active ? 'active' : 'expired'),
    last_service_date: (data as Record<string, unknown>).last_service_date ?? null,
    customers: undefined,
  } as SubscriptionWithCustomer
}

// ─── Create Subscription ──────────────────────────────────────────────

export async function createSubscription(data: {
  customer_id: string
  tier: SubscriptionTier
  start_date: string
  end_date: string
  payment_method?: string
  notes?: string
}) {
  const tierConfig = SUBSCRIPTION_TIERS_V2.find((t) => t.value === data.tier)

  const { data: created, error } = await supabase
    .from('subscriptions')
    .insert({
      customer_id: data.customer_id,
      tier: data.tier,
      start_date: data.start_date,
      end_date: data.end_date,
      is_active: true,
      status: 'active',
      washes_remaining: tierConfig?.washesPerMonth ?? 0,
      renewal_date: data.end_date,
      monthly_price: tierConfig?.price ?? 0,
      payment_method: data.payment_method ?? null,
      notes: data.notes ?? null,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create subscription: ${error.message}`)
  }

  return created
}

// ─── Update Subscription ──────────────────────────────────────────────

export async function updateSubscription(
  id: string,
  data: Record<string, unknown>
) {
  const { data: updated, error } = await supabase
    .from('subscriptions')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update subscription: ${error.message}`)
  }

  return updated
}

// ─── Active Subscription Stats ────────────────────────────────────────

export async function getActiveSubscriptionStats(): Promise<SubscriptionStats> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('tier')
    .or('status.eq.active,and(is_active.eq.true,status.is.null)')

  if (error) {
    throw new Error(`Failed to fetch subscription stats: ${error.message}`)
  }

  const items = data ?? []
  const byTier = { essentials: 0, plus: 0, elite: 0 }
  let totalMRR = 0

  for (const sub of items) {
    const tier = sub.tier as string
    if (tier in byTier) {
      byTier[tier as keyof typeof byTier]++
    }
    const config = SUBSCRIPTION_TIERS_V2.find((t) => t.value === tier)
    totalMRR += config?.price ?? 0
  }

  return {
    totalActive: items.length,
    byTier,
    totalMRR,
  }
}

// ─── Churn Risk Subscriptions ─────────────────────────────────────────

export async function getChurnRiskSubscriptions(): Promise<ChurnRiskSubscription[]> {
  // Fetch active subscriptions with customer info
  const { data, error } = await supabase
    .from('subscriptions')
    .select(
      `
      *,
      customers!inner (name, phone)
    `
    )
    .or('status.eq.active,and(is_active.eq.true,status.is.null)')

  if (error) {
    throw new Error(`Failed to fetch churn risk: ${error.message}`)
  }

  const now = Date.now()
  const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000
  const risks: ChurnRiskSubscription[] = []

  for (const row of data ?? []) {
    const record = row as Record<string, unknown>
    const customer = record.customers as { name: string; phone: string } | null
    const tierConfig = SUBSCRIPTION_TIERS_V2.find((t) => t.value === record.tier)
    const lastService = record.last_service_date as string | null
    const washesUsed = (record.washes_used_this_month as number) ?? 0
    const washesAllocated = tierConfig?.washesPerMonth ?? 0

    const reasons: string[] = []

    // No booking in 14+ days
    if (lastService) {
      const daysSince = now - new Date(lastService).getTime()
      if (daysSince > fourteenDaysMs) {
        reasons.push('No booking in 14+ days')
      }
    } else {
      reasons.push('No service recorded')
    }

    // Low usage: < 50% of allocated washes
    if (washesAllocated > 0 && washesUsed < washesAllocated * 0.5) {
      reasons.push(`Low usage (${washesUsed}/${washesAllocated} washes)`)
    }

    if (reasons.length > 0) {
      risks.push({
        ...row,
        customer_name: customer?.name ?? 'Unknown',
        customer_phone: customer?.phone ?? '',
        washes_allocated: washesAllocated,
        washes_used_this_month: washesUsed,
        monthly_price: tierConfig?.price ?? 0,
        renewal_date: (record.renewal_date as string) ?? (record.end_date as string),
        status: 'active',
        last_service_date: lastService,
        risk_reason: reasons.join('; '),
        customers: undefined,
      } as ChurnRiskSubscription)
    }
  }

  return risks
}

// ─── Upcoming Renewals ────────────────────────────────────────────────

export async function getUpcomingRenewals(
  days: number = 7
): Promise<SubscriptionWithCustomer[]> {
  const now = new Date()
  const futureDate = new Date(now)
  futureDate.setDate(futureDate.getDate() + days)

  const { data, error } = await supabase
    .from('subscriptions')
    .select(
      `
      *,
      customers!inner (name, phone)
    `
    )
    .or('status.eq.active,and(is_active.eq.true,status.is.null)')
    .or(`renewal_date.lte.${futureDate.toISOString().split('T')[0]},end_date.lte.${futureDate.toISOString().split('T')[0]}`)
    .order('renewal_date', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch upcoming renewals: ${error.message}`)
  }

  return (data ?? []).map((row: Record<string, unknown>) => {
    const customer = row.customers as { name: string; phone: string } | null
    const tierConfig = SUBSCRIPTION_TIERS_V2.find((t) => t.value === row.tier)
    return {
      ...row,
      customer_name: customer?.name ?? 'Unknown',
      customer_phone: customer?.phone ?? '',
      washes_allocated: tierConfig?.washesPerMonth ?? 0,
      washes_used_this_month: (row.washes_used_this_month as number) ?? 0,
      monthly_price: tierConfig?.price ?? 0,
      renewal_date: (row.renewal_date as string) ?? (row.end_date as string),
      status: (row.status as string) ?? 'active',
      last_service_date: (row.last_service_date as string) ?? null,
      customers: undefined,
    } as SubscriptionWithCustomer
  })
}
