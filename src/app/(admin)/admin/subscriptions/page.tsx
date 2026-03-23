'use client'

import { useState } from 'react'
import { CreditCard } from 'lucide-react'
import SubscriberList from '@/components/admin/subscriptions/SubscriberList'
import MRRDashboard from '@/components/admin/subscriptions/MRRDashboard'
import ChurnAlerts from '@/components/admin/subscriptions/ChurnAlerts'
import ConversionFunnel from '@/components/admin/subscriptions/ConversionFunnel'

const TABS = [
  { key: 'subscribers', label: 'Subscribers' },
  { key: 'mrr', label: 'MRR' },
  { key: 'churn', label: 'Churn Alerts' },
  { key: 'funnel', label: 'Conversion Funnel' },
] as const

type TabKey = (typeof TABS)[number]['key']

export default function SubscriptionsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('subscribers')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-orange-500/20 p-2">
          <CreditCard className="h-5 w-5 text-orange-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
      </div>

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
      <div>
        {activeTab === 'subscribers' && <SubscriberList />}
        {activeTab === 'mrr' && <MRRDashboard />}
        {activeTab === 'churn' && <ChurnAlerts />}
        {activeTab === 'funnel' && <ConversionFunnel />}
      </div>
    </div>
  )
}
