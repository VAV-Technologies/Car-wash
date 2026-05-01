export interface ChatStreamCallbacks {
  onUserSaved?: (data: { id: string; hidden?: boolean }) => void
  onAssistantId?: (id: string) => void
  onToken?: (text: string) => void
  onToolCallStart?: (call: { id: string; name: string }) => void
  onToolCallDone?: (call: { id: string; name: string; arguments: string }) => void
  onToolResult?: (result: { id: string; name: string; ms: number }) => void
  onMetadataUpdate?: (metadata: Record<string, unknown>) => void
  onMessagesCleared?: () => void
  onActionProposed?: (data: {
    pendingId: string
    toolName: string
    humanSummary: string
    params: Record<string, unknown>
    assistantMessageId: string
  }) => void
  onActionExecuted?: (data: {
    actionLogId: string | null
    toolName: string
    affectedIds: string[]
    success: boolean
    assistantMessageId: string
  }) => void
  onDone?: (data: { messageId: string; finalContent: string }) => void
  onError?: (message: string) => void
}

export async function streamChat(
  threadId: string,
  content: string,
  callbacks: ChatStreamCallbacks,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(`/api/ai/threads/${threadId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
    signal,
  })

  if (!response.ok) {
    let message = `HTTP ${response.status}`
    try {
      const err = await response.json()
      if (err?.error) message = err.error
    } catch {}
    callbacks.onError?.(message)
    return
  }

  if (!response.body) {
    callbacks.onError?.('No response body')
    return
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      while (true) {
        const sep = buffer.indexOf('\n\n')
        if (sep === -1) break
        const block = buffer.slice(0, sep)
        buffer = buffer.slice(sep + 2)

        let event = 'message'
        let data = ''
        for (const line of block.split('\n')) {
          if (line.startsWith('event: ')) event = line.slice(7).trim()
          else if (line.startsWith('data: ')) data = line.slice(6)
        }
        if (!data) continue

        let payload: any = null
        try {
          payload = JSON.parse(data)
        } catch {
          continue
        }

        switch (event) {
          case 'user_saved':
            callbacks.onUserSaved?.(payload)
            break
          case 'assistant_id':
            callbacks.onAssistantId?.(payload.id)
            break
          case 'token':
            callbacks.onToken?.(payload.text)
            break
          case 'tool_call_start':
            callbacks.onToolCallStart?.(payload)
            break
          case 'tool_call_done':
            callbacks.onToolCallDone?.(payload)
            break
          case 'tool_result':
            callbacks.onToolResult?.(payload)
            break
          case 'metadata_update':
            callbacks.onMetadataUpdate?.(payload)
            break
          case 'messages_cleared':
            callbacks.onMessagesCleared?.()
            break
          case 'action_proposed':
            callbacks.onActionProposed?.(payload)
            break
          case 'action_executed':
            callbacks.onActionExecuted?.(payload)
            break
          case 'done':
            callbacks.onDone?.(payload)
            break
          case 'error':
            callbacks.onError?.(payload.message)
            break
        }
      }
    }
  } catch (err: any) {
    if (err?.name !== 'AbortError') {
      callbacks.onError?.(err?.message || String(err))
    }
  }
}
