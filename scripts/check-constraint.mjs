import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const raw = readFileSync('.env.local', 'utf8');
const env = Object.fromEntries(
  raw.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#') && l.includes('=')).map(l => {
    const i = l.indexOf('=');
    let v = l.slice(i + 1);
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    return [l.slice(0, i), v.replace(/\\n$/, '').trim()];
  })
);

const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL.replace(/\\n$/, ''), env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// Try values one by one to find what's allowed
const candidates = ['whatsapp', 'whatsapp_form', 'form', 'website', 'referral', 'walk_in', 'web', 'manual', 'organic', 'ads', 'instagram'];
console.log('=== testing acquisition_source values ===');
for (const src of candidates) {
  const { data, error } = await db
    .from('customers')
    .insert({
      name: 'probe',
      phone: '62' + Math.floor(Math.random() * 1e11),
      address: 'probe',
      segment: 'new',
      acquisition_source: src,
    })
    .select('id')
    .single();
  if (error) {
    console.log(`  ${src}: REJECTED (${error.code})`);
  } else {
    console.log(`  ${src}: ACCEPTED`);
    await db.from('customers').delete().eq('id', data.id);
  }
}
