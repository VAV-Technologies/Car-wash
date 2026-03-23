import { supabase } from '@/lib/supabase'
import type {
  Conversation,
  ConversationWithCustomer,
  ConversationChannel,
  MessageType,
  PitchResult,
} from './types'

// ─── Query Params ────────────────────────────────────────────────────

export interface ConversationQueryParams {
  page: number
  limit: number
  channel?: ConversationChannel | ''
  message_type?: MessageType | ''
  customer_id?: string
  follow_up_status?: 'pending' | 'completed' | ''
}

// ─── Get Conversations (paginated) ──────────────────────────────────

export async function getConversations(
  params: Partial<ConversationQueryParams> = {}
): Promise<{ data: ConversationWithCustomer[]; count: number }> {
  const {
    page = 1,
    limit = 25,
    channel = '',
    message_type = '',
    customer_id = '',
    follow_up_status = '',
  } = params

  let query = supabase
    .from('conversations')
    .select('*, customers!left(name, phone)', { count: 'exact' })

  if (channel) {
    query = query.eq('channel', channel)
  }
  if (message_type) {
    query = query.eq('message_type', message_type)
  }
  if (customer_id) {
    query = query.eq('customer_id', customer_id)
  }
  if (follow_up_status === 'pending') {
    query = query.not('follow_up_due_at', 'is', null).eq('follow_up_completed', false)
  } else if (follow_up_status === 'completed') {
    query = query.eq('follow_up_completed', true)
  }

  query = query.order('sent_at', { ascending: false })

  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch conversations: ${error.message}`)
  }

  const mapped = (data ?? []).map((row: Record<string, unknown>) => {
    const { customers, ...rest } = row
    const cust = customers as { name: string; phone: string } | null
    return {
      ...rest,
      customer_name: cust?.name ?? null,
      customer_phone: cust?.phone ?? null,
    }
  }) as ConversationWithCustomer[]

  return { data: mapped, count: count ?? 0 }
}

// ─── Create Conversation ────────────────────────────────────────────

export interface CreateConversationData {
  customer_id: string
  channel: ConversationChannel
  direction: 'inbound' | 'outbound'
  message_type: MessageType
  summary: string
  follow_up_due_at?: string | null
  follow_up_completed?: boolean
  subscription_pitched?: boolean
  pitch_result?: PitchResult | null
}

export async function createConversation(
  data: CreateConversationData
): Promise<Conversation> {
  const { data: created, error } = await supabase
    .from('conversations')
    .insert({
      ...data,
      sent_at: new Date().toISOString(),
      follow_up_completed: data.follow_up_completed ?? false,
      subscription_pitched: data.subscription_pitched ?? false,
      pitch_result: data.pitch_result ?? null,
      follow_up_due_at: data.follow_up_due_at ?? null,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create conversation: ${error.message}`)
  }

  return created as Conversation
}

// ─── Get Conversations by Customer ──────────────────────────────────

export async function getConversationsByCustomer(
  customerId: string
): Promise<ConversationWithCustomer[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*, customers!left(name, phone)')
    .eq('customer_id', customerId)
    .order('sent_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch conversations: ${error.message}`)
  }

  return (data ?? []).map((row: Record<string, unknown>) => {
    const { customers, ...rest } = row
    const cust = customers as { name: string; phone: string } | null
    return {
      ...rest,
      customer_name: cust?.name ?? null,
      customer_phone: cust?.phone ?? null,
    }
  }) as ConversationWithCustomer[]
}

// ─── Get Follow-Ups Due ─────────────────────────────────────────────

export async function getFollowUpsDue(): Promise<ConversationWithCustomer[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*, customers!left(name, phone)')
    .not('follow_up_due_at', 'is', null)
    .eq('follow_up_completed', false)
    .order('follow_up_due_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch follow-ups: ${error.message}`)
  }

  return (data ?? []).map((row: Record<string, unknown>) => {
    const { customers, ...rest } = row
    const cust = customers as { name: string; phone: string } | null
    return {
      ...rest,
      customer_name: cust?.name ?? null,
      customer_phone: cust?.phone ?? null,
    }
  }) as ConversationWithCustomer[]
}

// ─── Mark Follow-Up Complete ────────────────────────────────────────

export async function markFollowUpComplete(
  conversationId: string
): Promise<void> {
  const { error } = await supabase
    .from('conversations')
    .update({ follow_up_completed: true })
    .eq('id', conversationId)

  if (error) {
    throw new Error(`Failed to mark follow-up complete: ${error.message}`)
  }
}

// ─── Conversation Stats ─────────────────────────────────────────────

export interface ConversationStats {
  totalThisMonth: number
  followUpsPending: number
  subscriptionsPitched: number
  subscriptionsConverted: number
}

export async function getConversationStats(): Promise<ConversationStats> {
  const now = new Date()
  const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  // Total this month
  const { count: totalThisMonth } = await supabase
    .from('conversations')
    .select('id', { count: 'exact', head: true })
    .gte('sent_at', startOfMonth)

  // Follow-ups pending
  const { count: followUpsPending } = await supabase
    .from('conversations')
    .select('id', { count: 'exact', head: true })
    .not('follow_up_due_at', 'is', null)
    .eq('follow_up_completed', false)

  // Subscriptions pitched this month
  const { count: subscriptionsPitched } = await supabase
    .from('conversations')
    .select('id', { count: 'exact', head: true })
    .eq('subscription_pitched', true)
    .gte('sent_at', startOfMonth)

  // Subscriptions converted this month
  const { count: subscriptionsConverted } = await supabase
    .from('conversations')
    .select('id', { count: 'exact', head: true })
    .eq('subscription_pitched', true)
    .eq('pitch_result', 'converted')
    .gte('sent_at', startOfMonth)

  return {
    totalThisMonth: totalThisMonth ?? 0,
    followUpsPending: followUpsPending ?? 0,
    subscriptionsPitched: subscriptionsPitched ?? 0,
    subscriptionsConverted: subscriptionsConverted ?? 0,
  }
}
