'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Loader2, Plus, AlertTriangle, Trash2 } from 'lucide-react'
import { getSubscriptions, deleteSubscription } from '@/lib/admin/subscriptions'
import { formatCurrency, formatDate, getTierConfig, SUBSCRIPTION_TIERS_V2 } from '@/lib/admin/constants'
import type { SubscriptionWithCustomer, SubscriptionTier } from '@/lib/admin/types'
import AdminSelect from '@/components/admin/AdminSelect'
import SubscriptionForm from './SubscriptionForm'

const PAGE_SIZE = 25

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'expired', label: 'Expired' },
]

function TierBadge({ tier }: { tier: string }) {
  const config = getTierConfig(tier)
  if (!config) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white/60">
        {tier}
      </span>
    )
  }
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgClass} ${config.textClass}`}
    >
      {config.label}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'bg-green-500/20 text-green-400',
    paused: 'bg-yellow-500/20 text-yellow-400',
    cancelled: 'bg-red-500/20 text-red-400',
    expired: 'bg-white/10 text-white/40',
  }
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] ?? 'bg-white/10 text-white/40'}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

export default function SubscriberList() {
  const [data, setData] = useState<SubscriptionWithCustomer[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [tierFilter, setTierFilter] = useState<string>('')
  const [showForm, setShowForm] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getSubscriptions({
        page,
        limit: PAGE_SIZE,
        status: statusFilter as 'active' | 'paused' | 'cancelled' | 'expired' | '',
        tier: tierFilter as SubscriptionTier | '',
      })
      setData(result.data)
      setTotalCount(result.count)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscriptions')
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, tierFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    setPage(1)
  }, [statusFilter, tierFilter])

  async function handleDeleteSubscription(id: string) {
    if (!confirm('Delete this subscription? This cannot be undone.')) return
    try {
      await deleteSubscription(id)
      fetchData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete subscription')
    }
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/50 mt-1">
            {totalCount} subscriber{totalCount !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-black hover:bg-orange-400 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Subscription
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <SubscriptionForm
          onClose={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false)
            fetchData()
          }}
        />
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <AdminSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          width="w-[170px]"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </AdminSelect>

        <AdminSelect
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          width="w-[170px]"
        >
          <option value="">All Tiers</option>
          {SUBSCRIPTION_TIERS_V2.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </AdminSelect>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-white/10 bg-[#171717]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">
                Tier
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">
                Washes
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">
                Monthly Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">
                Renewal Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">
                Risk
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-white/50 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-white/40">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-red-400">
                  {error}
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-white/40">
                  No subscriptions found.
                </td>
              </tr>
            ) : (
              data.map((sub) => {
                const isChurnRisk =
                  sub.status === 'active' &&
                  ((sub.last_service_date &&
                    Date.now() - new Date(sub.last_service_date).getTime() > 14 * 24 * 60 * 60 * 1000) ||
                    (sub.washes_allocated > 0 && sub.washes_used_this_month < sub.washes_allocated * 0.5))

                return (
                  <tr
                    key={sub.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/customers/${sub.customer_id}`}
                        className="font-medium text-white hover:text-orange-400 transition-colors"
                      >
                        {sub.customer_name}
                      </Link>
                      <p className="text-xs text-white/40">{sub.customer_phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <TierBadge tier={sub.tier} />
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      {sub.washes_used_this_month}/{sub.washes_allocated}
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      {formatCurrency(sub.monthly_price)}
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      {formatDate(sub.renewal_date)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="px-4 py-3">
                      {isChurnRisk && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                          <AlertTriangle className="h-3 w-3" />
                          At Risk
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDeleteSubscription(sub.id)}
                        className="text-white/20 hover:text-red-400 p-1 transition-colors"
                        title="Delete subscription"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )
              })
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
