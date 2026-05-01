'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, AlertCircle, RefreshCw, Filter } from 'lucide-react'

interface AuditRow {
  id: string
  thread_id: string
  message_id: string | null
  user_email: string | null
  tool_name: string
  params: Record<string, unknown>
  result: any
  success: boolean | null
  error: string | null
  affected_ids: string[] | null
  duration_ms: number | null
  created_at: string
}

function fmtTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('en-GB', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

export function AuditLogView() {
  const [rows, setRows] = useState<AuditRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toolFilter, setToolFilter] = useState<string>('')
  const [successFilter, setSuccessFilter] = useState<'all' | 'true' | 'false'>('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ limit: '200' })
      if (toolFilter) params.set('tool', toolFilter)
      if (successFilter !== 'all') params.set('success', successFilter)
      const res = await fetch(`/api/ai/audit?${params}`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setRows(json.rows || [])
    } catch (e: any) {
      setError(e?.message || String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [toolFilter, successFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  const toolNames = useMemo(() => Array.from(new Set(rows.map((r) => r.tool_name))).sort(), [rows])

  const stats = useMemo(() => {
    const total = rows.length
    const ok = rows.filter((r) => r.success === true).length
    const failed = rows.filter((r) => r.success === false).length
    const pending = rows.filter((r) => r.success === null).length
    return { total, ok, failed, pending }
  }, [rows])

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="h-12 border-b border-white/10 flex items-center px-4 gap-3 shrink-0">
        <span className="font-heading text-sm text-white">Audit log</span>
        <span className="text-[10px] uppercase tracking-widest text-white/40">{stats.total} actions</span>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={load} className="text-white/50 hover:text-white p-1.5" aria-label="Refresh">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-8 py-4 border-b border-white/10 flex flex-wrap items-center gap-3 text-xs">
        <Filter className="h-3.5 w-3.5 text-white/40" />
        <select
          value={toolFilter}
          onChange={(e) => setToolFilter(e.target.value)}
          className="bg-[#171717] border border-white/10 px-2 py-1 text-white"
        >
          <option value="">All tools</option>
          {toolNames.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <select
          value={successFilter}
          onChange={(e) => setSuccessFilter(e.target.value as any)}
          className="bg-[#171717] border border-white/10 px-2 py-1 text-white"
        >
          <option value="all">All results</option>
          <option value="true">Success</option>
          <option value="false">Failed</option>
        </select>
        <span className="ml-auto text-white/40">
          <span className="text-green-400">{stats.ok} ok</span> · <span className="text-red-400">{stats.failed} failed</span> · <span className="text-white/40">{stats.pending} pending</span>
        </span>
      </div>

      {error && (
        <div className="m-4 px-3 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {!loading && rows.length === 0 && (
          <div className="text-center text-sm text-white/40 mt-12">No actions yet.</div>
        )}

        <div className="divide-y divide-white/5">
          {rows.map((r) => {
            const isOpen = expanded === r.id
            const Icon = r.success === true ? CheckCircle2 : r.success === false ? AlertCircle : RefreshCw
            const colour =
              r.success === true ? 'text-green-400' : r.success === false ? 'text-red-400' : 'text-white/40'
            return (
              <div key={r.id} className="px-4 sm:px-8 py-3">
                <button
                  onClick={() => setExpanded(isOpen ? null : r.id)}
                  className="w-full flex items-start gap-3 text-left hover:bg-white/5 -mx-2 px-2 py-1"
                >
                  <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${colour}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[13px] text-white">{r.tool_name}</span>
                      {r.affected_ids && r.affected_ids.length > 0 && (
                        <span className="font-mono text-[11px] text-[#F97316]">{r.affected_ids[0].slice(0, 8)}</span>
                      )}
                      {r.duration_ms !== null && (
                        <span className="text-[10px] text-white/30">{r.duration_ms}ms</span>
                      )}
                    </div>
                    <div className="text-[11px] text-white/50 mt-0.5">
                      {fmtTime(r.created_at)} · {r.user_email ?? 'unknown'}
                    </div>
                    {r.error && (
                      <div className="text-[11px] text-red-400 mt-1 line-clamp-2">{r.error}</div>
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="mt-2 ml-7 grid sm:grid-cols-2 gap-3 text-[11px]">
                    <div>
                      <div className="text-white/40 uppercase tracking-wider mb-1">Params</div>
                      <pre className="p-2 bg-black/40 border border-white/10 text-white/70 overflow-x-auto font-mono">
                        {JSON.stringify(r.params, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <div className="text-white/40 uppercase tracking-wider mb-1">Result</div>
                      <pre className="p-2 bg-black/40 border border-white/10 text-white/70 overflow-x-auto font-mono max-h-64">
                        {JSON.stringify(r.result, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
