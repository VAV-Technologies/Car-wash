import {
  type ActionDefinition,
  type ActionResult,
  type ActionContext,
  assertUuid,
  assertEnum,
  assertNonEmptyString,
} from './_shared'
import { findIdempotentResult } from '../audit'

const TRANSACTION_TYPES = ['revenue', 'expense'] as const
const PAYMENT_STATUSES = ['pending', 'confirmed', 'failed', 'refunded'] as const
const PAYMENT_METHODS = ['bank_transfer', 'qris'] as const

async function loadTransaction(ctx: ActionContext, id: string) {
  const { data, error } = await ctx.supabaseAdmin
    .from('transactions')
    .select('id, type, amount, payment_status')
    .eq('id', id)
    .maybeSingle()
  if (error) return { ok: false as const, error: error.message }
  if (!data) return { ok: false as const, error: `Transaction ${id} not found` }
  return { ok: true as const, transaction: data as any }
}

export const recordTransaction: ActionDefinition = {
  name: 'record_transaction',
  description:
    'Log a financial transaction (revenue or expense). Use for booking payments, refunds, ad-hoc costs (parking, fuel, supplies). Amount in Indonesian rupiah (whole number, no decimals). Always include a clear category and description so finance can reconcile.',
  parameters: {
    type: 'object',
    additionalProperties: false,
    required: ['type', 'amount', 'category', 'description'],
    properties: {
      type: { type: 'string', enum: TRANSACTION_TYPES as unknown as string[] },
      amount: { type: 'number', minimum: 1, description: 'Amount in IDR, whole rupiah' },
      category: { type: 'string', maxLength: 100, description: 'e.g. wash_revenue, supplies, fuel, parking, refund' },
      description: { type: 'string', maxLength: 500 },
      customer_id: { type: 'string', format: 'uuid' },
      job_id: { type: 'string', format: 'uuid' },
      subscription_id: { type: 'string', format: 'uuid' },
      payment_method: { type: 'string', enum: PAYMENT_METHODS as unknown as string[] },
      payment_status: { type: 'string', enum: PAYMENT_STATUSES as unknown as string[] },
      transaction_date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$', description: 'YYYY-MM-DD; defaults to today' },
    },
  },
  risk: 'medium',
  requiresConfirmation: true,
  validate: (raw: any) => {
    const out: any = {
      type: assertEnum(raw?.type, TRANSACTION_TYPES, 'type'),
      amount: Number(raw?.amount),
      category: assertNonEmptyString(raw?.category, 'category', 100),
      description: assertNonEmptyString(raw?.description, 'description', 500),
    }
    if (!Number.isFinite(out.amount) || out.amount <= 0) throw new Error('amount must be a positive number')
    out.amount = Math.round(out.amount)
    if (raw?.customer_id !== undefined) out.customer_id = assertUuid(raw.customer_id, 'customer_id')
    if (raw?.job_id !== undefined) out.job_id = assertUuid(raw.job_id, 'job_id')
    if (raw?.subscription_id !== undefined) out.subscription_id = assertUuid(raw.subscription_id, 'subscription_id')
    if (raw?.payment_method !== undefined) out.payment_method = assertEnum(raw.payment_method, PAYMENT_METHODS, 'payment_method')
    if (raw?.payment_status !== undefined) out.payment_status = assertEnum(raw.payment_status, PAYMENT_STATUSES, 'payment_status')
    if (raw?.transaction_date !== undefined && typeof raw.transaction_date === 'string') {
      out.transaction_date = raw.transaction_date
    }
    return out
  },
  execute: async (p, ctx): Promise<ActionResult> => {
    const replay = await findIdempotentResult('record_transaction', ctx)
    if (replay) return replay

    try {
      const insertPayload: Record<string, unknown> = {
        type: p.type,
        amount: p.amount,
        category: p.category,
        description: p.description,
        customer_id: p.customer_id ?? null,
        job_id: p.job_id ?? null,
        subscription_id: p.subscription_id ?? null,
        payment_method: p.payment_method ?? null,
        payment_status: p.payment_status ?? 'pending',
      }
      if (p.transaction_date) insertPayload.date = p.transaction_date

      const { data, error } = await ctx.supabaseAdmin
        .from('transactions')
        .insert(insertPayload)
        .select('id, amount, type')
        .single()
      if (error) return { ok: false, error: error.message, recoverable: true }
      const id = (data as any).id as string
      return {
        ok: true,
        data,
        affectedIds: [id],
        message: `Transaction ${id} logged (${p.type} Rp ${p.amount.toLocaleString('id-ID')})`,
      }
    } catch (err: any) {
      return { ok: false, error: err?.message || String(err), recoverable: true }
    }
  },
}

export const confirmPayment: ActionDefinition = {
  name: 'confirm_payment',
  description:
    'Mark a transaction\'s payment as confirmed (received). Stamps the confirmation timestamp. Look up the transaction first.',
  parameters: {
    type: 'object',
    additionalProperties: false,
    required: ['transaction_id'],
    properties: { transaction_id: { type: 'string', format: 'uuid' } },
  },
  risk: 'medium',
  requiresConfirmation: false,
  validate: (raw: any) => ({ transaction_id: assertUuid(raw?.transaction_id, 'transaction_id') }),
  execute: async (p, ctx): Promise<ActionResult> => {
    const found = await loadTransaction(ctx, p.transaction_id)
    if (!found.ok) return { ok: false, error: found.error, recoverable: true }
    if (found.transaction.payment_status === 'confirmed') {
      return { ok: true, message: 'Payment already confirmed', affectedIds: [p.transaction_id] }
    }
    try {
      // payment_confirmed_by is FK to employees.id (uuid). Chat user is admin auth user, not employee.
      // Leave it null and rely on the audit log + user_email for "who confirmed".
      const { data, error } = await ctx.supabaseAdmin
        .from('transactions')
        .update({
          payment_status: 'confirmed',
          payment_confirmed_at: new Date().toISOString(),
        })
        .eq('id', p.transaction_id)
        .select('id, payment_status')
        .single()
      if (error) return { ok: false, error: error.message, recoverable: true }
      const id = (data as any).id as string
      return {
        ok: true,
        data,
        affectedIds: [id],
        message: `Payment ${id} confirmed`,
      }
    } catch (err: any) {
      return { ok: false, error: err?.message || String(err), recoverable: true }
    }
  },
}

export const markPaymentFailed: ActionDefinition = {
  name: 'mark_payment_failed',
  description:
    'Flag a pending transaction\'s payment as failed (bounced bank transfer, declined card, etc.). Look up the transaction first.',
  parameters: {
    type: 'object',
    additionalProperties: false,
    required: ['transaction_id'],
    properties: { transaction_id: { type: 'string', format: 'uuid' } },
  },
  risk: 'medium',
  requiresConfirmation: true,
  validate: (raw: any) => ({ transaction_id: assertUuid(raw?.transaction_id, 'transaction_id') }),
  execute: async (p, ctx): Promise<ActionResult> => {
    const found = await loadTransaction(ctx, p.transaction_id)
    if (!found.ok) return { ok: false, error: found.error, recoverable: true }
    try {
      const { data, error } = await ctx.supabaseAdmin
        .from('transactions')
        .update({ payment_status: 'failed' })
        .eq('id', p.transaction_id)
        .select('id, payment_status')
        .single()
      if (error) return { ok: false, error: error.message, recoverable: true }
      const id = (data as any).id as string
      return {
        ok: true,
        data,
        affectedIds: [id],
        message: `Payment ${id} marked failed`,
      }
    } catch (err: any) {
      return { ok: false, error: err?.message || String(err), recoverable: true }
    }
  },
}
