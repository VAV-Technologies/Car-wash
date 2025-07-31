const { createClient } = require('@supabase/supabase-js');
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

// Use REMOTE database (PRODUCTION)
const supabaseUrl = envVars.REMOTE_SUPABASE_URL;
const supabaseServiceKey = envVars.REMOTE_SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyEbitdaToProduction() {
  console.log('🚀 Applying EBITDA Migration to PRODUCTION Database...\n');
  console.log('⚠️  WARNING: This will modify your production database!');
  console.log('📍 Target:', supabaseUrl);
  console.log('');

  try {
    // Step 1: Check current state
    console.log('Step 1: Checking current EBITDA column state...');
    const { data: currentCheck, error: currentError } = await supabase
      .from('listings')
      .select('ebitda')
      .limit(1);

    if (currentError && currentError.message.includes('column "ebitda" does not exist')) {
      console.log('✅ Confirmed: EBITDA column does not exist (as expected)');
    } else if (currentError) {
      console.log('❌ Unexpected error:', currentError.message);
      return false;
    } else {
      console.log('⚠️  EBITDA column already exists! Stopping to prevent double-application.');
      return false;
    }

    // Step 2: Apply the EBITDA column addition
    console.log('\nStep 2: Adding EBITDA column to listings table...');
    
    const { data: alterResult, error: alterError } = await supabase
      .rpc('exec_sql', {
        query: `
          DO $$ 
          BEGIN
              IF NOT EXISTS (
                  SELECT 1 
                  FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'listings' 
                  AND column_name = 'ebitda'
              ) THEN
                  ALTER TABLE listings 
                  ADD COLUMN ebitda DECIMAL(15,2);
                  
                  RAISE NOTICE 'Column ebitda added successfully to listings table';
              ELSE
                  RAISE NOTICE 'Column ebitda already exists in listings table - skipping';
              END IF;
          END $$;
        `
      });

    if (alterError) {
      console.log('❌ Failed to add EBITDA column:', alterError.message);
      return false;
    } else {
      console.log('✅ EBITDA column addition completed');
    }

    // Step 3: Verify the column was added
    console.log('\nStep 3: Verifying EBITDA column was added...');
    const { data: verifyResult, error: verifyError } = await supabase
      .from('listings')
      .select('id, ebitda')
      .limit(1);

    if (verifyError) {
      console.log('❌ Verification failed:', verifyError.message);
      return false;
    } else {
      console.log('✅ EBITDA column is now accessible');
      console.log('   Sample data:', verifyResult[0] || 'No listings found');
    }

    // Step 4: Update migration tracking
    console.log('\nStep 4: Updating migration tracking...');
    const { data: trackingResult, error: trackingError } = await supabase
      .from('supabase_migrations.schema_migrations')
      .insert({
        version: '20250725170826',
        name: 'add_ebitda_field_safe'
      });

    if (trackingError) {
      console.log('⚠️  Migration tracking update failed (but column was added):', trackingError.message);
      console.log('   This is not critical - the important change (EBITDA column) was successful');
    } else {
      console.log('✅ Migration tracking updated');
    }

    console.log('\n🎉 EBITDA Migration Applied Successfully!');
    console.log('✅ EBITDA column is now available in production');
    console.log('✅ Existing data is preserved');
    console.log('✅ Application can now use EBITDA functionality');
    
    return true;

  } catch (err) {
    console.error('🚨 Application failed with exception:', err.message);
    return false;
  }
}

console.log('This script will apply EBITDA migration to PRODUCTION database.');
console.log('Press Ctrl+C to cancel, or wait 5 seconds to proceed...');
setTimeout(applyEbitdaToProduction, 5000);