import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  // Auth check
  const authHeader = request.headers.get('authorization')
  const apiKey = process.env.CASTUDIO_API_KEY
  if (!apiKey || authHeader !== `Bearer ${apiKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse body
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Validate required fields
  const required = ['title', 'slug', 'excerpt', 'content', 'category'] as const
  for (const field of required) {
    if (!body[field]) {
      return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
    }
  }

  const validCategories = ['tips', 'guides', 'news', 'promotions']
  if (!validCategories.includes(body.category as string)) {
    return NextResponse.json(
      { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
      { status: 400 }
    )
  }

  // Build insert payload
  const insert: Record<string, unknown> = {
    title: body.title,
    slug: body.slug,
    excerpt: body.excerpt,
    content: body.content,
    category: body.category,
    tags: body.tags ?? [],
    author_name: body.author_name ?? 'Castudio Team',
    author_role: body.author_role ?? null,
    cover_image_url: body.cover_image_url ?? null,
    published_at: body.published_at ?? null,
    is_published: body.is_published ?? false,
    meta_title: body.meta_title ?? null,
    meta_description: body.meta_description ?? null,
    reading_time_minutes: body.reading_time_minutes ?? 3,
  }

  // Insert
  const { data, error } = await getSupabaseAdmin()
    .from('blog_posts')
    .insert(insert)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 409 })
    }
    console.error('Insert error:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }

  return NextResponse.json({ post: data }, { status: 201 })
}
