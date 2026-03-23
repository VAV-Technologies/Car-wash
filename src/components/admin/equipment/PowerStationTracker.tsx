'use client'

import { useState, useEffect } from 'react'
import { Loader2, Battery, Plus } from 'lucide-react'
import { getEquipment, incrementUsageCycles } from '@/lib/admin/equipment'
import type { Equipment } from '@/lib/admin/types'

export default function PowerStationTracker() {
  const [station, setStation] = useState<Equipment | null>(null)
  const [loading, setLoading] = useState(true)
  const [cyclesToAdd, setCyclesToAdd] = useState(1)
  const [adding, setAdding] = useState(false)

  async function loadStation() {
    setLoading(true)
    try {
      const all = await getEquipment()
      // Find the Bluetti power station (match by name containing "bluetti" case-insensitive)
      const bluetti = all.find(
        (item) => item.name.toLowerCase().includes('bluetti') || item.name.toLowerCase().includes('power station')
      )
      setStation(bluetti ?? null)
    } catch (err) {
      console.error('Failed to load power station:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStation()
  }, [])

  async function handleAddCycles() {
    if (!station || cyclesToAdd <= 0) return
    setAdding(true)
    try {
      await incrementUsageCycles(station.id, cyclesToAdd)
      await loadStation()
      setCyclesToAdd(1)
    } catch (err) {
      console.error('Failed to add cycles:', err)
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 text-orange-500 animate-spin" />
      </div>
    )
  }

  if (!station) {
    return (
      <div className="rounded-lg border border-white/10 bg-[#171717] p-10 text-center">
        <p className="text-white/40 text-sm">
          No power station found. Add equipment with &quot;Bluetti&quot; or &quot;Power Station&quot; in the name.
        </p>
      </div>
    )
  }

  const maxCycles = station.max_usage_cycles ?? 4000
  const currentCycles = station.usage_cycles
  const percentUsed = Math.min((currentCycles / maxCycles) * 100, 100)
  const remainingCycles = Math.max(maxCycles - currentCycles, 0)

  // Estimate remaining lifespan: assume ~1 cycle per day on average
  const estimatedDaysRemaining = remainingCycles
  const estimatedMonthsRemaining = Math.floor(estimatedDaysRemaining / 30)
  const estimatedYearsRemaining = Math.floor(estimatedMonthsRemaining / 12)
  const remainingMonths = estimatedMonthsRemaining % 12

  let progressColor = 'bg-green-500'
  if (percentUsed > 80) progressColor = 'bg-red-500'
  else if (percentUsed > 60) progressColor = 'bg-yellow-500'

  return (
    <div className="max-w-lg">
      <div className="rounded-lg border border-white/10 bg-[#171717] p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-500/20 p-2.5">
            <Battery className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{station.name}</h3>
            <p className="text-xs text-white/40">
              {[station.brand, station.model].filter(Boolean).join(' ')}
            </p>
          </div>
        </div>

        {/* Charge Cycles */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/60">Charge Cycles</span>
            <span className="text-sm text-white font-medium">
              {currentCycles.toLocaleString()} / {maxCycles.toLocaleString()}+
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-3 rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full ${progressColor} transition-all duration-500`}
              style={{ width: `${percentUsed}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-white/30">{percentUsed.toFixed(1)}% lifecycle used</span>
            <span className="text-xs text-white/30">{remainingCycles.toLocaleString()} remaining</span>
          </div>
        </div>

        {/* Estimated Lifespan */}
        <div className="rounded-lg bg-white/5 border border-white/5 px-4 py-3">
          <p className="text-xs text-white/40 mb-1">Estimated Remaining Lifespan</p>
          <p className="text-lg font-bold text-white">
            {estimatedYearsRemaining > 0 && `${estimatedYearsRemaining}y `}
            {remainingMonths > 0 && `${remainingMonths}m`}
            {estimatedYearsRemaining === 0 && remainingMonths === 0 && `${estimatedDaysRemaining}d`}
          </p>
          <p className="text-xs text-white/30 mt-1">Based on ~1 cycle/day average usage</p>
        </div>

        {/* Add Cycles */}
        <div className="border-t border-white/10 pt-4">
          <label className="block text-xs text-white/40 mb-2">Add Charge Cycles</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              value={cyclesToAdd}
              onChange={(e) => setCyclesToAdd(Math.max(1, Number(e.target.value)))}
              className="w-24 rounded-lg border border-white/10 bg-[#0A0A0A] px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
            <button
              onClick={handleAddCycles}
              disabled={adding}
              className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {adding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Add Cycles
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
