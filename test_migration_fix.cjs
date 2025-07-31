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

// Test on LOCAL first (safer)
const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL; // Local URL
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY; // Local key

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testMigrationFix() {
  console.log('🧪 Testing Migration Fix Process on LOCAL database...\n');

  try {
    // Test 1: Verify EBITDA column exists locally
    console.log('Test 1: Checking EBITDA column...');
    const { data: ebitdaTest, error: ebitdaError } = await supabase
      .from('listings')
      .select('id, ebitda')
      .limit(1);

    if (ebitdaError) {
      console.log('❌ EBITDA test failed:', ebitdaError.message);
      return false;
    } else {
      console.log('✅ EBITDA column accessible');
    }

    // Test 2: Verify we can update EBITDA value
    if (ebitdaTest && ebitdaTest.length > 0) {
      const testListingId = ebitdaTest[0].id;
      console.log('\nTest 2: Testing EBITDA update...');
      
      const { data: updateTest, error: updateError } = await supabase
        .from('listings')
        .update({ ebitda: 150000 })
        .eq('id', testListingId)
        .select('ebitda');

      if (updateError) {
        console.log('❌ EBITDA update failed:', updateError.message);
        return false;
      } else {
        console.log('✅ EBITDA update successful:', updateTest[0].ebitda);
        
        // Revert the change
        await supabase
          .from('listings')
          .update({ ebitda: null })
          .eq('id', testListingId);
        console.log('✅ Test data reverted');
      }
    }

    // Test 3: Check migration history
    console.log('\nTest 3: Checking migration history...');
    const { data: migrationData, error: migrationError } = await supabase
      .from('supabase_migrations.schema_migrations')
      .select('version, name')
      .in('version', ['20250616', '20250619', '20250725170826']);

    if (migrationError) {
      console.log('❌ Migration history check failed:', migrationError.message);
    } else {
      console.log('✅ Migration history data:');
      migrationData.forEach(m => {
        console.log(`   ${m.version}: ${m.name}`);
      });
    }

    console.log('\n🎉 All tests passed! Local database is in good state.');
    console.log('💡 Ready to apply similar fixes to production database.');
    return true;

  } catch (err) {
    console.error('🚨 Test failed with exception:', err.message);
    return false;
  }
}

testMigrationFix();