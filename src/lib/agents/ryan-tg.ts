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
  // The drafts are stored as <p>...</p> blocks, so convert paragraphs to
  // double-newlines and strip tags.
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/p>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
}

function truncate(s: string, max: number): string {
  if (!s) return ''
  return s.length > max ? s.slice(0, max - 1) + '…' : s
}

export interface DraftMessageInput {
  draftId: string
  leadName: string | null
  leadEmail: string
  companyName: string | null
  campaignName: string | null
  replyCount: number
  classification: string
  objectionType: string | null
  language: string | null
  inboundText: string
  draftHtml: string
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

function buildDraftBody(d: DraftMessageInput): string {
  const fromLine = d.leadName
    ? `${escapeHtml(d.leadName)} &lt;${escapeHtml(d.leadEmail)}&gt;`
    : escapeHtml(d.leadEmail)
  const classLine = `<code>${escapeHtml(d.classification)}${
    d.objectionType ? ` / ${escapeHtml(d.objectionType)}` : ''
  }</code>${flagFor(d.language)}`

  const inbound = truncate(d.inboundText.trim(), 1500)
  const draftPlain = truncate(htmlToTgPlain(d.draftHtml), 2000)

  return [
    `📨 <b>New email reply</b>`,
    `From: <i>${fromLine}</i>`,
    d.companyName ? `Company: ${escapeHtml(d.companyName)}` : null,
    d.campaignName
      ? `Campaign: ${escapeHtml(d.campaignName)} · Reply #${d.replyCount}`
      : `Reply #${d.replyCount}`,
    '',
    `━━━ <b>Latest reply</b> ━━━`,
    `<i>${escapeHtml(inbound)}</i>`,
    '',
    `━━━ <b>Ryan's draft</b> · ${classLine} ━━━`,
    escapeHtml(draftPlain),
  ]
    .filter(Boolean)
    .join('\n')
}

export async function postDraftForApproval(
  d: DraftMessageInput,
): Promise<{ chatId: number; messageId: number }> {
  const { chatId } = getConfig()
  const result = await tg<{ message_id: number; chat: { id: number } }>('sendMessage', {
    chat_id: chatId,
    text: buildDraftBody(d),
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    reply_markup: approveKeyboard(d.draftId),
  })
  return { chatId: result.chat.id, messageId: result.message_id }
}

export async function editDraftMessage(
  chatId: number,
  messageId: number,
  d: DraftMessageInput,
  options: { keepButtons?: boolean } = {},
): Promise<void> {
  await tg('editMessageText', {
    chat_id: chatId,
    message_id: messageId,
    text: buildDraftBody(d),
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    reply_markup: options.keepButtons === false ? undefined : approveKeyboard(d.draftId),
  })
}

export async function markStatusOnMessage(
  chatId: number,
  messageId: number,
  d: DraftMessageInput,
  statusLine: string,
): Promise<void> {
  // Re-renders the message body and appends a status line, then drops the
  // buttons. statusLine is HTML (<b>...</b> ok).
  const text = buildDraftBody(d) + '\n\n' + statusLine
  await tg('editMessageText', {
    chat_id: chatId,
    message_id: messageId,
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
    text:
      `✏️ Reply to this message with the edited draft. The new text will replace the draft above.\n` +
      `<code>edit:${draftId}</code>`,
    parse_mode: 'HTML',
    reply_markup: { force_reply: true, selective: true },
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
