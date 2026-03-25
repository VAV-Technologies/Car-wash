'use client'

import { useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { SERVICE_TYPES, formatCurrency, formatWhatsAppLink } from '@/lib/wash/constants'
import { getSOPChecklist } from '@/lib/wash/sop'
import {
  MapPin, Clock, Camera, Crown, Star, User,
  Loader2, MessageCircle, Phone, Navigation, Car
} from 'lucide-react'

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

interface SOPStep {
  id: string
  step_number: number
  step_title: string
  step_description: string
  estimated_minutes: number | null
  photo_required: boolean
}

interface JobDetailSheetProps {
  booking: Booking | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function JobDetailSheet({ booking, open, onOpenChange }: JobDetailSheetProps) {
  const [sopSteps, setSopSteps] = useState<SOPStep[]>([])
  const [loadingSop, setLoadingSop] = useState(false)

  useEffect(() => {
    if (!open || !booking) {
      setSopSteps([])
      return
    }

    let cancelled = false
    async function fetchSOP() {
      setLoadingSop(true)
      try {
        const steps = await getSOPChecklist(booking!.service_type)
        if (!cancelled) setSopSteps(steps)
      } catch {
        if (!cancelled) setSopSteps([])
      } finally {
        if (!cancelled) setLoadingSop(false)
      }
    }
    fetchSOP()
    return () => { cancelled = true }
  }, [open, booking])

  if (!booking) return null

  const customer = booking.customers
  const serviceInfo = SERVICE_TYPES[booking.service_type] || {
    label: booking.service_type,
    bonus: 0,
    duration: 0,
  }

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

  const statusStyles: Record<string, string> = {
    confirmed: 'bg-blue-500/20 text-blue-400',
    en_route: 'bg-yellow-500/20 text-yellow-400',
    in_progress: 'bg-orange-500/20 text-orange-400',
    completed: 'bg-green-500/20 text-green-400',
  }
  const statusLabels: Record<string, string> = {
    confirmed: 'Confirmed',
    en_route: 'On The Way',
    in_progress: 'In Progress',
    completed: 'Completed',
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="bg-[#171717] border-t border-white/10 rounded-t-2xl max-h-[85vh] overflow-y-auto p-0 [&>button]:text-white/60 [&>button]:hover:text-white"
      >
        <div className="p-5 space-y-5">
          {/* Header */}
          <SheetHeader className="text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[booking.status] || 'bg-white/10 text-white/60'}`}>
                {statusLabels[booking.status] || booking.status}
              </span>
              <span className="text-sm text-white/40">{formatTime(booking.scheduled_time)}</span>
            </div>
            <SheetTitle className="text-white text-lg">{serviceInfo.label}</SheetTitle>
          </SheetHeader>

          {/* Customer */}
          <div className="bg-[#0A0A0A] rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-medium">{customer.name}</h3>
              {customer.segment === 'vip' && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 flex items-center gap-1">
                  <Crown className="w-3 h-3" /> VIP
                </span>
              )}
              {customer.segment === 'subscriber' && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 flex items-center gap-1">
                  <Star className="w-3 h-3" /> Subscriber
                </span>
              )}
              {customer.segment === 'new' && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                  <User className="w-3 h-3" /> New
                </span>
              )}
            </div>

            {/* Car */}
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Car className="w-4 h-4 text-white/30" />
              <span>{customer.car_model}</span>
              <span className="text-white/30">&middot;</span>
              <span className="text-white/50">{customer.plate_number}</span>
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

            {/* Quick actions */}
            <div className="flex gap-2 pt-1">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.address || customer.neighborhood)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg py-2 px-3 text-xs font-medium transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                Navigate
              </a>
              <a
                href={formatWhatsAppLink(customer.phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-green-500/10 hover:bg-green-500/15 border border-green-500/20 text-green-400 rounded-lg py-2 px-3 text-xs font-medium transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp
              </a>
              <a
                href={`tel:${customer.phone}`}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg py-2 px-3 text-xs font-medium transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                Call
              </a>
            </div>
          </div>

          {/* Service info */}
          <div className="flex items-center justify-between bg-[#0A0A0A] rounded-xl p-4">
            <div className="space-y-1">
              <p className="text-xs text-white/40 uppercase tracking-wide">Duration</p>
              <p className="text-sm text-white font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-white/40" />
                {formatDuration(serviceInfo.duration)}
              </p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-xs text-white/40 uppercase tracking-wide">Bonus</p>
              <p className="text-sm text-orange-400 font-medium">{formatCurrency(serviceInfo.bonus)}</p>
            </div>
          </div>

          {/* SOP Preview */}
          <div>
            <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-3">
              SOP Checklist
            </h3>
            {loadingSop ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
              </div>
            ) : sopSteps.length === 0 ? (
              <p className="text-sm text-white/30 py-4 text-center">No SOP steps configured for this service.</p>
            ) : (
              <div className="space-y-2">
                {sopSteps.map((step) => (
                  <div
                    key={step.id}
                    className="flex items-start gap-3 bg-[#0A0A0A] rounded-lg p-3 border border-white/5"
                  >
                    <span className="w-6 h-6 rounded-full bg-orange-500/10 text-orange-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {step.step_number}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium">{step.step_title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        {step.estimated_minutes && (
                          <span className="text-xs text-white/30 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {step.estimated_minutes}m
                          </span>
                        )}
                        {step.photo_required && (
                          <span className="text-xs text-orange-400/60 flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            Photo required
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
