'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Copy,
  Check,
  RefreshCw,
  Mail,
  Phone,
  Users,
  ArrowRightLeft,
  Loader2,
  Play,
  AlertTriangle,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import AgentRulesEditor from '@/components/admin/agents/AgentRulesEditor'

const TABS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'leads', label: 'Leads' },
  { key: 'rules', label: 'Rules' },
  { key: 'prompt', label: 'Prompt' },
  { key: 'test', label: 'Test' },
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
  last_outbound_html: string | null
  last_outbound_at: string | null
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
                      {isExpanded && (
                        <tr key={`${lead.id}-expanded`} className="border-b border-white/5">
                          <td colSpan={8} className="px-6 py-4 bg-white/[0.02] space-y-4">
                            {lead.last_outbound_html && (
                              <div>
                                <p className="text-xs text-white/40 font-medium mb-2">
                                  Last reply from Ryan
                                  {lead.last_outbound_at && (
                                    <span className="text-white/25 ml-2">
                                      ({new Date(lead.last_outbound_at).toLocaleString()})
                                    </span>
                                  )}
                                </p>
                                <div
                                  className="text-sm text-white/80 bg-[#0f0f0f] border border-white/10 rounded-lg p-3 prose prose-invert prose-sm max-w-none"
                                  dangerouslySetInnerHTML={{ __html: lead.last_outbound_html }}
                                />
                              </div>
                            )}
                            {lead.classification_history && lead.classification_history.length > 0 && (
                              <div>
                                <p className="text-xs text-white/40 font-medium mb-2">Classification History</p>
                                <div className="space-y-1">
                                  {lead.classification_history.map((entry, idx) => (
                                    <div key={idx} className="flex items-center gap-3 text-xs text-white/50">
                                      <span className="text-white/30">{String(entry.date || entry.timestamp || `#${idx + 1}`)}</span>
                                      <span className="text-white/70">{String(entry.classification || entry.label || JSON.stringify(entry))}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {!lead.last_outbound_html && (!lead.classification_history || lead.classification_history.length === 0) && (
                              <p className="text-xs text-white/30">No reply or classification history yet.</p>
                            )}
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

// ─── Rules Tab ───────────────────────────────────────────────────
function RulesTab() {
  return (
    <AgentRulesEditor
      agentName="ryan"
      displayName="Ryan"
      description="Rules added here apply to Ryan, the email reply agent. They get injected at the top of his prompt and override the persona/few-shot defaults."
      contentPlaceholder="Rule content — e.g. 'If they ask where we got their email, say it came from our marketing team.'"
    />
  )
}

// ─── Prompt Tab ──────────────────────────────────────────────────
function PromptTab() {
  const [overrideEnabled, setOverrideEnabled] = useState(false)
  const [override, setOverride] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('agent_settings')
        .select('system_prompt')
        .eq('agent_name', 'plusvibe')
        .maybeSingle()
      const sp = (data?.system_prompt as string | null) ?? null
      // Legacy JSON (workspace_id) is ignored — those are Settings-tab values.
      if (sp && !sp.trim().startsWith('{')) {
        setOverride(sp)
        setOverrideEnabled(true)
      }
      setLoaded(true)
    }
    load()
  }, [])

  async function save() {
    setSaving(true)
    const value = overrideEnabled ? override : null
    const { data: existing } = await supabase
      .from('agent_settings')
      .select('id')
      .eq('agent_name', 'plusvibe')
      .maybeSingle()

    if (existing) {
      await supabase
        .from('agent_settings')
        .update({ system_prompt: value })
        .eq('agent_name', 'plusvibe')
    } else {
      await supabase
        .from('agent_settings')
        .insert({ agent_name: 'plusvibe', system_prompt: value })
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!loaded) {
    return <div className="text-white/30 text-sm py-8 text-center">Loading…</div>
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div className="rounded-xl border border-white/10 bg-[#171717] p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-white font-semibold">System Prompt Override</h2>
            <p className="text-sm text-white/40 mt-1">
              When enabled, this replaces Ryan&apos;s built-in persona block. Rules and the
              shared knowledge base are still appended automatically. Leave disabled to
              use the default persona shipped in code.
            </p>
          </div>
          <button
            onClick={() => setOverrideEnabled(!overrideEnabled)}
            className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${
              overrideEnabled ? 'bg-orange-500' : 'bg-white/10'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                overrideEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {overrideEnabled && (
          <textarea
            value={override}
            onChange={(e) => setOverride(e.target.value)}
            placeholder="Paste a custom Ryan persona here. Keep it focused on voice + identity — facts come from the knowledge base."
            rows={16}
            className="w-full bg-[#0f0f0f] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm font-mono placeholder:text-white/30 focus:outline-none focus:border-orange-500/50 transition-colors resize-y"
          />
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-medium transition-colors"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          {saved && <span className="text-green-400 text-sm">Saved</span>}
        </div>
      </div>
    </div>
  )
}

// ─── Test Tab ────────────────────────────────────────────────────
interface TestResult {
  classification: {
    classification: string
    objection_type: string | null
    sentiment: string
    summary: string
  }
  reply: string
  bannedPhraseHit: string | null
}

function TestTab() {
  const [inboundText, setInboundText] = useState('')
  const [firstName, setFirstName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function run() {
    if (!inboundText.trim()) return
    setRunning(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/admin/agents/ryan/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inboundText,
          firstName: firstName || undefined,
          companyName: companyName || undefined,
          jobTitle: jobTitle || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || `HTTP ${res.status}`)
      } else {
        setResult(data as TestResult)
      }
    } catch (err: any) {
      setError(err?.message || String(err))
    } finally {
      setRunning(false)
    }
  }

  const examplePrompts = [
    'What differentiates you from a regular car wash?',
    'How did you get my email address?',
    'How much do you charge?',
    'Not interested, please remove me.',
    'Sounds good, my number is 0812-3456-7890.',
  ]

  return (
    <div className="max-w-3xl space-y-5">
      <div className="rounded-xl border border-white/10 bg-[#171717] p-5 space-y-4">
        <div>
          <h2 className="text-white font-semibold">Test Ryan</h2>
          <p className="text-sm text-white/40 mt-1">
            Paste an inbound email reply and see exactly what Ryan would send back.
            Nothing is delivered, nothing is logged, and no leads are mutated.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1.5">Inbound email body</label>
          <textarea
            value={inboundText}
            onChange={(e) => setInboundText(e.target.value)}
            placeholder="What the lead wrote back to us..."
            rows={6}
            className="w-full bg-[#0f0f0f] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-orange-500/50 transition-colors resize-y"
          />
          <div className="flex items-center gap-2 flex-wrap mt-2">
            {examplePrompts.map((p) => (
              <button
                key={p}
                onClick={() => setInboundText(p)}
                className="text-[11px] px-2 py-1 rounded bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name (optional)"
            className="rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/50"
          />
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Company (optional)"
            className="rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/50"
          />
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Job title (optional)"
            className="rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/50"
          />
        </div>

        <button
          onClick={run}
          disabled={running || !inboundText.trim()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-medium transition-colors"
        >
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          Run
        </button>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-4 pt-2 border-t border-white/10">
            <div>
              <p className="text-xs text-white/40 font-medium mb-1.5">Classification</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-xs font-medium">
                  {result.classification.classification}
                </span>
                {result.classification.objection_type && (
                  <span className="px-2 py-0.5 rounded bg-white/5 text-white/60 text-xs">
                    {result.classification.objection_type}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded bg-white/5 text-white/40 text-xs">
                  {result.classification.sentiment}
                </span>
              </div>
              <p className="text-xs text-white/40 mt-2 italic">
                {result.classification.summary}
              </p>
            </div>

            {result.bannedPhraseHit && (
              <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  Reply still contains a banned phrase: <code className="font-mono">{result.bannedPhraseHit}</code>.
                  Tighten the prompt or add a Rule to forbid it.
                </div>
              </div>
            )}

            <div>
              <p className="text-xs text-white/40 font-medium mb-1.5">Reply Ryan would send</p>
              <div
                className="rounded-lg border border-white/10 bg-[#0f0f0f] px-4 py-3 text-sm text-white/90 prose prose-invert prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: result.reply }}
              />
              <details className="mt-2 text-xs text-white/30">
                <summary className="cursor-pointer hover:text-white/50">Raw HTML</summary>
                <pre className="mt-2 p-3 bg-[#0a0a0a] rounded text-white/60 font-mono whitespace-pre-wrap break-all">
                  {result.reply}
                </pre>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Settings Tab ────────────────────────────────────────────────
function SettingsTab() {
  const [apiKey, setApiKey] = useState('')
  const [aiKey, setAiKey] = useState('')
  const [workspaceId, setWorkspaceId] = useState('')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const webhookUrl = 'https://castudio.id/api/webhook/plusvibe'

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase
        .from('agent_settings')
        .select('api_key, config, system_prompt')
        .eq('agent_name', 'plusvibe')
        .single()

      if (data) {
        if (data.api_key) {
          try {
            setAiKey(atob(data.api_key))
          } catch {
            setAiKey(data.api_key)
          }
        }
        // Preferred: config column. Fallback: legacy JSON in system_prompt
        // (until the migration backfill runs).
        const cfg = (data.config as { workspace_id?: string; plusvibe_api_key?: string } | null) || null
        if (cfg && typeof cfg === 'object') {
          if (cfg.workspace_id) setWorkspaceId(cfg.workspace_id)
          if (cfg.plusvibe_api_key) setApiKey(cfg.plusvibe_api_key)
        } else if (data.system_prompt && typeof data.system_prompt === 'string' && data.system_prompt.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(data.system_prompt)
            if (parsed.workspace_id) setWorkspaceId(parsed.workspace_id)
            if (parsed.plusvibe_api_key) setApiKey(parsed.plusvibe_api_key)
          } catch {
            // ignore
          }
        }
      }
      setLoaded(true)
    }
    loadSettings()
  }, [])

  async function handleSave() {
    setSaving(true)

    const update: Record<string, unknown> = {
      agent_name: 'plusvibe',
      config: { workspace_id: workspaceId, plusvibe_api_key: apiKey },
    }
    if (aiKey) update.api_key = btoa(aiKey)

    const { error } = await supabase
      .from('agent_settings')
      .upsert(update, { onConflict: 'agent_name' })

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
      <div className="rounded-xl border border-orange-500/20 bg-[#171717] p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-1.5">AI API Key</label>
          <p className="text-xs text-white/30 mb-2">
            Powers Ryan&apos;s classification and reply generation. Currently routes through
            Azure AI Foundry (default model: <code className="font-mono">grok-4-20-reasoning</code>,
            override via <code className="font-mono">AI_MODEL</code> env var or
            <code className="font-mono"> agent_settings.model</code>). If empty, falls back to
            Shera&apos;s key, then the base model connector.
          </p>
          <input
            type="password"
            value={aiKey}
            onChange={(e) => setAiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-orange-500/50 focus:outline-none"
          />
        </div>
      </div>

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

      <div className="flex items-center gap-1 border-b border-white/10 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
              activeTab === tab.key
                ? 'text-orange-500 border-orange-500'
                : 'text-white/50 border-transparent hover:text-white hover:border-white/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && <DashboardTab />}
      {activeTab === 'leads' && <LeadsTab />}
      {activeTab === 'rules' && <RulesTab />}
      {activeTab === 'prompt' && <PromptTab />}
      {activeTab === 'test' && <TestTab />}
      {activeTab === 'settings' && <SettingsTab />}
    </div>
  )
}
