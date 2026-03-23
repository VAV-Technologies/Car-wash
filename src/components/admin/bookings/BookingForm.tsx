'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createBooking, searchCustomers, getWashers } from '@/lib/admin/bookings'
import { SERVICE_TYPES } from '@/lib/admin/constants'
import type { ServiceType, BookingStatus } from '@/lib/admin/types'
import AdminSelect from '@/components/admin/AdminSelect'
import AdminDateInput from '@/components/admin/AdminDateInput'

interface CustomerResult {
  id: string
  name: string
  phone: string
  car_model: string | null
  plate_number: string | null
}

export default function BookingForm() {
  const router = useRouter()

  const [form, setForm] = useState({
    customer_id: '',
    service_type: '' as ServiceType | '',
    scheduled_date: '',
    scheduled_time: '',
    notes: '',
  })

  const [customerSearch, setCustomerSearch] = useState('')
  const [customerResults, setCustomerResults] = useState<CustomerResult[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerResult | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [washers, setWashers] = useState<{ id: string; name: string }[]>([])
  const [selectedWasherId, setSelectedWasherId] = useState('')

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    getWashers().then(setWashers).catch(() => {})
  }, [])

  // Customer search with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    if (!customerSearch.trim() || selectedCustomer) {
      setCustomerResults([])
      return
    }
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchCustomers(customerSearch)
        setCustomerResults(results)
        setShowDropdown(true)
      } catch {
        setCustomerResults([])
      }
    }, 300)
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [customerSearch, selectedCustomer])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function selectCustomer(c: CustomerResult) {
    setSelectedCustomer(c)
    setCustomerSearch(c.name)
    setForm((f) => ({ ...f, customer_id: c.id }))
    setShowDropdown(false)
    if (errors.customer_id) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next.customer_id
        return next
      })
    }
  }

  function clearCustomer() {
    setSelectedCustomer(null)
    setCustomerSearch('')
    setForm((f) => ({ ...f, customer_id: '' }))
  }

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!form.customer_id) errs.customer_id = 'Please select a customer'
    if (!form.service_type) errs.service_type = 'Service type is required'
    if (!form.scheduled_date) errs.scheduled_date = 'Date is required'
    if (!form.scheduled_time) errs.scheduled_time = 'Time is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      await createBooking({
        customer_id: form.customer_id,
        service_type: form.service_type as ServiceType,
        scheduled_date: form.scheduled_date,
        scheduled_time: form.scheduled_time,
        status: 'pending' as BookingStatus,
        notes: form.notes.trim() || null,
      })
      router.push('/admin/bookings')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30'
  const labelClass = 'block text-sm font-medium text-white/70 mb-1'
  const errorClass = 'text-xs text-red-400 mt-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Search */}
      <div ref={dropdownRef} className="relative">
        <label className={labelClass}>
          Customer <span className="text-red-400">*</span>
        </label>
        {selectedCustomer ? (
          <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{selectedCustomer.name}</p>
              <p className="text-xs text-white/50">
                {selectedCustomer.phone}
                {selectedCustomer.car_model && ` — ${selectedCustomer.car_model}`}
                {selectedCustomer.plate_number && ` (${selectedCustomer.plate_number})`}
              </p>
            </div>
            <button
              type="button"
              onClick={clearCustomer}
              className="text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              Change
            </button>
          </div>
        ) : (
          <input
            type="text"
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            onFocus={() => customerResults.length > 0 && setShowDropdown(true)}
            placeholder="Search by name or phone..."
            className={inputClass}
          />
        )}
        {showDropdown && customerResults.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-lg border border-white/10 bg-[#171717] shadow-xl max-h-60 overflow-y-auto">
            {customerResults.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => selectCustomer(c)}
                className="w-full px-3 py-2 text-left hover:bg-white/5 transition-colors"
              >
                <p className="text-sm font-medium text-white">{c.name}</p>
                <p className="text-xs text-white/50">
                  {c.phone}
                  {c.car_model && ` — ${c.car_model}`}
                  {c.plate_number && ` (${c.plate_number})`}
                </p>
              </button>
            ))}
          </div>
        )}
        {errors.customer_id && <p className={errorClass}>{errors.customer_id}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Service Type */}
        <div>
          <label className={labelClass}>
            Service Type <span className="text-red-400">*</span>
          </label>
          <AdminSelect
            value={form.service_type}
            onChange={(e) => updateField('service_type', e.target.value)}
          >
            <option value="">Select service</option>
            {SERVICE_TYPES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </AdminSelect>
          {errors.service_type && <p className={errorClass}>{errors.service_type}</p>}
        </div>

        {/* Washer Assignment */}
        <div>
          <label className={labelClass}>Assign Washer</label>
          <AdminSelect
            value={selectedWasherId}
            onChange={(e) => setSelectedWasherId(e.target.value)}
          >
            <option value="">Assign later</option>
            {washers.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </AdminSelect>
        </div>

        {/* Date */}
        <div>
          <label className={labelClass}>
            Date <span className="text-red-400">*</span>
          </label>
          <AdminDateInput
            value={form.scheduled_date}
            onChange={(e) => updateField('scheduled_date', e.target.value)}
          />
          {errors.scheduled_date && <p className={errorClass}>{errors.scheduled_date}</p>}
        </div>

        {/* Time */}
        <div>
          <label className={labelClass}>
            Time <span className="text-red-400">*</span>
          </label>
          <input
            type="time"
            value={form.scheduled_time}
            onChange={(e) => updateField('scheduled_time', e.target.value)}
            className={inputClass}
          />
          {errors.scheduled_time && <p className={errorClass}>{errors.scheduled_time}</p>}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className={labelClass}>Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => updateField('notes', e.target.value)}
          placeholder="Booking notes, special requests, etc."
          rows={3}
          className={inputClass}
        />
      </div>

      {/* Submit Error */}
      {submitError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {submitError}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-orange-500 px-6 py-2 text-sm font-medium text-black hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Creating...' : 'Create Booking'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 hover:bg-white/10 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
