'use client'

import { useState } from 'react'
import CustomersTable from '@/components/admin/customers/CustomersTable'
import ReferralDashboard from '@/components/admin/customers/ReferralDashboard'
import SegmentView from '@/components/admin/customers/SegmentView'

const TABS = [
  { key: 'list', label: 'All Customers' },
  { key: 'segments', label: 'Segments' },
  { key: 'referrals', label: 'Referrals' },
] as const

type TabKey = (typeof TABS)[number]['key']

export default function CustomersPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('list')

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-white/10">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'text-orange-400 border-orange-500'
                : 'text-white/50 border-transparent hover:text-white/70'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'list' && <CustomersTable />}
      {activeTab === 'segments' && <SegmentView />}
      {activeTab === 'referrals' && <ReferralDashboard />}
    </div>
  )
}
