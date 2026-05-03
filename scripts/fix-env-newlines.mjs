// Detect env vars with TRUE trailing \n (backslash+n+quote as last 3 chars of line),
// then fix them via vercel CLI.
import { readFileSync } from 'node:fs';
import { execSync, spawn } from 'node:child_process';

const raw = readFileSync('.env.vercel.tmp', 'utf8');
const lines = raw.split('\n').filter(l => l && !l.startsWith('#') && l.includes('='));

const broken = [];
for (const line of lines) {
  if (!line.endsWith('\\n"')) continue;
  const i = line.indexOf('=');
  const name = line.slice(0, i);
  // Strip surrounding quotes and trailing \n (2 chars: backslash + n)
  let value = line.slice(i + 1);
  if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
  if (value.endsWith('\\n')) value = value.slice(0, -2);
  broken.push({ name, value });
}

const MODE = process.argv[2] || 'list';

if (MODE === 'list') {
  console.log(`Found ${broken.length} envs with trailing \\n:`);
  for (const b of broken) {
    const preview = b.value.length > 50 ? `${b.value.slice(0,20)}…${b.value.slice(-10)}` : b.value;
    console.log(`  ${b.name} (cleanLen=${b.value.length}) -> ${JSON.stringify(preview)}`);
  }
} else if (MODE === 'fix') {
  // Skip ANTHROPIC_API_KEY — clean value is empty, better to handle manually
  for (const b of broken) {
    if (b.name === 'ANTHROPIC_API_KEY') {
      console.log(`SKIP ${b.name} (value empty — handle manually)`);
      continue;
    }
    console.log(`\n--- ${b.name} ---`);
    try {
      const rmOut = execSync(`vercel env rm ${b.name} production --yes`, { encoding: 'utf8', stdio: ['inherit', 'pipe', 'pipe'] });
      console.log(`rm: ${rmOut.trim().split('\n').slice(-1)[0]}`);
    } catch (e) {
      console.log(`rm FAIL: ${e.message.slice(0, 200)}`);
      continue;
    }
    try {
      const result = await new Promise((resolve, reject) => {
        const child = spawn('vercel', ['env', 'add', b.name, 'production'], { shell: true });
        let out = '', err = '';
        child.stdout.on('data', d => out += d);
        child.stderr.on('data', d => err += d);
        child.on('close', code => resolve({ code, out, err }));
        child.on('error', reject);
        child.stdin.write(b.value);
        child.stdin.end();
      });
      const tail = (result.out || result.err).trim().split('\n').slice(-1)[0];
      console.log(`add: exit=${result.code} ${tail}`);
    } catch (e) {
      console.log(`add FAIL: ${e.message.slice(0, 200)}`);
    }
  }
  console.log('\nDone.');
}
