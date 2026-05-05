// Shared env-loader + Supabase admin client for the test suite.
// Replicates the parser pattern in scripts/check-customers-area.mjs to dodge
// the .env.local backslash-in-value quirk that breaks dotenv-style parsers.
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const raw = readFileSync('.env.local', 'utf8');
export const env = Object.fromEntries(
  raw.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#') && l.includes('=')).map(l => {
    const i = l.indexOf('=');
    let v = l.slice(i + 1);
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    return [l.slice(0, i), v.replace(/\\n$/, '').trim()];
  })
);

export const db = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL.replace(/\\n$/, ''),
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

export const API = 'http://localhost:9002/api/book';
