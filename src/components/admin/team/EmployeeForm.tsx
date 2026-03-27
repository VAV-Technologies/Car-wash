'use client'

import { useState } from 'react'
import { ArrowLeft, Loader2, Copy, CheckCircle2 } from 'lucide-react'
import { createEmployee, updateEmployee } from '@/lib/admin/team'
import type { EmployeeExtended, EmployeeStatus, EmployeeRole } from '@/lib/admin/types'
import AdminSelect from '@/components/admin/AdminSelect'
import AdminDateInput from '@/components/admin/AdminDateInput'

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
  const [showCredentials, setShowCredentials] = useState(false)
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null)

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
        const result = await createEmployee(payload as any)
        if (result.generated_password && payload.email) {
          setCredentials({ email: payload.email, password: result.generated_password })
          setShowCredentials(true)
          setSaving(false)
          return // Don't close the modal yet — show credentials first
        }
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
              <AdminSelect
                value={role}
                onChange={(e) => setRole(e.target.value as EmployeeRole)}
              >
                <option value="washer">Washer</option>
                <option value="detailer">Detailer</option>
                <option value="ops_manager">Ops Manager</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
              </AdminSelect>
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Hire Date</label>
              <AdminDateInput
                value={hireDate}
                onChange={(e) => setHireDate(e.target.value)}
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
              <AdminSelect
                value={status}
                onChange={(e) => setStatus(e.target.value as EmployeeStatus)}
              >
                <option value="active">Active</option>
                <option value="on_leave">On Leave</option>
                <option value="terminated">Terminated</option>
              </AdminSelect>
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

        {/* Credentials display after successful creation */}
        {showCredentials && credentials && (
          <div className="mt-6 rounded-lg border border-green-500/20 bg-green-500/10 p-5 space-y-4">
            <div className="flex items-center gap-3 text-green-300">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-semibold">Login credentials created!</span>
            </div>
            <div className="rounded-lg border border-white/10 bg-[#0A0A0A] p-4 space-y-3">
              <div>
                <label className="block text-xs text-white/40 mb-1">Email</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white font-mono">{credentials.email}</span>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(credentials.email)}
                    className="text-white/30 hover:text-white transition-colors"
                    title="Copy email"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Password</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white font-mono">{credentials.password}</span>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(credentials.password)}
                    className="text-white/30 hover:text-white transition-colors"
                    title="Copy password"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg bg-orange-500 px-5 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
