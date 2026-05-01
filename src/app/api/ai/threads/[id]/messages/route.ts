import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { runJohan, parseSlashCommand, type JohanHistoryMessage, type ThreadMetadata } from '@/lib/agents/johan'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const limit = Math.min(Number(req.nextUrl.searchParams.get('limit') ?? 200), 500)
  const before = req.nextUrl.searchParams.get('before')

  let query = supabase
    .from('ai_chat_messages')
    .select('id, role, content, tool_calls, tool_call_id, tool_name, metadata, finalized_at, author_id, created_at')
    .eq('thread_id', id)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (before) query = query.lt('created_at', before)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ messages: data ?? [] })
}

function sseEncode(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: threadId } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { content?: string } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const content = (body.content || '').trim()
  if (!content) return NextResponse.json({ error: 'content required' }, { status: 400 })

  const { data: thread, error: threadErr } = await supabase
    .from('ai_chat_threads')
    .select('id, metadata')
    .eq('id', threadId)
    .maybeSingle()
  if (threadErr) return NextResponse.json({ error: threadErr.message }, { status: 500 })
  if (!thread) return NextResponse.json({ error: 'Thread not found' }, { status: 404 })

  const { data: pendingMsgs } = await supabase
    .from('ai_chat_messages')
    .select('id')
    .eq('thread_id', threadId)
    .is('finalized_at', null)
    .eq('role', 'assistant')
    .limit(1)
  if (pendingMsgs && pendingMsgs.length > 0) {
    return NextResponse.json({ error: 'A response is already streaming in this thread' }, { status: 409 })
  }

  let metadata = (thread.metadata as ThreadMetadata) || { context_phone: null, context_lang: 'id' }

  const slash = await parseSlashCommand(content, metadata, threadId)

  // Slash command: canned reply path (most slashes), exit early
  if (slash && !slash.shouldRunLLM) {
    const nowIso = new Date().toISOString()

    const { data: userRow } = await supabase
      .from('ai_chat_messages')
      .insert({
        thread_id: threadId,
        role: 'user',
        content,
        author_id: user.id,
        finalized_at: nowIso,
        metadata: slash.hideUserMessage ? { hidden: true } : null,
      })
      .select('id')
      .single()

    if (slash.shouldClearMessages) {
      await supabase.from('ai_chat_messages').delete().eq('thread_id', threadId).neq('id', userRow?.id || '')
    }

    if (slash.metadataPatch) {
      const patched = { ...metadata, ...slash.metadataPatch }
      await supabase.from('ai_chat_threads').update({ metadata: patched, last_message_at: nowIso }).eq('id', threadId)
    } else {
      await supabase.from('ai_chat_threads').update({ last_message_at: nowIso }).eq('id', threadId)
    }

    const { data: assistantRow } = await supabase
      .from('ai_chat_messages')
      .insert({
        thread_id: threadId,
        role: 'assistant',
        content: slash.replyText,
        finalized_at: nowIso,
        metadata: { source: 'slash' },
      })
      .select('id')
      .single()

    const stream = new ReadableStream({
      start(controller) {
        const enc = new TextEncoder()
        controller.enqueue(enc.encode(sseEncode('user_saved', { id: userRow?.id, hidden: !!slash.hideUserMessage })))
        if (slash.metadataPatch) {
          controller.enqueue(enc.encode(sseEncode('metadata_update', { ...metadata, ...slash.metadataPatch })))
        }
        if (slash.shouldClearMessages) {
          controller.enqueue(enc.encode(sseEncode('messages_cleared', {})))
        }
        for (const ch of slash.replyText) {
          controller.enqueue(enc.encode(sseEncode('token', { text: ch })))
        }
        controller.enqueue(
          enc.encode(sseEncode('done', { messageId: assistantRow?.id, finalContent: slash.replyText })),
        )
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    })
  }

  // Slash with shouldRunLLM (e.g. /confirm) — apply patch, then fall through to LLM flow
  let isHiddenUserMessage = false
  if (slash && slash.shouldRunLLM) {
    isHiddenUserMessage = !!slash.hideUserMessage
    if (slash.metadataPatch) {
      metadata = { ...metadata, ...slash.metadataPatch }
      await supabase
        .from('ai_chat_threads')
        .update({ metadata })
        .eq('id', threadId)
    }
  }

  const { data: existingMessages, error: histErr } = await supabase
    .from('ai_chat_messages')
    .select('role, content, tool_calls, tool_call_id, tool_name')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })
    .limit(60)
  if (histErr) return NextResponse.json({ error: histErr.message }, { status: 500 })

  const history: JohanHistoryMessage[] = (existingMessages ?? []).map((m: any) => ({
    role: m.role,
    content: m.content,
    tool_calls: m.tool_calls,
    tool_call_id: m.tool_call_id,
    tool_name: m.tool_name,
  }))

  const { data: userRow, error: userInsertErr } = await supabase
    .from('ai_chat_messages')
    .insert({
      thread_id: threadId,
      role: 'user',
      content,
      author_id: user.id,
      finalized_at: new Date().toISOString(),
      metadata: isHiddenUserMessage ? { hidden: true } : null,
    })
    .select('id')
    .single()
  if (userInsertErr) return NextResponse.json({ error: userInsertErr.message }, { status: 500 })

  const { data: assistantRow, error: assistantInsertErr } = await supabase
    .from('ai_chat_messages')
    .insert({
      thread_id: threadId,
      role: 'assistant',
      content: '',
    })
    .select('id')
    .single()
  if (assistantInsertErr) return NextResponse.json({ error: assistantInsertErr.message }, { status: 500 })

  const assistantMessageId = assistantRow.id
  const userEmail = user.email ?? null

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder()
      const send = (event: string, data: unknown) => controller.enqueue(enc.encode(sseEncode(event, data)))

      send('user_saved', { id: userRow?.id, hidden: isHiddenUserMessage })
      send('assistant_id', { id: assistantMessageId })

      let accumulated = ''
      let lastWrite = 0
      const recordedToolCalls: Array<{ id: string; name: string; arguments: string }> = []
      const toolNameById: Record<string, string> = {}

      const flushAssistant = async (final: boolean) => {
        try {
          await supabase
            .from('ai_chat_messages')
            .update({
              content: accumulated,
              tool_calls: recordedToolCalls.length > 0 ? recordedToolCalls : null,
              ...(final ? { finalized_at: new Date().toISOString() } : {}),
            })
            .eq('id', assistantMessageId)
        } catch {}
      }

      const abortController = new AbortController()
      req.signal.addEventListener('abort', () => abortController.abort())

      try {
        for await (const ev of runJohan({
          history,
          userMessage: content,
          metadata,
          userId: user.id,
          userEmail,
          threadId,
          assistantMessageId,
          abortSignal: abortController.signal,
        })) {
          switch (ev.type) {
            case 'token': {
              accumulated += ev.text
              send('token', { text: ev.text })
              const now = Date.now()
              if (now - lastWrite > 250) {
                lastWrite = now
                flushAssistant(false)
              }
              break
            }
            case 'tool_call_start':
              toolNameById[ev.id] = ev.name
              send('tool_call_start', { id: ev.id, name: ev.name })
              break
            case 'tool_call_done':
              recordedToolCalls.push({ id: ev.id, name: ev.name, arguments: ev.arguments })
              toolNameById[ev.id] = ev.name
              send('tool_call_done', { id: ev.id, name: ev.name, arguments: ev.arguments })
              break
            case 'tool_result': {
              send('tool_result', { id: ev.id, name: ev.name, ms: ev.ms })
              try {
                await supabase.from('ai_chat_messages').insert({
                  thread_id: threadId,
                  role: 'tool',
                  content: ev.result,
                  tool_call_id: ev.id,
                  tool_name: ev.name,
                  finalized_at: new Date().toISOString(),
                  metadata: { ms: ev.ms },
                })
              } catch {}

              // Translate tool results into high-level action SSE events for the UI
              try {
                const parsed = JSON.parse(ev.result)
                if (ev.name === 'propose_action' && parsed?.ok && parsed?.pending_id) {
                  // We need the staged tool details — read back from the DB by id
                  const { data: pendingRow } = await supabase
                    .from('ai_pending_actions')
                    .select('id, tool_name, params, human_summary')
                    .eq('id', parsed.pending_id)
                    .maybeSingle()
                  if (pendingRow) {
                    send('action_proposed', {
                      pendingId: (pendingRow as any).id,
                      toolName: (pendingRow as any).tool_name,
                      humanSummary: (pendingRow as any).human_summary,
                      params: (pendingRow as any).params,
                      assistantMessageId,
                    })
                  }
                } else if (parsed?.ok === true && Array.isArray(parsed?.affectedIds) && ev.name !== 'propose_action') {
                  send('action_executed', {
                    actionLogId: parsed._audit_id ?? null,
                    toolName: ev.name,
                    affectedIds: parsed.affectedIds,
                    success: true,
                    assistantMessageId,
                  })
                } else if (parsed?.ok === false && ev.name !== 'propose_action') {
                  send('action_executed', {
                    actionLogId: parsed._audit_id ?? null,
                    toolName: ev.name,
                    affectedIds: [],
                    success: false,
                    assistantMessageId,
                  })
                }
              } catch {}
              break
            }
            case 'assistant_message': {
              if (ev.content) accumulated = ev.content
              break
            }
            case 'done': {
              if (ev.finalContent) accumulated = ev.finalContent
              await flushAssistant(true)

              // Clear pendingConfirmedFor from thread metadata after the action turn settles
              if (metadata.pendingConfirmedFor) {
                try {
                  const cleared = { ...metadata, pendingConfirmedFor: null }
                  await supabase
                    .from('ai_chat_threads')
                    .update({ metadata: cleared, last_message_at: new Date().toISOString() })
                    .eq('id', threadId)
                } catch {}
              } else {
                await supabase
                  .from('ai_chat_threads')
                  .update({ last_message_at: new Date().toISOString() })
                  .eq('id', threadId)
              }
              send('done', { messageId: assistantMessageId, finalContent: accumulated })
              break
            }
            case 'error': {
              accumulated = accumulated || `Error: ${ev.message}`
              await flushAssistant(true)
              send('error', { message: ev.message })
              break
            }
          }
        }
      } catch (err: any) {
        send('error', { message: err?.message || String(err) })
        await flushAssistant(true)
      } finally {
        controller.close()
      }
    },
    cancel() {
      // Client disconnect handled via req.signal
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
