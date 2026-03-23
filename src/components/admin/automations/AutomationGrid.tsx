'use client'

import { useState, useEffect, useCallback } from 'react'
import { getAutomations, toggleAutomationStatus } from '@/lib/admin/automations'
import type { Automation } from '@/lib/admin/automations'
import AutomationCard from './AutomationCard'
import { Search } from 'lucide-react'

const PAGE_SIZE = 12

const STATUS_TABS = [
  { id: '', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'paused', label: 'Paused' },
  { id: 'draft', label: 'Draft' },
] as const

type StatusFilter = '' | 'active' | 'paused' | 'draft'

export default function AutomationGrid() {
  const [automations, setAutomations] = useState<Automation[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getAutomations({
        search: search.trim() || undefined,
        status: statusFilter,
        page,
        limit: PAGE_SIZE,
      })
      setAutomations(result.data)
      setTotalCount(result.count)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load automations')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, page])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter])

  async function handleToggle(id: string, newStatus: 'active' | 'paused') {
    try {
      await toggleAutomationStatus(id, newStatus)
      setAutomations((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      )
    } catch (err) {
      console.error('Toggle failed:', err)
    }
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search automations..."
          className="w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-orange-500 outline-none"
        />
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-1 border-b border-white/10">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id as StatusFilter)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              statusFilter === tab.id
                ? 'border-orange-500 text-white'
                : 'border-transparent text-white/40 hover:text-white/70'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      ) : automations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-white/40">
          <p className="text-sm">No automations found.</p>
          {(search || statusFilter) && (
            <button
              onClick={() => {
                setSearch('')
                setStatusFilter('')
              }}
              className="mt-2 text-xs text-orange-500 hover:text-orange-400"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {automations.map((a) => (
            <AutomationCard key={a.id} automation={a} onToggle={handleToggle} />
          ))}
        </div>
      )}

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
