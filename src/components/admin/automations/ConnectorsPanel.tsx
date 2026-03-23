'use client'

import { useState, useEffect } from 'react'
import { X, Key, Plug, Check, Loader2, Trash2, Bot, ChevronDown, ChevronUp } from 'lucide-react'
import {
  getConnectors,
  saveConnector,
  deleteConnector,
  type Connector,
} from '@/lib/admin/connectors'
import { formatDate } from '@/lib/admin/constants'

interface Props {
  onClose: () => void
}

export default function ConnectorsPanel({ onClose }: Props) {
  const [connectors, setConnectors] = useState<Connector[]>([])
  const [loading, setLoading] = useState(true)

  // Base model state
  const [claudeKey, setClaudeKey] = useState('')
  const [savingClaude, setSavingClaude] = useState(false)
  const [claudeSaved, setClaudeSaved] = useState(false)
  const [editingClaude, setEditingClaude] = useState(false)

  // Add connector state
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState({ service_name: '', key_nickname: '', raw_key: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')

  // Expanded analysis
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const baseModel = connectors.find(c => c.is_base_model)
  const otherConnectors = connectors.filter(c => !c.is_base_model)

  useEffect(() => {
    loadConnectors()
  }, [])

  async function loadConnectors() {
    setLoading(true)
    try {
      const data = await getConnectors()
      setConnectors(data)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveClaudeKey() {
    if (!claudeKey.trim()) return
    setSavingClaude(true)
    try {
      await saveConnector({
        id: baseModel?.id,
        service_name: 'Anthropic Claude',
        key_nickname: 'Claude API Key',
        raw_key: claudeKey.trim(),
        description: 'Base model API key for Claude. Powers the AI engine for analyzing connectors and generating workflows.',
        is_base_model: true,
      })
      setClaudeSaved(true)
      setClaudeKey('')
      setEditingClaude(false)
      await loadConnectors()
      setTimeout(() => setClaudeSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSavingClaude(false)
    }
  }

  async function handleAddConnector() {
    if (!form.service_name.trim() || !form.raw_key.trim()) {
      setError('Service name and API key are required')
      return
    }
    setError('')
    setSaving(true)

    try {
      const connector = await saveConnector({
        service_name: form.service_name.trim(),
        key_nickname: form.key_nickname.trim() || form.service_name.trim(),
        raw_key: form.raw_key.trim(),
        description: form.description.trim() || undefined,
      })

      // Analyze if description provided and base model key exists
      if (form.description.trim() && baseModel) {
        setAnalyzing(true)
        try {
          await fetch('/api/connectors/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              connectorId: connector.id,
              description: form.description.trim(),
              serviceName: form.service_name.trim(),
            }),
          })
        } catch {
          // Analysis failed but connector was saved
        } finally {
          setAnalyzing(false)
        }
      }

      setForm({ service_name: '', key_nickname: '', raw_key: '', description: '' })
      setShowAddForm(false)
      await loadConnectors()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save connector')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this connector?')) return
    try {
      await deleteConnector(id)
      await loadConnectors()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-[520px] max-w-full bg-[#111111] border-l border-white/10 z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Plug className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-bold text-white">Connectors</h2>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Base Model (Claude Key) */}
          <div className="border border-orange-500/30 bg-orange-500/5 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="h-4 w-4 text-orange-500" />
              <h3 className="text-sm font-semibold text-orange-400">Claude API Key</h3>
              <span className="text-xs text-white/30">Powers the AI engine</span>
            </div>

            {baseModel && !editingClaude ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70 font-mono">{baseModel.encrypted_key}</p>
                  <p className="text-xs text-white/30 mt-1">Saved {formatDate(baseModel.updated_at)}</p>
                </div>
                <button
                  onClick={() => setEditingClaude(true)}
                  className="text-xs text-orange-400 hover:text-orange-300 border border-orange-500/30 px-3 py-1 rounded"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="password"
                  value={claudeKey}
                  onChange={e => setClaudeKey(e.target.value)}
                  placeholder="sk-ant-api03-..."
                  className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-lg px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveClaudeKey}
                    disabled={savingClaude || !claudeKey.trim()}
                    className="flex-1 bg-orange-500 text-black font-medium text-sm py-2 rounded-lg hover:bg-orange-400 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {savingClaude ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                    {savingClaude ? 'Saving...' : 'Save Key'}
                  </button>
                  {editingClaude && (
                    <button onClick={() => { setEditingClaude(false); setClaudeKey('') }} className="px-4 py-2 text-sm text-white/50 hover:text-white border border-white/10 rounded-lg">
                      Cancel
                    </button>
                  )}
                </div>
                {claudeSaved && (
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Claude key saved successfully
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Connectors List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Your Connectors</h3>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="text-xs text-orange-400 hover:text-orange-300"
              >
                {showAddForm ? 'Cancel' : '+ Add Connector'}
              </button>
            </div>

            {loading ? (
              <p className="text-white/30 text-sm">Loading...</p>
            ) : otherConnectors.length === 0 && !showAddForm ? (
              <div className="border border-white/10 rounded-lg p-6 text-center">
                <Plug className="h-8 w-8 text-white/10 mx-auto mb-2" />
                <p className="text-white/40 text-sm">No connectors yet</p>
                <p className="text-white/20 text-xs mt-1">Add API keys for services you want to use in automations</p>
              </div>
            ) : (
              <div className="space-y-3">
                {otherConnectors.map(conn => (
                  <div key={conn.id} className="border border-white/10 bg-[#171717] rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{conn.service_name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${conn.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                            {conn.status}
                          </span>
                        </div>
                        <p className="text-xs text-white/40 mt-0.5">{conn.key_nickname} · {conn.encrypted_key}</p>
                        {conn.ai_analysis && (
                          <div className="mt-2">
                            <button
                              onClick={() => setExpandedId(expandedId === conn.id ? null : conn.id)}
                              className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1"
                            >
                              {expandedId === conn.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                              {conn.ai_analysis.capabilities?.length ?? 0} capabilities
                            </button>
                            {expandedId === conn.id && (
                              <div className="mt-2 bg-black/30 rounded p-3 text-xs space-y-2">
                                <p className="text-white/60">{conn.ai_analysis.scope}</p>
                                <div className="flex flex-wrap gap-1">
                                  {conn.ai_analysis.capabilities?.map((cap, i) => (
                                    <span key={i} className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white/50">{cap}</span>
                                  ))}
                                </div>
                                {conn.ai_analysis.functions?.length > 0 && (
                                  <div>
                                    <p className="text-white/30 mb-1">Functions:</p>
                                    {conn.ai_analysis.functions.slice(0, 5).map((fn, i) => (
                                      <p key={i} className="text-white/50">· {fn.name}: {fn.description}</p>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <button onClick={() => handleDelete(conn.id)} className="text-white/20 hover:text-red-400 p-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Add Connector Form */}
          {showAddForm && (
            <div className="border border-white/10 bg-[#171717] rounded-lg p-4 space-y-3">
              <h4 className="text-sm font-semibold text-white">Add Connector</h4>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-3 py-2 rounded">
                  {error}
                </div>
              )}

              <div>
                <label className="text-xs text-white/50 mb-1 block">Service Name</label>
                <input
                  type="text"
                  value={form.service_name}
                  onChange={e => setForm({ ...form, service_name: e.target.value })}
                  placeholder="e.g. OpenAI, Instantly, Slack"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-lg px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-white/50 mb-1 block">Key Nickname</label>
                <input
                  type="text"
                  value={form.key_nickname}
                  onChange={e => setForm({ ...form, key_nickname: e.target.value })}
                  placeholder="e.g. Production Key, My GPT Key"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-lg px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-white/50 mb-1 block">API Key</label>
                <input
                  type="password"
                  value={form.raw_key}
                  onChange={e => setForm({ ...form, raw_key: e.target.value })}
                  placeholder="sk-..."
                  className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-lg px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-white/50 mb-1 block">Description / Prompt <span className="text-white/20">(optional — helps AI understand this connector)</span></label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Explain what this API key is for, what it can do, link to docs...&#10;&#10;Example: This is my Instantly API key for cold email campaigns. Docs: https://developer.instantly.ai. It can manage campaigns, add leads, track analytics."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-lg px-3 py-2 text-sm focus:border-orange-500 focus:outline-none resize-none"
                />
              </div>

              <button
                onClick={handleAddConnector}
                disabled={saving || analyzing}
                className="w-full bg-orange-500 text-black font-medium text-sm py-2.5 rounded-lg hover:bg-orange-400 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                ) : analyzing ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing with AI...</>
                ) : (
                  'Save & Analyze'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
