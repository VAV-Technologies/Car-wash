'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCustomer, updateCustomer } from '@/lib/admin/customers'
import { NEIGHBORHOODS, ACQUISITION_SOURCES } from '@/lib/admin/constants'
import type { Customer } from '@/lib/admin/types'

interface CustomerFormProps {
  customer?: Customer
  onSuccess?: () => void
}

export default function CustomerForm({ customer, onSuccess }: CustomerFormProps) {
  const router = useRouter()
  const isEdit = !!customer

  const [form, setForm] = useState({
    name: customer?.name ?? '',
    phone: customer?.phone ?? '',
    email: customer?.email ?? '',
    plate_number: customer?.plate_number ?? '',
    car_model: customer?.car_model ?? '',
    neighborhood: customer?.neighborhood ?? '',
    acquisition_source: customer?.acquisition_source ?? '',
    address: customer?.address ?? '',
    notes: customer?.notes ?? '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

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
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.phone.trim()) {
      errs.phone = 'Phone is required'
    } else if (!/^\d{10,15}$/.test(form.phone.replace(/\D/g, ''))) {
      errs.phone = 'Phone must be 10-15 digits'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        plate_number: form.plate_number.trim() || null,
        car_model: form.car_model.trim() || null,
        neighborhood: (form.neighborhood || null) as Customer['neighborhood'],
        acquisition_source: (form.acquisition_source || null) as Customer['acquisition_source'],
        address: form.address.trim() || null,
        notes: form.notes.trim() || null,
        referred_by: customer?.referred_by ?? null,
      }

      if (isEdit) {
        await updateCustomer(customer.id, payload)
        if (onSuccess) onSuccess()
        router.push(`/admin/customers/${customer.id}`)
      } else {
        const created = await createCustomer(payload)
        if (onSuccess) onSuccess()
        router.push(`/admin/customers/${created.id}`)
      }
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
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Name */}
        <div>
          <label className={labelClass}>
            Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Customer name"
            className={inputClass}
          />
          {errors.name && <p className={errorClass}>{errors.name}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className={labelClass}>
            Phone <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            placeholder="08123456789"
            className={inputClass}
          />
          {errors.phone && <p className={errorClass}>{errors.phone}</p>}
        </div>

        {/* Email */}
        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="email@example.com"
            className={inputClass}
          />
        </div>

        {/* Plate Number */}
        <div>
          <label className={labelClass}>Plate Number</label>
          <input
            type="text"
            value={form.plate_number}
            onChange={(e) => updateField('plate_number', e.target.value)}
            placeholder="B 1234 ABC"
            className={inputClass}
          />
        </div>

        {/* Car Model */}
        <div>
          <label className={labelClass}>Car Model</label>
          <input
            type="text"
            value={form.car_model}
            onChange={(e) => updateField('car_model', e.target.value)}
            placeholder="Toyota Alphard"
            className={inputClass}
          />
        </div>

        {/* Neighborhood */}
        <div>
          <label className={labelClass}>Neighborhood</label>
          <select
            value={form.neighborhood}
            onChange={(e) => updateField('neighborhood', e.target.value)}
            className={inputClass}
          >
            <option value="" className="bg-[#171717]">Select neighborhood</option>
            {NEIGHBORHOODS.map((n) => (
              <option key={n.value} value={n.value} className="bg-[#171717]">
                {n.label}
              </option>
            ))}
          </select>
        </div>

        {/* Acquisition Source */}
        <div>
          <label className={labelClass}>Acquisition Source</label>
          <select
            value={form.acquisition_source}
            onChange={(e) => updateField('acquisition_source', e.target.value)}
            className={inputClass}
          >
            <option value="" className="bg-[#171717]">Select source</option>
            {ACQUISITION_SOURCES.map((s) => (
              <option key={s.value} value={s.value} className="bg-[#171717]">
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Address */}
      <div>
        <label className={labelClass}>Address</label>
        <textarea
          value={form.address}
          onChange={(e) => updateField('address', e.target.value)}
          placeholder="Full address"
          rows={2}
          className={inputClass}
        />
      </div>

      {/* Notes */}
      <div>
        <label className={labelClass}>Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => updateField('notes', e.target.value)}
          placeholder="Internal notes about this customer..."
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
          {submitting ? 'Saving...' : isEdit ? 'Update Customer' : 'Create Customer'}
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
