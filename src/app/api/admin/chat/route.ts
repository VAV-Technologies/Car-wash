import { NextRequest, NextResponse } from 'next/server'

function auth(req: NextRequest): boolean {
  const key = process.env.CASTUDIO_API_KEY
  if (!key) return false
  return req.headers.get('authorization') === `Bearer ${key}`
}

export async function POST(request: NextRequest) {
  if (!auth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { message?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { message } = body
  if (!message) return NextResponse.json({ error: 'message is required' }, { status: 400 })

  try {
    const origin = request.nextUrl.origin
    const res = await fetch(`${origin}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: message }] }),
    })

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('POST /api/admin/chat error:', err)
    return NextResponse.json({ error: 'Failed to process chat request' }, { status: 500 })
  }
}
