import { supabase } from '@/lib/supabase'
import type {
  Transaction,
  TransactionWithCustomer,
  TransactionType,
  PaymentStatus,
} from './types'

// ─── Query Params ────────────────────────────────────────────────────

export interface TransactionQueryParams {
  page: number
  limit: number
  type?: TransactionType | ''
  payment_status?: PaymentStatus | ''
  date_from?: string
  date_to?: string
}

// ─── Get Transactions (paginated, with customer name) ────────────────

export async function getTransactions(
  params: Partial<TransactionQueryParams> = {}
): Promise<{ data: TransactionWithCustomer[]; count: number }> {
  const {
    page = 1,
    limit = 25,
    type = '',
    payment_status = '',
    date_from = '',
    date_to = '',
  } = params

  let query = supabase
    .from('transactions')
    .select('*, customers!left(name)', { count: 'exact' })

  if (type) {
    query = query.eq('type', type)
  }
  if (payment_status) {
    query = query.eq('payment_status', payment_status)
  }
  if (date_from) {
    query = query.gte('created_at', date_from)
  }
  if (date_to) {
    query = query.lte('created_at', `${date_to}T23:59:59`)
  }

  query = query.order('created_at', { ascending: false })

  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch transactions: ${error.message}`)
  }

  // Map joined customer name
  const mapped = (data ?? []).map((row: Record<string, unknown>) => {
    const { customers, ...rest } = row
    return {
      ...rest,
      customer_name: (customers as { name: string } | null)?.name ?? null,
    }
  }) as TransactionWithCustomer[]

  return { data: mapped, count: count ?? 0 }
}

// ─── Create Transaction ──────────────────────────────────────────────

export async function createTransaction(
  data: Omit<Transaction, 'id' | 'created_at' | 'payment_confirmed_at' | 'payment_confirmed_by'>
): Promise<Transaction> {
  const { data: created, error } = await supabase
    .from('transactions')
    .insert(data)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create transaction: ${error.message}`)
  }

  return created as Transaction
}

// ─── Confirm Payment ─────────────────────────────────────────────────

export async function confirmPayment(
  transactionId: string,
  confirmedBy: string
): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .update({
      payment_status: 'confirmed',
      payment_confirmed_at: new Date().toISOString(),
      payment_confirmed_by: confirmedBy,
    })
    .eq('id', transactionId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to confirm payment: ${error.message}`)
  }

  return data as Transaction
}

// ─── Mark Payment Failed ─────────────────────────────────────────────

export async function markPaymentFailed(
  transactionId: string
): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .update({ payment_status: 'failed' })
    .eq('id', transactionId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update payment: ${error.message}`)
  }

  return data as Transaction
}

// ─── Pending Payments ────────────────────────────────────────────────

export async function getPendingPayments(): Promise<TransactionWithCustomer[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, customers!left(name)')
    .eq('payment_status', 'pending')
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch pending payments: ${error.message}`)
  }

  return (data ?? []).map((row: Record<string, unknown>) => {
    const { customers, ...rest } = row
    return {
      ...rest,
      customer_name: (customers as { name: string } | null)?.name ?? null,
    }
  }) as TransactionWithCustomer[]
}

// ─── Monthly P&L ─────────────────────────────────────────────────────

export interface MonthlyPLData {
  revenue: number
  expenses: number
  net: number
  pendingRevenue: number
}

export async function getMonthlyPL(
  year: number,
  month: number
): Promise<MonthlyPLData> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate =
    month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, '0')}-01`

  // Confirmed revenue
  const { data: revenueData } = await supabase
    .from('transactions')
    .select('amount')
    .eq('type', 'revenue')
    .eq('payment_status', 'confirmed')
    .gte('created_at', startDate)
    .lt('created_at', endDate)

  // Pending revenue
  const { data: pendingData } = await supabase
    .from('transactions')
    .select('amount')
    .eq('type', 'revenue')
    .eq('payment_status', 'pending')
    .gte('created_at', startDate)
    .lt('created_at', endDate)

  // Expenses
  const { data: expenseData } = await supabase
    .from('transactions')
    .select('amount')
    .eq('type', 'expense')
    .gte('created_at', startDate)
    .lt('created_at', endDate)

  const revenue = (revenueData ?? []).reduce(
    (sum: number, t: { amount: number }) => sum + t.amount,
    0
  )
  const pendingRevenue = (pendingData ?? []).reduce(
    (sum: number, t: { amount: number }) => sum + t.amount,
    0
  )
  const expenses = (expenseData ?? []).reduce(
    (sum: number, t: { amount: number }) => sum + t.amount,
    0
  )

  return {
    revenue,
    expenses,
    net: revenue - expenses,
    pendingRevenue,
  }
}

// ─── Revenue Breakdown by Category ───────────────────────────────────

export async function getRevenueBreakdown(
  year: number,
  month: number
): Promise<{ category: string; total: number }[]> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate =
    month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, '0')}-01`

  const { data, error } = await supabase
    .from('transactions')
    .select('category, amount')
    .eq('type', 'revenue')
    .eq('payment_status', 'confirmed')
    .gte('created_at', startDate)
    .lt('created_at', endDate)

  if (error) {
    throw new Error(`Failed to fetch revenue breakdown: ${error.message}`)
  }

  // Group by category client-side
  const grouped: Record<string, number> = {}
  for (const row of data ?? []) {
    const cat = row.category ?? 'uncategorized'
    grouped[cat] = (grouped[cat] ?? 0) + row.amount
  }

  return Object.entries(grouped)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)
}

// ─── Expenses by Category ────────────────────────────────────────────

// ─── Cash Position (cumulative balance) ─────────────────────────────

export interface CashPositionData {
  balance: number
  totalRevenue: number
  totalExpenses: number
  burnRate: number
  runwayMonths: number
}

export async function getCashPosition(): Promise<CashPositionData> {
  const { data: revRows } = await supabase
    .from('transactions')
    .select('amount')
    .eq('type', 'revenue')
    .eq('payment_status', 'confirmed')

  const { data: expRows } = await supabase
    .from('transactions')
    .select('amount, created_at')
    .eq('type', 'expense')

  const totalRevenue = (revRows ?? []).reduce(
    (sum: number, r: { amount: number }) => sum + r.amount,
    0
  )
  const totalExpenses = (expRows ?? []).reduce(
    (sum: number, r: { amount: number }) => sum + r.amount,
    0
  )
  const balance = totalRevenue - totalExpenses

  // Burn rate: avg monthly expenses over last 3 months
  const now = new Date()
  const threeMonthsAgo = new Date(now)
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
  const recentExpenses = (expRows ?? []).filter(
    (e: { amount: number; created_at: string }) =>
      new Date(e.created_at) >= threeMonthsAgo
  )
  const recentTotal = recentExpenses.reduce(
    (sum: number, r: { amount: number }) => sum + r.amount,
    0
  )
  const burnRate = recentTotal / 3
  const runwayMonths = burnRate > 0 ? balance / burnRate : 99

  return { balance, totalRevenue, totalExpenses, burnRate, runwayMonths }
}

// ─── Payment Aging (pending > 48 hours) ─────────────────────────────

export interface AgingPayment {
  id: string
  customer_name: string | null
  amount: number
  created_at: string
  days_pending: number
  description: string | null
}

export async function getAgingPayments(): Promise<AgingPayment[]> {
  const cutoff = new Date()
  cutoff.setHours(cutoff.getHours() - 48)

  const { data, error } = await supabase
    .from('transactions')
    .select('id, amount, created_at, description, customers!left(name)')
    .eq('payment_status', 'pending')
    .lt('created_at', cutoff.toISOString())
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch aging payments: ${error.message}`)
  }

  return (data ?? []).map((row: Record<string, unknown>) => {
    const { customers, ...rest } = row
    const createdAt = rest.created_at as string
    const daysPending = Math.floor(
      (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
    )
    return {
      id: rest.id as string,
      customer_name: (customers as { name: string } | null)?.name ?? null,
      amount: rest.amount as number,
      created_at: createdAt,
      days_pending: daysPending,
      description: rest.description as string | null,
    }
  })
}

// ─── Expenses by Category ────────────────────────────────────────────

export async function getExpensesByCategory(
  year: number,
  month: number
): Promise<{ category: string; total: number }[]> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate =
    month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, '0')}-01`

  const { data, error } = await supabase
    .from('transactions')
    .select('category, amount')
    .eq('type', 'expense')
    .gte('created_at', startDate)
    .lt('created_at', endDate)

  if (error) {
    throw new Error(`Failed to fetch expenses: ${error.message}`)
  }

  const grouped: Record<string, number> = {}
  for (const row of data ?? []) {
    const cat = row.category ?? 'uncategorized'
    grouped[cat] = (grouped[cat] ?? 0) + row.amount
  }

  return Object.entries(grouped)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)
}
