'use client'

import Link from 'next/link'
import BookingForm from '@/components/admin/bookings/BookingForm'

export default function NewBookingPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-white/40 mb-2">
          <Link href="/admin/bookings" className="hover:text-white/70 transition-colors">
            Bookings
          </Link>
          <span>/</span>
          <span className="text-white/70">New Booking</span>
        </div>
        <h1 className="text-2xl font-bold text-white">New Booking</h1>
        <p className="text-sm text-white/50 mt-1">Create a new service booking</p>
      </div>

      <div className="max-w-2xl">
        <BookingForm />
      </div>
    </div>
  )
}
