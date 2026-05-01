'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, MoreHorizontal, Pencil, Languages, Unlock, RefreshCw, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useChatShell } from './ChatShell'
import { MessageBubble } from './MessageBubble'
import { MessageComposer } from './MessageComposer'
import { LockToCustomerDialog } from './LockToCustomerDialog'
import { streamChat } from '@/lib/ai/sse-client'
import type { ChatMessage, ChatThread, ToolCallStatus, ProposedAction, ExecutedAction } from '@/lib/ai/types'

interface Props {
  threadId: string
}

export function ChatPane({ threadId }: Props) {
  const router = useRouter()
  const { threads, refreshThreads, patchThreadLocal } = useChatShell()
  const thread = useMemo<ChatThread | null>(() => threads.find((t) => t.id === threadId) ?? null, [threads, threadId])

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [streamingId, setStreamingId] = useState<string | null>(null)
  const [toolCallsByMessage, setToolCallsByMessage] = useState<Record<string, ToolCallStatus[]>>({})
  const [proposalsByMessage, setProposalsByMessage] = useState<Record<string, ProposedAction[]>>({})
  const [executedByMessage, setExecutedByMessage] = useState<Record<string, ExecutedAction[]>>({})
  const [error, setError] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const [lockDialogOpen, setLockDialogOpen] = useState(false)
  const [showJumpToBottom, setShowJumpToBottom] = useState(false)

  const abortRef = useRef<AbortController | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const stickToBottomRef = useRef(true)

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true)
    try {
      const res = await fetch(`/api/ai/threads/${threadId}/messages?limit=200`, { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        setMessages(json.messages || [])
      } else {
        setError(`Failed to load messages (${res.status})`)
      }
    } catch (e: any) {
      setError(e?.message || String(e))
    } finally {
      setLoadingHistory(false)
    }
  }, [threadId])

  useEffect(() => {
    loadHistory()
    setError(null)
    setStreamingId(null)
    setToolCallsByMessage({})
    setProposalsByMessage({})
    setExecutedByMessage({})
  }, [loadHistory])

  useEffect(() => {
    if (!stickToBottomRef.current) return
    bottomRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' })
  }, [messages, streamingId])

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    stickToBottomRef.current = distanceFromBottom < 80
    setShowJumpToBottom(distanceFromBottom > 200)
  }

  const scrollToBottom = () => {
    stickToBottomRef.current = true
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }

  const handleSend = useCallback(
    async (content: string) => {
      setError(null)
      const tempUserId = 'optimistic-' + Date.now()
      const tempAssistantId = 'streaming-' + Date.now()
      const now = new Date().toISOString()

      setMessages((prev) => [
        ...prev,
        {
          id: tempUserId,
          role: 'user',
          content,
          created_at: now,
        },
        {
          id: tempAssistantId,
          role: 'assistant',
          content: '',
          created_at: now,
          finalized_at: null,
        },
      ])
      setStreamingId(tempAssistantId)
      stickToBottomRef.current = true

      const ac = new AbortController()
      abortRef.current = ac
      let resolvedAssistantId = tempAssistantId
      const wasFirstAssistantTurn = !messages.some((m) => m.role === 'assistant' && m.finalized_at)

      await streamChat(
        threadId,
        content,
        {
          onUserSaved: ({ id, hidden }) => {
            if (hidden) {
              // Hide synthetic /confirm and /cancel-action user messages
              setMessages((prev) => prev.filter((m) => m.id !== tempUserId))
            } else {
              setMessages((prev) => prev.map((m) => (m.id === tempUserId ? { ...m, id } : m)))
            }
          },
          onAssistantId: (id) => {
            resolvedAssistantId = id
            setStreamingId(id)
            setMessages((prev) => prev.map((m) => (m.id === tempAssistantId ? { ...m, id } : m)))
          },
          onToken: (text) => {
            setMessages((prev) =>
              prev.map((m) => (m.id === resolvedAssistantId ? { ...m, content: m.content + text } : m)),
            )
          },
          onToolCallStart: (call) => {
            setToolCallsByMessage((prev) => ({
              ...prev,
              [resolvedAssistantId]: [
                ...(prev[resolvedAssistantId] || []),
                { id: call.id, name: call.name, status: 'running' },
              ],
            }))
          },
          onToolResult: (result) => {
            setToolCallsByMessage((prev) => ({
              ...prev,
              [resolvedAssistantId]: (prev[resolvedAssistantId] || []).map((tc) =>
                tc.id === result.id ? { ...tc, status: 'done', ms: result.ms } : tc,
              ),
            }))
          },
          onActionProposed: (data) => {
            setProposalsByMessage((prev) => {
              const key = data.assistantMessageId || resolvedAssistantId
              const existing = prev[key] || []
              if (existing.some((p) => p.pendingId === data.pendingId)) return prev
              return {
                ...prev,
                [key]: [
                  ...existing,
                  {
                    pendingId: data.pendingId,
                    toolName: data.toolName,
                    humanSummary: data.humanSummary,
                    params: data.params,
                    status: 'awaiting',
                  },
                ],
              }
            })
          },
          onActionExecuted: (data) => {
            const key = data.assistantMessageId || resolvedAssistantId
            setExecutedByMessage((prev) => ({
              ...prev,
              [key]: [
                ...(prev[key] || []),
                {
                  actionLogId: data.actionLogId,
                  toolName: data.toolName,
                  affectedIds: data.affectedIds,
                  success: data.success,
                },
              ],
            }))
            // Mark any matching proposals as executed
            setProposalsByMessage((prev) => {
              const next = { ...prev }
              for (const k of Object.keys(next)) {
                next[k] = next[k].map((p) =>
                  p.toolName === data.toolName && p.status === 'confirmed'
                    ? { ...p, status: 'executed' }
                    : p,
                )
              }
              return next
            })
          },
          onMetadataUpdate: (md) => {
            patchThreadLocal(threadId, { metadata: md as any })
          },
          onMessagesCleared: () => {
            setMessages((prev) => prev.filter((m) => m.id === tempUserId || m.id === resolvedAssistantId))
          },
          onDone: ({ finalContent }) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === resolvedAssistantId ? { ...m, content: finalContent, finalized_at: new Date().toISOString() } : m,
              ),
            )
            setStreamingId(null)
            refreshThreads()
            if (wasFirstAssistantTurn) {
              fetch(`/api/ai/threads/${threadId}/title`, { method: 'POST' })
                .then(() => refreshThreads())
                .catch(() => {})
            }
          },
          onError: (message) => {
            setError(message)
            setStreamingId(null)
          },
        },
        ac.signal,
      )
    },
    [threadId, messages, refreshThreads, patchThreadLocal],
  )

  const handleConfirmAction = useCallback(
    (pendingId: string) => {
      // Optimistically mark the proposal as confirmed before sending
      setProposalsByMessage((prev) => {
        const next: Record<string, ProposedAction[]> = {}
        for (const [k, list] of Object.entries(prev)) {
          next[k] = list.map((p) => (p.pendingId === pendingId ? { ...p, status: 'confirmed' } : p))
        }
        return next
      })
      handleSend(`/confirm ${pendingId}`)
    },
    [handleSend],
  )

  const handleCancelAction = useCallback(
    (pendingId: string) => {
      setProposalsByMessage((prev) => {
        const next: Record<string, ProposedAction[]> = {}
        for (const [k, list] of Object.entries(prev)) {
          next[k] = list.map((p) => (p.pendingId === pendingId ? { ...p, status: 'cancelled' } : p))
        }
        return next
      })
      handleSend(`/cancel-action ${pendingId}`)
    },
    [handleSend],
  )

  const handleStop = () => {
    abortRef.current?.abort()
    setStreamingId(null)
  }

  const handleRenameSubmit = async () => {
    const nextTitle = titleDraft.trim()
    setEditingTitle(false)
    if (!nextTitle || !thread || nextTitle === thread.title) return
    patchThreadLocal(thread.id, { title: nextTitle })
    await fetch(`/api/ai/threads/${thread.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: nextTitle }),
    })
    refreshThreads()
  }

  const updateMetadata = async (patch: Record<string, unknown>) => {
    if (!thread) return
    const next = { ...thread.metadata, ...patch }
    patchThreadLocal(thread.id, { metadata: next as any })
    await fetch(`/api/ai/threads/${thread.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metadata: patch }),
    })
  }

  const handleArchive = async () => {
    if (!thread) return
    if (!window.confirm(`Archive "${thread.title}"?`)) return
    await fetch(`/api/ai/threads/${thread.id}`, { method: 'DELETE' })
    refreshThreads()
    router.push('/ai')
  }

  if (!thread && !loadingHistory && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-white/40 text-sm">
        Loading thread…
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="h-12 border-b border-white/10 flex items-center px-4 gap-3 shrink-0">
        {editingTitle ? (
          <input
            autoFocus
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameSubmit()
              if (e.key === 'Escape') setEditingTitle(false)
            }}
            className="flex-1 bg-transparent border border-white/20 px-2 py-1 text-sm text-white focus:outline-none"
          />
        ) : (
          <button
            onClick={() => {
              setTitleDraft(thread?.title || '')
              setEditingTitle(true)
            }}
            className="flex-1 text-left font-heading text-sm text-white truncate hover:text-white/80"
          >
            {thread?.title || 'Loading…'}
          </button>
        )}

        {thread?.metadata?.context_phone && (
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] bg-[#F97316]/15 text-[#F97316] px-2 py-1 font-mono">
            <Lock className="h-3 w-3" />
            {thread.metadata.context_phone}
          </span>
        )}
        <span className="hidden sm:inline text-[10px] uppercase tracking-widest text-white/40">
          {thread?.metadata?.context_lang || 'id'}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-white/50 hover:text-white p-2" aria-label="Thread actions">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#171717] border-white/10 text-white">
            <DropdownMenuItem
              onClick={() => {
                setTitleDraft(thread?.title || '')
                setEditingTitle(true)
              }}
              className="cursor-pointer"
            >
              <Pencil className="h-3.5 w-3.5 mr-2" /> Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLockDialogOpen(true)} className="cursor-pointer">
              <Lock className="h-3.5 w-3.5 mr-2" /> Lock to customer…
            </DropdownMenuItem>
            {thread?.metadata?.context_phone && (
              <DropdownMenuItem onClick={() => updateMetadata({ context_phone: null })} className="cursor-pointer">
                <Unlock className="h-3.5 w-3.5 mr-2" /> Unlock customer
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() =>
                updateMetadata({ context_lang: thread?.metadata?.context_lang === 'id' ? 'en' : 'id' })
              }
              className="cursor-pointer"
            >
              <Languages className="h-3.5 w-3.5 mr-2" /> Toggle lang ({thread?.metadata?.context_lang === 'id' ? 'EN' : 'ID'})
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem onClick={loadHistory} className="cursor-pointer">
              <RefreshCw className="h-3.5 w-3.5 mr-2" /> Reload history
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleArchive} className="cursor-pointer text-red-400 focus:text-red-400">
              Archive thread
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-5 relative">
        {loadingHistory && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-white/5 animate-pulse" />
            ))}
          </div>
        )}

        {!loadingHistory && messages.length === 0 && (
          <div className="text-center text-sm text-white/40 mt-8">
            No messages yet. Type below to start.
          </div>
        )}

        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            isStreaming={m.id === streamingId}
            toolCalls={toolCallsByMessage[m.id]}
            proposals={proposalsByMessage[m.id]}
            executedActions={executedByMessage[m.id]}
            onConfirmAction={handleConfirmAction}
            onCancelAction={handleCancelAction}
          />
        ))}

        <div ref={bottomRef} />

        {showJumpToBottom && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-4 right-4 sm:right-8 inline-flex items-center gap-2 bg-[#171717] border border-white/15 text-white/80 hover:text-white hover:border-white/30 px-3 py-2 text-xs"
          >
            <ChevronDown className="h-3 w-3" />
            Jump to latest
          </button>
        )}
      </div>

      {error && (
        <div className="mx-4 mb-2 px-3 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-between gap-2">
          <span className="truncate">{error}</span>
          <button onClick={() => setError(null)} className="text-red-300 hover:text-red-200">
            dismiss
          </button>
        </div>
      )}

      <MessageComposer disabled={loadingHistory} isStreaming={!!streamingId} onSend={handleSend} onStop={handleStop} />

      <LockToCustomerDialog
        open={lockDialogOpen}
        onOpenChange={setLockDialogOpen}
        initial={thread?.metadata?.context_phone || null}
        onConfirm={(digits) => updateMetadata({ context_phone: digits })}
      />
    </div>
  )
}
