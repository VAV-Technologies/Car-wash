'use client'

import { useState, useEffect } from 'react'
import { Settings, Bot, Key, Check, Loader2, Eye, EyeOff } from 'lucide-react'
import { getConnectors, saveConnector, type Connector } from '@/lib/admin/connectors'

export default function SettingsPage() {
  const [connectors, setConnectors] = useState<Connector[]>([])
  const [loading, setLoading] = useState(true)

  // Claude key form
  const [claudeKey, setClaudeKey] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [error, setError] = useState('')

  const baseModel = connectors.find(c => c.is_base_model)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
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

  async function handleSave() {
    if (!claudeKey.trim()) return
    setSaving(true)
    setError('')
    try {
      await saveConnector({
        id: baseModel?.id,
        service_name: 'Anthropic Claude',
        key_nickname: 'Claude API Key',
        raw_key: claudeKey.trim(),
        description: 'Base model API key. Powers the AI chatbot and connector analysis.',
        is_base_model: true,
      })
      setSaved(true)
      setClaudeKey('')
      setEditing(false)
      await loadData()
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-orange-500/20 p-2">
          <Settings className="h-5 w-5 text-orange-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-sm text-white/40">Manage API keys and system configuration</p>
        </div>
      </div>

      {/* AI Chatbot API Key */}
      <div className="border border-white/10 bg-[#171717] rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
          <Bot className="h-5 w-5 text-orange-500" />
          <div>
            <h2 className="text-base font-semibold text-white">AI Chatbot</h2>
            <p className="text-xs text-white/40">Powers the AI assistant that answers questions about your business</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm text-white/60 block mb-1">Claude API Key</label>
            <p className="text-xs text-white/30 mb-3">
              Get your key from{' '}
              <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 underline">
                console.anthropic.com
              </a>
              . This key powers the floating AI chatbot and connector analysis.
            </p>

            {loading ? (
              <div className="text-white/30 text-sm">Loading...</div>
            ) : baseModel && !editing ? (
              /* Key exists — show masked */
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono text-white/70">
                        {showKey ? baseModel.encrypted_key : '••••••••••••••••••••' + baseModel.encrypted_key.slice(-4)}
                      </span>
                      <button onClick={() => setShowKey(!showKey)} className="text-white/30 hover:text-white/60">
                        {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-white/30 mt-1">Last updated {new Date(baseModel.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-green-400">
                    <div className="h-2 w-2 rounded-full bg-green-400" />
                    <span className="text-xs">Connected — AI Chatbot is active</span>
                  </div>
                </div>

                <button
                  onClick={() => setEditing(true)}
                  className="text-sm text-orange-400 hover:text-orange-300 border border-orange-500/30 px-4 py-2 rounded-lg"
                >
                  Change Key
                </button>
              </div>
            ) : (
              /* No key or editing — show input */
              <div className="space-y-3">
                {!baseModel && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3">
                    <p className="text-xs text-yellow-400">No API key configured. The AI chatbot will not work until you add your Claude key.</p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-3 py-2 rounded">
                    {error}
                  </div>
                )}

                <input
                  type="password"
                  value={claudeKey}
                  onChange={e => setClaudeKey(e.target.value)}
                  placeholder="sk-ant-api03-..."
                  className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-lg px-4 py-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/30"
                />

                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving || !claudeKey.trim()}
                    className="flex items-center gap-2 bg-orange-500 text-black font-medium text-sm px-5 py-2.5 rounded-lg hover:bg-orange-400 disabled:opacity-50 transition-colors"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                    {saving ? 'Saving...' : 'Save Key'}
                  </button>
                  {editing && (
                    <button
                      onClick={() => { setEditing(false); setClaudeKey(''); setError('') }}
                      className="px-4 py-2.5 text-sm text-white/50 hover:text-white border border-white/10 rounded-lg"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {saved && (
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Key saved successfully. AI Chatbot is now active.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info card */}
      <div className="border border-white/10 bg-[#171717] rounded-lg p-6">
        <h3 className="text-sm font-semibold text-white mb-2">How it works</h3>
        <ul className="text-xs text-white/40 space-y-2">
          <li>• The Claude API key powers the floating AI chatbot (orange button, bottom-right on every admin page)</li>
          <li>• Ask it anything: revenue this month, customer count, inventory levels, upsell rates, scenario comparison</li>
          <li>• It queries your Supabase database in real-time to answer questions</li>
          <li>• The same key is used for analyzing connectors in the Automations module</li>
          <li>• Your key is stored encrypted and never exposed client-side</li>
        </ul>
      </div>
    </div>
  )
}
