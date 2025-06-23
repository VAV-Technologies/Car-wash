import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { AuthenticationService } from '@/lib/auth-service'
import type { AdminDashboardMetrics } from '@/lib/types'

// GET /api/admin/metrics
export async function GET(req: NextRequest) {
  // Authenticate the requester and make sure they are an admin
  const authService = AuthenticationService.getInstance()
  const authResult = await authService.authenticateUser(req)

  if (!authResult.success || !authResult.user || !authResult.profile) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  if (authResult.profile.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden_role' }, { status: 403 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )

  // Time windows
  const now = new Date()
  const ts24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
  const ts7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  // Helper to count rows
  async function countUserProfiles(filter: Record<string, any>) {
    let query = supabase.from('user_profiles').select('id', { count: 'exact', head: true })
    for (const [col, val] of Object.entries(filter)) {
      query = query.eq(col, val)
    }
    const { count } = await query
    return count ?? 0
  }

  // Helper to count listings
  async function countListings(filter: Record<string, any> = {}) {
    let query = supabase.from('listings').select('id', { count: 'exact', head: true })
    for (const [col, val] of Object.entries(filter)) {
      if (Array.isArray(val)) {
        query = query.in(col, val)
      } else {
        query = query.eq(col, val)
      }
    }
    const { count } = await query
    return count ?? 0
  }

  // Helper to count inquiries
  async function countInquiries(filter: Record<string, any> = {}) {
    let query = supabase.from('inquiries').select('id', { count: 'exact', head: true })
    for (const [col, val] of Object.entries(filter)) {
      if (Array.isArray(val)) {
        query = query.in(col, val)
      } else {
        query = query.eq(col, val)
      }
    }
    const { count } = await query
    return count ?? 0
  }

  // Helper to count conversations
  async function countConversations(filter: Record<string, any> = {}) {
    let query = supabase.from('conversations').select('id', { count: 'exact', head: true })
    for (const [col, val] of Object.entries(filter)) {
      if (Array.isArray(val)) {
        query = query.in(col, val)
      } else {
        query = query.eq(col, val)
      }
    }
    const { count } = await query
    return count ?? 0
  }

  // Helper to count verification requests
  async function countVerificationRequests(filter: Record<string, any> = {}) {
    let query = supabase.from('verification_requests').select('id', { count: 'exact', head: true })
    for (const [col, val] of Object.entries(filter)) {
      if (Array.isArray(val)) {
        query = query.in(col, val)
      } else {
        query = query.eq(col, val)
      }
    }
    const { count } = await query
    return count ?? 0
  }

  // User registration metrics
  const [newSellers24h, newBuyers24h, newSellers7d, newBuyers7d] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'seller')
      .gte('created_at', ts24h)
      .then(({ count }) => count ?? 0),

    supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'buyer')
      .gte('created_at', ts24h)
      .then(({ count }) => count ?? 0),

    supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'seller')
      .gte('created_at', ts7d)
      .then(({ count }) => count ?? 0),

    supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'buyer')
      .gte('created_at', ts7d)
      .then(({ count }) => count ?? 0),
  ])

  // Totals
  const [totalSellers, totalBuyers] = await Promise.all([
    countUserProfiles({ role: 'seller' }),
    countUserProfiles({ role: 'buyer' }),
  ])

  // Verification queues
  const [buyerVerificationQueue, sellerVerificationQueue] = await Promise.all([
    countUserProfiles({ role: 'buyer', verification_status: 'pending_verification' }),
    countUserProfiles({ role: 'seller', verification_status: 'pending_verification' }),
  ])

  // Verification requests from verification_requests table
  const [
    verificationRequestsPending,
    buyerVerificationRequests,
    sellerVerificationRequests
  ] = await Promise.all([
    // Total pending verification requests
    countVerificationRequests({ status: ['New Request', 'Contacted', 'Docs Under Review', 'More Info Requested'] }),

    // Buyer verification requests pending
    supabase
      .from('verification_requests')
      .select('id', { count: 'exact', head: true })
      .eq('request_type', 'user_verification')
      .in('status', ['New Request', 'Contacted', 'Docs Under Review', 'More Info Requested'])
      .then(async ({ count }) => {
        if (!count) return 0;
        // Filter by buyer role
        const { data } = await supabase
          .from('verification_requests')
          .select('user_id')
          .eq('request_type', 'user_verification')
          .in('status', ['New Request', 'Contacted', 'Docs Under Review', 'More Info Requested']);

        if (!data) return 0;

        const { count: buyerCount } = await supabase
          .from('user_profiles')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'buyer')
          .in('id', data.map(r => r.user_id));

        return buyerCount ?? 0;
      }),

    // Seller verification requests pending
    supabase
      .from('verification_requests')
      .select('id', { count: 'exact', head: true })
      .eq('request_type', 'user_verification')
      .in('status', ['New Request', 'Contacted', 'Docs Under Review', 'More Info Requested'])
      .then(async ({ count }) => {
        if (!count) return 0;
        // Filter by seller role
        const { data } = await supabase
          .from('verification_requests')
          .select('user_id')
          .eq('request_type', 'user_verification')
          .in('status', ['New Request', 'Contacted', 'Docs Under Review', 'More Info Requested']);

        if (!data) return 0;

        const { count: sellerCount } = await supabase
          .from('user_profiles')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'seller')
          .in('id', data.map(r => r.user_id));

        return sellerCount ?? 0;
      }),
  ])

  // Engagement and connection metrics - now using real data from inquiries and conversations
  const [
    readyToEngageQueue,
    totalFacilitatedConnections,
    activeFacilitatedConnections,
    facilitatedConnectionsThisMonth,
    archivedConnections
  ] = await Promise.all([
    // Inquiries ready for admin connection facilitation
    countInquiries({ status: 'ready_for_admin_connection' }),

    // Total facilitated chat connections (all time)
    countInquiries({ status: 'connection_facilitated_in_app_chat_opened' }),

    // Active conversations (ongoing connections)
    countConversations({ status: 'ACTIVE' }),

    // Facilitated connections this month
    supabase
      .from('inquiries')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'connection_facilitated_in_app_chat_opened')
      .gte('updated_at', monthStart)
      .then(({ count }) => count ?? 0),

    // Archived/closed conversations
    countConversations({ status: ['ARCHIVED_BY_ADMIN', 'CLOSED_BY_PARTICIPANT'] })
  ])

  // Listing metrics - replacing hardcoded placeholders with actual database queries
  const [
    newListings24h,
    newListings7d,
    totalListingsAllStatuses,
    totalActiveListingsAnonymous,
    totalActiveListingsVerified,
    closedOrDeactivatedListings
  ] = await Promise.all([
    // New listings in last 24 hours
    supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', ts24h)
      .then(({ count }) => count ?? 0),

    // New listings in last 7 days
    supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', ts7d)
      .then(({ count }) => count ?? 0),

    // Total listings (all statuses)
    countListings(),

    // Active anonymous listings (active status but not verified public)
    countListings({ status: ['active', 'verified_anonymous'] }),

    // Active verified public listings
    countListings({ status: 'verified_public' }),

    // Closed/deactivated listings
    countListings({ status: ['inactive', 'closed_deal', 'rejected_by_admin'] })
  ])

  const metrics: AdminDashboardMetrics = {
    // Users
    newUserRegistrations24hSellers: newSellers24h,
    newUserRegistrations24hBuyers: newBuyers24h,
    newUserRegistrations7dSellers: newSellers7d,
    newUserRegistrations7dBuyers: newBuyers7d,

    // Listings - now using real data
    newListingsCreated24h: newListings24h,
    newListingsCreated7d: newListings7d,

    // Totals
    totalActiveSellers: totalSellers,
    totalPaidSellers: 0, // will implement once subscriptions exist
    totalFreeSellers: totalSellers, // same rationale
    totalActiveBuyers: totalBuyers,
    totalPaidBuyers: 0,
    totalFreeBuyers: totalBuyers,

    // Listing counts - now using real data
    totalActiveListingsAnonymous: totalActiveListingsAnonymous,
    totalActiveListingsVerified: totalActiveListingsVerified,
    totalListingsAllStatuses: totalListingsAllStatuses,
    closedOrDeactivatedListings: closedOrDeactivatedListings,

    // Verification queues - now using real data
    buyerVerificationQueueCount: buyerVerificationQueue + buyerVerificationRequests,
    sellerVerificationQueueCount: sellerVerificationQueue + sellerVerificationRequests,

    // Engagement metrics - now using real data from inquiries and conversations
    readyToEngageQueueCount: readyToEngageQueue,
    successfulConnectionsMTD: facilitatedConnectionsThisMonth,
    activeSuccessfulConnections: activeFacilitatedConnections,
    closedSuccessfulConnections: archivedConnections,
    dealsClosedMTD: archivedConnections, // Same as closed connections for now

    // Revenue placeholders (not implemented yet)
    revenueFromBuyers: 0,
    revenueFromSellers: 0,
    totalRevenueMTD: 0,
  }

  return NextResponse.json(metrics, {
    headers: {
      'Cache-Control': 's-maxage=300', // 5-minute CDN cache
    },
  })
}
