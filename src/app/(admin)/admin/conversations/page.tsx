'use client'

import { useState } from 'react'
import ConversationLog from '@/components/admin/conversations/ConversationLog'
import WAEscalations from '@/components/admin/conversations/WAEscalations'
import WALiveChats from '@/components/admin/conversations/WALiveChats'

const TABS = [
  { key: 'live', label: 'Live Chats' },
  { key: 'attention', label: 'Needs Attention' },
  { key: 'conversations', label: 'Log' },
] as const

type TabKey = (typeof TABS)[number]['key']

export default function ConversationsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('live')

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

      {activeTab === 'live' && <WALiveChats />}
      {activeTab === 'attention' && <WAEscalations />}
      {activeTab === 'conversations' && <ConversationLog />}
    </div>
  )
}
