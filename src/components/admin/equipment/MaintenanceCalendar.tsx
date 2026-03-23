'use client'

import { useState, useEffect } from 'react'
import { Loader2, Wrench, AlertTriangle, Clock, Calendar } from 'lucide-react'
import { getEquipment, logMaintenance } from '@/lib/admin/equipment'
import { formatDate } from '@/lib/admin/constants'
import type { Equipment } from '@/lib/admin/types'

type MaintenanceCategory = 'overdue' | 'due_this_week' | 'upcoming'

interface CategorizedItem {
  item: Equipment
  category: MaintenanceCategory
  daysUntilDue: number
}

export default function MaintenanceCalendar() {
  const [items, setItems] = useState<CategorizedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loggingId, setLoggingId] = useState<string | null>(null)

  async function loadItems() {
    setLoading(true)
    try {
      const all = await getEquipment()
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const categorized: CategorizedItem[] = all
        .filter((item) => item.next_maintenance_at)
        .map((item) => {
          const dueDate = new Date(item.next_maintenance_at!)
          dueDate.setHours(0, 0, 0, 0)
          const diffMs = dueDate.getTime() - today.getTime()
          const daysUntilDue = Math.floor(diffMs / (1000 * 60 * 60 * 24))

          let category: MaintenanceCategory
          if (daysUntilDue < 0 || item.status === 'needs_maintenance') {
            category = 'overdue'
          } else if (daysUntilDue <= 7) {
            category = 'due_this_week'
          } else if (daysUntilDue <= 30) {
            category = 'upcoming'
          } else {
            return null
          }

          return { item, category, daysUntilDue }
        })
        .filter(Boolean) as CategorizedItem[]

      categorized.sort((a, b) => a.daysUntilDue - b.daysUntilDue)
      setItems(categorized)
    } catch (err) {
      console.error('Failed to load equipment:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [])

  async function handleLogMaintenance(id: string) {
    setLoggingId(id)
    try {
      await logMaintenance(id)
      await loadItems()
    } catch (err) {
      console.error('Failed to log maintenance:', err)
    } finally {
      setLoggingId(null)
    }
  }

  const CATEGORY_CONFIG: Record<MaintenanceCategory, { label: string; icon: typeof AlertTriangle; iconColor: string; borderColor: string; bgColor: string }> = {
    overdue: { label: 'Overdue', icon: AlertTriangle, iconColor: 'text-red-400', borderColor: 'border-red-500/20', bgColor: 'bg-red-500/5' },
    due_this_week: { label: 'Due This Week', icon: Clock, iconColor: 'text-yellow-400', borderColor: 'border-yellow-500/20', bgColor: 'bg-yellow-500/5' },
    upcoming: { label: 'Upcoming (30 days)', icon: Calendar, iconColor: 'text-white/40', borderColor: 'border-white/10', bgColor: 'bg-white/[0.02]' },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 text-orange-500 animate-spin" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-[#171717] p-10 text-center">
        <p className="text-white/40 text-sm">No maintenance scheduled in the next 30 days.</p>
      </div>
    )
  }

  const grouped: Record<MaintenanceCategory, CategorizedItem[]> = {
    overdue: items.filter((i) => i.category === 'overdue'),
    due_this_week: items.filter((i) => i.category === 'due_this_week'),
    upcoming: items.filter((i) => i.category === 'upcoming'),
  }

  return (
    <div className="space-y-6">
      {(['overdue', 'due_this_week', 'upcoming'] as MaintenanceCategory[]).map((cat) => {
        const group = grouped[cat]
        if (group.length === 0) return null
        const config = CATEGORY_CONFIG[cat]
        const Icon = config.icon

        return (
          <div key={cat}>
            <div className="flex items-center gap-2 mb-3">
              <Icon className={`h-4 w-4 ${config.iconColor}`} />
              <h3 className={`text-sm font-medium ${config.iconColor}`}>{config.label}</h3>
              <span className="text-xs text-white/30">({group.length})</span>
            </div>
            <div className="space-y-2">
              {group.map(({ item, daysUntilDue }) => (
                <div
                  key={item.id}
                  className={`rounded-lg border ${config.borderColor} ${config.bgColor} px-4 py-3 flex items-center justify-between`}
                >
                  <div className="space-y-1">
                    <p className="text-sm text-white font-medium">{item.name}</p>
                    <div className="flex items-center gap-4 text-xs text-white/40">
                      <span>Last: {formatDate(item.last_maintenance_at)}</span>
                      <span>Due: {formatDate(item.next_maintenance_at)}</span>
                      <span className={daysUntilDue < 0 ? 'text-red-400' : daysUntilDue <= 7 ? 'text-yellow-400' : ''}>
                        {daysUntilDue < 0
                          ? `${Math.abs(daysUntilDue)} days overdue`
                          : daysUntilDue === 0
                            ? 'Due today'
                            : `${daysUntilDue} days until due`}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleLogMaintenance(item.id)}
                    disabled={loggingId === item.id}
                    className="flex items-center gap-2 rounded-lg bg-orange-500/20 border border-orange-500/30 px-3 py-1.5 text-xs text-orange-400 hover:bg-orange-500/30 transition-colors disabled:opacity-50 flex-shrink-0"
                  >
                    {loggingId === item.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Wrench className="h-3 w-3" />
                    )}
                    Log Maintenance
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
