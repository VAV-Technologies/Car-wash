'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { createConversation } from '@/lib/admin/conversations'
import type { ConversationChannel, MessageType, PitchResult } from '@/lib/admin/types'
import AdminSelect from '@/components/admin/AdminSelect'
import AdminDateInput from '@/components/admin/AdminDateInput'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

interface CustomerOption {
  id: string
  name: string
  phone: string
}

export default function LogConversationForm({ onClose, onSuccess }: Props) {
  const [customerId, setCustomerId] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [customerOptions, setCustomerOptions] = useState<CustomerOption[]>([])
  const [showDropdown, setShowDropdown] = useState(false)

  const [channel, setChannel] = useState<ConversationChannel>('whatsapp')
  const [direction, setDirection] = useState<'inbound' | 'outbound'>('inbound')
  const [messageType, setMessageType] = useState<MessageType>('general')
  const [summary, setSummary] = useState('')
  const [followUpNeeded, setFollowUpNeeded] = useState(false)
  const [followUpDate, setFollowUpDate] = useState('')
  const [subscriptionPitched, setSubscriptionPitched] = useState(false)
  const [pitchResult, setPitchResult] = useState<PitchResult | ''>('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function searchCustomers(query: string) {
    setCustomerSearch(query)
    setCustomerId('')
    if (query.length < 2) {
      setCustomerOptions([])
      setShowDropdown(false)
      return
    }

    const { data } = await supabase
      .from('customers')
      .select('id, name, phone')
      .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
      .limit(10)

    const options = (data ?? []) as CustomerOption[]
    setCustomerOptions(options)
    setShowDropdown(options.length > 0)
  }

  function selectCustomer(customer: CustomerOption) {
    setCustomerId(customer.id)
    setCustomerSearch(`${customer.name} (${customer.phone})`)
    setShowDropdown(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!customerId) {
      setError('Please select a customer')
      return
    }
    if (!summary.trim()) {
      setError('Please enter a summary')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      await createConversation({
        customer_id: customerId,
        channel,
        direction,
        message_type: messageType,
        summary: summary.trim(),
        follow_up_due_at: followUpNeeded && followUpDate ? `${followUpDate}T09:00:00` : null,
        follow_up_completed: false,
        subscription_pitched: subscriptionPitched,
        pitch_result: subscriptionPitched && pitchResult ? pitchResult : null,
      })
      onSuccess()
    } catch {
      setError('Failed to log conversation')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-[#171717] border border-white/10 rounded-lg p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium">Log Conversation</h3>
        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer Search */}
        <div className="relative">
          <label className="block text-white/50 text-xs uppercase tracking-wider mb-1">Customer</label>
          <input
            type="text"
            value={customerSearch}
            onChange={(e) => searchCustomers(e.target.value)}
            onFocus={() => customerOptions.length > 0 && setShowDropdown(true)}
            placeholder="Search by name or phone..."
            className="w-full bg-[#0A0A0A] border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500"
          />
          {showDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-[#171717] border border-white/10 rounded-md shadow-lg max-h-48 overflow-y-auto">
              {customerOptions.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => selectCustomer(c)}
                  className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                >
                  <span className="font-medium">{c.name}</span>
                  <span className="text-white/40 ml-2">{c.phone}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Row: Channel + Direction + Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-white/50 text-xs uppercase tracking-wider mb-1">Channel</label>
            <AdminSelect
              value={channel}
              onChange={(e) => setChannel(e.target.value as ConversationChannel)}
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="phone">Phone</option>
              <option value="instagram">Instagram</option>
              <option value="in_person">In Person</option>
              <option value="email">Email</option>
            </AdminSelect>
          </div>

          <div>
            <label className="block text-white/50 text-xs uppercase tracking-wider mb-1">Direction</label>
            <AdminSelect
              value={direction}
              onChange={(e) => setDirection(e.target.value as 'inbound' | 'outbound')}
            >
              <option value="inbound">Inbound</option>
              <option value="outbound">Outbound</option>
            </AdminSelect>
          </div>

          <div>
            <label className="block text-white/50 text-xs uppercase tracking-wider mb-1">Message Type</label>
            <AdminSelect
              value={messageType}
              onChange={(e) => setMessageType(e.target.value as MessageType)}
            >
              <option value="general">General</option>
              <option value="booking_request">Booking Request</option>
              <option value="follow_up">Follow Up</option>
              <option value="subscription_pitch">Subscription Pitch</option>
              <option value="complaint">Complaint</option>
              <option value="referral_ask">Referral Ask</option>
              <option value="reengagement">Re-engagement</option>
              <option value="receipt">Receipt</option>
            </AdminSelect>
          </div>
        </div>

        {/* Summary */}
        <div>
          <label className="block text-white/50 text-xs uppercase tracking-wider mb-1">Content / Summary</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            placeholder="Describe the conversation..."
            className="w-full bg-[#0A0A0A] border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500 resize-none"
          />
        </div>

        {/* Follow-up */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={followUpNeeded}
              onChange={(e) => setFollowUpNeeded(e.target.checked)}
              className="rounded border-white/20 bg-[#0A0A0A] text-orange-500 focus:ring-orange-500"
            />
            <span className="text-white/70 text-sm">Follow-up needed</span>
          </label>
          {followUpNeeded && (
            <AdminDateInput
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
            />
          )}
        </div>

        {/* Subscription Pitch */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={subscriptionPitched}
              onChange={(e) => setSubscriptionPitched(e.target.checked)}
              className="rounded border-white/20 bg-[#0A0A0A] text-orange-500 focus:ring-orange-500"
            />
            <span className="text-white/70 text-sm">Subscription pitched</span>
          </label>
          {subscriptionPitched && (
            <AdminSelect
              value={pitchResult}
              onChange={(e) => setPitchResult(e.target.value as PitchResult | '')}
            >
              <option value="">Select result...</option>
              <option value="converted">Converted</option>
              <option value="declined">Declined</option>
              <option value="thinking">Thinking</option>
            </AdminSelect>
          )}
        </div>

        {/* Error */}
        {error && <p className="text-red-400 text-sm">{error}</p>}

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-orange-500 hover:bg-orange-400 text-white disabled:opacity-50 transition-colors"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Conversation
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
