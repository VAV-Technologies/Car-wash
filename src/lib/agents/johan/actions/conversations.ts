import { markFollowUpComplete as adminMarkFollowUpComplete } from '@/lib/admin/conversations'
import {
  type ActionDefinition,
  type ActionResult,
  type ActionContext,
  assertUuid,
  assertEnum,
  assertNonEmptyString,
} from './_shared'

const CHANNELS = ['whatsapp', 'phone', 'instagram', 'manual'] as const
const DIRECTIONS = ['inbound', 'outbound'] as const
const MESSAGE_TYPES = [
  'general',
  'booking_request',
  'follow_up',
  'subscription_pitch',
  'complaint',
  'referral_ask',
  'reengagement',
  'receipt',
] as const
const PITCH_RESULTS = ['converted', 'declined', 'thinking'] as const

const ISO_RE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/

export const logConversation: ActionDefinition = {
  name: 'log_conversation',
  description:
    'Log a customer touchpoint that happened outside Shera (a phone call, an in-person visit, an Instagram DM, or a manual note). Creates a row in the conversations log so customer history stays complete.',
  parameters: {
    type: 'object',
    additionalProperties: false,
    required: ['customer_id', 'channel', 'direction', 'message_type', 'summary'],
    properties: {
      customer_id: { type: 'string', format: 'uuid' },
      channel: { type: 'string', enum: CHANNELS as unknown as string[] },
      direction: { type: 'string', enum: DIRECTIONS as unknown as string[] },
      message_type: { type: 'string', enum: MESSAGE_TYPES as unknown as string[] },
      summary: { type: 'string', maxLength: 1000, description: 'Stored as the conversation content' },
      follow_up_due_at: { type: 'string', description: 'ISO date or datetime; sets a follow-up reminder' },
      subscription_pitched: { type: 'boolean' },
      pitch_result: { type: 'string', enum: PITCH_RESULTS as unknown as string[] },
    },
  },
  risk: 'low',
  requiresConfirmation: false,
  validate: (raw: any) => {
    const out: any = {
      customer_id: assertUuid(raw?.customer_id, 'customer_id'),
      channel: assertEnum(raw?.channel, CHANNELS, 'channel'),
      direction: assertEnum(raw?.direction, DIRECTIONS, 'direction'),
      message_type: assertEnum(raw?.message_type, MESSAGE_TYPES, 'message_type'),
      summary: assertNonEmptyString(raw?.summary, 'summary', 1000),
    }
    if (typeof raw?.follow_up_due_at === 'string' && raw.follow_up_due_at.trim()) {
      const v = raw.follow_up_due_at.trim()
      if (!ISO_RE.test(v)) throw new Error('follow_up_due_at must be ISO date or datetime')
      out.follow_up_due_at = v
    }
    if (typeof raw?.subscription_pitched === 'boolean') out.subscription_pitched = raw.subscription_pitched
    if (raw?.pitch_result !== undefined) out.pitch_result = assertEnum(raw.pitch_result, PITCH_RESULTS, 'pitch_result')
    return out
  },
  execute: async (p, ctx): Promise<ActionResult> => {
    const { data: customer } = await ctx.supabaseAdmin
      .from('customers')
      .select('id')
      .eq('id', p.customer_id)
      .maybeSingle()
    if (!customer) return { ok: false, error: `Customer ${p.customer_id} not found`, recoverable: true }
    try {
      // Direct insert — DB column names are `content` and `subscription_pitch_result`
      const insertPayload: Record<string, unknown> = {
        customer_id: p.customer_id,
        channel: p.channel,
        direction: p.direction,
        message_type: p.message_type,
        content: p.summary,
        follow_up_due_at: p.follow_up_due_at ?? null,
        follow_up_completed: false,
        subscription_pitched: p.subscription_pitched ?? false,
      }
      if (p.pitch_result !== undefined) {
        insertPayload.subscription_pitch_result = p.pitch_result
      }

      const { data, error } = await ctx.supabaseAdmin
        .from('conversations')
        .insert(insertPayload)
        .select('id')
        .single()

      if (error) return { ok: false, error: error.message, recoverable: true }
      const id = (data as any).id as string
      return { ok: true, data, affectedIds: [id], message: 'Conversation logged' }
    } catch (err: any) {
      return { ok: false, error: err?.message || String(err), recoverable: true }
    }
  },
}

export const completeFollowUp: ActionDefinition = {
  name: 'complete_follow_up',
  description:
    'Mark a logged conversation\'s follow-up as completed (the team did the follow-up). Removes it from the pending follow-up queue.',
  parameters: {
    type: 'object',
    additionalProperties: false,
    required: ['conversation_id'],
    properties: { conversation_id: { type: 'string', format: 'uuid' } },
  },
  risk: 'low',
  requiresConfirmation: false,
  validate: (raw: any) => ({ conversation_id: assertUuid(raw?.conversation_id, 'conversation_id') }),
  execute: async (p, ctx): Promise<ActionResult> => {
    const { data: convo } = await ctx.supabaseAdmin
      .from('conversations')
      .select('id, follow_up_completed')
      .eq('id', p.conversation_id)
      .maybeSingle()
    if (!convo) return { ok: false, error: `Conversation ${p.conversation_id} not found`, recoverable: true }
    if ((convo as any).follow_up_completed) {
      return { ok: true, message: 'Follow-up was already complete', affectedIds: [p.conversation_id] }
    }
    try {
      await adminMarkFollowUpComplete(p.conversation_id)
      return { ok: true, affectedIds: [p.conversation_id], message: 'Follow-up marked complete' }
    } catch (err: any) {
      return { ok: false, error: err?.message || String(err), recoverable: true }
    }
  },
}
