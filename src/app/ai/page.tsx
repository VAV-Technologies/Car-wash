'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useChatShell } from '@/components/ai/ChatShell'

export default function AiHome() {
  const router = useRouter()
  const { refreshThreads } = useChatShell()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/ai/threads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{}',
        })
        if (cancelled || !res.ok) return
        const json = await res.json()
        if (json.thread?.id) {
          await refreshThreads()
          router.replace(`/ai/${json.thread.id}`)
        }
      } catch {}
    })()
    return () => {
      cancelled = true
    }
  }, [router, refreshThreads])

  return (
    <div className="flex-1 flex items-center justify-center text-white/40">
      <Loader2 className="h-5 w-5 animate-spin" />
    </div>
  )
}
