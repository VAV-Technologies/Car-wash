'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table'
import { getCustomers } from '@/lib/admin/customers'
import { formatCurrency, formatDate, getNeighborhoodLabel } from '@/lib/admin/constants'
import type { CustomerWithStats, CustomerFiltersState } from '@/lib/admin/types'
import CustomerFilters from './CustomerFilters'
import SegmentBadge from './SegmentBadge'

const columnHelper = createColumnHelper<CustomerWithStats>()

const PAGE_SIZE = 25

export default function CustomersTable() {
  const [data, setData] = useState<CustomerWithStats[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'created_at', desc: true },
  ])
  const [filters, setFilters] = useState<CustomerFiltersState>({
    search: '',
    neighborhood: '',
    segment: '',
    acquisition_source: '',
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const sortCol = sorting[0]
      const result = await getCustomers({
        page,
        limit: PAGE_SIZE,
        search: filters.search,
        neighborhood: filters.neighborhood || '',
        segment: filters.segment || '',
        acquisition_source: filters.acquisition_source || '',
        sort_by: sortCol?.id ?? 'created_at',
        sort_dir: sortCol?.desc ? 'desc' : 'asc',
      })
      setData(result.data)
      setTotalCount(result.count)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customers')
    } finally {
      setLoading(false)
    }
  }, [page, sorting, filters])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [filters, sorting])

  const columns = [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: (info) => (
        <Link
          href={`/admin/customers/${info.row.original.id}`}
          className="font-medium text-white hover:text-orange-400 transition-colors"
        >
          {info.getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor('phone', {
      header: 'Phone',
      cell: (info) => (
        <span className="text-white/70">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('neighborhood', {
      header: 'Neighborhood',
      cell: (info) => (
        <span className="text-white/70">{getNeighborhoodLabel(info.getValue())}</span>
      ),
    }),
    columnHelper.accessor('total_services', {
      header: 'Services',
      cell: (info) => (
        <span className="text-white/70">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('total_spent', {
      header: 'Total Spent',
      cell: (info) => (
        <span className="text-white/70">{formatCurrency(info.getValue())}</span>
      ),
    }),
    columnHelper.accessor('last_service_date', {
      header: 'Last Service',
      cell: (info) => (
        <span className="text-white/70">{formatDate(info.getValue())}</span>
      ),
    }),
    columnHelper.accessor('segment', {
      header: 'Segment',
      cell: (info) => <SegmentBadge segment={info.getValue()} />,
    }),
  ]

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    pageCount: Math.ceil(totalCount / PAGE_SIZE),
  })

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-sm text-white/50 mt-1">
            {totalCount} customer{totalCount !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link
          href="/admin/customers/new"
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-black hover:bg-orange-400 transition-colors"
        >
          Add Customer
        </Link>
      </div>

      {/* Filters */}
      <CustomerFilters filters={filters} onFiltersChange={setFilters} />

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-white/10 bg-[#171717]">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-white/10">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50 cursor-pointer hover:text-white/80 select-none"
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: ' \u2191',
                        desc: ' \u2193',
                      }[header.column.getIsSorted() as string] ?? ''}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-white/40">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-red-400">
                  {error}
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-white/40">
                  No customers found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-white/40">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
