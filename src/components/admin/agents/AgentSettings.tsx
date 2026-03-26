'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import type { Agent } from '@/lib/admin/agents'

interface AgentSettingsProps {
  agent: Agent
  onSave: (data: {
    name: string
    description: string | null
    status: 'active' | 'paused' | 'draft'
    trigger_type: 'webhook' | 'schedule' | 'manual'
    schedule_cron: string | null
  }) => void
  onDelete: () => void
}

export default function AgentSettings({ agent, onSave, onDelete }: AgentSettingsProps) {
  const [name, setName] = useState(agent.name)
  const [description, setDescription] = useState(agent.description || '')
  const [status, setStatus] = useState<'active' | 'paused' | 'draft'>(agent.status)
  const [triggerType, setTriggerType] = useState<'webhook' | 'schedule' | 'manual'>(
    agent.trigger_type || 'manual'
  )
  const [scheduleCron, setScheduleCron] = useState(agent.schedule_cron || '')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmName, setDeleteConfirmName] = useState('')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    onSave({
      name: name.trim(),
      description: description.trim() || null,
      status,
      trigger_type: triggerType,
      schedule_cron: triggerType === 'schedule' ? scheduleCron.trim() || null : null,
    })
  }

  const handleDelete = () => {
    if (deleteConfirmName === agent.name) {
      onDelete()
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Settings Form */}
      <form onSubmit={handleSave} className="flex flex-col gap-5">
        {/* Agent Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-300">
            Agent Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-colors"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-300">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe what this agent does..."
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-colors resize-none"
          />
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-300">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-colors appearance-none cursor-pointer"
          >
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {/* Trigger Type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-300">Trigger Type</label>
          <select
            value={triggerType}
            onChange={(e) => setTriggerType(e.target.value as typeof triggerType)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-colors appearance-none cursor-pointer"
          >
            <option value="manual">Manual</option>
            <option value="webhook">Webhook</option>
            <option value="schedule">Schedule</option>
          </select>
        </div>

        {/* Cron Expression (only when schedule) */}
        {triggerType === 'schedule' && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">Cron Expression</label>
            <input
              type="text"
              value={scheduleCron}
              onChange={(e) => setScheduleCron(e.target.value)}
              placeholder="0 */6 * * *"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm font-mono focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-colors"
            />
            <p className="text-xs text-gray-500">
              Standard cron syntax. Example: &quot;0 */6 * * *&quot; runs every 6 hours.
            </p>
          </div>
        )}

        {/* Save Button */}
        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg transition-colors mt-2"
        >
          Save Changes
        </button>
      </form>

      {/* Divider */}
      <div className="border-t border-white/10" />

      {/* Delete Section */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-red-400">Danger Zone</h3>
        <div className="px-4 py-4 bg-red-500/5 border border-red-500/20 rounded-lg flex flex-col gap-3">
          <p className="text-sm text-gray-400">
            Permanently delete this agent. This action cannot be undone.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 font-medium text-sm rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Agent
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-gray-400">
                Type <span className="font-medium text-white">{agent.name}</span> to confirm deletion:
              </p>
              <input
                type="text"
                value={deleteConfirmName}
                onChange={(e) => setDeleteConfirmName(e.target.value)}
                placeholder={agent.name}
                className="w-full px-3 py-2 bg-white/5 border border-red-500/30 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteConfirmName('')
                  }}
                  className="flex-1 py-2 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-medium text-sm rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteConfirmName !== agent.name}
                  className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 disabled:opacity-30 disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg transition-colors"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
