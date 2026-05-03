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

console.log('========== agent_knowledge (shera + johan) ==========');
const { data: rows } = await db.from('agent_knowledge').select('id, agent_name, file_name, file_type, content').in('agent_name', ['shera', 'johan']);
for (const r of rows || []) {
  if (r.file_type === 'image') {
    console.log(`${r.agent_name}/${r.file_name} [IMAGE — skipped]`);
    continue;
  }
  const content = typeof r.content === 'string' ? r.content : JSON.stringify(r.content);
  console.log(`\n--- ${r.agent_name}/${r.file_name} (${content.length} chars) ---`);
  console.log(content);
}

console.log('\n\n========== agent_rules (shera + johan) ==========');
const { data: rules } = await db.from('agent_rules').select('id, agent_name, rule, scenario, response').in('agent_name', ['shera', 'johan']);
for (const r of rules || []) {
  console.log(`\n--- ${r.agent_name} rule ${r.id} ---`);
  console.log(JSON.stringify(r, null, 2));
}

console.log('\n\n========== agent_settings.system_prompt (shera + johan) ==========');
const { data: settings } = await db.from('agent_settings').select('agent_name, system_prompt').in('agent_name', ['shera', 'johan']);
for (const s of settings || []) {
  console.log(`\n--- ${s.agent_name} system_prompt (${s.system_prompt?.length || 0} chars) ---`);
  console.log(s.system_prompt || '(empty)');
}
