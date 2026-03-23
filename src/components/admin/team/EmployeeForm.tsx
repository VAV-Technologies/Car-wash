'use client'

import { useState } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { createEmployee, updateEmployee } from '@/lib/admin/team'
import type { EmployeeExtended, EmployeeStatus, EmployeeRole } from '@/lib/admin/types'

interface EmployeeFormProps {
  employee?: EmployeeExtended
  onClose: () => void
}

export default function EmployeeForm({ employee, onClose }: EmployeeFormProps) {
  const isEdit = !!employee

  const [name, setName] = useState(employee?.name ?? '')
  const [phone, setPhone] = useState(employee?.phone ?? '')
  const [email, setEmail] = useState(employee?.email ?? '')
  const [role, setRole] = useState<EmployeeRole | 'ops_manager'>(
    (employee?.role as EmployeeRole | 'ops_manager') ?? 'washer'
  )
  const [hireDate, setHireDate] = useState(employee?.hire_date ?? '')
  const [baseSalary, setBaseSalary] = useState(employee?.base_salary ?? 6_600_000)
  const [status, setStatus] = useState<EmployeeStatus>(employee?.status ?? 'active')
  const [notes, setNotes] = useState(employee?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) {
      setError('Name and phone are required.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        role: role as EmployeeRole,
        hire_date: hireDate || null,
        base_salary: baseSalary,
        status,
        notes: notes.trim() || null,
        is_active: status === 'active',
      }

      if (isEdit && employee) {
        await updateEmployee(employee.id, payload)
      } else {
        await createEmployee(payload as Omit<EmployeeExtended, 'id' | 'created_at' | 'updated_at'>)
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save employee')
    } finally {
      setSaving(false)
    }
  }

  const inputClasses =
    'w-full rounded-lg border border-white/10 bg-[#0A0A0A] px-3 py-2 text-sm text-white placeholder-white/30 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500'

  return (
    <div className="space-y-6">
      <button
        onClick={onClose}
        className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to list
      </button>

      <div className="rounded-lg border border-white/10 bg-[#171717] p-6 max-w-2xl">
        <h2 className="text-lg font-bold text-white mb-6">
          {isEdit ? 'Edit Employee' : 'Add Employee'}
        </h2>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-1.5">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClasses}
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">
                Phone <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClasses}
                placeholder="+62..."
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClasses}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as EmployeeRole)}
                className={inputClasses}
              >
                <option value="washer">Washer</option>
                <option value="detailer">Detailer</option>
                <option value="ops_manager">Ops Manager</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Hire Date</label>
              <input
                type="date"
                value={hireDate}
                onChange={(e) => setHireDate(e.target.value)}
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Base Salary</label>
              <input
                type="number"
                value={baseSalary}
                onChange={(e) => setBaseSalary(Number(e.target.value))}
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EmployeeStatus)}
                className={inputClasses}
              >
                <option value="active">Active</option>
                <option value="on_leave">On Leave</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/40 mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`${inputClasses} h-20 resize-none`}
              placeholder="Any additional notes..."
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? 'Update Employee' : 'Create Employee'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 px-5 py-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
