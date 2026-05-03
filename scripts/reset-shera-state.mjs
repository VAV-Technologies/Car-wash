import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const envRaw = readFileSync('.env.local', 'utf8');
const env = Object.fromEntries(
  envRaw
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => {
      const i = l.indexOf('=');
      let v = l.slice(i + 1).trim();
      if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
      return [l.slice(0, i).trim(), v.replace(/\\n$/, '').trim()];
    })
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('Missing Supabase env');

const db = createClient(url, key, { auth: { persistSession: false } });

const CANDIDATES = [
  'ratings',
  'jobs',
  'upsell_attempts',
  'subscriptions',
  'notifications',
  'customer_stats',
  'human_escalations',
  'whatsapp_conversations',
  'conversations',
  'email_leads',
  'automation_runs',
  'agent_logs',
  'job_photos',
  'bookings',
  'customers',
];

const MODE = process.argv[2] || 'check';

async function probe(table) {
  const { count, error } = await db.from(table).select('*', { count: 'exact', head: true });
  if (error) return { table, exists: false, error: error.message };
  return { table, exists: true, count };
}

async function wipe(table) {
  // PostgREST requires a filter. Use a predicate that matches all rows.
  // We pick a column based on what exists; easiest: rely on `.not('id','is',null)` if `id` exists,
  // else fall back to `.neq('created_at', '1900-01-01')`.
  let res = await db.from(table).delete().not('id', 'is', null);
  if (res.error && /column .* does not exist/i.test(res.error.message)) {
    res = await db.from(table).delete().neq('created_at', '1900-01-01T00:00:00Z');
  }
  return res;
}

if (MODE === 'check') {
  const rows = [];
  for (const t of CANDIDATES) rows.push(await probe(t));
  console.log(JSON.stringify(rows, null, 2));
} else if (MODE === 'wipe') {
  for (const t of CANDIDATES) {
    const before = await probe(t);
    if (!before.exists) {
      console.log(`SKIP  ${t} (missing)`);
      continue;
    }
    if (before.count === 0) {
      console.log(`ZERO  ${t} (already empty)`);
      continue;
    }
    const r = await wipe(t);
    if (r.error) {
      console.log(`FAIL  ${t} :: ${r.error.message}`);
    } else {
      const after = await probe(t);
      console.log(`WIPE  ${t}  ${before.count} -> ${after.count}`);
    }
  }
} else if (MODE === 'verify') {
  for (const t of CANDIDATES) {
    const r = await probe(t);
    if (!r.exists) console.log(`--    ${t}`);
    else console.log(`${String(r.count).padStart(6, ' ')}  ${t}`);
  }
} else {
  console.error('Usage: node scripts/reset-shera-state.mjs [check|wipe|verify]');
  process.exit(1);
}
