'use client'

import { useState } from 'react'
import ConversationLog from '@/components/admin/conversations/ConversationLog'
import FollowUpTracker from '@/components/admin/conversations/FollowUpTracker'
import Templates from '@/components/admin/conversations/Templates'

const TABS = [
  { key: 'all', label: 'All Conversations' },
  { key: 'followups', label: 'Follow-Ups' },
  { key: 'templates', label: 'Templates' },
] as const

type TabKey = (typeof TABS)[number]['key']

export default function ConversationsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('all')

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Conversations</h1>

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
      {activeTab === 'all' && <ConversationLog />}
      {activeTab === 'followups' && <FollowUpTracker />}
      {activeTab === 'templates' && <Templates />}
    </div>
  )
}
