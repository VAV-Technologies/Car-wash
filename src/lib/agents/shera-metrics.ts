// ─── Shera Conversation Quality Metrics ──────────────────────────────
// Tracks key performance indicators for Shera conversations.

import { getSupabaseAdmin } from '@/lib/supabase'

type MetricType =
  | 'conversation_started'
  | 'booking_created'
  | 'conversation_dropped'
  | 'llm_failure'
  | 'llm_fallback_sent'
  | 'image_delivery_success'
  | 'image_delivery_failure'
  | 'state_transition'

interface MetricValue {
  phone?: string
  state?: string
  from_state?: string
  to_state?: string
  service_type?: string
  message_count?: number
  error?: string
  images_sent?: number
  images_failed?: number
  [key: string]: unknown
}

export async function trackMetric(
  chatId: string,
  type: MetricType,
  value: MetricValue = {}
): Promise<void> {
  try {
    const supabase = getSupabaseAdmin()
    await supabase.from('shera_metrics').insert({
      chat_id: chatId,
      metric_type: type,
      value,
    })
  } catch {
    // Metrics should never crash the main flow
    console.error(`[shera-metrics] Failed to track ${type} for ${chatId}`)
  }
}

/** Get aggregated metrics for the admin dashboard */
export async function getMetricsSummary(days: number = 30): Promise<{
  totalConversations: number
  totalBookings: number
  conversionRate: number
  avgMessagesToBooking: number
  dropOffsByState: Record<string, number>
  errorRate: number
  imageSuccessRate: number
  dailyConversations: Array<{ date: string; count: number }>
  dailyBookings: Array<{ date: string; count: number }>
}> {
  const supabase = getSupabaseAdmin()
  const since = new Date(Date.now() - days * 86400000).toISOString()

  const [
    { count: totalConversations },
    { count: totalBookings },
    { count: totalFailures },
    { count: totalImageSuccess },
    { count: totalImageFailure },
    { data: dropOffs },
    { data: bookingMessages },
    { data: dailyConvos },
    { data: dailyBooks },
  ] = await Promise.all([
    supabase.from('shera_metrics').select('*', { count: 'exact', head: true })
      .eq('metric_type', 'conversation_started').gte('created_at', since),
    supabase.from('shera_metrics').select('*', { count: 'exact', head: true })
      .eq('metric_type', 'booking_created').gte('created_at', since),
    supabase.from('shera_metrics').select('*', { count: 'exact', head: true })
      .eq('metric_type', 'llm_failure').gte('created_at', since),
    supabase.from('shera_metrics').select('*', { count: 'exact', head: true })
      .eq('metric_type', 'image_delivery_success').gte('created_at', since),
    supabase.from('shera_metrics').select('*', { count: 'exact', head: true })
      .eq('metric_type', 'image_delivery_failure').gte('created_at', since),
    supabase.from('shera_metrics').select('value')
      .eq('metric_type', 'conversation_dropped').gte('created_at', since),
    supabase.from('shera_metrics').select('value')
      .eq('metric_type', 'booking_created').gte('created_at', since),
    supabase.from('shera_metrics').select('created_at')
      .eq('metric_type', 'conversation_started').gte('created_at', since)
      .order('created_at', { ascending: true }),
    supabase.from('shera_metrics').select('created_at')
      .eq('metric_type', 'booking_created').gte('created_at', since)
      .order('created_at', { ascending: true }),
  ])

  const tc = totalConversations ?? 0
  const tb = totalBookings ?? 0
  const tf = totalFailures ?? 0
  const tis = totalImageSuccess ?? 0
  const tif = totalImageFailure ?? 0

  // Drop-offs by state
  const dropOffsByState: Record<string, number> = {}
  for (const d of dropOffs ?? []) {
    const state = (d.value as any)?.state || 'unknown'
    dropOffsByState[state] = (dropOffsByState[state] || 0) + 1
  }

  // Average messages to booking
  const msgCounts = (bookingMessages ?? [])
    .map(b => (b.value as any)?.message_count || 0)
    .filter(n => n > 0)
  const avgMessagesToBooking = msgCounts.length > 0
    ? Math.round(msgCounts.reduce((a, b) => a + b, 0) / msgCounts.length)
    : 0

  // Daily aggregation helper
  function aggregateDaily(items: Array<{ created_at: string }> | null): Array<{ date: string; count: number }> {
    const byDate: Record<string, number> = {}
    for (const item of items ?? []) {
      const date = item.created_at.slice(0, 10)
      byDate[date] = (byDate[date] || 0) + 1
    }
    return Object.entries(byDate).map(([date, count]) => ({ date, count }))
  }

  return {
    totalConversations: tc,
    totalBookings: tb,
    conversionRate: tc > 0 ? Math.round((tb / tc) * 100) : 0,
    avgMessagesToBooking,
    dropOffsByState,
    errorRate: tc > 0 ? Math.round((tf / tc) * 100) : 0,
    imageSuccessRate: (tis + tif) > 0 ? Math.round((tis / (tis + tif)) * 100) : 100,
    dailyConversations: aggregateDaily(dailyConvos),
    dailyBookings: aggregateDaily(dailyBooks),
  }
}
