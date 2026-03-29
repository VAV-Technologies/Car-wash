import { NextResponse } from 'next/server'
import { scoreAndPickKeyword } from '@/lib/agents/dimas/researcher'
import { generatePost } from '@/lib/agents/dimas/writer'
import { publishPost } from '@/lib/agents/dimas/publisher'
import { getSupabaseClient } from '@/lib/agents/dimas/config'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET() {
  const supabase = getSupabaseClient()

  try {
    await supabase.from('agent_logs').insert({ action: 'daily_start', details: { timestamp: new Date().toISOString() } })

    // Step 1: Research
    const keyword = await scoreAndPickKeyword()
    if (!keyword) {
      await supabase.from('agent_logs').insert({ action: 'daily_skip', details: { reason: 'No keyword found' } })
      return NextResponse.json({ ok: true, skipped: true, reason: 'No keyword found' })
    }

    await supabase.from('agent_logs').insert({ action: 'research', details: { keyword: keyword.keyword, intent: keyword.intent } })

    // Step 2: Write
    const post = await generatePost(keyword)
    await supabase.from('agent_logs').insert({ action: 'write', details: { title: post.title, word_count: post.word_count } })

    // Step 3: Publish
    const published = await publishPost(post)

    return NextResponse.json({
      ok: true,
      keyword: keyword.keyword,
      title: post.title,
      slug: post.slug,
      word_count: post.word_count,
      post_id: published.id,
    })
  } catch (err: any) {
    console.error('[dimas-daily] Error:', err)
    await supabase.from('agent_logs').insert({ action: 'error', details: { step: 'daily', error: err.message } }).catch(() => {})
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
