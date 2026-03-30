'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import WADashboard from '@/components/admin/conversations/WADashboard'
import WASessions from '@/components/admin/conversations/WASessions'
import WAEventMonitor from '@/components/admin/conversations/WAEventMonitor'
import WASettings from '@/components/admin/conversations/WASettings'
import WARules from '@/components/admin/conversations/WARules'
import WAServiceImages from '@/components/admin/conversations/WAServiceImages'

const TABS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'rules', label: 'Rules' },
  { key: 'images', label: 'Service Images' },
  { key: 'sessions', label: 'Sessions' },
  { key: 'events', label: 'Event Monitor' },
  { key: 'settings', label: 'Settings' },
] as const

type TabKey = (typeof TABS)[number]['key']

export default function SheraAgentPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/agents"
          className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Shera</h1>
          <p className="text-sm text-white/50 mt-1">WhatsApp AI Agent</p>
        </div>
        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-green-500/20 text-green-400">
          Active
        </span>
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
                : 'text-white/50 border-transparent hover:text-white hover:border-white/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && <WADashboard />}
      {activeTab === 'rules' && <WARules />}
      {activeTab === 'images' && <WAServiceImages />}
      {activeTab === 'sessions' && <WASessions />}
      {activeTab === 'events' && <WAEventMonitor />}
      {activeTab === 'settings' && <WASettings />}
    </div>
  )
}
