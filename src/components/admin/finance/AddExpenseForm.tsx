'use client'

import { useState } from 'react'
import { Loader2, Plus, X } from 'lucide-react'
import { createTransaction } from '@/lib/admin/finance'
import type { ExpenseCategory } from '@/lib/admin/types'
import AdminSelect from '@/components/admin/AdminSelect'
import AdminDateInput from '@/components/admin/AdminDateInput'

const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'salary', label: 'Salary' },
  { value: 'bpjs', label: 'BPJS' },
  { value: 'vehicle_installment', label: 'Vehicle Installment' },
  { value: 'fuel', label: 'Fuel' },
  { value: 'vehicle_maintenance', label: 'Vehicle Maintenance' },
  { value: 'equipment_maintenance', label: 'Equipment Maintenance' },
  { value: 'chemical_restock', label: 'Chemical Restock' },
  { value: 'parking', label: 'Parking' },
  { value: 'phone_data', label: 'Phone & Data' },
  { value: 'vehicle_tax', label: 'Vehicle Tax' },
  { value: 'power_charging', label: 'Power / Charging' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'uniforms', label: 'Uniforms' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'misc', label: 'Miscellaneous' },
]

interface AddExpenseFormProps {
  onClose: () => void
  onSuccess: () => void
}

export default function AddExpenseForm({ onClose, onSuccess }: AddExpenseFormProps) {
  const [category, setCategory] = useState<ExpenseCategory>('fuel')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const amountNum = Number(amount)
    if (!amountNum || amountNum <= 0) {
      setError('Amount must be greater than 0')
      return
    }

    setSubmitting(true)
    try {
      await createTransaction({
        customer_id: null,
        job_id: null,
        subscription_id: null,
        amount: amountNum,
        type: 'expense',
        category,
        description: description || null,
        payment_method: null,
        payment_status: 'confirmed',
        notes: null,
      })
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add expense')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="border border-white/10 bg-[#171717] rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white">Add Expense</h3>
        <button onClick={onClose} className="text-white/40 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-white/50 mb-1">Category</label>
          <AdminSelect
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
          >
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </AdminSelect>
        </div>

        <div>
          <label className="block text-xs text-white/50 mb-1">Amount (Rp)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            min="0"
            className="w-full bg-[#0A0A0A] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs text-white/50 mb-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            className="w-full bg-[#0A0A0A] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
          />
        </div>

        <div>
          <label className="block text-xs text-white/50 mb-1">Date</label>
          <AdminDateInput
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="sm:col-span-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium bg-orange-500 hover:bg-orange-400 text-white transition-colors disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add Expense
          </button>
          {error && <span className="text-red-400 text-xs">{error}</span>}
        </div>
      </form>
    </div>
  )
}
