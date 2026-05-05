// Smoke test for /api/cron/nudge against production. Verifies all 3 tiers.
//
// Seeds three synthetic conversations:
//   t1 candidate — link sent 5h ago
//   t2 candidate — link sent 25h ago
//   t3 candidate — link sent 7.5 days ago
//
// Then hits the cron once and verifies each fires its expected tier, and a
// second hit confirms idempotency.
//
// Run:  node --env-file=.env.local.smoke scripts/nudge-smoke-test.mjs

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const CRON_SECRET = process.env.CRON_SECRET
const PROD_URL = 'https://castudio.id'

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !CRON_SECRET) {
  console.error('Missing one of NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / CRON_SECRET')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
})

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR
const now = Date.now()

const seeds = [
  { tier: 't1', phone: '6280000000001', linkAgoMs: 5 * HOUR },
  { tier: 't2', phone: '6280000000002', linkAgoMs: 25 * HOUR },
  { tier: 't3', phone: '6280000000003', linkAgoMs: 7.5 * DAY },
]

function buildMessages(linkAgoMs) {
  const linkAt = new Date(now - linkAgoMs).toISOString()
  const beforeLink = new Date(now - linkAgoMs - HOUR).toISOString()
  return [
    { role: 'user', content: 'Halo mau cuci mobil', timestamp: beforeLink },
    {
      role: 'assistant',
      content:
        'Biar lebih gampang, boleh isi form booking di sini ya kak (cuma 30 detik): https://castudio.id/book',
      timestamp: linkAt,
      context: 'auto-booking-link',
    },
  ]
}

async function fetchTextSafe(res) {
  try {
    return await res.text()
  } catch {
    return ''
  }
}

async function main() {
  console.log('=== Nudge cron 3-tier smoke test ===')

  const ids = []
  for (const seed of seeds) {
    const chatId = `${seed.phone}@c.us`
    await supabase.from('whatsapp_conversations').delete().eq('chat_id', chatId)
    const linkAt = new Date(now - seed.linkAgoMs).toISOString()
    const { data, error } = await supabase
      .from('whatsapp_conversations')
      .insert({
        chat_id: chatId,
        phone: seed.phone,
        messages: buildMessages(seed.linkAgoMs),
        last_message_at: linkAt,
      })
      .select('id')
      .single()
    if (error) {
      console.error('Seed failed:', seed.tier, error)
      process.exit(1)
    }
    ids.push({ ...seed, id: data.id, chatId })
    console.log(`✓ Seeded ${seed.tier}: link sent ${(seed.linkAgoMs / HOUR).toFixed(1)}h ago — id=${data.id}`)
  }

  console.log('\n→ First cron call (expect 3 alerts: t1=1, t2=1, t3=1)')
  const r1 = await fetch(`${PROD_URL}/api/cron/nudge`, {
    headers: { Authorization: `Bearer ${CRON_SECRET}` },
  })
  console.log(`  status: ${r1.status}`)
  console.log(`  body:   ${await fetchTextSafe(r1)}`)

  // Verify markers per seed
  for (const s of ids) {
    const { data } = await supabase
      .from('whatsapp_conversations')
      .select('messages')
      .eq('id', s.id)
      .single()
    const expected = `nudge-alert-sent-${s.tier}`
    const got = (data?.messages || []).filter((m) => m.context === expected).length
    console.log(`  ${s.tier}: ${expected} markers = ${got} ${got === 1 ? '✓' : '✗'}`)
  }

  console.log('\n→ Second cron call (expect sent: 0, all idempotent)')
  const r2 = await fetch(`${PROD_URL}/api/cron/nudge`, {
    headers: { Authorization: `Bearer ${CRON_SECRET}` },
  })
  console.log(`  status: ${r2.status}`)
  console.log(`  body:   ${await fetchTextSafe(r2)}`)

  // Cleanup
  for (const s of ids) {
    await supabase.from('whatsapp_conversations').delete().eq('id', s.id)
  }
  console.log('\n✓ Cleaned up synthetic conversations')
  console.log('\n👉 Check the "Castudio | Reminders" Telegram group — you should see THREE alert cards (t1, t2, t3).')
}

main().catch((e) => {
  console.error('Smoke test failed:', e)
  process.exit(1)
})
