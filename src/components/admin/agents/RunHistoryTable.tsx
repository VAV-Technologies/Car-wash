'use client'

import { useState, useEffect, useCallback } from 'react'
import { getAutomationRuns } from '@/lib/admin/automations'
import type { AutomationRun, TraceStep } from '@/lib/admin/automations'

const PAGE_SIZE = 20

const RUN_STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  success: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Success' },
  failed: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Failed' },
  running: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Running' },
}

function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(dateStr))
}

function computeDuration(start: string, end: string | null): string {
  if (!end) return '—'
  const ms = new Date(end).getTime() - new Date(start).getTime()
  if (ms < 1000) return `${ms}ms`
  const secs = Math.floor(ms / 1000)
  if (secs < 60) return `${secs}s`
  const mins = Math.floor(secs / 60)
  const remainSecs = secs % 60
  return `${mins}m ${remainSecs}s`
}

function TraceView({ steps }: { steps: TraceStep[] }) {
  return (
    <div className="space-y-2 py-3 px-4">
      {steps.map((step, i) => {
        const isSuccess = step.status === 'success'
        return (
          <div
            key={`${step.node_id}-${i}`}
            className="rounded-lg border border-white/5 bg-white/[0.02] p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block h-2 w-2 rounded-full ${
                    isSuccess ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span className="text-xs font-medium text-white">{step.node_label}</span>
              </div>
              <span className="text-xs text-white/40">{step.duration_ms}ms</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Input</p>
                <pre className="text-xs text-white/50 bg-white/5 rounded p-2 overflow-x-auto max-h-32">
                  {JSON.stringify(step.input, null, 2)}
                </pre>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Output</p>
                <pre className="text-xs text-white/50 bg-white/5 rounded p-2 overflow-x-auto max-h-32">
                  {JSON.stringify(step.output, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

interface RunHistoryTableProps {
  automationId: string
}

export default function RunHistoryTable({ automationId }: RunHistoryTableProps) {
  const [runs, setRuns] = useState<AutomationRun[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null)

  const fetchRuns = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getAutomationRuns(automationId, { page, limit: PAGE_SIZE })
      setRuns(result.data)
      setTotalCount(result.count)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load runs')
    } finally {
      setLoading(false)
    }
  }, [automationId, page])

  useEffect(() => {
    fetchRuns()
  }, [fetchRuns])

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-white/10 bg-[#171717]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">
                Run ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">
                Started At
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">
                Duration
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">
                Trigger
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-white/40">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-red-400">
                  {error}
                </td>
              </tr>
            ) : runs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-white/40">
                  No runs yet
                </td>
              </tr>
            ) : (
              runs.map((run) => {
                const statusCfg = RUN_STATUS_CONFIG[run.status] ?? RUN_STATUS_CONFIG.failed
                const isExpanded = expandedRunId === run.id
                return (
                  <tr key={run.id} className="group">
                    <td colSpan={5} className="p-0">
                      <button
                        onClick={() => setExpandedRunId(isExpanded ? null : run.id)}
                        className="w-full text-left border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="px-4 py-3 w-[160px]">
                            <span className="font-mono text-xs text-white/70">
                              {run.id.slice(0, 8)}
                            </span>
                          </div>
                          <div className="px-4 py-3 flex-1">
                            <span className="text-xs text-white/70">
                              {formatDateTime(run.started_at)}
                            </span>
                          </div>
                          <div className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCfg.bg} ${statusCfg.text} ${
                                run.status === 'running' ? 'animate-pulse' : ''
                              }`}
                            >
                              {statusCfg.label}
                            </span>
                          </div>
                          <div className="px-4 py-3 w-[120px]">
                            <span className="text-xs text-white/70">
                              {computeDuration(run.started_at, run.finished_at)}
                            </span>
                          </div>
                          <div className="px-4 py-3 w-[140px]">
                            <span className="text-xs text-white/50">{run.trigger ?? '—'}</span>
                          </div>
                        </div>
                      </button>
                      {isExpanded && run.trace_json && run.trace_json.length > 0 && (
                        <div className="border-b border-white/10 bg-white/[0.01]">
                          <TraceView steps={run.trace_json} />
                        </div>
                      )}
                      {isExpanded && (!run.trace_json || run.trace_json.length === 0) && (
                        <div className="border-b border-white/10 bg-white/[0.01] px-4 py-6 text-center">
                          <p className="text-xs text-white/30">No trace data available</p>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-white/40">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
