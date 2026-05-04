// Johan's Telegram bot client. Separate identity from Ryan's notification
// bot — uses JOHAN_TELEGRAM_BOT_TOKEN, not TELEGRAM_BOT_TOKEN.

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

function getJohanBotToken(): string {
  const token = process.env.JOHAN_TELEGRAM_BOT_TOKEN
  if (!token) throw new Error('Missing JOHAN_TELEGRAM_BOT_TOKEN')
  return token
}

async function callJohanBot<T = any>(method: string, body: Record<string, unknown>): Promise<T> {
  const token = getJohanBotToken()
  const res = await fetch(`${BASE_URL}/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json: any = await res.json().catch(() => ({}))
  if (!res.ok || json?.ok === false) {
    const desc = json?.description || `${res.status}`
    console.error(`[johan-telegram] ${method} failed:`, desc)
    throw new Error(`Telegram ${method}: ${desc}`)
  }
  return json.result as T
}

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
  return callJohanBot<TelegramMessage>('sendMessage', body)
}

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
  return callJohanBot<TelegramMessage>('editMessageText', body)
}

export async function answerCallbackQuery(
  callbackQueryId: string,
  text?: string,
): Promise<void> {
  const body: Record<string, unknown> = { callback_query_id: callbackQueryId }
  if (text) body.text = text
  await callJohanBot('answerCallbackQuery', body)
}

export async function sendChatAction(
  chatId: number | string,
  action: 'typing' | 'upload_photo' | 'record_video' = 'typing',
): Promise<void> {
  await callJohanBot('sendChatAction', { chat_id: chatId, action })
}

export async function setMyCommands(commands: BotCommand[]): Promise<void> {
  await callJohanBot('setMyCommands', { commands })
}

export async function setWebhook(
  url: string,
  secretToken: string,
  dropPending = false,
): Promise<void> {
  await callJohanBot('setWebhook', {
    url,
    secret_token: secretToken,
    drop_pending_updates: dropPending,
    allowed_updates: ['message', 'callback_query'],
  })
}

export async function deleteWebhook(): Promise<void> {
  await callJohanBot('deleteWebhook', { drop_pending_updates: true })
}

export async function getMe(): Promise<{ id: number; username?: string; first_name: string }> {
  return callJohanBot('getMe', {})
}
