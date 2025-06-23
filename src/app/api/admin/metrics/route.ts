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

    // Verification queues
    buyerVerificationQueueCount: buyerVerificationQueue,
    sellerVerificationQueueCount: sellerVerificationQueue,

    // Engagement placeholders
    readyToEngageQueueCount: 0,
    successfulConnectionsMTD: 0,
    activeSuccessfulConnections: 0,
    closedSuccessfulConnections: 0,
    dealsClosedMTD: 0,

    // Revenue placeholders
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
