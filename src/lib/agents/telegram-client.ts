const BASE_URL = 'https://api.telegram.org'

export type ParseMode = 'HTML' | 'MarkdownV2' | 'Markdown'

interface TelegramMessage {
  message_id: number
  chat: { id: number }
  date: number
  text?: string
}

interface InlineKeyboardButton {
  text: string
  callback_data?: string
  url?: string
}

export interface InlineKeyboardMarkup {
  inline_keyboard: InlineKeyboardButton[][]
}

interface BotCommand {
  command: string
  description: string
}

function getToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) throw new Error('Missing TELEGRAM_BOT_TOKEN')
  return token
}

function getHandoffChatId(): string {
  const chatId = process.env.TELEGRAM_HANDOFF_CHAT_ID
  if (!chatId) throw new Error('Missing TELEGRAM_HANDOFF_CHAT_ID')
  return chatId
}

async function callBot<T = any>(method: string, body: Record<string, unknown>): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE_URL}/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json: any = await res.json().catch(() => ({}))
  if (!res.ok || json?.ok === false) {
    const desc = json?.description || `${res.status}`
    console.error(`[telegram] ${method} failed:`, desc)
    throw new Error(`Telegram ${method}: ${desc}`)
  }
  return json.result as T
}

// Generic send to any chat. Returns the sent Message object.
export async function sendMessage(
  chatId: number | string,
  text: string,
  replyMarkup?: InlineKeyboardMarkup,
  parseMode: ParseMode = 'HTML',
): Promise<TelegramMessage> {
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
    parse_mode: parseMode,
    disable_web_page_preview: true,
  }
  if (replyMarkup) body.reply_markup = replyMarkup
  return callBot<TelegramMessage>('sendMessage', body)
}

// Edit a previously-sent message's text. Used by the streaming flow.
export async function editMessageText(
  chatId: number | string,
  messageId: number,
  text: string,
  replyMarkup?: InlineKeyboardMarkup,
  parseMode: ParseMode = 'HTML',
): Promise<TelegramMessage> {
  const body: Record<string, unknown> = {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: parseMode,
    disable_web_page_preview: true,
  }
  if (replyMarkup) body.reply_markup = replyMarkup
  return callBot<TelegramMessage>('editMessageText', body)
}

// Acknowledge an inline-keyboard tap. Required by Telegram or the user sees
// the button keep spinning.
export async function answerCallbackQuery(
  callbackQueryId: string,
  text?: string,
): Promise<void> {
  const body: Record<string, unknown> = { callback_query_id: callbackQueryId }
  if (text) body.text = text
  await callBot('answerCallbackQuery', body)
}

// "typing…" indicator. Lasts ~5s; call again for longer operations.
export async function sendChatAction(
  chatId: number | string,
  action: 'typing' | 'upload_photo' | 'record_video' = 'typing',
): Promise<void> {
  await callBot('sendChatAction', { chat_id: chatId, action })
}

// Register the bot's slash-command list (shown in Telegram's "/" menu).
export async function setMyCommands(commands: BotCommand[]): Promise<void> {
  await callBot('setMyCommands', { commands })
}

// Set the webhook URL. Used during initial setup; safe to re-run idempotently.
export async function setWebhook(
  url: string,
  secretToken: string,
  dropPending = false,
): Promise<void> {
  await callBot('setWebhook', {
    url,
    secret_token: secretToken,
    drop_pending_updates: dropPending,
    allowed_updates: ['message', 'callback_query'],
  })
}

// ─── Backwards-compatible wrapper ───────────────────────────────────
// Existing callers (Ryan handoff, etc.) use this.
export async function sendTelegramMessage(text: string): Promise<void> {
  await sendMessage(getHandoffChatId(), text, undefined, 'HTML')
}
