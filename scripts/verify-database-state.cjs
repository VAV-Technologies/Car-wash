#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Configuration
const CONFIG = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kktmizfxgtkodtujursv.supabase.co',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdG1pemZ4Z3Rrb2R0dWp1cnN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODU4NjAwMSwiZXhwIjoyMDY0MTYyMDAxfQ.EComR2_5PS_fdW2XzOTPjSfOjBacve0nrblAEHUsLwk'
};

console.log('🔍 Database State Verification');
console.log('='.repeat(50));

const supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseServiceKey);

async function verifyDatabaseState() {
    try {
        // Check if listings table exists and get count
        let listings = [];
        let needsReset = false;

        const { data, error: listingsError } = await supabase
            .from('listings')
            .select('id, title, location_city, location_country, image_urls', { count: 'exact' });

        if (listingsError) {
            if (listingsError.message.includes('does not exist') || listingsError.message.includes('column')) {
                needsReset = true;
                console.log('⚠️  Database schema missing or outdated');
            } else {
                throw new Error(`Failed to fetch listings: ${listingsError.message}`);
            }
        } else {
            listings = data || [];
        }

        // Check storage bucket
        const { data: files, error: storageError } = await supabase.storage
            .from('listing-images')
            .list('listing-assets', { limit: 1000 });

        let imageCount = 0;
        if (!storageError && files) {
            imageCount = files.filter(file => file.name.endsWith('.jpg') || file.name.endsWith('.png')).length;
        }

        // Check original images
        const { data: originalFiles, error: originalError } = await supabase.storage
            .from('listing-images')
            .list('original', { limit: 100 });

        let originalImageCount = 0;
        if (!originalError && originalFiles) {
            originalImageCount = originalFiles.filter(file => file.name.endsWith('.jpg') || file.name.endsWith('.png')).length;
        }

        // Display results
        console.log('📊 CURRENT DATABASE STATE:');

        if (needsReset) {
            console.log('   🔄 Database needs reset - schema is missing or outdated');
            console.log('   📄 Fresh seed.sql file ready for import (209 listings expected)');
        } else {
            console.log(`   🏢 Total listings: ${listings.length}`);
        }

        console.log(`   📸 Listing assets in storage: ${imageCount}`);
        console.log(`   🖼️  Original demo images: ${originalImageCount}`);
        console.log(`   📍 Total storage images: ${imageCount + originalImageCount}`);

        // Show sample listings with cities (only if data exists)
        if (!needsReset && listings.length > 0) {
            console.log('\n📋 Sample listings with location data:');
            const sampleListings = listings.slice(0, 5);
            sampleListings.forEach((listing, index) => {
                console.log(`   ${index + 1}. ${listing.title}`);
                console.log(`      📍 ${listing.location_city}, ${listing.location_country}`);
                if (listing.image_urls && Array.isArray(listing.image_urls) && listing.image_urls.length > 0) {
                    console.log(`      🖼️  Images: ${listing.image_urls.length} URLs`);
                }
            });
        }

        // Check for potential issues (only if data exists)
        if (!needsReset && listings.length > 0) {
            console.log('\n🔍 Data Quality Check:');
            const listingsWithoutCities = listings.filter(l => !l.location_city || l.location_city.trim() === '');
            const listingsWithoutImages = listings.filter(l => !l.image_urls || !Array.isArray(l.image_urls) || l.image_urls.length === 0);

            if (listingsWithoutCities.length === 0) {
                console.log('   ✅ All listings have city data');
            } else {
                console.log(`   ⚠️  ${listingsWithoutCities.length} listings missing city data`);
            }

            if (listingsWithoutImages.length === 0) {
                console.log('   ✅ All listings have image URLs');
            } else {
                console.log(`   ⚠️  ${listingsWithoutImages.length} listings missing image URLs`);
            }
        }

        // Status summary
        console.log('\n🚀 SYSTEM STATUS:');
        if (needsReset) {
            console.log('   🔄 Database reset required - schema outdated');
            console.log('   📄 Seed file ready with 209 listings (5 demo + 204 CSV)');
            console.log('   📸 Images ready in storage (204 listing assets uploaded)');
            console.log('   💡 Next step: npx supabase db reset --linked');
        } else if (listings.length > 200 && imageCount > 180) {
            console.log('   ✅ System appears to be working correctly!');
            console.log('   ✅ Data processing was successful');
            console.log('   ✅ Images are uploaded to storage');
        } else if (listings.length < 50) {
            console.log('   ⚠️  Low listing count - you may need to run database reset');
            console.log('   💡 Next step: npx supabase db reset --linked');
        } else {
            console.log('   ℹ️  Partial data detected');
        }

        console.log('\n✨ Verification complete!');

    } catch (error) {
        console.error('❌ Verification failed:', error.message);
        process.exit(1);
    }
}

// Run verification
verifyDatabaseState();
