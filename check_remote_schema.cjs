const { createClient } = require('@supabase/supabase-js');

// Get environment variables from .env.local for remote database
const fs = require('fs');
const path = require('path');

// Read .env.local file
const envPath = path.join(__dirname, '.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');

// Parse environment variables
const envVars = {};
envFile.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key] = value;
  }
});

const supabaseUrl = envVars.REMOTE_SUPABASE_URL;
const supabaseServiceKey = envVars.REMOTE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Need SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRemoteSchema() {
  try {
    // Check if ebitda column exists in remote database
    const { data, error } = await supabase
      .from('listings')
      .select('ebitda')
      .limit(1);
    
    if (error) {
      if (error.message.includes('column "ebitda" does not exist')) {
        console.log('❌ EBITDA column does NOT exist in remote database');
        return false;
      } else {
        console.error('Error checking remote schema:', error.message);
        return false;
      }
    } else {
      console.log('✅ EBITDA column EXISTS in remote database');
      return true;
    }
  } catch (err) {
    console.error('Exception checking remote schema:', err.message);
    return false;
  }
}

checkRemoteSchema().then(exists => {
  process.exit(exists ? 0 : 1);
});