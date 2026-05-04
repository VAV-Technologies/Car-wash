import { getSupabaseAdmin } from '@/lib/supabase'
import type { ActionContext } from './actions/_shared'
import { getAction } from './actions'

export interface PendingAction {
  id: string
  thread_id: string
  user_id: string | null
  tool_name: string
  params: Record<string, unknown>
  human_summary: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'executed' | 'expired'
  expires_at: string
  created_at: string
  resolved_at: string | null
}

interface StageInput {
  tool_name?: unknown
  params?: unknown
  human_summary?: unknown
}

export async function stagePendingAction(input: StageInput, ctx: ActionContext): Promise<string> {
  const toolName = String(input.tool_name || '').trim()
  const params = (input.params && typeof input.params === 'object') ? input.params as Record<string, unknown> : {}
  const humanSummary = String(input.human_summary || '').trim()

  if (!toolName) {
    return JSON.stringify({ ok: false, error: 'propose_action requires tool_name', recoverable: true })
  }
  if (!humanSummary) {
    return JSON.stringify({ ok: false, error: 'propose_action requires human_summary', recoverable: true })
  }
  const action = getAction(toolName)
  if (!action) {
    return JSON.stringify({ ok: false, error: `Unknown tool to propose: ${toolName}`, recoverable: true })
  }
  if (!action.requiresConfirmation) {
    return JSON.stringify({
      ok: false,
      error: `Tool ${toolName} does not require confirmation; call it directly.`,
      recoverable: true,
    })
  }

  const { data, error } = await ctx.supabaseAdmin
    .from('ai_pending_actions')
    .insert({
      thread_id: ctx.threadId,
      message_id: ctx.assistantMessageId,
      user_id: ctx.userId,
      tool_name: toolName,
      params,
      human_summary: humanSummary,
    })
    .select('id, expires_at')
    .single()

  if (error) {
    return JSON.stringify({ ok: false, error: `Failed to stage action: ${error.message}`, recoverable: false })
  }

  return JSON.stringify({
    ok: true,
    pending_id: (data as any).id,
    status: 'awaiting_confirmation',
    expires_at: (data as any).expires_at,
    message: `Proposed. Wait for the team to click Yes/No. Don't call ${toolName} directly until you receive a system confirmation note.`,
  })
}

export async function loadPending(
  pendingId: string,
  threadId?: string,
): Promise<PendingAction | null> {
  // threadId is optional — when omitted (e.g., a group Confirm tap from a
  // different user than the proposer), look up by id only.
  const supabase = getSupabaseAdmin()
  let q = supabase.from('ai_pending_actions').select('*').eq('id', pendingId)
  if (threadId) q = q.eq('thread_id', threadId)
  const { data } = await q.maybeSingle()
  if (!data) return null
  const row = data as any as PendingAction
  if (new Date(row.expires_at).getTime() < Date.now()) {
    return { ...row, status: 'expired' as const }
  }
  return row
}

export async function markPendingStatus(
  pendingId: string,
  status: 'confirmed' | 'cancelled' | 'executed',
): Promise<void> {
  const supabase = getSupabaseAdmin()
  await supabase
    .from('ai_pending_actions')
    .update({ status, resolved_at: new Date().toISOString() })
    .eq('id', pendingId)
}

export async function loadConfirmedAction(
  toolName: string,
  threadId: string,
): Promise<PendingAction | null> {
  const supabase = getSupabaseAdmin()
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
  const { data } = await supabase
    .from('ai_pending_actions')
    .select('*')
    .eq('thread_id', threadId)
    .eq('tool_name', toolName)
    .eq('status', 'confirmed')
    .gte('resolved_at', fiveMinAgo)
    .order('resolved_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return (data as any) ?? null
}
