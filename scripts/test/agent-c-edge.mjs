// Agent C: edge cases + concurrency.
// Tests page surface (/book, /book/[token] redirect, prefill), race conditions
// on the customer create path, and weird HTTP edge cases.
import { API, db } from './_env.mjs';

const BASE = 'http://localhost:9002';
const PHONE_PREFIX = '08555200';
const DB_PHONE_PREFIX = '628555200';

let pass = 0, fail = 0, notable = 0;
const log = (kind, scenario, msg) => {
  console.log(`  [${kind}] ${scenario}: ${msg}`);
  if (kind === 'PASS') pass++;
  else if (kind === 'FAIL') fail++;
  else notable++;
};

console.log('\n══ AGENT C: EDGE CASES + CONCURRENCY ══');

// ─── Scenario 1: /book GET ──────────────────────────────────────────
{
  const res = await fetch(`${BASE}/book`);
  const html = await res.text();
  if (res.status !== 200) log('FAIL', '1a /book GET', `status ${res.status}`);
  else if (!html.includes('Mau cuci atau detailing')) log('FAIL', '1a /book GET', `kategori heading missing`);
  else if (!html.includes('Castudio')) log('FAIL', '1a /book GET', `Castudio brand missing`);
  else log('PASS', '1a /book GET', `200 + heading + brand present`);
}

// ─── Scenario 1b: legacy /book/[token] redirect ─────────────────────
{
  const res = await fetch(`${BASE}/book/oldtoken123`, { redirect: 'manual' });
  // Next.js redirect() returns 307 or 308 typically
  if ([301, 302, 307, 308].includes(res.status) && res.headers.get('location')?.endsWith('/book')) {
    log('PASS', '1b /book/[token] redirect', `${res.status} → ${res.headers.get('location')}`);
  } else {
    log('FAIL', '1b /book/[token] redirect', `unexpected status ${res.status} location=${res.headers.get('location')}`);
  }
}

// ─── Scenario 2: Prefill via URL params ─────────────────────────────
{
  const url = `${BASE}/book?name=Budi&phone=08123456789&service=standard_wash&area=Bogor`;
  const res = await fetch(url);
  if (res.status === 200) log('PASS', '2 prefill URL params', `200 (prefill executes client-side, server-render ok)`);
  else log('FAIL', '2 prefill URL params', `status ${res.status}`);
}

// ─── Scenario 3: Race condition — 5 parallel POSTs same phone+slot ─
{
  const phone = `${PHONE_PREFIX}010`; // → 628555200010
  const payload = {
    name: 'Race Tester', phone,
    service_type: 'standard_wash',
    car_model: 'Honda CRV',
    plate_number: 'B 5555 RAC',
    area: 'Jakarta Selatan',
    address: 'Jl. Race Conditions No. 5',
    date: '2026-05-21', time: '15:00',
  };
  const promises = Array.from({ length: 5 }, () =>
    fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(r => r.json().then(j => ({ status: r.status, json: j })).catch(() => ({ status: r.status, json: {} })))
      .catch(e => ({ status: 'ERR', err: e.message }))
  );
  const results = await Promise.all(promises);
  const okCount = results.filter(r => r.status === 200).length;
  const errCount = results.filter(r => r.status !== 200).length;

  // wait briefly so DB is consistent
  await new Promise(r => setTimeout(r, 500));
  const { data: custs } = await db.from('customers').select('id').eq('phone', `${DB_PHONE_PREFIX}010`);
  const custCount = custs?.length || 0;
  let bookCount = 0;
  if (custs) for (const c of custs) {
    const { count } = await db.from('bookings').select('id', { count: 'exact', head: true }).eq('customer_id', c.id);
    bookCount += count || 0;
  }

  // Findings:
  // - okCount === 5: all bookings accepted (expected since no slot-conflict check)
  // - custCount === 1: insert path serialized correctly (good)
  // - custCount > 1: race condition created duplicate customer rows (note as concern)
  // - bookCount === 5: every accepted booking landed (expected)
  if (custCount === 1 && bookCount === okCount) {
    log('NOTE', '3 race condition', `${okCount}/5 bookings accepted, 1 customer, ${bookCount} bookings — no dup customer race, but no slot-conflict check (5 bookings same slot allowed)`);
  } else if (custCount > 1) {
    log('NOTE', '3 race condition', `⚠ DUPLICATE CUSTOMER RACE: ${custCount} rows for same phone, ${okCount}/5 ok, ${bookCount} bookings`);
  } else {
    log('NOTE', '3 race condition', `${okCount}/5 ok, custCount=${custCount}, bookCount=${bookCount}, ${errCount} non-200`);
  }
}

// ─── Scenario 4: Malformed JSON ─────────────────────────────────────
{
  try {
    const res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{name:broken' });
    const text = await res.text();
    if (res.status >= 500) log('NOTE', '4 malformed JSON', `HTTP ${res.status} (server crashed on parse — generic 500 catch); body: ${text.slice(0, 100)}`);
    else if (res.status === 400) log('PASS', '4 malformed JSON', `HTTP 400 (clean rejection)`);
    else log('NOTE', '4 malformed JSON', `unexpected HTTP ${res.status}: ${text.slice(0, 80)}`);
  } catch (e) {
    log('FAIL', '4 malformed JSON', `network error: ${e.message}`);
  }
}

// ─── Scenario 5: Wrong content-type ─────────────────────────────────
{
  try {
    const validBody = JSON.stringify({ name: 'X', phone: '12345678', service_type: 'standard_wash', car_model: 'X', plate_number: 'XXX', address: 'xxxxx', date: '2026-05-21', time: '14:00' });
    const res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: validBody });
    log('NOTE', '5 wrong content-type', `HTTP ${res.status} — Next still parsed body since req.json() ignores Content-Type`);
  } catch (e) {
    log('FAIL', '5 wrong content-type', `network error: ${e.message}`);
  }
}

// ─── Scenario 6: Oversized body ─────────────────────────────────────
{
  try {
    const huge = { name: 'X'.repeat(5_000_000), phone: '08' };
    const res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(huge) });
    const text = await res.text().catch(() => '');
    log('NOTE', '6 oversized body (5MB)', `HTTP ${res.status} body=${text.slice(0, 80)}`);
  } catch (e) {
    log('NOTE', '6 oversized body (5MB)', `fetch threw: ${e.message}`);
  }
}

// ─── Scenario 7: OPTIONS preflight ──────────────────────────────────
{
  try {
    const res = await fetch(API, { method: 'OPTIONS' });
    log('NOTE', '7 OPTIONS preflight', `HTTP ${res.status} (no explicit OPTIONS handler in route)`);
  } catch (e) {
    log('FAIL', '7 OPTIONS preflight', `${e.message}`);
  }
}

// ─── Scenario 8: Empty body POST ────────────────────────────────────
{
  try {
    const res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
    const text = await res.text();
    if (res.status >= 500) log('NOTE', '8 empty body', `HTTP ${res.status} — req.json() likely threw`);
    else log('PASS', '8 empty body', `HTTP ${res.status}: ${text.slice(0, 80)}`);
  } catch (e) {
    log('FAIL', '8 empty body', `${e.message}`);
  }
}

// ─── Server alive check ─────────────────────────────────────────────
{
  const res = await fetch(`${BASE}/book`);
  if (res.status === 200) console.log('  ✓ dev server still alive after all tests');
  else console.log(`  ⚠ dev server returned ${res.status} after tests`);
}

// ─── Cleanup ────────────────────────────────────────────────────────
console.log('\n── CLEANUP ──');
const { data: testCustomers } = await db.from('customers').select('id, phone').like('phone', `${DB_PHONE_PREFIX}%`);
let bookDel = 0;
for (const c of testCustomers || []) {
  const { count } = await db.from('bookings').delete({ count: 'exact' }).eq('customer_id', c.id);
  bookDel += count || 0;
}
const { count: cd } = await db.from('customers').delete({ count: 'exact' }).like('phone', `${DB_PHONE_PREFIX}%`);
console.log(`  deleted ${bookDel} bookings + ${cd || 0} customers`);

const { data: leftover } = await db.from('customers').select('phone').like('phone', `${DB_PHONE_PREFIX}%`);
console.log(leftover?.length > 0 ? `  ⚠ ${leftover.length} leftover` : '  ✓ namespace clean');

console.log(`\n══ AGENT C SUMMARY ══`);
console.log(`PASS: ${pass}  FAIL: ${fail}  NOTE: ${notable}`);
process.exit(fail > 0 ? 1 : 0);
