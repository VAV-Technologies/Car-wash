'use client'

import { useState, useEffect, useCallback } from 'react'
import { getBookingQueue, updateBooking, getWashers, type BookingWithDetails } from '@/lib/admin/bookings'
import { SERVICE_TYPES, formatDate, daysSince } from '@/lib/admin/constants'
import type { BookingStatus } from '@/lib/admin/types'
import AdminSelect from '@/components/admin/AdminSelect'

export default function BookingQueue() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [washers, setWashers] = useState<{ id: string; name: string }[]>([])
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [queueData, washerData] = await Promise.all([getBookingQueue(), getWashers()])
      setBookings(queueData)
      setWashers(washerData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load queue')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleConfirm(bookingId: string) {
    try {
      await updateBooking(bookingId, { status: 'confirmed' as BookingStatus })
      setBookings((prev) => prev.filter((b) => b.id !== bookingId))
    } catch {
      fetchData()
    }
  }

  async function handleAssignWasher(bookingId: string, washerId: string) {
    if (!washerId) return
    try {
      await updateBooking(bookingId, { status: 'confirmed' as BookingStatus })
      // Assign washer via direct supabase call (employee_id may not be on the Booking type)
      const { supabase } = await import('@/lib/supabase')
      await supabase
        .from('bookings')
        .update({ employee_id: washerId, updated_at: new Date().toISOString() })
        .eq('id', bookingId)
      setBookings((prev) => prev.filter((b) => b.id !== bookingId))
    } catch {
      fetchData()
    }
  }

  async function handleCancel(bookingId: string) {
    try {
      await updateBooking(bookingId, {
        status: 'cancelled' as BookingStatus,
        notes: cancelReason.trim() || null,
      })
      setBookings((prev) => prev.filter((b) => b.id !== bookingId))
      setCancellingId(null)
      setCancelReason('')
    } catch {
      fetchData()
    }
  }

  if (loading) {
    return <div className="py-12 text-center text-white/40">Loading...</div>
  }

  if (error) {
    return <div className="py-12 text-center text-red-400">{error}</div>
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">Booking Queue</h2>
        <p className="text-sm text-white/50 mt-0.5">
          {bookings.length} pending booking{bookings.length !== 1 ? 's' : ''} awaiting confirmation
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-[#171717] px-8 py-12 text-center">
          <p className="text-white/40">No pending bookings in the queue.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-white/10 bg-[#171717]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">Service</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">Requested Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">Days Waiting</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-white/50">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const serviceLabel =
                  SERVICE_TYPES.find((s) => s.value === booking.service_type)?.label ??
                  booking.service_type.replace(/_/g, ' ')
                const daysWaiting = daysSince(booking.created_at)

                return (
                  <tr key={booking.id} className="border-b border-white/5 even:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{booking.customer?.name ?? '—'}</p>
                      <p className="text-xs text-white/40">{booking.customer?.phone ?? ''}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-orange-500/10 px-2.5 py-0.5 text-xs font-medium text-orange-400">
                        {serviceLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      {formatDate(booking.scheduled_date)}
                      {booking.scheduled_time && (
                        <span className="text-white/40 ml-2">{booking.scheduled_time}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-sm font-medium ${
                          daysWaiting !== null && daysWaiting > 2 ? 'text-red-400' : 'text-white/70'
                        }`}
                      >
                        {daysWaiting !== null ? `${daysWaiting}d` : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleConfirm(booking.id)}
                          className="rounded-lg bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-400 hover:bg-blue-500/30 transition-colors"
                        >
                          Confirm
                        </button>

                        <AdminSelect
                          defaultValue=""
                          onChange={(e) => handleAssignWasher(booking.id, e.target.value)}
                        >
                          <option value="">Assign Washer</option>
                          {washers.map((w) => (
                            <option key={w.id} value={w.id}>{w.name}</option>
                          ))}
                        </AdminSelect>

                        {cancellingId === booking.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={cancelReason}
                              onChange={(e) => setCancelReason(e.target.value)}
                              placeholder="Reason..."
                              className="w-28 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none"
                            />
                            <button
                              onClick={() => handleCancel(booking.id)}
                              className="rounded-lg bg-red-500/20 px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-500/30 transition-colors"
                            >
                              OK
                            </button>
                            <button
                              onClick={() => { setCancellingId(null); setCancelReason('') }}
                              className="text-xs text-white/40 hover:text-white/70"
                            >
                              X
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setCancellingId(booking.id)}
                            className="rounded-lg bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
