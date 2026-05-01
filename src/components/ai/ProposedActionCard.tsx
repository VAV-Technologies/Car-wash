'use client'

import { useState } from 'react'
import { AlertTriangle, Check, X, ChevronDown, ChevronUp } from 'lucide-react'
import type { ProposedAction } from '@/lib/ai/types'

interface Props {
  action: ProposedAction
  onConfirm: (pendingId: string) => void
  onCancel: (pendingId: string) => void
}

export function ProposedActionCard({ action, onConfirm, onCancel }: Props) {
  const [showDetails, setShowDetails] = useState(false)
  const isResolved = action.status !== 'awaiting'

  return (
    <div className="border border-[#F97316]/40 bg-[#F97316]/5 px-4 py-3 my-2">
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-[#F97316] shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-[#F97316] font-semibold mb-1">
            {action.status === 'awaiting' ? 'Confirm action' : action.status === 'confirmed' || action.status === 'executed' ? 'Confirmed' : 'Cancelled'}
          </div>
          <div className="text-sm text-white whitespace-pre-wrap break-words">{action.humanSummary}</div>
          <button
            onClick={() => setShowDetails((v) => !v)}
            className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-white/40 hover:text-white/70"
          >
            {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {showDetails ? 'Hide details' : 'Show details'}
          </button>
          {showDetails && (
            <pre className="mt-2 p-2 bg-black/40 border border-white/10 text-[11px] text-white/70 overflow-x-auto font-mono">
              {action.toolName}({JSON.stringify(action.params, null, 2)})
            </pre>
          )}
        </div>
      </div>

      {!isResolved && (
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => onCancel(action.pendingId)}
            className="flex-1 h-9 px-3 bg-white/5 border border-white/15 text-white/80 hover:bg-white/10 hover:text-white text-xs font-medium inline-flex items-center justify-center gap-1.5"
            autoFocus
          >
            <X className="h-3 w-3" />
            No, cancel
          </button>
          <button
            onClick={() => onConfirm(action.pendingId)}
            className="flex-1 h-9 px-3 bg-[#F97316] text-black hover:bg-[#EA580C] text-xs font-semibold inline-flex items-center justify-center gap-1.5"
          >
            <Check className="h-3 w-3" />
            Yes, do it
          </button>
        </div>
      )}

      {action.status === 'confirmed' && (
        <div className="text-[11px] text-[#F97316] mt-2 inline-flex items-center gap-1">
          <Check className="h-3 w-3" /> Confirmed — running…
        </div>
      )}
      {action.status === 'executed' && (
        <div className="text-[11px] text-green-400 mt-2 inline-flex items-center gap-1">
          <Check className="h-3 w-3" /> Done
        </div>
      )}
      {action.status === 'cancelled' && (
        <div className="text-[11px] text-white/40 mt-2 inline-flex items-center gap-1">
          <X className="h-3 w-3" /> Cancelled — nothing changed
        </div>
      )}
    </div>
  )
}
