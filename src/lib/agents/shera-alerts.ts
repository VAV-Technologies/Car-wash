// ─── Shera Admin Alerts ──────────────────────────────────────────────
// Sends WhatsApp alerts to the admin when critical events occur.
// Uses WAHA to message the business's own number.

const ALERT_COOLDOWN_MS = 10 * 60 * 1000 // 10 min between same-type alerts
const lastAlertTimes: Record<string, number> = {}

function shouldAlert(type: string): boolean {
  const last = lastAlertTimes[type] || 0
  if (Date.now() - last < ALERT_COOLDOWN_MS) return false
  lastAlertTimes[type] = Date.now()
  return true
}

async function sendAdminAlert(message: string): Promise<void> {
  try {
    const WAHA_API_URL = process.env.WAHA_API_URL
    const WAHA_API_KEY = process.env.WAHA_API_KEY
    const ADMIN_PHONE = process.env.ADMIN_ALERT_PHONE || '6285591222000' // Shera's own number as fallback (messages to self)
    if (!WAHA_API_URL || !WAHA_API_KEY) return

    await fetch(`${WAHA_API_URL}/api/sendText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': WAHA_API_KEY,
      },
      body: JSON.stringify({
        session: 'default',
        chatId: `${ADMIN_PHONE}@c.us`,
        text: message,
      }),
    })
  } catch {
    // Alert delivery itself failed — nothing we can do
    console.error('[shera-alert] Failed to send admin alert')
  }
}

export async function alertLLMFailure(chatId: string, phone: string, error: string): Promise<void> {
  if (!shouldAlert('llm_failure')) return
  await sendAdminAlert(
    `⚠️ SHERA LLM FAILURE\n\nCustomer: ${phone}\nChat: ${chatId}\nError: ${error.slice(0, 200)}\n\nFallback message sent. Background retry queued.`
  )
}

export async function alertImageDeliveryFailure(chatId: string, attempted: number): Promise<void> {
  if (!shouldAlert('image_failure')) return
  await sendAdminAlert(
    `⚠️ SHERA IMAGE DELIVERY FAILED\n\nChat: ${chatId}\nAttempted: ${attempted} images\nDelivered: 0\n\nText fallback used instead.`
  )
}

export async function alertRetryExhausted(chatId: string, phone: string, attempts: number): Promise<void> {
  if (!shouldAlert(`retry_exhausted_${chatId}`)) return
  await sendAdminAlert(
    `🚨 SHERA RETRY EXHAUSTED\n\nCustomer: ${phone}\nChat: ${chatId}\nAttempts: ${attempts}\n\nCustomer has been waiting. Manual follow-up needed.`
  )
}
