import {
  createBooking as adminCreateBooking,
  updateBooking as adminUpdateBooking,
  autoAssignWasher,
} from '@/lib/admin/bookings'
import {
  type ActionDefinition,
  type ActionResult,
  type ActionContext,
  assertUuid,
  assertDate,
  assertTime,
  assertEnum,
  assertNonEmptyString,
} from './_shared'
import { findIdempotentResult } from '../audit'

const SERVICE_TYPES = [
  'standard_wash',
  'professional_wash',
  'elite_wash',
  'interior_detail',
  'exterior_detail',
  'full_detail',
  'ceramic_coating',
  'paint_correction',
] as const

const BOOKING_STATUSES = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'] as const

async function loadBooking(ctx: ActionContext, id: string) {
  const { data, error } = await ctx.supabaseAdmin
    .from('bookings')
    .select('id, customer_id, service_type, scheduled_date, scheduled_time, status, washer_id, notes')
    .eq('id', id)
    .maybeSingle()
  if (error) return { ok: false as const, error: error.message }
  if (!data) return { ok: false as const, error: `Booking ${id} not found` }
  return { ok: true as const, booking: data as any }
}

export const createBooking: ActionDefinition = {
  name: 'create_booking',
  description:
    'Create a new booking for a customer. Always run search_customer + check_date_availability first. Date must be YYYY-MM-DD, time HH:MM 24h. Auto-assigns the best washer based on customer neighborhood unless none available. Indonesian operating hours apply (Mon closed, 10:00–18:00).',
  parameters: {
    type: 'object',
    additionalProperties: false,
    required: ['customer_id', 'service_type', 'scheduled_date', 'scheduled_time'],
    properties: {
      customer_id: { type: 'string', format: 'uuid' },
      service_type: { type: 'string', enum: SERVICE_TYPES as unknown as string[] },
      scheduled_date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
      scheduled_time: { type: 'string', pattern: '^\\d{2}:\\d{2}$' },
      notes: { type: 'string', maxLength: 500 },
    },
  },
  risk: 'medium',
  requiresConfirmation: true,
  validate: (raw: any) => ({
    customer_id: assertUuid(raw?.customer_id, 'customer_id'),
    service_type: assertEnum(raw?.service_type, SERVICE_TYPES, 'service_type'),
    scheduled_date: assertDate(raw?.scheduled_date, 'scheduled_date'),
    scheduled_time: assertTime(raw?.scheduled_time, 'scheduled_time'),
    notes: typeof raw?.notes === 'string' ? raw.notes.slice(0, 500) : undefined,
  }),
  execute: async (p, ctx): Promise<ActionResult> => {
    const replay = await findIdempotentResult('create_booking', ctx)
    if (replay) return replay

    try {
      const created = await adminCreateBooking({
        customer_id: p.customer_id,
        service_type: p.service_type,
        scheduled_date: p.scheduled_date,
        scheduled_time: p.scheduled_time,
        status: 'confirmed',
        notes: p.notes ?? null,
      } as any)
      return {
        ok: true,
        data: created,
        affectedIds: [(created as any).id],
        message: `Booking ${(created as any).id} created`,
      }
    } catch (err: any) {
      return { ok: false, error: err?.message || String(err), recoverable: true }
    }
  },
}

export const rescheduleBooking: ActionDefinition = {
  name: 'reschedule_booking',
  description:
    'Move an existing booking to a new date and/or time. ALWAYS look up the booking via get_customer_bookings first to obtain the booking_id — never invent UUIDs. Provide at least one of scheduled_date or scheduled_time.',
  parameters: {
    type: 'object',
    additionalProperties: false,
    required: ['booking_id'],
    properties: {
      booking_id: { type: 'string', format: 'uuid' },
      scheduled_date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
      scheduled_time: { type: 'string', pattern: '^\\d{2}:\\d{2}$' },
    },
  },
  risk: 'medium',
  requiresConfirmation: true,
  validate: (raw: any) => {
    const out: any = { booking_id: assertUuid(raw?.booking_id, 'booking_id') }
    if (raw?.scheduled_date !== undefined) out.scheduled_date = assertDate(raw.scheduled_date, 'scheduled_date')
    if (raw?.scheduled_time !== undefined) out.scheduled_time = assertTime(raw.scheduled_time, 'scheduled_time')
    if (!out.scheduled_date && !out.scheduled_time) {
      throw new Error('Provide at least scheduled_date or scheduled_time')
    }
    return out
  },
  execute: async (p, ctx): Promise<ActionResult> => {
    const found = await loadBooking(ctx, p.booking_id)
    if (!found.ok) return { ok: false, error: found.error, recoverable: true }
    try {
      const updates: Record<string, string> = {}
      if (p.scheduled_date) updates.scheduled_date = p.scheduled_date
      if (p.scheduled_time) updates.scheduled_time = p.scheduled_time
      const updated = await adminUpdateBooking(p.booking_id, updates)
      return {
        ok: true,
        data: updated,
        affectedIds: [(updated as any).id],
        message: `Booking ${(updated as any).id} rescheduled`,
      }
    } catch (err: any) {
      return { ok: false, error: err?.message || String(err), recoverable: true }
    }
  },
}

export const changeBookingService: ActionDefinition = {
  name: 'change_booking_service',
  description:
    'Change the service type of an existing booking (e.g. upgrade Standard Wash → Elite Wash). ALWAYS look up the booking first via get_customer_bookings.',
  parameters: {
    type: 'object',
    additionalProperties: false,
    required: ['booking_id', 'service_type'],
    properties: {
      booking_id: { type: 'string', format: 'uuid' },
      service_type: { type: 'string', enum: SERVICE_TYPES as unknown as string[] },
    },
  },
  risk: 'medium',
  requiresConfirmation: true,
  validate: (raw: any) => ({
    booking_id: assertUuid(raw?.booking_id, 'booking_id'),
    service_type: assertEnum(raw?.service_type, SERVICE_TYPES, 'service_type'),
  }),
  execute: async (p, ctx): Promise<ActionResult> => {
    const found = await loadBooking(ctx, p.booking_id)
    if (!found.ok) return { ok: false, error: found.error, recoverable: true }
    try {
      const updated = await adminUpdateBooking(p.booking_id, { service_type: p.service_type })
      return { ok: true, data: updated, affectedIds: [(updated as any).id] }
    } catch (err: any) {
      return { ok: false, error: err?.message || String(err), recoverable: true }
    }
  },
}

export const reassignWasher: ActionDefinition = {
  name: 'reassign_washer',
  description:
    'Reassign a booking to a different washer. Pass an explicit washer_id, or set auto:true to let the system pick the best available washer based on neighborhood + load balance.',
  parameters: {
    type: 'object',
    additionalProperties: false,
    required: ['booking_id'],
    properties: {
      booking_id: { type: 'string', format: 'uuid' },
      washer_id: { type: 'string', format: 'uuid' },
      auto: { type: 'boolean' },
    },
  },
  risk: 'low',
  requiresConfirmation: false,
  validate: (raw: any) => {
    const out: any = { booking_id: assertUuid(raw?.booking_id, 'booking_id') }
    if (raw?.auto === true) {
      out.auto = true
    } else if (raw?.washer_id) {
      out.washer_id = assertUuid(raw.washer_id, 'washer_id')
    } else {
      throw new Error('Provide washer_id or auto:true')
    }
    return out
  },
  execute: async (p, ctx): Promise<ActionResult> => {
    const found = await loadBooking(ctx, p.booking_id)
    if (!found.ok) return { ok: false, error: found.error, recoverable: true }
    const booking = found.booking
    try {
      let washerId = p.washer_id
      if (p.auto) {
        const { data: customer } = await ctx.supabaseAdmin
          .from('customers')
          .select('neighborhood')
          .eq('id', booking.customer_id)
          .maybeSingle()
        const neighborhood = (customer as any)?.neighborhood
        if (!neighborhood) {
          return {
            ok: false,
            error: 'Customer has no neighborhood — cannot auto-assign. Pick a washer_id manually.',
            recoverable: true,
          }
        }
        const auto = await autoAssignWasher(
          neighborhood,
          booking.scheduled_date,
          booking.scheduled_time,
          booking.service_type,
        )
        if (!auto) {
          return { ok: false, error: 'No available washer found for this slot.', recoverable: true }
        }
        washerId = auto
      }
      const updated = await adminUpdateBooking(p.booking_id, { washer_id: washerId } as any)
      return {
        ok: true,
        data: updated,
        affectedIds: [(updated as any).id],
        message: `Washer ${washerId} assigned`,
      }
    } catch (err: any) {
      return { ok: false, error: err?.message || String(err), recoverable: true }
    }
  },
}

export const updateBookingNotes: ActionDefinition = {
  name: 'update_booking_notes',
  description:
    'Replace or append notes on a booking. Use for internal team-visible context (special access, gate code, customer preferences). Do not store sensitive PII.',
  parameters: {
    type: 'object',
    additionalProperties: false,
    required: ['booking_id', 'notes'],
    properties: {
      booking_id: { type: 'string', format: 'uuid' },
      notes: { type: 'string', maxLength: 1000 },
      mode: { type: 'string', enum: ['replace', 'append'] },
    },
  },
  risk: 'low',
  requiresConfirmation: false,
  validate: (raw: any) => ({
    booking_id: assertUuid(raw?.booking_id, 'booking_id'),
    notes: assertNonEmptyString(raw?.notes, 'notes', 1000),
    mode: raw?.mode === 'append' ? 'append' : 'replace',
  }),
  execute: async (p, ctx): Promise<ActionResult> => {
    const found = await loadBooking(ctx, p.booking_id)
    if (!found.ok) return { ok: false, error: found.error, recoverable: true }
    try {
      let next = p.notes as string
      if (p.mode === 'append' && found.booking.notes) {
        next = `${found.booking.notes}\n${p.notes}`
      }
      const updated = await adminUpdateBooking(p.booking_id, { notes: next } as any)
      return { ok: true, data: updated, affectedIds: [(updated as any).id] }
    } catch (err: any) {
      return { ok: false, error: err?.message || String(err), recoverable: true }
    }
  },
}

export const cancelBooking: ActionDefinition = {
  name: 'cancel_booking',
  description:
    'Cancel an existing booking. ALWAYS look up the booking first via get_customer_bookings. Provide a reason; it will be appended to the notes for the audit trail.',
  parameters: {
    type: 'object',
    additionalProperties: false,
    required: ['booking_id'],
    properties: {
      booking_id: { type: 'string', format: 'uuid' },
      reason: { type: 'string', maxLength: 500 },
    },
  },
  risk: 'high',
  requiresConfirmation: true,
  validate: (raw: any) => ({
    booking_id: assertUuid(raw?.booking_id, 'booking_id'),
    reason: typeof raw?.reason === 'string' ? raw.reason.trim().slice(0, 500) : undefined,
  }),
  execute: async (p, ctx): Promise<ActionResult> => {
    const found = await loadBooking(ctx, p.booking_id)
    if (!found.ok) return { ok: false, error: found.error, recoverable: true }
    try {
      const noteSuffix = p.reason ? `\n[cancelled by ${ctx.userEmail || 'team'}: ${p.reason}]` : ''
      const nextNotes = `${found.booking.notes ?? ''}${noteSuffix}`.trim() || null
      const updated = await adminUpdateBooking(p.booking_id, { status: 'cancelled', notes: nextNotes } as any)
      return {
        ok: true,
        data: updated,
        affectedIds: [(updated as any).id],
        message: `Booking ${(updated as any).id} cancelled`,
      }
    } catch (err: any) {
      return { ok: false, error: err?.message || String(err), recoverable: true }
    }
  },
}

export const markBookingNoShow: ActionDefinition = {
  name: 'mark_booking_no_show',
  description:
    'Mark a booking as no_show after the customer didn\'t show up at the scheduled slot. Look up the booking first.',
  parameters: {
    type: 'object',
    additionalProperties: false,
    required: ['booking_id'],
    properties: { booking_id: { type: 'string', format: 'uuid' } },
  },
  risk: 'medium',
  requiresConfirmation: true,
  validate: (raw: any) => ({ booking_id: assertUuid(raw?.booking_id, 'booking_id') }),
  execute: async (p, ctx): Promise<ActionResult> => {
    const found = await loadBooking(ctx, p.booking_id)
    if (!found.ok) return { ok: false, error: found.error, recoverable: true }
    try {
      const updated = await adminUpdateBooking(p.booking_id, { status: 'no_show' } as any)
      return { ok: true, data: updated, affectedIds: [(updated as any).id] }
    } catch (err: any) {
      return { ok: false, error: err?.message || String(err), recoverable: true }
    }
  },
}

export const markBookingCompleted: ActionDefinition = {
  name: 'mark_booking_completed',
  description:
    'Mark a booking as completed. Use when the wash is finished and the team confirms it. Look up the booking first.',
  parameters: {
    type: 'object',
    additionalProperties: false,
    required: ['booking_id'],
    properties: { booking_id: { type: 'string', format: 'uuid' } },
  },
  risk: 'medium',
  requiresConfirmation: false,
  validate: (raw: any) => ({ booking_id: assertUuid(raw?.booking_id, 'booking_id') }),
  execute: async (p, ctx): Promise<ActionResult> => {
    const found = await loadBooking(ctx, p.booking_id)
    if (!found.ok) return { ok: false, error: found.error, recoverable: true }
    try {
      const updated = await adminUpdateBooking(p.booking_id, { status: 'completed' } as any)
      return { ok: true, data: updated, affectedIds: [(updated as any).id] }
    } catch (err: any) {
      return { ok: false, error: err?.message || String(err), recoverable: true }
    }
  },
}

export const _BOOKING_STATUSES_FOR_REF = BOOKING_STATUSES
