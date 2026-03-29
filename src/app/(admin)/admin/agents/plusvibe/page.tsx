'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Copy, Check, RefreshCw, Mail, Phone, Users, ArrowRightLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const TABS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'leads', label: 'Leads' },
  { key: 'settings', label: 'Settings' },
] as const

type TabKey = (typeof TABS)[number]['key']

interface EmailLead {
  id: string
  name: string
  email: string
  company: string | null
  campaign_name: string | null
  current_status: string
  reply_count: number
  last_classification: string | null
  classification_history: Record<string, unknown>[] | null
  phone_number: string | null
  handed_off_to_whatsapp: boolean
  created_at: string
}

interface Stats {
  total: number
  active: number
  handedOff: number
  phonesCaptured: number
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  active: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  closed: { bg: 'bg-red-500/20', text: 'text-red-400' },
  ooo: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  handed_off_to_whatsapp: { bg: 'bg-green-500/20', text: 'text-green-400' },
}

function getStatusStyle(status: string) {
  return STATUS_COLORS[status] || { bg: 'bg-white/10', text: 'text-white/50' }
}

// ─── Dashboard Tab ───────────────────────────────────────────────
function DashboardTab() {
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, handedOff: 0, phonesCaptured: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      setLoading(true)
      const { data, error } = await supabase.from('email_leads').select('id, current_status, handed_off_to_whatsapp, phone_number')
      if (error) {
        console.error('Error fetching stats:', error)
        setLoading(false)
        return
      }
      const leads = data || []
      setStats({
        total: leads.length,
        active: leads.filter((l) => l.current_status === 'active').length,
        handedOff: leads.filter((l) => l.handed_off_to_whatsapp === true).length,
        phonesCaptured: leads.filter((l) => l.phone_number !== null).length,
      })
      setLoading(false)
    }
    fetchStats()
  }, [])

  const cards = [
    { label: 'Total Leads', value: stats.total, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Active Leads', value: stats.active, icon: Mail, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Phones Captured', value: stats.phonesCaptured, icon: Phone, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'Handed Off to WA', value: stats.handedOff, icon: ArrowRightLeft, color: 'text-green-400', bg: 'bg-green-500/10' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-white/10 bg-[#171717] p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <span className="text-sm text-white/50">{card.label}</span>
          </div>
          {loading ? (
            <div className="h-8 w-16 rounded bg-white/5 animate-pulse" />
          ) : (
            <p className="text-3xl font-bold text-white">{card.value}</p>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Leads Tab ───────────────────────────────────────────────────
function LeadsTab() {
  const [leads, setLeads] = useState<EmailLead[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('email_leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (filter === 'active') query = query.eq('current_status', 'active')
    else if (filter === 'closed') query = query.eq('current_status', 'closed')
    else if (filter === 'ooo') query = query.eq('current_status', 'ooo')
    else if (filter === 'handed_off') query = query.eq('handed_off_to_whatsapp', true)

    const { data, error } = await query
    if (error) {
      console.error('Error fetching leads:', error)
    } else {
      setLeads(data || [])
    }
    setLoading(false)
  }, [filter])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'closed', label: 'Closed' },
    { key: 'ooo', label: 'OOO' },
    { key: 'handed_off', label: 'Handed Off' },
  ]

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f.key
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-white/5 text-white/50 border border-white/10 hover:text-white hover:border-white/20'
            }`}
          >
            {f.label}
          </button>
        ))}
        <button
          onClick={fetchLeads}
          className="ml-auto p-1.5 rounded-lg border border-white/10 bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/10 bg-[#171717] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-4 py-3 text-white/50 font-medium">Name</th>
                <th className="text-left px-4 py-3 text-white/50 font-medium">Email</th>
                <th className="text-left px-4 py-3 text-white/50 font-medium hidden md:table-cell">Company</th>
                <th className="text-left px-4 py-3 text-white/50 font-medium hidden lg:table-cell">Campaign</th>
                <th className="text-left px-4 py-3 text-white/50 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-white/50 font-medium hidden sm:table-cell">Replies</th>
                <th className="text-left px-4 py-3 text-white/50 font-medium hidden lg:table-cell">Classification</th>
                <th className="text-left px-4 py-3 text-white/50 font-medium hidden md:table-cell">Phone</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-white/30">
                    Loading leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-white/30">
                    No leads found
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const style = getStatusStyle(lead.handed_off_to_whatsapp ? 'handed_off_to_whatsapp' : lead.current_status)
                  const isExpanded = expandedId === lead.id
                  return (
                    <>
                      <tr
                        key={lead.id}
                        onClick={() => setExpandedId(isExpanded ? null : lead.id)}
                        className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 text-white font-medium">{lead.name || '-'}</td>
                        <td className="px-4 py-3 text-white/70 max-w-[200px] truncate">{lead.email}</td>
                        <td className="px-4 py-3 text-white/50 hidden md:table-cell">{lead.company || '-'}</td>
                        <td className="px-4 py-3 text-white/50 hidden lg:table-cell">{lead.campaign_name || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}>
                            {lead.handed_off_to_whatsapp ? 'handed_off' : lead.current_status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-white/50 hidden sm:table-cell">{lead.reply_count ?? 0}</td>
                        <td className="px-4 py-3 text-white/50 hidden lg:table-cell">{lead.last_classification || '-'}</td>
                        <td className="px-4 py-3 text-white/50 hidden md:table-cell">{lead.phone_number || '-'}</td>
                      </tr>
                      {isExpanded && lead.classification_history && lead.classification_history.length > 0 && (
                        <tr key={`${lead.id}-expanded`} className="border-b border-white/5">
                          <td colSpan={8} className="px-6 py-4 bg-white/[0.02]">
                            <p className="text-xs text-white/40 font-medium mb-2">Classification History</p>
                            <div className="space-y-1">
                              {lead.classification_history.map((entry, idx) => (
                                <div key={idx} className="flex items-center gap-3 text-xs text-white/50">
                                  <span className="text-white/30">{String(entry.date || entry.timestamp || `#${idx + 1}`)}</span>
                                  <span className="text-white/70">{String(entry.classification || entry.label || JSON.stringify(entry))}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Settings Tab ────────────────────────────────────────────────
function SettingsTab() {
  const [apiKey, setApiKey] = useState('')
  const [claudeKey, setClaudeKey] = useState('')
  const [workspaceId, setWorkspaceId] = useState('')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const webhookUrl = 'https://castudio.id/api/webhook/plusvibe'

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase
        .from('agent_settings')
        .select('api_key, system_prompt')
        .eq('agent_name', 'plusvibe')
        .single()

      if (data) {
        if (data.api_key) {
          try {
            setApiKey(atob(data.api_key))
          } catch {
            setApiKey(data.api_key)
          }
        }
        if (data.system_prompt) {
          try {
            const parsed = JSON.parse(data.system_prompt)
            if (parsed.workspace_id) setWorkspaceId(parsed.workspace_id)
          } catch {
            // ignore parse error
          }
        }
      }
      setLoaded(true)
    }
    loadSettings()
  }, [])

  async function handleSave() {
    setSaving(true)
    const claudeEncoded = claudeKey ? btoa(claudeKey) : undefined
    const systemPrompt = JSON.stringify({ workspace_id: workspaceId, plusvibe_api_key: apiKey })

    const upsertData: Record<string, unknown> = { agent_name: 'plusvibe', system_prompt: systemPrompt }
    if (claudeEncoded) upsertData.api_key = claudeEncoded

    const { error } = await supabase
      .from('agent_settings')
      .upsert(
        upsertData,
        { onConflict: 'agent_name' }
      )

    if (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    }
    setSaving(false)
  }

  function handleCopy() {
    navigator.clipboard.writeText(webhookUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!loaded) {
    return <div className="text-white/30 text-sm py-8 text-center">Loading settings...</div>
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Claude API Key */}
      <div className="rounded-xl border border-orange-500/20 bg-[#171717] p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-1.5">Claude API Key</label>
          <p className="text-xs text-white/30 mb-2">Powers Ryan's AI. If not set, falls back to Shera's key.</p>
          <input
            type="password"
            value={claudeKey}
            onChange={(e) => setClaudeKey(e.target.value)}
            placeholder="sk-ant-api03-..."
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-orange-500/50 focus:outline-none"
          />
        </div>
      </div>

      {/* Plusvibe API Key */}
      <div className="rounded-xl border border-white/10 bg-[#171717] p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-1.5">Plusvibe API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Plusvibe API key"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
          />
        </div>

        {/* Workspace ID */}
        <div>
          <label className="block text-sm font-medium text-white mb-1.5">Workspace ID</label>
          <input
            type="text"
            value={workspaceId}
            onChange={(e) => setWorkspaceId(e.target.value)}
            placeholder="Enter your Plusvibe workspace ID"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white text-sm font-medium transition-colors"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Webhook URL */}
      <div className="rounded-xl border border-white/10 bg-[#171717] p-5 space-y-3">
        <label className="block text-sm font-medium text-white">Webhook URL</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={webhookUrl}
            readOnly
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/70 focus:outline-none"
          />
          <button
            onClick={handleCopy}
            className="p-2.5 rounded-lg border border-white/10 bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-white/30">Register this URL in your Plusvibe workspace to receive email events.</p>
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────
export default function PlusvibeAgentPage() {
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
          <h1 className="text-2xl font-bold text-white">Ryan</h1>
          <p className="text-sm text-white/50 mt-1">Email Reply Agent</p>
        </div>
        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-purple-500/20 text-purple-400">
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
      {activeTab === 'dashboard' && <DashboardTab />}
      {activeTab === 'leads' && <LeadsTab />}
      {activeTab === 'settings' && <SettingsTab />}
    </div>
  )
}
