'use client'

import { useState } from 'react'
import { UserCog } from 'lucide-react'
import EmployeeList from '@/components/admin/team/EmployeeList'
import PayslipCalculator from '@/components/admin/team/PayslipCalculator'
import PerformanceDashboard from '@/components/admin/team/PerformanceDashboard'

const TABS = [
  { key: 'employees', label: 'Employees' },
  { key: 'payslip', label: 'Payslip' },
  { key: 'performance', label: 'Performance' },
] as const

type TabKey = (typeof TABS)[number]['key']

export default function TeamPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('employees')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-orange-500/20 p-2">
          <UserCog className="h-5 w-5 text-orange-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Team</h1>
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
      {activeTab === 'employees' && <EmployeeList />}
      {activeTab === 'payslip' && <PayslipCalculator />}
      {activeTab === 'performance' && <PerformanceDashboard />}
    </div>
  )
}
