'use client'

import { useState, useEffect } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { getEmployees } from '@/lib/admin/team'
import { calculatePayslip } from '@/lib/admin/team'
import { formatCurrency, formatDate } from '@/lib/admin/constants'
import type { EmployeeExtended } from '@/lib/admin/types'
import EmployeeForm from './EmployeeForm'

const STATUS_CONFIG: Record<string, { label: string; bgClass: string; textClass: string }> = {
  active: { label: 'Active', bgClass: 'bg-green-500/20', textClass: 'text-green-400' },
  on_leave: { label: 'On Leave', bgClass: 'bg-yellow-500/20', textClass: 'text-yellow-400' },
  terminated: { label: 'Terminated', bgClass: 'bg-red-500/20', textClass: 'text-red-400' },
}

const ROLE_CONFIG: Record<string, { label: string; bgClass: string; textClass: string }> = {
  washer: { label: 'Washer', bgClass: 'bg-blue-500/20', textClass: 'text-blue-400' },
  detailer: { label: 'Detailer', bgClass: 'bg-purple-500/20', textClass: 'text-purple-400' },
  ops_manager: { label: 'Ops Manager', bgClass: 'bg-orange-500/20', textClass: 'text-orange-400' },
  supervisor: { label: 'Supervisor', bgClass: 'bg-cyan-500/20', textClass: 'text-cyan-400' },
  admin: { label: 'Admin', bgClass: 'bg-gray-500/20', textClass: 'text-gray-400' },
  manager: { label: 'Manager', bgClass: 'bg-amber-500/20', textClass: 'text-amber-400' },
}

interface EmployeeRow extends EmployeeExtended {
  jobsThisMonth: number
  totalCompThisMonth: number
}

export default function EmployeeList() {
  const [employees, setEmployees] = useState<EmployeeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<EmployeeExtended | null>(null)

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  async function loadEmployees() {
    setLoading(true)
    try {
      const list = await getEmployees()
      const rows: EmployeeRow[] = await Promise.all(
        list.map(async (emp) => {
          try {
            const payslip = await calculatePayslip(emp.id, year, month)
            return {
              ...emp,
              jobsThisMonth: payslip.jobCount,
              totalCompThisMonth: payslip.totalComp,
            }
          } catch {
            return { ...emp, jobsThisMonth: 0, totalCompThisMonth: 6_600_000 }
          }
        })
      )
      setEmployees(rows)
    } catch (err) {
      console.error('Failed to load employees:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEmployees()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleFormClose() {
    setShowForm(false)
    setEditingEmployee(null)
    loadEmployees()
  }

  if (showForm || editingEmployee) {
    return (
      <EmployeeForm
        employee={editingEmployee ?? undefined}
        onClose={handleFormClose}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/40">
          {employees.length} employee{employees.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Employee
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 text-orange-500 animate-spin" />
        </div>
      ) : employees.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-[#171717] p-10 text-center">
          <p className="text-white/40 text-sm">No employees found.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-white/10 bg-[#171717] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-white/40">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Hire Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Jobs (Month)</th>
                  <th className="px-4 py-3 font-medium text-right">Total Comp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {employees.map((emp) => {
                  const statusCfg = STATUS_CONFIG[emp.status] ?? STATUS_CONFIG.active
                  const roleCfg = ROLE_CONFIG[emp.role] ?? ROLE_CONFIG.washer
                  return (
                    <tr
                      key={emp.id}
                      className="hover:bg-white/5 cursor-pointer transition-colors"
                      onClick={() => setEditingEmployee(emp)}
                    >
                      <td className="px-4 py-3 text-white font-medium">{emp.name}</td>
                      <td className="px-4 py-3 text-white/60">{emp.phone}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${roleCfg.bgClass} ${roleCfg.textClass}`}>
                          {roleCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/60">{formatDate(emp.hire_date)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCfg.bgClass} ${statusCfg.textClass}`}>
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/60 text-right">{emp.jobsThisMonth}</td>
                      <td className="px-4 py-3 text-white font-medium text-right">
                        {formatCurrency(emp.totalCompThisMonth)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
