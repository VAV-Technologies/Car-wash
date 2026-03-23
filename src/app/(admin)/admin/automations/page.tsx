'use client'

import { useState } from 'react'
import AutomationGrid from '@/components/admin/automations/AutomationGrid'
import CreateAutomationModal from '@/components/admin/automations/CreateAutomationModal'

export default function AutomationsPage() {
  const [showCreate, setShowCreate] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Automation Library</h1>
          <p className="text-sm text-white/50 mt-1">Build and manage AI-powered workflows</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-black hover:bg-orange-400 transition-colors"
        >
          + Create New
        </button>
      </div>

      <AutomationGrid key={refreshKey} />

      {showCreate && (
        <CreateAutomationModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false)
            setRefreshKey((k) => k + 1)
          }}
        />
      )}
    </div>
  )
}
