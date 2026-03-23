'use client'

import { useState, useEffect } from 'react'
import { Loader2, ChevronDown, ChevronUp, Wrench, Trash2 } from 'lucide-react'
import { getEquipment, logMaintenance, deleteEquipment } from '@/lib/admin/equipment'
import { formatDate } from '@/lib/admin/constants'
import type { Equipment } from '@/lib/admin/types'

const STATUS_CONFIG: Record<string, { label: string; bgClass: string; textClass: string }> = {
  operational: { label: 'Operational', bgClass: 'bg-green-500/20', textClass: 'text-green-400' },
  needs_maintenance: { label: 'Needs Maintenance', bgClass: 'bg-yellow-500/20', textClass: 'text-yellow-400' },
  out_of_service: { label: 'Out of Service', bgClass: 'bg-red-500/20', textClass: 'text-red-400' },
}

function getWarrantyStatus(warrantyExpiry: string | null): { label: string; bgClass: string; textClass: string } {
  if (!warrantyExpiry) return { label: 'N/A', bgClass: 'bg-gray-500/20', textClass: 'text-gray-400' }
  const expired = new Date(warrantyExpiry) < new Date()
  return expired
    ? { label: 'Expired', bgClass: 'bg-red-500/20', textClass: 'text-red-400' }
    : { label: 'Active', bgClass: 'bg-green-500/20', textClass: 'text-green-400' }
}

export default function EquipmentRegistry() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loggingId, setLoggingId] = useState<string | null>(null)

  async function loadEquipment() {
    setLoading(true)
    try {
      const items = await getEquipment()
      setEquipment(items)
    } catch (err) {
      console.error('Failed to load equipment:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEquipment()
  }, [])

  async function handleDeleteEquipment(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('Delete this equipment? This cannot be undone.')) return
    try {
      await deleteEquipment(id)
      await loadEquipment()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete equipment')
    }
  }

  async function handleLogMaintenance(id: string) {
    setLoggingId(id)
    try {
      await logMaintenance(id)
      await loadEquipment()
    } catch (err) {
      console.error('Failed to log maintenance:', err)
    } finally {
      setLoggingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 text-orange-500 animate-spin" />
      </div>
    )
  }

  if (equipment.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-[#171717] p-10 text-center">
        <p className="text-white/40 text-sm">No equipment registered.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-white/10 bg-[#171717] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-white/40">
              <th className="px-4 py-3 font-medium w-8"></th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Brand / Model</th>
              <th className="px-4 py-3 font-medium">Purchase Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Last Maintenance</th>
              <th className="px-4 py-3 font-medium">Next Due</th>
              <th className="px-4 py-3 font-medium">Warranty</th>
              <th className="px-4 py-3 font-medium w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {equipment.map((item) => {
              const statusCfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.operational
              const warrantyCfg = getWarrantyStatus(item.warranty_expiry)
              const isExpanded = expandedId === item.id

              return (
                <>
                  <tr
                    key={item.id}
                    className="hover:bg-white/5 cursor-pointer transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  >
                    <td className="px-4 py-3 text-white/40">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </td>
                    <td className="px-4 py-3 text-white font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-white/60">
                      {[item.brand, item.model].filter(Boolean).join(' ') || '—'}
                    </td>
                    <td className="px-4 py-3 text-white/60">{formatDate(item.purchase_date)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCfg.bgClass} ${statusCfg.textClass}`}>
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/60">{formatDate(item.last_maintenance_at)}</td>
                    <td className="px-4 py-3 text-white/60">{formatDate(item.next_maintenance_at)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${warrantyCfg.bgClass} ${warrantyCfg.textClass}`}>
                        {warrantyCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => handleDeleteEquipment(item.id, e)}
                        className="text-white/20 hover:text-red-400 p-1 transition-colors"
                        title="Delete equipment"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${item.id}-details`} className="bg-white/[0.02]">
                      <td colSpan={9} className="px-4 py-4">
                        <div className="flex items-center justify-between pl-8">
                          <div className="space-y-1 text-sm">
                            <p className="text-white/40">
                              Maintenance interval: <span className="text-white/60">{item.maintenance_interval_days} days</span>
                            </p>
                            {item.usage_cycles > 0 && (
                              <p className="text-white/40">
                                Usage cycles: <span className="text-white/60">{item.usage_cycles.toLocaleString()}</span>
                                {item.max_usage_cycles && (
                                  <span className="text-white/30"> / {item.max_usage_cycles.toLocaleString()}</span>
                                )}
                              </p>
                            )}
                            {item.notes && (
                              <p className="text-white/40">
                                Notes: <span className="text-white/60">{item.notes}</span>
                              </p>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleLogMaintenance(item.id)
                            }}
                            disabled={loggingId === item.id}
                            className="flex items-center gap-2 rounded-lg bg-orange-500/20 border border-orange-500/30 px-4 py-2 text-sm text-orange-400 hover:bg-orange-500/30 transition-colors disabled:opacity-50"
                          >
                            {loggingId === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Wrench className="h-4 w-4" />
                            )}
                            Log Maintenance
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
