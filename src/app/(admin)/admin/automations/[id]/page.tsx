'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  getAutomationById,
  updateAutomation,
  deleteAutomation,
} from '@/lib/admin/automations'
import type { Automation, WorkflowDefinition } from '@/lib/admin/automations'
import WorkflowCanvas from '@/components/admin/automations/WorkflowCanvas'
import RunHistoryTable from '@/components/admin/automations/RunHistoryTable'
import AutomationSettings from '@/components/admin/automations/AutomationSettings'
import ApiKeysManager from '@/components/admin/automations/ApiKeysManager'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const TABS = [
  { id: 'workflow', label: 'Workflow' },
  { id: 'runs', label: 'Run History' },
  { id: 'settings', label: 'Settings' },
  { id: 'keys', label: 'API Keys' },
] as const

type TabId = (typeof TABS)[number]['id']

export default function AutomationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const automationId = params.id as string

  const [automation, setAutomation] = useState<Automation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('workflow')

  const fetchAutomation = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAutomationById(automationId)
      setAutomation(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load automation')
    } finally {
      setLoading(false)
    }
  }, [automationId])

  useEffect(() => {
    fetchAutomation()
  }, [fetchAutomation])

  async function handleSaveSettings(data: {
    name: string
    description: string | null
    status: 'active' | 'paused' | 'draft'
    trigger_type: 'webhook' | 'schedule' | 'manual'
    schedule_cron: string | null
  }) {
    try {
      const updated = await updateAutomation(automationId, data)
      setAutomation(updated)
    } catch (err) {
      console.error('Save failed:', err)
    }
  }

  async function handleDelete() {
    try {
      await deleteAutomation(automationId)
      router.push('/admin/automations')
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  async function handleRegenerate(prompt: string) {
    try {
      const res = await fetch('/api/automations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Generation failed (${res.status})`)
      }

      const { workflow } = (await res.json()) as { workflow: WorkflowDefinition }

      const updated = await updateAutomation(automationId, { workflow_json: workflow })
      setAutomation(updated)
    } catch (err) {
      console.error('Regenerate failed:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
      </div>
    )
  }

  if (error || !automation) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/automations"
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Library
        </Link>
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {error ?? 'Automation not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/automations"
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{automation.name}</h1>
            {automation.description && (
              <p className="text-sm text-white/50 mt-1">{automation.description}</p>
            )}
          </div>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
            automation.status === 'active'
              ? 'bg-green-500/20 text-green-400'
              : automation.status === 'paused'
              ? 'bg-yellow-500/20 text-yellow-400'
              : 'bg-gray-500/20 text-gray-400'
          }`}
        >
          {automation.status.charAt(0).toUpperCase() + automation.status.slice(1)}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-white/10">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-orange-500 text-white'
                : 'border-transparent text-white/40 hover:text-white/70'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'workflow' && (
        <WorkflowCanvas
          workflow={automation.workflow_json}
          onRegenerate={handleRegenerate}
        />
      )}
      {activeTab === 'runs' && <RunHistoryTable automationId={automationId} />}
      {activeTab === 'settings' && (
        <AutomationSettings
          automation={automation}
          onSave={handleSaveSettings}
          onDelete={handleDelete}
        />
      )}
      {activeTab === 'keys' && <ApiKeysManager automationId={automationId} />}
    </div>
  )
}
