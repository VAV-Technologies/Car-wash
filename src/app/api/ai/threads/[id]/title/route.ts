import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getJohanOpenAIClient, getJohanSettings } from '@/lib/agents/johan/settings'

export const runtime = 'nodejs'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: threadId } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: thread } = await supabase
    .from('ai_chat_threads')
    .select('title')
    .eq('id', threadId)
    .maybeSingle()
  if (!thread) return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
  if (thread.title && thread.title !== 'New chat') {
    return NextResponse.json({ title: thread.title, skipped: true })
  }

  const { data: msgs } = await supabase
    .from('ai_chat_messages')
    .select('role, content')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })
    .limit(4)

  const firstUser = (msgs || []).find((m: any) => m.role === 'user')?.content
  if (!firstUser) return NextResponse.json({ title: 'New chat', skipped: true })

  try {
    const openai = await getJohanOpenAIClient()
    const settings = await getJohanSettings()
    const completion = await openai.chat.completions.create(
      {
        model: settings.model,
        max_completion_tokens: 30,
        messages: [
          {
            role: 'system',
            content:
              'Generate a 4-6 word descriptive title for the following user message. Plain text, no quotes, no period. Match the user\'s language (Indonesian or English).',
          },
          { role: 'user', content: firstUser.slice(0, 500) },
        ],
      },
      { timeout: 20_000 },
    )
    let title = completion.choices[0]?.message?.content?.trim() || 'New chat'
    title = title.replace(/^["']|["']$/g, '').slice(0, 80)

    await supabase.from('ai_chat_threads').update({ title }).eq('id', threadId)
    return NextResponse.json({ title })
  } catch (err: any) {
    return NextResponse.json({ title: 'New chat', error: err?.message || String(err) }, { status: 200 })
  }
}
