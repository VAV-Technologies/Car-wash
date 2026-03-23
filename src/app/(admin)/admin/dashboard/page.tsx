'use client'

import DashboardStats from '@/components/admin/dashboard/DashboardStats'
import ScenarioComparison from '@/components/admin/dashboard/ScenarioComparison'

export default function DashboardPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

      <div className="space-y-6">
        <DashboardStats />
        <ScenarioComparison />
      </div>
    </div>
  )
}
