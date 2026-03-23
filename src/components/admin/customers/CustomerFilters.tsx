'use client'

import { NEIGHBORHOODS, ACQUISITION_SOURCES, SEGMENTS } from '@/lib/admin/constants'
import type { CustomerFiltersState } from '@/lib/admin/types'
import AdminSelect from '@/components/admin/AdminSelect'

interface CustomerFiltersProps {
  filters: CustomerFiltersState
  onFiltersChange: (filters: CustomerFiltersState) => void
}

export default function CustomerFilters({ filters, onFiltersChange }: CustomerFiltersProps) {
  function updateFilter<K extends keyof CustomerFiltersState>(
    key: K,
    value: CustomerFiltersState[K]
  ) {
    onFiltersChange({ ...filters, [key]: value })
  }

  function clearFilters() {
    onFiltersChange({
      search: '',
      neighborhood: '',
      segment: '',
      acquisition_source: '',
    })
  }

  const hasActiveFilters =
    filters.search !== '' ||
    filters.neighborhood !== '' ||
    filters.segment !== '' ||
    filters.acquisition_source !== ''

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Search */}
      <div className="flex-1 min-w-[180px]">
        <label className="block text-xs font-medium text-white/50 mb-1">Search</label>
        <input
          type="text"
          placeholder="Search name, phone, plate..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30"
        />
      </div>

      {/* Neighborhood */}
      <div className="w-[190px]">
        <label className="block text-xs font-medium text-white/50 mb-1">Neighborhood</label>
        <AdminSelect
          value={filters.neighborhood}
          onChange={(e) => updateFilter('neighborhood', e.target.value as CustomerFiltersState['neighborhood'])}
          width="w-full"
        >
          <option value="">All Neighborhoods</option>
          {NEIGHBORHOODS.map((n) => (
            <option key={n.value} value={n.value}>{n.label}</option>
          ))}
        </AdminSelect>
      </div>

      {/* Segment */}
      <div className="w-[190px]">
        <label className="block text-xs font-medium text-white/50 mb-1">Segment</label>
        <AdminSelect
          value={filters.segment}
          onChange={(e) => updateFilter('segment', e.target.value as CustomerFiltersState['segment'])}
          width="w-full"
        >
          <option value="">All Segments</option>
          {SEGMENTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </AdminSelect>
      </div>

      {/* Acquisition Source */}
      <div className="w-[190px]">
        <label className="block text-xs font-medium text-white/50 mb-1">Source</label>
        <AdminSelect
          value={filters.acquisition_source}
          onChange={(e) => updateFilter('acquisition_source', e.target.value as CustomerFiltersState['acquisition_source'])}
          width="w-full"
        >
          <option value="">All Sources</option>
          {ACQUISITION_SOURCES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </AdminSelect>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  )
}
