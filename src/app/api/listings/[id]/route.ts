import { NextRequest, NextResponse } from 'next/server'
import { authServer } from '@/lib/auth-server'

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/listings/[id] - Get single listing details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      )
    }

    // Get the current user (if any) to determine what data to show
    const user = await authServer.getCurrentUser(request)
    const userProfile = user ? await authServer.getCurrentUserProfile(request) : null

    // Create authenticated Supabase client
    const { supabase: authenticatedSupabase } = authServer.createServerClient(request)

    // Build query based on user permissions
    let query = authenticatedSupabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)  // Filter out soft deleted listings

    const { data: listing, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Listing not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching listing:', error)
      return NextResponse.json(
        { error: 'Failed to fetch listing' },
        { status: 500 }
      )
    }

    // Determine what data to show based on user role and listing ownership
    let responseData = { ...listing }

    // If user is not the seller and doesn't have admin privileges
    if (!user || (userProfile?.role !== 'admin' && listing.seller_id !== user.id)) {
      // Remove sensitive financial information for non-verified listings
      if (listing.status === 'verified_anonymous') {
        // Keep anonymous data but hide detailed financials
        delete responseData.verified_annual_revenue
        delete responseData.verified_net_profit
        delete responseData.verified_cash_flow
        delete responseData.seller_id
      } else if (listing.status === 'draft' || listing.status === 'pending_approval') {
        // These shouldn't be visible to non-owners
        return NextResponse.json(
          { error: 'Listing not found' },
          { status: 404 }
        )
      }
    }

    // Transform the data to match the expected API format (same as GET /api/listings)
    const transformedListing = {
      id: responseData.id,
      title: responseData.listing_title_anonymous,
      short_description: responseData.anonymous_business_description,
      asking_price: responseData.asking_price,
      industry: responseData.industry,
      location_country: responseData.location_country,
      location_city: responseData.location_city_region_general,
      established_year: responseData.year_established,
      number_of_employees: responseData.number_of_employees,
      website_url: responseData.business_website_url,
      images: responseData.image_urls,
      status: responseData.status,
      verification_status: responseData.is_seller_verified ? 'verified' : 'pending',
      created_at: responseData.created_at,
      updated_at: responseData.updated_at,
      seller_id: responseData.seller_id,
      annual_revenue_range: responseData.annual_revenue_range,
      net_profit_margin_range: responseData.net_profit_margin_range,
      verified_annual_revenue: responseData.specific_annual_revenue_last_year,
      verified_net_profit: responseData.specific_net_profit_last_year,
      verified_cash_flow: responseData.adjusted_cash_flow,
      adjusted_cash_flow: responseData.adjusted_cash_flow,
      ebitda: responseData.ebitda,

      // Listing verification fields
      listingVerificationStatus: responseData.listing_verification_status,
      listingVerificationBy: responseData.listing_verification_by,
      listingVerificationAt: responseData.listing_verification_at,
      listingVerificationNotes: responseData.listing_verification_notes,

      // Individual key strength fields
      key_strength_1: responseData.key_strength_1,
      key_strength_2: responseData.key_strength_2,
      key_strength_3: responseData.key_strength_3,

      // Individual growth opportunity fields
      growth_opportunity_1: responseData.growth_opportunity_1,
      growth_opportunity_2: responseData.growth_opportunity_2,
      growth_opportunity_3: responseData.growth_opportunity_3,

      // Legacy format support
      key_strengths_anonymous: responseData.key_strengths_anonymous ||
        (responseData.key_strength_1 ?
          [responseData.key_strength_1, responseData.key_strength_2, responseData.key_strength_3].filter(Boolean) :
          null),
      specific_growth_opportunities: responseData.specific_growth_opportunities ||
        (responseData.growth_opportunity_1 ?
          [responseData.growth_opportunity_1, responseData.growth_opportunity_2, responseData.growth_opportunity_3]
            .filter(Boolean)
            .map(opp => `• ${opp}`)
            .join('\n') :
          null),

      // Additional fields
      business_model: responseData.business_model,
      deal_structure_looking_for: responseData.deal_structure_looking_for,
      reason_for_selling_anonymous: responseData.reason_for_selling_anonymous,
      detailed_reason_for_selling: responseData.detailed_reason_for_selling,
      social_media_links: responseData.social_media_links,
      registered_business_name: responseData.registered_business_name,
      is_seller_verified: responseData.is_seller_verified,

      // 🔥 CRITICAL FIX: Document URLs were missing from API response
      // This is why uploaded documents weren't appearing in the listing view
      financial_documents_url: responseData.financial_documents_url,
      key_metrics_report_url: responseData.key_metrics_report_url,
      ownership_documents_url: responseData.ownership_documents_url,
      financial_snapshot_url: responseData.financial_snapshot_url,
      ownership_details_url: responseData.ownership_details_url,
      location_real_estate_info_url: responseData.location_real_estate_info_url,
      web_presence_info_url: responseData.web_presence_info_url,
      secure_data_room_link: responseData.secure_data_room_link
    }

    return NextResponse.json(transformedListing)
  } catch (error) {
    console.error('Listing fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/listings/[id] - Update listing (seller only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authServer.getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Create authenticated Supabase client
    const { supabase: authenticatedSupabase } = authServer.createServerClient(request)

    const { id } = await params
    if (!id) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      )
    }

    // Check if listing exists and user owns it
    const { data: existingListing, error: fetchError } = await authenticatedSupabase
      .from('listings')
      .select('seller_id, status')
      .eq('id', id)
      .is('deleted_at', null)  // Filter out soft deleted listings
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Listing not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to fetch listing' },
        { status: 500 }
      )
    }

    // Check ownership (unless user is admin)
    const userProfile = await authServer.getCurrentUserProfile(request)
    if (userProfile?.role !== 'admin' && existingListing.seller_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only update your own listings' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Define updatable fields (excluding system fields)
    const updatableFields = [
      'title',
      'short_description',
      'business_overview',
      'asking_price',
      'business_type',
      'industry',
      'location_country',
      'location_city',
      'established_year',
      'number_of_employees',
      'website_url',
      'images',
      'annual_revenue',
      'net_profit',
      'monthly_cash_flow',
      'growth_rate',
      'key_assets',
      'liabilities_debt',
      'reason_for_selling',
      'ideal_buyer_profile',
      'transition_timeline',
      'support_training_offered'
    ]

    // Filter body to only include updatable fields
    const updateData: Record<string, any> = {}
    for (const field of updatableFields) {
      if (field in body) {
        updateData[field] = body[field]
      }
    }

    // Always update the updated_at timestamp
    updateData.updated_at = new Date().toISOString()

    // If listing was verified and we're updating financial data, reset verification
    if (existingListing.status === 'verified_with_financials' &&
        ['annual_revenue', 'net_profit', 'monthly_cash_flow'].some(field => field in updateData)) {
      updateData.verification_status = 'pending_verification'
    }

    if (Object.keys(updateData).length === 1) { // Only updated_at
      return NextResponse.json(
        { error: 'No valid fields provided for update' },
        { status: 400 }
      )
    }

    const { data: updatedListing, error } = await authenticatedSupabase
      .from('listings')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating listing:', error)
      return NextResponse.json(
        { error: 'Failed to update listing' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Listing updated successfully',
      listing: updatedListing
    })
  } catch (error) {
    console.error('Listing update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/listings/[id] - Soft delete listing (seller only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authServer.getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Create authenticated Supabase client
    const { supabase: authenticatedSupabase } = authServer.createServerClient(request)

    const { id } = await params
    if (!id) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      )
    }

    // Check if listing exists and user owns it
    const { data: existingListing, error: fetchError } = await authenticatedSupabase
      .from('listings')
      .select('seller_id')
      .eq('id', id)
      .is('deleted_at', null)  // Only check non-deleted listings
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Listing not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to fetch listing' },
        { status: 500 }
      )
    }

    // Check ownership (unless user is admin)
    const userProfile = await authServer.getCurrentUserProfile(request)
    if (userProfile?.role !== 'admin' && existingListing.seller_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own listings' },
        { status: 403 }
      )
    }

    // Use the soft delete function
    const { data, error } = await authenticatedSupabase
      .rpc('soft_delete_listing', {
        listing_id: id,
        deleter_id: user.id
      })

    if (error) {
      console.error('Error soft deleting listing:', error)
      return NextResponse.json(
        { error: 'Failed to delete listing' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Failed to delete listing - permission denied' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      message: 'Listing deleted successfully'
    })
  } catch (error) {
    console.error('Listing deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/listings/[id] - Comprehensive update for edit page (all fields)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authServer.getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Create authenticated Supabase client
    const { supabase: authenticatedSupabase } = authServer.createServerClient(request)

    const { id } = await params
    if (!id) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      )
    }

    // Check if listing exists and user owns it
    const { data: existingListing, error: fetchError } = await authenticatedSupabase
      .from('listings')
      .select('seller_id, status')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Listing not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to fetch listing' },
        { status: 500 }
      )
    }

    // Check ownership (unless user is admin)
    const userProfile = await authServer.getCurrentUserProfile(request)
    if (userProfile?.role !== 'admin' && existingListing.seller_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only update your own listings' },
        { status: 403 }
      )
    }

    const body = await request.json()

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
      'image_urls',  // JSONB array for images
      // Document URLs
      'financial_documents_url',
      'key_metrics_report_url',
      'ownership_documents_url',
      'financial_snapshot_url',
      'ownership_details_url',
      'location_real_estate_info_url',
      'web_presence_info_url'
    ]

    // Filter body to only include updatable fields
    const updateData: Record<string, any> = {}
    for (const field of updatableFields) {
      if (field in body) {
        updateData[field] = body[field]
      }
    }

    // Always update the updated_at timestamp
    updateData.updated_at = new Date().toISOString()

    if (Object.keys(updateData).length === 1) { // Only updated_at
      return NextResponse.json(
        { error: 'No valid fields provided for update' },
        { status: 400 }
      )
    }

    console.log('[API] Updating listing with fields:', Object.keys(updateData))

    const { data: updatedListing, error } = await authenticatedSupabase
      .from('listings')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating listing:', error)
      return NextResponse.json(
        { error: 'Failed to update listing' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Listing updated successfully',
      listing: updatedListing
    })
  } catch (error) {
    console.error('Listing update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
