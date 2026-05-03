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

// Target: user's real number (verified from earlier debug output: 62816104334)
const USER_PHONE = '62816104334';
const USER_CHAT_ID = `${USER_PHONE}@c.us`;
const USER_NAME = 'Vilca';

console.log('=== Seeding test conversation ===');

// 1. Ensure a customer exists with this phone + a name (for the nudge greeting)
let { data: customer } = await db.from('customers').select('id, name').eq('phone', USER_PHONE).maybeSingle();
if (!customer) {
  const { data: inserted } = await db.from('customers').insert({
    name: USER_NAME,
    phone: USER_PHONE,
    address: 'Test',
    segment: 'new',
    acquisition_source: 'whatsapp',
  }).select('id, name').single();
  customer = inserted;
  console.log('  created customer:', customer.id);
} else {
  // Ensure name is set so the nudge greeting works
  if (customer.name === 'WhatsApp User' || !customer.name) {
    await db.from('customers').update({ name: USER_NAME }).eq('id', customer.id);
    console.log('  updated customer name to', USER_NAME);
  } else {
    console.log('  existing customer:', customer.id, '(name:', customer.name + ')');
  }
}

// 2. Upsert conversation with last_message_at set to 3h ago
const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
const testMessages = [
  { role: 'user', content: 'halo', timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString() },
  {
    role: 'assistant',
    content: `Halo! Aku Shera dari Castudio 😊 Boleh tau namanya siapa ya?`,
    timestamp: new Date(Date.now() - 3.2 * 60 * 60 * 1000).toISOString(),
  },
  { role: 'user', content: USER_NAME, timestamp: new Date(Date.now() - 3.1 * 60 * 60 * 1000).toISOString() },
  {
    role: 'assistant',
    content: `Salam kenal kak ${USER_NAME} 😊\n\nKastudio itu layanan cuci & detailing premium yang datang ke kamu.`,
    timestamp: threeHoursAgo,
  },
];

const { data: existingConvo } = await db.from('whatsapp_conversations').select('chat_id').eq('chat_id', USER_CHAT_ID).maybeSingle();
if (existingConvo) {
  await db.from('whatsapp_conversations').update({
    customer_id: customer.id,
    messages: testMessages,
    last_message_at: threeHoursAgo,
    retry_queue: null,
  }).eq('chat_id', USER_CHAT_ID);
  console.log('  updated existing conversation to 3h-ago ghosted state');
} else {
  await db.from('whatsapp_conversations').insert({
    chat_id: USER_CHAT_ID,
    phone: USER_PHONE,
    customer_id: customer.id,
    messages: testMessages,
    last_message_at: threeHoursAgo,
  });
  console.log('  inserted new conversation');
}

// 3. Clear any bulk_order escalation so silence check doesn't block us
await db.from('human_escalations').delete().eq('chat_id', USER_CHAT_ID).eq('category', 'bulk_order');

console.log('\n=== Triggering nudge cron ===');
const CRON_SECRET = env.CRON_SECRET;
if (!CRON_SECRET) {
  // Pull from vercel env
  console.log('  CRON_SECRET not in .env.local; pulling from prod...');
  const { execSync } = await import('node:child_process');
  try {
    execSync('vercel env pull .env.verify.tmp --environment=production --yes', { stdio: 'pipe' });
    const vraw = readFileSync('.env.verify.tmp', 'utf8');
    const venv = Object.fromEntries(
      vraw.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#') && l.includes('=')).map(l => {
        const i = l.indexOf('=');
        let v = l.slice(i + 1);
        if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
        return [l.slice(0, i), v];
      })
    );
    process.env.CRON_SECRET = venv.CRON_SECRET;
    execSync('rm .env.verify.tmp');
  } catch (e) { console.log('  failed to pull:', e.message); process.exit(1); }
}

const res = await fetch('https://castudio.id/api/cron/nudge', {
  headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
});
const body = await res.json();
console.log('  HTTP', res.status, body);

// 5. Re-read the conversation to see if a ghost-nudge message was appended
console.log('\n=== Post-nudge conversation state ===');
const { data: after } = await db.from('whatsapp_conversations').select('messages, last_message_at').eq('chat_id', USER_CHAT_ID).single();
const nudgeMsg = Array.isArray(after.messages) ? after.messages.find(m => m.context === 'ghost-nudge') : null;
if (nudgeMsg) {
  console.log('  ✓ Nudge delivered:');
  console.log('    content:', nudgeMsg.content);
  console.log('    timestamp:', nudgeMsg.timestamp);
} else {
  console.log('  ✗ No ghost-nudge message found. Something skipped the nudge.');
  console.log('  messages count:', after.messages?.length);
}
