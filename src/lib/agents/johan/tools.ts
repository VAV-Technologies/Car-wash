import type { ChatCompletionTool } from 'openai/resources/chat/completions'
import { getSupabaseAdmin } from '@/lib/supabase'
import { SHERA_TOOLS, executeSheraTool } from '../shera'
import { getAction, getActionToolSpecs } from './actions'
import { stagePendingAction, loadConfirmedAction, markPendingStatus } from './confirmations'
import { logActionStart, logActionResult, findIdempotentResult } from './audit'
import type { ActionContext } from './actions/_shared'

const READ_ONLY_TOOL_NAMES = new Set([
  'search_customer',
  'get_customer_bookings',
  'check_date_availability',
  'get_completed_jobs',
])

const READ_TOOL_SPECS: ChatCompletionTool[] = [
  ...SHERA_TOOLS.filter((t) => t.type === 'function' && READ_ONLY_TOOL_NAMES.has(t.function.name)),
  {
    type: 'function',
    function: {
      name: 'get_conversation_history',
      description:
        "Read the recent WhatsApp conversation history with a specific customer. Use this BEFORE drafting any reply when the team mentions a customer phone number, so you understand the open thread.",
      parameters: {
        type: 'object',
        properties: {
          phone: { type: 'string', description: 'Customer phone number, digits only or with country code' },
          limit: { type: 'number', description: 'Max messages to return (default 20)' },
        },
        required: ['phone'],
      },
    },
  },
]

export function getJohanTools(): ChatCompletionTool[] {
  return [...READ_TOOL_SPECS, ...getActionToolSpecs()]
}

// Legacy export — kept for any imports that haven't migrated to getJohanTools()
export const JOHAN_TOOLS: ChatCompletionTool[] = READ_TOOL_SPECS

async function getConversationHistory(input: Record<string, unknown>): Promise<string> {
  const supabase = getSupabaseAdmin()
  const phoneInput = String(input.phone || '').replace(/\D/g, '')
  const limit = Number(input.limit ?? 20)
  if (!phoneInput) return JSON.stringify({ error: 'phone required' })

  const { data } = await supabase
    .from('whatsapp_conversations')
    .select('chat_id, phone, messages, last_message_at')
    .or(`chat_id.ilike.%${phoneInput}%,phone.ilike.%${phoneInput}%`)
    .order('last_message_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!data) return JSON.stringify({ found: false, phone: phoneInput })
  const all = Array.isArray(data.messages) ? data.messages : []
  const tail = all.slice(-limit).map((m: any) => ({
    role: m.role,
    content: String(m.content || '').slice(0, 800),
    timestamp: m.timestamp,
  }))
  return JSON.stringify({
    found: true,
    chat_id: data.chat_id,
    phone: data.phone,
    total_messages: all.length,
    messages: tail,
  })
}

export async function executeJohanTool(
  name: string,
  input: Record<string, unknown>,
  ctx?: ActionContext,
): Promise<string> {
  // Read-only tools — work even without ctx
  if (READ_ONLY_TOOL_NAMES.has(name)) {
    return executeSheraTool(name, input, undefined, undefined)
  }
  if (name === 'get_conversation_history') {
    return getConversationHistory(input)
  }

  // All write paths require ctx
  if (!ctx) {
    return JSON.stringify({
      ok: false,
      error: `Tool ${name} requires action context (writes disabled)`,
      recoverable: false,
    })
  }

  // Confirmation staging
  if (name === 'propose_action') {
    return stagePendingAction(input as any, ctx)
  }

  // Real action dispatch
  const action = getAction(name)
  if (!action) {
    return JSON.stringify({ ok: false, error: `Unknown tool: ${name}`, recoverable: false })
  }

  // Confirmation gate: destructive actions require a confirmed pending row
  if (action.requiresConfirmation) {
    const confirmed = await loadConfirmedAction(name, ctx.threadId)
    if (!confirmed) {
      return JSON.stringify({
        ok: false,
        error: `${name} requires user confirmation. Call propose_action first with a clear human_summary, wait for the user to click Yes.`,
        recoverable: true,
      })
    }
    // Mark as executed so it can't be reused
    markPendingStatus(confirmed.id, 'executed').catch(() => {})
  }

  // Idempotency replay for create_* tools
  if (name.startsWith('create_')) {
    const replay = await findIdempotentResult(name, ctx)
    if (replay) return JSON.stringify(replay)
  }

  const auditId = await logActionStart(name, input, ctx)
  const start = Date.now()
  try {
    const params = action.validate(input)
    const result = await action.execute(params, ctx)
    await logActionResult(auditId, result, ctx, Date.now() - start)
    return JSON.stringify({ ...result, _audit_id: auditId })
  } catch (err: any) {
    const result = { ok: false, error: String(err?.message || err), recoverable: false }
    await logActionResult(auditId, result, ctx, Date.now() - start)
    return JSON.stringify({ ...result, _audit_id: auditId })
  }
}
