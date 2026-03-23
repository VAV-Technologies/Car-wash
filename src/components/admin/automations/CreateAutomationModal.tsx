'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { createAutomation } from '@/lib/admin/automations'

const EXAMPLE_PROMPTS = [
  'Send a WhatsApp reminder 24 hours before each booking',
  'Auto-assign the nearest available washer when a booking is confirmed',
  'Send a follow-up message 3 days after service asking for a review',
  'Alert me on Slack when a subscription is about to expire',
  'Create an invoice and send it via email after job completion',
]

interface CreateAutomationModalProps {
  onClose: () => void
  onCreated: () => void
}

export default function CreateAutomationModal({ onClose, onCreated }: CreateAutomationModalProps) {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    if (!prompt.trim()) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/automations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Generation failed (${res.status})`)
      }

      const { workflow, name, description } = await res.json()

      await createAutomation({
        name,
        description,
        status: 'draft',
        workflow_json: workflow,
        trigger_type: 'manual',
        schedule_cron: null,
      })

      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 flex h-full w-[480px] flex-col bg-[#0A0A0A] border-l border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-lg font-bold text-white">Create Automation</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Describe what you want this automation to do
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Send a WhatsApp message to customers who haven't booked in 30 days..."
              rows={6}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-orange-500 outline-none resize-none"
            />
          </div>

          {/* Example Prompts */}
          <div>
            <p className="text-xs font-medium text-white/40 mb-2">Try an example:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setPrompt(ex)}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 hover:text-white hover:border-white/20 transition-colors text-left"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 px-6 py-4">
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || loading}
            className="w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-black hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                Generating...
              </>
            ) : (
              'Generate Workflow'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
