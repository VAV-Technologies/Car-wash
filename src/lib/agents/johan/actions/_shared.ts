import type { ChatCompletionTool } from 'openai/resources/chat/completions'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface ActionContext {
  userId: string
  userEmail: string | null
  threadId: string
  assistantMessageId: string
  supabaseAdmin: SupabaseClient
}

export interface ActionResult {
  ok: boolean
  data?: unknown
  error?: string
  recoverable?: boolean
  affectedIds?: string[]
  message?: string
}

export type ActionRiskLevel = 'low' | 'medium' | 'high'

export interface ActionDefinition<P = any> {
  name: string
  description: string
  parameters: ChatCompletionTool['function']['parameters']
  risk: ActionRiskLevel
  requiresConfirmation: boolean
  validate: (input: unknown) => P
  execute: (params: P, ctx: ActionContext) => Promise<ActionResult>
}

export function whitelistKeys<T extends Record<string, unknown>>(
  input: unknown,
  allowed: readonly (keyof T)[],
): Partial<T> {
  if (!input || typeof input !== 'object') return {}
  const out: Partial<T> = {}
  for (const k of allowed) {
    const v = (input as any)[k as string]
    if (v !== undefined) (out as any)[k] = v
  }
  return out
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export function assertUuid(value: unknown, field: string): string {
  if (typeof value !== 'string' || !UUID_RE.test(value)) {
    throw new Error(`${field} must be a valid UUID, got ${JSON.stringify(value)}`)
  }
  return value
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
export function assertDate(value: unknown, field: string): string {
  if (typeof value !== 'string' || !DATE_RE.test(value)) {
    throw new Error(`${field} must be YYYY-MM-DD, got ${JSON.stringify(value)}`)
  }
  return value
}

const TIME_RE = /^\d{2}:\d{2}$/
export function assertTime(value: unknown, field: string): string {
  if (typeof value !== 'string' || !TIME_RE.test(value)) {
    throw new Error(`${field} must be HH:MM, got ${JSON.stringify(value)}`)
  }
  return value
}

export function assertEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  field: string,
): T {
  if (typeof value !== 'string' || !(allowed as readonly string[]).includes(value)) {
    throw new Error(`${field} must be one of ${allowed.join(', ')}, got ${JSON.stringify(value)}`)
  }
  return value as T
}

export function assertNonEmptyString(value: unknown, field: string, max = 500): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required`)
  }
  return value.trim().slice(0, max)
}
