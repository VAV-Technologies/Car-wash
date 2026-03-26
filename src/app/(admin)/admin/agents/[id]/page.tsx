'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getAgentById, updateAgent, deleteAgent } from '@/lib/admin/agents'
import type { Agent } from '@/lib/admin/agents'
import { AgentCodeViewer } from '@/components/admin/agents/AgentCodeViewer'
import { AgentConnectors } from '@/components/admin/agents/AgentConnectors'
import { RunHistoryTable } from '@/components/admin/agents/RunHistoryTable'
import { AgentSettings } from '@/components/admin/agents/AgentSettings'

const TABS = [
  { id: 'code', label: 'Agent Code' },
  { id: 'connectors', label: 'Connectors' },
  { id: 'runs', label: 'Run History' },
  { id: 'settings', label: 'Settings' },
] as const

type TabId = (typeof TABS)[number]['id']

export default function AgentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const agentId = params.id as string

  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('code')

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await getAgentById(agentId)
        setAgent(data)
      } catch (err: any) {
        setError(err.message || 'Failed to load agent')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [agentId])

  async function handleSaveSettings(data: Partial<Agent>) {
    try {
      const updated = await updateAgent(agentId, data)
      setAgent(updated)
    } catch (err: any) {
      throw err
    }
  }

  async function handleDelete() {
    try {
      await deleteAgent(agentId)
      router.push('/admin/agents')
    } catch (err: any) {
      throw err
    }
  }

  async function handleUpdateConnectors(ids: string[]) {
    try {
      const updated = await updateAgent(agentId, { connector_ids: ids })
      setAgent(updated)
    } catch (err: any) {
      throw err
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
          <p className="text-white/50 text-sm">Loading agent...</p>
        </div>
      </div>
    )
  }

  if (error || !agent) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <span className="text-red-400 text-xl">!</span>
          </div>
          <p className="text-white/70">{error || 'Agent not found'}</p>
          <Link
            href="/admin/agents"
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Back to Agents
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/admin/agents"
        className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Agents
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white">{agent.name}</h1>
          {agent.description && (
            <p className="text-white/50 text-sm max-w-2xl">{agent.description}</p>
          )}
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 ${
            agent.status === 'active'
              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
              : agent.status === 'paused'
              ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
              : 'bg-white/5 text-white/40 border border-white/10'
          }`}
        >
          {agent.status}
        </span>
      </div>

      {/* Tab Bar */}
      <div className="border-b border-white/10">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'code' && (
          <AgentCodeViewer
            content={agent.content}
            fileType={agent.file_type}
            version={agent.version}
            updatedAt={agent.updated_at}
          />
        )}

        {activeTab === 'connectors' && (
          <AgentConnectors
            agentId={agentId}
            connectorIds={agent.connector_ids || []}
            onUpdate={(ids) => handleUpdateConnectors(ids)}
          />
        )}

        {activeTab === 'runs' && (
          <RunHistoryTable automationId={agentId} />
        )}

        {activeTab === 'settings' && (
          <AgentSettings
            agent={agent}
            onSave={handleSaveSettings}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  )
}
