import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

const WAHA_API_URL = process.env.WAHA_API_URL!
const WAHA_API_KEY = process.env.WAHA_API_KEY!

async function wahaFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const url = `${WAHA_API_URL}${path}`
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': WAHA_API_KEY,
      ...options.headers,
    },
  })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')
  const session = searchParams.get('session') || 'default'

  try {
    switch (action) {
      case 'sessions': {
        const res = await wahaFetch('/api/sessions', { method: 'GET' })
        if (!res.ok) {
          const body = await res.text()
          return NextResponse.json({ error: body }, { status: res.status })
        }
        const data = await res.json()
        return NextResponse.json(data)
      }

      case 'status': {
        const res = await wahaFetch(`/api/sessions/${session}`, { method: 'GET' })
        if (!res.ok) {
          const body = await res.text()
          return NextResponse.json({ error: body }, { status: res.status })
        }
        const data = await res.json()
        return NextResponse.json(data)
      }

      case 'screenshot': {
        const res = await wahaFetch(`/api/screenshot?session=${session}`, { method: 'GET' })
        if (!res.ok) {
          const body = await res.text()
          return NextResponse.json({ error: body }, { status: res.status })
        }
        const arrayBuffer = await res.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString('base64')
        return NextResponse.json({ image: `data:image/png;base64,${base64}` })
      }

      case 'server-info': {
        const res = await wahaFetch('/api/server/version', { method: 'GET' })
        if (!res.ok) return NextResponse.json({ error: 'Failed to get server info' }, { status: res.status })
        return NextResponse.json(await res.json())
      }

      case 'stats': {
        const supabase = getSupabaseAdmin()
        const now = new Date()
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

        const [todayResult, totalResult, lastMessageResult] = await Promise.all([
          supabase
            .from('whatsapp_conversations')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', todayStart),
          supabase
            .from('whatsapp_conversations')
            .select('*', { count: 'exact', head: true }),
          supabase
            .from('whatsapp_conversations')
            .select('created_at')
            .order('created_at', { ascending: false })
            .limit(1),
        ])

        return NextResponse.json({
          today: todayResult.count ?? 0,
          total: totalResult.count ?? 0,
          lastMessage: lastMessageResult.data?.[0]?.created_at ?? null,
        })
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (error: any) {
    console.error('WhatsApp API GET error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')
  const session = searchParams.get('session') || 'default'

  try {
    switch (action) {
      case 'start': {
        const res = await wahaFetch(`/api/sessions/${session}/start`, { method: 'POST' })
        if (!res.ok) {
          const body = await res.text()
          return NextResponse.json({ error: body }, { status: res.status })
        }
        const data = await res.json()
        return NextResponse.json(data)
      }

      case 'stop': {
        const res = await wahaFetch(`/api/sessions/${session}/stop`, { method: 'POST' })
        if (!res.ok) {
          const body = await res.text()
          return NextResponse.json({ error: body }, { status: res.status })
        }
        const data = await res.json()
        return NextResponse.json(data)
      }

      case 'restart': {
        try {
          await wahaFetch(`/api/sessions/${session}/stop`, { method: 'POST' })
        } catch {
          // Ignore stop errors — session may not be running
        }
        await new Promise((r) => setTimeout(r, 2000))
        const res = await wahaFetch(`/api/sessions/${session}/start`, { method: 'POST' })
        if (!res.ok) {
          const body = await res.text()
          return NextResponse.json({ error: body }, { status: res.status })
        }
        const data = await res.json()
        return NextResponse.json(data)
      }

      case 'logout': {
        const res = await wahaFetch(`/api/sessions/${session}/logout`, { method: 'POST' })
        if (!res.ok) {
          const body = await res.text()
          return NextResponse.json({ error: body }, { status: res.status })
        }
        const data = await res.json()
        return NextResponse.json(data)
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (error: any) {
    console.error('WhatsApp API POST error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
