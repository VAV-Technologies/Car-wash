import { getSupabaseAdmin } from '@/lib/supabase'
import type { ThreadMetadata } from '../slash'

export interface JohanTelegramState {
  tg_user_id: number
  display_name: string | null
  active_thread_id: string | null
  abort_run_at: string | null
  last_seen_at: string
}

const DEFAULT_METADATA: ThreadMetadata = {
  context_phone: null,
  context_lang: 'id',
  pendingConfirmedFor: null,
}

// Get or create the johan_telegram_state row for a Telegram user.
export async function getOrCreateState(
  tgUserId: number,
  displayName: string | null,
): Promise<JohanTelegramState> {
  const db = getSupabaseAdmin()

  const { data: existing } = await db
    .from('johan_telegram_state')
    .select('*')
    .eq('tg_user_id', tgUserId)
    .maybeSingle()

  if (existing) {
    // touch last_seen + display_name
    if (displayName && (existing as any).display_name !== displayName) {
      await db
        .from('johan_telegram_state')
        .update({ display_name: displayName, last_seen_at: new Date().toISOString() })
        .eq('tg_user_id', tgUserId)
    } else {
      await db
        .from('johan_telegram_state')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('tg_user_id', tgUserId)
    }
    return existing as any as JohanTelegramState
  }

  const { data: inserted } = await db
    .from('johan_telegram_state')
    .insert({ tg_user_id: tgUserId, display_name: displayName })
    .select('*')
    .single()
  return inserted as any as JohanTelegramState
}

// Get the user's currently-active thread, creating a fresh one if none exists.
export async function getOrCreateActiveThread(
  tgUserId: number,
  displayName: string | null,
): Promise<{ threadId: string; metadata: ThreadMetadata; isNew: boolean }> {
  const db = getSupabaseAdmin()
  const state = await getOrCreateState(tgUserId, displayName)

  if (state.active_thread_id) {
    const { data: thread } = await db
      .from('ai_chat_threads')
      .select('id, metadata, archived_at')
      .eq('id', state.active_thread_id)
      .maybeSingle()
    if (thread && !(thread as any).archived_at) {
      const meta = ((thread as any).metadata as ThreadMetadata) || DEFAULT_METADATA
      return {
        threadId: (thread as any).id,
        metadata: { ...DEFAULT_METADATA, ...meta },
        isNew: false,
      }
    }
  }

  // No active thread (or archived) — create a fresh one.
  const { data: created } = await db
    .from('ai_chat_threads')
    .insert({
      title: 'New chat',
      metadata: DEFAULT_METADATA,
    })
    .select('id, metadata')
    .single()

  const newId = (created as any).id as string
  await db
    .from('johan_telegram_state')
    .update({ active_thread_id: newId })
    .eq('tg_user_id', tgUserId)

  return { threadId: newId, metadata: DEFAULT_METADATA, isNew: true }
}

// /new — archive current and create a fresh active thread.
export async function startNewThread(
  tgUserId: number,
  displayName: string | null,
): Promise<{ threadId: string }> {
  const db = getSupabaseAdmin()
  const state = await getOrCreateState(tgUserId, displayName)

  if (state.active_thread_id) {
    await db
      .from('ai_chat_threads')
      .update({ archived_at: new Date().toISOString() })
      .eq('id', state.active_thread_id)
  }

  const { data: created } = await db
    .from('ai_chat_threads')
    .insert({ title: 'New chat', metadata: DEFAULT_METADATA })
    .select('id')
    .single()

  const newId = (created as any).id as string
  await db
    .from('johan_telegram_state')
    .update({ active_thread_id: newId })
    .eq('tg_user_id', tgUserId)

  return { threadId: newId }
}

// /thread <id> — switch active thread.
export async function switchThread(
  tgUserId: number,
  threadId: string,
): Promise<{ ok: boolean; error?: string }> {
  const db = getSupabaseAdmin()
  const { data: thread } = await db
    .from('ai_chat_threads')
    .select('id, archived_at')
    .eq('id', threadId)
    .maybeSingle()
  if (!thread) return { ok: false, error: 'Thread not found.' }

  // un-archive if needed
  if ((thread as any).archived_at) {
    await db
      .from('ai_chat_threads')
      .update({ archived_at: null })
      .eq('id', threadId)
  }

  await db
    .from('johan_telegram_state')
    .update({ active_thread_id: threadId })
    .eq('tg_user_id', tgUserId)

  return { ok: true }
}

// /threads — list recent threads (active + archived).
export async function listRecentThreads(limit = 20): Promise<
  Array<{ id: string; title: string | null; last_message_at: string | null; archived_at: string | null }>
> {
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('ai_chat_threads')
    .select('id, title, last_message_at, archived_at')
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .limit(limit)
  return ((data as any) || []) as Array<{
    id: string
    title: string | null
    last_message_at: string | null
    archived_at: string | null
  }>
}

// /stop — set the abort flag; runJohan checks this each token and bails.
export async function setAbortFlag(tgUserId: number): Promise<void> {
  const db = getSupabaseAdmin()
  await db
    .from('johan_telegram_state')
    .update({ abort_run_at: new Date().toISOString() })
    .eq('tg_user_id', tgUserId)
}

export async function clearAbortFlag(tgUserId: number): Promise<void> {
  const db = getSupabaseAdmin()
  await db
    .from('johan_telegram_state')
    .update({ abort_run_at: null })
    .eq('tg_user_id', tgUserId)
}

export async function isAbortRequested(tgUserId: number, since: string): Promise<boolean> {
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('johan_telegram_state')
    .select('abort_run_at')
    .eq('tg_user_id', tgUserId)
    .maybeSingle()
  const flag = (data as any)?.abort_run_at as string | null
  if (!flag) return false
  return new Date(flag).getTime() > new Date(since).getTime()
}

// Update thread metadata (e.g., from slash command metadataPatch).
export async function patchThreadMetadata(
  threadId: string,
  patch: Partial<ThreadMetadata>,
): Promise<void> {
  const db = getSupabaseAdmin()
  const { data: thread } = await db
    .from('ai_chat_threads')
    .select('metadata')
    .eq('id', threadId)
    .maybeSingle()
  const current = ((thread as any)?.metadata as ThreadMetadata) || DEFAULT_METADATA
  const next = { ...current, ...patch }
  await db.from('ai_chat_threads').update({ metadata: next }).eq('id', threadId)
}

export async function clearThreadMessages(threadId: string): Promise<void> {
  const db = getSupabaseAdmin()
  await db.from('ai_chat_messages').delete().eq('thread_id', threadId)
}

// Load message history for the LLM (chronological).
export async function loadHistory(threadId: string, limit = 200): Promise<
  Array<{ role: string; content: string; tool_calls?: any; tool_call_id?: string }>
> {
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('ai_chat_messages')
    .select('role, content, tool_calls, tool_call_id, created_at')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })
    .limit(limit)
  return ((data as any) || []) as Array<{
    role: string
    content: string
    tool_calls?: any
    tool_call_id?: string
  }>
}

export async function saveUserMessage(threadId: string, content: string): Promise<string> {
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('ai_chat_messages')
    .insert({ thread_id: threadId, role: 'user', content })
    .select('id')
    .single()
  return (data as any).id as string
}

export async function saveAssistantMessage(
  threadId: string,
  content: string,
  toolCalls: any[] = [],
): Promise<string> {
  const db = getSupabaseAdmin()
  const payload: any = { thread_id: threadId, role: 'assistant', content }
  if (toolCalls.length > 0) payload.tool_calls = toolCalls
  const { data } = await db
    .from('ai_chat_messages')
    .insert(payload)
    .select('id')
    .single()
  await db
    .from('ai_chat_threads')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', threadId)
  return (data as any).id as string
}

export async function saveToolMessages(
  threadId: string,
  results: Array<{ id: string; name: string; result: string }>,
): Promise<void> {
  const db = getSupabaseAdmin()
  if (results.length === 0) return
  const rows = results.map((r) => ({
    thread_id: threadId,
    role: 'tool',
    content: r.result,
    tool_call_id: r.id,
    tool_name: r.name,
  }))
  await db.from('ai_chat_messages').insert(rows)
}
