'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import WADashboard from '@/components/admin/conversations/WADashboard'
import WALiveChats from '@/components/admin/conversations/WALiveChats'
import WASessions from '@/components/admin/conversations/WASessions'
import WAQualityMetrics from '@/components/admin/conversations/WAQualityMetrics'

const TABS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'chats', label: 'Live Chats' },
  { key: 'quality', label: 'Quality' },
  { key: 'sessions', label: 'Sessions' },
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
          <p className="text-sm text-white/50 mt-1">WhatsApp Conversation Monitor</p>
        </div>
        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-white/10 text-white/70">
          Read-only
        </span>
      </div>

      {/* Read-only banner */}
      <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
        <ShieldCheck className="h-5 w-5 text-white/60 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-white/70">
          <p className="font-medium text-white">Shera is disabled.</p>
          <p className="mt-1 text-white/60">
            A human handles every customer conversation. Inbound and outbound WhatsApp messages are still logged here for bookkeeping and quality measurement, but no AI replies, tools, or escalations fire.
          </p>
        </div>
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
      {activeTab === 'chats' && <WALiveChats />}
      {activeTab === 'quality' && <WAQualityMetrics />}
      {activeTab === 'sessions' && <WASessions />}
    </div>
  )
}
