'use client'

import { useState } from 'react'
import { Plug } from 'lucide-react'
import AutomationGrid from '@/components/admin/automations/AutomationGrid'
import CreateAutomationModal from '@/components/admin/automations/CreateAutomationModal'
import ConnectorsPanel from '@/components/admin/automations/ConnectorsPanel'

export default function AutomationsPage() {
  const [showCreate, setShowCreate] = useState(false)
  const [showConnectors, setShowConnectors] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Automation Library</h1>
          <p className="text-sm text-white/50 mt-1">Build and manage AI-powered workflows</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowConnectors(true)}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Plug className="h-4 w-4" />
            Connectors
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-black hover:bg-orange-400 transition-colors"
          >
            + Create New
          </button>
        </div>
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

      {showConnectors && (
        <ConnectorsPanel onClose={() => setShowConnectors(false)} />
      )}
    </div>
  )
}
