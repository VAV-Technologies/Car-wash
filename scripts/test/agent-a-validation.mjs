// Agent A: validation gauntlet — try to break the API, expect 400s only,
// flag any 200 (let bad data through), 500 (crash), or non-JSON response.
// All payloads should fail validation BEFORE any DB row is created.
import { API, db } from './_env.mjs';

const cases = [];

function add(name, body, expect = '400', opts = {}) {
  cases.push({ name, body, expect, opts });
}

// 1. Empty body
add('empty body', {});

// 2. Missing each required field individually
const valid = {
  name: 'Test User', phone: '08123456789', service_type: 'standard_wash',
  car_model: 'Toyota Avanza', plate_number: 'B 1234 XYZ',
  area: 'Jakarta Selatan', address: 'Jl. Sudirman No. 1, RT 01',
  date: '2026-05-21', time: '14:00',
};
for (const k of ['name','phone','service_type','car_model','plate_number','address','date','time']) {
  const b = { ...valid }; delete b[k];
  add(`missing.${k}`, b);
}

// 3. Service: invalid values
add('service.invalid', { ...valid, service_type: 'super_premium' });
add('service.empty', { ...valid, service_type: '' });
add('service.null', { ...valid, service_type: null });
add('service.number', { ...valid, service_type: 42 });
add('service.array', { ...valid, service_type: ['standard_wash'] });

// 4. Area
add('area.invalid', { ...valid, area: 'Atlantis' });
add('area.case-mismatch', { ...valid, area: 'jakarta selatan' });
add('area.empty-string', { ...valid, area: '' });  // optional → should be accepted; will probably 200 (creates DB row!)
                                                     // we'll guard by also breaking name, see below
add('area.empty-and-bad-name', { ...valid, area: '', name: 'a' });
add('area.array', { ...valid, area: ['Jakarta Selatan'] });

// 5. Phone
add('phone.too-short', { ...valid, phone: '123' });
add('phone.alpha', { ...valid, phone: 'abcdefgh' });
add('phone.spaces', { ...valid, phone: '+62 812 3456 789' });
add('phone.unicode', { ...valid, phone: '📞📞📞📞📞📞📞📞' });
add('phone.huge', { ...valid, phone: '0' + '8'.repeat(5000) });
add('phone.null', { ...valid, phone: null });
add('phone.number-type', { ...valid, phone: 8123456789 });

// 6. Name
add('name.1char', { ...valid, name: 'a' });
add('name.5000chars', { ...valid, name: 'X'.repeat(5000), phone: '12' /* keep invalid to avoid DB write */ });
add('name.whitespace', { ...valid, name: '   ' });
add('name.null', { ...valid, name: null });
add('name.object', { ...valid, name: { hi: 1 } });
add('name.script-tag', { ...valid, name: '<script>alert(1)</script>', phone: '12' });
add('name.sql-inject', { ...valid, name: "Robert'); DROP TABLE customers;--", phone: '12' });

// 7. Address
add('address.too-short', { ...valid, address: 'x' });
add('address.huge', { ...valid, address: 'Y'.repeat(50000), phone: '12' });

// 8. Plate
add('plate.empty', { ...valid, plate_number: '' });
add('plate.spaces', { ...valid, plate_number: '   ' });

// 9. Date format
add('date.bad-string', { ...valid, date: 'yesterday' });
add('date.bad-month', { ...valid, date: '2026-13-45' });
add('date.us-format', { ...valid, date: '05/05/2026' });
add('date.null', { ...valid, date: null });
add('date.99', { ...valid, date: '2099-99-99' });

// 10. Date semantics
add('date.past', { ...valid, date: '2024-01-01' });
add('date.today-no-buffer', { ...valid, date: new Date().toISOString().split('T')[0], phone: '12' /* keep invalid */ });
add('date.monday', { ...valid, date: '2026-05-11' /* Monday */, phone: '12' });
add('date.far-future', { ...valid, date: '2099-12-31', phone: '12' /* keep invalid */ });

// 11. Time
add('time.9am-string', { ...valid, time: '9am' });
add('time.bad-hour', { ...valid, time: '25:00' });
add('time.bad-min', { ...valid, time: '10:60' });  // server only checks hour, this passes — note
add('time.empty', { ...valid, time: '' });
add('time.short', { ...valid, time: '10' });
add('time.with-secs', { ...valid, time: '10:00:00' });
add('time.before-hours', { ...valid, time: '09:00' });
add('time.18', { ...valid, time: '18:00' /* hour > 17 → reject */ });
add('time.23', { ...valid, time: '23:00' });
add('time.null', { ...valid, time: null });

// 12. Wrong content-type / malformed body
cases.push({ name: 'content-type.text-plain', body: valid, opts: { contentType: 'text/plain' }, expect: '400/500' });
cases.push({ name: 'malformed-json', rawBody: '{name:broken', opts: {}, expect: '400/500' });
cases.push({ name: 'empty-string-body', rawBody: '', opts: {}, expect: '400/500' });
cases.push({ name: 'non-json-string-body', rawBody: '"hello"', opts: {}, expect: '400/500' });

const results = [];

for (const c of cases) {
  const headers = { 'Content-Type': c.opts?.contentType || 'application/json' };
  const fetchOpts = { method: 'POST', headers };
  if (c.rawBody !== undefined) fetchOpts.body = c.rawBody;
  else fetchOpts.body = JSON.stringify(c.body);

  let status = 0, bodyText = '', parsed = null, parseOk = false;
  try {
    const res = await fetch(API, fetchOpts);
    status = res.status;
    bodyText = await res.text();
    try { parsed = JSON.parse(bodyText); parseOk = true; } catch {}
  } catch (e) {
    results.push({ name: c.name, status: 'NETWORK_ERR', verdict: 'CRASH', detail: e.message });
    continue;
  }

  let verdict = 'PASS';
  let detail = '';
  if (status >= 500) {
    verdict = 'CRASH';
    detail = `HTTP ${status} — ${bodyText.slice(0, 200)}`;
  } else if (status === 200 && parsed?.ok === true) {
    verdict = 'FAIL';
    detail = `accepted bad input, created booking_ids=${JSON.stringify(parsed.booking_ids)}`;
  } else if (status === 400 && parseOk && (parsed?.errors || parsed?.error)) {
    verdict = 'PASS';
    detail = parsed.errors ? Object.keys(parsed.errors).join(',') : parsed.error;
  } else if (status === 400 && !parseOk) {
    verdict = 'WARN';
    detail = `400 but non-JSON body: ${bodyText.slice(0, 100)}`;
  } else {
    verdict = 'WARN';
    detail = `unexpected: HTTP ${status} body=${bodyText.slice(0, 100)}`;
  }

  results.push({ name: c.name, status, verdict, detail });
}

// Print results
const counts = { PASS: 0, WARN: 0, FAIL: 0, CRASH: 0 };
for (const r of results) counts[r.verdict]++;

console.log('\n══ AGENT A: VALIDATION GAUNTLET ══');
console.log(`Total: ${results.length}  PASS: ${counts.PASS}  WARN: ${counts.WARN}  FAIL: ${counts.FAIL}  CRASH: ${counts.CRASH}`);
console.log();

for (const r of results) {
  if (r.verdict !== 'PASS') {
    console.log(`  [${r.verdict}] ${r.name.padEnd(30)} HTTP ${r.status}  ${r.detail}`);
  }
}

// Leak check: any rows created in customers in last 5 minutes?
const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
const { data: recentCustomers, error: rcErr } = await db
  .from('customers')
  .select('id, phone, name, created_at')
  .gt('created_at', fiveMinAgo)
  .order('created_at', { ascending: false })
  .limit(20);

console.log('\n── DB LEAK CHECK ──');
if (rcErr) {
  console.log(`  ERROR: ${rcErr.message}`);
} else if (recentCustomers && recentCustomers.length > 0) {
  console.log(`  ⚠ ${recentCustomers.length} customer rows created in last 5min — review:`);
  for (const c of recentCustomers) {
    console.log(`    ${c.created_at}  ${c.phone}  ${c.name}`);
  }
} else {
  console.log('  ✓ no customer rows leaked');
}

process.exit(counts.CRASH > 0 || counts.FAIL > 0 ? 1 : 0);
