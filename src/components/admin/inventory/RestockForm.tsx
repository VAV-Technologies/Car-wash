'use client'

import { useState } from 'react'
import { Loader2, Plus, X } from 'lucide-react'
import { restockItem } from '@/lib/admin/inventory'
import type { InventoryItem } from '@/lib/admin/types'

interface RestockFormProps {
  item: InventoryItem
  onClose: () => void
  onRestocked: (updated: InventoryItem) => void
}

export default function RestockForm({ item, onClose, onRestocked }: RestockFormProps) {
  const [qty, setQty] = useState<number>(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (qty <= 0) {
      setError('Quantity must be greater than 0')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const updated = await restockItem(item.id, qty)
      onRestocked(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restock')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl border border-white/10 bg-[#171717] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white">Restock Item</h3>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Name (readonly) */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1">Product</label>
            <input
              type="text"
              value={item.product_name}
              readOnly
              className="w-full rounded-lg border border-white/10 bg-[#0A0A0A] px-4 py-2 text-sm text-white/50 cursor-not-allowed"
            />
          </div>

          {/* Current Qty */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1">Current Stock</label>
            <input
              type="text"
              value={`${item.current_qty} ${item.unit}`}
              readOnly
              className="w-full rounded-lg border border-white/10 bg-[#0A0A0A] px-4 py-2 text-sm text-white/50 cursor-not-allowed"
            />
          </div>

          {/* Amount to Add */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1">Amount to Add</label>
            <input
              type="number"
              min={1}
              value={qty || ''}
              onChange={(e) => setQty(parseInt(e.target.value) || 0)}
              placeholder="Enter quantity..."
              className="w-full rounded-lg border border-white/10 bg-[#0A0A0A] px-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50"
              autoFocus
            />
          </div>

          {qty > 0 && (
            <p className="text-xs text-white/40">
              New stock will be: {item.current_qty + qty} {item.unit}
            </p>
          )}

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || qty <= 0}
              className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-black hover:bg-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Restock
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
