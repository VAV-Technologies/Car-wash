// Diagnostic: inspect agent_settings, connectors, recent whatsapp_conversation, and test WAHA
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

function loadEnv(path) {
  const raw = readFileSync(path, 'utf8');
  return Object.fromEntries(
    raw.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#') && l.includes('='))
      .map(l => {
        const i = l.indexOf('=');
        let v = l.slice(i + 1).trim();
        if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
        return [l.slice(0, i).trim(), v];
      })
  );
}

const local = loadEnv('.env.local');
const prod = loadEnv('.env.vercel.tmp');

const db = createClient(local.NEXT_PUBLIC_SUPABASE_URL.replace(/\\n$/, ''), local.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

console.log('\n=== PRODUCTION ENV LENGTHS ===');
for (const k of ['ANTHROPIC_API_KEY', 'XAI_API_KEY', 'AZURE_OPENAI_KEY', 'AZURE_OPENAI_ENDPOINT', 'AZURE_OPENAI_DEPLOYMENT', 'WAHA_API_URL', 'WAHA_API_KEY', 'WAHA_WEBHOOK_SECRET']) {
  const v = prod[k];
  console.log(`${k}: ${v === undefined ? 'MISSING' : `len=${v.length} head="${(v.slice(0,12)||'').replace(/\n/g,'\\n')}" tail="${(v.slice(-6)||'').replace(/\n/g,'\\n')}"`}`);
}

console.log('\n=== connectors ===');
const { data: connectors, error: cErr } = await db.from('connectors').select('*');
if (cErr) console.log('err:', cErr.message);
else console.log(JSON.stringify(connectors?.map(c => ({
  id: c.id, name: c.name, type: c.type, provider: c.provider, model: c.model,
  has_api_key: !!(c.api_key || c.config?.api_key), base_url: c.base_url || c.config?.base_url,
  updated_at: c.updated_at, active: c.active, is_active: c.is_active, status: c.status,
})), null, 2));

console.log('\n=== agent_settings ===');
const { data: settings, error: sErr } = await db.from('agent_settings').select('*');
if (sErr) console.log('err:', sErr.message);
else console.log(JSON.stringify(settings, null, 2));

console.log('\n=== latest whatsapp_conversation ===');
const { data: convos } = await db.from('whatsapp_conversations').select('*').order('last_message_at', { ascending: false }).limit(3);
console.log(JSON.stringify(convos?.map(c => ({
  chat_id: c.chat_id, phone: c.phone, msg_count: Array.isArray(c.messages) ? c.messages.length : 0,
  last_message_at: c.last_message_at,
  retry_queue: c.retry_queue ? 'yes' : 'no',
  messages_preview: Array.isArray(c.messages) ? c.messages.slice(-3).map(m => ({ role: m.role, content: String(m.content).slice(0, 80), ts: m.timestamp })) : null,
})), null, 2));

console.log('\n=== WAHA health ===');
const WAHA_URL = (prod.WAHA_API_URL || '').replace(/\\n$/, '').trim();
const WAHA_KEY = (prod.WAHA_API_KEY || '').replace(/\\n$/, '').trim();
console.log('WAHA_URL:', WAHA_URL);
try {
  const r = await fetch(`${WAHA_URL}/api/sessions`, {
    headers: { 'X-Api-Key': WAHA_KEY },
    signal: AbortSignal.timeout(10000),
  });
  const body = await r.text();
  console.log('HTTP', r.status, body.slice(0, 500));
} catch (e) {
  console.log('FETCH FAIL:', e.message);
}
