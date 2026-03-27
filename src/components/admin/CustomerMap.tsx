'use client'

import { useEffect, useState, useMemo } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { Search, Users, Filter } from 'lucide-react'
import { supabase } from '@/lib/supabase'

// Import Leaflet CSS only on client side
if (typeof window !== 'undefined') {
  require('leaflet/dist/leaflet.css')
}

const NEIGHBORHOOD_COORDS: Record<string, [number, number]> = {
  pondok_indah: [-6.2750, 106.7840],
  kebayoran_baru: [-6.2440, 106.7960],
  kebayoran_lama: [-6.2500, 106.7800],
  senayan: [-6.2270, 106.8020],
  permata_hijau: [-6.2200, 106.7750],
  simprug: [-6.2550, 106.7900],
  cilandak: [-6.2890, 106.7990],
  tb_simatupang: [-6.3100, 106.8100],
  kemang: [-6.2600, 106.8140],
  cipete: [-6.2700, 106.8000],
  fatmawati: [-6.2930, 106.7970],
  gandaria: [-6.2450, 106.7830],
  pesanggrahan: [-6.2650, 106.7350],
  bintaro: [-6.2800, 106.7200],
  tangerang: [-6.1780, 106.6300],
  bekasi: [-6.2383, 106.9756],
  depok: [-6.4025, 106.7942],
  bogor: [-6.5971, 106.8060],
  other: [-6.2600, 106.8000],
}

const SEGMENT_COLORS: Record<string, string> = {
  vip: '#F59E0B',
  subscriber: '#22C55E',
  mixed: '#A855F7',
  new: '#3B82F6',
  standard_only: '#9CA3AF',
  churned: '#EF4444',
}

const SEGMENT_LABELS: Record<string, string> = {
  vip: 'VIP',
  subscriber: 'Subscriber',
  mixed: 'Mixed',
  new: 'New',
  standard_only: 'Standard',
  churned: 'Churned',
}

interface Customer {
  id: string
  name: string
  phone: string
  car_model: string | null
  plate_number: string | null
  neighborhood: string | null
  address: string | null
  segment: string
}

function hashCode(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function getCustomerCoords(customer: Customer): [number, number] | null {
  if (!customer.neighborhood) return null
  const base = NEIGHBORHOOD_COORDS[customer.neighborhood]
  if (!base) return null
  const hash = hashCode(customer.id)
  const lat = base[0] + (hash % 100) * 0.0003 - 0.015
  const lng = base[1] + ((hash >> 8) % 100) * 0.0003 - 0.015
  return [lat, lng]
}

function formatNeighborhood(key: string): string {
  return key
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export default function CustomerMap() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [segmentFilter, setSegmentFilter] = useState('all')

  useEffect(() => {
    async function fetchCustomers() {
      setLoading(true)
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, phone, car_model, plate_number, neighborhood, address, segment')
        .order('name')

      if (!error && data) {
        setCustomers(data)
      }
      setLoading(false)
    }
    fetchCustomers()
  }, [])

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.toLowerCase().includes(search.toLowerCase())
      const matchesSegment = segmentFilter === 'all' || c.segment === segmentFilter
      return matchesSearch && matchesSegment
    })
  }, [customers, search, segmentFilter])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        <span className="ml-3 text-white/50">Loading customers...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          background: #171717 !important;
          color: white !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 12px !important;
        }
        .leaflet-popup-tip {
          background: #171717 !important;
        }
        .leaflet-popup-close-button {
          color: rgba(255, 255, 255, 0.5) !important;
        }
      `}</style>

      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-[#171717] py-2 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30"
          />
        </div>

        {/* Count badge */}
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#171717] px-4 py-2">
          <Users className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-medium text-white">{filtered.length} customers</span>
        </div>

        {/* Segment filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <select
            value={segmentFilter}
            onChange={(e) => setSegmentFilter(e.target.value)}
            className="appearance-none rounded-lg border border-white/10 bg-[#171717] py-2 pl-10 pr-8 text-sm text-white outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30"
          >
            <option value="all">All Segments</option>
            <option value="vip">VIP</option>
            <option value="subscriber">Subscriber</option>
            <option value="mixed">Mixed</option>
            <option value="new">New</option>
            <option value="standard_only">Standard</option>
            <option value="churned">Churned</option>
          </select>
        </div>
      </div>

      {/* Map container */}
      <div className="relative rounded-xl border border-white/10 overflow-hidden" style={{ minHeight: '600px' }}>
        <MapContainer
          center={[-6.26, 106.80]}
          zoom={11}
          style={{ height: '100%', width: '100%', minHeight: '600px', borderRadius: '12px' }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {filtered.map((customer) => {
            const coords = getCustomerCoords(customer)
            if (!coords) return null

            return (
              <CircleMarker
                key={customer.id}
                center={coords}
                radius={8}
                fillColor={SEGMENT_COLORS[customer.segment] || '#9CA3AF'}
                fillOpacity={0.8}
                color="white"
                weight={1}
              >
                <Popup>
                  <div className="space-y-1.5 min-w-[180px]">
                    <p className="font-bold text-white text-sm">{customer.name}</p>
                    <p className="text-white/60 text-xs">{customer.phone}</p>
                    {(customer.car_model || customer.plate_number) && (
                      <p className="text-white/60 text-xs">
                        {[customer.car_model, customer.plate_number].filter(Boolean).join(' - ')}
                      </p>
                    )}
                    {customer.neighborhood && (
                      <p className="text-white/50 text-xs">{formatNeighborhood(customer.neighborhood)}</p>
                    )}
                    {customer.address && (
                      <p className="text-white/40 text-xs">{customer.address}</p>
                    )}
                    <span
                      className="inline-block mt-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{
                        backgroundColor: `${SEGMENT_COLORS[customer.segment] || '#9CA3AF'}20`,
                        color: SEGMENT_COLORS[customer.segment] || '#9CA3AF',
                      }}
                    >
                      {SEGMENT_LABELS[customer.segment] || customer.segment}
                    </span>
                  </div>
                </Popup>
              </CircleMarker>
            )
          })}
        </MapContainer>

        {/* Legend overlay */}
        <div className="absolute bottom-4 right-4 z-[1000] rounded-xl bg-black/70 backdrop-blur-sm border border-white/10 px-4 py-3">
          <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Segments</p>
          <div className="space-y-1.5">
            {Object.entries(SEGMENT_LABELS).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: SEGMENT_COLORS[key] }}
                />
                <span className="text-xs text-white/70">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
