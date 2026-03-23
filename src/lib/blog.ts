// --- Types ---
export type BlogCategory = 'tips' | 'guides' | 'news' | 'promotions'

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

// --- Supabase queries ---
import { supabase } from './supabase'

const listColumns = 'id,title,slug,excerpt,cover_image_url,category,tags,author_name,author_role,published_at,created_at,updated_at,is_published,meta_title,meta_description,reading_time_minutes'

export async function getPublishedPosts(params: {
  page?: number
  limit?: number
  category?: BlogCategory
  search?: string
}): Promise<{ posts: BlogPostListItem[]; total: number }> {
  const page = params.page ?? 1
  const limit = params.limit ?? 12
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('blog_posts')
    .select(listColumns, { count: 'exact' })
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .range(from, to)

  if (params.category) {
    query = query.eq('category', params.category)
  }
  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,excerpt.ilike.%${params.search}%`)
  }

  const { data, count, error } = await query
  if (error) {
    console.error('getPublishedPosts error:', error)
    return { posts: [], total: 0 }
  }
  return { posts: (data ?? []) as BlogPostListItem[], total: count ?? 0 }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error || !data) return null
  return data as BlogPost
}

export async function getRelatedPosts(
  category: BlogCategory,
  excludeSlug: string,
  limit = 3
): Promise<BlogPostListItem[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(listColumns)
    .eq('is_published', true)
    .eq('category', category)
    .neq('slug', excludeSlug)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) return []
  return (data ?? []) as BlogPostListItem[]
}

export async function getAllPublishedSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('slug,updated_at')
    .eq('is_published', true)

  if (error) return []
  return (data ?? []) as { slug: string; updated_at: string }[]
}
