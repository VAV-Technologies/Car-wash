import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { verifyBlogAuth } from '@/lib/blog'

const BUCKET = 'blog-images'
const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// POST /api/blog/upload — Upload a blog cover image (auth required)
export async function POST(request: NextRequest) {
  try {
    if (!verifyBlogAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
    }

    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP, AVIF` },
        { status: 400 }
      )
    }

    // Validate size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max: 5MB` },
        { status: 400 }
      )
    }

    // Build path: blog-images/covers/{timestamp}_{filename}
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const timestamp = Date.now()
    const safeName = file.name
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-z0-9_-]/gi, '_')
      .substring(0, 60)
    const filePath = `covers/${timestamp}_${safeName}.${ext}`

    const supabaseAdmin = getSupabaseAdmin()

    // Upload to Supabase Storage
    const buffer = Buffer.from(await file.arrayBuffer())
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '86400', // 24h cache
        upsert: false,
      })

    if (uploadError) {
      console.error('[BLOG-UPLOAD] Storage error:', uploadError)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    // Get public URL (bucket is public)
    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(filePath)

    console.log(`[BLOG-UPLOAD] Uploaded: ${filePath}`)

    return NextResponse.json({
      url: urlData.publicUrl,
      path: filePath,
      size: file.size,
      type: file.type,
    }, { status: 201 })
  } catch (error) {
    console.error('[BLOG-UPLOAD] Unexpected error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
