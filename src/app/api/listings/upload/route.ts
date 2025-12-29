import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { AuthenticationService } from '@/lib/auth-service';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Helper to get user using AuthenticationService (more reliable)
async function getUserFromRequest(request: NextRequest) {
  try {
    const authService = new AuthenticationService();
    const result = await authService.authenticateUser(request);

    if (!result.success || !result.user) {
      return { user: null, error: 'Authentication failed' };
    }

    return { user: result.user, error: null };
  } catch (error) {
    console.error('[UPLOAD-AUTH] Authentication error:', error);
    return { user: null, error: 'Authentication service error' };
  }
}

// Helper to map document types to database column names
function getDbColumnName(documentType: string): string {
  const mapping: Record<string, string> = {
    'financial_documents': 'financial_documents_url',
    'key_metrics_report': 'key_metrics_report_url',
    'ownership_documents': 'ownership_documents_url',
    'financial_snapshot': 'financial_snapshot_url',
    'ownership_details': 'ownership_details_url',
    'location_real_estate_info': 'location_real_estate_info_url',
    'web_presence_info': 'web_presence_info_url'
  };
  return mapping[documentType] || '';
}

// POST /api/listings/upload - Handle listing document and image uploads with database updates
export async function POST(request: NextRequest) {
  let uploadedFilePath: string | null = null;
  let bucketName: string | null = null;

  try {
    console.log('[UPLOAD] Starting upload request');

    // 🔥 FIX: Use AuthenticationService instead of token parsing
    const { user, error: authError } = await getUserFromRequest(request);
    if (authError || !user) {
      console.log('[UPLOAD] Auth error:', authError);
      return NextResponse.json({
        error: authError || 'Authentication required',
        code: 'AUTH_FAILED'
      }, { status: 401 });
    }
    console.log('[UPLOAD] User authenticated:', user.id);

    // 🔥 FIX: Better form data parsing with error handling
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (error) {
      console.error('[UPLOAD] Failed to parse form data:', error);
      return NextResponse.json({
        error: 'Invalid form data',
        code: 'INVALID_FORM_DATA'
      }, { status: 400 });
    }

    const file = formData.get('file') as File | null;
    const documentType = formData.get('document_type') as string | null;
    const listingId = formData.get('listing_id') as string | null;

    console.log('[UPLOAD] File:', file?.name, 'Type:', file?.type, 'Size:', file?.size);
    console.log('[UPLOAD] Document type:', documentType);
    console.log('[UPLOAD] Listing ID:', listingId);

    // 🔥 FIX: Enhanced validation with specific error messages
    if (!file) {
      return NextResponse.json({
        error: 'No file provided',
        code: 'MISSING_FILE'
      }, { status: 400 });
    }

    if (!documentType) {
      return NextResponse.json({
        error: 'Document type is required',
        code: 'MISSING_DOCUMENT_TYPE'
      }, { status: 400 });
    }

    // File size validation
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({
        error: `File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds 5MB limit`,
        code: 'FILE_TOO_LARGE'
      }, { status: 400 });
    }

    // MIME type validation
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/jpg'
    ];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({
        error: `Invalid file type: ${file.type}. Allowed: PDF, XLSX, CSV, JPG, PNG, WebP`,
        code: 'INVALID_FILE_TYPE'
      }, { status: 400 });
    }

    // Document type validation
    const validDocumentTypes = [
      'financial_documents',
      'key_metrics_report',
      'ownership_documents',
      'financial_snapshot',
      'ownership_details',
      'location_real_estate_info',
      'web_presence_info',
      // Image upload types
      'image_url_1',
      'image_url_2',
      'image_url_3',
      'image_url_4',
      'image_url_5'
    ];

    if (!validDocumentTypes.includes(documentType)) {
      console.log('[UPLOAD] Invalid document type:', documentType);
      return NextResponse.json({
        error: `Invalid document type: ${documentType}`,
        code: 'INVALID_DOCUMENT_TYPE',
        validTypes: validDocumentTypes
      }, { status: 400 });
    }

    // 🔥 FIX: Enhanced listing ownership verification
    if (listingId) {
      try {
        const { data: listing, error: listingError } = await supabaseAdmin
          .from('listings')
          .select('id, seller_id')
          .eq('id', listingId)
          .single();

        if (listingError) {
          console.error('[UPLOAD] Database error fetching listing:', listingError);
          return NextResponse.json({
            error: 'Failed to verify listing ownership',
            code: 'LISTING_VERIFICATION_FAILED'
          }, { status: 500 });
        }

        if (!listing) {
          return NextResponse.json({
            error: 'Listing not found',
            code: 'LISTING_NOT_FOUND'
          }, { status: 404 });
        }

        if (listing.seller_id !== user.id) {
          console.log('[UPLOAD] User does not own listing:', { userId: user.id, sellerId: listing.seller_id });
          return NextResponse.json({
            error: 'You do not own this listing',
            code: 'UNAUTHORIZED_LISTING'
          }, { status: 403 });
        }
      } catch (error) {
        console.error('[UPLOAD] Unexpected error during listing verification:', error);
        return NextResponse.json({
          error: 'Internal error during listing verification',
          code: 'LISTING_VERIFICATION_ERROR'
        }, { status: 500 });
      }
    }

    // 🔥 FIX: Better file extension handling
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'bin';

    // Determine storage bucket and path based on document type
    const isImage = documentType.startsWith('image_url_');
    bucketName = isImage ? 'listing-images' : 'listing-documents';
    const storagePath = `${isImage ? 'images' : 'documents'}/${user.id}/${documentType}_${Date.now()}.${fileExtension}`;
    uploadedFilePath = storagePath;

    console.log('[UPLOAD] Storage details:', { isImage, bucketName, storagePath });

    // 🔥 FIX: Enhanced storage upload with better error handling
    let uploadData;
    try {
      const uploadResult = await supabaseAdmin.storage
        .from(bucketName)
        .upload(storagePath, file, {
          contentType: file.type,
          cacheControl: isImage ? '86400' : '3600',
          upsert: false
        });

      if (uploadResult.error) {
        console.error('[UPLOAD] Storage upload error:', uploadResult.error);
        return NextResponse.json({
          error: 'Failed to upload file to storage',
          code: 'STORAGE_UPLOAD_FAILED',
          details: uploadResult.error.message
        }, { status: 500 });
      }

      uploadData = uploadResult.data;
      console.log('[UPLOAD] File uploaded to storage successfully:', uploadData.path);
    } catch (error) {
      console.error('[UPLOAD] Unexpected storage error:', error);
      return NextResponse.json({
        error: 'Unexpected storage error',
        code: 'STORAGE_ERROR'
      }, { status: 500 });
    }

    // 🔥 FIX: Enhanced signed URL generation
    let signedUrl;
    try {
      const urlResult = await supabaseAdmin.storage
        .from(bucketName)
        .createSignedUrl(storagePath, 60 * 60 * 24 * 365); // Valid for 1 year

      if (urlResult.error || !urlResult.data?.signedUrl) {
        console.error('[UPLOAD] Failed to generate signed URL:', urlResult.error);
        // Clean up uploaded file
        await supabaseAdmin.storage.from(bucketName).remove([storagePath]);
        return NextResponse.json({
          error: 'Failed to generate file access URL',
          code: 'URL_GENERATION_FAILED',
          details: urlResult.error?.message
        }, { status: 500 });
      }

      signedUrl = urlResult.data.signedUrl;
      console.log('[UPLOAD] Signed URL generated successfully');
    } catch (error) {
      console.error('[UPLOAD] Unexpected URL generation error:', error);
      // Clean up uploaded file
      await supabaseAdmin.storage.from(bucketName).remove([storagePath]);
      return NextResponse.json({
        error: 'Unexpected URL generation error',
        code: 'URL_ERROR'
      }, { status: 500 });
    }

    // 🔥 FIX: Enhanced database updates with better error handling
    if (listingId && !isImage) {
      // For documents, update the specific listing record
      const dbColumnName = getDbColumnName(documentType);
      if (dbColumnName) {
        try {
          const { error: updateError } = await supabaseAdmin
            .from('listings')
            .update({ [dbColumnName]: signedUrl })
            .eq('id', listingId)
            .eq('seller_id', user.id);

          if (updateError) {
            console.error('[UPLOAD] Failed to update listing record:', updateError);
            // Clean up uploaded file
            await supabaseAdmin.storage.from(bucketName).remove([storagePath]);
            return NextResponse.json({
              error: 'Failed to update listing record',
              code: 'DATABASE_UPDATE_FAILED',
              details: updateError.message
            }, { status: 500 });
          }

          console.log('[UPLOAD] Listing record updated successfully');
        } catch (error) {
          console.error('[UPLOAD] Unexpected database error:', error);
          // Clean up uploaded file
          await supabaseAdmin.storage.from(bucketName).remove([storagePath]);
          return NextResponse.json({
            error: 'Unexpected database error',
            code: 'DATABASE_ERROR'
          }, { status: 500 });
        }
      }
    }

    // 🔥 FIX: Enhanced image array updates
    if (listingId && isImage) {
      try {
        // Get current listing to update images array
        const { data: currentListing, error: fetchError } = await supabaseAdmin
          .from('listings')
          .select('image_urls')
          .eq('id', listingId)
          .eq('seller_id', user.id)
          .single();

        if (fetchError) {
          console.error('[UPLOAD] Failed to fetch current listing:', fetchError);
          // Clean up uploaded file
          await supabaseAdmin.storage.from(bucketName).remove([storagePath]);
          return NextResponse.json({
            error: 'Failed to fetch listing for image update',
            code: 'LISTING_FETCH_FAILED',
            details: fetchError.message
          }, { status: 500 });
        }

        // Update images array
        const currentImages = Array.isArray(currentListing.image_urls) ? currentListing.image_urls : [];
        const imageIndex = parseInt(documentType.split('_')[2]) - 1; // Extract index from image_url_1, etc.

        // Ensure array is large enough
        while (currentImages.length <= imageIndex) {
          currentImages.push(null);
        }

        currentImages[imageIndex] = signedUrl;

        const { error: updateError } = await supabaseAdmin
          .from('listings')
          .update({ image_urls: currentImages })
          .eq('id', listingId)
          .eq('seller_id', user.id);

        if (updateError) {
          console.error('[UPLOAD] Failed to update listing images:', updateError);
          // Clean up uploaded file
          await supabaseAdmin.storage.from(bucketName).remove([storagePath]);
          return NextResponse.json({
            error: 'Failed to update listing images',
            code: 'IMAGE_UPDATE_FAILED',
            details: updateError.message
          }, { status: 500 });
        }

        console.log('[UPLOAD] Listing images updated successfully');
      } catch (error) {
        console.error('[UPLOAD] Unexpected image update error:', error);
        // Clean up uploaded file
        await supabaseAdmin.storage.from(bucketName).remove([storagePath]);
        return NextResponse.json({
          error: 'Unexpected image update error',
          code: 'IMAGE_ERROR'
        }, { status: 500 });
      }
    }

    console.log('[UPLOAD] Upload completed successfully');

    return NextResponse.json({
      success: true,
      filePath: storagePath,
      signedUrl: signedUrl,
      documentType,
      fileName: file.name,
      fileSize: file.size,
      listingUpdated: !!listingId
    });

  } catch (error) {
    console.error('[UPLOAD] Unexpected error:', error);

    // Clean up uploaded file if it exists
    if (uploadedFilePath && bucketName) {
      try {
        await supabaseAdmin.storage.from(bucketName).remove([uploadedFilePath]);
        console.log('[UPLOAD] Cleaned up uploaded file after error');
      } catch (cleanupError) {
        console.error('[UPLOAD] Failed to clean up file:', cleanupError);
      }
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json({
        error: 'Invalid request format (expected FormData)',
        code: 'INVALID_REQUEST_FORMAT'
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
