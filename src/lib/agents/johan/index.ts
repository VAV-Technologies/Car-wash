import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'
import { PROMPT_IDENTITY, PROMPT_BUSINESS } from '../shera'
import { CASTUDIO_KNOWLEDGE } from '../castudio-knowledge'
import { getSupabaseAdmin } from '@/lib/supabase'
import { JOHAN_PERSONA, JOHAN_MODES, JOHAN_VOICE_HEADER } from './prompt'
import { getJohanTools, executeJohanTool } from './tools'
import { loadAgentKnowledge } from './knowledge'
import { getJohanSettings, getJohanOpenAIClient } from './settings'
import type { ThreadMetadata } from './slash'
import type { ActionContext } from './actions/_shared'

export type { ThreadMetadata } from './slash'
export { parseSlashCommand } from './slash'

const MAX_TOOL_ITERATIONS = 5
const STREAM_TIMEOUT_MS = 90_000

export interface JohanHistoryMessage {
  role: 'user' | 'assistant' | 'tool' | 'system'
  content: string
  tool_calls?: Array<{ id: string; type: 'function'; function: { name: string; arguments: string } }>
  tool_call_id?: string
  tool_name?: string
}

export interface JohanRunInput {
  history: JohanHistoryMessage[]
  userMessage: string
  metadata: ThreadMetadata
  userId: string
  userEmail: string | null
  threadId: string
  assistantMessageId: string
  abortSignal?: AbortSignal
}

export type JohanStreamEvent =
  | { type: 'token'; text: string }
  | { type: 'tool_call_start'; id: string; name: string }
  | { type: 'tool_call_args'; id: string; argumentsDelta: string }
  | { type: 'tool_call_done'; id: string; name: string; arguments: string }
  | { type: 'tool_result'; id: string; name: string; result: string; ms: number }
  | { type: 'assistant_message'; content: string; tool_calls: Array<{ id: string; name: string; arguments: string }> }
  | { type: 'done'; finalContent: string }
  | { type: 'error'; message: string }

function formatJakartaTime(): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(new Date())
}

async function loadPendingConfirmation(pendingId: string) {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('ai_pending_actions')
    .select('id, tool_name, params, human_summary, status')
    .eq('id', pendingId)
    .maybeSingle()
  return data as any
}

async function buildSystemPrompt(metadata: ThreadMetadata): Promise<string> {
  const settings = await getJohanSettings()
  const knowledgeBlock = await loadAgentKnowledge()

  const basePrompt = settings.systemPrompt
    ? settings.systemPrompt
    : [
        JOHAN_PERSONA,
        JOHAN_MODES,
        JOHAN_VOICE_HEADER,
        PROMPT_IDENTITY,
        PROMPT_BUSINESS,
        CASTUDIO_KNOWLEDGE,
        knowledgeBlock,
      ].join('\n')

  const dynamicLines = [
    '',
    '═══════════════ REAL-TIME CONTEXT ═══════════════',
    `Now (Jakarta): ${formatJakartaTime()}`,
    `Locked customer: ${metadata.context_phone ?? 'none'}`,
    `Preferred draft language: ${metadata.context_lang}`,
    metadata.context_phone
      ? `(Tip: call get_conversation_history({ phone: "${metadata.context_phone}" }) before drafting so you know what they last said.)`
      : '',
  ]

  if (metadata.pendingConfirmedFor) {
    const pending = await loadPendingConfirmation(metadata.pendingConfirmedFor)
    if (pending && pending.status === 'confirmed') {
      dynamicLines.push(
        '',
        '═══════════════ PENDING ACTION CONFIRMED ═══════════════',
        `The team just clicked Yes on pending action ${pending.id}.`,
        `Staged tool: ${pending.tool_name}`,
        `Params: ${JSON.stringify(pending.params)}`,
        `Human summary: ${pending.human_summary}`,
        '',
        `You MUST call ${pending.tool_name} now with EXACTLY those params. Do not propose again. After it succeeds, write a one-line confirmation citing the affected ID(s).`,
      )
    }
  }

  return basePrompt + '\n' + dynamicLines.filter(Boolean).join('\n')
}

function historyToOpenAI(history: JohanHistoryMessage[]): ChatCompletionMessageParam[] {
  return history.map((m): ChatCompletionMessageParam => {
    if (m.role === 'tool') {
      return {
        role: 'tool',
        tool_call_id: m.tool_call_id || '',
        content: m.content,
      }
    }
    if (m.role === 'assistant') {
      const base: any = { role: 'assistant', content: m.content || null }
      if (m.tool_calls && m.tool_calls.length > 0) base.tool_calls = m.tool_calls
      return base
    }
    if (m.role === 'system') {
      return { role: 'system', content: m.content }
    }
    return { role: 'user', content: m.content }
  })
}

interface ToolCallAccumulator {
  id: string
  name: string
  arguments: string
}

export async function* runJohan(input: JohanRunInput): AsyncGenerator<JohanStreamEvent> {
  const { history, userMessage, metadata, abortSignal } = input

  const ctx: ActionContext = {
    userId: input.userId,
    userEmail: input.userEmail,
    threadId: input.threadId,
    assistantMessageId: input.assistantMessageId,
    supabaseAdmin: getSupabaseAdmin(),
  }

  try {
    const settings = await getJohanSettings()
    const openai = await getJohanOpenAIClient()
    const systemPrompt = await buildSystemPrompt(metadata)
    const tools = getJohanTools()

    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...historyToOpenAI(history),
      { role: 'user', content: userMessage },
    ]

    let finalContent = ''

    for (let iter = 0; iter < MAX_TOOL_ITERATIONS; iter++) {
      if (abortSignal?.aborted) {
        yield { type: 'done', finalContent }
        return
      }

      const stream = await openai.chat.completions.create(
        {
          model: settings.model,
          max_completion_tokens: settings.maxTokens,
          tools,
          messages,
          stream: true,
        },
        { timeout: STREAM_TIMEOUT_MS, signal: abortSignal },
      )

      let assistantContent = ''
      const toolCalls = new Map<number, ToolCallAccumulator>()
      const startedToolCallIds = new Set<string>()
      let finishReason: string | null = null

      for await (const chunk of stream) {
        if (abortSignal?.aborted) break
        const delta = chunk.choices[0]?.delta
        if (!delta) continue

        if (delta.content) {
          assistantContent += delta.content
          yield { type: 'token', text: delta.content }
        }

        if (delta.tool_calls) {
          for (const tcDelta of delta.tool_calls) {
            const idx = tcDelta.index
            if (typeof idx !== 'number') continue
            let acc = toolCalls.get(idx)
            if (!acc) {
              acc = { id: tcDelta.id || '', name: '', arguments: '' }
              toolCalls.set(idx, acc)
            }
            if (tcDelta.id && !acc.id) acc.id = tcDelta.id
            if (tcDelta.function?.name) acc.name += tcDelta.function.name
            if (tcDelta.function?.arguments) acc.arguments += tcDelta.function.arguments

            if (acc.id && acc.name && !startedToolCallIds.has(acc.id)) {
              startedToolCallIds.add(acc.id)
              yield { type: 'tool_call_start', id: acc.id, name: acc.name }
            }
            if (tcDelta.function?.arguments && acc.id) {
              yield { type: 'tool_call_args', id: acc.id, argumentsDelta: tcDelta.function.arguments }
            }
          }
        }

        if (chunk.choices[0]?.finish_reason) {
          finishReason = chunk.choices[0].finish_reason
        }
      }

      if (abortSignal?.aborted) {
        yield { type: 'done', finalContent: finalContent + assistantContent }
        return
      }

      finalContent = assistantContent

      if (finishReason === 'tool_calls' && toolCalls.size > 0) {
        const sortedCalls = [...toolCalls.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => v)

        for (const tc of sortedCalls) {
          yield { type: 'tool_call_done', id: tc.id, name: tc.name, arguments: tc.arguments }
        }

        yield {
          type: 'assistant_message',
          content: assistantContent,
          tool_calls: sortedCalls.map((tc) => ({ id: tc.id, name: tc.name, arguments: tc.arguments })),
        }

        messages.push({
          role: 'assistant',
          content: assistantContent || null,
          tool_calls: sortedCalls.map((tc) => ({
            id: tc.id,
            type: 'function' as const,
            function: { name: tc.name, arguments: tc.arguments },
          })),
        } as any)

        const toolResults = await Promise.all(
          sortedCalls.map(async (tc) => {
            const start = Date.now()
            let parsed: Record<string, unknown> = {}
            try {
              parsed = JSON.parse(tc.arguments || '{}')
            } catch {}
            let result: string
            try {
              result = await executeJohanTool(tc.name, parsed, ctx)
            } catch (err: any) {
              result = JSON.stringify({ ok: false, error: String(err?.message || err) })
            }
            return { id: tc.id, name: tc.name, result, ms: Date.now() - start }
          }),
        )

        for (const tr of toolResults) {
          yield { type: 'tool_result', id: tr.id, name: tr.name, result: tr.result, ms: tr.ms }
          messages.push({
            role: 'tool',
            tool_call_id: tr.id,
            content: tr.result,
          })
        }
        continue
      }

      let cleaned = assistantContent.trim()
      cleaned = cleaned
        .replace(/^(here(?:'s| is)|berikut|draftnya?:?)\s*[:\-]\s*/i, '')
        .replace(/^["']|["']$/g, '')
        .trim()
      finalContent = cleaned || 'Aku belum kebayang draftnya — kasih konteks lebih?'
      yield { type: 'done', finalContent }
      return
    }

    yield { type: 'done', finalContent: finalContent || 'Tool loop hit max iterations.' }
  } catch (err: any) {
    if (abortSignal?.aborted) {
      yield { type: 'done', finalContent: '' }
      return
    }
    yield { type: 'error', message: err?.message || String(err) }
  }
}
