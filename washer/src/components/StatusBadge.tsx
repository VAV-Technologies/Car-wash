'use client'

const statusStyles: Record<string, string> = {
  confirmed: 'bg-blue-500/20 text-blue-400',
  en_route: 'bg-yellow-500/20 text-yellow-400',
  in_progress: 'bg-green-500/20 text-green-400',
  completed: 'bg-emerald-500/20 text-emerald-400',
}

const statusLabels: Record<string, string> = {
  confirmed: 'Confirmed',
  en_route: 'En Route',
  in_progress: 'In Progress',
  completed: 'Completed',
}

export default function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] || 'bg-white/10 text-white/60'
  const label = statusLabels[status] || status

  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {label}
    </span>
  )
}
