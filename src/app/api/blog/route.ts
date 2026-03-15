import { NextRequest, NextResponse } from 'next/server'
import {
  getPublishedPosts,
  createPost,
  verifyBlogAuth,
  createBlogPostSchema,
  listBlogPostsSchema,
} from '@/lib/blog'

// GET /api/blog — List published posts (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const parsed = listBlogPostsSchema.safeParse({
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      category: searchParams.get('category') ?? undefined,
      search: searchParams.get('search') ?? undefined,
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { posts, total } = await getPublishedPosts(parsed.data)
    const { page, limit } = parsed.data
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    })
  } catch (error) {
    console.error('[BLOG-API] Error listing posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

// POST /api/blog — Create a new post (auth required)
export async function POST(request: NextRequest) {
  try {
    if (!verifyBlogAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = createBlogPostSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const post = await createPost(parsed.data)
    return NextResponse.json({ post }, { status: 201 })
  } catch (error: any) {
    console.error('[BLOG-API] Error creating post:', error)
    if (error?.code === '23505') {
      return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
