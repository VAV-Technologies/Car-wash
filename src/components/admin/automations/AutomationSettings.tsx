'use client'

import { useState } from 'react'
import type { Automation } from '@/lib/admin/automations'
import AdminSelect from '@/components/admin/AdminSelect'

// Simple cron-to-human parser for common patterns
function parseCron(cron: string): string {
  if (!cron) return ''
  const parts = cron.trim().split(/\s+/)
  if (parts.length !== 5) return cron

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts

  const dayNames: Record<string, string> = {
    '0': 'Sunday', '1': 'Monday', '2': 'Tuesday', '3': 'Wednesday',
    '4': 'Thursday', '5': 'Friday', '6': 'Saturday', '7': 'Sunday',
  }

  const monthNames: Record<string, string> = {
    '1': 'January', '2': 'February', '3': 'March', '4': 'April',
    '5': 'May', '6': 'June', '7': 'July', '8': 'August',
    '9': 'September', '10': 'October', '11': 'November', '12': 'December',
  }

  const time = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`

  // Every day at specific time
  if (dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    if (minute === '0' && hour === '*') return 'Every hour'
    if (minute === '*' && hour === '*') return 'Every minute'
    return `Every day at ${time}`
  }

  // Specific day of week
  if (dayOfMonth === '*' && month === '*' && dayOfWeek !== '*') {
    const days = dayOfWeek.split(',').map((d) => dayNames[d] ?? d).join(', ')
    return `Every ${days} at ${time}`
  }

  // Specific day of month
  if (dayOfMonth !== '*' && month === '*' && dayOfWeek === '*') {
    return `On day ${dayOfMonth} of every month at ${time}`
  }

  // Specific month and day
  if (dayOfMonth !== '*' && month !== '*' && dayOfWeek === '*') {
    const mName = monthNames[month] ?? month
    return `On ${mName} ${dayOfMonth} at ${time}`
  }

  return cron
}

interface AutomationSettingsProps {
  automation: Automation
  onSave: (data: {
    name: string
    description: string | null
    status: 'active' | 'paused' | 'draft'
    trigger_type: 'webhook' | 'schedule' | 'manual'
    schedule_cron: string | null
  }) => void
  onDelete: () => void
}

export default function AutomationSettings({ automation, onSave, onDelete }: AutomationSettingsProps) {
  const [name, setName] = useState(automation.name)
  const [description, setDescription] = useState(automation.description ?? '')
  const [status, setStatus] = useState(automation.status)
  const [triggerType, setTriggerType] = useState(automation.trigger_type)
  const [scheduleCron, setScheduleCron] = useState(automation.schedule_cron ?? '')
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const cronPreview = triggerType === 'schedule' && scheduleCron.trim() ? parseCron(scheduleCron.trim()) : ''

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    try {
      onSave({
        name: name.trim(),
        description: description.trim() || null,
        status,
        trigger_type: triggerType,
        schedule_cron: triggerType === 'schedule' ? scheduleCron.trim() || null : null,
      })
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-orange-500 outline-none'
  const labelClass = 'block text-sm font-medium text-white/70 mb-1'

  return (
    <div className="space-y-6 max-w-xl">
      {/* Name */}
      <div>
        <label className={labelClass}>
          Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Automation name"
          className={inputClass}
        />
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What does this automation do?"
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Status */}
      <div>
        <label className={labelClass}>Status</label>
        <AdminSelect
          value={status}
          onChange={(e) => setStatus(e.target.value as 'active' | 'paused' | 'draft')}
        >
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="draft">Draft</option>
        </AdminSelect>
      </div>

      {/* Trigger Type */}
      <div>
        <label className={labelClass}>Trigger Type</label>
        <AdminSelect
          value={triggerType}
          onChange={(e) => setTriggerType(e.target.value as 'webhook' | 'schedule' | 'manual')}
        >
          <option value="manual">Manual</option>
          <option value="webhook">Webhook</option>
          <option value="schedule">Schedule</option>
        </AdminSelect>
      </div>

      {/* Schedule Cron */}
      {triggerType === 'schedule' && (
        <div>
          <label className={labelClass}>Schedule (Cron Expression)</label>
          <input
            type="text"
            value={scheduleCron}
            onChange={(e) => setScheduleCron(e.target.value)}
            placeholder="0 9 * * 1"
            className={inputClass}
          />
          {cronPreview && (
            <p className="mt-1.5 text-xs text-orange-400">{cronPreview}</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={!name.trim() || saving}
          className="rounded-lg bg-orange-500 px-6 py-2 text-sm font-medium text-black hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>

        {showDeleteConfirm ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-400">Are you sure?</span>
            <button
              onClick={onDelete}
              className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-400 transition-colors"
            >
              Yes, delete
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  )
}
