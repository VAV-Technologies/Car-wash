'use client'

import { useState, useEffect } from 'react'
import { X, Plug, Check, Loader2, Trash2, Cloud, ChevronDown, ChevronUp } from 'lucide-react'
import {
  getConnectors,
  saveConnector,
  deleteConnector,
  type Connector,
} from '@/lib/admin/connectors'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/admin/constants'

interface Props {
  onClose: () => void
}

export default function ConnectorsPanel({ onClose }: Props) {
  const [connectors, setConnectors] = useState<Connector[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalAgents: 0, activeAgents: 0, totalRuns: 0 })

  const [azureKey, setAzureKey] = useState('')
  const [azureUrl, setAzureUrl] = useState('')
  const [savingAzure, setSavingAzure] = useState(false)
  const [azureSaved, setAzureSaved] = useState(false)
  const [editingAzure, setEditingAzure] = useState(false)

  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState({ service_name: '', key_nickname: '', raw_key: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const baseModel = connectors.find(c => c.is_base_model)
  const azureConnector = connectors.find(c => c.service_name === 'Microsoft Azure' && !c.is_base_model)
  const otherConnectors = connectors.filter(c => !c.is_base_model && c.service_name !== 'Microsoft Azure')

  useEffect(() => {
    loadConnectors()
    loadUsageStats()
  }, [])

  async function loadConnectors() {
    setLoading(true)
    try { setConnectors(await getConnectors()) } catch {}
    finally { setLoading(false) }
  }

  async function loadUsageStats() {
    try {
      const [agents, runs] = await Promise.all([
        supabase.from('automations').select('status', { count: 'exact' }),
        supabase.from('automation_runs').select('id', { count: 'exact', head: true }),
      ])
      const total = agents.count ?? 0
      const active = (agents.data ?? []).filter((a: { status: string }) => a.status === 'active').length
      setStats({ totalAgents: total, activeAgents: active, totalRuns: runs.count ?? 0 })
    } catch {}
  }

  async function handleSaveAzureKey() {
    if (!azureKey.trim()) return
    setSavingAzure(true)
    try {
      const keyValue = azureUrl.trim() ? `${azureKey.trim()}|||${azureUrl.trim()}` : azureKey.trim()
      await saveConnector({
        id: azureConnector?.id,
        service_name: 'Microsoft Azure',
        key_nickname: 'Azure Functions Host Key',
        raw_key: keyValue,
        description: `Azure Functions compute engine for agent workflows. ${azureUrl.trim() ? `URL: ${azureUrl.trim()}` : ''}`,
      })
      setAzureSaved(true)
      setAzureKey(''); setAzureUrl(''); setEditingAzure(false)
      await loadConnectors()
      setTimeout(() => setAzureSaved(false), 3000)
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to save') }
    finally { setSavingAzure(false) }
  }

  async function handleAddConnector() {
    if (!form.service_name.trim() || !form.raw_key.trim()) { setError('Service name and API key are required'); return }
    setError(''); setSaving(true)
    try {
      const connector = await saveConnector({
        service_name: form.service_name.trim(),
        key_nickname: form.key_nickname.trim() || form.service_name.trim(),
        raw_key: form.raw_key.trim(),
        description: form.description.trim() || undefined,
      })
      if (form.description.trim() && baseModel) {
        setAnalyzing(true)
        try { await fetch('/api/connectors/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ connectorId: connector.id, description: form.description.trim(), serviceName: form.service_name.trim() }) }) } catch {}
        finally { setAnalyzing(false) }
      }
      setForm({ service_name: '', key_nickname: '', raw_key: '', description: '' })
      setShowAddForm(false)
      await loadConnectors()
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to save connector') }
    finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this connector?')) return
    try { await deleteConnector(id); await loadConnectors() }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed to delete') }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-[540px] max-w-full bg-[#111111] border-l border-white/10 z-50 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Plug className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-bold text-white">Connectors</h2>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Azure Compute */}
          <div className="border border-blue-500/30 bg-blue-500/5 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Cloud className="h-4 w-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-blue-400">Microsoft Azure</h3>
            </div>
            <p className="text-[11px] text-white/30 mb-3">Compute engine — runs agent workflows via Azure Functions (serverless)</p>

            {azureConnector && !editingAzure ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-white/70 font-mono">{azureConnector.encrypted_key}</p>
                    <p className="text-xs text-white/30 mt-0.5">Updated {formatDate(azureConnector.updated_at)}</p>
                  </div>
                  <button onClick={() => setEditingAzure(true)} className="text-xs text-blue-400 hover:text-blue-300 border border-blue-500/30 px-3 py-1 rounded">Change</button>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-blue-500/20">
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">{stats.totalAgents}</p>
                    <p className="text-[10px] text-white/30">Agents</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">{stats.totalRuns}</p>
                    <p className="text-[10px] text-white/30">Executions</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-green-400" />
                      <p className="text-sm font-medium text-green-400">Connected</p>
                    </div>
                    <p className="text-[10px] text-white/30">Status</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Function App URL</label>
                  <input type="text" value={azureUrl} onChange={e => setAzureUrl(e.target.value)} placeholder="https://your-app.azurewebsites.net" className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Host Key (x-functions-key)</label>
                  <input type="password" value={azureKey} onChange={e => setAzureKey(e.target.value)} placeholder="Azure Functions host key..." className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSaveAzureKey} disabled={savingAzure || !azureKey.trim()} className="flex-1 bg-blue-500 text-white font-medium text-sm py-2 rounded-lg hover:bg-blue-400 disabled:opacity-50 flex items-center justify-center gap-2">
                    {savingAzure ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Cloud className="h-4 w-4" /> Save Azure Key</>}
                  </button>
                  {editingAzure && <button onClick={() => { setEditingAzure(false); setAzureKey(''); setAzureUrl('') }} className="px-4 py-2 text-sm text-white/50 hover:text-white border border-white/10 rounded-lg">Cancel</button>}
                </div>
                {azureSaved && <p className="text-xs text-green-400 flex items-center gap-1"><Check className="h-3 w-3" /> Azure key saved</p>}
              </div>
            )}
          </div>

          {/* Service Connectors */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Service Connectors</h3>
              <button onClick={() => setShowAddForm(!showAddForm)} className="text-xs text-orange-400 hover:text-orange-300">
                {showAddForm ? 'Cancel' : '+ Add Connector'}
              </button>
            </div>

            {loading ? (
              <p className="text-white/30 text-sm">Loading...</p>
            ) : otherConnectors.length === 0 && !showAddForm ? (
              <div className="border border-white/10 rounded-lg p-6 text-center">
                <Plug className="h-8 w-8 text-white/10 mx-auto mb-2" />
                <p className="text-white/40 text-sm">No service connectors yet</p>
                <p className="text-white/20 text-xs mt-1">Add API keys for GPT, Instantly, Slack, etc.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {otherConnectors.map(conn => (
                  <div key={conn.id} className="border border-white/10 bg-[#171717] rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{conn.service_name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${conn.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>{conn.status}</span>
                        </div>
                        <p className="text-xs text-white/40 mt-0.5">{conn.key_nickname} · {conn.encrypted_key}</p>
                        {conn.ai_analysis && (
                          <div className="mt-2">
                            <button onClick={() => setExpandedId(expandedId === conn.id ? null : conn.id)} className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1">
                              {expandedId === conn.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                              {conn.ai_analysis.capabilities?.length ?? 0} capabilities
                            </button>
                            {expandedId === conn.id && (
                              <div className="mt-2 bg-black/30 rounded p-3 text-xs space-y-2">
                                <p className="text-white/60">{conn.ai_analysis.scope}</p>
                                <div className="flex flex-wrap gap-1">
                                  {conn.ai_analysis.capabilities?.map((cap: string, i: number) => (
                                    <span key={i} className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white/50">{cap}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <button onClick={() => handleDelete(conn.id)} className="text-white/20 hover:text-red-400 p-1"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Connector Form */}
          {showAddForm && (
            <div className="border border-white/10 bg-[#171717] rounded-lg p-4 space-y-3">
              <h4 className="text-sm font-semibold text-white">Add Connector</h4>
              {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-3 py-2 rounded">{error}</div>}
              <div>
                <label className="text-xs text-white/50 mb-1 block">Service Name</label>
                <input type="text" value={form.service_name} onChange={e => setForm({ ...form, service_name: e.target.value })} placeholder="e.g. OpenAI, Instantly, Slack" className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-lg px-3 py-2 text-sm focus:border-orange-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Key Nickname</label>
                <input type="text" value={form.key_nickname} onChange={e => setForm({ ...form, key_nickname: e.target.value })} placeholder="e.g. Production Key" className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-lg px-3 py-2 text-sm focus:border-orange-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">API Key</label>
                <input type="password" value={form.raw_key} onChange={e => setForm({ ...form, raw_key: e.target.value })} placeholder="sk-..." className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-lg px-3 py-2 text-sm focus:border-orange-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Description / Prompt <span className="text-white/20">(helps AI understand capabilities)</span></label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What this API key is for, capabilities, link to docs..." rows={4} className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-lg px-3 py-2 text-sm focus:border-orange-500 focus:outline-none resize-none" />
              </div>
              <button onClick={handleAddConnector} disabled={saving || analyzing} className="w-full bg-orange-500 text-black font-medium text-sm py-2.5 rounded-lg hover:bg-orange-400 disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : analyzing ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing with AI...</> : 'Save & Analyze'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
