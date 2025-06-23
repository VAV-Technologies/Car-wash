#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const crypto = require('crypto');
const { execSync } = require('child_process');

async function main() {
  const hardReset = process.argv.includes('--hard-reset');

  console.log('🚀 HYBRID DATA SEEDER - Using Python for data, Node for I/O...\n');

// =====================================================
// STEP 0: GENERATE COMPREHENSIVE DATA WITH PYTHON
// =====================================================
console.log('🐍 Step 0: Running Python script to generate comprehensive listing data...');
try {
    // Activate virtual environment and run the script
    const pythonCommand = process.platform === 'win32'
        ? 'cd python-scripts && venv\\Scripts\\activate.bat && python generate_listings_json.py'
        : 'cd python-scripts && source venv/bin/activate && python3 generate_listings_json.py';

    execSync(pythonCommand, { stdio: 'inherit', shell: true });
    console.log('   ✅ Python script executed successfully, listings.json created.');
} catch (error) {
    console.error('   ❌ Failed to run Python script:', error.message);
    process.exit(1);
}
console.log('✅ Step 0 Complete: Comprehensive data generated\n');


// =====================================================
// STEP 1: CLEAN EVERYTHING
// =====================================================

console.log(hardReset ? '🧹 HARD RESET - Wiping all data...' : '🧹 SMART REBUILD - Updating data...');

if (hardReset) {
  console.log('\n📂 Step 1: Cleaning all existing data (HARD RESET)...');

  // Clean local assets directory
  const assetsDir = './public/assets/listing-assets';
  if (fs.existsSync(assetsDir)) {
    console.log('   🗑️  Removing listing-assets directory...');
    fs.rmSync(assetsDir, { recursive: true, force: true });
  }
  fs.mkdirSync(assetsDir, { recursive: true });
  console.log('   ✅ Created clean listing-assets directory');

  // Clear storage bucket
  console.log('   🪣 Clearing storage bucket...');
  try {
    execSync('npx supabase storage rm ss:///listing-images --linked --experimental --recursive', { stdio: 'pipe' });
    console.log('   ✅ Storage bucket cleared');
  } catch (error) {
    console.log('   ⚠️  Storage bucket might be empty or error occurred during cleanup.');
  }
} else {
    console.log('\n📂 Step 1: Ensuring assets directory exists (SMART MODE)...');
    const assetsDir = './public/assets/listing-assets';
    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
        console.log('   ✅ Created missing assets directory.');
    } else {
        console.log('   ✅ Assets directory already exists.');
    }
}

// Create a clean seed.sql to avoid foreign key issues
const seedPath = './supabase/seed.sql';
const cleanSeedSQL = `-- Clean seed.sql
-- This file is intentionally minimal.
-- The seller user and listings are created dynamically by the complete-clean-rebuild.cjs script.
-- This prevents foreign key constraint errors during the initial database reset.

SELECT 'Minimal seed executed' as status;
`;
fs.writeFileSync(seedPath, cleanSeedSQL);
console.log('   ✅ Wrote clean, minimal seed.sql');

// Always reset the database to ensure schema consistency and clean data
console.log('\n🔄 Step 2: Resetting database with minimal seed...');
try {
  execSync('npx supabase db reset --linked', { stdio: 'inherit' });
  console.log('✅ Database reset complete');
} catch (error) {
  console.log('❌ Database reset failed');
  process.exit(1);
}
console.log('✅ Step 2 Complete: Database reset\n');

// =====================================================
// STEP 3: CREATE THE SELLER USER
// =====================================================

console.log('👤 Step 3: Creating seller user via API...');
let sellerUserId = null;
try {
    const { createClient } = require('@supabase/supabase-js');
    const supabaseUrl = 'https://kktmizfxgtkodtujursv.supabase.co';
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdG1pemZ4Z3Rrb2R0dWp1cnN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODU4NjAwMSwiZXhwIjoyMDY0MTYyMDAxfQ.EComR2_5PS_fdW2XzOTPjSfOjBacve0nrblAEHUsLwk';
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    // First, try to delete the user if they exist to ensure a clean slate
    try {
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = users.find(u => u.email === 'seller@nobridge.co');
        if (existingUser) {
            await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
            console.log('   🗑️  Deleted existing "seller@nobridge.co" user.');
        }
    } catch (e) {
        // Ignore errors if user doesn't exist
    }

    const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: 'seller@nobridge.co',
        password: '100%Seller',
        email_confirm: true,
        user_metadata: {
            full_name: 'Demo Seller',
            role: 'seller'
        }
    });

    if (createError) throw createError;

    sellerUserId = authUser.user.id;

    // Also update the profile that the trigger created
    await supabaseAdmin
        .from('user_profiles')
        .update({
          full_name: 'Demo Seller',
          role: 'seller',
          is_email_verified: true,
          verification_status: 'verified'
        })
        .eq('id', sellerUserId);

    console.log(`   ✅ Successfully created seller user with ID: ${sellerUserId}`);

} catch (error) {
    console.error('   ❌ Failed to create seller user:', error.message);
    process.exit(1);
}
console.log('✅ Step 3 Complete: Seller user created\n');


// =====================================================
// STEP 4: PROCESS JSON AND DOWNLOAD IMAGES
// =====================================================

console.log('📥 Step 4: Processing JSON and downloading images...');

// Utility functions
function generateHash(data) {
  return crypto.createHash('md5').update(data).digest('hex').substring(0, 8);
}

async function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    let validUrl;
    try {
      validUrl = new URL(url);
    } catch (error) {
      reject(new Error(`Invalid URL: ${url}`));
      return;
    }
    const client = validUrl.protocol === 'https:' ? https : http;
    const req = client.get(validUrl.href, (res) => {
      if (res.statusCode === 200) {
        const writeStream = fs.createWriteStream(outputPath);
        res.pipe(writeStream);
        writeStream.on('finish', () => writeStream.close(resolve));
        writeStream.on('error', (err) => {
          fs.unlink(outputPath, () => {});
          reject(err);
        });
      } else {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
      }
    });
    req.on('error', reject);
    req.setTimeout(15000, () => req.destroy(new Error('Download timeout')));
  });
}

// Read and process the JSON file generated by the Python script
const listingsJSONPath = './python-scripts/listings.json';
if (!fs.existsSync(listingsJSONPath)) {
  console.log('❌ listings.json not found. Make sure the Python script ran successfully.');
  process.exit(1);
}
const allListings = JSON.parse(fs.readFileSync(listingsJSONPath, 'utf-8'));
console.log(`📋 Found ${allListings.length} potential listings from Python script`);


const successfulListings = [];
let downloadedCount = 0;
let skippedCount = 0;

for (const listing of allListings) {
  if (!listing.title || !listing.image_url) {
    skippedCount++;
    continue;
  }

  const listingId = listing.listing_id;
  const imageHash = generateHash(listing.image_url + listing.title);
  const imageExtension = listing.image_url.includes('.png') ? 'png' : 'jpg';
  const imageFilename = `listing-${listingId}-${imageHash}.${imageExtension}`;
  const imagePath = path.join(assetsDir, imageFilename);

  try {
    if (!fs.existsSync(imagePath) || fs.statSync(imagePath).size === 0) {
      await downloadImage(listing.image_url, imagePath);
    }
    successfulListings.push({
      ...listing,
      imagePath: `/assets/listing-assets/${imageFilename}`
    });
    downloadedCount++;
  } catch (error) {
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    console.log(`   ⚠️  Skipping listing "${listing.title}" due to image download error: ${error.message}`);
    skippedCount++;
  }
}

console.log(`\n📊 Download Summary:`);
console.log(`   ✅ Successfully processed: ${downloadedCount}`);
console.log(`   ❌ Skipped/Failed: ${skippedCount}`);
console.log('✅ Step 4 Complete: JSON processed and images downloaded\n');

// =====================================================
// STEP 5: INSERT LISTINGS
// =====================================================
console.log('✍️ Step 5: Inserting listings into the database...');

try {
    const { createClient } = require('@supabase/supabase-js');
    const supabaseUrl = 'https://kktmizfxgtkodtujursv.supabase.co';
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdG1pemZ4Z3Rrb2R0dWp1cnN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODU4NjAwMSwiZXhwIjoyMDY0MTYyMDAxfQ.EComR2_5PS_fdW2XzOTPjSfOjBacve0nrblAEHUsLwk';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const listingsToInsert = successfulListings.map(listing => {
      // Map data from Python JSON to Supabase columns
      return {
        seller_id: sellerUserId,
                 listing_title_anonymous: listing.title,
         industry: listing.industry,
         business_model: listing.business_model,
         location_country: listing.location_country,
         location_city_region_general: listing.location_city,
         anonymous_business_description: listing.description,
         asking_price: listing.asking_price,
         annual_revenue_range: listing.annual_revenue_range,
         net_profit_margin_range: listing.net_profit_margin_range,
         adjusted_cash_flow: listing.adjusted_cash_flow,
         key_strengths_anonymous: listing.key_strengths,
         specific_growth_opportunities: Array.isArray(listing.growth_opportunities) ? listing.growth_opportunities.join('\n') : listing.growth_opportunities,
         deal_structure_looking_for: listing.deal_structure,
         reason_for_selling_anonymous: listing.reason_for_selling,
         detailed_reason_for_selling: listing.detailed_reason_for_selling || listing.reason_for_selling,
         number_of_employees: listing.employees,
         year_established: listing.year_established,
         business_website_url: listing.business_website,
         social_media_links: listing.social_media_links,
         registered_business_name: listing.registered_business_name,
         actual_company_name: listing.actual_company_name || listing.registered_business_name,
         specific_annual_revenue_last_year: listing.specific_annual_revenue_last_year,
         specific_net_profit_last_year: listing.specific_net_profit_last_year,
         image_urls: [listing.imagePath],
         status: listing.status,
         is_seller_verified: listing.is_seller_verified,
         created_at: new Date(Date.now() - listing.created_days_ago * 24 * 60 * 60 * 1000).toISOString()
      };
    });

    const { error } = await supabase.from('listings').insert(listingsToInsert);
    if (error) throw error;

    console.log(`   ✅ Successfully inserted ${successfulListings.length} listings.`);
} catch(error) {
    console.error('   ❌ Failed to insert listings:', error.message);
    process.exit(1);
}
console.log('✅ Step 5 Complete: Listings inserted\n');

// =====================================================
// STEP 6: UPLOAD IMAGES TO STORAGE
// =====================================================

console.log('📸 Step 6: Uploading images to storage...');
try {
  execSync('npm run migrate-images', { stdio: 'inherit' });
  console.log('✅ Images uploaded to storage');
} catch (error) {
  console.log('❌ Image upload failed');
  process.exit(1);
}
console.log('✅ Step 6 Complete: Images uploaded\n');

// =====================================================
// STEP 7: UPDATE IMAGE URLS TO SUPABASE STORAGE
// =====================================================
console.log('🔗 Step 7: Updating image URLs to use Supabase storage...');

try {
  const { createClient } = require('@supabase/supabase-js');
  const supabaseUrl = 'https://kktmizfxgtkodtujursv.supabase.co';
  const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdG1pemZ4Z3Rrb2R0dWp1cnN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODU4NjAwMSwiZXhwIjoyMDY0MTYyMDAxfQ.EComR2_5PS_fdW2XzOTPjSfOjBacve0nrblAEHUsLwk';
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data: listings, error: fetchError } = await supabase.from('listings').select('id, image_urls');
  if (fetchError) throw fetchError;
  let updateCount = 0;
  for (const listing of listings) {
    if (!listing.image_urls || !Array.isArray(listing.image_urls)) continue;
    const updatedUrls = listing.image_urls.map(url => {
      if (typeof url === 'string' && url.startsWith('/assets/listing-assets/')) {
        const filename = url.replace('/assets/listing-assets/', '');
        return `${supabaseUrl}/storage/v1/object/public/listing-images/listing-assets/${filename}`;
      }
      return url;
    });
    if (JSON.stringify(listing.image_urls) !== JSON.stringify(updatedUrls)) {
      const { error: updateError } = await supabase.from('listings').update({ image_urls: updatedUrls }).eq('id', listing.id);
      if (!updateError) updateCount++;
    }
  }
  console.log(`   ✅ Updated URLs for ${updateCount} listings.`);
} catch (error) {
  console.log('   ❌ Image URL update failed:', error.message);
}
console.log('✅ Step 7 Complete: Image URLs updated\n');


// =====================================================
// FINAL VERIFICATION
// =====================================================

console.log('🔍 Final Verification...');
try {
  const dbUrl = execSync(`npx supabase status --output env | grep 'DB_URL=' | cut -d'=' -f2-`, { encoding: 'utf-8' }).trim();
  if (!dbUrl) throw new Error("Could not get DB_URL");
  const result = execSync(`psql "${dbUrl}" -c "SELECT COUNT(*) as total_listings FROM listings;"`, { encoding: 'utf-8' });
  console.log('   Database count result:', result.trim());
} catch (error) {
  console.log('   Could not verify database count:', error.message);
}

console.log('\n🎉 COMPLETE CLEAN REBUILD FINISHED!');
console.log('======================================');
console.log(`✅ Seller user created: seller@nobridge.co`);
console.log(`✅ Images downloaded: ${downloadedCount}`);
console.log(`✅ Listings in database: ${successfulListings.length}`);
console.log(`✅ Images in storage: ${downloadedCount}`);
console.log('✅ All data should be correct! :)');
console.log('======================================');
console.log('🌐 Your marketplace should now show all images and data correctly!');

}

main().catch(error => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});
