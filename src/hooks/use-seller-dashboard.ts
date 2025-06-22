import { useState, useEffect, useCallback, useRef } from 'react'

interface DashboardStats {
  activeListingsCount: number
  totalInquiriesReceived: number
  inquiriesAwaitingEngagement: number
  verificationStatus: 'verified' | 'pending_verification' | 'anonymous'
}

interface Listing {
  id: string
  title: string
  status: string
  asking_price?: number
  inquiry_count?: number
}

interface DashboardData {
  user: {
    id: string
    fullName: string
    verificationStatus: 'verified' | 'pending_verification' | 'anonymous'
  } | null
  stats: DashboardStats
  recentListings: Listing[]
  isLoading: boolean
  error: string | null
  refreshData: () => Promise<void>;
  isPolling: boolean;
}

export function useSellerDashboard(): DashboardData {
  const [data, setData] = useState<DashboardData>({
    user: null,
    stats: {
      activeListingsCount: 0,
      totalInquiriesReceived: 0,
      inquiriesAwaitingEngagement: 0,
      verificationStatus: 'anonymous'
    },
    recentListings: [],
    isLoading: true,
    error: null,
    refreshData: async () => {},
    isPolling: false,
  })

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const fastPollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const requestInProgressRef = useRef(false)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const fetchWithRetry = async (url: string, retries = 3, delay = 1000): Promise<Response> => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url)

        // Handle rate limiting with exponential backoff
        if (response.status === 429) {
          // Don't throw error on last retry - return a mock response instead
          if (i === retries - 1) {
            console.warn(`[RATE-LIMIT] Max retries reached for ${url}, returning cached/default data`)
            // Return a mock response that won't crash the app
            return new Response(JSON.stringify({
              error: 'rate_limited',
              message: 'Data temporarily unavailable due to rate limiting'
            }), {
              status: 429,
              headers: { 'Content-Type': 'application/json' }
            })
          }

          console.log(`[RATE-LIMIT] Request rate limited, retrying in ${delay}ms (attempt ${i + 1}/${retries})`)
          await sleep(delay)
          delay *= 2 // Exponential backoff
          continue
        }

        return response
      } catch (error) {
        if (i === retries - 1) {
          // Return error response instead of throwing
          console.error(`[FETCH-ERROR] Failed to fetch ${url} after ${retries} attempts:`, error)
          return new Response(JSON.stringify({
            error: 'network_error',
            message: 'Network error - please check your connection'
          }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          })
        }
        await sleep(delay)
        delay *= 2
      }
    }
    // This should never be reached, but just in case
    return new Response(JSON.stringify({
      error: 'unknown_error',
      message: 'An unexpected error occurred'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const fetchDashboardData = useCallback(async (isBackgroundRefresh = false) => {
    // Prevent multiple simultaneous requests
    if (requestInProgressRef.current) {
      console.log('[DASHBOARD] Request already in progress, skipping')
      return
    }

    try {
      requestInProgressRef.current = true

      if (!isBackgroundRefresh) {
        setData(prev => ({ ...prev, isLoading: true, error: null }))
      }

      // Use retry logic for all requests
      const userResponse = await fetchWithRetry('/api/auth/current-user')
      const userData = await userResponse.json()

      // Handle rate limited or error responses gracefully
      if (userData.error === 'rate_limited') {
        console.log('[DASHBOARD] User data rate limited, using cached data')
        // Don't crash - just skip update if we don't have cached data
        if (!data.user) {
          setData(prev => ({
            ...prev,
            isLoading: false,
            error: 'Loading data... Please wait a moment.'
          }))
          return
        }
        // Otherwise continue with cached user data
      } else if (!userResponse.ok || userData.error) {
        console.warn('[DASHBOARD] Failed to fetch user data, continuing with cached data')
        if (!data.user) {
          setData(prev => ({
            ...prev,
            isLoading: false,
            error: 'Unable to load user data. Please refresh the page.'
          }))
          return
        }
      }

      const listingsResponse = await fetchWithRetry('/api/user/listings?limit=50&sort_by=updated_at&sort_order=desc')
      const listingsData = await listingsResponse.json()

      // Handle errors gracefully - use empty data instead of crashing
      const listings = (listingsData.error || !listingsResponse.ok) ? [] : (listingsData.listings || [])
      const summary = (listingsData.error || !listingsResponse.ok) ? {} : (listingsData.summary || {})

      const inquiriesResponse = await fetchWithRetry('/api/inquiries?role=seller&limit=100')
      const inquiriesData = await inquiriesResponse.json()

      // Handle errors gracefully
      const inquiries = (inquiriesData.error || !inquiriesResponse.ok) ? [] : (inquiriesData.inquiries || [])

      // For dashboard stats, count only active listings (not rejected/inactive)
      const activeListingsCount = summary.active || 0;

      // Fix: Use actual inquiries array length since API doesn't return pagination.total
      const totalInquiriesReceived = inquiries.length || 0
      const inquiriesAwaitingEngagement = inquiries.filter(
        (inq: any) => inq.status === 'new_inquiry'
      ).length || 0

      const verificationStatus = userData.profile?.verification_status === 'verified'
        ? 'verified'
        : userData.profile?.verification_status === 'pending_verification'
        ? 'pending_verification'
        : 'anonymous'

      const formattedListings: Listing[] = listings.map((listing: any) => ({
        id: listing.id,
        title: listing.listing_title_anonymous || listing.title || 'Untitled Listing',
        status: listing.status,
        asking_price: listing.asking_price,
        inquiry_count: inquiries.filter((inq: any) => inq.listing_id === listing.id).length || 0
      }))

      const newData = {
        user: {
          id: userData.user.id,
          fullName: userData.profile?.full_name || 'User',
          verificationStatus
        },
        stats: {
          activeListingsCount,
          totalInquiriesReceived,
          inquiriesAwaitingEngagement,
          verificationStatus
        },
        recentListings: formattedListings.slice(0, 3),
        isLoading: false,
        error: null,
        isPolling,
      }

      setData(prev => ({ ...prev, ...newData }))

      // Log status changes for real-time updates
      if (isBackgroundRefresh) {
        console.log('[REAL-TIME] Dashboard refreshed - Verification status:', verificationStatus)
      }

    } catch (error) {
      console.error('Dashboard data fetch error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard data'

      setData(prev => ({
        ...prev,
        isLoading: !isBackgroundRefresh ? false : prev.isLoading,
        error: errorMessage
      }))

      // If rate limited, slow down polling
      if (errorMessage.includes('rate limit') || errorMessage.includes('Too many requests')) {
        console.log('[RATE-LIMIT] Slowing down polling due to rate limit')
        stopPolling()
        // Restart polling after a delay
        retryTimeoutRef.current = setTimeout(() => {
          startPolling()
        }, 30000) // Wait 30 seconds before resuming polling
      }
    } finally {
      requestInProgressRef.current = false
    }
  }, [isPolling])

  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return // Already polling

    setIsPolling(true)
    pollingIntervalRef.current = setInterval(() => {
      fetchDashboardData(true) // Background refresh
    }, 60000) // Poll every 60 seconds (increased from 30s to reduce rate limiting)

    console.log('[REAL-TIME] Started polling for verification status updates (60s interval)')
  }, [fetchDashboardData])

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
      setIsPolling(false)
      console.log('[REAL-TIME] Stopped polling for verification status updates')
    }

    // Clear fast polling interval if it exists
    if (fastPollingIntervalRef.current) {
      clearInterval(fastPollingIntervalRef.current)
      fastPollingIntervalRef.current = null
      console.log('[REAL-TIME] Stopped fast polling for verification status updates')
    }

    // Clear retry timeout if it exists
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }
  }, [])

  const refreshData = useCallback(async () => {
    await fetchDashboardData(false)
  }, [fetchDashboardData])

  useEffect(() => {
    fetchDashboardData(false)
    startPolling() // Start real-time polling

    // Cleanup on unmount
    return () => {
      stopPolling()
    }
  }, [fetchDashboardData, startPolling, stopPolling])

  // Listen for tab visibility changes to optimize polling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling()
      } else {
        fetchDashboardData(true) // Refresh when tab becomes visible
        startPolling()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [startPolling, stopPolling, fetchDashboardData])

  // Fast polling for real-time updates when verification is pending
  useEffect(() => {
    const verificationStatus = data.stats.verificationStatus;

    if (verificationStatus === 'pending_verification') {
      console.log('[DASHBOARD] Starting fast polling for pending verification status');
      fastPollingIntervalRef.current = setInterval(() => {
        fetchDashboardData(true);
      }, 30000); // Poll every 30 seconds for pending verification (increased from 15s)
    } else {
      if (fastPollingIntervalRef.current) {
        console.log('[DASHBOARD] Stopping fast polling - verification no longer pending');
        clearInterval(fastPollingIntervalRef.current);
        fastPollingIntervalRef.current = null;
      }
    }

    return () => {
      if (fastPollingIntervalRef.current) {
        clearInterval(fastPollingIntervalRef.current);
        fastPollingIntervalRef.current = null;
      }
    };
  }, [data.stats.verificationStatus, fetchDashboardData]);

  return { ...data, refreshData, isPolling };
}
