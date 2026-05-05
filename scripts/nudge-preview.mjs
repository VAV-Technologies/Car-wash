// Posts a realistic-looking nudge alert card to the Castudio | Reminders group
// using the same HTML render logic as src/lib/agents/shera-nudge-tg.ts.
// Run: node scripts/nudge-preview.mjs

const TOKEN = '8711964546:AAG2dOXpwbeG-7QmpbDheB0iwH8gqM0n_IQ'
const CHAT_ID = '-5228368849'

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
function trimContent(s, max = 200) {
  const clean = String(s || '').replace(/\s+/g, ' ').trim()
  return clean.length <= max ? clean : clean.slice(0, max - 1) + '…'
}
function renderMessages(msgs) {
  if (!msgs.length) return '<i>(no recent messages)</i>'
  return msgs.map((m) => `${m.role === 'user' ? '👤' : '🤖'} ${escapeHtml(trimContent(m.content))}`).join('\n')
}
function buildHtml(a) {
  const nameLine = a.name ? `<b>${escapeHtml(a.name)}</b>` : '<b>Lead</b>'
  const phoneLine = `+${escapeHtml(a.phone)}`
  const waUrl = `https://wa.me/${a.phone}?text=${encodeURIComponent(a.draftText)}`
  return [
    `🔔 <b>Booking link not filled out</b>`,
    ``,
    `${nameLine} · <code>${phoneLine}</code>`,
    `Link sent ${a.hoursSinceLink}h ago`,
    ``,
    `<i>Last messages:</i>`,
    renderMessages(a.lastMessages),
    ``,
    `👉 <a href="${waUrl}">Open WhatsApp & send nudge</a>`,
  ].join('\n')
}

const sample = {
  name: 'Andika Putra',
  phone: '6281234567890',
  hoursSinceLink: 4,
  lastMessages: [
    { role: 'user', content: 'Halo bisa cuci mobil hari ini?' },
    { role: 'assistant', content: 'Bisa banget kak! Boleh dong dijadwalin. Lokasinya di mana ya?' },
    { role: 'user', content: 'Pondok Indah. 1 mobil aja, SUV.' },
    {
      role: 'assistant',
      content: 'Siap kak! Biar lebih gampang, boleh isi form booking di sini ya kak (cuma 30 detik): https://castudio.id/book',
    },
  ],
  draftText: 'Hai kak Andika! Mau bantu kalau ada yang masih bingung sama form bookingnya. Boleh aku bantu jadwalin langsung di sini?',
}

const text = buildHtml(sample)

const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chat_id: CHAT_ID,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  }),
})
console.log('status:', res.status)
console.log('body:', await res.text())
