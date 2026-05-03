// Mirror the exact submitBookingLink flow with service role
// to see what actually fails
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

function cleanPhone(phone) {
  let p = phone.replace(/[\s\-+()]/g, '');
  if (p.startsWith('08')) p = '62' + p.slice(1);
  if (p.startsWith('8') && p.length >= 10) p = '62' + p;
  return p;
}

// Same exact body the client sends on submit for test-44c5d6
const phone = '629999992430';
const cleanedPhone = cleanPhone(phone);

console.log('cleanedPhone:', cleanedPhone);

// Step 1: customer lookup (same as submitBookingLink)
console.log('\n=== customer lookup ===');
const lookup = await db
  .from('customers')
  .select('id')
  .or(`phone.ilike.%${cleanedPhone}%`)
  .limit(1)
  .single();
console.log('data:', lookup.data);
console.log('error:', lookup.error);

// Step 2: if null, try insert (same as submitBookingLink)
if (!lookup.data) {
  console.log('\n=== customer insert ===');
  const ins = await db
    .from('customers')
    .insert({
      name: 'Debug Test',
      phone: cleanedPhone,
      car_model: 'TestCar',
      plate_number: 'B1234XY',
      address: 'Test address',
      neighborhood: 'Jakarta Pusat',
      segment: 'new',
      acquisition_source: 'whatsapp',
    })
    .select('id')
    .single();
  console.log('data:', ins.data);
  console.log('error:', ins.error);
  if (ins.data) {
    await db.from('customers').delete().eq('id', ins.data.id);
    console.log('(cleaned up test row)');
  }
} else {
  console.log('\n=== customer already exists, would UPDATE not INSERT ===');
  // Show what exists
  const { data } = await db.from('customers').select('*').eq('id', lookup.data.id).single();
  console.log(JSON.stringify(data, null, 2));
}

// Also check if any customer has this phone in any form
console.log('\n=== all customers matching phone ===');
const { data: all } = await db
  .from('customers')
  .select('id, name, phone, acquisition_source')
  .ilike('phone', `%${cleanedPhone.slice(-8)}%`);
console.log(JSON.stringify(all, null, 2));
