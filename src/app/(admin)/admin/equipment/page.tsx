'use client'

import { useState } from 'react'
import { Cog } from 'lucide-react'
import EquipmentRegistry from '@/components/admin/equipment/EquipmentRegistry'
import MaintenanceCalendar from '@/components/admin/equipment/MaintenanceCalendar'
import PowerStationTracker from '@/components/admin/equipment/PowerStationTracker'

const TABS = [
  { key: 'equipment', label: 'Equipment' },
  { key: 'maintenance', label: 'Maintenance' },
  { key: 'power_station', label: 'Power Station' },
] as const

type TabKey = (typeof TABS)[number]['key']

export default function EquipmentPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('equipment')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-orange-500/20 p-2">
          <Cog className="h-5 w-5 text-orange-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Equipment</h1>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-white/10">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'text-orange-500 border-orange-500'
                : 'text-white/40 border-transparent hover:text-white/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'equipment' && <EquipmentRegistry />}
      {activeTab === 'maintenance' && <MaintenanceCalendar />}
      {activeTab === 'power_station' && <PowerStationTracker />}
    </div>
  )
}
