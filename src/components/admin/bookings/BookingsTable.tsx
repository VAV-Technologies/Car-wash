'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { getBookings, getWashers, type BookingWithDetails } from '@/lib/admin/bookings'
import { SERVICE_TYPES, BOOKING_STATUSES, formatDate } from '@/lib/admin/constants'
import type { BookingStatus, ServiceType } from '@/lib/admin/types'

const PAGE_SIZE = 25

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-gray-500/20', text: 'text-gray-400' },
  confirmed: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  en_route: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  in_progress: { bg: 'bg-green-500/20', text: 'text-green-400' },
  completed: { bg: 'bg-emerald-600/20', text: 'text-emerald-400' },
  cancelled: { bg: 'bg-red-500/20', text: 'text-red-400' },
  no_show: { bg: 'bg-red-500/20', text: 'text-red-400' },
}

function StatusBadge({ status }: { status: string }) {
  const colors = STATUS_COLORS[status] ?? { bg: 'bg-white/10', text: 'text-white/60' }
  const label = BOOKING_STATUSES.find((s) => s.value === status)?.label ?? status.replace(/_/g, ' ')
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}>
      {label}
    </span>
  )
}

function ServiceBadge({ type }: { type: string }) {
  const label = SERVICE_TYPES.find((s) => s.value === type)?.label ?? type.replace(/_/g, ' ')
  return (
    <span className="inline-flex items-center rounded-full bg-orange-500/10 px-2.5 py-0.5 text-xs font-medium text-orange-400">
      {label}
    </span>
  )
}

export default function BookingsTable() {
  const [data, setData] = useState<BookingWithDetails[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [washers, setWashers] = useState<{ id: string; name: string }[]>([])

  const [filters, setFilters] = useState({
    status: '' as BookingStatus | '',
    service_type: '' as ServiceType | '',
    date_from: '',
    date_to: '',
    washer_id: '',
  })

  useEffect(() => {
    getWashers().then(setWashers).catch(() => {})
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getBookings({
        page,
        limit: PAGE_SIZE,
        status: filters.status,
        service_type: filters.service_type,
        date_from: filters.date_from,
        date_to: filters.date_to,
        washer_id: filters.washer_id,
      })
      setData(result.data)
      setTotalCount(result.count)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings')
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

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const inputClass =
    'rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white outline-none focus:border-orange-500/50'
  const selectClass = `${inputClass} appearance-none`

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">All Bookings</h2>
          <p className="text-sm text-white/50 mt-0.5">
            {totalCount} booking{totalCount !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/admin/bookings/new"
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-black hover:bg-orange-400 transition-colors"
        >
          New Booking
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as BookingStatus | '' }))}
          className={selectClass}
        >
          <option value="" className="bg-[#171717]">All statuses</option>
          {BOOKING_STATUSES.map((s) => (
            <option key={s.value} value={s.value} className="bg-[#171717]">{s.label}</option>
          ))}
        </select>

        <select
          value={filters.service_type}
          onChange={(e) => setFilters((f) => ({ ...f, service_type: e.target.value as ServiceType | '' }))}
          className={selectClass}
        >
          <option value="" className="bg-[#171717]">All services</option>
          {SERVICE_TYPES.map((s) => (
            <option key={s.value} value={s.value} className="bg-[#171717]">{s.label}</option>
          ))}
        </select>

        <select
          value={filters.washer_id}
          onChange={(e) => setFilters((f) => ({ ...f, washer_id: e.target.value }))}
          className={selectClass}
        >
          <option value="" className="bg-[#171717]">All washers</option>
          {washers.map((w) => (
            <option key={w.id} value={w.id} className="bg-[#171717]">{w.name}</option>
          ))}
        </select>

        <input
          type="date"
          value={filters.date_from}
          onChange={(e) => setFilters((f) => ({ ...f, date_from: e.target.value }))}
          placeholder="From"
          className={inputClass}
        />
        <input
          type="date"
          value={filters.date_to}
          onChange={(e) => setFilters((f) => ({ ...f, date_to: e.target.value }))}
          placeholder="To"
          className={inputClass}
        />

        {(filters.status || filters.service_type || filters.date_from || filters.date_to || filters.washer_id) && (
          <button
            onClick={() => setFilters({ status: '', service_type: '', date_from: '', date_to: '', washer_id: '' })}
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
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">Time</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">Service</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">Washer</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">Notes</th>
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
                <td colSpan={7} className="px-4 py-12 text-center text-white/40">No bookings found.</td>
              </tr>
            ) : (
              data.map((booking) => (
                <tr key={booking.id} className="border-b border-white/5 even:bg-white/[0.02] hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-white/70">{formatDate(booking.scheduled_date)}</td>
                  <td className="px-4 py-3 text-white/70">{booking.scheduled_time || '—'}</td>
                  <td className="px-4 py-3">
                    {booking.customer ? (
                      <Link
                        href={`/admin/customers/${booking.customer_id}`}
                        className="font-medium text-white hover:text-orange-400 transition-colors"
                      >
                        {booking.customer.name}
                      </Link>
                    ) : (
                      <span className="text-white/40">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3"><ServiceBadge type={booking.service_type} /></td>
                  <td className="px-4 py-3"><StatusBadge status={booking.status} /></td>
                  <td className="px-4 py-3 text-white/70">{booking.washer?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-white/50 max-w-[200px] truncate">{booking.notes || '—'}</td>
                </tr>
              ))
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
