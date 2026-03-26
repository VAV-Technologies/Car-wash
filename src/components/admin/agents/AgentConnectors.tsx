'use client'

import { useState, useEffect } from 'react'
import { Plus, Minus } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface AgentConnectorsProps {
  agentId: string
  connectorIds: string[]
  onUpdate: (newIds: string[]) => void
}

interface Connector {
  id: string
  service_name: string
  description: string | null
  status: string
  ai_analysis: {
    capabilities?: string[]
    [key: string]: unknown
  } | null
}

export default function AgentConnectors({ agentId, connectorIds, onUpdate }: AgentConnectorsProps) {
  const [connectors, setConnectors] = useState<Connector[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchConnectors() {
      setLoading(true)
      const { data, error } = await supabase
        .from('connectors')
        .select('*')
        .eq('status', 'active')
        .neq('is_base_model', true)

      if (!error && data) {
        setConnectors(data as Connector[])
      }
      setLoading(false)
    }
    fetchConnectors()
  }, [])

  const referencedConnectors = connectors.filter((c) => connectorIds.includes(c.id))
  const availableConnectors = connectors.filter((c) => !connectorIds.includes(c.id))

  const handleRemove = (id: string) => {
    onUpdate(connectorIds.filter((cid) => cid !== id))
  }

  const handleAdd = (id: string) => {
    onUpdate([...connectorIds, id])
  }

  const truncate = (text: string | null, max: number) => {
    if (!text) return ''
    return text.length > max ? text.slice(0, max) + '...' : text
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (connectors.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-sm">
          No connectors configured. Add connectors from the main Agents page.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Referenced by this agent */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-gray-300">Referenced by this agent</h3>
        {referencedConnectors.length === 0 ? (
          <p className="text-sm text-gray-500 px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
            No connectors referenced yet. Add one from the list below.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {referencedConnectors.map((connector) => {
              const capabilities =
                connector.ai_analysis?.capabilities?.slice(0, 3) || []

              return (
                <div
                  key={connector.id}
                  className="flex items-start justify-between gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">
                      {connector.service_name}
                    </p>
                    {connector.description && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {truncate(connector.description, 80)}
                      </p>
                    )}
                    {capabilities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {capabilities.map((cap, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20"
                          >
                            {cap}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemove(connector.id)}
                    className="text-red-400 hover:text-red-300 text-xs font-medium shrink-0 mt-0.5 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Available connectors */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-gray-300">Available connectors</h3>
        {availableConnectors.length === 0 ? (
          <p className="text-sm text-gray-500 px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
            All connectors are already referenced by this agent.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {availableConnectors.map((connector) => (
              <div
                key={connector.id}
                className="flex items-start justify-between gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">
                    {connector.service_name}
                  </p>
                  {connector.description && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {truncate(connector.description, 80)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleAdd(connector.id)}
                  className="text-orange-400 hover:text-orange-300 text-xs font-medium shrink-0 mt-0.5 transition-colors"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
