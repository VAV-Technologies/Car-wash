'use client'

import { useEffect, useState, useCallback } from 'react'
import { Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import { getPendingPayments, confirmPayment, markPaymentFailed } from '@/lib/admin/finance'
import { formatCurrency, formatDate, SERVICE_TYPES } from '@/lib/admin/constants'
import type { TransactionWithCustomer } from '@/lib/admin/types'

function timeSince(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 1) return `${Math.floor(diff / (1000 * 60))}m ago`
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function getCategoryLabel(category: string | null): string {
  if (!category) return '-'
  const found = SERVICE_TYPES.find((s) => s.value === category)
  return found?.label ?? category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function PaymentQueue() {
  const [pending, setPending] = useState<TransactionWithCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ id: string; type: 'success' | 'error'; message: string } | null>(null)

  const loadPending = useCallback(async () => {
    try {
      const data = await getPendingPayments()
      setPending(data)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPending()
  }, [loadPending])

  const handleConfirm = async (id: string) => {
    setActionLoading(id)
    setFeedback(null)
    try {
      await confirmPayment(id, 'admin')
      setFeedback({ id, type: 'success', message: 'Payment confirmed' })
      setPending((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      setFeedback({ id, type: 'error', message: err instanceof Error ? err.message : 'Failed to confirm' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleFailed = async (id: string) => {
    setActionLoading(id)
    setFeedback(null)
    try {
      await markPaymentFailed(id)
      setFeedback({ id, type: 'success', message: 'Marked as failed' })
      setPending((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      setFeedback({ id, type: 'error', message: err instanceof Error ? err.message : 'Failed to update' })
    } finally {
      setActionLoading(null)
    }
  }

  const totalPending = pending.reduce((sum, t) => sum + t.amount, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/40">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading pending payments...
      </div>
    )
  }

  return (
    <div>
      {/* Header with total */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-white">Pending Payments</h2>
          {pending.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400">
              {pending.length} pending &middot; {formatCurrency(totalPending)}
            </span>
          )}
        </div>
      </div>

      {pending.length === 0 ? (
        <div className="text-center py-16 text-white/40">
          <CheckCircle className="h-10 w-10 mx-auto mb-3 text-green-500/50" />
          <p>All payments are confirmed. No pending items.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pending.map((txn) => (
            <div
              key={txn.id}
              className="border border-white/10 bg-[#171717] rounded-lg p-4 flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-medium truncate">
                    {txn.customer_name ?? 'Unknown Customer'}
                  </span>
                  <span className="text-white/30 text-xs">
                    {getCategoryLabel(txn.category)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-white/40">
                  <span>{formatDate(txn.created_at)}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {timeSince(txn.created_at)}
                  </span>
                </div>
              </div>

              <div className="text-right mr-4">
                <span className="text-white font-semibold text-lg">
                  {formatCurrency(txn.amount)}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {feedback?.id === txn.id && (
                  <span
                    className={`text-xs ${
                      feedback.type === 'success' ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {feedback.message}
                  </span>
                )}
                <button
                  onClick={() => handleConfirm(txn.id)}
                  disabled={actionLoading === txn.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-green-600 hover:bg-green-500 text-white transition-colors disabled:opacity-50"
                >
                  {actionLoading === txn.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <CheckCircle className="h-3 w-3" />
                  )}
                  Confirm
                </button>
                <button
                  onClick={() => handleFailed(txn.id)}
                  disabled={actionLoading === txn.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-red-600/20 hover:bg-red-600/40 text-red-400 transition-colors disabled:opacity-50"
                >
                  <XCircle className="h-3 w-3" />
                  Failed
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {feedback && !pending.find((t) => t.id === feedback.id) && (
        <div
          className={`mt-3 flex items-center gap-2 text-sm ${
            feedback.type === 'success' ? 'text-green-400' : 'text-red-400'
          }`}
        >
          <AlertCircle className="h-4 w-4" />
          {feedback.message}
        </div>
      )}
    </div>
  )
}
