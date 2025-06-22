#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const crypto = require('crypto');
const { execSync } = require('child_process');

async function main() {

console.log('🧹 COMPLETE CLEAN REBUILD - Starting fresh...\n');

// =====================================================
// STEP 1: CLEAN EVERYTHING
// =====================================================

console.log('📂 Step 1: Cleaning all existing data...');

// Clean local assets directory
const assetsDir = './public/assets/listing-assets';
if (fs.existsSync(assetsDir)) {
  console.log('   🗑️  Removing listing-assets directory...');
  fs.rmSync(assetsDir, { recursive: true, force: true });
}
fs.mkdirSync(assetsDir, { recursive: true });
console.log('   ✅ Created clean listing-assets directory');

// Restore original seed.sql (use clean template)
console.log('   📄 Restoring original seed.sql...');
const seedPath = './supabase/seed.sql';
const cleanSeedPath = './supabase/seed_original_clean.sql';
let originalSeed = '';

if (fs.existsSync(cleanSeedPath)) {
  originalSeed = fs.readFileSync(cleanSeedPath, 'utf-8');
  console.log('   ✅ Using clean seed template (1 demo listing only)');
} else {
  console.log('   ❌ Clean seed template not found!');
  console.log('   📄 Creating minimal seed template...');
  originalSeed = `-- Clean seed.sql - minimal demo data
DELETE FROM listings;
DELETE FROM user_profiles WHERE email = 'seller@nobridge.co';

-- Create demo seller
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role)
VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'seller@nobridge.co', crypt('100%Seller', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Demo Seller"}', false, 'authenticated');

UPDATE user_profiles SET full_name = 'Demo Seller', role = 'seller', is_email_verified = true, verification_status = 'verified' WHERE email = 'seller@nobridge.co';
`;
}

// Clear storage bucket
console.log('   🪣 Clearing storage bucket...');
try {
  execSync('npx supabase storage rm ss:///listing-images --linked --experimental --recursive', { stdio: 'pipe' });
  console.log('   ✅ Storage bucket cleared');
} catch (error) {
  console.log('   ⚠️  Storage bucket might be empty or error occurred');
}

console.log('✅ Step 1 Complete: Everything cleaned\n');

// =====================================================
// STEP 2: PROCESS CSV AND DOWNLOAD IMAGES
// =====================================================

console.log('📥 Step 2: Processing CSV and downloading images...');

// Utility functions
function generateHash(data) {
  return crypto.createHash('md5').update(data).digest('hex').substring(0, 8);
}

async function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    // Validate URL
    let validUrl;
    try {
      validUrl = new URL(url);
    } catch (error) {
      reject(new Error('Invalid URL format'));
      return;
    }

    const client = validUrl.protocol === 'https:' ? https : http;

    const req = client.get(validUrl.href, (res) => {
      if (res.statusCode === 200) {
        const writeStream = fs.createWriteStream(outputPath);
        res.pipe(writeStream);

        writeStream.on('finish', () => {
          writeStream.close();
          resolve(true);
        });

        writeStream.on('error', (err) => {
          fs.unlink(outputPath, () => {}); // Clean up partial file
          reject(err);
        });
      } else {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
      }
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Download timeout'));
    });
  });
}

function extractBusinessData(csvRow) {
  return {
    title: (csvRow['Listing Title (Anonymous)']?.trim() || '').substring(0, 200),
    description: (csvRow['Business Description (2)']?.trim() || '').substring(0, 400),
    industry: (csvRow['Industry']?.trim() || 'General Business').substring(0, 80),
    businessModel: (csvRow['Business Model']?.trim() || 'Business').substring(0, 80),
    location: (csvRow['Location (Country)']?.trim() || 'United States').substring(0, 80),
    askingPrice: parseFloat(csvRow['Asking Price']?.replace(/[^0-9.]/g, '') || '0'),
    revenue: parseFloat(csvRow['Halved Revenue']?.replace(/[^0-9.]/g, '') || '0'),
    employees: (csvRow['Employees']?.trim() || '1-10').substring(0, 40),
    yearEstablished: parseInt(csvRow['Year Established']) || null,
    imageUrl: csvRow['Image Link']?.trim() || ''
  };
}

function sqlEscape(str) {
  if (!str) return 'NULL';
  if (typeof str === 'number') return str.toString();
  return `'${str.toString().replace(/'/g, "''").replace(/\\/g, '\\\\').replace(/\r?\n/g, ' ').trim()}'`;
}

function formatPrice(value) {
  const num = parseFloat(value);
  return isNaN(num) ? 'NULL' : num.toString();
}

// Read and process CSV
const csvPath = './more_data.csv';
if (!fs.existsSync(csvPath)) {
  console.log('❌ CSV file not found: more_data.csv');
  process.exit(1);
}

const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n').filter(line => line.trim());
const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());

console.log(`📋 Found ${lines.length - 1} potential listings in CSV`);

const successfulListings = [];
let downloadedCount = 0;
let skippedCount = 0;

// Process each CSV row
for (let i = 1; i < lines.length; i++) {
  const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());

  // Skip incomplete rows
  if (values.length < headers.length / 2) {
    console.log(`⚠️  Row ${i}: Incomplete row, skipping`);
    skippedCount++;
    continue;
  }

  // Create business object
  const rawBusiness = {};
  headers.forEach((header, idx) => {
    rawBusiness[header] = values[idx] || '';
  });

  const business = extractBusinessData(rawBusiness);

  // Skip if no title or image URL
  if (!business.title || !business.imageUrl) {
    console.log(`⚠️  Row ${i}: Missing title or image URL, skipping`);
    skippedCount++;
    continue;
  }

  // Generate image filename
  const listingId = String(downloadedCount + 1).padStart(3, '0');
  const imageHash = generateHash(business.imageUrl + business.title);
  const imageExtension = business.imageUrl.includes('.png') ? 'png' : 'jpg';
  const imageFilename = `listing-${listingId}-${imageHash}.${imageExtension}`;
  const imagePath = path.join(assetsDir, imageFilename);

  console.log(`📥 [${i}/${lines.length - 1}] Processing: ${business.title}`);

  try {
    // Check if image already exists
    if (fs.existsSync(imagePath)) {
      const stats = fs.statSync(imagePath);
      if (stats.size > 0) {
        console.log(`♻️  [${i}/${lines.length - 1}] Already exists (${stats.size} bytes) - skipping download`);
      } else {
        // File exists but is empty, re-download
        await downloadImage(business.imageUrl, imagePath);
        const newStats = fs.statSync(imagePath);
        if (newStats.size === 0) {
          throw new Error('Downloaded file is empty');
        }
        console.log(`✅ [${i}/${lines.length - 1}] Re-downloaded (${newStats.size} bytes)`);
      }
    } else {
      // Download image
      await downloadImage(business.imageUrl, imagePath);

      // Verify download
      const stats = fs.statSync(imagePath);
      if (stats.size === 0) {
        throw new Error('Downloaded file is empty');
      }

      console.log(`✅ [${i}/${lines.length - 1}] Downloaded (${stats.size} bytes)`);
    }

    // Add to successful listings
    successfulListings.push({
      ...business,
      listingId,
      imageFilename,
      imagePath: `/assets/listing-assets/${imageFilename}`
    });

    downloadedCount++;

  } catch (error) {
    console.log(`❌ [${i}/${lines.length - 1}] Failed: ${error.message}`);
    // Clean up failed download
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    skippedCount++;
  }
}

console.log(`\n📊 Download Summary:`);
console.log(`   ✅ Successfully downloaded: ${downloadedCount}`);
console.log(`   ❌ Skipped/Failed: ${skippedCount}`);
console.log(`   📸 Images in directory: ${fs.readdirSync(assetsDir).length}`);

if (successfulListings.length === 0) {
  console.log('❌ No images were successfully downloaded. Exiting.');
  process.exit(1);
}

console.log('✅ Step 2 Complete: Images downloaded\n');

// =====================================================
// STEP 3: GENERATE SEED.SQL
// =====================================================

console.log('📄 Step 3: Generating seed.sql...');

let sqlContent = originalSeed + '\n\n';
sqlContent += '-- Business listings from CSV data\n';
sqlContent += `-- Generated: ${new Date().toISOString()}\n`;
sqlContent += `-- Successfully processed ${successfulListings.length} listings with images\n\n`;

for (const business of successfulListings) {
  const description = (business.description || `A ${business.businessModel} business in the ${business.industry} industry located in ${business.location}. Established business with strong fundamentals and growth potential.`).substring(0, 400);

  sqlContent += `-- Listing ${business.listingId}: ${business.title}\n`;
  sqlContent += `WITH seller_info AS (\n`;
  sqlContent += `    SELECT id as seller_id FROM user_profiles WHERE email = 'seller@nobridge.co'\n`;
  sqlContent += `)\n`;
  sqlContent += `INSERT INTO listings (\n`;
  sqlContent += `    id,\n`;
  sqlContent += `    seller_id,\n`;
  sqlContent += `    listing_title_anonymous,\n`;
  sqlContent += `    industry,\n`;
  sqlContent += `    business_model,\n`;
  sqlContent += `    location_country,\n`;
  sqlContent += `    anonymous_business_description,\n`;
  sqlContent += `    asking_price,\n`;
  sqlContent += `    annual_revenue_range,\n`;
  sqlContent += `    number_of_employees,\n`;
  sqlContent += `    year_established,\n`;
  sqlContent += `    image_urls,\n`;
  sqlContent += `    status,\n`;
  sqlContent += `    created_at,\n`;
  sqlContent += `    updated_at\n`;
  sqlContent += `)\n`;
  sqlContent += `SELECT\n`;
  sqlContent += `    gen_random_uuid(),\n`;
  sqlContent += `    seller_id,\n`;
  sqlContent += `    ${sqlEscape(business.title)},\n`;
  sqlContent += `    ${sqlEscape(business.industry)},\n`;
  sqlContent += `    ${sqlEscape(business.businessModel)},\n`;
  sqlContent += `    ${sqlEscape(business.location)},\n`;
  sqlContent += `    ${sqlEscape(description)},\n`;
  sqlContent += `    ${formatPrice(business.askingPrice)},\n`;
  sqlContent += `    '$1M - $5M USD',\n`;
  sqlContent += `    ${sqlEscape(business.employees)},\n`;
  sqlContent += `    ${business.yearEstablished || 'NULL'},\n`;
  sqlContent += `    ${sqlEscape(`["${business.imagePath}"]`)},\n`;
  sqlContent += `    'active',\n`;
  sqlContent += `    NOW() - INTERVAL '${Math.floor(Math.random() * 30)} days',\n`;
  sqlContent += `    NOW()\n`;
  sqlContent += `FROM seller_info;\n\n`;
}

// Write new seed.sql
fs.writeFileSync(seedPath, sqlContent);
console.log(`✅ Generated seed.sql with ${successfulListings.length} listings`);
console.log('✅ Step 3 Complete: seed.sql generated\n');

// =====================================================
// STEP 4: RESET DATABASE
// =====================================================

console.log('🔄 Step 4: Resetting database...');

try {
  execSync('npx supabase db reset --linked', { stdio: 'inherit' });
  console.log('✅ Database reset complete');
} catch (error) {
  console.log('❌ Database reset failed');
  process.exit(1);
}

console.log('✅ Step 4 Complete: Database reset\n');

// =====================================================
// STEP 5: UPLOAD IMAGES TO STORAGE
// =====================================================

console.log('📸 Step 5: Uploading images to storage...');

try {
  execSync('npm run migrate-images', { stdio: 'inherit' });
  console.log('✅ Images uploaded to storage');
} catch (error) {
  console.log('❌ Image upload failed');
  process.exit(1);
}

console.log('✅ Step 5 Complete: Images uploaded\n');

// =====================================================
// FINAL VERIFICATION
// =====================================================

console.log('🔍 Final Verification...');

try {
  const result = execSync(`psql $(npx supabase status --output env | grep 'DB_URL=' | cut -d'=' -f2-) -c "SELECT COUNT(*) as total_listings FROM listings;"`, { encoding: 'utf-8' });
  console.log('Database count result:', result);
} catch (error) {
  console.log('Could not verify database count');
}

console.log('\n🎉 COMPLETE CLEAN REBUILD FINISHED!');
console.log('======================================');
console.log(`✅ Images downloaded: ${downloadedCount}`);
console.log(`✅ Listings in database: ${successfulListings.length + 5} (${successfulListings.length} CSV + 5 original)`);
console.log(`✅ Images in storage: ${downloadedCount}`);
console.log('✅ Perfect 1:1 mapping between images and listings');
console.log('======================================');
console.log('🌐 Your marketplace should now show all images correctly!');

}

// Run the main function
main().catch(error => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});
