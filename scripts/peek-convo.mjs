import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const raw = readFileSync('.env.local', 'utf8');
const env = Object.fromEntries(
  raw.split('\n').map(l => l.trim()).filter(l => l && l.includes('=')).map(l => {
    const i = l.indexOf('=');
    let v = l.slice(i + 1);
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    return [l.slice(0, i), v.replace(/\\n$/, '').trim()];
  })
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL.replace(/\\n$/, ''), env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

console.log('=== latest whatsapp_conversations ===');
const { data: convos, error: ce } = await db.from('whatsapp_conversations').select('*').order('last_message_at', { ascending: false }).limit(3);
if (ce) console.log('err:', ce.message);
else console.log(JSON.stringify(convos, null, 2));

console.log('\n=== latest customers ===');
const { data: custs } = await db.from('customers').select('*').order('created_at', { ascending: false }).limit(3);
console.log(JSON.stringify(custs, null, 2));
