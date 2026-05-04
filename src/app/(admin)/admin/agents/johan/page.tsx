'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Bot,
  MessageSquare,
  Activity,
  Clock,
  Settings as SettingsIcon,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Save,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

const TABS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'actions', label: 'Action Log' },
  { key: 'pending', label: 'Pending Confirmations' },
  { key: 'threads', label: 'Threads' },
  { key: 'settings', label: 'Settings' },
] as const

type TabKey = (typeof TABS)[number]['key']

export default function JohanAgentPage() {
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
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">Johan</h1>
          <p className="text-sm text-white/50 mt-1">Booking Co-pilot</p>
        </div>
        <a
          href="https://t.me/Johan_Castudio_Bot"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-xs font-medium text-orange-400 hover:bg-orange-500/20 transition-colors"
        >
          Open in Telegram
          <ExternalLink className="h-3 w-3" />
        </a>
        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-green-500/20 text-green-400">
          Active
        </span>
      </div>

      {/* Tabs */}
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

      {/* Tab Content */}
      {activeTab === 'dashboard' && <DashboardTab />}
      {activeTab === 'actions' && <ActionsTab />}
      {activeTab === 'pending' && <PendingTab />}
      {activeTab === 'threads' && <ThreadsTab />}
      {activeTab === 'settings' && <SettingsTab />}
    </div>
  )
}

// ─── Dashboard ───────────────────────────────────────────────────────

interface DashboardStats {
  threads: number
  actionsTotal: number
  actionsSuccess: number
  pendingPending: number
}

function DashboardTab() {
  const [stats, setStats] = useState<DashboardStats>({
    threads: 0,
    actionsTotal: 0,
    actionsSuccess: 0,
    pendingPending: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [threads, actions, pending] = await Promise.all([
        supabase.from('ai_chat_threads').select('id', { count: 'exact', head: true }),
        supabase.from('ai_action_log').select('id, success', { count: 'exact' }),
        supabase
          .from('ai_pending_actions')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending'),
      ])
      if (cancelled) return
      const successful = (actions.data || []).filter((r: any) => r.success === true).length
      setStats({
        threads: threads.count ?? 0,
        actionsTotal: actions.count ?? 0,
        actionsSuccess: successful,
        pendingPending: pending.count ?? 0,
      })
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const successRate =
    stats.actionsTotal === 0 ? 0 : Math.round((stats.actionsSuccess / stats.actionsTotal) * 100)

  const cards = [
    { label: 'Chat Threads', value: stats.threads, icon: MessageSquare, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'Actions Run', value: stats.actionsTotal, icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Success Rate', value: `${successRate}%`, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Pending Approval', value: stats.pendingPending, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
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
          <div className="text-2xl font-bold text-white">{loading ? '…' : card.value}</div>
        </div>
      ))}
    </div>
  )
}

// ─── Action Log ──────────────────────────────────────────────────────

interface ActionRow {
  id: string
  thread_id: string | null
  tool_name: string
  params: any
  result: any
  success: boolean | null
  error: string | null
  duration_ms: number | null
  created_at: string
}

function ActionsTab() {
  const [rows, setRows] = useState<ActionRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('ai_action_log')
      .select('id, thread_id, tool_name, params, result, success, error, duration_ms, created_at')
      .order('created_at', { ascending: false })
      .limit(100)
    setRows((data as ActionRow[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="rounded-xl border border-white/10 bg-[#171717] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
        <div className="text-sm font-medium text-white">Latest 100 actions</div>
        <button
          onClick={load}
          className="text-xs text-white/50 hover:text-white transition-colors"
        >
          Refresh
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-white/50">
            <tr>
              <th className="text-left px-5 py-2 font-medium">When</th>
              <th className="text-left px-5 py-2 font-medium">Tool</th>
              <th className="text-left px-5 py-2 font-medium">Result</th>
              <th className="text-left px-5 py-2 font-medium">Duration</th>
              <th className="text-left px-5 py-2 font-medium">Thread</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-white/40">Loading…</td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-white/40">No actions yet</td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-white/5 hover:bg-white/5">
                <td className="px-5 py-2 text-white/70 whitespace-nowrap">
                  {new Date(r.created_at).toLocaleString()}
                </td>
                <td className="px-5 py-2 text-white font-mono text-xs">{r.tool_name}</td>
                <td className="px-5 py-2">
                  {r.success === true && (
                    <span className="inline-flex items-center gap-1 text-green-400">
                      <CheckCircle2 className="h-3 w-3" /> success
                    </span>
                  )}
                  {r.success === false && (
                    <span className="inline-flex items-center gap-1 text-red-400" title={r.error || ''}>
                      <XCircle className="h-3 w-3" /> error
                    </span>
                  )}
                  {r.success === null && <span className="text-white/40">—</span>}
                </td>
                <td className="px-5 py-2 text-white/60">{r.duration_ms ? `${r.duration_ms}ms` : '—'}</td>
                <td className="px-5 py-2 text-white/40 font-mono text-xs">
                  {r.thread_id ? (
                    <span title={r.thread_id}>{r.thread_id.slice(0, 8)}…</span>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Pending Confirmations ───────────────────────────────────────────

interface PendingRow {
  id: string
  thread_id: string | null
  tool_name: string
  human_summary: string | null
  status: string
  expires_at: string | null
  created_at: string
}

function PendingTab() {
  const [rows, setRows] = useState<PendingRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data } = await supabase
        .from('ai_pending_actions')
        .select('id, thread_id, tool_name, human_summary, status, expires_at, created_at')
        .order('created_at', { ascending: false })
        .limit(50)
      if (!cancelled) {
        setRows((data as PendingRow[]) || [])
        setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="rounded-xl border border-white/10 bg-[#171717] overflow-hidden">
      <div className="px-5 py-3 border-b border-white/10 text-sm font-medium text-white">
        Latest 50 pending / staged actions
      </div>
      <div className="divide-y divide-white/5">
        {loading && <div className="px-5 py-6 text-center text-white/40">Loading…</div>}
        {!loading && rows.length === 0 && (
          <div className="px-5 py-6 text-center text-white/40">No pending actions</div>
        )}
        {rows.map((r) => (
          <div key={r.id} className="px-5 py-3 flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-orange-400">{r.tool_name}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    r.status === 'pending'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : r.status === 'confirmed'
                        ? 'bg-blue-500/20 text-blue-400'
                        : r.status === 'executed'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-white/10 text-white/50'
                  }`}
                >
                  {r.status}
                </span>
              </div>
              {r.human_summary && (
                <div className="text-sm text-white/70 break-words">{r.human_summary}</div>
              )}
              <div className="text-xs text-white/40 mt-1">
                Created {new Date(r.created_at).toLocaleString()}
                {r.expires_at && ` · expires ${new Date(r.expires_at).toLocaleString()}`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Threads ─────────────────────────────────────────────────────────

interface ThreadRow {
  id: string
  title: string | null
  last_message_at: string | null
  archived_at: string | null
  created_at: string
}

function ThreadsTab() {
  const [rows, setRows] = useState<ThreadRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data } = await supabase
        .from('ai_chat_threads')
        .select('id, title, last_message_at, archived_at, created_at')
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .limit(50)
      if (!cancelled) {
        setRows((data as ThreadRow[]) || [])
        setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="rounded-xl border border-white/10 bg-[#171717] overflow-hidden">
      <div className="px-5 py-3 border-b border-white/10 text-sm font-medium text-white">
        Latest 50 chat threads
      </div>
      <div className="divide-y divide-white/5">
        {loading && <div className="px-5 py-6 text-center text-white/40">Loading…</div>}
        {!loading && rows.length === 0 && (
          <div className="px-5 py-6 text-center text-white/40">No threads yet</div>
        )}
        {rows.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-4 px-5 py-3"
            title={t.id}
          >
            <Bot className="h-4 w-4 text-orange-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white truncate">
                {t.title || <span className="text-white/40">Untitled thread</span>}
              </div>
              <div className="text-xs text-white/40 mt-0.5">
                {t.last_message_at
                  ? `Last activity ${new Date(t.last_message_at).toLocaleString()}`
                  : `Created ${new Date(t.created_at).toLocaleString()}`}
                {t.archived_at && ' · archived'}
              </div>
            </div>
            <span className="text-xs text-white/30 font-mono">{t.id.slice(0, 8)}…</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Settings ────────────────────────────────────────────────────────

interface SettingsState {
  has_api_key: boolean
  api_key_preview: string | null
  model: string | null
  max_tokens: number | null
  system_prompt: any
}

function SettingsTab() {
  const [state, setState] = useState<SettingsState | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('')
  const [maxTokens, setMaxTokens] = useState<number | ''>('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/johan')
    if (res.ok) {
      const data = await res.json()
      setState(data)
      setModel(data.model || '')
      setMaxTokens(data.max_tokens ?? '')
      setSystemPrompt(typeof data.system_prompt === 'string' ? data.system_prompt : JSON.stringify(data.system_prompt ?? '', null, 2))
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function save() {
    setSaving(true)
    setSaveMsg(null)
    const body: Record<string, unknown> = {}
    if (apiKey.trim().length > 0) body.api_key = apiKey.trim()
    if (model.trim().length > 0) body.model = model.trim()
    if (maxTokens !== '' && Number.isFinite(Number(maxTokens))) body.max_tokens = Number(maxTokens)
    if (systemPrompt !== '') {
      // Try parsing as JSON first; if it fails, send as plain string
      try {
        body.system_prompt = JSON.parse(systemPrompt)
      } catch {
        body.system_prompt = systemPrompt
      }
    }
    const res = await fetch('/api/admin/johan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setSaving(false)
    if (res.ok) {
      setSaveMsg({ type: 'ok', text: 'Saved' })
      setApiKey('')
      load()
    } else {
      const err = await res.json().catch(() => ({}))
      setSaveMsg({ type: 'err', text: err.error || 'Save failed' })
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-white/10 bg-[#171717] p-5 space-y-4">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-4 w-4 text-white/60" />
          <h3 className="text-sm font-medium text-white">Configuration</h3>
        </div>

        {/* API Key */}
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1.5">LLM API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={state?.has_api_key ? `Stored: ${state.api_key_preview} (leave blank to keep)` : 'Paste API key…'}
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-orange-500/50 focus:outline-none"
          />
          <p className="text-xs text-white/40 mt-1">
            Stored base64-encoded in <span className="font-mono">agent_settings</span>. Leave blank to keep current.
          </p>
        </div>

        {/* Model */}
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1.5">Model</label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="e.g. grok-4-20-reasoning"
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-orange-500/50 focus:outline-none"
          />
        </div>

        {/* Max Tokens */}
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1.5">Max Tokens</label>
          <input
            type="number"
            value={maxTokens}
            onChange={(e) => setMaxTokens(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="e.g. 1024"
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-orange-500/50 focus:outline-none"
          />
        </div>

        {/* System Prompt */}
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1.5">System Prompt</label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={12}
            placeholder="Plain text or JSON…"
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-orange-500/50 focus:outline-none font-mono"
          />
          <p className="text-xs text-white/40 mt-1">
            If JSON-parseable, stored as JSON. Otherwise stored as plain string.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving…' : 'Save'}
          </button>
          {saveMsg && (
            <span className={saveMsg.type === 'ok' ? 'text-sm text-green-400' : 'text-sm text-red-400'}>
              {saveMsg.text}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
