'use client'

import { useEffect, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { getInvoices, type InvoiceRow } from '@/lib/admin/invoicing'
import { formatCurrency, formatDate, SERVICE_TYPES } from '@/lib/admin/constants'
import type { PaymentStatus } from '@/lib/admin/types'
import AdminSelect from '@/components/admin/AdminSelect'
import AdminDateInput from '@/components/admin/AdminDateInput'
import InvoiceDetail from './InvoiceDetail'

function getCategoryLabel(category: string | null): string {
  if (!category) return '-'
  const found = SERVICE_TYPES.find((s) => s.value === category)
  return found?.label ?? category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    confirmed: 'bg-green-500/20 text-green-400',
    failed: 'bg-red-500/20 text-red-400',
    refunded: 'bg-gray-500/20 text-gray-400',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] ?? styles.pending}`}>
      {status}
    </span>
  )
}

function PaymentMethodBadge({ method }: { method: string | null }) {
  if (!method) return <span className="text-white/40">-</span>
  const label = method === 'bank_transfer' ? 'Bank Transfer' : method.toUpperCase()
  return <span className="text-white/60 text-xs">{label}</span>
}

const LIMIT = 25

export default function InvoiceList() {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Filters
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | ''>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getInvoices({
        page,
        limit: LIMIT,
        payment_status: filterStatus || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      })
      // Client-side customer name filter
      let filtered = result.data
      if (customerSearch.trim()) {
        const q = customerSearch.toLowerCase()
        filtered = filtered.filter(
          (inv) =>
            inv.customer_name?.toLowerCase().includes(q) ||
            inv.customer_phone?.includes(q)
        )
      }
      setInvoices(filtered)
      setCount(customerSearch.trim() ? filtered.length : result.count)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [page, filterStatus, dateFrom, dateTo, customerSearch])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    setPage(1)
  }, [filterStatus, dateFrom, dateTo, customerSearch])

  const totalPages = Math.ceil(count / LIMIT)

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <AdminSelect
          width="w-[170px]"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as PaymentStatus | '')}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </AdminSelect>

        <div className="w-[170px]">
          <AdminDateInput
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <span className="text-white/30 text-sm">to</span>
        <div className="w-[170px]">
          <AdminDateInput
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        <input
          type="text"
          value={customerSearch}
          onChange={(e) => setCustomerSearch(e.target.value)}
          placeholder="Search customer..."
          className="bg-[#0A0A0A] border border-white/10 rounded-md px-3 py-1.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-white/40">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Loading invoices...
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-16 text-white/40">
          No invoices found.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/50 text-xs uppercase">
                  <th className="text-left py-2 px-3 font-medium w-8"></th>
                  <th className="text-left py-2 px-3 font-medium">Invoice #</th>
                  <th className="text-left py-2 px-3 font-medium">Date</th>
                  <th className="text-left py-2 px-3 font-medium">Customer</th>
                  <th className="text-left py-2 px-3 font-medium">Service</th>
                  <th className="text-right py-2 px-3 font-medium">Amount</th>
                  <th className="text-left py-2 px-3 font-medium">Status</th>
                  <th className="text-left py-2 px-3 font-medium">Method</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <>
                    <tr
                      key={inv.id}
                      onClick={() => setExpandedId(expandedId === inv.id ? null : inv.id)}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <td className="py-2.5 px-3 text-white/40">
                        {expandedId === inv.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-orange-400 font-mono text-xs">
                        {inv.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="py-2.5 px-3 text-white/70">
                        {formatDate(inv.created_at)}
                      </td>
                      <td className="py-2.5 px-3 text-white">
                        {inv.customer_name ?? '-'}
                      </td>
                      <td className="py-2.5 px-3 text-white/70">
                        {getCategoryLabel(inv.category)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-white">
                        {formatCurrency(inv.amount)}
                      </td>
                      <td className="py-2.5 px-3">
                        <PaymentStatusBadge status={inv.payment_status} />
                      </td>
                      <td className="py-2.5 px-3">
                        <PaymentMethodBadge method={inv.payment_method} />
                      </td>
                    </tr>
                    {expandedId === inv.id && (
                      <tr key={`${inv.id}-detail`} className="border-b border-white/5">
                        <td colSpan={8} className="p-4 bg-[#0A0A0A]">
                          <InvoiceDetail invoice={inv} />
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-white/50">
              <span>
                Page {page} of {totalPages} ({count} total)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
