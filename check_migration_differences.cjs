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

const supabaseUrl = envVars.REMOTE_SUPABASE_URL;
const supabaseServiceKey = envVars.REMOTE_SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkMigrationEffects() {
  try {
    console.log('🔍 Checking what migration 20250616 (admin_listing_management_system) added...');
    
    // Check if admin-related columns exist (from 20250616 migration)
    const { data: listingsData, error: listingsError } = await supabase
      .from('listings')
      .select('admin_notes, admin_action_by, admin_action_at, rejection_category')
      .limit(1);
    
    if (listingsError) {
      console.log('❌ Admin columns from 20250616 migration do NOT exist in remote');
      console.log('   Error:', listingsError.message);
    } else {
      console.log('✅ Admin columns from 20250616 migration DO exist in remote');
    }

    // Check if admin_listing_actions table exists (from 20250616 migration)
    const { data: adminActionsData, error: adminActionsError } = await supabase
      .from('admin_listing_actions')
      .select('*')
      .limit(1);
    
    if (adminActionsError) {
      console.log('❌ admin_listing_actions table from 20250616 migration does NOT exist in remote');
      console.log('   Error:', adminActionsError.message);
    } else {
      console.log('✅ admin_listing_actions table from 20250616 migration DOES exist in remote');
    }

    console.log('\n🔍 Checking what migration 20250619 (inquiry_status_automation) added...');
    
    // Check if the trigger function exists by trying to call it (this is indirect)
    // The migration creates a function update_inquiry_statuses_on_verification()
    const { data: functionsData, error: functionsError } = await supabase
      .rpc('update_inquiry_statuses_on_verification'); // This will fail if function doesn't exist
    
    // We expect this to fail because it's a trigger function, but the error message will tell us if it exists
    console.log('Function check result:', functionsError ? functionsError.message : 'Function callable');

    console.log('\n📊 Summary of findings:');
    console.log('- EBITDA column: ❌ Missing from remote');
    console.log('- Migration 20250616 effects: Need to check individual results above');
    console.log('- Migration 20250619 effects: Need to check individual results above');

  } catch (err) {
    console.error('Exception:', err.message);
  }
}

checkMigrationEffects();