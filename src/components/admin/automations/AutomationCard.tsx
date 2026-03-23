'use client'

import Link from 'next/link'
import type { Automation } from '@/lib/admin/automations'

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Active' },
  paused: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Paused' },
  draft: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Draft' },
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Never run'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

interface AutomationCardProps {
  automation: Automation
  onToggle: (id: string, status: 'active' | 'paused') => void
}

export default function AutomationCard({ automation, onToggle }: AutomationCardProps) {
  const statusCfg = STATUS_CONFIG[automation.status] ?? STATUS_CONFIG.draft
  const isActive = automation.status === 'active'
  const canToggle = automation.status === 'active' || automation.status === 'paused'

  function handleToggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!canToggle) return
    onToggle(automation.id, isActive ? 'paused' : 'active')
  }

  return (
    <Link
      href={`/admin/automations/${automation.id}`}
      className="block rounded-xl border border-white/10 bg-[#171717] p-5 hover:border-white/20 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-white truncate">{automation.name}</h3>
          {automation.description && (
            <p className="text-xs text-white/50 mt-1 line-clamp-2">{automation.description}</p>
          )}
        </div>
        <span
          className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusCfg.bg} ${statusCfg.text}`}
        >
          {statusCfg.label}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs text-white/40">
            Last run: {timeAgo(automation.last_run_at)}
          </p>
          <p className="text-xs text-white/40">
            {automation.total_runs} total run{automation.total_runs !== 1 ? 's' : ''}
          </p>
        </div>

        {canToggle && (
          <button
            onClick={handleToggle}
            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
              isActive ? 'bg-green-500' : 'bg-white/20'
            }`}
            aria-label={isActive ? 'Pause automation' : 'Activate automation'}
          >
            <span
              className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                isActive ? 'translate-x-[18px]' : 'translate-x-[3px]'
              }`}
            />
          </button>
        )}
      </div>
    </Link>
  )
}
