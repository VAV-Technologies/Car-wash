'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Loader2, LogOut, Eye, EyeOff } from 'lucide-react'

interface Employee {
  id: string
  name: string
  phone: string | null
  hire_date: string | null
  status: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)

  // Password change
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Logout
  const [logoutLoading, setLogoutLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('employees')
        .select('id, name, phone, hire_date, status')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching employee:', error)
      }

      setEmployee(data as Employee | null)
      setLoading(false)
    }
    load()
  }, [])

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setPasswordMessage(null)

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters.' })
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' })
      return
    }

    setPasswordLoading(true)

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setPasswordMessage({ type: 'error', text: error.message })
    } else {
      setPasswordMessage({ type: 'success', text: 'Password updated successfully.' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }

    setPasswordLoading(false)
  }

  async function handleLogout() {
    setLogoutLoading(true)
    await supabase.auth.signOut()
    router.push('/wash/login')
  }

  function formatHireDate(dateStr: string | null): string {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-500" size={28} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-4 pt-6 pb-20">
      <h1 className="text-xl font-bold mb-6">Profile</h1>

      {/* Employee Info */}
      <div className="bg-[#171717] rounded-xl border border-white/10 p-5 space-y-4 mb-4">
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wide">Name</p>
          <p className="text-white mt-0.5">{employee?.name || '-'}</p>
        </div>
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wide">Phone</p>
          <p className="text-white mt-0.5">{employee?.phone || '-'}</p>
        </div>
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wide">Employee ID</p>
          <p className="text-white mt-0.5 font-mono text-sm">
            {employee?.id ? employee.id.substring(0, 8).toUpperCase() : '-'}
          </p>
        </div>
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wide">Hire Date</p>
          <p className="text-white mt-0.5">{formatHireDate(employee?.hire_date ?? null)}</p>
        </div>
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wide">Status</p>
          <span
            className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${
              employee?.status === 'active'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-white/10 text-white/50'
            }`}
          >
            {employee?.status || '-'}
          </span>
        </div>
      </div>

      {/* Password Change */}
      <div className="bg-[#171717] rounded-xl border border-white/10 p-5 mb-4">
        <p className="text-sm font-medium mb-4">Change Password</p>
        <form onSubmit={handlePasswordChange} className="space-y-3">
          <div>
            <label className="text-xs text-white/40 block mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
              required
            />
          </div>
          <div>
            <label className="text-xs text-white/40 block mb-1">New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs text-white/40 block mb-1">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {passwordMessage && (
            <p
              className={`text-xs ${
                passwordMessage.type === 'success' ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {passwordMessage.text}
            </p>
          )}

          <button
            type="submit"
            disabled={passwordLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg text-sm disabled:opacity-50 transition-colors"
          >
            {passwordLoading ? (
              <Loader2 className="animate-spin inline mr-2" size={14} />
            ) : null}
            Update Password
          </button>
        </form>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        disabled={logoutLoading}
        className="w-full flex items-center justify-center gap-2 bg-[#171717] border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl py-3 text-sm font-medium transition-colors disabled:opacity-50"
      >
        {logoutLoading ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          <LogOut size={16} />
        )}
        Log Out
      </button>
    </div>
  )
}
