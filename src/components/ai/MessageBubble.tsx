'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Copy, Check, Wrench, CheckCircle2 } from 'lucide-react'
import type { ChatMessage, ToolCallStatus, ProposedAction, ExecutedAction } from '@/lib/ai/types'
import { ProposedActionCard } from './ProposedActionCard'
import { ActionLogStrip } from './ActionLogStrip'

interface Props {
  message: ChatMessage
  isStreaming?: boolean
  toolCalls?: ToolCallStatus[]
  proposals?: ProposedAction[]
  executedActions?: ExecutedAction[]
  onConfirmAction?: (pendingId: string) => void
  onCancelAction?: (pendingId: string) => void
}

export function MessageBubble({
  message,
  isStreaming,
  toolCalls,
  proposals,
  executedActions,
  onConfirmAction,
  onCancelAction,
}: Props) {
  if (message.role === 'tool') return null
  if ((message.metadata as any)?.hidden) return null

  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-[#F97316] text-black px-4 py-2.5 whitespace-pre-wrap break-words text-sm">
          {message.content}
        </div>
      </div>
    )
  }

  const hasContent = !!message.content
  const hasProposals = proposals && proposals.length > 0

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] flex flex-col gap-2">
        {toolCalls && toolCalls.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {toolCalls.map((tc) => (
              <ToolCallChip key={tc.id} call={tc} />
            ))}
          </div>
        )}
        {hasProposals &&
          proposals!.map((p) => (
            <ProposedActionCard
              key={p.pendingId}
              action={p}
              onConfirm={(id) => onConfirmAction?.(id)}
              onCancel={(id) => onCancelAction?.(id)}
            />
          ))}
        {(hasContent || isStreaming) && (
          <div className="bg-[#171717] border border-white/10 text-white px-4 py-3 text-sm">
            {hasContent ? (
              <MarkdownContent content={message.content} />
            ) : isStreaming ? (
              <span className="text-white/40">…</span>
            ) : (
              <span className="text-white/30 italic">empty</span>
            )}
            {isStreaming && hasContent && <span className="ml-0.5 inline-block w-2 h-4 bg-[#F97316] animate-pulse align-middle" />}
          </div>
        )}
        {executedActions && executedActions.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {executedActions.map((a, i) => (
              <ActionLogStrip key={`${a.toolName}-${i}`} action={a} />
            ))}
          </div>
        )}
        {!isStreaming && hasContent && <CopyButton text={message.content} />}
      </div>
    </div>
  )
}

function ToolCallChip({ call }: { call: ToolCallStatus }) {
  const Icon = call.status === 'done' ? CheckCircle2 : Wrench
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-1 border ${
        call.status === 'done' ? 'border-green-500/30 text-green-400 bg-green-500/5' : 'border-white/15 text-white/60 bg-white/5'
      }`}
    >
      <Icon className={`h-3 w-3 ${call.status === 'running' ? 'animate-pulse' : ''}`} />
      <span className="font-mono">{call.name}</span>
      {call.ms !== undefined && <span className="text-white/40">{call.ms}ms</span>}
    </span>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      onClick={handleCopy}
      className="self-start inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-white/30 hover:text-white/70"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose prose-invert prose-sm max-w-none prose-p:my-2 prose-headings:font-heading prose-headings:text-white prose-a:text-[#F97316] prose-code:text-[#F97316] prose-code:before:content-none prose-code:after:content-none prose-pre:bg-black prose-pre:border prose-pre:border-white/10">
      <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>
        {content}
      </ReactMarkdown>
    </div>
  )
}
