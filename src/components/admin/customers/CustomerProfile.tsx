'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { getCustomerById, getCustomerConversations, addConversation, updateCustomer } from '@/lib/admin/customers'
import {
  formatCurrency,
  formatDate,
  getNeighborhoodLabel,
  getAcquisitionSourceLabel,
} from '@/lib/admin/constants'
import type { CustomerWithStats, Conversation, ConversationChannel } from '@/lib/admin/types'
import SegmentBadge from './SegmentBadge'

interface CustomerProfileProps {
  customerId: string
}

export default function CustomerProfile({ customerId }: CustomerProfileProps) {
  const [customer, setCustomer] = useState<CustomerWithStats | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Notes editing
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [notesSaved, setNotesSaved] = useState(false)

  // Conversation form
  const [convChannel, setConvChannel] = useState<ConversationChannel>('whatsapp')
  const [convDirection, setConvDirection] = useState<'inbound' | 'outbound'>('outbound')
  const [convSummary, setConvSummary] = useState('')
  const [addingConv, setAddingConv] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [cust, convs] = await Promise.all([
        getCustomerById(customerId),
        getCustomerConversations(customerId),
      ])
      if (!cust) {
        setError('Customer not found')
        return
      }
      setCustomer(cust)
      setNotes(cust.notes ?? '')
      setConversations(convs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customer')
    } finally {
      setLoading(false)
    }
  }, [customerId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleSaveNotes() {
    if (!customer) return
    setSavingNotes(true)
    setNotesSaved(false)
    try {
      await updateCustomer(customer.id, { notes: notes.trim() || null })
      setNotesSaved(true)
      setTimeout(() => setNotesSaved(false), 2000)
    } catch {
      // silently fail, user can retry
    } finally {
      setSavingNotes(false)
    }
  }

  async function handleAddConversation(e: React.FormEvent) {
    e.preventDefault()
    if (!customer || !convSummary.trim()) return
    setAddingConv(true)
    try {
      const created = await addConversation({
        customer_id: customer.id,
        channel: convChannel,
        direction: convDirection,
        summary: convSummary.trim(),
        handled_by: null,
      })
      setConversations((prev) => [created, ...prev])
      setConvSummary('')
    } catch {
      // silently fail
    } finally {
      setAddingConv(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-white/40">Loading customer...</p>
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-red-400">{error ?? 'Customer not found'}</p>
        <Link
          href="/admin/customers"
          className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
        >
          Back to Customers
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/customers"
          className="text-sm text-white/50 hover:text-white transition-colors"
        >
          &larr; Back to Customers
        </Link>
        <Link
          href={`/admin/customers/${customer.id}/edit`}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-black hover:bg-orange-400 transition-colors"
        >
          Edit Customer
        </Link>
      </div>

      {/* Header Card */}
      <div className="rounded-lg border border-white/10 bg-[#171717] p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{customer.name}</h1>
            <p className="text-white/50 mt-1">{customer.phone}</p>
            {customer.email && (
              <p className="text-white/50 text-sm">{customer.email}</p>
            )}
          </div>
          <SegmentBadge segment={customer.segment} />
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {customer.car_model && (
            <div>
              <span className="text-white/40">Car: </span>
              <span className="text-white/80">{customer.car_model}</span>
            </div>
          )}
          {customer.plate_number && (
            <div>
              <span className="text-white/40">Plate: </span>
              <span className="text-white/80">{customer.plate_number}</span>
            </div>
          )}
          <div>
            <span className="text-white/40">Neighborhood: </span>
            <span className="text-white/80">{getNeighborhoodLabel(customer.neighborhood)}</span>
          </div>
          <div>
            <span className="text-white/40">Source: </span>
            <span className="text-white/80">{getAcquisitionSourceLabel(customer.acquisition_source)}</span>
          </div>
        </div>

        {customer.address && (
          <div className="text-sm">
            <span className="text-white/40">Address: </span>
            <span className="text-white/70">{customer.address}</span>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-[#171717] p-4 text-center">
          <p className="text-2xl font-bold text-white">{customer.total_services}</p>
          <p className="text-xs text-white/40 mt-1">Total Services</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-[#171717] p-4 text-center">
          <p className="text-2xl font-bold text-white">{formatCurrency(customer.total_spent)}</p>
          <p className="text-xs text-white/40 mt-1">Total Spent</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-[#171717] p-4 text-center">
          <p className="text-2xl font-bold text-white">{formatDate(customer.last_service_date)}</p>
          <p className="text-xs text-white/40 mt-1">Last Service</p>
        </div>
      </div>

      {/* Notes Section */}
      <div className="rounded-lg border border-white/10 bg-[#171717] p-6 space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wider text-white/50">Notes</h2>
        <textarea
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value)
            setNotesSaved(false)
          }}
          rows={4}
          placeholder="Add notes about this customer..."
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30"
        />
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveNotes}
            disabled={savingNotes}
            className="rounded-lg bg-orange-500 px-4 py-1.5 text-sm font-medium text-black hover:bg-orange-400 disabled:opacity-50 transition-colors"
          >
            {savingNotes ? 'Saving...' : 'Save Notes'}
          </button>
          {notesSaved && (
            <span className="text-sm text-green-400">Saved</span>
          )}
        </div>
      </div>

      {/* Conversation Log */}
      <div className="rounded-lg border border-white/10 bg-[#171717] p-6 space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-white/50">
          Conversations
        </h2>

        {/* Add Conversation Form */}
        <form onSubmit={handleAddConversation} className="space-y-3 border-b border-white/10 pb-4">
          <div className="flex flex-wrap gap-3">
            <select
              value={convChannel}
              onChange={(e) => setConvChannel(e.target.value as ConversationChannel)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white outline-none"
            >
              <option value="whatsapp" className="bg-[#171717]">WhatsApp</option>
              <option value="phone" className="bg-[#171717]">Phone</option>
              <option value="instagram" className="bg-[#171717]">Instagram</option>
              <option value="in_person" className="bg-[#171717]">In Person</option>
              <option value="email" className="bg-[#171717]">Email</option>
            </select>
            <select
              value={convDirection}
              onChange={(e) => setConvDirection(e.target.value as 'inbound' | 'outbound')}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white outline-none"
            >
              <option value="outbound" className="bg-[#171717]">Outbound</option>
              <option value="inbound" className="bg-[#171717]">Inbound</option>
            </select>
          </div>
          <textarea
            value={convSummary}
            onChange={(e) => setConvSummary(e.target.value)}
            rows={2}
            placeholder="Conversation summary..."
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30"
          />
          <button
            type="submit"
            disabled={addingConv || !convSummary.trim()}
            className="rounded-lg bg-white/10 px-4 py-1.5 text-sm text-white hover:bg-white/20 disabled:opacity-30 transition-colors"
          >
            {addingConv ? 'Adding...' : 'Add Conversation'}
          </button>
        </form>

        {/* Conversation List */}
        {conversations.length === 0 ? (
          <p className="text-sm text-white/30 py-4 text-center">No conversations yet.</p>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="rounded-lg border border-white/5 bg-white/5 p-3 space-y-1"
              >
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <span className="capitalize">{conv.channel.replace('_', ' ')}</span>
                  <span>&middot;</span>
                  <span>{conv.direction === 'inbound' ? 'Inbound' : 'Outbound'}</span>
                  <span>&middot;</span>
                  <span>{formatDate(conv.created_at)}</span>
                </div>
                <p className="text-sm text-white/80">{conv.summary}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
