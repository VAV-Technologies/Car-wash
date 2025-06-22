const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Enhanced configuration with validation
const CONFIG = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kktmizfxgtkodtujursv.supabase.co',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdG1pemZ4Z3Rrb2R0dWp1cnN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODU4NjAwMSwiZXhwIjoyMDY0MTYyMDAxfQ.EComR2_5PS_fdW2XzOTPjSfOjBacve0nrblAEHUsLwk',
    bucketName: 'listing-images',
    maxRetries: 3,
    uploadTimeout: 30000,
    batchSize: 10
};

// Validate configuration
if (!CONFIG.supabaseUrl || !CONFIG.supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

console.log('🔧 Configuration:');
console.log(`   📡 Supabase URL: ${CONFIG.supabaseUrl}`);
console.log(`   🪣 Bucket: ${CONFIG.bucketName}`);
console.log(`   🔄 Max retries: ${CONFIG.maxRetries}`);
console.log('');

const supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseServiceKey);

// Statistics tracking
const stats = {
    totalFiles: 0,
    uploaded: 0,
    skipped: 0,
    failed: 0,
    databaseUpdated: 0,
    errors: []
};

async function validateSupabaseConnection() {
    console.log('🔍 Validating Supabase connection...');

    try {
        // Test basic connection
        const { data, error } = await supabase.storage.listBuckets();

        if (error) {
            throw new Error(`Supabase connection failed: ${error.message}`);
        }

        console.log('   ✅ Supabase connection successful');

        // Check if bucket exists
        const bucketExists = data.some(bucket => bucket.name === CONFIG.bucketName);
        if (!bucketExists) {
            console.log(`   ⚠️  Bucket '${CONFIG.bucketName}' not found`);

            // Try to create bucket
            const { error: createError } = await supabase.storage.createBucket(CONFIG.bucketName, {
                public: true,
                allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg'],
                fileSizeLimit: 10485760 // 10MB
            });

            if (createError) {
                throw new Error(`Failed to create bucket: ${createError.message}`);
            }

            console.log(`   ✅ Created bucket '${CONFIG.bucketName}'`);
        } else {
            console.log(`   ✅ Bucket '${CONFIG.bucketName}' exists`);
        }

        return true;
    } catch (error) {
        console.error(`❌ Supabase validation failed: ${error.message}`);
        return false;
    }
}

async function getExistingFiles() {
    console.log('📋 Checking existing files in storage...');

    const existingFiles = new Set();

    try {
        // Check all possible folders
        const folders = ['original', 'listing-assets', ''];

        for (const folder of folders) {
            const { data: files, error } = await supabase.storage
                .from(CONFIG.bucketName)
                .list(folder, { limit: 1000 });

            if (!error && files) {
                files.forEach(file => {
                    if (file.name) {
                        const fullPath = folder ? `${folder}/${file.name}` : file.name;
                        existingFiles.add(fullPath);
                    }
                });
            }
        }

        console.log(`   📸 Found ${existingFiles.size} existing files`);
        return existingFiles;

    } catch (error) {
        console.warn(`   ⚠️  Could not check existing files: ${error.message}`);
        return new Set();
    }
}

async function uploadFileWithRetry(localPath, storageKey, contentType) {
    for (let attempt = 1; attempt <= CONFIG.maxRetries; attempt++) {
        try {
            const file = fs.readFileSync(localPath);

            const { data, error } = await supabase.storage
                .from(CONFIG.bucketName)
                .upload(storageKey, file, {
                    contentType,
                    upsert: false,
                    timeout: CONFIG.uploadTimeout
                });

            if (error) {
                if (attempt === CONFIG.maxRetries) {
                    throw error;
                }
                console.log(`   ⚠️  Attempt ${attempt} failed: ${error.message}`);
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                continue;
            }

            return { success: true, data };

        } catch (error) {
            if (attempt === CONFIG.maxRetries) {
                return { success: false, error: error.message };
            }
            console.log(`   ⚠️  Attempt ${attempt} failed: ${error.message}`);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
}

async function uploadImages() {
    console.log('🚀 Starting robust image upload process...');

    const existingFiles = await getExistingFiles();

    // Define image sources with validation
    const imageSources = [
        {
            name: 'Original Images',
            localPath: 'public/assets',
            storageFolder: 'original',
            files: ['listing-1.jpg', 'listing-2.jpg', 'listing-3.jpg', 'listing-4.jpg', 'listing-5.jpg'],
            urlPrefix: '/assets/'
        },
        {
            name: 'Listing Assets',
            localPath: 'public/assets/listing-assets',
            storageFolder: 'listing-assets',
            files: null, // Will be read from directory
            urlPrefix: '/assets/listing-assets/'
        }
    ];

    const urlMappings = new Map();

    for (const source of imageSources) {
        console.log(`\n📸 Processing ${source.name}...`);

        // Get files list
        let files = source.files;
        if (!files) {
            try {
                files = fs.readdirSync(source.localPath)
                    .filter(file => file.match(/\.(jpg|jpeg|png)$/i));
            } catch (error) {
                console.log(`   ⚠️  Could not read directory ${source.localPath}: ${error.message}`);
                continue;
            }
        }

        console.log(`   📂 Found ${files.length} files to process`);
        stats.totalFiles += files.length;

        // Process files in batches
        for (let i = 0; i < files.length; i += CONFIG.batchSize) {
            const batch = files.slice(i, i + CONFIG.batchSize);
            const promises = batch.map(async (file) => {
                const localFilePath = path.join(source.localPath, file);
                const storageKey = `${source.storageFolder}/${file}`;
                const oldUrl = `${source.urlPrefix}${file}`;

                // Check if file exists locally
                if (!fs.existsSync(localFilePath)) {
                    console.log(`   ⚠️  Local file not found: ${file}`);
                    stats.failed++;
                    return;
                }

                // Check if already uploaded
                if (existingFiles.has(storageKey)) {
                    const { data: urlData } = supabase.storage
                        .from(CONFIG.bucketName)
                        .getPublicUrl(storageKey);

                    urlMappings.set(oldUrl, urlData.publicUrl);
                    console.log(`   ⏭️  Skipped ${file} (already exists)`);
                    stats.skipped++;
                    return;
                }

                // Upload file
                const contentType = file.endsWith('.png') ? 'image/png' : 'image/jpeg';
                const result = await uploadFileWithRetry(localFilePath, storageKey, contentType);

                if (result.success) {
                    const { data: urlData } = supabase.storage
                        .from(CONFIG.bucketName)
                        .getPublicUrl(storageKey);

                    urlMappings.set(oldUrl, urlData.publicUrl);
                    console.log(`   ✅ Uploaded ${file} -> ${urlData.publicUrl}`);
                    stats.uploaded++;
                } else {
                    console.error(`   ❌ Failed to upload ${file}: ${result.error}`);
                    stats.failed++;
                    stats.errors.push(`${file}: ${result.error}`);
                }
            });

            await Promise.all(promises);

            // Brief pause between batches
            if (i + CONFIG.batchSize < files.length) {
                console.log(`   ⏸️  Batch complete, brief pause...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }

    return urlMappings;
}

async function updateDatabaseUrls(urlMappings) {
    console.log(`\n🔄 Updating database with new image URLs...`);

    try {
        // Get all listings with image URLs
        const { data: listings, error: fetchError } = await supabase
            .from('listings')
            .select('id, image_urls, images');

        if (fetchError) {
            throw new Error(`Failed to fetch listings: ${fetchError.message}`);
        }

        console.log(`   📋 Found ${listings.length} listings to check`);

        for (const listing of listings) {
            let hasChanges = false;
            let updatedData = {};

            // Update image_urls array field
            if (listing.image_urls && Array.isArray(listing.image_urls)) {
                const updatedUrls = listing.image_urls.map(url => {
                    if (typeof url === 'string' && urlMappings.has(url)) {
                        hasChanges = true;
                        return urlMappings.get(url);
                    }
                    return url;
                });

                if (hasChanges) {
                    updatedData.image_urls = updatedUrls;
                }
            }

            // Update images JSON field if it exists
            if (listing.images) {
                try {
                    const imagesArray = typeof listing.images === 'string'
                        ? JSON.parse(listing.images)
                        : listing.images;

                    if (Array.isArray(imagesArray)) {
                        const updatedImages = imagesArray.map(url => {
                            if (typeof url === 'string' && urlMappings.has(url)) {
                                hasChanges = true;
                                return urlMappings.get(url);
                            }
                            return url;
                        });

                        if (hasChanges) {
                            updatedData.images = JSON.stringify(updatedImages);
                        }
                    }
                } catch (e) {
                    console.log(`   ⚠️  Could not parse images JSON for listing ${listing.id}`);
                }
            }

            // Apply updates if needed
            if (hasChanges) {
                const { error: updateError } = await supabase
                    .from('listings')
                    .update(updatedData)
                    .eq('id', listing.id);

                if (updateError) {
                    console.error(`   ❌ Failed to update listing ${listing.id}: ${updateError.message}`);
                    stats.errors.push(`Database update ${listing.id}: ${updateError.message}`);
                } else {
                    console.log(`   ✅ Updated listing ${listing.id}`);
                    stats.databaseUpdated++;
                }
            }
        }

        return true;

    } catch (error) {
        console.error(`❌ Database update failed: ${error.message}`);
        stats.errors.push(`Database update: ${error.message}`);
        return false;
    }
}

async function verifyUploadedImages(urlMappings) {
    console.log(`\n🔍 Verifying uploaded images...`);

    let verified = 0;
    let verificationErrors = 0;

    for (const [oldUrl, newUrl] of urlMappings) {
        try {
            const response = await fetch(newUrl, { method: 'HEAD' });
            if (response.ok) {
                verified++;
            } else {
                console.log(`   ⚠️  Verification failed for ${oldUrl}: ${response.status}`);
                verificationErrors++;
            }
        } catch (error) {
            console.log(`   ⚠️  Verification error for ${oldUrl}: ${error.message}`);
            verificationErrors++;
        }
    }

    console.log(`   ✅ Verified ${verified} images`);
    if (verificationErrors > 0) {
        console.log(`   ⚠️  ${verificationErrors} verification issues`);
    }
}

async function printComprehensiveSummary(urlMappings) {
    console.log(`\n🎉 ROBUST IMAGE UPLOAD COMPLETED!`);
    console.log(`=`.repeat(60));

    // Upload Statistics
    console.log(`📊 UPLOAD STATISTICS:`);
    console.log(`   📸 Total files processed: ${stats.totalFiles}`);
    console.log(`   ⬆️  Newly uploaded: ${stats.uploaded}`);
    console.log(`   ⏭️  Skipped (existing): ${stats.skipped}`);
    console.log(`   ❌ Failed uploads: ${stats.failed}`);
    console.log(`   🔄 Database records updated: ${stats.databaseUpdated}`);

    // Success Rate
    const successRate = stats.totalFiles > 0 ? ((stats.uploaded + stats.skipped) / stats.totalFiles * 100).toFixed(1) : 0;
    console.log(`   📈 Success rate: ${successRate}%`);

    // URL Mappings
    console.log(`\n🔗 URL MAPPINGS:`);
    console.log(`   📄 Total URL mappings created: ${urlMappings.size}`);

    // Deployment Readiness
    console.log(`\n🚀 DEPLOYMENT STATUS:`);
    if (stats.failed === 0 && stats.errors.length === 0) {
        console.log(`   ✅ Ready for production deployment!`);
        console.log(`   🌐 All images should work in your deployed application`);
    } else {
        console.log(`   ⚠️  Deployment ready with ${stats.failed + stats.errors.length} issues`);
        console.log(`   📋 Review errors below and fix before deployment`);
    }

    // Errors Summary
    if (stats.errors.length > 0) {
        console.log(`\n❌ ERRORS ENCOUNTERED:`);
        stats.errors.forEach((error, index) => {
            console.log(`   ${index + 1}. ${error}`);
        });
    }

    console.log(`=`.repeat(60));
    console.log(`✨ Images are now served from Supabase storage!`);
}

async function main() {
    console.log('🚀 Starting Robust Image Upload Process...');
    console.log('='.repeat(60));

    try {
        // Step 1: Validate connection
        const connectionValid = await validateSupabaseConnection();
        if (!connectionValid) {
            process.exit(1);
        }

        // Step 2: Upload images
        const urlMappings = await uploadImages();

        // Step 3: Update database
        await updateDatabaseUrls(urlMappings);

        // Step 4: Verify uploads
        await verifyUploadedImages(urlMappings);

        // Step 5: Comprehensive summary
        await printComprehensiveSummary(urlMappings);

        // Exit with appropriate code
        process.exit(stats.failed > 0 || stats.errors.length > 0 ? 1 : 0);

    } catch (error) {
        console.error(`💥 Fatal error: ${error.message}`);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n⚠️  Process interrupted by user');
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Run the main process
main();
