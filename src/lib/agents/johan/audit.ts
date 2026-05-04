import type { ActionContext, ActionResult } from './actions/_shared'

export async function logActionStart(
  toolName: string,
  params: unknown,
  ctx: ActionContext,
): Promise<string> {
  const corePayload = {
    thread_id: ctx.threadId,
    user_email: ctx.userEmail,
    tool_name: toolName,
    params: params ?? {},
    idempotency_key: ctx.assistantMessageId,
    tg_user_id: ctx.tgUserId ?? null,
  }

  // Insert is FK-sensitive: message_id → ai_chat_messages, user_id → auth.users.
  // In production both always resolve. In tests / odd edge cases either may not.
  // Audit logging is defence-in-depth; we never want it to block the action itself.
  // Retry ladder progressively drops the FK columns on insertion failure.
  const attempts: Record<string, unknown>[] = [
    { ...corePayload, message_id: ctx.assistantMessageId, user_id: ctx.userId },
    { ...corePayload, user_id: ctx.userId },
    { ...corePayload, message_id: ctx.assistantMessageId },
    corePayload,
  ]

  for (const payload of attempts) {
    const { data, error } = await ctx.supabaseAdmin
      .from('ai_action_log')
      .insert(payload)
      .select('id')
      .single()
    if (!error) return (data as any).id as string
  }

  return 'unlogged'
}

export async function logActionResult(
  auditId: string,
  result: ActionResult,
  ctx: ActionContext,
  durationMs: number,
): Promise<void> {
  if (auditId === 'unlogged') return
  await ctx.supabaseAdmin
    .from('ai_action_log')
    .update({
      result: result as any,
      success: result.ok,
      error: result.error ?? null,
      affected_ids: result.affectedIds ?? [],
      duration_ms: durationMs,
      finalized_at: new Date().toISOString(),
    })
    .eq('id', auditId)
}

export async function findIdempotentResult(
  toolName: string,
  ctx: ActionContext,
): Promise<ActionResult | null> {
  const { data } = await ctx.supabaseAdmin
    .from('ai_action_log')
    .select('result')
    .eq('tool_name', toolName)
    .eq('idempotency_key', ctx.assistantMessageId)
    .eq('success', true)
    .maybeSingle()
  if (!data) return null
  return (data as any).result as ActionResult
}
