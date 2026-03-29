import { NextResponse } from 'next/server'
import { scoreAndPickKeyword } from '@/lib/agents/dimas/researcher'
import { generatePost } from '@/lib/agents/dimas/writer'
import { publishPost } from '@/lib/agents/dimas/publisher'
import { getSupabaseClient } from '@/lib/agents/dimas/config'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * Daily pipeline — split into steps via query param to stay within timeout.
 *
 * GET /api/cron/dimas/daily              → Step 1: Research (picks keyword, triggers step 2)
 * GET /api/cron/dimas/daily?step=write   → Step 2: Write post (triggers step 3)
 * GET /api/cron/dimas/daily?step=publish → Step 3: Publish
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const step = searchParams.get('step') || 'research'
  const supabase = getSupabaseClient()
  const baseUrl = req.url.split('/api/')[0]

  try {
    // ── STEP 1: Research ──
    if (step === 'research') {
      await supabase.from('agent_logs').insert({ action: 'daily_start', details: { timestamp: new Date().toISOString() } })

      let keyword: { keyword: string; intent: string; content_type: string } | null = null
      try {
        keyword = await scoreAndPickKeyword()
      } catch (researchErr: any) {
        await supabase.from('agent_logs').insert({ action: 'error', details: { step: 'research', error: researchErr?.message || String(researchErr) } })
        return NextResponse.json({ ok: false, error: 'Research failed: ' + (researchErr?.message || '') }, { status: 500 })
      }
      if (!keyword) {
        await supabase.from('agent_logs').insert({ action: 'daily_skip', details: { reason: 'No keyword found' } })
        return NextResponse.json({ ok: true, skipped: true, reason: 'No keyword found' })
      }

      // Store keyword for next step
      await supabase.from('agent_logs').insert({
        action: 'research',
        details: { keyword: keyword.keyword, intent: keyword.intent, content_type: keyword.content_type },
      })

      // Trigger step 2 (fire-and-forget)
      const writeUrl = `${baseUrl}/api/cron/dimas/daily?step=write&keyword=${encodeURIComponent(keyword.keyword)}&intent=${encodeURIComponent(keyword.intent)}&content_type=${encodeURIComponent(keyword.content_type)}`
      fetch(writeUrl).catch(() => {})

      return NextResponse.json({ ok: true, step: 'research', keyword: keyword.keyword })
    }

    // ── STEP 2: Write ──
    if (step === 'write') {
      const keyword = {
        keyword: searchParams.get('keyword') || '',
        intent: searchParams.get('intent') || 'informational',
        content_type: searchParams.get('content_type') || 'guide',
      }

      if (!keyword.keyword) {
        return NextResponse.json({ ok: false, error: 'No keyword provided' }, { status: 400 })
      }

      const post = await generatePost(keyword)

      // Store post data for publish step
      await supabase.from('agent_logs').insert({
        action: 'write',
        details: { title: post.title, slug: post.slug, word_count: post.word_count, keyword: keyword.keyword },
      })

      // Save and publish directly (no separate step needed)
      const { data: saved } = await supabase
        .from('blog_posts')
        .insert({
          title: post.title,
          slug: post.slug,
          content: post.content,
          excerpt: post.content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 200) + '...',
          category: 'tips',
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

      // Update keyword research
      if (saved) {
        await supabase.from('keyword_research').update({ status: 'published', blog_post_id: saved.id }).eq('keyword', keyword.keyword)
        await supabase.from('agent_logs').insert({ action: 'publish', details: { post_id: saved.id, title: post.title, slug: post.slug, word_count: post.word_count } })
      }

      return NextResponse.json({ ok: true, step: 'write+publish', title: post.title, slug: post.slug, post_id: saved?.id })
    }

    // ── STEP 3: Publish ──
    if (step === 'publish') {
      const postId = searchParams.get('post_id')
      if (!postId) return NextResponse.json({ ok: false, error: 'No post_id' }, { status: 400 })

      // Set published
      await supabase
        .from('blog_posts')
        .update({ is_published: true, published_at: new Date().toISOString() })
        .eq('id', postId)

      // Get post data for logging
      const { data: post } = await supabase
        .from('blog_posts')
        .select('title, slug, target_keyword, word_count')
        .eq('id', postId)
        .single()

      // Update keyword_research
      if (post?.target_keyword) {
        await supabase
          .from('keyword_research')
          .update({ status: 'published', blog_post_id: postId })
          .eq('keyword', post.target_keyword)
      }

      // Ping Google (best effort)
      try {
        const { pingIndexing, submitSitemap } = await import('@/lib/agents/dimas/gsc')
        const { DIMAS_CONFIG } = await import('@/lib/agents/dimas/config')
        await pingIndexing(`${DIMAS_CONFIG.blogBaseUrl}/${post?.slug}`).catch(() => {})
        await submitSitemap(`${DIMAS_CONFIG.blogBaseUrl.replace(/\/tips$/, '')}/api/sitemap.xml`).catch(() => {})
      } catch {}

      await supabase.from('agent_logs').insert({
        action: 'publish',
        details: { post_id: postId, title: post?.title, slug: post?.slug, keyword: post?.target_keyword, word_count: post?.word_count },
      })

      return NextResponse.json({ ok: true, step: 'publish', post_id: postId, title: post?.title })
    }

    return NextResponse.json({ ok: false, error: `Unknown step: ${step}` }, { status: 400 })
  } catch (err: any) {
    console.error(`[dimas-daily] Error at step ${step}:`, err)
    await supabase.from('agent_logs').insert({ action: 'error', details: { step, error: err.message } }).catch(() => {})
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
