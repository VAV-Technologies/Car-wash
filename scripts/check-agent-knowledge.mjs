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

console.log('=== agent_knowledge entries ===');
const { data: rows } = await db.from('agent_knowledge').select('id, agent_name, file_name, content').limit(100);
for (const r of rows || []) {
  const content = typeof r.content === 'string' ? r.content : JSON.stringify(r.content);
  const preview = content.slice(0, 200).replace(/\n/g, ' ');
  const hasSchedule = /08:?00|16:?00|8am|5pm|Minggu libur|Senin.*Sabtu|Mon.*Sat|jam kerja|operating hours/i.test(content);
  console.log(`${r.agent_name} | ${r.file_name} | sched=${hasSchedule ? 'YES' : 'no'} | ${preview}...`);
}

console.log('\n=== agent_rules (for shera) — search schedule ===');
const { data: rules } = await db.from('agent_rules').select('id, agent_name, rule').limit(100);
for (const r of rules || []) {
  const rule = typeof r.rule === 'string' ? r.rule : JSON.stringify(r.rule);
  const hasSchedule = /08:?00|16:?00|8am|5pm|Minggu libur|Senin.*Sabtu|Mon.*Sat/i.test(rule);
  if (hasSchedule) {
    console.log(`${r.id} | ${r.agent_name}`);
    console.log(`  ${rule.slice(0, 300)}`);
  }
}

console.log('\n=== agent_settings.system_prompt — search schedule ===');
const { data: settings } = await db.from('agent_settings').select('agent_name, system_prompt').limit(20);
for (const s of settings || []) {
  if (!s.system_prompt) continue;
  const hasSchedule = /08:?00|16:?00|8am|5pm|Minggu libur|Senin.*Sabtu|Mon.*Sat|jam kerja|operating hours/i.test(s.system_prompt);
  if (hasSchedule) {
    console.log(`${s.agent_name}: has schedule refs`);
    console.log(`  ${s.system_prompt.slice(0, 500)}`);
  } else {
    console.log(`${s.agent_name}: no schedule refs in system_prompt (len=${s.system_prompt.length})`);
  }
}
