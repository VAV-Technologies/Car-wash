'use client'

import { useState, useEffect, useCallback } from 'react'
import { getJobs, type JobWithDetails } from '@/lib/admin/jobs'
import { getWashers } from '@/lib/admin/bookings'
import { SERVICE_TYPES, formatDate } from '@/lib/admin/constants'
import AdminSelect from '@/components/admin/AdminSelect'
import AdminDateInput from '@/components/admin/AdminDateInput'

const PAGE_SIZE = 25

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-xs ${star <= rating ? 'text-orange-400' : 'text-white/10'}`}
        >
          ★
        </span>
      ))}
    </div>
  )
}

export default function JobsTable() {
  const [data, setData] = useState<JobWithDetails[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [washers, setWashers] = useState<{ id: string; name: string }[]>([])

  const [filters, setFilters] = useState({
    washer_id: '',
    date_from: '',
    date_to: '',
  })

  useEffect(() => {
    getWashers().then(setWashers).catch(() => {})
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getJobs({
        page,
        limit: PAGE_SIZE,
        washer_id: filters.washer_id,
        date_from: filters.date_from,
        date_to: filters.date_to,
      })
      setData(result.data)
      setTotalCount(result.count)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    setPage(1)
  }, [filters])

  function getDurationMinutes(job: JobWithDetails): string {
    if (!job.started_at || !job.completed_at) return '—'
    const start = new Date(job.started_at).getTime()
    const end = new Date(job.completed_at).getTime()
    const min = Math.round((end - start) / (1000 * 60))
    return min > 0 ? `${min} min` : '—'
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const inputClass =
    'rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white outline-none focus:border-orange-500/50'

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-white">Job Feed</h2>
        <p className="text-sm text-white/50 mt-0.5">
          {totalCount} job{totalCount !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <AdminSelect
          width="w-[170px]"
          value={filters.washer_id}
          onChange={(e) => setFilters((f) => ({ ...f, washer_id: e.target.value }))}
        >
          <option value="">All washers</option>
          {washers.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </AdminSelect>

        <div className="w-[170px]">
          <AdminDateInput
            value={filters.date_from}
            onChange={(e) => setFilters((f) => ({ ...f, date_from: e.target.value }))}
          />
        </div>
        <div className="w-[170px]">
          <AdminDateInput
            value={filters.date_to}
            onChange={(e) => setFilters((f) => ({ ...f, date_to: e.target.value }))}
          />
        </div>

        {(filters.washer_id || filters.date_from || filters.date_to) && (
          <button
            onClick={() => setFilters({ washer_id: '', date_from: '', date_to: '' })}
            className="text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-white/10 bg-[#171717]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">Service</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">Duration</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">Rating</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">Washer</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-white/40">Loading...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-red-400">{error}</td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-white/40">No jobs found.</td>
              </tr>
            ) : (
              data.map((job) => {
                const raw = job as unknown as Record<string, unknown>
                const rating = typeof raw.customer_rating === 'number' ? (raw.customer_rating as number) : 0
                const serviceType = job.booking?.service_type ?? job.service_type ?? ''
                const serviceLabel =
                  SERVICE_TYPES.find((s) => s.value === serviceType)?.label ??
                  (serviceType ? serviceType.replace(/_/g, ' ') : '—')
                const isExpanded = expandedId === job.id

                const statusColors: Record<string, string> = {
                  queued: 'text-gray-400',
                  in_progress: 'text-blue-400',
                  completed: 'text-emerald-400',
                  cancelled: 'text-red-400',
                }

                return (
                  <tr key={job.id} className="group">
                    <td colSpan={7} className="p-0">
                      <div
                        onClick={() => setExpandedId(isExpanded ? null : job.id)}
                        className="grid grid-cols-7 items-center px-4 py-3 border-b border-white/5 even:bg-white/[0.02] hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <span className="text-white/70">
                          {formatDate(job.completed_at ?? job.created_at)}
                        </span>
                        <span className="font-medium text-white">
                          {job.booking?.customer?.name ?? '—'}
                        </span>
                        <span>
                          <span className="inline-flex items-center rounded-full bg-orange-500/10 px-2.5 py-0.5 text-xs font-medium text-orange-400">
                            {serviceLabel}
                          </span>
                        </span>
                        <span className="text-white/70">{getDurationMinutes(job)}</span>
                        <span>{rating > 0 ? <StarRating rating={rating} /> : <span className="text-white/20">—</span>}</span>
                        <span className="text-white/70">{job.washer?.name ?? '—'}</span>
                        <span className={`text-xs font-medium capitalize ${statusColors[job.completed_at ? 'completed' : 'in_progress'] ?? 'text-white/50'}`}>
                          {job.completed_at ? 'Completed' : 'In Progress'}
                        </span>
                      </div>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div className="px-4 py-3 bg-white/[0.02] border-b border-white/10">
                          <div className="grid grid-cols-2 gap-4 text-xs max-w-2xl">
                            {raw.photos_before ? (
                              <div>
                                <p className="text-white/40 mb-1">Photos Before</p>
                                <p className="text-white/70 break-all">{String(raw.photos_before)}</p>
                              </div>
                            ) : null}
                            {raw.photos_after ? (
                              <div>
                                <p className="text-white/40 mb-1">Photos After</p>
                                <p className="text-white/70 break-all">{String(raw.photos_after)}</p>
                              </div>
                            ) : null}
                            {raw.chemicals_used ? (
                              <div>
                                <p className="text-white/40 mb-1">Chemicals Used</p>
                                <p className="text-white/70">{String(raw.chemicals_used)}</p>
                              </div>
                            ) : null}
                            {(raw.washer_notes || job.notes) ? (
                              <div>
                                <p className="text-white/40 mb-1">Washer Notes</p>
                                <p className="text-white/70">{String(raw.washer_notes ?? job.notes)}</p>
                              </div>
                            ) : null}
                            {raw.customer_feedback ? (
                              <div>
                                <p className="text-white/40 mb-1">Customer Feedback</p>
                                <p className="text-white/70">{String(raw.customer_feedback)}</p>
                              </div>
                            ) : null}
                            {raw.upsell_attempted !== undefined ? (
                              <div>
                                <p className="text-white/40 mb-1">Upsell</p>
                                <p className="text-white/70">
                                  {raw.upsell_attempted ? 'Attempted' : 'Not attempted'}
                                  {raw.upsell_converted ? ' — Accepted' : raw.upsell_attempted ? ' — Declined' : ''}
                                </p>
                              </div>
                            ) : null}
                            {job.booking?.customer?.car_model && (
                              <div>
                                <p className="text-white/40 mb-1">Vehicle</p>
                                <p className="text-white/70">{job.booking.customer.car_model}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-white/40 mb-1">Started</p>
                              <p className="text-white/70">{job.started_at ? new Date(job.started_at).toLocaleString('en-GB') : '—'}</p>
                            </div>
                            <div>
                              <p className="text-white/40 mb-1">Completed</p>
                              <p className="text-white/70">{job.completed_at ? new Date(job.completed_at).toLocaleString('en-GB') : '—'}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-white/40">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
