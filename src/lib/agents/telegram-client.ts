const BASE_URL = 'https://api.telegram.org'

function getConfig() {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_HANDOFF_CHAT_ID
  if (!token || !chatId) throw new Error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_HANDOFF_CHAT_ID')
  return { token, chatId }
}

export async function sendTelegramMessage(text: string): Promise<void> {
  const { token, chatId } = getConfig()
  const res = await fetch(`${BASE_URL}/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    console.error(`[telegram] ${res.status}:`, body)
    throw new Error(`Telegram API error: ${res.status}`)
  }
}
