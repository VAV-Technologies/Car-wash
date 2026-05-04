import {
  sendMessage,
  editMessageText,
  answerCallbackQuery,
  sendChatAction,
} from './bot-client'
import { runJohan, type JohanHistoryMessage } from '../index'
import { parseSlashCommand, type ThreadMetadata } from '../slash'
import { loadPending, markPendingStatus } from '../confirmations'
import { getSupabaseAdmin } from '@/lib/supabase'

import {
  getOrCreateActiveThread,
  startNewThread,
  switchThread,
  listRecentThreads,
  setAbortFlag,
  clearAbortFlag,
  isAbortRequested,
  patchThreadMetadata,
  clearThreadMessages,
  loadHistory,
  saveUserMessage,
  saveAssistantMessage,
  saveToolMessages,
} from './thread-router'
import { EditStreamer } from './stream'
import { markdownToTelegramHtml, truncateForTelegram } from './markdown'
import { buildConfirmKeyboard, buildConfirmCardText, parseCallbackData } from './confirm-ui'
import { buildThreadsKeyboard, buildThreadsHeader } from './threads-ui'

interface TelegramUser {
  id: number
  first_name?: string
  last_name?: string
  username?: string
}

interface TelegramChat {
  id: number
  type: 'private' | 'group' | 'supergroup' | 'channel'
}

interface IncomingMessage {
  message_id: number
  from?: TelegramUser
  chat: TelegramChat
  text?: string
  date: number
  reply_to_message?: { from?: TelegramUser }
}

const BOT_USERNAME = process.env.JOHAN_TELEGRAM_BOT_USERNAME || 'Johan_Castudio_Bot'

function isAddressedToBot(msg: IncomingMessage): boolean {
  const text = msg.text || ''
  // Slash commands always address the bot (Telegram's `/cmd@username` form
  // also passes since text.startsWith('/') is true)
  if (text.startsWith('/')) return true
  // Plain @mention anywhere in the text. Case-insensitive — Telegram
  // usernames are case-insensitive and clients may pass through whatever
  // the user typed.
  if (text.toLowerCase().includes(`@${BOT_USERNAME.toLowerCase()}`)) return true
  // Reply to one of the bot's prior messages.
  const replyUsername = msg.reply_to_message?.from?.username || ''
  if (replyUsername.toLowerCase() === BOT_USERNAME.toLowerCase()) return true
  return false
}

function stripBotMention(text: string): string {
  // Remove `@BotUsername` tokens (with optional trailing whitespace) so
  // the agent sees the question without the routing prefix. Case-insensitive.
  const re = new RegExp(`@${BOT_USERNAME}\\b\\s?`, 'gi')
  return text.replace(re, '').trim()
}

interface IncomingCallback {
  id: string
  from: TelegramUser
  message?: IncomingMessage
  data?: string
}

export interface TelegramUpdate {
  update_id: number
  message?: IncomingMessage
  callback_query?: IncomingCallback
}

function displayNameOf(user: TelegramUser | undefined): string | null {
  if (!user) return null
  if (user.username) return `@${user.username}`
  if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`
  return user.first_name || null
}

export async function handleMessage(update: TelegramUpdate): Promise<void> {
  const msg = update.message
  if (!msg || !msg.from) return

  // Channel rejection (broadcast channels — bots don't belong)
  if (msg.chat.type === 'channel') return

  // Group addressing rule: only act in groups when the message is for the
  // bot (slash command, @mention, or reply to one of our messages).
  // DMs always pass through.
  const isGroup = msg.chat.type === 'group' || msg.chat.type === 'supergroup'
  if (isGroup && !isAddressedToBot(msg)) return

  if (!msg.text) {
    // No-text messages (stickers, photos, etc.) — politely decline
    await sendMessage(msg.chat.id, '<i>Johan only handles text right now. Send a message or a slash command.</i>')
    return
  }

  const tgUserId = msg.from.id
  const displayName = displayNameOf(msg.from)
  // Strip the @BotUsername token from group messages so the agent sees a
  // clean question. DMs pass through unchanged.
  const text = isGroup ? stripBotMention(msg.text.trim()) : msg.text.trim()

  // Get or create the user's active thread + state.
  await clearAbortFlag(tgUserId)
  const { threadId, metadata } = await getOrCreateActiveThread(tgUserId, displayName)

  // ── Telegram-specific commands first ──
  if (text.startsWith('/')) {
    const handled = await handleTelegramSpecificCommand(
      text,
      tgUserId,
      displayName,
      threadId,
      msg.chat.id,
    )
    if (handled) return

    // Existing slash commands (defined in src/lib/agents/johan/slash.ts).
    const slash = await parseSlashCommand(text, metadata, threadId)
    if (slash) {
      if (slash.metadataPatch) {
        await patchThreadMetadata(threadId, slash.metadataPatch)
      }
      if (slash.shouldClearMessages) {
        await clearThreadMessages(threadId)
      }
      if (slash.replyText) {
        await sendMessage(
          msg.chat.id,
          markdownToTelegramHtml(slash.replyText),
          undefined,
          'HTML',
        )
      }
      if (!slash.shouldRunLLM) return
      // Slash command requested LLM run (e.g. /confirm) — fall through with
      // the patched metadata. Reload it.
      const refreshed = await getOrCreateActiveThread(tgUserId, displayName)
      await runWithStreamer(
        msg.chat.id,
        tgUserId,
        displayName,
        threadId,
        refreshed.metadata,
        '', // /confirm doesn't have a user-visible message
        true,
      )
      return
    }
  }

  // ── Plain user message → save + run Johan ──
  await saveUserMessage(threadId, text)

  await runWithStreamer(
    msg.chat.id,
    tgUserId,
    displayName,
    threadId,
    metadata,
    text,
    false,
  )
}

async function handleTelegramSpecificCommand(
  text: string,
  tgUserId: number,
  displayName: string | null,
  threadId: string,
  chatId: number,
): Promise<boolean> {
  const [cmdRaw, ...rest] = text.split(/\s+/)
  const cmd = cmdRaw.toLowerCase().split('@')[0] // strip @bot suffix if present
  const arg = rest.join(' ').trim()

  switch (cmd) {
    case '/start': {
      const stateThread = await getOrCreateActiveThread(tgUserId, displayName)
      const db = getSupabaseAdmin()
      const { data: thread } = await db
        .from('ai_chat_threads')
        .select('title')
        .eq('id', stateThread.threadId)
        .maybeSingle()
      const title = (thread as any)?.title || 'New chat'
      const lines = [
        `<b>Johan is awake.</b>`,
        `Authorized as ${displayName ? escapeHtml(displayName) : `tg-${tgUserId}`}.`,
        `Active thread: <i>${escapeHtml(title)}</i>`,
        '',
        'Just type to chat. Use /help for the command list.',
      ]
      await sendMessage(chatId, lines.join('\n'))
      return true
    }
    case '/new': {
      await startNewThread(tgUserId, displayName)
      await sendMessage(chatId, '🆕 New thread started.')
      return true
    }
    case '/threads': {
      const threads = await listRecentThreads(20)
      const header = buildThreadsHeader(threads)
      const keyboard =
        threads.length > 0 ? buildThreadsKeyboard(threads) : undefined
      await sendMessage(chatId, escapeHtml(header), keyboard)
      return true
    }
    case '/thread': {
      if (!arg) {
        await sendMessage(chatId, 'Usage: <code>/thread &lt;thread_id&gt;</code>')
        return true
      }
      const result = await switchThread(tgUserId, arg)
      if (!result.ok) {
        await sendMessage(chatId, `Couldn't switch: ${escapeHtml(result.error || 'unknown')}`)
        return true
      }
      await sendMessage(chatId, `Switched to thread <code>${escapeHtml(arg.slice(0, 12))}…</code>`)
      return true
    }
    case '/audit': {
      const db = getSupabaseAdmin()
      const { data } = await db
        .from('ai_action_log')
        .select('tool_name, success, error, duration_ms, created_at')
        .order('created_at', { ascending: false })
        .limit(10)
      const rows = ((data as any) || []) as Array<{
        tool_name: string
        success: boolean | null
        error: string | null
        duration_ms: number | null
        created_at: string
      }>
      if (rows.length === 0) {
        await sendMessage(chatId, '<i>No actions logged yet.</i>')
        return true
      }
      const lines = ['<b>Last 10 actions:</b>']
      for (const r of rows) {
        const when = new Date(r.created_at).toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
        })
        const icon = r.success === true ? '✓' : r.success === false ? '✗' : '·'
        const tail = r.error ? ` — ${escapeHtml(r.error.slice(0, 60))}` : ''
        const dur = r.duration_ms ? ` (${r.duration_ms}ms)` : ''
        lines.push(`${icon} <code>${escapeHtml(r.tool_name)}</code> · ${when}${dur}${tail}`)
      }
      await sendMessage(chatId, lines.join('\n'))
      return true
    }
    case '/stop': {
      await setAbortFlag(tgUserId)
      await sendMessage(chatId, '🛑 Stopping current run.')
      return true
    }
    case '/help': {
      const lines = [
        '<b>Johan — three modes:</b>',
        '• <b>DRAFT</b>: I write a customer-ready reply in Shera\'s voice. Triggers: "balas dia", "draft a reply", customer locked.',
        '• <b>REFERENCE</b>: I answer biz questions for you. Triggers: "what is", "how much", "do we serve".',
        '• <b>ACTION</b>: I do things in the system. Triggers: create / reschedule / cancel / mark / change. Destructive actions show Confirm/Cancel buttons.',
        '',
        '<b>Slash commands:</b>',
        '/customer 628xxx — lock onto a customer',
        '/clear-context — unlock customer',
        '/lang id|en — set draft language',
        '/whoami — show current lock + lang',
        '/reset — clear messages in this thread',
        '/new — start a fresh thread',
        '/threads — list recent threads',
        '/thread &lt;id&gt; — switch to a thread',
        '/audit — show last 10 actions',
        '/stop — abort current run',
        '/start — boot status',
        '',
        '<i>Works in DMs (every message) and groups (when you address me: slash command, @mention, or reply to one of my messages). Per-user state stays independent — your locks and threads are yours alone.</i>',
      ]
      await sendMessage(chatId, lines.join('\n'))
      return true
    }
    default:
      return false // not a Telegram-specific command, let parseSlashCommand try
  }
}

async function runWithStreamer(
  chatId: number,
  tgUserId: number,
  displayName: string | null,
  threadId: string,
  metadata: ThreadMetadata,
  userMessage: string,
  hideUserMessage: boolean,
): Promise<void> {
  // Send placeholder we'll edit as tokens arrive.
  const placeholder = await sendMessage(chatId, '…')
  const streamer = new EditStreamer(chatId, placeholder.message_id)

  // Build the assistant-message ID upfront so audit-log idempotency works.
  const db = getSupabaseAdmin()
  const { data: assistantRow } = await db
    .from('ai_chat_messages')
    .insert({ thread_id: threadId, role: 'assistant', content: '' })
    .select('id')
    .single()
  const assistantMessageId = (assistantRow as any).id as string

  const history = (await loadHistory(threadId, 200))
    // Drop the just-inserted empty assistant row from history so the LLM
    // doesn't see itself with empty content.
    .filter((m) => !(m.role === 'assistant' && (!m.content || m.content === '')))

  // Per-token abort check: poll the abort flag periodically by signaling the
  // generator's AbortController.
  const abortCtl = new AbortController()
  const startedAt = new Date().toISOString()
  const abortPoll = setInterval(async () => {
    try {
      if (await isAbortRequested(tgUserId, startedAt)) {
        abortCtl.abort()
      }
    } catch {}
  }, 1500)

  try {
    let finalContent = ''
    const toolCallsForMessage: Array<{ id: string; type: 'function'; function: { name: string; arguments: string } }> = []
    const toolResultsForSave: Array<{ id: string; name: string; result: string }> = []
    let proposeOutcome: { pendingId: string; toolName: string; humanSummary: string } | null = null

    for await (const event of runJohan({
      history: history as JohanHistoryMessage[],
      userMessage: hideUserMessage ? '' : userMessage,
      metadata,
      userId: null,
      userEmail: `tg-${tgUserId}@castudio.local`,
      threadId,
      assistantMessageId,
      abortSignal: abortCtl.signal,
      tgUserId,
      tgDisplayName: displayName,
    })) {
      if (abortCtl.signal.aborted) {
        await streamer.stopped()
        break
      }

      switch (event.type) {
        case 'token':
          await streamer.append(event.text)
          break
        case 'tool_call_start':
          await sendChatAction(chatId, 'typing').catch(() => {})
          await streamer.setStatus(`🔧 ${event.name}…`)
          break
        case 'tool_result':
          // Capture propose_action results so we can render the inline-keyboard
          // confirmation card after the LLM done event. The result JSON
          // returns only pending_id; we fetch tool_name + human_summary
          // from the staged row.
          if (event.name === 'propose_action') {
            try {
              const parsed = JSON.parse(event.result)
              if (parsed?.ok && parsed?.pending_id) {
                const pending = await loadPending(parsed.pending_id, threadId)
                if (pending) {
                  proposeOutcome = {
                    pendingId: parsed.pending_id,
                    toolName: pending.tool_name,
                    humanSummary: pending.human_summary,
                  }
                }
              }
            } catch {}
          }
          toolResultsForSave.push({ id: event.id, name: event.name, result: event.result })
          break
        case 'assistant_message':
          for (const tc of event.tool_calls) {
            toolCallsForMessage.push({
              id: tc.id,
              type: 'function',
              function: { name: tc.name, arguments: tc.arguments },
            })
          }
          break
        case 'done':
          finalContent = event.finalContent
          break
        case 'error':
          await streamer.error(event.message)
          return
      }
    }

    // Final flush of the streamed text.
    if (!abortCtl.signal.aborted) {
      await streamer.finalize(finalContent)
    }

    // Persist the assistant message with the final content.
    await db
      .from('ai_chat_messages')
      .update({
        content: finalContent,
        tool_calls: toolCallsForMessage.length > 0 ? toolCallsForMessage : null,
      })
      .eq('id', assistantMessageId)

    // Save tool messages (results) so future runs see them in history.
    if (toolResultsForSave.length > 0) {
      await saveToolMessages(threadId, toolResultsForSave)
    }

    // Update thread last_message_at + auto-title if first reply.
    await db
      .from('ai_chat_threads')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', threadId)

    // If a propose_action came through, render the confirmation card.
    if (proposeOutcome) {
      const cardText = buildConfirmCardText(proposeOutcome.toolName, proposeOutcome.humanSummary)
      const keyboard = buildConfirmKeyboard(proposeOutcome.pendingId)
      await sendMessage(chatId, cardText, keyboard, 'HTML')
    }

    // Auto-title fire-and-forget (non-blocking).
    void autoTitleIfNeeded(threadId).catch(() => {})
  } finally {
    clearInterval(abortPoll)
  }
}

async function autoTitleIfNeeded(threadId: string): Promise<void> {
  const db = getSupabaseAdmin()
  const { data: thread } = await db
    .from('ai_chat_threads')
    .select('title')
    .eq('id', threadId)
    .maybeSingle()
  const title = (thread as any)?.title
  if (title && title !== 'New chat') return

  // Generate a short title from the first user message.
  const { data: msgs } = await db
    .from('ai_chat_messages')
    .select('content, role')
    .eq('thread_id', threadId)
    .eq('role', 'user')
    .order('created_at', { ascending: true })
    .limit(1)
  const first = ((msgs as any) || [])[0]
  if (!first?.content) return

  const truncated = String(first.content).trim().slice(0, 60)
  const titleFinal = truncated.length > 0 ? truncated : 'New chat'
  await db.from('ai_chat_threads').update({ title: titleFinal }).eq('id', threadId)
}

export async function handleCallbackQuery(update: TelegramUpdate): Promise<void> {
  const cb = update.callback_query
  if (!cb) return
  const data = cb.data || ''
  const parsed = parseCallbackData(data)
  if (!parsed) {
    await answerCallbackQuery(cb.id, 'Invalid action')
    return
  }

  const tgUserId = cb.from.id
  const displayName = displayNameOf(cb.from)
  const chatId = cb.message?.chat.id
  const messageId = cb.message?.message_id

  const { threadId } = await getOrCreateActiveThread(tgUserId, displayName)

  if (parsed.action === 'thread') {
    const result = await switchThread(tgUserId, parsed.arg)
    await answerCallbackQuery(cb.id, result.ok ? 'Switched' : 'Failed')
    if (chatId && messageId && result.ok) {
      await editMessageText(
        chatId,
        messageId,
        `Switched to thread <code>${escapeHtml(parsed.arg.slice(0, 12))}…</code>`,
        undefined,
        'HTML',
      ).catch(() => {})
    }
    return
  }

  if (parsed.action === 'cancel') {
    // Look up by id only — in a group, the tapper may not be the proposer.
    const pending = await loadPending(parsed.arg)
    if (pending && pending.status === 'pending') {
      await markPendingStatus(parsed.arg, 'cancelled')
    }
    await answerCallbackQuery(cb.id, 'Cancelled')
    if (chatId && messageId) {
      await editMessageText(
        chatId,
        messageId,
        '<i>✗ Cancelled — nothing was changed.</i>',
        undefined,
        'HTML',
      ).catch(() => {})
    }
    return
  }

  if (parsed.action === 'confirm') {
    // Look up by id only — the tapper may not be the proposer in a group.
    const pending = await loadPending(parsed.arg)
    if (!pending) {
      await answerCallbackQuery(cb.id, 'Not found')
      return
    }
    if (pending.status === 'executed') {
      await answerCallbackQuery(cb.id, 'Already executed')
      return
    }
    if (pending.status !== 'pending') {
      await answerCallbackQuery(cb.id, `Already ${pending.status}`)
      return
    }
    await markPendingStatus(parsed.arg, 'confirmed')
    await answerCallbackQuery(cb.id, 'Executing…')
    if (chatId && messageId) {
      await editMessageText(
        chatId,
        messageId,
        '<i>✓ Confirmed — executing…</i>',
        undefined,
        'HTML',
      ).catch(() => {})
    }

    // Execute in the proposer's thread (where the action was staged), not
    // the tapper's. Audit records the tapper's tg_user_id for attribution.
    const proposerThreadId = pending.thread_id
    await patchThreadMetadata(proposerThreadId, { pendingConfirmedFor: parsed.arg })
    if (chatId) {
      const db = getSupabaseAdmin()
      const { data: t } = await db
        .from('ai_chat_threads')
        .select('metadata')
        .eq('id', proposerThreadId)
        .maybeSingle()
      const metadata = ((t as any)?.metadata as ThreadMetadata) || {
        context_phone: null,
        context_lang: 'id',
        pendingConfirmedFor: parsed.arg,
      }
      await runWithStreamer(
        chatId,
        tgUserId,
        displayName,
        proposerThreadId,
        { ...metadata, pendingConfirmedFor: parsed.arg },
        '',
        true,
      )
    }
    // Clear pendingConfirmedFor so it doesn't re-fire on next message.
    await patchThreadMetadata(proposerThreadId, { pendingConfirmedFor: null })
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!)
}
