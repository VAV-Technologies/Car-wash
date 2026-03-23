'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Search } from 'lucide-react'
import { createSubscription } from '@/lib/admin/subscriptions'
import { getCustomers } from '@/lib/admin/customers'
import { formatCurrency, SUBSCRIPTION_TIERS_V2 } from '@/lib/admin/constants'
import type { CustomerWithStats, SubscriptionTier } from '@/lib/admin/types'

interface SubscriptionFormProps {
  onClose: () => void
  onCreated: () => void
}

export default function SubscriptionForm({ onClose, onCreated }: SubscriptionFormProps) {
  const [customerId, setCustomerId] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [customers, setCustomers] = useState<CustomerWithStats[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [tier, setTier] = useState<SubscriptionTier>('essentials')
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0])
  const [paymentMethod, setPaymentMethod] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tierConfig = SUBSCRIPTION_TIERS_V2.find((t) => t.value === tier)

  // Auto-calculate renewal date (+1 month)
  const renewalDate = (() => {
    const d = new Date(startDate)
    d.setMonth(d.getMonth() + 1)
    return d.toISOString().split('T')[0]
  })()

  // Customer search
  useEffect(() => {
    if (customerSearch.length < 2) {
      setCustomers([])
      return
    }

    const timeout = setTimeout(async () => {
      try {
        const result = await getCustomers({ search: customerSearch, limit: 10 })
        setCustomers(result.data)
        setShowDropdown(true)
      } catch {
        // silent
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [customerSearch])

  const handleSelectCustomer = (c: CustomerWithStats) => {
    setCustomerId(c.id)
    setCustomerSearch(c.name)
    setShowDropdown(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerId) {
      setError('Please select a customer')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await createSubscription({
        customer_id: customerId,
        tier,
        start_date: startDate,
        end_date: renewalDate,
        payment_method: paymentMethod || undefined,
        notes: notes || undefined,
      })
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create subscription')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-white/10 bg-[#171717] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">New Subscription</h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Search */}
          <div className="relative">
            <label className="block text-sm font-medium text-white/60 mb-1">Customer</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value)
                  setCustomerId('')
                }}
                placeholder="Search by name or phone..."
                className="w-full rounded-lg border border-white/10 bg-[#0A0A0A] pl-10 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50"
              />
            </div>
            {showDropdown && customers.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border-white/10 bg-[#0A0A0A] shadow-xl max-h-48 overflow-y-auto">
                {customers.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectCustomer(c)}
                    className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/5 transition-colors"
                  >
                    <span className="font-medium">{c.name}</span>
                    <span className="text-white/40 ml-2">{c.phone}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tier Select */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1">Tier</label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value as SubscriptionTier)}
              className="w-full rounded-lg border border-white/10 bg-[#0A0A0A] px-4 py-2 text-sm text-white focus:outline-none focus:border-orange-500/50"
            >
              {SUBSCRIPTION_TIERS_V2.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label} - {formatCurrency(t.price)}/mo ({t.washType})
                </option>
              ))}
            </select>
          </div>

          {/* Auto-filled Price & Washes */}
          {tierConfig && (
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-white/10 bg-[#0A0A0A] p-3">
                <p className="text-xs text-white/40 mb-1">Monthly Price</p>
                <p className="text-sm font-semibold text-white">{formatCurrency(tierConfig.price)}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-[#0A0A0A] p-3">
                <p className="text-xs text-white/40 mb-1">Washes/Month</p>
                <p className="text-sm font-semibold text-white">{tierConfig.washesPerMonth}</p>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#0A0A0A] px-4 py-2 text-sm text-white focus:outline-none focus:border-orange-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">Renewal Date</label>
              <input
                type="date"
                value={renewalDate}
                readOnly
                className="w-full rounded-lg border border-white/10 bg-[#0A0A0A] px-4 py-2 text-sm text-white/50 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0A0A0A] px-4 py-2 text-sm text-white focus:outline-none focus:border-orange-500/50"
            >
              <option value="">Select...</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="qris">QRIS</option>
              <option value="credit_card">Credit Card</option>
              <option value="cash">Cash</option>
              <option value="gopay">GoPay</option>
              <option value="ovo">OVO</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Optional notes..."
              className="w-full rounded-lg border border-white/10 bg-[#0A0A0A] px-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !customerId}
              className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-black hover:bg-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Subscription
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
