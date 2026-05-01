'use client'

import { CheckCircle2, AlertCircle } from 'lucide-react'
import type { ExecutedAction } from '@/lib/ai/types'

interface Props {
  action: ExecutedAction
}

export function ActionLogStrip({ action }: Props) {
  const Icon = action.success ? CheckCircle2 : AlertCircle
  const colour = action.success ? 'text-green-400 border-green-500/30 bg-green-500/5' : 'text-red-400 border-red-500/30 bg-red-500/5'
  const label = action.success ? 'Logged' : 'Failed'
  const idDisplay = action.affectedIds.length > 0 ? action.affectedIds[0].slice(0, 8) : ''

  return (
    <div className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-1 border my-1 ${colour}`}>
      <Icon className="h-3 w-3" />
      <span>{label} ✓ {action.toolName}</span>
      {idDisplay && <span className="font-mono opacity-70">{idDisplay}</span>}
    </div>
  )
}
