import { getSupabaseClient } from './config'
import { submitSitemap, pingIndexing } from './gsc'
import { DIMAS_CONFIG } from './config'

interface PostData {
  title: string
  slug: string
  content: string
  meta_title: string
  meta_description: string
  target_keyword: string
  secondary_keywords: string[]
  word_count: number
  estimated_reading_time: number
  search_intent: string
  content_type: string
}

export async function publishPost(post: PostData) {
  const supabase = getSupabaseClient()

  // Insert blog post
  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      ...post,
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw new Error(`Failed to publish: ${error.message}`)

  // Update keyword_research status
  await supabase
    .from('keyword_research')
    .update({ status: 'published', blog_post_id: data.id })
    .eq('keyword', post.target_keyword)

  // Ping Google indexing
  const postUrl = `${DIMAS_CONFIG.blogBaseUrl}/${post.slug}`
  await pingIndexing(postUrl).catch(() => {})

  // Submit sitemap
  const sitemapUrl = `${DIMAS_CONFIG.blogBaseUrl.replace(/\/tips$/, '')}/api/sitemap.xml`
  await submitSitemap(sitemapUrl).catch(() => {})

  // Log
  await supabase.from('agent_logs').insert({
    action: 'publish',
    details: { post_id: data.id, keyword: post.target_keyword, slug: post.slug, word_count: post.word_count },
  })

  return data
}
