import { readFileSync } from 'node:fs';

const envRaw = readFileSync('.env.vercel.tmp', 'utf8');
const env = Object.fromEntries(
  envRaw.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => {
      const i = l.indexOf('=');
      let v = l.slice(i + 1).trim();
      if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
      return [l.slice(0, i).trim(), v];
    })
);

const WAHA_URL = env.WAHA_API_URL.replace(/\\n$/, '').trim();
const WAHA_KEY = env.WAHA_API_KEY.replace(/\\n$/, '').trim();

const headers = { 'X-Api-Key': WAHA_KEY, 'Content-Type': 'application/json' };

// 1. Check WAHA recent chats — what @lid or @c.us did it see?
console.log('\n=== /api/default/chats (latest 5) ===');
try {
  const r = await fetch(`${WAHA_URL}/api/default/chats?limit=5&sortBy=conversationTimestamp&sortOrder=desc`, { headers });
  const txt = await r.text();
  console.log('HTTP', r.status);
  try {
    const js = JSON.parse(txt);
    console.log(JSON.stringify(js.map(c => ({
      id: c.id,
      name: c.name,
      conversationTimestamp: c.conversationTimestamp,
      unreadCount: c.unreadCount,
      lastMessage: c.lastMessage?.body?.slice(0, 80),
    })), null, 2));
  } catch { console.log(txt.slice(0, 400)); }
} catch (e) { console.log('FAIL', e.message); }

// 2. Try sendText to the @lid-derived chat_id (SHOULD FAIL with fake phone)
console.log('\n=== sendText to 1013629112414@c.us (the @lid-derived id) ===');
try {
  const r = await fetch(`${WAHA_URL}/api/sendText`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ session: 'default', chatId: '1013629112414@c.us', text: '[diag]' }),
  });
  console.log('HTTP', r.status, (await r.text()).slice(0, 400));
} catch (e) { console.log('FAIL', e.message); }

// 3. Try the original @lid form directly
console.log('\n=== sendText to 1013629112414@lid (original @lid form) ===');
try {
  const r = await fetch(`${WAHA_URL}/api/sendText`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ session: 'default', chatId: '1013629112414@lid', text: '[diag]' }),
  });
  console.log('HTTP', r.status, (await r.text()).slice(0, 400));
} catch (e) { console.log('FAIL', e.message); }

// 4. Query WAHA contacts for the @lid
console.log('\n=== /api/contacts for 1013629112414@lid ===');
try {
  const r = await fetch(`${WAHA_URL}/api/contacts?session=default&contactId=1013629112414@lid`, { headers });
  console.log('HTTP', r.status, (await r.text()).slice(0, 400));
} catch (e) { console.log('FAIL', e.message); }

// 5. Server status
console.log('\n=== /api/server/status ===');
try {
  const r = await fetch(`${WAHA_URL}/api/server/status`, { headers });
  console.log('HTTP', r.status, (await r.text()).slice(0, 200));
} catch (e) { console.log('FAIL', e.message); }

// 6. Version
console.log('\n=== /api/server/version ===');
try {
  const r = await fetch(`${WAHA_URL}/api/server/version`, { headers });
  console.log('HTTP', r.status, (await r.text()).slice(0, 300));
} catch (e) { console.log('FAIL', e.message); }
