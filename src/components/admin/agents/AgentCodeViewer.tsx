'use client'

import { useState } from 'react'
import { Clipboard, Check, Terminal } from 'lucide-react'

interface AgentCodeViewerProps {
  content: string
  fileType: string
  version: number
  updatedAt: string
}

const FILE_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  typescript: { bg: 'bg-blue-500/15', text: 'text-blue-400' },
  ts: { bg: 'bg-blue-500/15', text: 'text-blue-400' },
  python: { bg: 'bg-green-500/15', text: 'text-green-400' },
  py: { bg: 'bg-green-500/15', text: 'text-green-400' },
  markdown: { bg: 'bg-purple-500/15', text: 'text-purple-400' },
  md: { bg: 'bg-purple-500/15', text: 'text-purple-400' },
  json: { bg: 'bg-yellow-500/15', text: 'text-yellow-400' },
  yaml: { bg: 'bg-cyan-500/15', text: 'text-cyan-400' },
  yml: { bg: 'bg-cyan-500/15', text: 'text-cyan-400' },
}

function getFileTypeStyle(fileType: string) {
  const key = fileType.toLowerCase()
  return FILE_TYPE_COLORS[key] || { bg: 'bg-white/5', text: 'text-white/50' }
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

export function AgentCodeViewer({ content, fileType, version, updatedAt }: AgentCodeViewerProps) {
  const [copied, setCopied] = useState(false)
  const style = getFileTypeStyle(fileType)

  function handleCopy() {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const lines = content ? content.split('\n') : []

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
            {fileType}
          </span>
          <span className="text-white/30 text-xs">v{version}</span>
          <span className="text-white/30 text-xs">
            Updated {formatDate(updatedAt)}
          </span>
        </div>

        {content && (
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/50 hover:text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <Clipboard className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
        )}
      </div>

      {/* Code Block or Empty State */}
      {!content ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#0f0f0f] border border-white/10 rounded-xl">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Terminal className="w-6 h-6 text-white/30" />
          </div>
          <p className="text-white/40 text-sm text-center max-w-sm">
            No code yet. Use Claude Code in your terminal to write this agent.
          </p>
        </div>
      ) : (
        <div className="bg-[#0f0f0f] border border-white/10 rounded-xl overflow-x-auto">
          <pre className="font-mono text-sm">
            <table className="w-full border-collapse">
              <tbody>
                {lines.map((line, i) => (
                  <tr key={i} className="hover:bg-white/[0.02]">
                    <td className="text-white/20 text-right select-none px-4 py-0 leading-6 align-top w-[1%] whitespace-nowrap border-r border-white/5">
                      {i + 1}
                    </td>
                    <td className="text-white/80 px-4 py-0 leading-6 whitespace-pre">
                      {line || ' '}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </pre>
        </div>
      )}
    </div>
  )
}
