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

// 1. What customers exist now?
console.log('=== customers ===');
const { data: custs } = await db.from('customers').select('id, name, phone, neighborhood, acquisition_source').limit(20);
console.log(JSON.stringify(custs, null, 2));

// 2. Try a test insert mimicking the form submit
console.log('\n=== test insert with form values ===');
const { data: inserted, error } = await db
  .from('customers')
  .insert({
    name: 'Debug Test',
    phone: '628888888888',
    car_model: 'TestCar',
    plate_number: 'B1234XY',
    address: 'Test address',
    neighborhood: 'Jakarta Pusat',
    segment: 'new',
    acquisition_source: 'whatsapp_form',
  })
  .select('id')
  .single();
console.log('error:', error);
console.log('inserted:', inserted);

// Clean up the test insert if it worked
if (inserted) {
  await db.from('customers').delete().eq('id', inserted.id);
  console.log('(test row cleaned up)');
}

