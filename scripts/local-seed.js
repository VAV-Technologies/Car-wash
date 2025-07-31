#!/usr/bin/env node

/**
 * Safe Local Development Seeder
 * Creates admin user + 5 sample listings with local images
 * Usage: npm run load
 */

import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

// Verify we're using local environment
if (!supabaseUrl.includes('127.0.0.1') && !supabaseUrl.includes('localhost')) {
  console.error('🚨 SAFETY CHECK FAILED: Not using local Supabase URL!');
  console.error('Current URL:', supabaseUrl);
  console.error('Expected: http://127.0.0.1:54321 or localhost');
  process.exit(1);
}

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Sample listing data
const sampleListings = [
  {
    listing_title_anonymous: "Established E-commerce Business",
    anonymous_business_description: "Thriving online retail business with strong customer base and consistent revenue growth. Specializes in consumer electronics with established supplier relationships.",
    industry: "E-commerce",
    business_model: "Online Retail",
    location_country: "United States",
    location_city_region_general: "Austin",
    asking_price: 2500000,
    annual_revenue_range: "$1M - $5M USD",
    net_profit_margin_range: "20% - 30%",
    specific_annual_revenue_last_year: 3200000,
    specific_net_profit_last_year: 800000,
    
    adjusted_cash_flow: 820000,
    ebitda: 900000,
    key_strength_1: "Strong brand recognition",
    key_strength_2: "Established supplier network",
    key_strength_3: "Loyal customer base",
    growth_opportunity_1: "International expansion",
    growth_opportunity_2: "Mobile app development",
    growth_opportunity_3: "B2B sales channel",
    reason_for_selling_anonymous: "Owner retirement and succession planning",
    deal_structure_looking_for: ["Asset Purchase"],
    number_of_employees: "11-50",
    year_established: 2018,
    image: "/assets/listing-1.jpg"
  },
  {
    listing_title_anonymous: "Digital Marketing Agency",
    anonymous_business_description: "Full-service digital marketing agency serving mid-market clients. Strong recurring revenue model with long-term client contracts and proven results.",
    industry: "Marketing & Advertising",
    business_model: "Service Business",
    location_country: "United States",
    location_city_region_general: "Miami",
    asking_price: 1800000,
    annual_revenue_range: "$1M - $5M USD",
    net_profit_margin_range: "30% - 40%",
    specific_annual_revenue_last_year: 2100000,
    specific_net_profit_last_year: 650000,
    adjusted_cash_flow: 670000,
    ebitda: 720000,
    key_strength_1: "Recurring revenue model",
    key_strength_2: "Experienced team",
    key_strength_3: "High client retention",
    growth_opportunity_1: "Service expansion",
    growth_opportunity_2: "Geographic growth",
    growth_opportunity_3: "Technology platform development",
    reason_for_selling_anonymous: "Pursuing other business opportunities",
    deal_structure_looking_for: ["Share Purchase"],
    number_of_employees: "11-50",
    year_established: 2016,
    image: "/assets/listing-2.jpg"
  },
  {
    listing_title_anonymous: "Manufacturing Company",
    anonymous_business_description: "Specialized manufacturing business producing custom components for automotive industry. Modern facility with advanced equipment and quality certifications.",
    industry: "Manufacturing",
    business_model: "B2B Manufacturing",
    location_country: "United States",
    location_city_region_general: "Detroit",
    asking_price: 4200000,
    annual_revenue_range: "$5M - $10M USD",
    net_profit_margin_range: "15% - 25%",
    specific_annual_revenue_last_year: 6800000,
    specific_net_profit_last_year: 1200000,
    adjusted_cash_flow: 1250000,
    ebitda: 1400000,
    key_strength_1: "ISO certifications",
    key_strength_2: "Long-term contracts",
    key_strength_3: "Modern equipment",
    growth_opportunity_1: "Capacity expansion",
    growth_opportunity_2: "New product lines",
    growth_opportunity_3: "Additional industry verticals",
    reason_for_selling_anonymous: "Strategic exit to focus on core business",
    deal_structure_looking_for: ["Asset Purchase", "Share Purchase"],
    number_of_employees: "51-200",
    year_established: 2012,
    image: "/assets/listing-3.jpg"
  },
  {
    listing_title_anonymous: "Software as a Service Platform",
    anonymous_business_description: "B2B SaaS platform serving small to medium businesses with project management and collaboration tools. High recurring revenue and strong growth metrics.",
    industry: "Technology",
    business_model: "SaaS",
    location_country: "United States",
    location_city_region_general: "San Francisco",
    asking_price: 8500000,
    annual_revenue_range: "$5M - $10M USD",
    net_profit_margin_range: "40%+ margin",
    specific_annual_revenue_last_year: 7200000,
    specific_net_profit_last_year: 3100000,
    adjusted_cash_flow: 3150000,
    ebitda: 3300000,
    key_strength_1: "High recurring revenue",
    key_strength_2: "Low churn rate",
    key_strength_3: "Scalable platform",
    growth_opportunity_1: "Enterprise market entry",
    growth_opportunity_2: "Feature expansion",
    growth_opportunity_3: "International markets",
    reason_for_selling_anonymous: "Family relocation requirements",
    deal_structure_looking_for: ["Share Purchase"],
    number_of_employees: "11-50",
    year_established: 2019,
    image: "/assets/listing-4.jpg"
  },
  {
    listing_title_anonymous: "Restaurant Chain",
    anonymous_business_description: "Regional restaurant chain with 8 locations serving fresh, locally-sourced cuisine. Strong brand presence and loyal customer following in growing market.",
    industry: "Food & Beverage",
    business_model: "Restaurant Chain",
    location_country: "United States",
    location_city_region_general: "Denver",
    asking_price: 3200000,
    annual_revenue_range: "$1M - $5M USD",
    net_profit_margin_range: "10% - 20%",
    specific_annual_revenue_last_year: 4100000,
    specific_net_profit_last_year: 620000,
    adjusted_cash_flow: 650000,
    ebitda: 750000,
    key_strength_1: "Strong local brand",
    key_strength_2: "Prime locations",
    key_strength_3: "Experienced management",
    growth_opportunity_1: "Franchise expansion",
    growth_opportunity_2: "Delivery service growth",
    growth_opportunity_3: "Catering business development",
    reason_for_selling_anonymous: "Health and personal reasons",
    deal_structure_looking_for: ["Asset Purchase"],
    number_of_employees: "51-200",
    year_established: 2015,
    image: "/assets/listing-5.jpg"
  }
];

async function createAdminUser() {
  console.log('👤 Creating admin user...');
  
  try {
    execSync('node scripts/create-admin-user.js', { stdio: 'inherit' });
    console.log('✅ Admin user created successfully\n');
  } catch (error) {
    console.error('❌ Failed to create admin user:', error.message);
    throw error;
  }
}

async function createSellerUser() {
  console.log('🧑‍💼 Creating seller user...');
  
  const sellerEmail = 'seller@test.local';
  const sellerPassword = '100%TestSeller';

  try {
    // Create auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: sellerEmail,
      password: sellerPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'Test Seller',
        role: 'seller'
      }
    });

    if (authError && !authError.message.includes('already been registered')) {
      throw authError;
    }

    let userId;
    if (authError && authError.message.includes('already been registered')) {
      console.log('   ⚠️  Seller already exists, finding existing user...');
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers.users.find(u => u.email === sellerEmail);
      userId = existingUser?.id;
    } else {
      userId = authUser.user.id;
    }

    if (!userId) {
      throw new Error('Failed to get seller user ID');
    }

    // Create/update profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        email: sellerEmail,
        full_name: 'Test Seller',
        role: 'seller',
        is_email_verified: true,
        is_identity_verified: true,
        verification_status: 'verified',
        is_onboarding_completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (profileError) {
      throw profileError;
    }

    console.log('✅ Seller user created/updated:', userId);
    return userId;
    
  } catch (error) {
    console.error('❌ Failed to create seller user:', error.message);
    throw error;
  }
}

async function createListings(sellerId) {
  console.log('🗑️ Deleting existing test listings...');
  try {
    const { error: deleteError } = await supabase
      .from('listings')
      .delete()
      .match({ seller_id: sellerId });

    if (deleteError) {
      console.warn('⚠️  Could not delete old listings, but continuing:', deleteError.message);
    } else {
      console.log('✅ Existing test listings deleted.');
    }
  } catch (error) {
    console.warn('⚠️  Error during deletion, but continuing:', error.message);
  }

  console.log('📝 Creating 5 sample listings...');
  
  // Get admin user ID for verification metadata
  const { data: adminProfile } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('email', 'admin@nobridge.co')
    .single();
  
  const adminId = adminProfile?.id || null;
  
  try {
    const listingsToInsert = sampleListings.map(listing => {
      const newListing = {
        ...listing,
        seller_id: sellerId,
        image_urls: [listing.image],
        status: 'active',
        listing_verification_status: 'verified',
        is_seller_verified: true,
        // Add proper verification metadata
        listing_verification_by: adminId,
        listing_verification_at: new Date().toISOString(),
        listing_verification_notes: 'Auto-verified during seed process',
        created_at: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        key_strengths_anonymous: listing.key_strength_1 ? [listing.key_strength_1, listing.key_strength_2, listing.key_strength_3].filter(Boolean) : null,
        // Remove the old fields that don't exist in the schema
        verified_cash_flow: undefined
      };
      delete newListing.image;
      delete newListing.key_strength_1;
      delete newListing.key_strength_2;
      delete newListing.key_strength_3;
      delete newListing.verified_cash_flow;
      return newListing;
    });

    const { data, error } = await supabase
      .from('listings')
      .insert(listingsToInsert)
      .select('id, listing_title_anonymous');

    if (error) {
      throw error;
    }

    console.log('✅ Created listings:');
    data.forEach((listing, index) => {
      console.log(`   ${index + 1}. ${listing.listing_title_anonymous} (ID: ${listing.id})`);
    });

    return data;
    
  } catch (error) {
    console.error('❌ Failed to create listings:', error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 SAFE LOCAL SEEDER - Creating admin + 5 sample listings...');
  console.log('🔒 Using local database:', supabaseUrl);
  console.log('');

  try {
    // Step 1: Create admin user
    await createAdminUser();

    // Step 2: Create seller user
    const sellerId = await createSellerUser();

    // Step 3: Create sample listings
    const listings = await createListings(sellerId);

    // Success summary
    console.log('\n🎉 LOCAL SEEDING COMPLETE!');
    console.log('===============================');
    console.log('✅ Admin user: admin@nobridge.com / 100%Test');
    console.log('✅ Seller user: seller@test.local / 100%TestSeller');
    console.log(`✅ Sample listings: ${listings.length}`);
    console.log('✅ All images: Using local /assets/ files');
    console.log('');
    console.log('🌐 Ready for testing:');
    console.log('   Admin: http://localhost:9002/admin/login');
    console.log('   App: http://localhost:9002');
    console.log('===============================');

  } catch (error) {
    console.error('\n❌ SEEDING FAILED:', error.message);
    process.exit(1);
  }
}

// Run the script
main();