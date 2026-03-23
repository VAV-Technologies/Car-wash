import { supabase } from '@/lib/supabase'
import type {
  CustomerWithStats,
  Customer,
  Conversation,
  CustomerQueryParams,
  PaginatedResponse,
} from './types'

// ─── List Customers (with stats from view) ──────────────────────────

export async function getCustomers(
  params: Partial<CustomerQueryParams> = {}
): Promise<PaginatedResponse<CustomerWithStats>> {
  const {
    page = 1,
    limit = 25,
    search = '',
    neighborhood = '',
    segment = '',
    acquisition_source = '',
    sort_by = 'created_at',
    sort_dir = 'desc',
  } = params

  let query = supabase
    .from('customer_stats')
    .select('*', { count: 'exact' })

  // Filters
  if (search) {
    query = query.or(
      `name.ilike.%${search}%,phone.ilike.%${search}%,plate_number.ilike.%${search}%,email.ilike.%${search}%`
    )
  }
  if (neighborhood) {
    query = query.eq('neighborhood', neighborhood)
  }
  if (segment) {
    query = query.eq('segment', segment)
  }
  if (acquisition_source) {
    query = query.eq('acquisition_source', acquisition_source)
  }

  // Sorting
  query = query.order(sort_by, { ascending: sort_dir === 'asc' })

  // Pagination
  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch customers: ${error.message}`)
  }

  return {
    data: (data ?? []) as CustomerWithStats[],
    count: count ?? 0,
  }
}

// ─── Get Single Customer ────────────────────────────────────────────

export async function getCustomerById(
  id: string
): Promise<CustomerWithStats | null> {
  const { data, error } = await supabase
    .from('customer_stats')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // not found
    throw new Error(`Failed to fetch customer: ${error.message}`)
  }

  return data as CustomerWithStats
}

// ─── Create Customer ────────────────────────────────────────────────

export async function createCustomer(
  data: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'segment'>
): Promise<Customer> {
  const { data: created, error } = await supabase
    .from('customers')
    .insert(data)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create customer: ${error.message}`)
  }

  return created as Customer
}

// ─── Update Customer ────────────────────────────────────────────────

export async function updateCustomer(
  id: string,
  data: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>
): Promise<Customer> {
  const { data: updated, error } = await supabase
    .from('customers')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update customer: ${error.message}`)
  }

  return updated as Customer
}

// ─── Customer Conversations ─────────────────────────────────────────

export async function getCustomerConversations(
  customerId: string
): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    throw new Error(`Failed to fetch conversations: ${error.message}`)
  }

  return (data ?? []) as Conversation[]
}

export async function addConversation(
  data: Omit<Conversation, 'id' | 'created_at'>
): Promise<Conversation> {
  const { data: created, error } = await supabase
    .from('conversations')
    .insert(data)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to add conversation: ${error.message}`)
  }

  return created as Conversation
}

// ─── Delete Customer ────────────────────────────────────────────────

export async function deleteCustomer(id: string): Promise<void> {
  // Delete related conversations first
  await supabase.from('conversations').delete().eq('customer_id', id)
  const { error } = await supabase.from('customers').delete().eq('id', id)
  if (error) throw new Error(`Failed to delete customer: ${error.message}`)
}

// ─── Follow-Up Queries ──────────────────────────────────────────────

export async function getFollowUpCustomers(): Promise<{
  followUp24hr: CustomerWithStats[]
  reEngagement14d: CustomerWithStats[]
  churnRisk30d: CustomerWithStats[]
  winBack60d: CustomerWithStats[]
}> {
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const d14 = new Date(now)
  d14.setDate(d14.getDate() - 14)
  const d14Str = d14.toISOString().split('T')[0]

  const d30 = new Date(now)
  d30.setDate(d30.getDate() - 30)
  const d30Str = d30.toISOString().split('T')[0]

  const d60 = new Date(now)
  d60.setDate(d60.getDate() - 60)
  const d60Str = d60.toISOString().split('T')[0]

  // 24hr follow-up: completed job yesterday
  const { data: followUp24hr } = await supabase
    .from('customer_stats')
    .select('*')
    .eq('last_service_date', yesterdayStr)
    .order('name')

  // 14-day re-engagement: last service 14+ days ago, not subscriber
  const { data: reEngagement14d } = await supabase
    .from('customer_stats')
    .select('*')
    .lte('last_service_date', d14Str)
    .gt('last_service_date', d30Str)
    .neq('segment', 'subscriber')
    .order('last_service_date', { ascending: true })

  // 30-day churn risk
  const { data: churnRisk30d } = await supabase
    .from('customer_stats')
    .select('*')
    .lte('last_service_date', d30Str)
    .gt('last_service_date', d60Str)
    .order('last_service_date', { ascending: true })

  // 60-day win-back: 60+ days, had 2+ services
  const { data: winBack60d } = await supabase
    .from('customer_stats')
    .select('*')
    .lte('last_service_date', d60Str)
    .gte('total_services', 2)
    .order('last_service_date', { ascending: true })

  return {
    followUp24hr: (followUp24hr ?? []) as CustomerWithStats[],
    reEngagement14d: (reEngagement14d ?? []) as CustomerWithStats[],
    churnRisk30d: (churnRisk30d ?? []) as CustomerWithStats[],
    winBack60d: (winBack60d ?? []) as CustomerWithStats[],
  }
}
