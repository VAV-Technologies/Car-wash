import { getAnthropicClient } from './researcher'
import { DIMAS_CONFIG, DIMAS_BRAND_CONTEXT, getSupabaseClient } from './config'

interface PostOutline {
  title: string
  meta_title: string
  meta_description: string
  sections: Array<{
    heading: string
    level: string
    target_words: number
    key_points: string[]
    internal_links: string[]
  }>
}

interface GeneratedPost {
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

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export async function generatePost(keyword: { keyword: string; intent: string; content_type: string }): Promise<GeneratedPost> {
  const client = await getAnthropicClient()
  const supabase = getSupabaseClient()

  // Get existing posts for internal linking
  const { data: existingPosts } = await supabase
    .from('blog_posts')
    .select('title, slug')
    .eq('is_published', true)
    .limit(20)

  const existingLinks = (existingPosts || []).map((p: any) => `"${p.title}" (/tips/${p.slug})`).join('\n')

  // Step 1: Generate outline
  const outlineResponse = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: `You are an expert SEO content strategist for an Indonesian automotive lifestyle blog. Return valid JSON only.\n\n${DIMAS_BRAND_CONTEXT}`,
    messages: [{
      role: 'user',
      content: `Create a blog post outline targeting the keyword "${keyword.keyword}".
Search intent: ${keyword.intent}
Content type: ${keyword.content_type}
Language: Indonesian (Bahasa Indonesia)

Existing posts to link to:
${existingLinks || 'None yet'}

Return JSON:
{
  "title": "SEO title under 60 chars including keyword",
  "meta_title": "SEO title tag under 60 chars",
  "meta_description": "Meta description under 155 chars with keyword",
  "secondary_keywords": ["related", "keywords"],
  "sections": [
    { "heading": "H2 heading", "level": "h2", "target_words": 200, "key_points": ["point1"], "internal_links": ["/tips/slug"] }
  ]
}`
    }],
  })

  const outlineText = outlineResponse.content.find(b => b.type === 'text')?.text || '{}'
  const jsonMatch = outlineText.match(/\{[\s\S]*\}/)
  const outline: PostOutline & { secondary_keywords?: string[] } = jsonMatch ? JSON.parse(jsonMatch[0]) : { title: keyword.keyword, meta_title: keyword.keyword, meta_description: '', sections: [] }

  // Step 2: Write full post
  const writeResponse = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: `You are an expert SEO content writer for Castudio's automotive lifestyle blog. Write in Bahasa Indonesia. Never use em dashes. Write like a car enthusiast, not a corporate brand. Direct, conversational, knowledgeable. Only mention Castudio naturally where it fits (don't force it). Output clean HTML with h2, h3, p, ul, li tags. Do NOT include h1.\n\n${DIMAS_BRAND_CONTEXT}`,
    messages: [{
      role: 'user',
      content: `Write a complete blog post following this outline:

${JSON.stringify(outline, null, 2)}

Target keyword: "${keyword.keyword}" (use naturally 3-5 times)
Secondary keywords: ${(outline.secondary_keywords || []).join(', ')}

Rules:
- Short paragraphs (2-3 sentences max)
- Include internal links as: <a href="/tips/{slug}">anchor text</a>
- Start with a hook, not "Dalam dunia..." or generic openings
- End with a clear conclusion
- Use specific examples and numbers
- Do NOT use em dashes
- Output as clean HTML`
    }],
  })

  const content = writeResponse.content.find(b => b.type === 'text')?.text || ''
  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length
  const slug = generateSlug(outline.title || keyword.keyword)

  return {
    title: outline.title || keyword.keyword,
    slug,
    content,
    meta_title: (outline.meta_title || outline.title || keyword.keyword).slice(0, 60),
    meta_description: (outline.meta_description || '').slice(0, 155),
    target_keyword: keyword.keyword,
    secondary_keywords: outline.secondary_keywords || [],
    word_count: wordCount,
    estimated_reading_time: Math.ceil(wordCount / 200),
    search_intent: keyword.intent,
    content_type: keyword.content_type,
  }
}
