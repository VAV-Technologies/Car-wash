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

      {/* API Access */}
      <div className="border border-white/10 bg-[#171717] rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
          <Key className="h-5 w-5 text-orange-500" />
          <div>
            <h2 className="text-base font-semibold text-white">API Access</h2>
            <p className="text-xs text-white/40">Connect external chatbots and agents to your admin panel</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm text-white/60 block mb-1">Base URL</label>
            <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 font-mono text-sm text-orange-400">
              https://car-wash-six-chi.vercel.app/api/admin
            </div>
          </div>

          <div>
            <label className="text-sm text-white/60 block mb-1">API Key</label>
            <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 font-mono text-sm text-white/50">
              Authorization: Bearer {'<'}CASTUDIO_API_KEY{'>'}
            </div>
            <p className="text-xs text-white/30 mt-1">Use the same key from your .env.local / Vercel environment variables</p>
          </div>

          <div>
            <label className="text-sm text-white/60 block mb-2">Endpoints</label>
            <div className="space-y-2 text-xs">
              {[
                { module: 'Customers', path: '/customers', methods: 'GET POST PUT DELETE', actions: 'list, get, follow-ups, conversations, create, add-conversation, update, delete' },
                { module: 'Bookings', path: '/bookings', methods: 'GET POST PUT DELETE', actions: 'list, get, today, queue, by-date, washers, search-customers, create, update, delete' },
                { module: 'Jobs', path: '/jobs', methods: 'GET', actions: 'list, get, stats, recent' },
                { module: 'Subscriptions', path: '/subscriptions', methods: 'GET POST PUT DELETE', actions: 'list, get, stats, churn-risk, renewals, create, update, delete' },
                { module: 'Finance', path: '/finance', methods: 'GET POST PUT DELETE', actions: 'list, pending, monthly-pl, revenue-breakdown, expenses, cash-position, aging, create, confirm-payment, fail-payment, delete' },
                { module: 'Invoicing', path: '/invoicing', methods: 'GET', actions: 'list, get, monthly-summary, receipt' },
                { module: 'Conversations', path: '/conversations', methods: 'GET POST PUT DELETE', actions: 'list, by-customer, follow-ups, stats, create, complete-follow-up, delete' },
                { module: 'Inventory', path: '/inventory', methods: 'GET PUT DELETE', actions: 'list, low-stock, critical, default-chemicals, update, restock, deduct, delete' },
                { module: 'Equipment', path: '/equipment', methods: 'GET PUT DELETE', actions: 'list, get, maintenance-due, update, log-maintenance, increment-cycles, delete' },
                { module: 'Team', path: '/team', methods: 'GET POST PUT DELETE', actions: 'list, get, stats, payslip, create, update, delete' },
                { module: 'Automations', path: '/automations', methods: 'GET POST PUT DELETE', actions: 'list, get, runs, run, keys, create, add-key, update, toggle, delete, delete-key' },
                { module: 'Dashboard', path: '/dashboard', methods: 'GET', actions: 'stats, targets, month-number' },
                { module: 'Analytics', path: '/analytics', methods: 'GET', actions: 'service-mix, acquisition, retention, concentration, seasonal, upsell, scorecard, all-scorecards' },
                { module: 'AI Chat', path: '/chat', methods: 'POST', actions: 'Send message, get AI response with database access' },
              ].map((ep) => (
                <div key={ep.path} className="border border-white/10 rounded-lg p-3 bg-black/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-white">{ep.module}</span>
                    <span className="font-mono text-orange-400/70">/api/admin{ep.path}</span>
                  </div>
                  <div className="flex gap-1 mb-1">
                    {ep.methods.split(' ').map(m => (
                      <span key={m} className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        m === 'GET' ? 'bg-green-500/20 text-green-400' :
                        m === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                        m === 'PUT' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>{m}</span>
                    ))}
                  </div>
                  <p className="text-white/30">Actions: {ep.actions}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="text-xs font-semibold text-white mb-2">Example: Create a customer</p>
            <pre className="text-[11px] text-white/40 overflow-x-auto whitespace-pre">{`curl -X POST /api/admin/customers \\
  -H "Authorization: Bearer <KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"John","phone":"+628123456"}'`}</pre>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="text-xs font-semibold text-white mb-2">Example: Ask the AI chatbot</p>
            <pre className="text-[11px] text-white/40 overflow-x-auto whitespace-pre">{`curl -X POST /api/admin/chat \\
  -H "Authorization: Bearer <KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{"message":"How many services this month?"}'`}</pre>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="text-xs font-semibold text-white mb-2">Query pattern</p>
            <pre className="text-[11px] text-white/40 overflow-x-auto whitespace-pre">{`GET /api/admin/{module}?action={action}&id={id}&page=1&limit=20
POST /api/admin/{module}?action={action}  (body = JSON)
PUT /api/admin/{module}?action={action}&id={id}  (body = JSON)
DELETE /api/admin/{module}?id={id}`}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
