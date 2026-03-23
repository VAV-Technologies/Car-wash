import { supabase } from '@/lib/supabase'
import type { PaymentStatus, PaymentMethod } from './types'

// ─── Types ──────────────────────────────────────────────────────────

export interface InvoiceQueryParams {
  page: number
  limit: number
  payment_status?: PaymentStatus | ''
  date_from?: string
  date_to?: string
  customer_id?: string
}

export interface InvoiceRow {
  id: string
  customer_id: string | null
  job_id: string | null
  amount: number
  category: string | null
  description: string | null
  payment_method: PaymentMethod | null
  payment_status: PaymentStatus
  payment_confirmed_at: string | null
  payment_confirmed_by: string | null
  created_at: string
  customer_name: string | null
  customer_phone: string | null
}

export interface InvoiceDetail extends InvoiceRow {
  job_service_type: string | null
  job_completed_at: string | null
}

export interface MonthlyInvoiceSummary {
  totalConfirmed: number
  totalPending: number
  transactionCount: number
  byPaymentMethod: {
    bank_transfer: number
    qris: number
    cash: number
    other: number
  }
}

export interface ReceiptData {
  transactionId: string
  customerName: string | null
  customerPhone: string | null
  category: string | null
  description: string | null
  amount: number
  paymentMethod: PaymentMethod | null
  paymentStatus: PaymentStatus
  paymentConfirmedAt: string | null
  paymentConfirmedBy: string | null
  createdAt: string
}

// ─── Get Invoices (paginated) ───────────────────────────────────────

export async function getInvoices(
  params: Partial<InvoiceQueryParams> = {}
): Promise<{ data: InvoiceRow[]; count: number }> {
  const {
    page = 1,
    limit = 25,
    payment_status = '',
    date_from = '',
    date_to = '',
    customer_id = '',
  } = params

  let query = supabase
    .from('transactions')
    .select('*, customers!left(name, phone)', { count: 'exact' })
    .eq('type', 'revenue')

  if (payment_status) {
    query = query.eq('payment_status', payment_status)
  }
  if (date_from) {
    query = query.gte('created_at', date_from)
  }
  if (date_to) {
    query = query.lte('created_at', `${date_to}T23:59:59`)
  }
  if (customer_id) {
    query = query.eq('customer_id', customer_id)
  }

  query = query.order('created_at', { ascending: false })

  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch invoices: ${error.message}`)
  }

  const mapped = (data ?? []).map((row: Record<string, unknown>) => {
    const { customers, ...rest } = row
    const cust = customers as { name: string; phone: string } | null
    return {
      ...rest,
      customer_name: cust?.name ?? null,
      customer_phone: cust?.phone ?? null,
    }
  }) as InvoiceRow[]

  return { data: mapped, count: count ?? 0 }
}

// ─── Get Invoice By ID ──────────────────────────────────────────────

export async function getInvoiceById(
  id: string
): Promise<InvoiceDetail | null> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, customers!left(name, phone), jobs!left(service_type, completed_at)')
    .eq('id', id)
    .single()

  if (error) {
    return null
  }

  const row = data as Record<string, unknown>
  const cust = row.customers as { name: string; phone: string } | null
  const job = row.jobs as { service_type: string; completed_at: string } | null
  const { customers, jobs, ...rest } = row

  return {
    ...rest,
    customer_name: cust?.name ?? null,
    customer_phone: cust?.phone ?? null,
    job_service_type: job?.service_type ?? null,
    job_completed_at: job?.completed_at ?? null,
  } as InvoiceDetail
}

// ─── Monthly Invoice Summary ────────────────────────────────────────

export async function getMonthlyInvoiceSummary(
  year: number,
  month: number
): Promise<MonthlyInvoiceSummary> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate =
    month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, '0')}-01`

  const { data, error } = await supabase
    .from('transactions')
    .select('amount, payment_status, payment_method')
    .eq('type', 'revenue')
    .gte('created_at', startDate)
    .lt('created_at', endDate)

  if (error) {
    throw new Error(`Failed to fetch monthly summary: ${error.message}`)
  }

  const rows = data ?? []

  let totalConfirmed = 0
  let totalPending = 0
  const byPaymentMethod = { bank_transfer: 0, qris: 0, cash: 0, other: 0 }

  for (const row of rows) {
    const r = row as { amount: number; payment_status: string; payment_method: string | null }
    if (r.payment_status === 'confirmed') {
      totalConfirmed += r.amount
    } else if (r.payment_status === 'pending') {
      totalPending += r.amount
    }

    if (r.payment_status === 'confirmed' || r.payment_status === 'pending') {
      const method = r.payment_method
      if (method === 'bank_transfer') {
        byPaymentMethod.bank_transfer += r.amount
      } else if (method === 'qris') {
        byPaymentMethod.qris += r.amount
      } else if (method === 'cash') {
        byPaymentMethod.cash += r.amount
      } else {
        byPaymentMethod.other += r.amount
      }
    }
  }

  return {
    totalConfirmed,
    totalPending,
    transactionCount: rows.length,
    byPaymentMethod,
  }
}

// ─── Generate Receipt Data ──────────────────────────────────────────

export async function generateReceiptData(
  transactionId: string
): Promise<ReceiptData | null> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, customers!left(name, phone)')
    .eq('id', transactionId)
    .single()

  if (error) {
    return null
  }

  const row = data as Record<string, unknown>
  const cust = row.customers as { name: string; phone: string } | null

  return {
    transactionId: row.id as string,
    customerName: cust?.name ?? null,
    customerPhone: cust?.phone ?? null,
    category: row.category as string | null,
    description: row.description as string | null,
    amount: row.amount as number,
    paymentMethod: row.payment_method as PaymentMethod | null,
    paymentStatus: row.payment_status as PaymentStatus,
    paymentConfirmedAt: row.payment_confirmed_at as string | null,
    paymentConfirmedBy: row.payment_confirmed_by as string | null,
    createdAt: row.created_at as string,
  }
}
