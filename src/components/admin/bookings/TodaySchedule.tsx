'use client'

import { useState, useEffect, useCallback } from 'react'
import { getTodaysBookings, updateBooking, type BookingWithDetails } from '@/lib/admin/bookings'
import { SERVICE_TYPES, BOOKING_STATUSES, formatDate } from '@/lib/admin/constants'
import type { BookingStatus } from '@/lib/admin/types'
import AdminSelect from '@/components/admin/AdminSelect'

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

export default function TodaySchedule() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getTodaysBookings()
      setBookings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load schedule')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleStatusChange(bookingId: string, newStatus: BookingStatus) {
    try {
      await updateBooking(bookingId, { status: newStatus })
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      )
    } catch {
      // Refetch on error
      fetchData()
    }
  }

  function getWhatsAppLink(phone: string | undefined): string {
    if (!phone) return '#'
    const cleaned = phone.replace(/\D/g, '')
    const intl = cleaned.startsWith('0') ? '62' + cleaned.slice(1) : cleaned
    return `https://wa.me/${intl}`
  }

  const today = formatDate(new Date().toISOString().split('T')[0])

  const activeCount = bookings.filter(
    (b) => !['completed', 'cancelled', 'no_show'].includes(b.status)
  ).length
  const completedCount = bookings.filter((b) => b.status === 'completed').length

  if (loading) {
    return <div className="py-12 text-center text-white/40">Loading...</div>
  }

  if (error) {
    return <div className="py-12 text-center text-red-400">{error}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Today&apos;s Schedule</h2>
          <p className="text-sm text-white/50 mt-0.5">{today}</p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-[#171717] px-8 py-12 text-center">
          <p className="text-white/40">No bookings scheduled for today.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => {
            const serviceLabel =
              SERVICE_TYPES.find((s) => s.value === booking.service_type)?.label ??
              booking.service_type.replace(/_/g, ' ')

            return (
              <div
                key={booking.id}
                className="rounded-lg border border-white/10 bg-[#171717] p-4 hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono font-medium text-orange-400">
                        {booking.scheduled_time || '—'}
                      </span>
                      <StatusBadge status={booking.status} />
                    </div>

                    <p className="text-sm font-medium text-white">
                      {booking.customer?.name ?? 'Unknown customer'}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-white/50">
                      {booking.customer?.car_model && (
                        <span>{booking.customer.car_model}{booking.customer.plate_number ? ` (${booking.customer.plate_number})` : ''}</span>
                      )}
                      <span className="text-orange-400/70">{serviceLabel}</span>
                      {booking.washer?.name && (
                        <span>Washer: {booking.washer.name}</span>
                      )}
                    </div>

                    {booking.notes && (
                      <p className="text-xs text-white/30 mt-1 truncate">{booking.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Quick status change */}
                    <AdminSelect
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking.id, e.target.value as BookingStatus)}
                    >
                      {BOOKING_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </AdminSelect>

                    {/* WhatsApp link */}
                    {booking.customer?.phone && (
                      <a
                        href={getWhatsAppLink(booking.customer.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-green-400 hover:bg-green-500/10 transition-colors"
                      >
                        WA
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Summary Footer */}
      <div className="flex items-center gap-6 rounded-lg border border-white/10 bg-[#171717] px-4 py-3">
        <div>
          <p className="text-xs text-white/40">Total Today</p>
          <p className="text-sm font-semibold text-white">{bookings.length}</p>
        </div>
        <div>
          <p className="text-xs text-white/40">Active</p>
          <p className="text-sm font-semibold text-orange-400">{activeCount}</p>
        </div>
        <div>
          <p className="text-xs text-white/40">Completed</p>
          <p className="text-sm font-semibold text-emerald-400">{completedCount}</p>
        </div>
      </div>
    </div>
  )
}
