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

const candidates = [
  'Jakarta Pusat', 'Jakarta Selatan', 'Jakarta Utara', 'Jakarta Timur', 'Jakarta Barat',
  'Bogor', 'Depok', 'Tangerang', 'Tangerang Selatan', 'Bekasi',
  'jakarta', 'Jakarta', 'JakartaPusat', 'jakarta_pusat', 'JAKARTA_PUSAT',
  'Kemang', 'Menteng', 'Pondok Indah', 'Kebayoran', 'Senayan',
  'South Jakarta', 'Central Jakarta',
  null, '',
];

for (const n of candidates) {
  const { data, error } = await db
    .from('customers')
    .insert({
      name: 'probe',
      phone: '62' + Math.floor(Math.random() * 1e11),
      address: 'probe',
      segment: 'new',
      acquisition_source: 'whatsapp',
      neighborhood: n,
    })
    .select('id')
    .single();
  if (error) {
    console.log(`  ${JSON.stringify(n).padEnd(25)}: REJECTED (${error.code})`);
  } else {
    console.log(`  ${JSON.stringify(n).padEnd(25)}: ACCEPTED`);
    await db.from('customers').delete().eq('id', data.id);
  }
}

// Find existing customers with non-null neighborhood to see format
console.log('\n=== existing neighborhoods in DB ===');
const { data: rows } = await db
  .from('customers')
  .select('neighborhood')
  .not('neighborhood', 'is', null)
  .limit(30);
console.log([...new Set((rows || []).map(r => r.neighborhood))]);
