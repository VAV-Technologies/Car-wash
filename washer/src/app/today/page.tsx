'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import {
  getTodaysBookings,
  getUpcomingBookings,
  getCompletedToday,
} from '@/lib/jobs'
import JobCard from '@/components/JobCard'
import { RefreshCw, Calendar, CheckCircle2, Loader2 } from 'lucide-react'

export default function TodayPage() {
  const [washerId, setWasherId] = useState<string | null>(null)
  const [todayBookings, setTodayBookings] = useState<any[]>([])
  const [completedBookings, setCompletedBookings] = useState<any[]>([])
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get current user
  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setWasherId(user.id)
      } else {
        setError('Not authenticated')
        setLoading(false)
      }
    }
    getUser()
  }, [])

  // Fetch all data
  const fetchData = useCallback(async () => {
    if (!washerId) return
    try {
      const [today, completed, upcoming] = await Promise.all([
        getTodaysBookings(washerId),
        getCompletedToday(washerId),
        getUpcomingBookings(washerId),
      ])
      setTodayBookings(today)
      setCompletedBookings(completed)
      setUpcomingBookings(upcoming)
      setError(null)
    } catch (err: any) {
      console.error('Failed to fetch bookings:', err)
      setError(err?.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [washerId])

  useEffect(() => {
    if (washerId) {
      fetchData()
    }
  }, [washerId, fetchData])

  function handleRefresh() {
    setRefreshing(true)
    fetchData()
  }

  // Format today's date
  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    )
  }

  if (error === 'Not authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <p className="text-white/60">Not logged in</p>
          <a href="/login" className="text-orange-400 underline">Go to login</a>
        </div>
      </div>
    )
  }

  const hasActiveJobs = todayBookings.length > 0
  const hasCompletedJobs = completedBookings.length > 0
  const hasUpcoming = upcomingBookings.length > 0
  const isEmpty = !hasActiveJobs && !hasCompletedJobs

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-white/5 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Today</h1>
            <p className="text-sm text-white/40">{todayStr}</p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-white/60 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Error state */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Empty state */}
        {isEmpty && !error && (
          <div className="text-center py-16 space-y-3">
            <Calendar className="w-12 h-12 text-white/20 mx-auto" />
            <p className="text-white/40 text-lg">No jobs scheduled for today</p>
            <p className="text-white/25 text-sm">Enjoy your rest! Contact admin if you expected jobs.</p>
          </div>
        )}

        {/* Active jobs */}
        {hasActiveJobs && (
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider">
              Active ({todayBookings.length})
            </h2>
            {todayBookings.map((booking) => (
              <JobCard
                key={booking.id}
                booking={booking}
                washerId={washerId!}
                onStatusChange={fetchData}
              />
            ))}
          </section>
        )}

        {/* Completed jobs */}
        {hasCompletedJobs && (
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-green-400/60 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Done ({completedBookings.length})
            </h2>
            {completedBookings.map((booking) => (
              <JobCard
                key={booking.id}
                booking={booking}
                washerId={washerId!}
                readOnly
              />
            ))}
          </section>
        )}

        {/* Upcoming (tomorrow+) */}
        {hasUpcoming && (
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider">
              Upcoming
            </h2>
            {upcomingBookings.map((booking) => (
              <JobCard
                key={booking.id}
                booking={booking}
                washerId={washerId!}
                readOnly
              />
            ))}
          </section>
        )}
      </div>
    </div>
  )
}
