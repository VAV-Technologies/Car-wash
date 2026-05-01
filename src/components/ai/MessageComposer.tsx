'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, Square } from 'lucide-react'

interface Props {
  disabled?: boolean
  isStreaming?: boolean
  onSend: (content: string) => void
  onStop?: () => void
}

const SLASH_COMMANDS = [
  { cmd: '/customer 628…', desc: 'Lock onto a customer (DRAFT mode)' },
  { cmd: '/clear-context', desc: 'Unlock customer' },
  { cmd: '/lang id', desc: 'Set draft language to Bahasa' },
  { cmd: '/lang en', desc: 'Set draft language to English' },
  { cmd: '/whoami', desc: 'Show current lock + lang' },
  { cmd: '/reset', desc: 'Clear messages in this thread' },
  { cmd: '/help', desc: 'Show help' },
]

export function MessageComposer({ disabled, isStreaming, onSend, onStop }: Props) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.max(48, Math.min(el.scrollHeight, 240)) + 'px'
  }, [value])

  const showSlashHints = value.startsWith('/') && !value.includes(' ')
  const filteredSlashes = SLASH_COMMANDS.filter((s) => s.cmd.startsWith(value.split(' ')[0]))

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled || isStreaming) return
    onSend(trimmed)
    setValue('')
  }

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="px-4 pb-4 pt-2 border-t border-white/10">
      {showSlashHints && filteredSlashes.length > 0 && (
        <div className="mb-2 bg-[#171717] border border-white/10 max-h-48 overflow-y-auto">
          {filteredSlashes.map((s) => (
            <button
              key={s.cmd}
              onMouseDown={(e) => {
                e.preventDefault()
                setValue(s.cmd.split(' ')[0] + ' ')
                textareaRef.current?.focus()
              }}
              className="w-full text-left px-3 py-2 hover:bg-white/5 flex items-center gap-3"
            >
              <span className="text-[#F97316] font-mono text-xs">{s.cmd}</span>
              <span className="text-white/50 text-xs">{s.desc}</span>
            </button>
          ))}
        </div>
      )}

      <div className="relative flex items-stretch gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask Johan or paste a customer message…  (Shift+Enter for newline)"
          rows={1}
          disabled={disabled}
          className="flex-1 resize-none bg-[#171717] border border-white/10 text-white placeholder:text-white/30 px-4 py-3 text-sm leading-6 focus:outline-none focus:border-white/20 disabled:opacity-60 max-h-60 min-h-12"
        />
        {isStreaming && onStop ? (
          <button
            onClick={onStop}
            className="self-end h-12 px-4 bg-white/10 text-white hover:bg-white/15 flex items-center gap-2 text-sm shrink-0"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
            Stop
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={disabled || !value.trim()}
            className="self-end h-12 px-4 bg-[#F97316] text-black hover:bg-[#EA580C] disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium shrink-0"
          >
            <Send className="h-3.5 w-3.5" />
            Send
          </button>
        )}
      </div>
    </div>
  )
}
