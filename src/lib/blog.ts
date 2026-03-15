import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'

// --- Supabase admin client (lazy, bypasses RLS) ---
let _supabaseAdmin: SupabaseClient | null = null
function getSupabaseAdmin(): SupabaseClient | null {
  if (_supabaseAdmin) return _supabaseAdmin
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  try {
    _supabaseAdmin = createClient(url, key)
    return _supabaseAdmin
  } catch {
    return null
  }
}

// --- Types ---
export type BlogCategory = 'news' | 'insights' | 'guides' | 'company'

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image_url: string | null
  category: BlogCategory
  tags: string[]
  author_name: string
  author_role: string | null
  published_at: string | null
  created_at: string
  updated_at: string
  is_published: boolean
  meta_title: string | null
  meta_description: string | null
  reading_time_minutes: number
}

export type BlogPostListItem = Omit<BlogPost, 'content'>

// --- Sample data (fallback when DB unavailable) ---
const now = new Date().toISOString()

const samplePosts: BlogPost[] = [
  {
    id: 'sample-1',
    title: 'Why Southeast Asian SMEs Are Attracting Global Buyers',
    slug: 'southeast-asian-smes-global-buyers',
    excerpt: 'Cross-border deal activity in ASEAN has accelerated as international acquirers recognise the growth potential of well-run regional businesses. Here is what is driving the trend.',
    content: `<h2>A shifting landscape</h2><p>Over the past five years, cross-border M&A activity targeting Southeast Asian SMEs has grown steadily. Strategic acquirers from Europe, North America, and North Asia are looking beyond their saturated home markets for businesses with strong fundamentals and regional growth potential.</p><h2>What buyers are looking for</h2><p>The most sought-after targets share common traits: recurring revenue, experienced management teams, clear market positioning, and a credible growth story. Businesses in technology services, healthcare, education, and industrial distribution are seeing particular interest.</p><h2>Implications for owners</h2><p>For SME owners considering an exit, the takeaway is clear: the buyer pool is wider than ever, but preparation matters. A well-positioned business with clean financials and a compelling narrative will attract materially better outcomes than one that goes to market unprepared.</p>`,
    cover_image_url: null,
    category: 'insights',
    tags: ['M&A', 'Southeast Asia', 'Cross-border'],
    author_name: 'Nobridge Research',
    author_role: 'Market Intelligence',
    published_at: '2026-03-10T08:00:00Z',
    created_at: now,
    updated_at: now,
    is_published: true,
    meta_title: null,
    meta_description: null,
    reading_time_minutes: 4,
  },
  {
    id: 'sample-2',
    title: 'The Owner\'s Guide to Preparing Your Business for Sale',
    slug: 'preparing-your-business-for-sale',
    excerpt: 'Selling a business is one of the most consequential financial decisions an owner will make. This guide walks through the key steps to maximise value and minimise surprises.',
    content: `<h2>Start early</h2><p>The best exits are planned 12–24 months in advance. Use that time to clean up financials, resolve any outstanding legal or compliance issues, and strengthen the management team so the business isn't entirely dependent on you.</p><h2>Know your numbers</h2><p>Buyers will scrutinise your financials in detail. Make sure your revenue, EBITDA, and cash flow figures are clean, audited where possible, and presented in a way that makes the business easy to underwrite.</p><h2>Build your narrative</h2><p>Every business has a story. The best CIMs (Confidential Information Memorandums) clearly articulate what makes the business defensible, where the growth opportunity lies, and why now is the right time for a transaction.</p><h2>Choose the right advisor</h2><p>An experienced M&A advisor will help you position the business, identify the right buyers, manage the process, and negotiate terms that protect your interests through close.</p>`,
    cover_image_url: null,
    category: 'guides',
    tags: ['Exit planning', 'Valuation', 'Due diligence'],
    author_name: 'Nobridge Advisory',
    author_role: 'Client Advisory',
    published_at: '2026-03-05T08:00:00Z',
    created_at: now,
    updated_at: now,
    is_published: true,
    meta_title: null,
    meta_description: null,
    reading_time_minutes: 6,
  },
  {
    id: 'sample-3',
    title: 'Nobridge Expands Coverage Across ASEAN',
    slug: 'nobridge-expands-asean-coverage',
    excerpt: 'We are deepening our presence across Southeast Asia with new network partners in Vietnam, Thailand, and the Philippines to better serve business owners across the region.',
    content: `<h2>Growing with the region</h2><p>As deal activity across ASEAN continues to accelerate, we are expanding our on-the-ground capabilities to ensure we can serve business owners wherever they operate.</p><h2>New network partners</h2><p>Our new partnerships in Vietnam, Thailand, and the Philippines bring local legal, tax, and regulatory expertise directly into our deal teams — ensuring smoother cross-border execution and better outcomes for our clients.</p><h2>What this means for clients</h2><p>Owners across the region now have access to a firm that combines institutional-grade advisory with deep local knowledge, backed by a technology platform that reaches buyers globally.</p>`,
    cover_image_url: null,
    category: 'company',
    tags: ['Expansion', 'ASEAN', 'Network'],
    author_name: 'Nobridge Team',
    author_role: null,
    published_at: '2026-02-28T08:00:00Z',
    created_at: now,
    updated_at: now,
    is_published: true,
    meta_title: null,
    meta_description: null,
    reading_time_minutes: 3,
  },
  {
    id: 'sample-4',
    title: 'Understanding EBITDA Adjustments in SME Transactions',
    slug: 'ebitda-adjustments-sme-transactions',
    excerpt: 'EBITDA adjustments can materially impact how a business is valued. This article explains the most common adjustments and how to present them credibly to buyers.',
    content: `<h2>Why adjustments matter</h2><p>In SME transactions, reported EBITDA rarely tells the full story. Owner compensation, one-off expenses, and non-recurring items all need to be normalised to reflect the true earning power of the business.</p><h2>Common adjustments</h2><p>The most frequently accepted adjustments include: above-market owner compensation, one-time legal or consulting fees, personal expenses run through the business, and non-recurring restructuring costs.</p><h2>Credibility is key</h2><p>Buyers will push back on aggressive adjustments. Every add-back should be clearly documented, defensible, and presented with supporting evidence. An advisor can help you strike the right balance between maximising value and maintaining credibility.</p>`,
    cover_image_url: null,
    category: 'insights',
    tags: ['EBITDA', 'Valuation', 'Financial analysis'],
    author_name: 'Nobridge Research',
    author_role: 'Market Intelligence',
    published_at: '2026-02-20T08:00:00Z',
    created_at: now,
    updated_at: now,
    is_published: true,
    meta_title: null,
    meta_description: null,
    reading_time_minutes: 5,
  },
  {
    id: 'sample-5',
    title: 'Deal Activity in Asia: Q1 2026 Market Update',
    slug: 'q1-2026-asia-market-update',
    excerpt: 'A snapshot of M&A activity across Asia in early 2026, including sector trends, valuation multiples, and what we are seeing in our own pipeline.',
    content: `<h2>Market overview</h2><p>M&A deal volume across Asia remained robust in Q1 2026, with particular strength in technology services, healthcare, and industrial distribution. Cross-border transactions accounted for an increasing share of total activity.</p><h2>Valuation trends</h2><p>Median EBITDA multiples for SME transactions in the region held steady at 5–7x, with premium businesses commanding 8–10x. Buyers continue to pay up for recurring revenue, strong management teams, and clear growth trajectories.</p><h2>Our pipeline</h2><p>We are seeing strong buyer interest across our active mandates, with particular demand for businesses in the $5M–$25M enterprise value range. The supply of quality deal flow remains the primary constraint.</p>`,
    cover_image_url: null,
    category: 'news',
    tags: ['Market update', 'Asia', 'Q1 2026'],
    author_name: 'Nobridge Research',
    author_role: 'Market Intelligence',
    published_at: '2026-03-14T08:00:00Z',
    created_at: now,
    updated_at: now,
    is_published: true,
    meta_title: null,
    meta_description: null,
    reading_time_minutes: 4,
  },
  {
    id: 'sample-6',
    title: 'How to Choose the Right M&A Advisor for Your Business',
    slug: 'choosing-the-right-ma-advisor',
    excerpt: 'Not all advisors are created equal. Here is what to look for when selecting a firm to represent you in one of the most important transactions of your life.',
    content: `<h2>Track record matters</h2><p>Ask for case studies and references from completed transactions in your industry and size range. A firm that has successfully closed deals similar to yours will navigate the process more effectively.</p><h2>Alignment of incentives</h2><p>The best advisory relationships are built on aligned incentives. Success-fee models ensure your advisor is motivated to maximise your outcome, not just generate activity.</p><h2>Process and communication</h2><p>A good advisor will lay out a clear process timeline, set expectations upfront, and keep you informed at every stage. If a firm can't articulate their process clearly, that's a red flag.</p><h2>Regional expertise</h2><p>For cross-border transactions in Asia, local knowledge is not optional. Your advisor should understand the regulatory landscape, cultural nuances, and buyer dynamics in your market.</p>`,
    cover_image_url: null,
    category: 'guides',
    tags: ['Advisory', 'M&A process', 'Due diligence'],
    author_name: 'Nobridge Advisory',
    author_role: 'Client Advisory',
    published_at: '2026-02-15T08:00:00Z',
    created_at: now,
    updated_at: now,
    is_published: true,
    meta_title: null,
    meta_description: null,
    reading_time_minutes: 5,
  },
  {
    id: 'sample-7',
    title: 'What Makes a Business "Investor-Ready" in Asia',
    slug: 'investor-ready-business-asia',
    excerpt: 'Investor readiness goes beyond clean financials. Here is what sophisticated buyers actually look for when evaluating acquisition targets in the region.',
    content: `<h2>Beyond the numbers</h2><p>While strong financials are table stakes, the most attractive businesses share traits that go beyond revenue and profit. Management depth, customer diversification, and operational systems all matter.</p>`,
    cover_image_url: null,
    category: 'insights',
    tags: ['Investor readiness', 'Due diligence'],
    author_name: 'Nobridge Advisory',
    author_role: 'Client Advisory',
    published_at: '2026-02-10T08:00:00Z',
    created_at: now, updated_at: now, is_published: true,
    meta_title: null, meta_description: null, reading_time_minutes: 4,
  },
  {
    id: 'sample-8',
    title: 'Cross-Border Due Diligence: Common Pitfalls',
    slug: 'cross-border-due-diligence-pitfalls',
    excerpt: 'Due diligence in cross-border transactions introduces unique challenges. This article covers the most common pitfalls and how to avoid them.',
    content: `<h2>Regulatory complexity</h2><p>Each jurisdiction has its own corporate governance, tax, and compliance requirements. Failing to account for these early can derail a transaction.</p>`,
    cover_image_url: null,
    category: 'guides',
    tags: ['Due diligence', 'Cross-border'],
    author_name: 'Nobridge Research',
    author_role: 'Market Intelligence',
    published_at: '2026-02-05T08:00:00Z',
    created_at: now, updated_at: now, is_published: true,
    meta_title: null, meta_description: null, reading_time_minutes: 6,
  },
  {
    id: 'sample-9',
    title: 'Nobridge Partners with Leading Legal Firms in Singapore',
    slug: 'nobridge-partners-singapore-legal',
    excerpt: 'New partnerships with top-tier Singapore legal firms strengthen our transaction execution capabilities for cross-border deals.',
    content: `<h2>Strengthening execution</h2><p>Legal expertise is critical to every transaction. Our new partnerships ensure clients have access to world-class legal counsel throughout the deal process.</p>`,
    cover_image_url: null,
    category: 'company',
    tags: ['Partnerships', 'Singapore', 'Legal'],
    author_name: 'Nobridge Team',
    author_role: null,
    published_at: '2026-01-28T08:00:00Z',
    created_at: now, updated_at: now, is_published: true,
    meta_title: null, meta_description: null, reading_time_minutes: 3,
  },
  {
    id: 'sample-10',
    title: 'Valuation Multiples in Asian Mid-Market M&A',
    slug: 'valuation-multiples-asian-mid-market',
    excerpt: 'What are realistic valuation expectations for SMEs in Asia? We break down current multiples by sector and what drives premium pricing.',
    content: `<h2>Current landscape</h2><p>Valuation multiples vary significantly by sector, geography, and business quality. Understanding where your business sits relative to market benchmarks is essential for setting realistic expectations.</p>`,
    cover_image_url: null,
    category: 'insights',
    tags: ['Valuation', 'Multiples', 'Asia'],
    author_name: 'Nobridge Research',
    author_role: 'Market Intelligence',
    published_at: '2026-01-20T08:00:00Z',
    created_at: now, updated_at: now, is_published: true,
    meta_title: null, meta_description: null, reading_time_minutes: 5,
  },
  {
    id: 'sample-11',
    title: 'The Role of Technology in Modern M&A Advisory',
    slug: 'technology-modern-ma-advisory',
    excerpt: 'How AI and automation are transforming the way M&A advisors identify buyers, manage pipelines, and execute transactions at scale.',
    content: `<h2>A new era</h2><p>Technology is enabling advisory firms to cover more ground, reach more buyers, and deliver better outcomes — without compromising on the personal touch that defines great advisory.</p>`,
    cover_image_url: null,
    category: 'insights',
    tags: ['Technology', 'AI', 'M&A'],
    author_name: 'Nobridge Research',
    author_role: 'Market Intelligence',
    published_at: '2026-01-15T08:00:00Z',
    created_at: now, updated_at: now, is_published: true,
    meta_title: null, meta_description: null, reading_time_minutes: 4,
  },
  {
    id: 'sample-12',
    title: 'Structuring Earnouts in SME Acquisitions',
    slug: 'structuring-earnouts-sme-acquisitions',
    excerpt: 'Earnouts can bridge valuation gaps between buyers and sellers, but they need to be structured carefully to avoid disputes post-close.',
    content: `<h2>When earnouts make sense</h2><p>Earnouts are most effective when there is genuine uncertainty about future performance and both parties are willing to share risk. The key is designing clear, measurable milestones.</p>`,
    cover_image_url: null,
    category: 'guides',
    tags: ['Deal structure', 'Earnouts'],
    author_name: 'Nobridge Advisory',
    author_role: 'Client Advisory',
    published_at: '2026-01-10T08:00:00Z',
    created_at: now, updated_at: now, is_published: true,
    meta_title: null, meta_description: null, reading_time_minutes: 5,
  },
  {
    id: 'sample-13',
    title: 'Asia M&A Outlook: What to Expect in 2026',
    slug: 'asia-ma-outlook-2026',
    excerpt: 'Our annual outlook on M&A trends across Asia, covering sector activity, buyer appetite, and the macroeconomic factors shaping deal flow.',
    content: `<h2>Looking ahead</h2><p>2026 is shaping up to be a strong year for mid-market M&A in Asia, driven by pent-up deal demand, improving credit conditions, and continued strategic interest from global acquirers.</p>`,
    cover_image_url: null,
    category: 'news',
    tags: ['Outlook', '2026', 'Asia'],
    author_name: 'Nobridge Research',
    author_role: 'Market Intelligence',
    published_at: '2026-01-05T08:00:00Z',
    created_at: now, updated_at: now, is_published: true,
    meta_title: null, meta_description: null, reading_time_minutes: 6,
  },
  {
    id: 'sample-14',
    title: 'Why Confidentiality Matters More Than You Think',
    slug: 'why-confidentiality-matters',
    excerpt: 'A premature leak that your business is for sale can damage employee morale, customer relationships, and ultimately your valuation.',
    content: `<h2>The hidden risk</h2><p>Many owners underestimate the damage that a confidentiality breach can cause during a sale process. Employees may leave, customers may hedge, and competitors may exploit the uncertainty.</p>`,
    cover_image_url: null,
    category: 'insights',
    tags: ['Confidentiality', 'Risk management'],
    author_name: 'Nobridge Advisory',
    author_role: 'Client Advisory',
    published_at: '2026-01-02T08:00:00Z',
    created_at: now, updated_at: now, is_published: true,
    meta_title: null, meta_description: null, reading_time_minutes: 4,
  },
]

function getSampleListItems(): BlogPostListItem[] {
  return samplePosts.map(({ content, ...rest }) => rest)
}

// --- Zod schemas ---
export const blogCategoryEnum = z.enum(['news', 'insights', 'guides', 'company'])

export const createBlogPostSchema = z.object({
  title: z.string().min(1).max(300),
  slug: z.string().min(1).max(300).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-safe lowercase with hyphens'),
  excerpt: z.string().min(1).max(1000),
  content: z.string().min(1),
  cover_image_url: z.string().url().nullable().optional(),
  category: blogCategoryEnum,
  tags: z.array(z.string()).default([]),
  author_name: z.string().min(1).max(200),
  author_role: z.string().max(200).nullable().optional(),
  published_at: z.string().datetime().nullable().optional(),
  is_published: z.boolean().default(false),
  meta_title: z.string().max(200).nullable().optional(),
  meta_description: z.string().max(500).nullable().optional(),
  reading_time_minutes: z.number().int().min(1).max(120).default(5),
})

export const updateBlogPostSchema = createBlogPostSchema.partial()

export const listBlogPostsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  category: blogCategoryEnum.optional(),
  search: z.string().optional(),
})

// --- Auth ---
export function verifyBlogAuth(request: Request): boolean {
  const apiKey = request.headers.get('x-api-key')
  if (apiKey && apiKey === process.env.BLOG_API_KEY) {
    return true
  }
  return false
}

// --- Query helpers ---
export async function getPublishedPosts(params: {
  page?: number
  limit?: number
  category?: BlogCategory
  search?: string
}): Promise<{ posts: BlogPostListItem[]; total: number }> {
  const page = params.page ?? 1
  const limit = params.limit ?? 12
  const from = (page - 1) * limit

  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) {
    console.log('[BLOG] DB unavailable, returning sample posts')
    let items = getSampleListItems()
    if (params.category) items = items.filter((p) => p.category === params.category)
    if (params.search) {
      const s = params.search.toLowerCase()
      items = items.filter((p) => p.title.toLowerCase().includes(s) || p.excerpt.toLowerCase().includes(s))
    }
    const total = items.length
    return { posts: items.slice(from, from + limit), total }
  }

  try {
    const to = from + limit - 1

    let query = supabaseAdmin
      .from('blog_posts')
      .select(
        'id, title, slug, excerpt, cover_image_url, category, tags, author_name, author_role, published_at, created_at, updated_at, is_published, meta_title, meta_description, reading_time_minutes',
        { count: 'exact' }
      )
      .eq('is_published', true)
      .order('published_at', { ascending: false })

    if (params.category) {
      query = query.eq('category', params.category)
    }

    if (params.search) {
      query = query.or(`title.ilike.%${params.search}%,excerpt.ilike.%${params.search}%`)
    }

    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('[BLOG] Error fetching posts:', error)
      let items = getSampleListItems()
      if (params.category) items = items.filter((p) => p.category === params.category)
      const total = items.length
      return { posts: items.slice(from, from + limit), total }
    }

    return { posts: (data as BlogPostListItem[]) ?? [], total: count ?? 0 }
  } catch (error) {
    console.error('[BLOG] DB query failed, returning samples:', error)
    let items = getSampleListItems()
    if (params.category) items = items.filter((p) => p.category === params.category)
    const total = items.length
    return { posts: items.slice(from, from + limit), total }
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) {
    return samplePosts.find((p) => p.slug === slug) ?? null
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()

    if (error || !data) {
      return samplePosts.find((p) => p.slug === slug) ?? null
    }
    return data as BlogPost
  } catch {
    return samplePosts.find((p) => p.slug === slug) ?? null
  }
}

export async function getRelatedPosts(category: BlogCategory, excludeSlug: string, limit = 3): Promise<BlogPostListItem[]> {
  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) {
    return getSampleListItems()
      .filter((p) => p.category === category && p.slug !== excludeSlug)
      .slice(0, limit)
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .select(
        'id, title, slug, excerpt, cover_image_url, category, tags, author_name, author_role, published_at, created_at, updated_at, is_published, meta_title, meta_description, reading_time_minutes'
      )
      .eq('is_published', true)
      .eq('category', category)
      .neq('slug', excludeSlug)
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[BLOG] Error fetching related posts:', error)
      return getSampleListItems()
        .filter((p) => p.category === category && p.slug !== excludeSlug)
        .slice(0, limit)
    }

    return (data as BlogPostListItem[]) ?? []
  } catch {
    return getSampleListItems()
      .filter((p) => p.category === category && p.slug !== excludeSlug)
      .slice(0, limit)
  }
}

// --- Admin helpers (for API routes) ---
export async function createPost(data: z.infer<typeof createBlogPostSchema>): Promise<BlogPost> {
  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) throw new Error('Database unavailable')

  const { data: post, error } = await supabaseAdmin
    .from('blog_posts')
    .insert(data)
    .select('*')
    .single()

  if (error) throw error
  return post as BlogPost
}

export async function updatePost(slug: string, data: z.infer<typeof updateBlogPostSchema>): Promise<BlogPost> {
  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) throw new Error('Database unavailable')

  const { data: post, error } = await supabaseAdmin
    .from('blog_posts')
    .update(data)
    .eq('slug', slug)
    .select('*')
    .single()

  if (error) throw error
  return post as BlogPost
}

export async function deletePost(slug: string): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) throw new Error('Database unavailable')

  const { error } = await supabaseAdmin
    .from('blog_posts')
    .delete()
    .eq('slug', slug)

  if (error) throw error
}

export async function getAllPublishedSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) {
    return samplePosts.map((p) => ({ slug: p.slug, updated_at: p.updated_at }))
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false })

    if (error) return samplePosts.map((p) => ({ slug: p.slug, updated_at: p.updated_at }))
    return data ?? []
  } catch {
    return samplePosts.map((p) => ({ slug: p.slug, updated_at: p.updated_at }))
  }
}
