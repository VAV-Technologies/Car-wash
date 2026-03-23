'use client'

import { useState } from 'react'
import InvoiceList from '@/components/admin/invoicing/InvoiceList'
import MonthlySummary from '@/components/admin/invoicing/MonthlySummary'

const TABS = [
  { key: 'invoices', label: 'Invoices' },
  { key: 'summary', label: 'Monthly Summary' },
] as const

type TabKey = (typeof TABS)[number]['key']

export default function InvoicingPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('invoices')

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Invoicing</h1>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 border-b border-white/10 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'text-orange-500 border-orange-500'
                : 'text-white/50 border-transparent hover:text-white hover:border-white/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'invoices' && <InvoiceList />}
      {activeTab === 'summary' && <MonthlySummary />}
    </div>
  )
}
