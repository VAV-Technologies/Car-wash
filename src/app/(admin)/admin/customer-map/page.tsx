'use client'

import dynamic from 'next/dynamic'

// Leaflet requires window/document, so must be loaded client-side only
const CustomerMap = dynamic(() => import('@/components/admin/CustomerMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-20">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
      <span className="ml-3 text-white/50">Loading map...</span>
    </div>
  )
})

export default function CustomerMapPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Customer Map</h1>
        <p className="text-sm text-white/50 mt-1">View all customers across Jabodetabek</p>
      </div>
      <CustomerMap />
    </div>
  )
}
