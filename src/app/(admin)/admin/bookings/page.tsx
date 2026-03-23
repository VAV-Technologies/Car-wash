'use client'

import { useState } from 'react'
import BookingsTable from '@/components/admin/bookings/BookingsTable'
import TodaySchedule from '@/components/admin/bookings/TodaySchedule'
import BookingQueue from '@/components/admin/bookings/BookingQueue'

const TABS = [
  { id: 'all', label: 'All Bookings' },
  { id: 'today', label: 'Today' },
  { id: 'queue', label: 'Queue' },
] as const

type TabId = (typeof TABS)[number]['id']

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('all')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Bookings</h1>
        <p className="text-sm text-white/50 mt-1">Manage bookings, schedule, and queue</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-white/10">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-orange-500 text-white'
                : 'border-transparent text-white/40 hover:text-white/70'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'all' && <BookingsTable />}
      {activeTab === 'today' && <TodaySchedule />}
      {activeTab === 'queue' && <BookingQueue />}
    </div>
  )
}
