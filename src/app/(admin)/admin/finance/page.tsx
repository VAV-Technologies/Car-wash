'use client'

import { useState } from 'react'
import PaymentQueue from '@/components/admin/finance/PaymentQueue'
import TransactionsTable from '@/components/admin/finance/TransactionsTable'
import MonthlyPL from '@/components/admin/finance/MonthlyPL'
import RevenueBreakdown from '@/components/admin/finance/RevenueBreakdown'
import CashFlowProjection from '@/components/admin/finance/CashFlowProjection'
import BreakEvenMonitor from '@/components/admin/finance/BreakEvenMonitor'
import PaymentAgingReport from '@/components/admin/finance/PaymentAgingReport'

const TABS = [
  { key: 'pending', label: 'Pending Payments' },
  { key: 'transactions', label: 'All Transactions' },
  { key: 'pl', label: 'Monthly P&L' },
  { key: 'revenue', label: 'Revenue Breakdown' },
  { key: 'cashflow', label: 'Cash Flow' },
  { key: 'breakeven', label: 'Break-Even' },
  { key: 'aging', label: 'Payment Aging' },
] as const

type TabKey = (typeof TABS)[number]['key']

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('pending')

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Finance</h1>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 border-b border-white/10 mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
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
      {activeTab === 'pending' && <PaymentQueue />}
      {activeTab === 'transactions' && <TransactionsTable />}
      {activeTab === 'pl' && <MonthlyPL />}
      {activeTab === 'revenue' && <RevenueBreakdown />}
      {activeTab === 'cashflow' && <CashFlowProjection />}
      {activeTab === 'breakeven' && <BreakEvenMonitor />}
      {activeTab === 'aging' && <PaymentAgingReport />}
    </div>
  )
}
