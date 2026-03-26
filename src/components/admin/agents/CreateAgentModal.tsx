'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { createAgent } from '@/lib/admin/agents'
import { supabase } from '@/lib/supabase'

interface CreateAgentModalProps {
  onClose: () => void
  onCreated: () => void
}

interface Connector {
  id: string
  service_name: string
  status: string
}

export default function CreateAgentModal({ onClose, onCreated }: CreateAgentModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [fileType, setFileType] = useState<'typescript' | 'python' | 'markdown' | 'json' | 'yaml'>('typescript')
  const [selectedConnectorIds, setSelectedConnectorIds] = useState<string[]>([])
  const [connectors, setConnectors] = useState<Connector[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingConnectors, setLoadingConnectors] = useState(true)

  useEffect(() => {
    async function fetchConnectors() {
      setLoadingConnectors(true)
      const { data, error } = await supabase
        .from('connectors')
        .select('id, service_name, status')
        .eq('status', 'active')
        .neq('is_base_model', true)

      if (!error && data) {
        setConnectors(data)
      }
      setLoadingConnectors(false)
    }
    fetchConnectors()
  }, [])

  const handleToggleConnector = (id: string) => {
    setSelectedConnectorIds((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      await createAgent({
        name: name.trim(),
        description: description.trim() || null,
        status: 'draft',
        content: '',
        file_type: fileType,
        connector_ids: selectedConnectorIds,
        trigger_type: 'manual',
      })
      onCreated()
    } catch (err) {
      console.error('Failed to create agent:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-[420px] bg-[#171717] border-l border-white/10 z-50 flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Create New Agent</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col px-6 py-5 gap-5">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Agent"
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
              placeholder="What does this agent do?"
              rows={2}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-colors resize-none"
            />
          </div>

          {/* File Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">File Type</label>
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value as typeof fileType)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-colors appearance-none cursor-pointer"
            >
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="markdown">Markdown</option>
              <option value="json">JSON</option>
              <option value="yaml">YAML</option>
            </select>
          </div>

          {/* Available Connectors */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">Available Connectors</label>
            {loadingConnectors ? (
              <div className="flex items-center gap-2 py-3">
                <div className="w-4 h-4 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                <span className="text-sm text-gray-500">Loading connectors...</span>
              </div>
            ) : connectors.length === 0 ? (
              <p className="text-sm text-gray-500 py-2">No connectors configured yet.</p>
            ) : (
              <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-1">
                {connectors.map((connector) => (
                  <label
                    key={connector.id}
                    className="flex items-center gap-3 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/[0.07] transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedConnectorIds.includes(connector.id)}
                      onChange={() => handleToggleConnector(connector.id)}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-orange-500 focus:ring-orange-500/30 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-sm text-white">{connector.service_name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!name.trim() || loading}
            className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              'Create Agent'
            )}
          </button>
        </form>
      </div>
    </>
  )
}
