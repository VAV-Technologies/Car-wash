'use client'

import { useState, useEffect } from 'react'
import { Loader2, PackagePlus, Trash2 } from 'lucide-react'
import { getInventoryItems, deleteInventoryItem } from '@/lib/admin/inventory'
import { formatCurrency, formatDate } from '@/lib/admin/constants'
import type { InventoryItem } from '@/lib/admin/types'
import RestockForm from './RestockForm'

function getStockStatus(item: InventoryItem): {
  label: string
  bgClass: string
  textClass: string
} {
  if (item.current_qty < item.min_threshold * 0.5) {
    return { label: 'Critical', bgClass: 'bg-red-500/20', textClass: 'text-red-400' }
  }
  if (item.current_qty < item.min_threshold) {
    return { label: 'Low', bgClass: 'bg-yellow-500/20', textClass: 'text-yellow-400' }
  }
  return { label: 'OK', bgClass: 'bg-green-500/20', textClass: 'text-green-400' }
}

export default function StockLevels() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [restockItem, setRestockItem] = useState<InventoryItem | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await getInventoryItems()
        setItems(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load inventory')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleDeleteItem(id: string) {
    if (!confirm('Delete this inventory item? This cannot be undone.')) return
    try {
      await deleteInventoryItem(id)
      setItems((prev) => prev.filter((item) => item.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete inventory item')
    }
  }

  const handleRestocked = (updated: InventoryItem) => {
    setItems((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    )
    setRestockItem(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/40">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading inventory...
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-400">{error}</div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-white/40">
        <p>No inventory items found.</p>
      </div>
    )
  }

  return (
    <>
      {restockItem && (
        <RestockForm
          item={restockItem}
          onClose={() => setRestockItem(null)}
          onRestocked={handleRestocked}
        />
      )}

      <div className="overflow-x-auto rounded-lg border border-white/10 bg-[#171717]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">
                Product
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">
                Brand
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">
                Stock
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">
                Min Threshold
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">
                Cost/Unit
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">
                Last Restocked
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const status = getStockStatus(item)
              const isLow = item.current_qty < item.min_threshold

              return (
                <tr
                  key={item.id}
                  className={`border-b border-white/5 transition-colors ${
                    isLow ? 'bg-red-500/5 hover:bg-red-500/10' : 'hover:bg-white/5'
                  }`}
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-white">{item.product_name}</span>
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    {item.brand ?? '-'}
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    <span className={isLow ? 'text-red-400 font-medium' : ''}>
                      {item.current_qty}
                    </span>{' '}
                    <span className="text-white/40">{item.unit}</span>
                  </td>
                  <td className="px-4 py-3 text-white/50">
                    {item.min_threshold} {item.unit}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bgClass} ${status.textClass}`}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    {formatCurrency(item.cost_per_unit)}
                  </td>
                  <td className="px-4 py-3 text-white/50 text-xs">
                    {item.last_restocked_at ? (
                      <>
                        {formatDate(item.last_restocked_at)}
                        {item.last_restocked_qty && (
                          <span className="text-white/30 ml-1">
                            (+{item.last_restocked_qty})
                          </span>
                        )}
                      </>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setRestockItem(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 transition-colors"
                      >
                        <PackagePlus className="h-3 w-3" />
                        Restock
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-white/20 hover:text-red-400 p-1 transition-colors"
                        title="Delete item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
