// Seed Ryan's default agent_rules. Idempotent — safe to run repeatedly,
// only inserts a rule if a row with the same agent_name + title isn't
// already present.
//
// Use:
//   node scripts/seed-ryan-rules.mjs
//
// Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from
// .env.local. Tolerates malformed lines in .env.local (e.g. unescaped
// nested quotes in GOOGLE_SERVICE_ACCOUNT_KEY) so the seed runs
// regardless of the rest of the file.

import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

function loadEnvLocalTolerant(filePath) {
  if (!fs.existsSync(filePath)) return
  const text = fs.readFileSync(filePath, 'utf-8')
  // Match KEY="value" (single-line double-quoted) or KEY=value (no quotes,
  // value is everything to end-of-line). Quoted multi-line values and
  // pathological nested-quote lines are skipped silently.
  const re = /^([A-Z_][A-Z0-9_]*)=(.*)$/i
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trimEnd()
    if (!line || line.startsWith('#')) continue
    const m = line.match(re)
    if (!m) continue
    const [, key, valRaw] = m
    let val = valRaw.trim()
    // Strip surrounding quotes only if they balance on this line.
    if (val.startsWith('"') && val.endsWith('"') && val.length >= 2) {
      const inner = val.slice(1, -1)
      // If the inner part has unescaped quotes, the line is the malformed
      // GOOGLE_SERVICE_ACCOUNT_KEY style — skip rather than corrupt env.
      if (!/(?<!\\)"/.test(inner)) val = inner
    }
    if (process.env[key] === undefined) process.env[key] = val
  }
}

loadEnvLocalTolerant(path.join(process.cwd(), '.env.local'))

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(url, serviceKey)

const RYAN_DEFAULT_RULES = [
  {
    title: 'Email source',
    content:
      'If the lead asks where we got their email or how we found them, say it came from our marketing team that reaches out to companies in Jabodetabek that might benefit from at-home washes. Offer to take them off the list if not a fit. Never say "business outreach", "scraping", or "data broker".',
  },
  {
    title: 'No booking confirmation',
    content:
      'You do not have access to the booking calendar. Never confirm a specific date, time, or slot. If the lead asks "can I book Saturday at 10?", acknowledge the request and redirect to WhatsApp where the team can check the calendar and lock it in.',
  },
  {
    title: 'No discount offers',
    content:
      'Never offer or promise a discount, promo, free upgrade, or special pricing. If the lead asks for a discount, redirect them to the subscription option (which lowers per-wash cost for repeat use) or simply explain the value. Pricing is final and managed by the team.',
  },
]

async function seedRule(rule) {
  // Idempotent: insert only if (agent_name, title) doesn't already exist.
  const { data: existing } = await supabase
    .from('agent_rules')
    .select('id')
    .eq('agent_name', 'ryan')
    .eq('title', rule.title)
    .maybeSingle()

  if (existing) {
    return { id: existing.id, action: 'exists', title: rule.title }
  }

  const { data, error } = await supabase
    .from('agent_rules')
    .insert({
      agent_name: 'ryan',
      title: rule.title,
      content: rule.content,
      is_active: true,
    })
    .select('id')
    .single()

  if (error) return { action: 'error', title: rule.title, error: error.message }
  return { id: data?.id, action: 'inserted', title: rule.title }
}

const results = []
for (const r of RYAN_DEFAULT_RULES) {
  results.push(await seedRule(r))
}

let inserted = 0, exists = 0, errors = 0
for (const r of results) {
  if (r.action === 'inserted') inserted++
  else if (r.action === 'exists') exists++
  else errors++
  console.log(`[${r.action}] ${r.title}${r.error ? ' — ' + r.error : ''}`)
}

console.log(`\n${inserted} inserted, ${exists} already existed, ${errors} errors.`)
process.exit(errors > 0 ? 1 : 0)
