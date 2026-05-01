import {
  type ActionDefinition,
  type ActionResult,
  type ActionContext,
  assertUuid,
  assertDate,
  assertEnum,
} from './_shared'
import { findIdempotentResult } from '../audit'

const SUBSCRIPTION_TIERS_V2 = ['essentials', 'plus', 'elite'] as const
const SUB_STATUSES = ['active', 'paused', 'cancelled'] as const

// Tier config — pricing + washes per month, mirrors SUBSCRIPTION_TIERS_V2 in admin/constants
const TIER_CONFIG: Record<string, { price: number; washes: number }> = {
  essentials: { price: 1499000, washes: 4 },
  plus: { price: 2499000, washes: 8 },
  elite: { price: 3999000, washes: 12 },
}

async function loadSubscription(ctx: ActionContext, id: string) {
  const { data, error } = await ctx.supabaseAdmin
    .from('subscriptions')
    .select('id, customer_id, tier, status, start_date, renewal_date, monthly_price, washes_allocated')
    .eq('id', id)
    .maybeSingle()
  if (error) return { ok: false as const, error: error.message }
  if (!data) return { ok: false as const, error: `Subscription ${id} not found` }
  return { ok: true as const, sub: data as any }
}

export const createSubscription: ActionDefinition = {
  name: 'create_subscription',
  description:
    'Enroll a customer in a Castudio subscription plan (essentials / plus / elite). Always look up the customer first via search_customer to get customer_id. start_date and renewal_date are YYYY-MM-DD; renewal_date is when the next charge is due (typically 1 month after start_date).',
  parameters: {
    type: 'object',
    additionalProperties: false,
    required: ['customer_id', 'tier', 'start_date', 'renewal_date'],
    properties: {
      customer_id: { type: 'string', format: 'uuid' },
      tier: { type: 'string', enum: SUBSCRIPTION_TIERS_V2 as unknown as string[] },
      start_date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
      renewal_date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
    },
  },
  risk: 'medium',
  requiresConfirmation: true,
  validate: (raw: any) => {
    const out: any = {
      customer_id: assertUuid(raw?.customer_id, 'customer_id'),
      tier: assertEnum(raw?.tier, SUBSCRIPTION_TIERS_V2, 'tier'),
      start_date: assertDate(raw?.start_date, 'start_date'),
      renewal_date: assertDate(raw?.renewal_date, 'renewal_date'),
    }
    if (out.renewal_date <= out.start_date) {
      throw new Error('renewal_date must be after start_date')
    }
    return out
  },
  execute: async (p, ctx): Promise<ActionResult> => {
    const replay = await findIdempotentResult('create_subscription', ctx)
    if (replay) return replay

    const { data: customer } = await ctx.supabaseAdmin
      .from('customers')
      .select('id')
      .eq('id', p.customer_id)
      .maybeSingle()
    if (!customer) return { ok: false, error: `Customer ${p.customer_id} not found`, recoverable: true }

    const cfg = TIER_CONFIG[p.tier]
    try {
      const { data, error } = await ctx.supabaseAdmin
        .from('subscriptions')
        .insert({
          customer_id: p.customer_id,
          tier: p.tier,
          start_date: p.start_date,
          renewal_date: p.renewal_date,
          monthly_price: cfg.price,
          washes_allocated: cfg.washes,
          washes_used_this_month: 0,
          status: 'active',
        })
        .select('id, tier')
        .single()
      if (error) return { ok: false, error: error.message, recoverable: true }
      const id = (data as any).id as string
      return {
        ok: true,
        data,
        affectedIds: [id],
        message: `Subscription ${id} (${p.tier}) created`,
      }
    } catch (err: any) {
      return { ok: false, error: err?.message || String(err), recoverable: true }
    }
  },
}

export const updateSubscriptionStatus: ActionDefinition = {
  name: 'update_subscription_status',
  description:
    'Change a subscription\'s status. active = running, paused = temporarily on hold, cancelled = ended permanently. Always look up the subscription first via search_customer + customer subscriptions.',
  parameters: {
    type: 'object',
    additionalProperties: false,
    required: ['subscription_id', 'status'],
    properties: {
      subscription_id: { type: 'string', format: 'uuid' },
      status: { type: 'string', enum: SUB_STATUSES as unknown as string[] },
      cancellation_reason: { type: 'string', maxLength: 500 },
    },
  },
  risk: 'medium',
  requiresConfirmation: true,
  validate: (raw: any) => {
    const out: any = {
      subscription_id: assertUuid(raw?.subscription_id, 'subscription_id'),
      status: assertEnum(raw?.status, SUB_STATUSES, 'status'),
    }
    if (typeof raw?.cancellation_reason === 'string' && raw.cancellation_reason.trim()) {
      out.cancellation_reason = raw.cancellation_reason.trim().slice(0, 500)
    }
    return out
  },
  execute: async (p, ctx): Promise<ActionResult> => {
    const found = await loadSubscription(ctx, p.subscription_id)
    if (!found.ok) return { ok: false, error: found.error, recoverable: true }
    try {
      const update: Record<string, unknown> = { status: p.status, updated_at: new Date().toISOString() }
      if (p.status === 'cancelled' && p.cancellation_reason) {
        update.cancellation_reason = p.cancellation_reason
      }
      const { data, error } = await ctx.supabaseAdmin
        .from('subscriptions')
        .update(update)
        .eq('id', p.subscription_id)
        .select('id, status')
        .single()
      if (error) return { ok: false, error: error.message, recoverable: true }
      const id = (data as any).id as string
      return {
        ok: true,
        data,
        affectedIds: [id],
        message: `Subscription ${id} → ${p.status}`,
      }
    } catch (err: any) {
      return { ok: false, error: err?.message || String(err), recoverable: true }
    }
  },
}

export const extendSubscription: ActionDefinition = {
  name: 'extend_subscription',
  description:
    'Push a subscription\'s renewal_date out to a new date (e.g. roll over for another month). Use when a customer pays for renewal.',
  parameters: {
    type: 'object',
    additionalProperties: false,
    required: ['subscription_id', 'new_renewal_date'],
    properties: {
      subscription_id: { type: 'string', format: 'uuid' },
      new_renewal_date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
    },
  },
  risk: 'medium',
  requiresConfirmation: true,
  validate: (raw: any) => ({
    subscription_id: assertUuid(raw?.subscription_id, 'subscription_id'),
    new_renewal_date: assertDate(raw?.new_renewal_date, 'new_renewal_date'),
  }),
  execute: async (p, ctx): Promise<ActionResult> => {
    const found = await loadSubscription(ctx, p.subscription_id)
    if (!found.ok) return { ok: false, error: found.error, recoverable: true }
    if (p.new_renewal_date <= found.sub.renewal_date) {
      return {
        ok: false,
        error: `new_renewal_date (${p.new_renewal_date}) must be after current renewal_date (${found.sub.renewal_date})`,
        recoverable: true,
      }
    }
    try {
      const { data, error } = await ctx.supabaseAdmin
        .from('subscriptions')
        .update({ renewal_date: p.new_renewal_date, updated_at: new Date().toISOString() })
        .eq('id', p.subscription_id)
        .select('id, renewal_date')
        .single()
      if (error) return { ok: false, error: error.message, recoverable: true }
      const id = (data as any).id as string
      return {
        ok: true,
        data,
        affectedIds: [id],
        message: `Subscription extended to ${p.new_renewal_date}`,
      }
    } catch (err: any) {
      return { ok: false, error: err?.message || String(err), recoverable: true }
    }
  },
}
