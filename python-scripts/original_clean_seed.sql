-- ===================================================================
-- Nobridge Business Marketplace - Demo Data Seeding Script
-- ===================================================================
-- This script creates demo data for the Nobridge platform including:
-- - A verified seller account (seller@nobridge.co)
-- - 5 comprehensive business listings with proper images
--
-- USAGE:
-- psql postgresql://postgres:[password]@[host]:[port]/[database] -f seed.sql
--
-- IMPORTANT: Run this only in development/demo environments
-- ===================================================================

-- Clean up existing demo data (optional - remove if you want to keep existing data)
DELETE FROM messages WHERE conversation_id IN (
    SELECT id FROM conversations WHERE seller_id IN (
        SELECT id FROM user_profiles WHERE email = 'seller@nobridge.co'
    )
);
DELETE FROM conversations WHERE seller_id IN (
    SELECT id FROM user_profiles WHERE email = 'seller@nobridge.co'
);
DELETE FROM inquiries WHERE seller_id IN (
    SELECT id FROM user_profiles WHERE email = 'seller@nobridge.co'
);
DELETE FROM listings WHERE seller_id IN (
    SELECT id FROM user_profiles WHERE email = 'seller@nobridge.co'
);
DELETE FROM user_profiles WHERE email = 'seller@nobridge.co';

-- ===================================================================
-- 1. CREATE DEMO SELLER ACCOUNT
-- ===================================================================

-- Create user in auth.users first
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'seller@nobridge.co',
    crypt('100%Seller', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '',
    '',
    '',
    '',
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Demo Seller"}',
    false,
    'authenticated'
);

-- Update the automatically created profile with our demo data
UPDATE user_profiles
SET
    full_name = 'Demo Seller',
    phone_number = '+1-555-0123',
    country = 'Indonesia',
    role = 'seller',
    is_email_verified = true,
    verification_status = 'verified',
    first_name = 'Demo',
    last_name = 'Seller',
    company_name = 'Demo Business Holdings',
    updated_at = NOW()
WHERE email = 'seller@nobridge.co';

-- ===================================================================
-- 2. CREATE BUSINESS LISTINGS
-- ===================================================================

-- Get the seller ID for reference
WITH seller_info AS (
    SELECT id as seller_id FROM user_profiles WHERE email = 'seller@nobridge.co'
)

-- Listing 1: Commercial & Industrial Painting Contractor
INSERT INTO listings (
    id,
    seller_id,
    listing_title_anonymous,
    industry,
    location_country,
    location_city_region_general,
    anonymous_business_description,
    key_strengths_anonymous,
    annual_revenue_range,
    net_profit_margin_range,
    asking_price,
    deal_structure_looking_for,
    reason_for_selling_anonymous,
    business_model,
    year_established,
    registered_business_name,
    actual_company_name,
    business_website_url,
    social_media_links,
    number_of_employees,
    specific_annual_revenue_last_year,
    specific_net_profit_last_year,
    adjusted_cash_flow,
    detailed_reason_for_selling,
    specific_growth_opportunities,
    status,
    is_seller_verified,
    image_urls,
    created_at,
    updated_at
)
SELECT
    gen_random_uuid(),
    seller_id,
    'Commercial & Industrial Painting Contractors',
    'Construction & Trades',
    'Vietnam',
    'Hanoi',
    'The business operates as a well-established mechanical and plumbing contracting firm serving commercial and industrial clients across the region. With over 15 years of operation, the company has built strong relationships with major property developers and industrial facilities.',
    '["Established client relationships with repeat business", "Experienced skilled workforce", "Comprehensive service offerings", "Strong regional reputation"]'::jsonb,
    '$21M - $22M USD',
    '30% - 35%',
    7000000.00,
    '["Asset Purchase", "Share Purchase"]'::jsonb,
    'Owner retirement and succession planning',
    'B2B service-based contracting with long-term client relationships',
    2008,
    'Professional Contractors Ltd.',
    'Elite Mechanical & Plumbing Services',
    'https://www.example-contractor.com',
    'LinkedIn: @EliteMechanical, Facebook: ElitePlumbing',
    '140 employees',
    21500000.00,
    7525000.00,
    6200000.00,
    'After 15+ years of building this business, I am ready to retire and want to ensure continuity for our excellent team and clients. The business is in great shape with strong fundamentals.',
    '• Expansion into renewable energy systems installation
• Digital marketing to reach new commercial clients
• Equipment rental division to generate additional revenue
• Training academy for skilled trades certification',
    'active',
    true,
    '["/assets/listing-1.jpg"]'::jsonb,
    NOW(),
    NOW()
FROM seller_info;

-- Listing 2: Multi-Location Auto Service Center
WITH seller_info AS (
    SELECT id as seller_id FROM user_profiles WHERE email = 'seller@nobridge.co'
)
INSERT INTO listings (
    id,
    seller_id,
    listing_title_anonymous,
    industry,
    location_country,
    location_city_region_general,
    anonymous_business_description,
    key_strengths_anonymous,
    annual_revenue_range,
    net_profit_margin_range,
    asking_price,
    deal_structure_looking_for,
    reason_for_selling_anonymous,
    business_model,
    year_established,
    registered_business_name,
    actual_company_name,
    business_website_url,
    social_media_links,
    number_of_employees,
    specific_annual_revenue_last_year,
    specific_net_profit_last_year,
    adjusted_cash_flow,
    detailed_reason_for_selling,
    specific_growth_opportunities,
    status,
    is_seller_verified,
    image_urls,
    created_at,
    updated_at
)
SELECT
    gen_random_uuid(),
    seller_id,
    'Multi-Location Auto Service Center Chain',
    'Automotive',
    'India',
    'Mumbai',
    'A profitable chain of automotive service centers specializing in comprehensive vehicle maintenance, repair, and inspection services. The business serves both individual consumers and fleet operators with consistent quality across all locations.',
    '["Multiple strategic locations", "Certified technician team", "Fleet service contracts", "Modern diagnostic equipment"]'::jsonb,
    '$8M - $10M USD',
    '25% - 30%',
    9000000.00,
    '["Asset Purchase", "Management Buyout"]'::jsonb,
    'Geographic relocation and portfolio diversification',
    'Multi-location automotive service franchise model',
    2012,
    'AutoCare Services Pvt Ltd',
    'Premium Auto Solutions',
    'https://www.premiumauto-services.com',
    'Instagram: @PremiumAutoSolutions, Twitter: @AutoServicesPro',
    '130 employees',
    8750000.00,
    2625000.00,
    2100000.00,
    'Moving internationally for family reasons and looking to divest from automotive sector to focus on tech investments.',
    '• Electric vehicle servicing capabilities
• Mobile repair service expansion
• Parts wholesale distribution channel
• Corporate fleet management software platform',
    'active',
    true,
    '["/assets/listing-2.jpg"]'::jsonb,
    NOW(),
    NOW()
FROM seller_info;

-- Listing 3: Commercial Landscaping & Groundskeeping
WITH seller_info AS (
    SELECT id as seller_id FROM user_profiles WHERE email = 'seller@nobridge.co'
)
INSERT INTO listings (
    id,
    seller_id,
    listing_title_anonymous,
    industry,
    location_country,
    location_city_region_general,
    anonymous_business_description,
    key_strengths_anonymous,
    annual_revenue_range,
    net_profit_margin_range,
    asking_price,
    deal_structure_looking_for,
    reason_for_selling_anonymous,
    business_model,
    year_established,
    registered_business_name,
    actual_company_name,
    business_website_url,
    social_media_links,
    number_of_employees,
    specific_annual_revenue_last_year,
    specific_net_profit_last_year,
    adjusted_cash_flow,
    detailed_reason_for_selling,
    specific_growth_opportunities,
    status,
    is_seller_verified,
    image_urls,
    created_at,
    updated_at
)
SELECT
    gen_random_uuid(),
    seller_id,
    'Commercial Landscaping & Groundskeeping Corp.',
    'Commercial Landscaping & Groundskeeping',
    'Indonesia',
    'Banjarmasin',
    'The business operates as a full-service commercial landscaping provider specializing in comprehensive grounds maintenance for corporate complexes, retail centers, and municipal facilities across the region.',
    '["Large contract portfolio", "Specialized equipment fleet", "Sustainable practices certification", "Year-round revenue stability"]'::jsonb,
    '$12M - $15M USD',
    '35% - 40%',
    13000000.00,
    '["Asset Purchase", "Share Purchase", "Management Buyout"]'::jsonb,
    'Partnership dissolution and business focus change',
    'Commercial B2B landscaping with recurring service contracts',
    2010,
    'GreenScape Commercial Solutions',
    'Professional Landscaping Corp',
    'https://www.greenscape-solutions.id',
    'Facebook: GreenScapeIndonesia, LinkedIn: @CommercialLandscaping',
    '175 employees',
    13500000.00,
    5400000.00,
    4700000.00,
    'Business partnership is dissolving amicably, and I prefer to focus on real estate development rather than continue in the landscaping industry.',
    '• Smart irrigation system installation services
• Organic lawn care product development
• Landscape design consultation division
• Municipal government contract expansion',
    'active',
    true,
    '["/assets/listing-3.jpg"]'::jsonb,
    NOW(),
    NOW()
FROM seller_info;

-- Listing 4: Regional Coffee Roaster & Cafe Chain
WITH seller_info AS (
    SELECT id as seller_id FROM user_profiles WHERE email = 'seller@nobridge.co'
)
INSERT INTO listings (
    id,
    seller_id,
    listing_title_anonymous,
    industry,
    location_country,
    location_city_region_general,
    anonymous_business_description,
    key_strengths_anonymous,
    annual_revenue_range,
    net_profit_margin_range,
    asking_price,
    deal_structure_looking_for,
    reason_for_selling_anonymous,
    business_model,
    year_established,
    registered_business_name,
    actual_company_name,
    business_website_url,
    social_media_links,
    number_of_employees,
    specific_annual_revenue_last_year,
    specific_net_profit_last_year,
    adjusted_cash_flow,
    detailed_reason_for_selling,
    specific_growth_opportunities,
    status,
    is_seller_verified,
    image_urls,
    created_at,
    updated_at
)
SELECT
    gen_random_uuid(),
    seller_id,
    'Regional Coffee Roaster & Cafe Chain',
    'Restaurants & Food Service',
    'Indonesia',
    'Surabaya',
    'Positioned as a key player in Indonesia''s thriving coffee culture, this vertically integrated operation combines small-batch coffee roasting with a growing chain of premium cafes, serving both wholesale and retail markets.',
    '["Vertically integrated operation", "Premium brand positioning", "Growing market presence", "Local sourcing relationships"]'::jsonb,
    '$1.5M - $2M USD',
    '20% - 25%',
    1000000.00,
    '["Asset Purchase", "Franchise Opportunity"]'::jsonb,
    'Health reasons and lifestyle change',
    'Vertically integrated coffee roasting and retail cafe operation',
    2015,
    'Archipelago Coffee Roasters',
    'Java Premium Coffee Co',
    'https://www.javapremium.co.id',
    'Instagram: @JavaPremiumCoffee, Facebook: ArchipelagoCoffeeRoasters',
    '85 employees',
    1750000.00,
    437500.00,
    320000.00,
    'Due to health challenges, I need to step back from the demanding day-to-day operations of managing a growing food service business.',
    '• Online coffee subscription service
• Corporate catering and office coffee services
• Coffee education and barista training center
• Export opportunities to neighboring countries',
    'active',
    true,
    '["/assets/listing-4.jpg"]'::jsonb,
    NOW(),
    NOW()
FROM seller_info;

-- Listing 5: Mechanical & Plumbing Contractors
WITH seller_info AS (
    SELECT id as seller_id FROM user_profiles WHERE email = 'seller@nobridge.co'
)
INSERT INTO listings (
    id,
    seller_id,
    listing_title_anonymous,
    industry,
    location_country,
    location_city_region_general,
    anonymous_business_description,
    key_strengths_anonymous,
    annual_revenue_range,
    net_profit_margin_range,
    asking_price,
    deal_structure_looking_for,
    reason_for_selling_anonymous,
    business_model,
    year_established,
    registered_business_name,
    actual_company_name,
    business_website_url,
    social_media_links,
    number_of_employees,
    specific_annual_revenue_last_year,
    specific_net_profit_last_year,
    adjusted_cash_flow,
    detailed_reason_for_selling,
    specific_growth_opportunities,
    status,
    is_seller_verified,
    image_urls,
    created_at,
    updated_at
)
SELECT
    gen_random_uuid(),
    seller_id,
    'Mechanical & Plumbing Contractors',
    'Construction & Trades',
    'Vietnam',
    'Ho Chi Minh City',
    'A well-established mechanical and plumbing contracting firm serving commercial and industrial clients across Vietnam. The company specializes in HVAC systems, industrial plumbing, and mechanical installations for large-scale projects.',
    '["Strong client relationships", "Experienced workforce", "Modern equipment fleet", "Quality certifications"]'::jsonb,
    '$9M - $11M USD',
    '28% - 32%',
    10000000.00,
    '["Asset Purchase", "Share Purchase"]'::jsonb,
    'International expansion requiring capital reallocation',
    'B2B mechanical and plumbing contracting services',
    2009,
    'Vietnam Mechanical Solutions Ltd',
    'Advanced Mechanical & Plumbing Co',
    'https://www.advancedmech.vn',
    'LinkedIn: @AdvancedMechanicalVN, Facebook: VietnamMechanical',
    '100 employees',
    10200000.00,
    3060000.00,
    2650000.00,
    'Expanding business interests into manufacturing sector and need to consolidate capital for larger industrial investments.',
    '• Green building certification services
• Preventive maintenance contract division
• Equipment manufacturing and distribution
• Regional expansion into Cambodia and Laos',
    'active',
    true,
    '["/assets/listing-5.jpg"]'::jsonb,
    NOW(),
    NOW()
FROM seller_info;

-- ===================================================================
-- 3. VERIFICATION AND CLEANUP
-- ===================================================================

-- Update listing counts and refresh any materialized views if they exist
UPDATE user_profiles
SET updated_at = NOW()
WHERE email = 'seller@nobridge.co';

-- Display summary of created data
DO $$
DECLARE
    seller_count INTEGER;
    listing_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO seller_count FROM user_profiles WHERE email = 'seller@nobridge.co';
    SELECT COUNT(*) INTO listing_count FROM listings WHERE seller_id IN (
        SELECT id FROM user_profiles WHERE email = 'seller@nobridge.co'
    );

    RAISE NOTICE '========================================';
    RAISE NOTICE 'SEEDING COMPLETED SUCCESSFULLY';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Created seller accounts: %', seller_count;
    RAISE NOTICE 'Created business listings: %', listing_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Demo seller login: seller@nobridge.co';
    RAISE NOTICE 'Demo seller password: 100%%Seller';
    RAISE NOTICE '========================================';
END $$;
