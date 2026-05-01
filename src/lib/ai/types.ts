export interface ChatThread {
  id: string
  title: string
  metadata: { context_phone: string | null; context_lang: 'id' | 'en' }
  archived_at: string | null
  last_message_at: string
  created_at: string
  created_by: string | null
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'tool' | 'system'
  content: string
  tool_calls?: Array<{ id: string; name: string; arguments: string }> | null
  tool_call_id?: string | null
  tool_name?: string | null
  metadata?: Record<string, unknown> | null
  finalized_at?: string | null
  author_id?: string | null
  created_at: string
}

export interface ToolCallStatus {
  id: string
  name: string
  status: 'running' | 'done'
  ms?: number
}

export interface ProposedAction {
  pendingId: string
  toolName: string
  humanSummary: string
  params: Record<string, unknown>
  status: 'awaiting' | 'confirmed' | 'cancelled' | 'executed'
}

export interface ExecutedAction {
  actionLogId: string | null
  toolName: string
  affectedIds: string[]
  success: boolean
}
