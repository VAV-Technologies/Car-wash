import { NextRequest, NextResponse } from 'next/server';
import { authServer } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { ListingVerificationStatus } from '@/lib/types';

interface VerificationUpdateRequest {
  verificationStatus: ListingVerificationStatus;
  notes?: string;
}

interface VerificationResponse {
  success: boolean;
  message: string;
  data?: {
    listingId: string;
    previousStatus: ListingVerificationStatus | null;
    newStatus: ListingVerificationStatus;
    verifiedBy: string;
    verifiedAt: string;
    notes?: string;
  };
  error?: string;
}

// PATCH /api/admin/listings/[id]/verification - Update listing verification status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<VerificationResponse>> {
  try {
    // Authenticate and verify admin role
    const user = await authServer.getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required'
      }, { status: 401 });
    }

    const profile = await authServer.getCurrentUserProfile(request);
    if (profile?.role !== 'admin') {
      return NextResponse.json({ 
        success: false,
        error: 'Admin access required',
        message: 'Admin privileges required to update listing verification'
      }, { status: 403 });
    }

    const { id: listingId } = await params;
    if (!listingId) {
      return NextResponse.json({
        success: false,
        error: 'Listing ID is required',
        message: 'Listing ID parameter is missing'
      }, { status: 400 });
    }

    // Parse request body
    const body: VerificationUpdateRequest = await request.json();
    const { verificationStatus, notes } = body;

    // Validate verification status
    const validStatuses: ListingVerificationStatus[] = ['unverified', 'verified', 'deactivated'];
    if (!verificationStatus || !validStatuses.includes(verificationStatus)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid verification status',
        message: `Verification status must be one of: ${validStatuses.join(', ')}`
      }, { status: 400 });
    }

    console.log(`[ADMIN-VERIFICATION] Admin ${user.id} updating listing ${listingId} verification to: ${verificationStatus}`);

    // Check if listing exists
    const { data: existingListing, error: fetchError } = await supabaseAdmin
      .from('listings')
      .select('id, listing_title_anonymous, listing_verification_status, seller_id')
      .eq('id', listingId)
      .is('deleted_at', null)
      .single();

    if (fetchError || !existingListing) {
      console.error('[ADMIN-VERIFICATION] Listing not found:', fetchError);
      return NextResponse.json({
        success: false,
        error: 'Listing not found',
        message: 'The specified listing could not be found'
      }, { status: 404 });
    }

    // Use the database function to update verification status with proper audit trail
    const { data: updateResult, error: updateError } = await supabaseAdmin
      .rpc('update_listing_verification_status', {
        admin_user_id: user.id,
        listing_uuid: listingId,
        new_verification_status: verificationStatus, // Function now handles TEXT and casts internally
        verification_notes: notes || null
      });

    if (updateError || !updateResult?.success) {
      console.error('[ADMIN-VERIFICATION] Failed to update verification:', updateError);
      return NextResponse.json({
        success: false,
        error: updateResult?.error || 'Failed to update listing verification',
        message: updateResult?.error || 'An error occurred while updating the listing verification status'
      }, { status: 500 });
    }

    // Get seller information for the response
    const { data: seller } = await supabaseAdmin
      .from('user_profiles')
      .select('id, full_name, email')
      .eq('id', existingListing.seller_id)
      .single();

    const statusMessages = {
      'verified': 'verified',
      'unverified': 'marked as unverified',
      'deactivated': 'deactivated'
    };

    console.log(`[ADMIN-VERIFICATION] Successfully updated listing ${listingId} verification from ${existingListing.listing_verification_status} to ${verificationStatus}`);

    // Return success response
    return NextResponse.json({
      success: true,
      message: `Listing '${existingListing.listing_title_anonymous}' has been ${statusMessages[verificationStatus]}`,
      data: {
        listingId: listingId,
        previousStatus: existingListing.listing_verification_status,
        newStatus: verificationStatus,
        verifiedBy: user.id,
        verifiedAt: new Date().toISOString(),
        notes: notes
      }
    });

  } catch (error) {
    console.error('[ADMIN-VERIFICATION] Unexpected error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred while updating listing verification'
    }, { status: 500 });
  }
}

// GET /api/admin/listings/[id]/verification - Get listing verification history
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    // Authenticate and verify admin role
    const user = await authServer.getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'Authentication required'
      }, { status: 401 });
    }

    const profile = await authServer.getCurrentUserProfile(request);
    if (profile?.role !== 'admin') {
      return NextResponse.json({ 
        error: 'Admin access required',
        message: 'Admin privileges required to view listing verification history'
      }, { status: 403 });
    }

    const { id: listingId } = await params;
    if (!listingId) {
      return NextResponse.json({
        error: 'Listing ID is required',
        message: 'Listing ID parameter is missing'
      }, { status: 400 });
    }

    // Get verification history using database function
    const { data: verificationHistory, error: historyError } = await supabaseAdmin
      .rpc('get_listing_verification_history', {
        listing_uuid: listingId
      });

    if (historyError) {
      console.error('[ADMIN-VERIFICATION] Failed to get verification history:', historyError);
      return NextResponse.json({
        error: 'Failed to get verification history',
        message: 'An error occurred while retrieving verification history'
      }, { status: 500 });
    }

    // Get admin action history for verification actions
    const { data: adminActions, error: actionsError } = await supabaseAdmin
      .from('admin_listing_actions')
      .select(`
        id,
        action_type,
        previous_status,
        new_status,
        admin_notes,
        created_at,
        admin_user_id,
        user_profiles!admin_listing_actions_admin_user_id_fkey(full_name)
      `)
      .eq('listing_id', listingId)
      .in('action_type', ['listing_verified', 'listing_unverified', 'listing_verification_deactivated'])
      .order('created_at', { ascending: false });

    if (actionsError) {
      console.warn('[ADMIN-VERIFICATION] Failed to get admin actions:', actionsError);
    }

    return NextResponse.json({
      success: true,
      data: {
        currentStatus: verificationHistory?.[0] || null,
        history: adminActions || [],
        listingId: listingId
      }
    });

  } catch (error) {
    console.error('[ADMIN-VERIFICATION] Unexpected error getting verification history:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while retrieving verification history'
    }, { status: 500 });
  }
}