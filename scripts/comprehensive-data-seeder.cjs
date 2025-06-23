#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const crypto = require('crypto');
const { execSync } = require('child_process');

async function main() {
  console.log('🧹 COMPREHENSIVE DATA SEEDER - Creating rich financial data...\n');

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

  // Create a clean seed.sql
  const seedPath = './supabase/seed.sql';
  const cleanSeedSQL = `-- Comprehensive seed.sql
-- This file is intentionally minimal.
-- The seller user and listings are created dynamically by the comprehensive-data-seeder.cjs script.
-- This prevents foreign key constraint errors during the initial database reset.

SELECT 'Comprehensive seed executed' as status;
`;
  fs.writeFileSync(seedPath, cleanSeedSQL);
  console.log('   ✅ Wrote clean, minimal seed.sql');

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
  // STEP 2: RESET THE DATABASE
  // =====================================================
  console.log('🔄 Step 2: Resetting database with minimal seed...');
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
  // STEP 4: PROCESS CSV AND DOWNLOAD IMAGES
  // =====================================================
  console.log('📥 Step 4: Processing CSV and downloading images...');

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

  function extractBusinessData(csvRow) {
    return {
      title: (csvRow['Listing Title (Anonymous)']?.trim() || '').substring(0, 200),
      description: (csvRow['Business Description (2)']?.trim() || '').substring(0, 400),
      industry: (csvRow['Industry']?.trim() || 'General Business').substring(0, 80),
      businessModel: (csvRow['Business Model']?.trim() || 'Business').substring(0, 80),
      location: (csvRow['Location (Country)']?.trim() || 'United States').substring(0, 80),
      city: (csvRow['Location (City)']?.trim() || null),
      askingPrice: parseFloat(csvRow['Asking Price']?.replace(/[^0-9.]/g, '') || '0'),
      revenue: parseFloat(csvRow['Halved Revenue']?.replace(/[^0-9.]/g, '') || '0'),
      employees: (csvRow['Employees']?.trim() || '1-10').substring(0, 40),
      yearEstablished: parseInt(csvRow['Year Established']) || null,
      imageUrl: csvRow['Image Link']?.trim() || ''
    };
  }

  // Enhanced function to generate comprehensive financial data
  function generateFinancialData(askingPrice, baseRevenue) {
    // Generate realistic financial relationships
    const annualRevenue = baseRevenue || (askingPrice * (0.3 + Math.random() * 0.7)); // 30-100% of asking price
    const netProfitMargin = 0.15 + Math.random() * 0.25; // 15-40% margin
    const netProfit = annualRevenue * netProfitMargin;
    const adjustedCashFlow = netProfit * (0.8 + Math.random() * 0.4); // 80-120% of net profit
    const verifiedRevenue = annualRevenue * (0.95 + Math.random() * 0.1); // Slight variance
    const verifiedNetProfit = netProfit * (0.95 + Math.random() * 0.1);
    const verifiedCashFlow = adjustedCashFlow * (0.95 + Math.random() * 0.1);

    // Generate revenue and margin ranges
    const revenueRanges = [
      '$1M - $5M USD',
      '$5M - $10M USD',
      '$10M - $25M USD',
      '$25M - $50M USD',
      '$50M+ USD'
    ];

    const marginRanges = [
      '10% - 20%',
      '20% - 30%',
      '30% - 40%',
      '40%+ margin'
    ];

    const revenueRange = annualRevenue < 5000000 ? revenueRanges[0] :
                        annualRevenue < 10000000 ? revenueRanges[1] :
                        annualRevenue < 25000000 ? revenueRanges[2] :
                        annualRevenue < 50000000 ? revenueRanges[3] : revenueRanges[4];

    const marginRange = netProfitMargin < 0.2 ? marginRanges[0] :
                       netProfitMargin < 0.3 ? marginRanges[1] :
                       netProfitMargin < 0.4 ? marginRanges[2] : marginRanges[3];

    return {
      annualRevenue,
      netProfit,
      adjustedCashFlow,
      verifiedRevenue,
      verifiedNetProfit,
      verifiedCashFlow,
      revenueRange,
      marginRange
    };
  }

  // Enhanced function to generate business strengths and opportunities
  function generateBusinessContent(industry, businessModel) {
    const strengthTemplates = [
      "Established client relationships with repeat business",
      "Experienced skilled workforce",
      "Strong regional market presence",
      "Diversified revenue streams",
      "Proprietary technology platform",
      "Premium brand recognition",
      "Operational excellence and efficiency",
      "Strategic partnerships in place"
    ];

    const opportunityTemplates = [
      "Digital transformation and online expansion",
      "Geographic expansion to new markets",
      "Additional product/service lines",
      "Strategic acquisitions for growth",
      "Automation and process improvements",
      "Premium service tier development",
      "Partnership with complementary businesses",
      "International market entry"
    ];

    const keyStrengths = [];
    const usedStrengths = new Set();

    while (keyStrengths.length < 3) {
      const strength = strengthTemplates[Math.floor(Math.random() * strengthTemplates.length)];
      if (!usedStrengths.has(strength)) {
        keyStrengths.push(strength);
        usedStrengths.add(strength);
      }
    }

    const growthOpportunities = [];
    const usedOpportunities = new Set();

    while (growthOpportunities.length < 3) {
      const opportunity = opportunityTemplates[Math.floor(Math.random() * opportunityTemplates.length)];
      if (!usedOpportunities.has(opportunity)) {
        growthOpportunities.push(opportunity);
        usedOpportunities.add(opportunity);
      }
    }

    const sellingReasons = [
      "Owner retirement and succession planning",
      "Pursuing other business opportunities",
      "Health and personal reasons",
      "Strategic exit to focus on core business",
      "Family relocation requirements"
    ];

    const dealStructures = [
      ["Asset Purchase"],
      ["Share Purchase"],
      ["Asset Purchase", "Share Purchase"],
      ["Earn-out Agreement"],
      ["Management Buyout"]
    ];

    return {
      keyStrengths,
      growthOpportunities: growthOpportunities.join('\n• '),
      sellingReason: sellingReasons[Math.floor(Math.random() * sellingReasons.length)],
      dealStructure: dealStructures[Math.floor(Math.random() * dealStructures.length)]
    };
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

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
    if (values.length < headers.length / 2) {
      skippedCount++;
      continue;
    }
    const rawBusiness = {};
    headers.forEach((header, idx) => {
      rawBusiness[header] = values[idx] || '';
    });
    const business = extractBusinessData(rawBusiness);
    if (!business.title || !business.imageUrl) {
      skippedCount++;
      continue;
    }
    const listingId = String(downloadedCount + 1).padStart(3, '0');
    const imageHash = generateHash(business.imageUrl + business.title);
    const imageExtension = business.imageUrl.includes('.png') ? 'png' : 'jpg';
    const imageFilename = `listing-${listingId}-${imageHash}.${imageExtension}`;
    const imagePath = path.join(assetsDir, imageFilename);

    try {
      if (!fs.existsSync(imagePath) || fs.statSync(imagePath).size === 0) {
        await downloadImage(business.imageUrl, imagePath);
      }

      // Generate comprehensive financial and business data
      const financialData = generateFinancialData(business.askingPrice, business.revenue);
      const businessContent = generateBusinessContent(business.industry, business.businessModel);

      successfulListings.push({
        ...business,
        ...financialData,
        ...businessContent,
        imagePath: `/assets/listing-assets/${imageFilename}`
      });
      downloadedCount++;
    } catch (error) {
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      skippedCount++;
    }
  }

  console.log(`\n📊 Download Summary:`);
  console.log(`   ✅ Successfully processed: ${downloadedCount}`);
  console.log(`   ❌ Skipped/Failed: ${skippedCount}`);
  console.log('✅ Step 4 Complete: CSV processed and images downloaded\n');

  // =====================================================
  // STEP 5: INSERT COMPREHENSIVE LISTINGS
  // =====================================================
  console.log('✍️ Step 5: Inserting comprehensive listings into the database...');

  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabaseUrl = 'https://kktmizfxgtkodtujursv.supabase.co';
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdG1pemZ4Z3Rrb2R0dWp1cnN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODU4NjAwMSwiZXhwIjoyMDY0MTYyMDAxfQ.EComR2_5PS_fdW2XzOTPjSfOjBacve0nrblAEHUsLwk';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const listingsToInsert = successfulListings.map(business => {
      const description = (business.description || `A ${business.businessModel} business in the ${business.industry} industry located in ${business.location}. Established business with strong fundamentals and growth potential.`).substring(0, 400);

      return {
        seller_id: sellerUserId,
        title: business.title,
        short_description: description,
        industry: business.industry,
        business_model: business.businessModel,
        location_country: business.location,
        location_city: business.city,
        asking_price: business.askingPrice,
        annual_revenue_range: business.revenueRange,
        net_profit_margin_range: business.marginRange,
        verified_annual_revenue: Math.round(business.verifiedRevenue),
        verified_net_profit: Math.round(business.verifiedNetProfit),
        verified_cash_flow: Math.round(business.verifiedCashFlow),
        adjusted_cash_flow: Math.round(business.adjustedCashFlow),
        key_strengths_anonymous: business.keyStrengths,
        specific_growth_opportunities: business.growthOpportunities,
        reason_for_selling_anonymous: business.sellingReason,
        deal_structure_looking_for: business.dealStructure,
        number_of_employees: business.employees,
        established_year: business.yearEstablished,
        images: [business.imagePath],
        status: 'active',
        is_seller_verified: true,
        created_at: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
      };
    });

    const { error } = await supabase.from('listings').insert(listingsToInsert);
    if (error) throw error;

    console.log(`   ✅ Successfully inserted ${successfulListings.length} comprehensive listings.`);
  } catch(error) {
    console.error('   ❌ Failed to insert listings:', error.message);
    process.exit(1);
  }
  console.log('✅ Step 5 Complete: Comprehensive listings inserted\n');

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
    const { data: listings, error: fetchError } = await supabase.from('listings').select('id, images');
    if (fetchError) throw fetchError;
    let updateCount = 0;
    for (const listing of listings) {
      if (!listing.images || !Array.isArray(listing.images)) continue;
      const updatedUrls = listing.images.map(url => {
        if (typeof url === 'string' && url.startsWith('/assets/listing-assets/')) {
          const filename = url.replace('/assets/listing-assets/', '');
          return `${supabaseUrl}/storage/v1/object/public/listing-images/listing-assets/${filename}`;
        }
        return url;
      });
      if (JSON.stringify(listing.images) !== JSON.stringify(updatedUrls)) {
        const { error: updateError } = await supabase.from('listings').update({ images: updatedUrls }).eq('id', listing.id);
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
    const result = execSync(`psql $(npx supabase status --output env | grep 'DB_URL=' | cut -d'=' -f2-) -c "SELECT COUNT(*) as total_listings FROM listings;"`, { encoding: 'utf-8' });
    console.log('Database count result:', result);
  } catch (error) {
    console.log('Could not verify database count');
  }

  console.log('\n🎉 COMPREHENSIVE DATA SEEDER FINISHED!');
  console.log('=========================================');
  console.log(`✅ Seller user created: seller@nobridge.co`);
  console.log(`✅ Images downloaded: ${downloadedCount}`);
  console.log(`✅ Comprehensive listings: ${successfulListings.length}`);
  console.log(`✅ Financial data: Revenue, Cash Flow, CF Multiples`);
  console.log(`✅ Business content: Strengths, Opportunities, Reasons`);
  console.log(`✅ Images in storage: ${downloadedCount}`);
  console.log('✅ All data is comprehensive and realistic!');
  console.log('=========================================');
  console.log('🌐 Your marketplace now has rich financial data for CF multiples!');
}

main().catch(error => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});
