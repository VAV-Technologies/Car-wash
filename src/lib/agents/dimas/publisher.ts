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

  // Generate excerpt from content (strip HTML, first 200 chars)
  const excerpt = post.content
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200) + '...'

  // Map content_type to category
  const categoryMap: Record<string, string> = {
    'how-to': 'guides',
    'guide': 'guides',
    'listicle': 'tips',
    'comparison': 'tips',
    'explainer': 'tips',
  }

  // Insert using the EXISTING blog_posts schema
  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt,
      category: categoryMap[post.content_type] || 'tips',
      tags: post.secondary_keywords || [],
      author_name: 'Dimas',
      author_role: 'SEO Content Writer',
      meta_title: post.meta_title,
      meta_description: post.meta_description,
      reading_time_minutes: post.estimated_reading_time,
      is_published: true,
      published_at: new Date().toISOString(),
      // SEO-specific fields (added via ALTER TABLE)
      target_keyword: post.target_keyword,
      word_count: post.word_count,
      search_intent: post.search_intent,
      content_type: post.content_type,
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
