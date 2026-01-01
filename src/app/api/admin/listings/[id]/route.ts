import { NextRequest, NextResponse } from 'next/server';
import { authServer } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET /api/admin/listings/[id] - Fetch single listing with all details for admin editing
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and verify admin role
    const user = await authServer.getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await authServer.getCurrentUserProfile(request);
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id: listingId } = await params;
    if (!listingId) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    // Fetch listing with seller details
    const { data: listing, error: fetchError } = await supabaseAdmin
      .from('listings')
      .select(`
        *,
        seller:user_profiles!listings_seller_id_fkey(
          id,
          full_name,
          email,
          verification_status,
          created_at
        )
      `)
      .eq('id', listingId)
      .single();

    if (fetchError || !listing) {
      console.error('[ADMIN-GET-LISTING] Listing not found:', fetchError);
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Fetch recent admin actions on this listing
    const { data: adminActions } = await supabaseAdmin
      .from('admin_listing_actions')
      .select(`
        *,
        admin:user_profiles!admin_listing_actions_admin_id_fkey(
          id,
          full_name,
          email
        )
      `)
      .eq('listing_id', listingId)
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      success: true,
      listing,
      adminActions: adminActions || [],
    });

  } catch (error) {
    console.error('[ADMIN-GET-LISTING] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/listings/[id] - Comprehensive update for admin editing (all fields)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and verify admin role
    const user = await authServer.getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await authServer.getCurrentUserProfile(request);
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id: listingId } = await params;
    if (!listingId) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { adminReason, notifySeller, ...listingUpdates } = body;

    // Validate admin reason is provided
    if (!adminReason || typeof adminReason !== 'string' || adminReason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Admin reason for edit is required' },
        { status: 400 }
      );
    }

    console.log(`[ADMIN-UPDATE-LISTING] Admin ${user.id} updating listing ${listingId}`);

    // Check if listing exists and get current data
    const { data: existingListing, error: fetchError } = await supabaseAdmin
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .single();

    if (fetchError || !existingListing) {
      console.error('[ADMIN-UPDATE-LISTING] Listing not found:', fetchError);
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Define all updatable fields from the database schema
    const updatableFields = [
      'listing_title_anonymous',
      'industry',
      'location_country',
      'location_city_region_general',
      'anonymous_business_description',
      'key_strength_1',
      'key_strength_2',
      'key_strength_3',
      'business_model',
      'year_established',
      'registered_business_name',
      'business_website_url',
      'social_media_links',
      'number_of_employees',
      'technology_stack',
      'actual_company_name',
      'full_business_address',
      'annual_revenue_range',
      'net_profit_margin_range',
      'asking_price',
      'specific_annual_revenue_last_year',
      'specific_net_profit_last_year',
      'adjusted_cash_flow',
      'ebitda',
      'adjusted_cash_flow_explanation',
      'deal_structure_looking_for',
      'reason_for_selling_anonymous',
      'detailed_reason_for_selling',
      'seller_role_and_time_commitment',
      'post_sale_transition_support',
      'specific_growth_opportunities',
      'growth_opportunity_1',
      'growth_opportunity_2',
      'growth_opportunity_3',
      'secure_data_room_link',
      'image_urls', // JSONB array for images
      // Document URLs
      'financial_documents_url',
      'key_metrics_report_url',
      'ownership_documents_url',
      'financial_snapshot_url',
      'ownership_details_url',
      'location_real_estate_info_url',
      'web_presence_info_url',
      // Status field (admin-only)
      'status',
    ];

    // Filter updates to only include updatable fields
    const updateData: Record<string, any> = {};
    const changedFields: string[] = [];

    for (const field of updatableFields) {
      if (field in listingUpdates) {
        // Track what changed for audit trail
        if (JSON.stringify(existingListing[field]) !== JSON.stringify(listingUpdates[field])) {
          changedFields.push(field);
        }
        updateData[field] = listingUpdates[field];
      }
    }

    // Add admin tracking fields
    updateData.admin_action_by = user.id;
    updateData.admin_action_at = new Date().toISOString();
    updateData.admin_notes = adminReason;
    updateData.updated_at = new Date().toISOString();

    // Skip the "no changes" check if image_urls or document URLs are in the payload
    // These fields are updated directly by the /api/listings/upload endpoint,
    // so by the time this PATCH runs, the DB already has the new values.
    // The comparison would incorrectly show "no changes" even though images were uploaded.
    const documentUrlFields = [
      'image_urls',
      'financial_documents_url',
      'key_metrics_report_url',
      'ownership_documents_url',
      'financial_snapshot_url',
      'ownership_details_url',
      'location_real_estate_info_url',
      'web_presence_info_url'
    ];
    const hasUploadedFiles = documentUrlFields.some(field => field in listingUpdates);

    if (changedFields.length === 0 && !hasUploadedFiles) {
      return NextResponse.json(
        { error: 'No changes detected' },
        { status: 400 }
      );
    }

    console.log(`[ADMIN-UPDATE-LISTING] Updating fields: ${changedFields.join(', ')}`);

    // Update the listing
    const { data: updatedListing, error: updateError } = await supabaseAdmin
      .from('listings')
      .update(updateData)
      .eq('id', listingId)
      .select('*')
      .single();

    if (updateError) {
      console.error('[ADMIN-UPDATE-LISTING] Failed to update listing:', updateError);
      return NextResponse.json(
        { error: 'Failed to update listing' },
        { status: 500 }
      );
    }

    // Log admin action for audit trail
    const { error: auditError } = await supabaseAdmin
      .from('admin_listing_actions')
      .insert({
        listing_id: listingId,
        admin_id: user.id,
        action: 'updated',
        details: {
          reason: adminReason,
          changedFields,
          notifySeller: notifySeller || false,
          previousValues: changedFields.reduce((acc, field) => {
            acc[field] = existingListing[field];
            return acc;
          }, {} as Record<string, any>),
          newValues: changedFields.reduce((acc, field) => {
            acc[field] = updatedListing[field];
            return acc;
          }, {} as Record<string, any>),
        },
      });

    if (auditError) {
      console.warn('[ADMIN-UPDATE-LISTING] Failed to log audit trail:', auditError);
      // Don't fail the update, just log the warning
    }

    // Get seller information for response
    const { data: seller } = await supabaseAdmin
      .from('user_profiles')
      .select('id, full_name, email')
      .eq('id', existingListing.seller_id)
      .single();

    console.log(`[ADMIN-UPDATE-LISTING] Successfully updated listing ${listingId} with ${changedFields.length} changes`);

    return NextResponse.json({
      success: true,
      message: `Listing '${updatedListing.listing_title_anonymous}' has been updated successfully`,
      data: {
        listing: updatedListing,
        seller: seller ? {
          id: seller.id,
          name: seller.full_name,
          email: seller.email,
        } : null,
        changes: {
          fields: changedFields,
          count: changedFields.length,
          reason: adminReason,
          updatedBy: user.id,
          updatedAt: updatedListing.updated_at,
        },
      },
    });

  } catch (error) {
    console.error('[ADMIN-UPDATE-LISTING] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
