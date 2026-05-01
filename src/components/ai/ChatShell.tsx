'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ThreadSidebar } from './ThreadSidebar'
import type { ChatThread } from '@/lib/ai/types'

interface ChatShellContextValue {
  threads: ChatThread[]
  activeThreadId: string | null
  refreshThreads: () => Promise<void>
  patchThreadLocal: (id: string, patch: Partial<ChatThread>) => void
}

const ChatShellContext = createContext<ChatShellContextValue | null>(null)

export function useChatShell() {
  const ctx = useContext(ChatShellContext)
  if (!ctx) throw new Error('useChatShell must be used inside ChatShell')
  return ctx
}

export function ChatShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [loading, setLoading] = useState(true)

  const activeThreadId = (() => {
    const m = pathname.match(/^\/ai\/([^\/]+)/)
    return m?.[1] ?? null
  })()

  const refreshThreads = useCallback(async () => {
    try {
      const res = await fetch('/api/ai/threads', { cache: 'no-store' })
      if (!res.ok) return
      const json = await res.json()
      setThreads(json.threads || [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshThreads()
  }, [refreshThreads])

  const patchThreadLocal = useCallback((id: string, patch: Partial<ChatThread>) => {
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }, [])

  const handleNewChat = async () => {
    const res = await fetch('/api/ai/threads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    })
    if (!res.ok) return
    const json = await res.json()
    if (json.thread?.id) {
      await refreshThreads()
      router.push(`/ai/${json.thread.id}`)
    }
  }

  const ctxValue: ChatShellContextValue = { threads, activeThreadId, refreshThreads, patchThreadLocal }

  return (
    <ChatShellContext.Provider value={ctxValue}>
      <div className="h-[calc(100dvh-120px)] bg-brand-black text-white flex flex-col overflow-hidden section-lines-light">
        <div className="container mx-auto flex-1 flex min-h-0">
          <aside className="hidden md:flex w-64 lg:w-72 border-r border-white/10 flex-col shrink-0">
            <ThreadSidebar
              threads={threads}
              activeId={activeThreadId}
              loading={loading}
              onNewChat={handleNewChat}
              onThreadDeleted={refreshThreads}
            />
          </aside>
          <div className="flex-1 flex flex-col min-w-0 min-h-0">{children}</div>
        </div>
      </div>
    </ChatShellContext.Provider>
  )
}
