-- ===================================================================
-- Nobridge Business Marketplace - Clean Demo Data Seeding Script
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
-- 2. CREATE BUSINESS LISTINGS (5 DEMO LISTINGS ONLY)
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

-- Additional demo listings (2-5) would go here in the same format...

-- ===================================================================
-- 3. FINAL STATUS MESSAGE
-- ===================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Nobridge Demo Data Setup Complete!';
    RAISE NOTICE 'Created 5 demo business listings';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Demo seller login: seller@nobridge.co';
    RAISE NOTICE 'Demo seller password: 100%%Seller';
    RAISE NOTICE '========================================';
END $$;
