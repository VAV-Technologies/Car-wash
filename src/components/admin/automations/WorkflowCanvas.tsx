'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  type Node,
  type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { WorkflowDefinition, WorkflowNode } from '@/lib/admin/automations'

const NODE_STYLE: Record<string, { border: string; bg: string; accent: string }> = {
  trigger: { border: 'border-green-500', bg: 'bg-green-500/10', accent: 'text-green-400' },
  action: { border: 'border-blue-500', bg: 'bg-blue-500/10', accent: 'text-blue-400' },
  condition: { border: 'border-yellow-500', bg: 'bg-yellow-500/10', accent: 'text-yellow-400' },
}

function CustomNode({ data }: { data: { label: string; nodeType: string } }) {
  const style = NODE_STYLE[data.nodeType] ?? NODE_STYLE.action
  return (
    <div
      className={`rounded-lg border ${style.border} ${style.bg} px-4 py-3 min-w-[160px] shadow-lg`}
    >
      <p className={`text-[10px] uppercase tracking-wider font-medium ${style.accent} mb-1`}>
        {data.nodeType}
      </p>
      <p className="text-sm font-medium text-white">{data.label}</p>
    </div>
  )
}

const nodeTypes = { custom: CustomNode }

interface WorkflowCanvasProps {
  workflow: WorkflowDefinition | null
  onRegenerate?: (prompt: string) => void
}

function WorkflowCanvasInner({ workflow, onRegenerate }: WorkflowCanvasProps) {
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null)
  const [showRegenInput, setShowRegenInput] = useState(false)
  const [regenPrompt, setRegenPrompt] = useState('')

  const nodes: Node[] = useMemo(() => {
    if (!workflow?.nodes) return []
    return workflow.nodes.map((n) => ({
      id: n.id,
      type: 'custom',
      position: n.position,
      data: { label: n.label, nodeType: n.type },
    }))
  }, [workflow])

  const edges: Edge[] = useMemo(() => {
    if (!workflow?.edges) return []
    return workflow.edges.map((e, i) => ({
      id: `edge-${i}`,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: true,
      style: { stroke: '#f97316' },
      labelStyle: { fill: '#fff', fontSize: 11 },
    }))
  }, [workflow])

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const wfNode = workflow?.nodes.find((n) => n.id === node.id) ?? null
      setSelectedNode(wfNode)
    },
    [workflow]
  )

  function handleRegenerate() {
    if (!regenPrompt.trim() || !onRegenerate) return
    onRegenerate(regenPrompt.trim())
    setRegenPrompt('')
    setShowRegenInput(false)
  }

  if (!workflow) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-white/10 bg-[#171717] h-[500px]">
        <p className="text-sm text-white/40">No workflow generated yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-white/10 bg-[#0f0f0f] overflow-hidden" style={{ height: 500 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          fitView
          proOptions={{ hideAttribution: true }}
          style={{ background: '#0f0f0f' }}
        >
          <Background color="#ffffff08" gap={20} />
          <Controls
            style={{ backgroundColor: '#171717', borderColor: '#ffffff1a' }}
          />
          <MiniMap
            nodeColor="#f97316"
            maskColor="rgba(0,0,0,0.7)"
            style={{ backgroundColor: '#171717' }}
          />
        </ReactFlow>
      </div>

      {/* Selected node config panel */}
      {selectedNode && (
        <div className="rounded-lg border border-white/10 bg-[#171717] p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-white">
              {selectedNode.label}
              <span className="ml-2 text-xs text-white/40">({selectedNode.type})</span>
            </h4>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-xs text-white/40 hover:text-white/70"
            >
              Close
            </button>
          </div>
          <pre className="text-xs text-white/60 bg-white/5 rounded-lg p-3 overflow-x-auto max-h-48">
            {JSON.stringify(selectedNode.config, null, 2)}
          </pre>
        </div>
      )}

      {/* Re-generate */}
      {onRegenerate && (
        <div>
          {showRegenInput ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={regenPrompt}
                onChange={(e) => setRegenPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRegenerate()}
                placeholder="Describe changes to the workflow..."
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-orange-500 outline-none"
              />
              <button
                onClick={handleRegenerate}
                disabled={!regenPrompt.trim()}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-black hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Re-generate
              </button>
              <button
                onClick={() => {
                  setShowRegenInput(false)
                  setRegenPrompt('')
                }}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowRegenInput(true)}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 hover:bg-white/10 transition-colors"
            >
              Re-generate workflow
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function WorkflowCanvas(props: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner {...props} />
    </ReactFlowProvider>
  )
}
