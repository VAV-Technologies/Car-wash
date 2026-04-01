import { NextResponse } from 'next/server'
import { scoreAndPickKeyword } from '@/lib/agents/dimas/researcher'
import { generatePost } from '@/lib/agents/dimas/writer'
import { getSupabaseClient } from '@/lib/agents/dimas/config'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * Daily blog pipeline — runs research + write + publish in a single call.
 * Triggered by Vercel cron at 23:00 UTC (6 AM Jakarta).
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseClient()

  try {
    await supabase.from('agent_logs').insert({ action: 'daily_start', details: { timestamp: new Date().toISOString() } })

    // 1. Research — pick a keyword
    let keyword: { keyword: string; intent: string; content_type: string; category?: string } | null = null
    try {
      keyword = await scoreAndPickKeyword()
    } catch (err: any) {
      await supabase.from('agent_logs').insert({ action: 'error', details: { step: 'research', error: err?.message || String(err) } })
      return NextResponse.json({ ok: false, error: 'Research failed: ' + (err?.message || '') }, { status: 500 })
    }

    if (!keyword) {
      await supabase.from('agent_logs').insert({ action: 'daily_skip', details: { reason: 'No keyword found' } })
      return NextResponse.json({ ok: true, skipped: true, reason: 'No keyword found' })
    }

    await supabase.from('agent_logs').insert({
      action: 'research',
      details: { keyword: keyword.keyword, intent: keyword.intent, content_type: keyword.content_type },
    })

    // 2. Write — generate the blog post
    let post
    try {
      post = await generatePost(keyword)
    } catch (err: any) {
      await supabase.from('agent_logs').insert({ action: 'error', details: { step: 'write', error: err?.message || String(err), keyword: keyword.keyword } })
      return NextResponse.json({ ok: false, error: 'Write failed: ' + (err?.message || '') }, { status: 500 })
    }

    await supabase.from('agent_logs').insert({
      action: 'write',
      details: { title: post.title, slug: post.slug, word_count: post.word_count, keyword: keyword.keyword },
    })

    // 3. Publish — insert into blog_posts
    const { data: saved } = await supabase
      .from('blog_posts')
      .insert({
        title: post.title,
        slug: post.slug,
        content: post.content,
        cover_image_url: post.cover_image_url || null,
        excerpt: post.content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 200) + '...',
        category: keyword.category || 'tips',
        tags: post.secondary_keywords || [],
        author_name: 'Dimas',
        author_role: 'SEO Content Writer',
        meta_title: post.meta_title,
        meta_description: post.meta_description,
        reading_time_minutes: post.estimated_reading_time,
        is_published: true,
        published_at: new Date().toISOString(),
        target_keyword: post.target_keyword,
        word_count: post.word_count,
        search_intent: post.search_intent,
        content_type: post.content_type,
      })
      .select('id')
      .single()

    if (saved) {
      await supabase.from('keyword_research').update({ status: 'published', blog_post_id: saved.id }).eq('keyword', keyword.keyword)
      await supabase.from('agent_logs').insert({
        action: 'publish',
        details: { post_id: saved.id, title: post.title, slug: post.slug, word_count: post.word_count },
      })
    }

    // Ping Google (best effort)
    try {
      const { pingIndexing, submitSitemap } = await import('@/lib/agents/dimas/gsc')
      const { DIMAS_CONFIG } = await import('@/lib/agents/dimas/config')
      await pingIndexing(`${DIMAS_CONFIG.blogBaseUrl}/${post.slug}`).catch(() => {})
      await submitSitemap(`${DIMAS_CONFIG.blogBaseUrl.replace(/\/tips$/, '')}/api/sitemap.xml`).catch(() => {})
    } catch {}

    return NextResponse.json({ ok: true, title: post.title, slug: post.slug, post_id: saved?.id })
  } catch (err: any) {
    console.error('[dimas-daily] Error:', err)
    await supabase.from('agent_logs').insert({ action: 'error', details: { error: err.message } }).catch(() => {})
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
