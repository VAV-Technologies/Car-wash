'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Lock, MoreHorizontal, Pencil, Trash2, ScrollText } from 'lucide-react'
import { usePathname } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import type { ChatThread } from '@/lib/ai/types'

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  const diff = Date.now() - then
  const m = Math.floor(diff / 60_000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d`
  return new Date(iso).toLocaleDateString()
}

interface Props {
  threads: ChatThread[]
  activeId: string | null
  loading: boolean
  onNewChat: () => void
  onThreadDeleted: () => void
}

export function ThreadSidebar({ threads, activeId, loading, onNewChat, onThreadDeleted }: Props) {
  const pathname = usePathname()
  const [query, setQuery] = useState('')
  const onAuditPage = pathname?.startsWith('/ai/audit')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return threads
    return threads.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.metadata?.context_phone || '').toLowerCase().includes(q),
    )
  }, [threads, query])

  const handleRename = async (thread: ChatThread) => {
    const next = window.prompt('Rename thread', thread.title)
    if (!next || next === thread.title) return
    await fetch(`/api/ai/threads/${thread.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: next }),
    })
    onThreadDeleted()
  }

  const handleArchive = async (thread: ChatThread) => {
    if (!window.confirm(`Archive "${thread.title}"?`)) return
    await fetch(`/api/ai/threads/${thread.id}`, { method: 'DELETE' })
    onThreadDeleted()
  }

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A]">
      <div className="h-12 px-4 flex items-center border-b border-white/10 shrink-0">
        <span className="font-heading text-xs tracking-wider text-white">JOHAN</span>
        <span className="ml-auto text-[10px] uppercase tracking-widest text-white/40">co-pilot</span>
      </div>

      <div className="px-3 pt-3">
        <button
          onClick={onNewChat}
          className="w-full h-10 flex items-center justify-center gap-2 bg-[#F97316] text-black font-medium hover:bg-[#EA580C] transition-colors text-sm"
        >
          <Plus className="h-4 w-4" />
          New chat
        </button>
      </div>

      <div className="px-3 pt-3">
        <div className="relative">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations"
            className="w-full h-9 pl-9 pr-3 bg-[#171717] border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
          />
        </div>
      </div>

      <div className="px-3 pt-3">
        <Link
          href="/ai/audit"
          className={`w-full h-9 flex items-center justify-start gap-2 px-3 text-xs transition-colors border ${
            onAuditPage
              ? 'border-[#F97316]/40 bg-[#F97316]/10 text-[#F97316]'
              : 'border-white/10 text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <ScrollText className="h-3.5 w-3.5" />
          Audit log
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-2 mt-2 space-y-px pb-4">
        {loading && (
          <div className="space-y-2 px-2 pt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full bg-white/5" />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="px-3 pt-6 text-center text-xs text-white/40">
            {query ? 'No matches.' : 'No conversations yet. Click "New chat" to start.'}
          </div>
        )}

        {filtered.map((t) => {
          const isActive = t.id === activeId
          return (
            <div
              key={t.id}
              className={`group relative flex items-stretch ${isActive ? 'bg-[#171717]' : 'hover:bg-white/5'} transition-colors`}
            >
              <Link
                href={`/ai/${t.id}`}
                className={`flex-1 flex flex-col gap-1 px-3 py-2.5 min-w-0 ${
                  isActive ? 'border-l-2 border-[#F97316] pl-[10px]' : ''
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm text-white truncate flex-1">{t.title || 'New chat'}</span>
                  <span className="text-[10px] text-white/30 shrink-0">{relativeTime(t.last_message_at)}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-white/40">
                  {t.metadata?.context_phone && (
                    <span className="inline-flex items-center gap-1 bg-[#F97316]/15 text-[#F97316] px-1.5 py-0.5">
                      <Lock className="h-2.5 w-2.5" />
                      {t.metadata.context_phone}
                    </span>
                  )}
                  <span className="uppercase tracking-wide">{t.metadata?.context_lang || 'id'}</span>
                </div>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 px-2 text-white/40 hover:text-white"
                    aria-label="Thread actions"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#171717] border-white/10 text-white">
                  <DropdownMenuItem onClick={() => handleRename(t)} className="cursor-pointer">
                    <Pencil className="h-3.5 w-3.5 mr-2" /> Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleArchive(t)}
                    className="cursor-pointer text-red-400 focus:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" /> Archive
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        })}
      </div>
    </div>
  )
}
