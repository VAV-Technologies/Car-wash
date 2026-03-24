'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  MapPin, Phone, Navigation, Play, Truck, Clock,
  Star, User, Crown, Loader2
} from 'lucide-react'
import { SERVICE_TYPES, formatCurrency } from '@/lib/wash/constants'
import { updateBookingStatus, createJobRecord } from '@/lib/wash/jobs'

interface Booking {
  id: string
  scheduled_time: string
  scheduled_date: string
  status: string
  service_type: string
  address?: string
  customers: {
    id: string
    name: string
    phone: string
    car_model: string
    plate_number: string
    neighborhood: string
    segment: string
  }
}

interface JobCardProps {
  booking: Booking
  washerId: string
  onStatusChange?: () => void
  readOnly?: boolean
}

export default function JobCard({ booking, washerId, onStatusChange, readOnly }: JobCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const customer = booking.customers
  const serviceInfo = SERVICE_TYPES[booking.service_type] || {
    label: booking.service_type,
    bonus: 0,
    duration: 0,
  }

  // Format scheduled time
  function formatTime(time: string) {
    if (!time) return ''
    const [h, m] = time.split(':')
    const hour = parseInt(h, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${hour12}:${m} ${ampm}`
  }

  function formatDuration(minutes: number) {
    if (minutes < 60) return `${minutes} min`
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }

  function statusBadge(status: string) {
    const styles: Record<string, string> = {
      confirmed: 'bg-blue-500/20 text-blue-400',
      en_route: 'bg-yellow-500/20 text-yellow-400',
      in_progress: 'bg-orange-500/20 text-orange-400',
      completed: 'bg-green-500/20 text-green-400',
    }
    const labels: Record<string, string> = {
      confirmed: 'Confirmed',
      en_route: 'On The Way',
      in_progress: 'In Progress',
      completed: 'Completed',
    }
    return (
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status] || 'bg-white/10 text-white/60'}`}>
        {labels[status] || status}
      </span>
    )
  }

  function segmentBadge(segment: string) {
    if (segment === 'vip') {
      return (
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 flex items-center gap-1">
          <Crown className="w-3 h-3" /> VIP
        </span>
      )
    }
    if (segment === 'subscriber') {
      return (
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 flex items-center gap-1">
          <Star className="w-3 h-3" /> Subscriber
        </span>
      )
    }
    if (segment === 'new') {
      return (
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
          <User className="w-3 h-3" /> New
        </span>
      )
    }
    return null
  }

  async function handleOnMyWay() {
    setLoading('en_route')
    try {
      await updateBookingStatus(booking.id, 'en_route')
      onStatusChange?.()
    } catch (err) {
      console.error('Failed to update status:', err)
    } finally {
      setLoading(null)
    }
  }

  async function handleStartJob() {
    setLoading('start')
    try {
      // 1. Update booking status to in_progress
      await updateBookingStatus(booking.id, 'in_progress')

      // 2. Create job record
      const job = await createJobRecord({
        booking_id: booking.id,
        washer_id: washerId,
        started_at: new Date().toISOString(),
        service_type: booking.service_type,
      })

      // 3. Navigate to active job screen
      router.push(`/wash/job/${job.id}`)
    } catch (err) {
      console.error('Failed to start job:', err)
    } finally {
      setLoading(null)
    }
  }

  function handleNavigate() {
    const address = booking.address || customer.neighborhood
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    window.open(url, '_blank')
  }

  const isCompleted = booking.status === 'completed'

  return (
    <div className={`bg-[#171717] border rounded-xl p-4 space-y-3 ${
      isCompleted ? 'border-green-500/20 opacity-70' : 'border-white/10'
    }`}>
      {/* Header: time + status */}
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold text-white">
          {formatTime(booking.scheduled_time)}
        </span>
        {statusBadge(booking.status)}
      </div>

      {/* Customer name + segment */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-medium">{customer.name}</h3>
          {segmentBadge(customer.segment)}
        </div>
        <p className="text-sm text-white/50">
          {customer.car_model}  &middot;  {customer.plate_number}
        </p>
      </div>

      {/* Service info */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-orange-400 font-medium">{serviceInfo.label}</span>
        <span className="text-xs text-white/40">
          <Clock className="inline w-3 h-3 mr-1" />
          {formatDuration(serviceInfo.duration)} &middot; Bonus: {formatCurrency(serviceInfo.bonus)}
        </span>
      </div>

      {/* Location */}
      {(booking.address || customer.neighborhood) && (
        <div className="flex items-start gap-2 text-sm text-white/50">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-white/30" />
          <div>
            {booking.address && <p className="text-white/60">{booking.address}</p>}
            <p className="text-white/40">{customer.neighborhood}</p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!readOnly && !isCompleted && (
        <div className="flex gap-2 pt-1">
          {/* Navigate */}
          <button
            type="button"
            onClick={handleNavigate}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg py-2.5 px-3 text-xs font-medium transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" />
            Navigate
          </button>

          {/* Call */}
          <a
            href={`tel:${customer.phone}`}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg py-2.5 px-3 text-xs font-medium transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            Call
          </a>

          {/* On My Way (only when confirmed) */}
          {booking.status === 'confirmed' && (
            <button
              type="button"
              onClick={handleOnMyWay}
              disabled={loading === 'en_route'}
              className="flex items-center gap-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 rounded-lg py-2.5 px-3 text-xs font-medium transition-colors disabled:opacity-50"
            >
              {loading === 'en_route' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Truck className="w-3.5 h-3.5" />
              )}
              On My Way
            </button>
          )}

          {/* Start Job (when confirmed or en_route) */}
          {(booking.status === 'confirmed' || booking.status === 'en_route') && (
            <button
              type="button"
              onClick={handleStartJob}
              disabled={loading === 'start'}
              className="flex-1 flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-2.5 px-3 text-xs font-medium transition-colors disabled:opacity-50"
            >
              {loading === 'start' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
              Start Job
            </button>
          )}

          {/* In-progress: resume */}
          {booking.status === 'in_progress' && (
            <button
              type="button"
              onClick={() => {
                // Need to find the job ID for this booking — navigate via booking
                router.push(`/wash/job/booking/${booking.id}`)
              }}
              className="flex-1 flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-2.5 px-3 text-xs font-medium transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              Resume Job
            </button>
          )}
        </div>
      )}

      {/* Completed badge */}
      {isCompleted && (
        <div className="flex items-center gap-2 text-green-400 text-sm">
          <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          Done
        </div>
      )}
    </div>
  )
}
