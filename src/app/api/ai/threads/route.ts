import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const includeArchived = req.nextUrl.searchParams.get('archived') === '1'

  let query = supabase
    .from('ai_chat_threads')
    .select('id, title, metadata, archived_at, last_message_at, created_at, created_by')
    .order('last_message_at', { ascending: false })
    .limit(200)

  if (!includeArchived) query = query.is('archived_at', null)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ threads: data ?? [] })
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { title?: string } = {}
  try {
    body = await req.json()
  } catch {}

  const { data, error } = await supabase
    .from('ai_chat_threads')
    .insert({
      created_by: user.id,
      title: body.title || 'New chat',
    })
    .select('id, title, metadata, archived_at, last_message_at, created_at, created_by')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ thread: data }, { status: 201 })
}
