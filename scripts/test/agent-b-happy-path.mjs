// Agent B: happy-path E2E with Supabase verification.
// Submits real bookings, verifies rows, then deletes everything in the
// 628555100xxx phone namespace.
import { API, db } from './_env.mjs';

const PHONE_PREFIX = '08555100'; // cleanPhone normalizes to 628555100
const DB_PHONE_PREFIX = '628555100';

let pass = 0, fail = 0;
const log = (kind, scenario, msg) => {
  console.log(`  [${kind}] scenario ${scenario}: ${msg}`);
  if (kind === 'PASS') pass++;
  else fail++;
};

async function postBooking(payload) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

const baseDate = '2026-05-21'; // Thursday, 16d out — passes lead-time + Monday checks
const baseTime = '14:00';

console.log('\n══ AGENT B: HAPPY-PATH E2E ══');

// ─── Scenario 1: Standard wash booking ──────────────────────────────
{
  const phone = `${PHONE_PREFIX}100`;
  const r = await postBooking({
    name: 'Budi Santoso', phone,
    service_type: 'standard_wash',
    car_model: 'Toyota Avanza',
    plate_number: 'B 1001 ABC',
    area: 'Jakarta Selatan',
    address: 'Jl. Sudirman No. 1, Jakarta Selatan',
    date: baseDate, time: baseTime,
  });
  if (r.status !== 200) {
    log('FAIL', 1, `POST returned ${r.status}: ${JSON.stringify(r.json)}`);
  } else {
    const dbPhone = `${DB_PHONE_PREFIX}100`;
    const { data: cust } = await db.from('customers').select('id, name, phone, area, address, car_model, plate_number').eq('phone', dbPhone).single();
    if (!cust) log('FAIL', 1, `customer row not found for phone ${dbPhone}`);
    else if (cust.area !== 'Jakarta Selatan') log('FAIL', 1, `area mismatch: got "${cust.area}"`);
    else if (cust.name !== 'Budi Santoso') log('FAIL', 1, `name mismatch: got "${cust.name}"`);
    else if (cust.plate_number !== 'B 1001 ABC') log('FAIL', 1, `plate mismatch: got "${cust.plate_number}"`);
    else {
      const { data: bookings } = await db.from('bookings').select('id, service_type, scheduled_date, scheduled_time, status').eq('customer_id', cust.id);
      if (!bookings || bookings.length !== 1) log('FAIL', 1, `expected 1 booking, got ${bookings?.length}`);
      else if (bookings[0].service_type !== 'standard_wash') log('FAIL', 1, `service mismatch: ${bookings[0].service_type}`);
      else if (bookings[0].scheduled_date !== baseDate) log('FAIL', 1, `date mismatch: ${bookings[0].scheduled_date}`);
      else if (bookings[0].status !== 'confirmed') log('FAIL', 1, `status mismatch: ${bookings[0].status}`);
      else log('PASS', 1, `customer ${cust.id.slice(0, 8)} + booking ${bookings[0].id.slice(0, 8)} ok, area=Jakarta Selatan`);
    }
  }
}

// ─── Scenario 2: Detailing + add_wash → 2 bookings ──────────────────
{
  const phone = `${PHONE_PREFIX}110`;
  const r = await postBooking({
    name: 'Sari Detail', phone,
    service_type: 'full_detail',
    car_model: 'Mercedes-Benz C200',
    plate_number: 'B 2002 DEF',
    area: 'Bogor',
    address: 'Jl. Pajajaran No. 99, Bogor',
    date: baseDate, time: '10:00',
    add_wash: true,
  });
  if (r.status !== 200) {
    log('FAIL', 2, `POST returned ${r.status}: ${JSON.stringify(r.json)}`);
  } else if (!Array.isArray(r.json.booking_ids) || r.json.booking_ids.length !== 2) {
    log('FAIL', 2, `expected 2 booking_ids, got ${JSON.stringify(r.json.booking_ids)}`);
  } else {
    const dbPhone = `${DB_PHONE_PREFIX}110`;
    const { data: cust } = await db.from('customers').select('id, area').eq('phone', dbPhone).single();
    const { data: bookings } = await db.from('bookings').select('id, service_type, scheduled_date, scheduled_time, notes').eq('customer_id', cust.id).order('created_at');
    if (bookings.length !== 2) log('FAIL', 2, `expected 2 bookings in DB, got ${bookings.length}`);
    else {
      const types = bookings.map(b => b.service_type).sort();
      if (types[0] !== 'full_detail' || types[1] !== 'standard_wash') {
        log('FAIL', 2, `service types: ${JSON.stringify(types)}`);
      } else if (cust.area !== 'Bogor') {
        log('FAIL', 2, `area mismatch: ${cust.area}`);
      } else {
        log('PASS', 2, `2 bookings (full_detail + standard_wash prereq) created, area=Bogor`);
      }
    }
  }
}

// ─── Scenario 3: Phone normalization ────────────────────────────────
{
  // 3a: spaces in phone
  const r1 = await postBooking({
    name: 'Eka Spaces', phone: '0855 5100 200',
    service_type: 'standard_wash',
    car_model: 'Honda Brio',
    plate_number: 'B 3003 GHI',
    area: 'Tangerang Selatan',
    address: 'BSD City Sektor 1, Tangerang Selatan',
    date: baseDate, time: '11:00',
  });
  // 3b: +62 prefix
  const r2 = await postBooking({
    name: 'Doni Plus', phone: '+62 855 5100 201',
    service_type: 'standard_wash',
    car_model: 'Honda Jazz',
    plate_number: 'B 3004 JKL',
    area: 'Tangerang Selatan',
    address: 'BSD City Sektor 2, Tangerang Selatan',
    date: baseDate, time: '12:00',
  });
  if (r1.status !== 200 || r2.status !== 200) {
    log('FAIL', 3, `phone-normalization POSTs failed: ${r1.status}/${r2.status}`);
  } else {
    const { data: c1 } = await db.from('customers').select('id, phone').eq('phone', `${DB_PHONE_PREFIX}200`).maybeSingle();
    const { data: c2 } = await db.from('customers').select('id, phone').eq('phone', `${DB_PHONE_PREFIX}201`).maybeSingle();
    if (!c1) log('FAIL', '3a', `expected phone ${DB_PHONE_PREFIX}200 (from "0855 5100 200"), not found`);
    else if (!c2) log('FAIL', '3b', `expected phone ${DB_PHONE_PREFIX}201 (from "+62 855 5100 201"), not found`);
    else log('PASS', 3, `phones normalized: spaces+0855 → ${c1.phone}, +62 → ${c2.phone}`);
  }
}

// ─── Scenario 4: "Book Lagi" — same phone, different car ────────────
{
  const phone = `${PHONE_PREFIX}100`; // reuse scenario 1's phone
  const r = await postBooking({
    name: 'Budi Santoso', phone,
    service_type: 'standard_wash',
    car_model: 'BMW 320i',
    plate_number: 'B 9999 ZZZ',
    area: 'Jakarta Selatan',
    address: 'Jl. Sudirman No. 1, Jakarta Selatan',
    date: baseDate, time: '15:00',
  });
  if (r.status !== 200) {
    log('FAIL', 4, `POST returned ${r.status}: ${JSON.stringify(r.json)}`);
  } else {
    const dbPhone = `${DB_PHONE_PREFIX}100`;
    const { count: custCount } = await db.from('customers').select('id', { count: 'exact', head: true }).eq('phone', dbPhone);
    const { data: cust } = await db.from('customers').select('id, car_model, plate_number').eq('phone', dbPhone).single();
    const { count: bookCount } = await db.from('bookings').select('id', { count: 'exact', head: true }).eq('customer_id', cust.id);
    if (custCount !== 1) log('FAIL', 4, `customer count = ${custCount} (should be 1, no duplicate)`);
    else if (bookCount !== 2) log('FAIL', 4, `expected 2 bookings for this customer (scenario 1 + 4), got ${bookCount}`);
    else if (cust.car_model !== 'BMW 320i') log('FAIL', 4, `customer car_model not updated, got "${cust.car_model}"`);
    else log('PASS', 4, `same customer (1 row), 2 bookings, car_model updated → BMW 320i`);
  }
}

// ─── Scenario 5: area persistence audit across all test customers ──
{
  const { data: testCustomers } = await db.from('customers').select('phone, area').like('phone', `${DB_PHONE_PREFIX}%`);
  const missingArea = testCustomers.filter(c => !c.area);
  if (missingArea.length > 0) {
    log('FAIL', 5, `${missingArea.length} test customers missing area: ${missingArea.map(c => c.phone).join(',')}`);
  } else {
    const summary = testCustomers.map(c => `${c.phone.slice(-3)}=${c.area}`).join(', ');
    log('PASS', 5, `all ${testCustomers.length} test customers have area: ${summary}`);
  }
}

// ─── Cleanup ────────────────────────────────────────────────────────
console.log('\n── CLEANUP ──');
const { data: testCustomers } = await db.from('customers').select('id, phone').like('phone', `${DB_PHONE_PREFIX}%`);
let bookDel = 0, custDel = 0;
for (const c of testCustomers || []) {
  const { count } = await db.from('bookings').delete({ count: 'exact' }).eq('customer_id', c.id);
  bookDel += count || 0;
}
const { count: cd } = await db.from('customers').delete({ count: 'exact' }).like('phone', `${DB_PHONE_PREFIX}%`);
custDel = cd || 0;
console.log(`  deleted ${bookDel} bookings + ${custDel} customers`);

// Verify cleanup
const { data: leftover } = await db.from('customers').select('phone').like('phone', `${DB_PHONE_PREFIX}%`);
if (leftover && leftover.length > 0) {
  console.log(`  ⚠ ${leftover.length} test customers still remain — manual cleanup needed`);
} else {
  console.log(`  ✓ namespace clean`);
}

console.log(`\n══ AGENT B SUMMARY ══`);
console.log(`PASS: ${pass}  FAIL: ${fail}`);
process.exit(fail > 0 ? 1 : 0);
