import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const limit = Math.min(Number(req.nextUrl.searchParams.get('limit') ?? 100), 500)
  const tool = req.nextUrl.searchParams.get('tool')
  const successParam = req.nextUrl.searchParams.get('success')
  const threadId = req.nextUrl.searchParams.get('thread')

  let query = supabase
    .from('ai_action_log')
    .select('id, thread_id, message_id, user_id, user_email, tool_name, params, result, success, error, affected_ids, duration_ms, created_at, finalized_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (tool) query = query.eq('tool_name', tool)
  if (successParam === 'true') query = query.eq('success', true)
  else if (successParam === 'false') query = query.eq('success', false)
  if (threadId) query = query.eq('thread_id', threadId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ rows: data ?? [] })
}
