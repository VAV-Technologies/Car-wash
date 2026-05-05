// Telegram client for the Ryan email draft approval bot. Separate from
// telegram-client.ts (which serves the Johan / handoff bot) because this
// is a different bot token + chat. Runtime config via env:
//   RYAN_DRAFT_BOT_TOKEN          — bot token from BotFather
//   RYAN_DRAFT_CHAT_ID            — group chat the drafts get posted to
//   RYAN_DRAFT_AUTHORIZED_USERS   — CSV of TG user IDs allowed to act
//   RYAN_DRAFT_WEBHOOK_SECRET     — shared secret for setWebhook
//
// If RYAN_DRAFT_BOT_TOKEN is unset, isApprovalEnabled() returns false and
// the rest of the pipeline falls back to immediate-send (existing
// behavior). This makes the deploy safe even before the token is plugged
// in.

const TG_API = 'https://api.telegram.org'

export function isApprovalEnabled(): boolean {
  return Boolean(process.env.RYAN_DRAFT_BOT_TOKEN && process.env.RYAN_DRAFT_CHAT_ID)
}

export function getAuthorizedTgUserIds(): Set<number> {
  const raw = process.env.RYAN_DRAFT_AUTHORIZED_USERS || ''
  const ids = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n))
  return new Set(ids)
}

export function isAuthorizedUser(tgUserId: number | null | undefined): boolean {
  if (!tgUserId) return false
  const allow = getAuthorizedTgUserIds()
  // If no allow-list is configured, deny by default — never silently let
  // strangers approve emails.
  if (allow.size === 0) return false
  return allow.has(tgUserId)
}

function getConfig(): { token: string; chatId: string } {
  const token = process.env.RYAN_DRAFT_BOT_TOKEN
  const chatId = process.env.RYAN_DRAFT_CHAT_ID
  if (!token || !chatId) {
    throw new Error('RYAN_DRAFT_BOT_TOKEN or RYAN_DRAFT_CHAT_ID not set')
  }
  return { token, chatId }
}

async function tg<T = any>(method: string, body: Record<string, unknown>): Promise<T> {
  const { token } = getConfig()
  const res = await fetch(`${TG_API}/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || (data as any).ok === false) {
    throw new Error(`Telegram ${method} failed: ${res.status} ${JSON.stringify(data)}`)
  }
  return (data as any).result as T
}

function escapeHtml(s: string): string {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function htmlToTgPlain(html: string): string {
  // Telegram's HTML mode allows <b><i><u><s><code><pre><a> but NOT <p>/<br>.
  // Drafts are stored as <p>...</p> blocks, so convert paragraphs to
  // double-newlines and strip tags. Preserves the user-visible spacing
  // structure (each <p> becomes its own line with a blank line between).
  return String(html || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/p>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// More forgiving HTML→text for email thread bodies — preserves paragraph,
// div, list, and heading breaks as newlines so the rendered thread reads
// like the original. Used only for thread items, not Ryan's own drafts.
function emailHtmlToText(html: string): string {
  if (!html) return ''
  return String(html)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|tr|h[1-6]|blockquote)>/gi, '\n')
    .replace(/<(p|div|li|h[1-6]|blockquote)[^>]*>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function truncate(s: string, max: number): string {
  if (!s) return ''
  return s.length > max ? s.slice(0, max - 1) + '…' : s
}

// Telegram caps a single message at 4096 chars. Stay under 3800 to leave
// headroom for the parse_mode HTML overhead + safety margin.
const MAX_TG_MESSAGE_CHARS = 3800

export interface ThreadMessageItem {
  from?: string | null
  from_email?: string | null
  to?: string | null
  to_email?: string | null
  subject?: string | null
  date?: string | null
  created_at?: string | null
  received_at?: string | null
  text_body?: string | null
  body?: string | null
  html_body?: string | null
  content?: string | null
  snippet?: string | null
  [key: string]: unknown
}

export interface DraftMessageInput {
  draftId: string
  leadName: string | null
  leadEmail: string
  // Our outbound sender address for this lead (e.g. vilca.a@highride.club).
  // Used to label thread messages as Agent vs Customer.
  agentEmail?: string | null
  companyName: string | null
  campaignName: string | null
  replyCount: number
  classification: string
  objectionType: string | null
  language: string | null
  inboundText: string
  draftHtml: string
  // Full Plusvibe thread snapshot, oldest → newest. Optional — falls back
  // to inboundText only when missing (legacy rows or thread fetch failed).
  threadSnapshot?: ThreadMessageItem[] | null
}

function flagFor(language: string | null | undefined): string {
  if (!language) return ''
  if (language.toLowerCase().startsWith('id')) return ' 🇮🇩'
  if (language.toLowerCase().startsWith('en')) return ' 🇬🇧'
  return ''
}

function approveKeyboard(draftId: string) {
  return {
    inline_keyboard: [
      [
        { text: '✅ Approve & Send', callback_data: `approve:${draftId}` },
        { text: '✏️ Edit', callback_data: `edit:${draftId}` },
        { text: '❌ Deny', callback_data: `deny:${draftId}` },
      ],
    ],
  }
}

// ─── Render: thread message(s) ──────────────────────────────────────

function buildThreadHeader(d: DraftMessageInput): string {
  const customerLabel = d.leadName
    ? `${escapeHtml(d.leadName)} (${escapeHtml(d.leadEmail)})`
    : escapeHtml(d.leadEmail)
  const classLine = `<code>${escapeHtml(d.classification)}${
    d.objectionType ? ` / ${escapeHtml(d.objectionType)}` : ''
  }</code>${flagFor(d.language)}`

  return [
    `📨 <b>New email reply</b>`,
    `👤 <b>Customer:</b> ${customerLabel}`,
    d.companyName ? `🏢 <b>Company:</b> ${escapeHtml(d.companyName)}` : null,
    d.campaignName
      ? `🎯 <b>Campaign:</b> ${escapeHtml(d.campaignName)} · Reply #${d.replyCount}`
      : `🎯 <b>Reply:</b> #${d.replyCount}`,
    `🏷️ <b>Classification:</b> ${classLine}`,
  ]
    .filter((s) => s !== null)
    .join('\n')
}

// ─── Quote-stripping ────────────────────────────────────────────────
// Email replies typically contain the entire prior thread inline as
// quoted history. Since we render each thread message separately, that
// inline quote is redundant noise. extractNewContent finds the first
// quote marker and returns only the text above it.

function extractNewContent(text: string): string {
  if (!text) return ''
  const normalized = String(text).replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = normalized.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()

    // Gmail / standard "On <date> ... wrote:" attribution
    if (/^On\s+.{5,}\swrote:\s*$/.test(trimmed)) {
      return joinUntil(lines, i)
    }
    // Some clients break it across two lines: "On <date>" then "<name> wrote:"
    if (/^On\s+.{5,}$/.test(trimmed) && i + 1 < lines.length && /^.+wrote:\s*$/.test(lines[i + 1].trim())) {
      return joinUntil(lines, i)
    }
    // Outlook forwarded separator
    if (/^_{5,}\s*$/.test(trimmed)) {
      return joinUntil(lines, i)
    }
    // Outlook "From: <email>" header block (preceded by blank line)
    if (i > 0 && /^From:\s+.+@/.test(trimmed) && lines[i - 1].trim() === '') {
      return joinUntil(lines, i)
    }
    // Quoted lines (>) — but only if we already have some content above,
    // otherwise the very first line of the email could be a misread.
    if (trimmed.startsWith('>') && i > 0) {
      // Walk back over blank lines so we don't keep dangling whitespace
      let cut = i
      while (cut > 0 && lines[cut - 1].trim() === '') cut--
      return joinUntil(lines, cut)
    }
  }

  return normalized.trim()
}

function joinUntil(lines: string[], end: number): string {
  return lines.slice(0, end).join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

function bodyFromThreadItem(m: ThreadMessageItem): string {
  const txt = m.text_body || m.body || m.content || m.snippet || ''
  let raw = ''
  if (txt && String(txt).trim()) {
    raw = String(txt).replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
  } else if (m.html_body) {
    raw = emailHtmlToText(String(m.html_body))
  }
  return extractNewContent(raw)
}

// ─── Role labels (Agent vs Customer) ────────────────────────────────

function emailMatches(addr: string | null | undefined, target: string | null | undefined): boolean {
  if (!addr || !target) return false
  const norm = (s: string) => s.toLowerCase().match(/[\w._%+-]+@[\w.-]+\.[a-z]{2,}/i)?.[0] || s.toLowerCase().trim()
  return norm(addr) === norm(target)
}

function roleFor(messageFrom: string | null | undefined, agentEmail: string | null | undefined, leadEmail: string | null | undefined): { label: string; emoji: string } {
  if (emailMatches(messageFrom, agentEmail)) return { label: 'Agent', emoji: '🤖' }
  if (emailMatches(messageFrom, leadEmail)) return { label: 'Customer', emoji: '👤' }
  // Fallback: anything else (rare — maybe a CC or different sender). Show
  // the email so it's not silently mislabeled.
  return { label: messageFrom || 'Unknown', emoji: '✉️' }
}

function shortDate(input: string | null | undefined): string {
  if (!input) return ''
  const d = new Date(input)
  if (isNaN(d.getTime())) return String(input)
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d)
}

function formatEmailBlock(m: ThreadMessageItem, agentEmail: string | null | undefined, leadEmail: string | null | undefined): string {
  const from = String(m.from || m.from_email || '').trim()
  const date = String(m.date || m.created_at || m.received_at || '').trim()
  const body = bodyFromThreadItem(m)
  const role = roleFor(from, agentEmail, leadEmail)
  const dateLabel = shortDate(date)

  const header = dateLabel
    ? `${role.emoji} <b>${role.label}</b>  <i>${escapeHtml(dateLabel)}</i>`
    : `${role.emoji} <b>${role.label}</b>`

  return body ? `${header}\n${escapeHtml(body)}` : header
}

function buildThreadMessages(d: DraftMessageInput): string[] {
  const header = buildThreadHeader(d)
  const sectionHeader = `\n\n📧 <b>Thread</b>${
    d.threadSnapshot && d.threadSnapshot.length > 1 ? ` (${d.threadSnapshot.length} messages)` : ''
  }\n`

  const items: ThreadMessageItem[] =
    d.threadSnapshot && d.threadSnapshot.length > 0
      ? d.threadSnapshot
      : [
          // Fallback: render only the latest inbound text as one block,
          // attributed to the lead.
          { text_body: d.inboundText, from: d.leadEmail },
        ]

  // Greedy pack: keep appending blocks until we'd exceed MAX_TG_MESSAGE_CHARS.
  const messages: string[] = []
  let current = header + sectionHeader

  for (let i = 0; i < items.length; i++) {
    const block = formatEmailBlock(items[i], d.agentEmail, d.leadEmail)
    const sep = i === 0 ? '\n' : '\n\n'
    if (current.length + sep.length + block.length > MAX_TG_MESSAGE_CHARS) {
      messages.push(current.trimEnd())
      current = `<i>(thread continued)</i>\n\n` + block
    } else {
      current += sep + block
    }
  }
  messages.push(current.trimEnd())
  return messages
}

// ─── Render: draft message ──────────────────────────────────────────

function buildDraftBody(d: DraftMessageInput): string {
  // The draft message is intentionally minimal: a label, a blank line,
  // then the draft body exactly as it would appear in the email. That way
  // the user can copy the message and only needs to delete two lines off
  // the top before pasting + editing.
  const draftPlain = htmlToTgPlain(d.draftHtml)
  return `📝 <b>Draft</b>\n\n${escapeHtml(draftPlain)}`
}

// ─── Public API ─────────────────────────────────────────────────────

export interface PostDraftResult {
  chatId: number
  draftMessageId: number
  threadMessageIds: number[]
}

export async function postDraftForApproval(d: DraftMessageInput): Promise<PostDraftResult> {
  const { chatId } = getConfig()

  // 1. Send thread message(s) — no buttons. Each part posted in order so
  //    the chat shows oldest → newest naturally.
  const threadParts = buildThreadMessages(d)
  const threadMessageIds: number[] = []
  let lastThreadMessageId: number | undefined
  for (const text of threadParts) {
    const result = await tg<{ message_id: number; chat: { id: number } }>('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    })
    threadMessageIds.push(result.message_id)
    lastThreadMessageId = result.message_id
  }

  // 2. Send the draft message with the action buttons. Visually attach it
  //    to the last thread message so they read as a pair.
  const draftResult = await tg<{ message_id: number; chat: { id: number } }>('sendMessage', {
    chat_id: chatId,
    text: buildDraftBody(d),
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    reply_markup: approveKeyboard(d.draftId),
    ...(lastThreadMessageId
      ? { reply_to_message_id: lastThreadMessageId, allow_sending_without_reply: true }
      : {}),
  })

  return {
    chatId: draftResult.chat.id,
    draftMessageId: draftResult.message_id,
    threadMessageIds,
  }
}

// editDraftMessage / markStatusOnMessage operate on the DRAFT message
// only — the thread message(s) stay as a static historical record.

export async function editDraftMessage(
  chatId: number,
  draftMessageId: number,
  d: DraftMessageInput,
  options: { keepButtons?: boolean } = {},
): Promise<void> {
  await tg('editMessageText', {
    chat_id: chatId,
    message_id: draftMessageId,
    text: buildDraftBody(d),
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    reply_markup: options.keepButtons === false ? undefined : approveKeyboard(d.draftId),
  })
}

export async function markStatusOnMessage(
  chatId: number,
  draftMessageId: number,
  d: DraftMessageInput,
  statusLine: string,
): Promise<void> {
  // Re-renders the draft body and appends a status line, then drops the
  // buttons. statusLine is HTML (<b>...</b> ok).
  const text = buildDraftBody(d) + '\n\n' + statusLine
  await tg('editMessageText', {
    chat_id: chatId,
    message_id: draftMessageId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    // No reply_markup → buttons get removed.
  })
}

export async function sendEditPrompt(
  chatId: number,
  draftMessageId: number,
  draftId: string,
): Promise<{ messageId: number }> {
  const result = await tg<{ message_id: number }>('sendMessage', {
    chat_id: chatId,
    reply_to_message_id: draftMessageId,
    allow_sending_without_reply: true,
    text:
      `✏️ <b>Reply to this message</b> with the edited draft.\n` +
      `Whatever you send back replaces the draft above (it stays pending — tap Approve afterwards to send it).\n\n` +
      `<i>If you don't see a reply box auto-focused, long-press this message and tap Reply, then type your edit.</i>`,
    parse_mode: 'HTML',
    // selective omitted → force_reply auto-focuses the reply box for
    // every group member. Setting selective:true together with the
    // bot's own message as the reply target causes Telegram to skip
    // auto-focusing for any human, so the edit reply box never opens.
    reply_markup: { force_reply: true, input_field_placeholder: 'Type the edited draft…' },
  })
  return { messageId: result.message_id }
}

export async function answerCallback(
  callbackQueryId: string,
  text?: string,
  options: { showAlert?: boolean } = {},
): Promise<void> {
  await tg('answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    ...(text ? { text } : {}),
    ...(options.showAlert ? { show_alert: true } : {}),
  })
}

export async function setMyWebhook(url: string, secret: string): Promise<void> {
  await tg('setWebhook', {
    url,
    secret_token: secret,
    allowed_updates: ['message', 'callback_query'],
  })
}

export async function deleteMyWebhook(): Promise<void> {
  await tg('deleteWebhook', {})
}

export async function getWebhookInfo(): Promise<any> {
  return tg('getWebhookInfo', {})
}
