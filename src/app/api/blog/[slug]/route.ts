import { NextRequest, NextResponse } from 'next/server'
import {
  getPostBySlug,
  updatePost,
  deletePost,
  verifyBlogAuth,
  updateBlogPostSchema,
} from '@/lib/blog'

// GET /api/blog/[slug] — Single post by slug (public)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const post = await getPostBySlug(slug)

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error('[BLOG-API] Error fetching post:', error)
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}

// PATCH /api/blog/[slug] — Update post (auth required)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    if (!verifyBlogAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = updateBlogPostSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const post = await updatePost(slug, parsed.data)
    return NextResponse.json({ post })
  } catch (error: any) {
    console.error('[BLOG-API] Error updating post:', error)
    if (error?.code === 'PGRST116') {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

// DELETE /api/blog/[slug] — Delete post (auth required)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    if (!verifyBlogAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params
    await deletePost(slug)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[BLOG-API] Error deleting post:', error)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}
