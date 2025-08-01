import { NextRequest, NextResponse } from 'next/server';
import { authServer } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { AdminListingWithContext, ListingStatus, RejectionCategory } from '@/lib/types';

// GET /api/admin/listings - Fetch all listings with admin context
export async function GET(request: NextRequest) {
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

    // Parse query parameters for filtering and pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Filtering parameters
    const statusFilter = searchParams.get('status') as ListingStatus | null;
    const industryFilter = searchParams.get('industry');
    const sellerVerificationFilter = searchParams.get('seller_verification'); // 'verified', 'not_verified', 'all'
    const searchQuery = searchParams.get('search');
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';

    console.log(`[ADMIN-LISTINGS] Fetching listings - Page: ${page}, Limit: ${limit}, Status: ${statusFilter}, Industry: ${industryFilter}`);

    // Build the base query with comprehensive joins
    let query = supabaseAdmin
      .from('listings')
      .select(`
        id,
        seller_id,
        listing_title_anonymous,
        industry,
        location_country,
        location_city_region_general,
        anonymous_business_description,
        annual_revenue_range,
        asking_price,
        status,
        is_seller_verified,
        admin_notes,
        admin_action_by,
        admin_action_at,
        rejection_category,
        listing_verification_status,
        listing_verification_by,
        listing_verification_at,
        listing_verification_notes,
        created_at,
        updated_at,
        inquiry_count,
        user_profiles(
          id,
          full_name,
          email,
          verification_status,
          is_paid,
          created_at
        )
      `);

    // Apply filters
    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    if (industryFilter && industryFilter !== 'all') {
      query = query.eq('industry', industryFilter);
    }

    if (sellerVerificationFilter && sellerVerificationFilter !== 'all') {
      if (sellerVerificationFilter === 'verified') {
        query = query.eq('is_seller_verified', true);
      } else if (sellerVerificationFilter === 'not_verified') {
        query = query.eq('is_seller_verified', false);
      }
    }

    // Apply search filter
    if (searchQuery) {
      query = query.or(`listing_title_anonymous.ilike.%${searchQuery}%,id.eq.${searchQuery}`);
    }

    // Apply sorting
    const validSortColumns = ['created_at', 'updated_at', 'asking_price', 'status', 'listing_title_anonymous'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    query = query.order(sortColumn, { ascending: sortOrder === 'asc' });

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabaseAdmin
      .from('listings')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('[ADMIN-LISTINGS] Count query error:', countError);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: listings, error } = await query;

    if (error) {
      console.error('[ADMIN-LISTINGS] Database error:', error);
      console.error('[ADMIN-LISTINGS] Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: 'Failed to fetch listings', details: error.message },
        { status: 500 }
      );
    }

    // Transform data to match AdminListingWithContext interface
    const transformedListings: AdminListingWithContext[] = await Promise.all(
      (listings || []).map(async (listing: any) => {
        // Fetch admin action history for this listing
        const { data: adminHistory } = await supabaseAdmin
          .from('admin_listing_actions')
          .select(`
            id,
            listing_id,
            admin_user_id,
            action_type,
            previous_status,
            new_status,
            reason_category,
            admin_notes,
            created_at,
            user_profiles(
              full_name
            )
          `)
          .eq('listing_id', listing.id)
          .order('created_at', { ascending: false })
          .limit(10);

        // Fetch appeal information if exists
        const { data: appeal } = await supabaseAdmin
          .from('listing_appeals')
          .select(`
            id,
            listing_id,
            seller_id,
            original_rejection_reason,
            original_rejection_category,
            appeal_message,
            status,
            admin_response,
            reviewed_by,
            created_at,
            reviewed_at,
            user_profiles(
              full_name
            )
          `)
          .eq('listing_id', listing.id)
          .single();

        return {
          listing: {
            id: listing.id,
            sellerId: listing.seller_id,
            listingTitleAnonymous: listing.listing_title_anonymous,
            industry: listing.industry,
            locationCountry: listing.location_country,
            locationCityRegionGeneral: listing.location_city_region_general,
            anonymousBusinessDescription: listing.anonymous_business_description,
            annualRevenueRange: listing.annual_revenue_range,
            askingPrice: listing.asking_price,
            status: listing.status,
            isSellerVerified: listing.is_seller_verified,
            adminNotes: listing.admin_notes,
            adminActionBy: listing.admin_action_by,
            adminActionAt: listing.admin_action_at ? new Date(listing.admin_action_at) : undefined,
            rejectionCategory: listing.rejection_category,
            listingVerificationStatus: listing.listing_verification_status,
            listingVerificationBy: listing.listing_verification_by,
            listingVerificationAt: listing.listing_verification_at ? new Date(listing.listing_verification_at) : undefined,
            listingVerificationNotes: listing.listing_verification_notes,
            createdAt: new Date(listing.created_at),
            updatedAt: new Date(listing.updated_at),
            inquiryCount: listing.inquiry_count || 0,
            // Required fields for Listing interface
            keyStrengthsAnonymous: [],
          } as any,
          seller: {
            id: listing.user_profiles.id,
            fullName: listing.user_profiles.full_name,
            email: listing.user_profiles.email,
            verificationStatus: listing.user_profiles.verification_status,
            isPaid: listing.user_profiles.is_paid,
            createdAt: new Date(listing.user_profiles.created_at),
          },
          adminHistory: (adminHistory || []).map((action: any) => ({
            id: action.id,
            listingId: action.listing_id,
            adminUserId: action.admin_user_id,
            adminName: action.user_profiles?.full_name,
            actionType: action.action_type,
            previousStatus: action.previous_status,
            newStatus: action.new_status,
            reasonCategory: action.reason_category,
            adminNotes: action.admin_notes,
            createdAt: new Date(action.created_at),
          })),
          appeal: appeal ? {
            id: appeal.id,
            listingId: appeal.listing_id,
            sellerId: appeal.seller_id,
            originalRejectionReason: appeal.original_rejection_reason,
            originalRejectionCategory: appeal.original_rejection_category,
            appealMessage: appeal.appeal_message,
            status: appeal.status,
            adminResponse: appeal.admin_response,
            reviewedBy: appeal.reviewed_by,
            reviewedByName: appeal.user_profiles?.full_name,
            createdAt: new Date(appeal.created_at),
            reviewedAt: appeal.reviewed_at ? new Date(appeal.reviewed_at) : undefined,
          } : undefined,
        };
      })
    );

    // Calculate pagination metadata
    const totalPages = Math.ceil((totalCount || 0) / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    // Get summary statistics
    const { data: statusCounts } = await supabaseAdmin
      .from('listings')
      .select('status')
      .then(({ data }) => {
        const counts = data?.reduce((acc: Record<string, number>, listing: any) => {
          acc[listing.status] = (acc[listing.status] || 0) + 1;
          return acc;
        }, {});
        return { data: counts };
      });

    console.log(`[ADMIN-LISTINGS] Successfully fetched ${transformedListings.length} listings`);

    return NextResponse.json({
      success: true,
      data: {
        listings: transformedListings,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount: totalCount || 0,
          hasNext,
          hasPrev,
          limit,
        },
        summary: {
          statusCounts: statusCounts || {},
          totalListings: totalCount || 0,
        },
        filters: {
          appliedFilters: {
            status: statusFilter,
            industry: industryFilter,
            sellerVerification: sellerVerificationFilter,
            search: searchQuery,
          },
        },
      },
    });

  } catch (error) {
    console.error('[ADMIN-LISTINGS] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
