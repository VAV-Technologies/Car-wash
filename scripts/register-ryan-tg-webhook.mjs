// One-time setup helper for the Ryan email-approval Telegram bot.
//
// What it does:
//   1. Loads RYAN_DRAFT_BOT_TOKEN from .env.local
//   2. Calls getUpdates so you can see recent chat IDs (handy for finding
//      the group chat ID after you add the bot)
//   3. Calls setWebhook to point the bot at production
//   4. Prints getWebhookInfo so you can confirm it stuck
//
// Usage:
//   node scripts/register-ryan-tg-webhook.mjs
//   node scripts/register-ryan-tg-webhook.mjs --url=https://castudio.id/api/webhook/ryan-tg
//   node scripts/register-ryan-tg-webhook.mjs --updates-only
//   node scripts/register-ryan-tg-webhook.mjs --delete    (unregister)

import fs from 'node:fs'
import path from 'node:path'

const TG_API = 'https://api.telegram.org'
const DEFAULT_WEBHOOK_URL = 'https://castudio.id/api/webhook/ryan-tg'

function loadEnvLocalTolerant(filePath) {
  if (!fs.existsSync(filePath)) return
  const text = fs.readFileSync(filePath, 'utf-8')
  const re = /^([A-Z_][A-Z0-9_]*)=(.*)$/i
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trimEnd()
    if (!line || line.startsWith('#')) continue
    const m = line.match(re)
    if (!m) continue
    const [, key, valRaw] = m
    let val = valRaw.trim()
    if (val.startsWith('"') && val.endsWith('"') && val.length >= 2) {
      const inner = val.slice(1, -1)
      if (!/(?<!\\)"/.test(inner)) val = inner
    }
    if (process.env[key] === undefined) process.env[key] = val
  }
}

loadEnvLocalTolerant(path.join(process.cwd(), '.env.local'))

const args = process.argv.slice(2)
const flags = {
  updatesOnly: args.includes('--updates-only'),
  deleteHook: args.includes('--delete'),
  url:
    args.find((a) => a.startsWith('--url='))?.split('=')[1] ||
    process.env.RYAN_DRAFT_WEBHOOK_URL ||
    DEFAULT_WEBHOOK_URL,
}

const token = process.env.RYAN_DRAFT_BOT_TOKEN
if (!token) {
  console.error('Missing RYAN_DRAFT_BOT_TOKEN in .env.local')
  process.exit(1)
}
const secret = process.env.RYAN_DRAFT_WEBHOOK_SECRET
if (!secret && !flags.updatesOnly && !flags.deleteHook) {
  console.error(
    'Missing RYAN_DRAFT_WEBHOOK_SECRET. Generate one and add to .env.local AND Vercel:\n' +
      '  RYAN_DRAFT_WEBHOOK_SECRET=' + cryptoRandom(32),
  )
  process.exit(1)
}

function cryptoRandom(n) {
  const bytes = new Uint8Array(n)
  // Node 20+ has globalThis.crypto
  globalThis.crypto.getRandomValues(bytes)
  return Buffer.from(bytes).toString('hex')
}

async function tg(method, body = {}) {
  const res = await fetch(`${TG_API}/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.ok === false) {
    throw new Error(`${method} failed: ${res.status} ${JSON.stringify(data)}`)
  }
  return data.result
}

async function showChatIdHints() {
  console.log('\n── Recent chats the bot has seen ──')
  const updates = await tg('getUpdates', {})
  if (!Array.isArray(updates) || updates.length === 0) {
    console.log(
      '  (none — make sure the bot was added to your group AND someone has sent\n' +
        '   a message there. Then re-run.)',
    )
    return
  }
  const seen = new Map()
  for (const u of updates) {
    const chat = u.message?.chat || u.callback_query?.message?.chat
    if (!chat) continue
    if (!seen.has(chat.id)) {
      seen.set(chat.id, {
        id: chat.id,
        type: chat.type,
        title: chat.title || chat.first_name || '(direct)',
        last_text: u.message?.text || '(callback)',
        from: u.message?.from?.username || u.message?.from?.first_name || '',
      })
    }
  }
  for (const c of seen.values()) {
    console.log(`  • chat_id=${c.id}  type=${c.type}  title="${c.title}"  last_msg_from=${c.from}`)
  }
  console.log(
    '\n  → set RYAN_DRAFT_CHAT_ID to the group chat_id (negative number for groups).',
  )
}

async function main() {
  const me = await tg('getMe')
  console.log(`Bot: @${me.username} (id ${me.id}, name "${me.first_name}")`)

  if (flags.deleteHook) {
    await tg('deleteWebhook', { drop_pending_updates: false })
    console.log('Webhook deleted.')
    return
  }

  await showChatIdHints()

  if (flags.updatesOnly) return

  console.log(`\n── Setting webhook ──`)
  console.log(`  URL:    ${flags.url}`)
  console.log(`  secret: ${secret.slice(0, 6)}…${secret.slice(-4)}`)
  await tg('setWebhook', {
    url: flags.url,
    secret_token: secret,
    allowed_updates: ['message', 'callback_query'],
    drop_pending_updates: true,
  })
  console.log('  ✓ webhook set')

  const info = await tg('getWebhookInfo')
  console.log('\n── getWebhookInfo ──')
  console.log(JSON.stringify(info, null, 2))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
