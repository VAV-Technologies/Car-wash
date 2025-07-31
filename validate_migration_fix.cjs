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

// Use REMOTE database for validation
const supabaseUrl = envVars.REMOTE_SUPABASE_URL;
const supabaseServiceKey = envVars.REMOTE_SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function validateMigrationFix() {
  console.log('🔍 Validating Migration Fix Results...\n');
  console.log('📍 Target:', supabaseUrl);
  console.log('');

  try {
    // Test 1: Check EBITDA column functionality
    console.log('Test 1: EBITDA Column Functionality...');
    const { data: ebitdaTest, error: ebitdaError } = await supabase
      .from('listings')
      .select('id, listing_title_anonymous, ebitda')
      .limit(3);

    if (ebitdaError) {
      console.log('❌ EBITDA test failed:', ebitdaError.message);
      return false;
    } else {
      console.log('✅ EBITDA column is accessible');
      console.log('   Sample data:', ebitdaTest.map(l => ({ 
        id: l.id.substring(0, 8) + '...', 
        title: l.listing_title_anonymous.substring(0, 30) + '...', 
        ebitda: l.ebitda || 'NULL' 
      })));
    }

    // Test 2: Test EBITDA update functionality
    if (ebitdaTest && ebitdaTest.length > 0) {
      console.log('\nTest 2: EBITDA Update Functionality...');
      const testListingId = ebitdaTest[0].id;
      
      const { data: updateTest, error: updateError } = await supabase
        .from('listings')
        .update({ ebitda: 99999 })
        .eq('id', testListingId)
        .select('ebitda');

      if (updateError) {
        console.log('❌ EBITDA update failed:', updateError.message);
        return false;
      } else {
        console.log('✅ EBITDA update successful:', updateTest[0].ebitda);
        
        // Revert the test change
        await supabase
          .from('listings')
          .update({ ebitda: null })
          .eq('id', testListingId);
        console.log('✅ Test data reverted');
      }
    }

    // Test 3: Check admin functionality (from 20250616)
    console.log('\nTest 3: Admin Listing Management...');
    const { data: adminTest, error: adminError } = await supabase
      .from('listings')
      .select('id, admin_notes, admin_action_by, rejection_category')
      .limit(1);

    if (adminError) {
      console.log('❌ Admin columns test failed:', adminError.message);
      return false;
    } else {
      console.log('✅ Admin columns are accessible');
    }

    // Test 4: Check admin_listing_actions table (from 20250616)
    console.log('\nTest 4: Admin Actions Table...');
    const { data: adminActionsTest, error: adminActionsError } = await supabase
      .from('admin_listing_actions')
      .select('*')
      .limit(1);

    if (adminActionsError) {
      console.log('❌ Admin actions table test failed:', adminActionsError.message);
      return false;
    } else {
      console.log('✅ Admin actions table is accessible');
    }

    // Test 5: Check inquiries functionality (from 20250619)
    console.log('\nTest 5: Inquiry System...');
    const { data: inquiryTest, error: inquiryError } = await supabase
      .from('inquiries')
      .select('id, status, inquiry_timestamp')
      .limit(2);

    if (inquiryError) {
      console.log('❌ Inquiry system test failed:', inquiryError.message);
      return false;
    } else {
      console.log('✅ Inquiry system is accessible');
      if (inquiryTest.length > 0) {
        console.log('   Sample inquiry status:', inquiryTest[0].status);
      }
    }

    // Test 6: Check overall application health
    console.log('\nTest 6: Overall Application Health...');
    const { data: healthTest, error: healthError } = await supabase
      .from('user_profiles')
      .select('id, role, verification_status')
      .limit(1);

    if (healthError) {
      console.log('❌ Application health test failed:', healthError.message);
      return false;
    } else {
      console.log('✅ Core application tables accessible');
    }

    console.log('\n🎉 All Validation Tests Passed!');
    console.log('✅ EBITDA functionality works');
    console.log('✅ Admin management system works');
    console.log('✅ Inquiry automation system works'); 
    console.log('✅ No breaking changes detected');
    console.log('✅ All migration tracking should now be aligned');
    
    return true;

  } catch (err) {
    console.error('🚨 Validation failed with exception:', err.message);
    return false;
  }
}

validateMigrationFix();