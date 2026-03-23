'use client'

import { useState, useEffect, useCallback } from 'react'
import { getAutomationKeys, addAutomationKey, deleteAutomationKey } from '@/lib/admin/automations'
import type { AutomationKey } from '@/lib/admin/automations'
import { formatDate } from '@/lib/admin/constants'
import { Trash2 } from 'lucide-react'

interface ApiKeysManagerProps {
  automationId: string
}

export default function ApiKeysManager({ automationId }: ApiKeysManagerProps) {
  const [keys, setKeys] = useState<AutomationKey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Add form state
  const [serviceName, setServiceName] = useState('')
  const [keyNickname, setKeyNickname] = useState('')
  const [keyValue, setKeyValue] = useState('')
  const [addError, setAddError] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  const fetchKeys = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAutomationKeys(automationId)
      setKeys(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load keys')
    } finally {
      setLoading(false)
    }
  }, [automationId])

  useEffect(() => {
    fetchKeys()
  }, [fetchKeys])

  async function handleAdd() {
    if (!serviceName.trim() || !keyNickname.trim() || !keyValue.trim()) return

    setAdding(true)
    setAddError(null)
    try {
      // Simple base64 encode (real encryption would be server-side)
      const encoded = btoa(keyValue.trim())

      await addAutomationKey({
        automation_id: automationId,
        service_name: serviceName.trim(),
        key_nickname: keyNickname.trim(),
        encrypted_key: encoded,
      })

      // Reset form
      setServiceName('')
      setKeyNickname('')
      setKeyValue('')
      setShowAddForm(false)

      // Refresh
      await fetchKeys()
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to add key')
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteAutomationKey(id)
      setKeys((prev) => prev.filter((k) => k.id !== id))
      setDeleteConfirmId(null)
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-orange-500 outline-none'

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-white/10 bg-[#171717]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">
                Service
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">
                Nickname
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">
                Key
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">
                Added
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-white/50">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-white/40">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-red-400">
                  {error}
                </td>
              </tr>
            ) : keys.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-white/40">
                  No API keys configured
                </td>
              </tr>
            ) : (
              keys.map((key) => (
                <tr
                  key={key.id}
                  className="border-b border-white/5 even:bg-white/[0.02] hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-3 text-white font-medium">{key.service_name}</td>
                  <td className="px-4 py-3 text-white/70">{key.key_nickname}</td>
                  <td className="px-4 py-3">
                    <code className="text-xs text-white/50 font-mono">{key.encrypted_key}</code>
                  </td>
                  <td className="px-4 py-3 text-white/50 text-xs">{formatDate(key.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    {deleteConfirmId === key.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDelete(key.id)}
                          className="rounded bg-red-500 px-2 py-1 text-xs font-medium text-white hover:bg-red-400 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/70 hover:bg-white/10 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(key.id)}
                        className="rounded p-1 text-white/30 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Key */}
      {showAddForm ? (
        <div className="rounded-lg border border-white/10 bg-[#171717] p-4 space-y-3">
          <h4 className="text-sm font-medium text-white">Add API Key</h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs text-white/50 mb-1">Service Name</label>
              <input
                type="text"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="e.g. WhatsApp, OpenAI"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Nickname</label>
              <input
                type="text"
                value={keyNickname}
                onChange={(e) => setKeyNickname(e.target.value)}
                placeholder="e.g. Production key"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">API Key</label>
              <input
                type="password"
                value={keyValue}
                onChange={(e) => setKeyValue(e.target.value)}
                placeholder="sk-..."
                className={inputClass}
              />
            </div>
          </div>
          {addError && (
            <p className="text-xs text-red-400">{addError}</p>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={handleAdd}
              disabled={!serviceName.trim() || !keyNickname.trim() || !keyValue.trim() || adding}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-black hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {adding ? 'Saving...' : 'Save Key'}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false)
                setServiceName('')
                setKeyNickname('')
                setKeyValue('')
                setAddError(null)
              }}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 hover:bg-white/10 transition-colors"
        >
          + Add Key
        </button>
      )}
    </div>
  )
}
