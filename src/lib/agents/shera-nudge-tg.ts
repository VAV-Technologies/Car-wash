// Outbound-only Telegram client for "Castudio Nudge" — the 4th bot.
// Posts an alert card to a dedicated group whenever a customer was sent the
// booking link some time ago and still hasn't filled the form. The human
// operator reads the card and clicks the wa.me link to send a nudge from
// their own WhatsApp. No inbound updates, no callback queries, no auth.
//
// Three escalating tiers:
//   t1 — 4 hours after link sent
//   t2 — 24 hours after link sent
//   t3 — 7 days after link sent (final follow-up)
//
// Env:
//   SHERA_NUDGE_BOT_TOKEN  — bot token from BotFather
//   SHERA_NUDGE_CHAT_ID    — destination group chat id (negative integer)
//   SHERA_NUDGE_DISABLED   — optional kill-switch ("true" → cron skips)

const TG_API = 'https://api.telegram.org'

export type NudgeTier = 't1' | 't2' | 't3'

export type NudgeAlertMessage = {
  role: 'user' | 'assistant'
  content: string
  ts: string
}

export type NudgeAlert = {
  tier: NudgeTier
  name: string | null
  phone: string                 // digits only, no leading +
  linkSentAt: string            // ISO
  hoursSinceLink: number        // exact hours, used for t1/t2 display
  lastMessages: NudgeAlertMessage[]
  draftText: string             // pre-baked nudge, will be url-encoded into wa.me
}

export function isShareNudgeEnabled(): boolean {
  return Boolean(process.env.SHERA_NUDGE_BOT_TOKEN && process.env.SHERA_NUDGE_CHAT_ID)
}

function getConfig(): { token: string; chatId: string } {
  const token = process.env.SHERA_NUDGE_BOT_TOKEN
  const chatId = process.env.SHERA_NUDGE_CHAT_ID
  if (!token || !chatId) throw new Error('SHERA_NUDGE_BOT_TOKEN or SHERA_NUDGE_CHAT_ID not set')
  return { token, chatId }
}

function escapeHtml(s: string): string {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function trimContent(s: string, max = 200): string {
  const clean = String(s || '').replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return clean.slice(0, max - 1) + '…'
}

function renderMessages(msgs: NudgeAlertMessage[]): string {
  if (!msgs.length) return '<i>(no recent messages)</i>'
  return msgs
    .map((m) => {
      const who = m.role === 'user' ? '👤' : '🤖'
      return `${who} ${escapeHtml(trimContent(m.content))}`
    })
    .join('\n')
}

type TierCopy = { headline: string; subline: string }

function tierCopy(tier: NudgeTier, hoursSinceLink: number): TierCopy {
  if (tier === 't3') {
    const days = Math.max(7, Math.round(hoursSinceLink / 24))
    return {
      headline: '📌 <b>Final follow-up — Week 1</b>',
      subline: `Link sent ${days} days ago · no booking yet`,
    }
  }
  if (tier === 't2') {
    return {
      headline: '⏰ <b>Day 1 reminder — still no booking</b>',
      subline: `Link sent ${hoursSinceLink}h ago`,
    }
  }
  // t1
  return {
    headline: '🔔 <b>Booking link not filled out</b>',
    subline: `Link sent ${hoursSinceLink}h ago`,
  }
}

function buildHtml(a: NudgeAlert): string {
  const { headline, subline } = tierCopy(a.tier, a.hoursSinceLink)
  const nameLine = a.name ? `<b>${escapeHtml(a.name)}</b>` : '<b>Lead</b>'
  const phoneLine = `+${escapeHtml(a.phone)}`
  const waUrl = `https://wa.me/${a.phone}?text=${encodeURIComponent(a.draftText)}`

  return [
    headline,
    ``,
    `${nameLine} · <code>${phoneLine}</code>`,
    subline,
    ``,
    `<i>Last messages:</i>`,
    renderMessages(a.lastMessages),
    ``,
    `👉 <a href="${waUrl}">Open WhatsApp & send nudge</a>`,
  ].join('\n')
}

export async function postNudgeAlert(alert: NudgeAlert): Promise<void> {
  const { token, chatId } = getConfig()
  const text = buildHtml(alert)

  const res = await fetch(`${TG_API}/bot${token}/sendMessage`, {
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
    console.error(`[shera-nudge-tg] ${res.status}:`, body)
    throw new Error(`Telegram API error: ${res.status}`)
  }
}
