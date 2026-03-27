'use client'

import { useState, useEffect } from 'react'
import { Loader2, Key, UserPlus, Shield, RefreshCw, CheckCircle2, XCircle, Copy } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Employee {
  id: string
  name: string
  email: string | null
  phone: string
  role: string
  status: string
}

interface AuthUser {
  id: string
  email: string
  created_at: string
}

export default function AccountsPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([])
  const [loading, setLoading] = useState(true)

  // Reset password modal
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetEmployee, setResetEmployee] = useState<Employee | null>(null)
  const [resetPassword, setResetPassword] = useState('')
  const [resetSaving, setResetSaving] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  // Create login modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createEmployee, setCreateEmployee] = useState<Employee | null>(null)
  const [createPassword, setCreatePassword] = useState('')
  const [createSaving, setCreateSaving] = useState(false)
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null)

  const [error, setError] = useState('')

  async function fetchData() {
    setLoading(true)
    setError('')
    try {
      const [empRes, authRes] = await Promise.all([
        supabase.from('employees').select('id, name, email, phone, role, status').order('name'),
        fetch('/api/admin/auth?action=list-users'),
      ])

      if (empRes.error) throw new Error(empRes.error.message)
      setEmployees(empRes.data ?? [])

      if (authRes.ok) {
        const users = await authRes.json()
        setAuthUsers(Array.isArray(users) ? users : [])
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  function getAuthUser(employeeId: string) {
    return authUsers.find((u) => u.id === employeeId)
  }

  function generateDefaultPassword(emp: Employee) {
    const namePart = emp.name.toLowerCase().replace(/\s/g, '').slice(0, 4)
    const phonePart = emp.phone.replace(/\D/g, '').slice(-4)
    return `${namePart}${phonePart}!`
  }

  // Reset password handler
  async function handleResetPassword() {
    if (!resetEmployee || !resetPassword.trim()) return
    setResetSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/auth?action=reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: resetEmployee.id, new_password: resetPassword }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to reset password')
      }
      setResetSuccess(true)
      setTimeout(() => {
        setShowResetModal(false)
        setResetEmployee(null)
        setResetPassword('')
        setResetSuccess(false)
      }, 1500)
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password')
    } finally {
      setResetSaving(false)
    }
  }

  // Create login handler
  async function handleCreateLogin() {
    if (!createEmployee || !createPassword.trim() || !createEmployee.email) return
    setCreateSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/auth?action=create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: createEmployee.email,
          password: createPassword,
          name: createEmployee.name,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create login')
      }
      setCreatedCredentials({ email: createEmployee.email, password: createPassword })
      await fetchData()
    } catch (err: any) {
      setError(err?.message || 'Failed to create login')
    } finally {
      setCreateSaving(false)
    }
  }

  function openResetModal(emp: Employee) {
    setResetEmployee(emp)
    setResetPassword('')
    setResetSuccess(false)
    setShowResetModal(true)
    setError('')
  }

  function openCreateModal(emp: Employee) {
    setCreateEmployee(emp)
    setCreatePassword(generateDefaultPassword(emp))
    setCreatedCredentials(null)
    setShowCreateModal(true)
    setError('')
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
  }

  const roleBadgeColor: Record<string, string> = {
    washer: 'bg-blue-500/20 text-blue-300',
    detailer: 'bg-purple-500/20 text-purple-300',
    supervisor: 'bg-yellow-500/20 text-yellow-300',
    admin: 'bg-red-500/20 text-red-300',
    manager: 'bg-orange-500/20 text-orange-300',
    ops_manager: 'bg-orange-500/20 text-orange-300',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Shield className="h-7 w-7 text-orange-500" />
            Account Management
          </h1>
          <p className="text-sm text-white/40 mt-1">Manage employee logins and credentials</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#171717] px-4 py-2 text-sm text-white/60 hover:text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-white/10 bg-[#171717] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
          </div>
        ) : employees.length === 0 ? (
          <div className="py-16 text-center text-sm text-white/30">No employees found</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/40">Name</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/40">Email</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/40">Phone</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/40">Role</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/40">Status</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/40">Login Status</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => {
                const authUser = getAuthUser(emp.id)
                const hasLogin = !!authUser
                return (
                  <tr key={emp.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-white font-medium">{emp.name}</td>
                    <td className="px-4 py-3 text-white/60">{emp.email || <span className="text-white/20">--</span>}</td>
                    <td className="px-4 py-3 text-white/60">{emp.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadgeColor[emp.role] || 'bg-white/10 text-white/60'}`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        emp.status === 'active' ? 'bg-green-500/20 text-green-300' :
                        emp.status === 'on_leave' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {hasLogin ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/20 px-2.5 py-0.5 text-xs font-medium text-green-300">
                          <CheckCircle2 className="h-3 w-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white/40">
                          <XCircle className="h-3 w-3" />
                          No Login
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {hasLogin ? (
                          <button
                            onClick={() => openResetModal(emp)}
                            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 hover:text-white hover:border-orange-500/50 transition-colors"
                          >
                            <Key className="h-3 w-3" />
                            Reset Password
                          </button>
                        ) : (
                          <button
                            onClick={() => openCreateModal(emp)}
                            disabled={!emp.email}
                            className="flex items-center gap-1.5 rounded-lg bg-orange-500/20 border border-orange-500/30 px-3 py-1.5 text-xs text-orange-300 hover:bg-orange-500/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title={!emp.email ? 'Email required to create login' : ''}
                          >
                            <UserPlus className="h-3 w-3" />
                            Create Login
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Reset Password Modal */}
      {showResetModal && resetEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#171717] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Reset Password</h3>
            <p className="text-sm text-white/40 mb-5">
              Reset login password for <span className="text-white font-medium">{resetEmployee.name}</span>
            </p>

            {resetSuccess ? (
              <div className="flex items-center gap-3 rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                <CheckCircle2 className="h-5 w-5" />
                Password reset successfully!
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                  </div>
                )}
                <div className="mb-5">
                  <label className="block text-xs text-white/40 mb-1.5">New Password</label>
                  <input
                    type="password"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#0A0A0A] px-3 py-2 text-sm text-white placeholder-white/30 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    placeholder="Enter new password"
                    autoFocus
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleResetPassword}
                    disabled={resetSaving || !resetPassword.trim()}
                    className="flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
                  >
                    {resetSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                    Reset
                  </button>
                  <button
                    onClick={() => { setShowResetModal(false); setResetEmployee(null); setError('') }}
                    className="rounded-lg border border-white/10 px-5 py-2 text-sm text-white/60 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Create Login Modal */}
      {showCreateModal && createEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#171717] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Create Login</h3>
            <p className="text-sm text-white/40 mb-5">
              Create login credentials for <span className="text-white font-medium">{createEmployee.name}</span>
            </p>

            {createdCredentials ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                  Login credentials created!
                </div>
                <div className="rounded-lg border border-white/10 bg-[#0A0A0A] p-4 space-y-3">
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Email</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white font-mono">{createdCredentials.email}</span>
                      <button
                        onClick={() => copyToClipboard(createdCredentials.email)}
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
                      <span className="text-sm text-white font-mono">{createdCredentials.password}</span>
                      <button
                        onClick={() => copyToClipboard(createdCredentials.password)}
                        className="text-white/30 hover:text-white transition-colors"
                        title="Copy password"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-white/30">
                  Note: For existing employees, the login may need manual ID sync.
                </p>
                <button
                  onClick={() => { setShowCreateModal(false); setCreateEmployee(null); setCreatedCredentials(null); setError('') }}
                  className="w-full rounded-lg bg-orange-500 px-5 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                  </div>
                )}
                <div className="space-y-4 mb-5">
                  <div>
                    <label className="block text-xs text-white/40 mb-1.5">Email</label>
                    <input
                      type="text"
                      value={createEmployee.email || ''}
                      disabled
                      className="w-full rounded-lg border border-white/10 bg-[#0A0A0A] px-3 py-2 text-sm text-white/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1.5">Password</label>
                    <input
                      type="text"
                      value={createPassword}
                      onChange={(e) => setCreatePassword(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-[#0A0A0A] px-3 py-2 text-sm text-white placeholder-white/30 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono"
                      placeholder="Enter password"
                      autoFocus
                    />
                    <p className="text-xs text-white/20 mt-1">Auto-generated: first 4 chars of name + last 4 digits of phone + !</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCreateLogin}
                    disabled={createSaving || !createPassword.trim()}
                    className="flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
                  >
                    {createSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                    Create Login
                  </button>
                  <button
                    onClick={() => { setShowCreateModal(false); setCreateEmployee(null); setError('') }}
                    className="rounded-lg border border-white/10 px-5 py-2 text-sm text-white/60 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
