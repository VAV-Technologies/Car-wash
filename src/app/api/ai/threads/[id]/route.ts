import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('ai_chat_threads')
    .select('id, title, metadata, archived_at, last_message_at, created_at, created_by')
    .eq('id', id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ thread: data })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { title?: string; metadata?: Record<string, unknown> } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const update: Record<string, unknown> = {}
  if (typeof body.title === 'string') update.title = body.title.slice(0, 200)
  if (body.metadata && typeof body.metadata === 'object') {
    const { data: existing } = await supabase
      .from('ai_chat_threads')
      .select('metadata')
      .eq('id', id)
      .maybeSingle()
    update.metadata = { ...(existing?.metadata ?? {}), ...body.metadata }
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No updatable fields' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('ai_chat_threads')
    .update(update)
    .eq('id', id)
    .select('id, title, metadata, archived_at, last_message_at, created_at, created_by')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ thread: data })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const hard = req.nextUrl.searchParams.get('hard') === '1'

  if (hard) {
    const { error } = await supabase.from('ai_chat_threads').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, mode: 'hard' })
  }

  const { error } = await supabase
    .from('ai_chat_threads')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, mode: 'soft' })
}
