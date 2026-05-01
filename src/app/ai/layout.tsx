import type { ReactNode } from 'react'
import { ChatShell } from '@/components/ai/ChatShell'

export const metadata = {
  title: 'Johan — Castudio AI',
}

export default function AiLayout({ children }: { children: ReactNode }) {
  return <ChatShell>{children}</ChatShell>
}
