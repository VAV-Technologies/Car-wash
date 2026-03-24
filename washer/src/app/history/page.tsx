'use client'

import { useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { SERVICE_TYPES, formatCurrency, formatDate } from '@/lib/constants'
import { ChevronLeft, ChevronRight, Star, ImageIcon, Loader2 } from 'lucide-react'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface JobPhoto {
  id: string
  photo_url: string
  photo_type: string
  caption: string | null
}

interface Job {
  id: string
  completed_at: string
  started_at: string
  actual_duration_min: number | null
  rating: number | null
  washer_notes: string | null
  bookings: {
    service_type: string
    customers: {
      name: string
    }
  }
  job_photos: JobPhoto[]
}

const PAGE_SIZE = 10

export default function HistoryPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)

  // Month filter
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const monthLabel = new Date(year, month - 1).toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  })

  const fetchJobs = useCallback(
    async (pageNum: number, append = false) => {
      if (pageNum === 0) setLoading(true)
      else setLoadingMore(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        setLoadingMore(false)
        return
      }

      const startDate = new Date(year, month - 1, 1).toISOString()
      const endDate = new Date(year, month, 1).toISOString()

      const { data, error } = await supabase
        .from('jobs')
        .select(
          'id, completed_at, started_at, actual_duration_min, rating, washer_notes, bookings(service_type, customers(name)), job_photos(id, photo_url, photo_type, caption)'
        )
        .eq('washer_id', user.id)
        .gte('completed_at', startDate)
        .lt('completed_at', endDate)
        .order('completed_at', { ascending: false })
        .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1)

      if (error) {
        console.error('Error fetching history:', error)
      }

      const fetched = (data as unknown as Job[]) || []
      setHasMore(fetched.length === PAGE_SIZE)

      if (append) {
        setJobs((prev) => [...prev, ...fetched])
      } else {
        setJobs(fetched)
      }

      setLoading(false)
      setLoadingMore(false)
    },
    [year, month]
  )

  useEffect(() => {
    setPage(0)
    setJobs([])
    setHasMore(true)
    fetchJobs(0)
  }, [fetchJobs])

  function loadMore() {
    const nextPage = page + 1
    setPage(nextPage)
    fetchJobs(nextPage, true)
  }

  function prevMonth() {
    if (month === 1) {
      setYear(year - 1)
      setMonth(12)
    } else {
      setMonth(month - 1)
    }
  }

  function nextMonth() {
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1
    if (isCurrentMonth) return
    if (month === 12) {
      setYear(year + 1)
      setMonth(1)
    } else {
      setMonth(month + 1)
    }
  }

  function formatDuration(mins: number | null): string {
    if (!mins) return '-'
    const h = Math.floor(mins / 60)
    const m = mins % 60
    if (h === 0) return `${m}m`
    return `${h}h ${m}m`
  }

  function renderStars(rating: number | null) {
    if (rating == null) return <span className="text-white/40 text-xs">Awaiting rating</span>
    return (
      <span className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={14}
            className={i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}
          />
        ))}
      </span>
    )
  }

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-4 pt-6 pb-20">
      <h1 className="text-xl font-bold mb-4">History</h1>

      {/* Month filter */}
      <div className="flex items-center justify-between mb-6 bg-[#171717] rounded-xl px-4 py-3">
        <button onClick={prevMonth} className="p-1 text-white/60 hover:text-white">
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-medium">{monthLabel}</span>
        <button
          onClick={nextMonth}
          className={`p-1 ${isCurrentMonth ? 'text-white/20 cursor-not-allowed' : 'text-white/60 hover:text-white'}`}
          disabled={isCurrentMonth}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-orange-500" size={28} />
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 text-white/40">
          <p className="text-lg">No completed jobs yet</p>
          <p className="text-sm mt-1">Jobs you complete will appear here.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {jobs.map((job) => {
              const booking = Array.isArray(job.bookings) ? job.bookings[0] : job.bookings
              const serviceType = booking?.service_type || 'standard_wash'
              const customerName =
                (Array.isArray(booking?.customers)
                  ? booking.customers[0]?.name
                  : booking?.customers?.name) || 'Customer'
              const bonus = SERVICE_TYPES[serviceType]?.bonus || 0
              const isExpanded = expandedId === job.id

              return (
                <div key={job.id} className="bg-[#171717] rounded-xl border border-white/10 overflow-hidden">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : job.id)}
                    className="w-full text-left p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-white/50 text-xs">{formatDate(job.completed_at)}</p>
                        <p className="font-medium mt-1">
                          {customerName}
                          <span className="text-white/40 mx-2">&middot;</span>
                          <span className="text-orange-400">
                            {SERVICE_TYPES[serviceType]?.label || serviceType}
                          </span>
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-sm text-white/60">
                          <span>Duration: {formatDuration(job.actual_duration_min)}</span>
                          <span>&middot;</span>
                          <span>Bonus: {formatCurrency(bonus)}</span>
                        </div>
                        <div className="mt-1.5">{renderStars(job.rating)}</div>
                      </div>
                      <ChevronRight
                        size={16}
                        className={`text-white/30 mt-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-3">
                      {/* Photos */}
                      {job.job_photos && job.job_photos.length > 0 ? (
                        <div>
                          <p className="text-xs text-white/50 mb-2 flex items-center gap-1">
                            <ImageIcon size={12} />
                            Photos ({job.job_photos.length})
                          </p>
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {job.job_photos.map((photo) => (
                              <div
                                key={photo.id}
                                className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-white/5"
                              >
                                <img
                                  src={photo.photo_url}
                                  alt={photo.caption || photo.photo_type}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-white/30">No photos uploaded</p>
                      )}

                      {/* Notes */}
                      {job.washer_notes && (
                        <div>
                          <p className="text-xs text-white/50 mb-1">Notes</p>
                          <p className="text-sm text-white/70">{job.washer_notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-2.5 bg-[#171717] border border-white/10 rounded-xl text-sm text-white/70 hover:text-white disabled:opacity-50"
              >
                {loadingMore ? (
                  <Loader2 className="animate-spin inline mr-2" size={14} />
                ) : null}
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
