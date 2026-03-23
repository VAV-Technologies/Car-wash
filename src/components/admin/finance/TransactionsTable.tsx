'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  Trash2,
} from 'lucide-react'
import { getTransactions, deleteTransaction } from '@/lib/admin/finance'
import { formatCurrency, formatDate, SERVICE_TYPES } from '@/lib/admin/constants'
import type { TransactionWithCustomer, TransactionType, PaymentStatus } from '@/lib/admin/types'
import AdminSelect from '@/components/admin/AdminSelect'
import AdminDateInput from '@/components/admin/AdminDateInput'
import AddExpenseForm from './AddExpenseForm'

function getCategoryLabel(category: string | null): string {
  if (!category) return '-'
  const found = SERVICE_TYPES.find((s) => s.value === category)
  return found?.label ?? category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const styles: Record<PaymentStatus, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    confirmed: 'bg-green-500/20 text-green-400',
    failed: 'bg-red-500/20 text-red-400',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  )
}

function TypeBadge({ type }: { type: TransactionType }) {
  const isRevenue = type === 'revenue' || type === 'service_payment' || type === 'subscription_payment' || type === 'tip'
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        isRevenue ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
      }`}
    >
      {isRevenue ? (
        <ArrowUpCircle className="h-3 w-3" />
      ) : (
        <ArrowDownCircle className="h-3 w-3" />
      )}
      {type === 'revenue' ? 'Revenue' : type === 'expense' ? 'Expense' : type.replace(/_/g, ' ')}
    </span>
  )
}

const LIMIT = 25

export default function TransactionsTable() {
  const [transactions, setTransactions] = useState<TransactionWithCustomer[]>([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showExpenseForm, setShowExpenseForm] = useState(false)

  // Filters
  const [filterType, setFilterType] = useState<TransactionType | ''>('')
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | ''>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getTransactions({
        page,
        limit: LIMIT,
        type: filterType || undefined,
        payment_status: filterStatus || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      })
      setTransactions(result.data)
      setCount(result.count)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [page, filterType, filterStatus, dateFrom, dateTo])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [filterType, filterStatus, dateFrom, dateTo])

  async function handleDeleteTransaction(id: string) {
    if (!confirm('Delete this transaction? This cannot be undone.')) return
    try {
      await deleteTransaction(id)
      loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete transaction')
    }
  }

  const totalPages = Math.ceil(count / LIMIT)

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <AdminSelect
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as TransactionType | '')}
        >
          <option value="">All Types</option>
          <option value="revenue">Revenue</option>
          <option value="expense">Expense</option>
        </AdminSelect>

        <AdminSelect
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as PaymentStatus | '')}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="failed">Failed</option>
        </AdminSelect>

        <AdminDateInput
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          placeholder="From"
        />
        <span className="text-white/30 text-sm">to</span>
        <AdminDateInput
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          placeholder="To"
        />

        <div className="ml-auto">
          <button
            onClick={() => setShowExpenseForm(!showExpenseForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-orange-500 hover:bg-orange-400 text-white transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Add Expense Form */}
      {showExpenseForm && (
        <AddExpenseForm
          onClose={() => setShowExpenseForm(false)}
          onSuccess={loadData}
        />
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-white/40">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Loading transactions...
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-16 text-white/40">
          No transactions found.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/50 text-xs uppercase">
                  <th className="text-left py-2 px-3 font-medium">Date</th>
                  <th className="text-left py-2 px-3 font-medium">Type</th>
                  <th className="text-left py-2 px-3 font-medium">Category</th>
                  <th className="text-right py-2 px-3 font-medium">Amount</th>
                  <th className="text-left py-2 px-3 font-medium">Status</th>
                  <th className="text-left py-2 px-3 font-medium">Customer</th>
                  <th className="text-left py-2 px-3 font-medium">Description</th>
                  <th className="py-2 px-3 font-medium w-10"></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr
                    key={txn.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-2.5 px-3 text-white/70">
                      {formatDate(txn.created_at)}
                    </td>
                    <td className="py-2.5 px-3">
                      <TypeBadge type={txn.type} />
                    </td>
                    <td className="py-2.5 px-3 text-white/70">
                      {getCategoryLabel(txn.category)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-white">
                      {formatCurrency(txn.amount)}
                    </td>
                    <td className="py-2.5 px-3">
                      <PaymentStatusBadge status={txn.payment_status} />
                    </td>
                    <td className="py-2.5 px-3 text-white/70">
                      {txn.customer_name ?? '-'}
                    </td>
                    <td className="py-2.5 px-3 text-white/50 max-w-[200px] truncate">
                      {txn.description ?? txn.notes ?? '-'}
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => handleDeleteTransaction(txn.id)}
                        className="text-white/20 hover:text-red-400 p-1 transition-colors"
                        title="Delete transaction"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
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
