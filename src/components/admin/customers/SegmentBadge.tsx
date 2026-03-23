'use client'

import { SEGMENTS } from '@/lib/admin/constants'

interface SegmentBadgeProps {
  segment: string
}

export default function SegmentBadge({ segment }: SegmentBadgeProps) {
  const config = SEGMENTS.find((s) => s.value === segment)

  if (!config) {
    return (
      <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white/60">
        {segment}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bgClass} ${config.textClass}`}
    >
      {config.label}
    </span>
  )
}
