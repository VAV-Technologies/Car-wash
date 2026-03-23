'use client'

import { useState, useEffect } from 'react'
import { Package, AlertTriangle } from 'lucide-react'
import { getLowStockItems } from '@/lib/admin/inventory'
import type { InventoryItem } from '@/lib/admin/types'
import StockLevels from '@/components/admin/inventory/StockLevels'

export default function InventoryPage() {
  const [lowStock, setLowStock] = useState<InventoryItem[]>([])

  useEffect(() => {
    async function load() {
      try {
        const items = await getLowStockItems()
        setLowStock(items)
      } catch {
        // silent — alert is optional
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-orange-500/20 p-2">
          <Package className="h-5 w-5 text-orange-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Inventory</h1>
      </div>

      {/* Low Stock Alert Banner */}
      {lowStock.length > 0 && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-300">
              {lowStock.length} item{lowStock.length !== 1 ? 's' : ''} below minimum stock level
            </p>
            <p className="text-xs text-red-400/70 mt-1">
              {lowStock.map((item) => item.product_name).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Stock Levels Table */}
      <StockLevels />
    </div>
  )
}
