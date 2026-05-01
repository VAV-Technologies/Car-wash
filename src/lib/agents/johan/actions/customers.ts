import {
  createCustomer as adminCreateCustomer,
  updateCustomer as adminUpdateCustomer,
} from '@/lib/admin/customers'
import {
  type ActionDefinition,
  type ActionResult,
  type ActionContext,
  assertUuid,
  assertNonEmptyString,
  assertEnum,
} from './_shared'
import { findIdempotentResult } from '../audit'

const NEIGHBORHOODS = [
  'pondok_indah', 'kebayoran_baru', 'kebayoran_lama', 'senayan', 'permata_hijau',
  'simprug', 'cilandak', 'tb_simatupang', 'kemang', 'cipete', 'fatmawati',
  'gandaria', 'pesanggrahan', 'bintaro', 'other',
] as const

const SEGMENTS = ['new', 'standard_only', 'mixed', 'subscriber', 'vip', 'churned'] as const

const ACQUISITION_SOURCES = [
  'instagram', 'google', 'referral', 'walk_in', 'whatsapp', 'flyer', 'event', 'other',
] as const

function cleanPhone(raw: unknown): string {
  if (typeof raw !== 'string') throw new Error('phone must be a string')
  const digits = raw.replace(/[\s+\-()]/g, '').replace(/\D/g, '')
  if (digits.length < 8) throw new Error('phone must be at least 8 digits')
  return digits.startsWith('0') ? '62' + digits.slice(1) : digits
}

async function loadCustomer(ctx: ActionContext, id: string) {
  const { data, error } = await ctx.supabaseAdmin
    .from('customers')
    .select('id, name, phone, segment, neighborhood')
    .eq('id', id)
    .maybeSingle()
  if (error) return { ok: false as const, error: error.message }
  if (!data) return { ok: false as const, error: `Customer ${id} not found` }
  return { ok: true as const, customer: data as any }
}

export const createCustomer: ActionDefinition = {
  name: 'create_customer',
  description:
    'Create a new customer record. Use AFTER search_customer returns no match. Phone is normalized to digit-only Indonesia format (62…). Set neighborhood when known so future bookings can auto-assign the right washer.',
  parameters: {
    type: 'object',
    additionalProperties: false,
    required: ['name', 'phone'],
    properties: {
      name: { type: 'string', maxLength: 200 },
      phone: { type: 'string', description: 'Indonesian phone (will be normalized to 62…)' },
      car_model: { type: 'string', maxLength: 200 },
      plate_number: { type: 'string', maxLength: 30 },
      address: { type: 'string', maxLength: 500 },
      neighborhood: { type: 'string', enum: NEIGHBORHOODS as unknown as string[] },
      email: { type: 'string', maxLength: 200 },
      acquisition_source: { type: 'string', enum: ACQUISITION_SOURCES as unknown as string[] },
    },
  },
  risk: 'low',
  requiresConfirmation: false,
  validate: (raw: any) => {
    const out: any = {
      name: assertNonEmptyString(raw?.name, 'name', 200),
      phone: cleanPhone(raw?.phone),
    }
    if (typeof raw?.car_model === 'string' && raw.car_model.trim()) out.car_model = raw.car_model.trim().slice(0, 200)
    if (typeof raw?.plate_number === 'string' && raw.plate_number.trim()) out.plate_number = raw.plate_number.trim().toUpperCase().slice(0, 30)
    if (typeof raw?.address === 'string' && raw.address.trim()) out.address = raw.address.trim().slice(0, 500)
    if (raw?.neighborhood !== undefined) out.neighborhood = assertEnum(raw.neighborhood, NEIGHBORHOODS, 'neighborhood')
    if (typeof raw?.email === 'string' && raw.email.trim()) out.email = raw.email.trim().slice(0, 200)
    if (raw?.acquisition_source !== undefined) {
      out.acquisition_source = assertEnum(raw.acquisition_source, ACQUISITION_SOURCES, 'acquisition_source')
    }
    return out
  },
  execute: async (p, ctx): Promise<ActionResult> => {
    const replay = await findIdempotentResult('create_customer', ctx)
    if (replay) return replay

    try {
      const { data: existing } = await ctx.supabaseAdmin
        .from('customers')
        .select('id, name, phone')
        .eq('phone', p.phone)
        .maybeSingle()
      if (existing) {
        return {
          ok: false,
          error: `Customer with phone ${p.phone} already exists (${(existing as any).id} — ${(existing as any).name}). Use update_customer_profile instead.`,
          recoverable: true,
        }
      }
      const created = await adminCreateCustomer({
        name: p.name,
        phone: p.phone,
        car_model: p.car_model ?? null,
        plate_number: p.plate_number ?? null,
        address: p.address ?? null,
        neighborhood: p.neighborhood ?? null,
        email: p.email ?? null,
        acquisition_source: p.acquisition_source ?? 'whatsapp',
      } as any)
      return {
        ok: true,
        data: created,
        affectedIds: [(created as any).id],
        message: `Customer ${(created as any).id} created`,
      }
    } catch (err: any) {
      return { ok: false, error: err?.message || String(err), recoverable: true }
    }
  },
}

const PROFILE_WHITELIST = ['name', 'car_model', 'plate_number', 'address', 'neighborhood', 'email', 'notes', 'referred_by'] as const

export const updateCustomerProfile: ActionDefinition = {
  name: 'update_customer_profile',
  description:
    'Update profile fields on an existing customer (name, car, address, neighborhood, email, notes, referrer). Does NOT change phone or segment — use change_customer_segment for segment.',
  parameters: {
    type: 'object',
    additionalProperties: false,
    required: ['customer_id'],
    properties: {
      customer_id: { type: 'string', format: 'uuid' },
      name: { type: 'string', maxLength: 200 },
      car_model: { type: 'string', maxLength: 200 },
      plate_number: { type: 'string', maxLength: 30 },
      address: { type: 'string', maxLength: 500 },
      neighborhood: { type: 'string', enum: NEIGHBORHOODS as unknown as string[] },
      email: { type: 'string', maxLength: 200 },
      notes: { type: 'string', maxLength: 1000 },
      referred_by: { type: 'string', maxLength: 200 },
    },
  },
  risk: 'low',
  requiresConfirmation: false,
  validate: (raw: any) => {
    const customer_id = assertUuid(raw?.customer_id, 'customer_id')
    const updates: Record<string, string> = {}
    for (const k of PROFILE_WHITELIST) {
      const v = raw?.[k]
      if (typeof v === 'string' && v.trim().length > 0) {
        if (k === 'neighborhood') updates[k] = assertEnum(v, NEIGHBORHOODS, 'neighborhood')
        else if (k === 'plate_number') updates[k] = v.trim().toUpperCase().slice(0, 30)
        else updates[k] = v.trim().slice(0, k === 'notes' ? 1000 : 500)
      }
    }
    if (Object.keys(updates).length === 0) {
      throw new Error('Provide at least one profile field to update')
    }
    return { customer_id, updates }
  },
  execute: async (p, ctx): Promise<ActionResult> => {
    const found = await loadCustomer(ctx, p.customer_id)
    if (!found.ok) return { ok: false, error: found.error, recoverable: true }
    try {
      const updated = await adminUpdateCustomer(p.customer_id, p.updates)
      return { ok: true, data: updated, affectedIds: [(updated as any).id] }
    } catch (err: any) {
      return { ok: false, error: err?.message || String(err), recoverable: true }
    }
  },
}

export const changeCustomerSegment: ActionDefinition = {
  name: 'change_customer_segment',
  description:
    'Move a customer to a different segment (new, standard_only, mixed, subscriber, vip, churned). Used for manual VIP promotion or churn-flagging. Most segments are auto-computed; this overrides.',
  parameters: {
    type: 'object',
    additionalProperties: false,
    required: ['customer_id', 'segment'],
    properties: {
      customer_id: { type: 'string', format: 'uuid' },
      segment: { type: 'string', enum: SEGMENTS as unknown as string[] },
    },
  },
  risk: 'medium',
  requiresConfirmation: true,
  validate: (raw: any) => ({
    customer_id: assertUuid(raw?.customer_id, 'customer_id'),
    segment: assertEnum(raw?.segment, SEGMENTS, 'segment'),
  }),
  execute: async (p, ctx): Promise<ActionResult> => {
    const found = await loadCustomer(ctx, p.customer_id)
    if (!found.ok) return { ok: false, error: found.error, recoverable: true }
    try {
      const updated = await adminUpdateCustomer(p.customer_id, { segment: p.segment } as any)
      return {
        ok: true,
        data: updated,
        affectedIds: [(updated as any).id],
        message: `Customer ${(updated as any).id} segment → ${p.segment}`,
      }
    } catch (err: any) {
      return { ok: false, error: err?.message || String(err), recoverable: true }
    }
  },
}
