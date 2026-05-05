// Diagnose the customer insert failure that's killing all happy-path tests.
import { db } from './_env.mjs';

console.log('Probing customers INSERT with the same shape /api/book uses...\n');

const probe = {
  name: 'Diag Test',
  phone: '628999000001',
  car_model: 'Test',
  plate_number: 'TEST1234',
  address: 'test address 12345',
  area: 'Jakarta Selatan',
  segment: 'new',
  acquisition_source: 'form',
};

const { data, error } = await db
  .from('customers')
  .insert(probe)
  .select('id, area, acquisition_source, segment')
  .single();

if (error) {
  console.log('INSERT FAILED:');
  console.log(`  code:    ${error.code}`);
  console.log(`  message: ${error.message}`);
  console.log(`  details: ${error.details}`);
  console.log(`  hint:    ${error.hint}`);
} else {
  console.log('INSERT SUCCEEDED:', data);
  // Cleanup
  await db.from('customers').delete().eq('id', data.id);
  console.log('cleaned up.');
}

// Also probe what acquisition_source values are valid
console.log('\nProbing acquisition_source values...');
const candidates = ['form', 'whatsapp', 'website', 'referral', 'walk_in', 'instagram', 'organic', 'manual'];
for (const src of candidates) {
  const { data: d, error: e } = await db
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
  if (e) console.log(`  ${src.padEnd(12)} REJECTED (${e.code}): ${e.message}`);
  else {
    console.log(`  ${src.padEnd(12)} ACCEPTED`);
    await db.from('customers').delete().eq('id', d.id);
  }
}
