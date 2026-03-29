import { getAnthropicClient } from './researcher'
import { DIMAS_CONFIG, DIMAS_BRAND_CONTEXT, getSupabaseClient } from './config'

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

  // Single Claude call: generate title, meta, and full content together
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: `You are an expert SEO content writer for Castudio's Indonesian automotive lifestyle blog. Write in Bahasa Indonesia. Never use em dashes. Write like a car enthusiast, not a corporate brand. Direct, conversational, knowledgeable.\n\n${DIMAS_BRAND_CONTEXT}`,
    messages: [{
      role: 'user',
      content: `Write a complete SEO blog post targeting: "${keyword.keyword}"
Search intent: ${keyword.intent}
Content type: ${keyword.content_type}

Existing posts to link to internally:
${existingLinks || 'None yet'}

OUTPUT FORMAT (follow exactly):
---META---
TITLE: [SEO title under 60 chars including the keyword]
META_TITLE: [title tag under 60 chars]
META_DESCRIPTION: [under 155 chars with keyword]
SECONDARY_KEYWORDS: [comma separated related keywords]
---CONTENT---
[Full blog post as clean HTML with h2, h3, p, ul, li tags. NO h1. 1200-1800 words.]

RULES:
Write in Bahasa Indonesia
Short paragraphs (2-3 sentences max)
Use "${keyword.keyword}" naturally 3-5 times
Include internal links as <a href="/tips/slug">text</a>
Start with a hook, not generic openings
End with a conclusion
Use specific examples and numbers
Never use em dashes
Only mention Castudio where it naturally fits`
    }],
  })

  const fullText = response.content.find(b => b.type === 'text')?.text || ''

  // Parse the structured output
  const metaSection = fullText.split('---CONTENT---')[0] || ''
  const contentSection = fullText.split('---CONTENT---')[1] || fullText

  const titleMatch = metaSection.match(/TITLE:\s*(.+)/i)
  const metaTitleMatch = metaSection.match(/META_TITLE:\s*(.+)/i)
  const metaDescMatch = metaSection.match(/META_DESCRIPTION:\s*(.+)/i)
  const secondaryMatch = metaSection.match(/SECONDARY_KEYWORDS:\s*(.+)/i)

  const title = (titleMatch?.[1] || keyword.keyword).trim()
  const content = contentSection.trim()
  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length

  return {
    title,
    slug: generateSlug(title),
    content,
    meta_title: (metaTitleMatch?.[1] || title).trim().slice(0, 60),
    meta_description: (metaDescMatch?.[1] || '').trim().slice(0, 155),
    target_keyword: keyword.keyword,
    secondary_keywords: (secondaryMatch?.[1] || '').split(',').map(s => s.trim()).filter(Boolean),
    word_count: wordCount,
    estimated_reading_time: Math.ceil(wordCount / 200),
    search_intent: keyword.intent,
    content_type: keyword.content_type,
  }
}
