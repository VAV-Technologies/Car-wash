import { getAnthropicClient } from './researcher'
import { DIMAS_CONFIG, DIMAS_BRAND_CONTEXT, getSupabaseClient } from './config'

interface GeneratedPost {
  title: string
  slug: string
  content: string
  cover_image_url: string | null
  meta_title: string
  meta_description: string
  target_keyword: string
  secondary_keywords: string[]
  word_count: number
  estimated_reading_time: number
  search_intent: string
  content_type: string
}

// Translate Indonesian car terms to English for better image results
const KEYWORD_TRANSLATIONS: Record<string, string> = {
  'mobil': 'car', 'cuci': 'wash', 'detailing': 'detailing', 'merawat': 'car care',
  'wax': 'car wax', 'poles': 'car polish', 'interior': 'car interior', 'eksterior': 'car exterior',
  'ban': 'tire', 'velg': 'wheel rim', 'cat': 'car paint', 'gores': 'car scratch',
  'listrik': 'electric car', 'SUV': 'SUV', 'sedan': 'sedan', 'hatchback': 'hatchback',
  'road trip': 'road trip', 'modifikasi': 'car modification', 'aksesoris': 'car accessories',
  'F1': 'formula one racing', 'balap': 'racing', 'mesin': 'car engine',
}

function translateToEnglish(keyword: string): string {
  let result = keyword.toLowerCase()
  for (const [id, en] of Object.entries(KEYWORD_TRANSLATIONS)) {
    result = result.replace(new RegExp(id, 'gi'), en)
  }
  return result.trim()
}

// Map keyword topics to guaranteed-good Pexels search terms
function getImageSearchTerm(keyword: string): string {
  const kw = keyword.toLowerCase()
  if (kw.includes('f1') || kw.includes('formula')) return 'formula one racing car'
  if (kw.includes('listrik') || kw.includes('ev') || kw.includes('electric')) return 'electric car charging'
  if (kw.includes('cuci') || kw.includes('wash')) return 'car wash cleaning'
  if (kw.includes('detail') || kw.includes('poles') || kw.includes('wax') || kw.includes('coating')) return 'car detailing polish'
  if (kw.includes('interior')) return 'car interior luxury'
  if (kw.includes('road trip') || kw.includes('perjalanan')) return 'road trip highway scenic'
  if (kw.includes('modifikasi') || kw.includes('modification')) return 'modified car custom'
  if (kw.includes('suv')) return 'SUV car'
  if (kw.includes('sedan')) return 'sedan car luxury'
  if (kw.includes('hybrid')) return 'hybrid car technology'
  if (kw.includes('mesin') || kw.includes('engine')) return 'car engine mechanic'
  if (kw.includes('ban') || kw.includes('tire') || kw.includes('velg')) return 'car tire wheel'
  if (kw.includes('cat') || kw.includes('paint') || kw.includes('gores')) return 'car paint shiny'
  if (kw.includes('beli') || kw.includes('buy')) return 'car dealership showroom'
  if (kw.includes('aksesoris') || kw.includes('accessories')) return 'car accessories'
  if (kw.includes('toyota')) return 'Toyota car'
  if (kw.includes('honda')) return 'Honda car'
  if (kw.includes('wuling')) return 'electric car compact'
  if (kw.includes('hyundai')) return 'Hyundai car'
  if (kw.includes('putih') || kw.includes('white')) return 'white car clean'
  if (kw.includes('merawat') || kw.includes('care') || kw.includes('tips')) return 'car care maintenance'
  return 'car automotive clean'
}

async function fetchCoverImage(keyword: string): Promise<string | null> {
  const supabase = getSupabaseClient()
  const pexelsKey = process.env.PEXELS_API_KEY
  const searchTerm = getImageSearchTerm(keyword)

  // Get existing image URLs to avoid duplicates
  const { data: existingPosts } = await supabase
    .from('blog_posts')
    .select('cover_image_url')
    .not('cover_image_url', 'is', null)
  const usedUrls = new Set((existingPosts || []).map((p: any) => p.cover_image_url))

  if (pexelsKey) {
    // Search with mapped term + random page offset for variety
    const page = Math.floor(Math.random() * 5) + 1
    try {
      const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(searchTerm)}&per_page=15&orientation=landscape&page=${page}`, {
        headers: { 'Authorization': pexelsKey },
      })
      if (res.ok) {
        const data = await res.json()
        if (data.photos && data.photos.length > 0) {
          // Find a photo not already used
          for (const photo of data.photos) {
            const url = photo.src?.large2x || photo.src?.large
            if (url && !usedUrls.has(url)) return url
          }
          // All used — just pick one anyway
          const photo = data.photos[0]
          return photo.src?.large2x || photo.src?.large
        }
      }
    } catch {}

    // Broader fallback
    try {
      const fallbackTerms = ['car wash detailing', 'luxury car', 'car driving road', 'automotive garage']
      const fallback = fallbackTerms[Math.floor(Math.random() * fallbackTerms.length)]
      const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(fallback)}&per_page=15&orientation=landscape&page=${Math.floor(Math.random() * 3) + 1}`, {
        headers: { 'Authorization': pexelsKey },
      })
      if (res.ok) {
        const data = await res.json()
        if (data.photos && data.photos.length > 0) {
          for (const photo of data.photos) {
            const url = photo.src?.large2x || photo.src?.large
            if (url && !usedUrls.has(url)) return url
          }
        }
      }
    } catch {}
  }

  // Last fallback
  const seed = keyword.replace(/\s+/g, '').slice(0, 10) + Date.now() % 10000
  return `https://picsum.photos/seed/${seed}/1200/630`
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export async function generatePost(keyword: { keyword: string; intent: string; content_type: string; category?: string }): Promise<GeneratedPost> {
  const client = await getAnthropicClient()
  const supabase = getSupabaseClient()
  const category = keyword.category || 'tips'

  // Category-specific writing instructions
  const categoryInstructions: Record<string, string> = {
    'tips': 'This is a TIPS article. Write practical, actionable advice. Use numbered steps or clear takeaways. Reader should be able to apply these tips immediately. Keep it concise and hands-on.',
    'guides': 'This is a GUIDE article. Write a comprehensive, in-depth walkthrough. Cover the topic thoroughly from start to finish. Include detailed explanations, prerequisites, and step-by-step instructions. Longer and more thorough than a tips article.',
    'news': 'This is a NEWS article. Write about recent developments, trends, or announcements in the automotive world. Be timely and informative. Cover the who/what/when/where/why. Include context and what it means for Indonesian car owners.',
  }
  const categoryInstruction = categoryInstructions[category] || categoryInstructions['tips']

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
Category: ${category.toUpperCase()}
${categoryInstruction}
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
Include internal links as <a href="/tips/slug">text</a> where relevant
Start with a hook, not generic openings
End with a conclusion
Use specific examples and numbers
Never use em dashes
Only mention Castudio where it naturally fits

EXTERNAL LINKS (SEO best practice):
Where relevant, include 1-3 external links to authoritative sources. These build trust and improve SEO. Use <a href="URL" target="_blank" rel="noopener">anchor text</a>.
Good sources to link to (only when genuinely relevant to the topic):
Wikipedia for definitions or background context
Official manufacturer sites (toyota.co.id, honda-indonesia.com, etc.) for car specs
Kompas Otomotif, Oto.com, or GridOto for Indonesian automotive news
Formula1.com for F1 content
Government sites (dephub.go.id) for traffic regulations
DO NOT force external links. Only include them when they genuinely add value. Some posts won't need any external links. That's fine.`
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

  // Fetch cover image
  const coverImage = await fetchCoverImage(keyword.keyword)

  return {
    title,
    slug: generateSlug(title),
    content,
    cover_image_url: coverImage,
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
