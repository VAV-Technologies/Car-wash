// Global read tools for Johan. The original Shera-inherited reads were all
// customer-scoped (Shera always knows who she's talking to); Johan needs
// system-wide visibility for back-office questions like "any bookings this
// month?", "who's a VIP customer?", "what did we earn last week?".

import type { ChatCompletionTool } from 'openai/resources/chat/completions'
import { getSupabaseAdmin } from '@/lib/supabase'

// ─── Tool specs ──────────────────────────────────────────────────────

export const GLOBAL_READ_TOOL_SPECS: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'list_bookings',
      description:
        'List bookings across all customers, with filters. Use for any global view question: "active bookings this month", "today\'s schedule", "all bookings this week for washer X". Returns up to `limit` rows ordered by scheduled_date desc. Default date range when none given is the current calendar month.',
      parameters: {
        type: 'object',
        properties: {
          date_from: { type: 'string', description: 'Inclusive start date YYYY-MM-DD. Default: first of current month.' },
          date_to: { type: 'string', description: 'Inclusive end date YYYY-MM-DD. Default: last of current month.' },
          status: {
            type: 'string',
            description: 'Filter by status. One of: confirmed, pending, completed, cancelled, no_show. Omit to include all.',
          },
          washer_id: { type: 'string', description: 'Restrict to one washer (employee_id).' },
          customer_id: { type: 'string', description: 'Restrict to one customer.' },
          limit: { type: 'number', description: 'Max rows to return (default 50, hard max 200).' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_customers',
      description:
        'List customers across the whole CRM. Use for "show me VIP customers", "any new customers this week", "customers with email X". Returns up to `limit` rows ordered by created_at desc.',
      parameters: {
        type: 'object',
        properties: {
          segment: {
            type: 'string',
            description: 'Filter by segment: new, regular, vip, churned. Omit for all segments.',
          },
          search: {
            type: 'string',
            description: 'Free-text search across name, phone, and email (case-insensitive partial match).',
          },
          created_since: { type: 'string', description: 'Only customers created on/after this YYYY-MM-DD.' },
          limit: { type: 'number', description: 'Max rows (default 50, hard max 200).' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_subscriptions',
      description:
        'List subscriptions across all customers. Use for "active subs", "subs renewing this week", "anyone on Elite tier". Returns up to `limit` rows ordered by renewal_date asc.',
      parameters: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            description: 'Filter by status: active, paused, cancelled, expired. Omit for all.',
          },
          tier: {
            type: 'string',
            description: 'Filter by tier: essentials, plus, elite. Omit for all.',
          },
          renewing_before: {
            type: 'string',
            description: 'Only subs with renewal_date <= this YYYY-MM-DD.',
          },
          limit: { type: 'number', description: 'Max rows (default 50).' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_transactions',
      description:
        'List financial transactions across all customers. Use for "revenue this week", "refunds this month", "what did customer X pay". Returns rows ordered by created_at desc.',
      parameters: {
        type: 'object',
        properties: {
          date_from: { type: 'string', description: 'Inclusive start date YYYY-MM-DD.' },
          date_to: { type: 'string', description: 'Inclusive end date YYYY-MM-DD.' },
          transaction_type: {
            type: 'string',
            description: 'Filter by type: payment, refund, adjustment. Omit for all.',
          },
          customer_id: { type: 'string', description: 'Restrict to one customer.' },
          limit: { type: 'number', description: 'Max rows (default 50, hard max 200).' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_employees',
      description:
        'List the team (washers, managers). Use for "who\'s working today", "team status", "all active washers".',
      parameters: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            description: 'Filter by status: active, on_leave, inactive. Omit for all.',
          },
          role: { type: 'string', description: 'Filter by role (e.g., washer, manager).' },
          limit: { type: 'number', description: 'Max rows (default 50).' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_business_snapshot',
      description:
        'High-level dashboard: counts of bookings (today, this week, this month, future), customers (total, this month), active subscriptions, today\'s revenue. Use for "how\'s the business doing", "give me a summary", "any activity today".',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
]

export const GLOBAL_READ_TOOL_NAMES = new Set(
  GLOBAL_READ_TOOL_SPECS.map((t) => (t as any).function.name as string),
)

// ─── Implementations ─────────────────────────────────────────────────

function clampLimit(value: unknown, def = 50, max = 200): number {
  const n = Number(value)
  if (!Number.isFinite(n) || n < 1) return def
  return Math.min(Math.floor(n), max)
}

function firstOfMonthIso(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
}

function lastOfMonthIso(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)
}

async function listBookings(input: Record<string, unknown>): Promise<string> {
  const db = getSupabaseAdmin()
  const dateFrom = String(input.date_from || firstOfMonthIso())
  const dateTo = String(input.date_to || lastOfMonthIso())
  const limit = clampLimit(input.limit)

  let q = db
    .from('bookings')
    .select(
      'id, customer_id, service_type, scheduled_date, scheduled_time, status, assigned_washer_id, address, neighborhood, plate_number, car_make_model, total_price, notes, created_at',
    )
    .gte('scheduled_date', dateFrom)
    .lte('scheduled_date', dateTo)
    .order('scheduled_date', { ascending: false })
    .order('scheduled_time', { ascending: false })
    .limit(limit)

  if (input.status) q = q.eq('status', String(input.status))
  if (input.washer_id) q = q.eq('assigned_washer_id', String(input.washer_id))
  if (input.customer_id) q = q.eq('customer_id', String(input.customer_id))

  const { data, error } = await q
  if (error) return JSON.stringify({ error: error.message })
  const rows = ((data as any) || []) as any[]
  return JSON.stringify({
    found: rows.length,
    date_from: dateFrom,
    date_to: dateTo,
    filters: {
      status: input.status ?? null,
      washer_id: input.washer_id ?? null,
      customer_id: input.customer_id ?? null,
    },
    bookings: rows,
  })
}

async function listCustomers(input: Record<string, unknown>): Promise<string> {
  const db = getSupabaseAdmin()
  const limit = clampLimit(input.limit)
  let q = db
    .from('customers')
    .select(
      'id, name, phone, email, segment, neighborhood, address, car_make_model, plate_number, acquisition_source, lifetime_value, created_at',
    )
    .order('created_at', { ascending: false })
    .limit(limit)

  if (input.segment) q = q.eq('segment', String(input.segment))
  if (input.created_since) q = q.gte('created_at', String(input.created_since))
  if (input.search) {
    const s = String(input.search).trim()
    q = q.or(`name.ilike.%${s}%,phone.ilike.%${s}%,email.ilike.%${s}%`)
  }

  const { data, error } = await q
  if (error) return JSON.stringify({ error: error.message })
  const rows = ((data as any) || []) as any[]
  return JSON.stringify({
    found: rows.length,
    customers: rows,
  })
}

async function listSubscriptions(input: Record<string, unknown>): Promise<string> {
  const db = getSupabaseAdmin()
  const limit = clampLimit(input.limit)
  let q = db
    .from('subscriptions')
    .select('id, customer_id, tier, status, monthly_price, washes_remaining, start_date, renewal_date, created_at')
    .order('renewal_date', { ascending: true })
    .limit(limit)

  if (input.status) q = q.eq('status', String(input.status))
  if (input.tier) q = q.eq('tier', String(input.tier))
  if (input.renewing_before) q = q.lte('renewal_date', String(input.renewing_before))

  const { data, error } = await q
  if (error) return JSON.stringify({ error: error.message })
  const rows = ((data as any) || []) as any[]
  return JSON.stringify({ found: rows.length, subscriptions: rows })
}

async function listTransactions(input: Record<string, unknown>): Promise<string> {
  const db = getSupabaseAdmin()
  const limit = clampLimit(input.limit)
  let q = db
    .from('transactions')
    .select(
      'id, customer_id, booking_id, transaction_type, amount_idr, payment_method, description, status, created_at',
    )
    .order('created_at', { ascending: false })
    .limit(limit)

  if (input.date_from) q = q.gte('created_at', String(input.date_from))
  if (input.date_to) q = q.lte('created_at', String(input.date_to) + 'T23:59:59')
  if (input.transaction_type) q = q.eq('transaction_type', String(input.transaction_type))
  if (input.customer_id) q = q.eq('customer_id', String(input.customer_id))

  const { data, error } = await q
  if (error) return JSON.stringify({ error: error.message })
  const rows = ((data as any) || []) as any[]
  const totals = rows.reduce(
    (acc, r) => {
      if (r.transaction_type === 'payment') acc.payments += Number(r.amount_idr || 0)
      if (r.transaction_type === 'refund') acc.refunds += Number(r.amount_idr || 0)
      return acc
    },
    { payments: 0, refunds: 0 },
  )
  return JSON.stringify({
    found: rows.length,
    totals_idr: { payments: totals.payments, refunds: totals.refunds, net: totals.payments - totals.refunds },
    transactions: rows,
  })
}

async function listEmployees(input: Record<string, unknown>): Promise<string> {
  const db = getSupabaseAdmin()
  const limit = clampLimit(input.limit)
  let q = db
    .from('employees')
    .select('id, name, phone, role, status, neighborhood, created_at')
    .order('name', { ascending: true })
    .limit(limit)

  if (input.status) q = q.eq('status', String(input.status))
  if (input.role) q = q.eq('role', String(input.role))

  const { data, error } = await q
  if (error) return JSON.stringify({ error: error.message })
  const rows = ((data as any) || []) as any[]
  return JSON.stringify({ found: rows.length, employees: rows })
}

async function getBusinessSnapshot(): Promise<string> {
  const db = getSupabaseAdmin()
  const today = new Date().toISOString().slice(0, 10)
  const monthStart = firstOfMonthIso()
  const monthEnd = lastOfMonthIso()
  const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const [
    bookingsToday,
    bookingsThisWeek,
    bookingsThisMonth,
    bookingsFuture,
    customersTotal,
    customersThisMonth,
    activeSubs,
    todaysPayments,
  ] = await Promise.all([
    db.from('bookings').select('id', { count: 'exact', head: true }).eq('scheduled_date', today),
    db.from('bookings').select('id', { count: 'exact', head: true }).gte('scheduled_date', weekStart).lte('scheduled_date', today),
    db.from('bookings').select('id', { count: 'exact', head: true }).gte('scheduled_date', monthStart).lte('scheduled_date', monthEnd),
    db.from('bookings').select('id', { count: 'exact', head: true }).gt('scheduled_date', today).in('status', ['confirmed', 'pending']),
    db.from('customers').select('id', { count: 'exact', head: true }),
    db.from('customers').select('id', { count: 'exact', head: true }).gte('created_at', monthStart),
    db.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    db.from('transactions').select('amount_idr, transaction_type').gte('created_at', today + 'T00:00:00').lte('created_at', today + 'T23:59:59'),
  ])

  const todaysPaymentRows = (todaysPayments.data as any[]) || []
  const todaysRevenue = todaysPaymentRows
    .filter((r) => r.transaction_type === 'payment')
    .reduce((s, r) => s + Number(r.amount_idr || 0), 0)
  const todaysRefunds = todaysPaymentRows
    .filter((r) => r.transaction_type === 'refund')
    .reduce((s, r) => s + Number(r.amount_idr || 0), 0)

  return JSON.stringify({
    as_of: new Date().toISOString(),
    bookings: {
      today: bookingsToday.count ?? 0,
      this_week: bookingsThisWeek.count ?? 0,
      this_month: bookingsThisMonth.count ?? 0,
      future_confirmed_or_pending: bookingsFuture.count ?? 0,
    },
    customers: {
      total: customersTotal.count ?? 0,
      new_this_month: customersThisMonth.count ?? 0,
    },
    subscriptions: {
      active: activeSubs.count ?? 0,
    },
    today_finance_idr: {
      revenue: todaysRevenue,
      refunds: todaysRefunds,
      net: todaysRevenue - todaysRefunds,
    },
  })
}

// ─── Dispatcher ──────────────────────────────────────────────────────

export async function executeGlobalReadTool(
  name: string,
  input: Record<string, unknown>,
): Promise<string> {
  switch (name) {
    case 'list_bookings':
      return listBookings(input)
    case 'list_customers':
      return listCustomers(input)
    case 'list_subscriptions':
      return listSubscriptions(input)
    case 'list_transactions':
      return listTransactions(input)
    case 'list_employees':
      return listEmployees(input)
    case 'get_business_snapshot':
      return getBusinessSnapshot()
    default:
      return JSON.stringify({ error: `Unknown global read tool: ${name}` })
  }
}
