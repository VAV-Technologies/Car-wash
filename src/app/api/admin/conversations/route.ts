import { NextRequest, NextResponse } from 'next/server'
import {
  getConversations,
  createConversation,
  deleteConversation,
  getConversationsByCustomer,
  getFollowUpsDue,
  markFollowUpComplete,
  getConversationStats,
} from '@/lib/admin/conversations'

function auth(req: NextRequest): boolean {
  const key = process.env.CASTUDIO_API_KEY
  if (!key) return false
  return req.headers.get('authorization') === `Bearer ${key}`
}

export async function GET(req: NextRequest) {
  if (!auth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const params = req.nextUrl.searchParams
  const action = params.get('action') ?? 'list'

  try {
    switch (action) {
      case 'list': {
        const channel = params.get('channel') ?? ''
        const message_type = params.get('message_type') ?? ''
        const customer_id = params.get('customer_id') ?? ''
        const follow_up = params.get('follow_up') ?? ''
        const page = params.get('page') ? parseInt(params.get('page')!, 10) : 1
        const limit = params.get('limit') ? parseInt(params.get('limit')!, 10) : 25
        const result = await getConversations({
          channel,
          message_type,
          customer_id,
          follow_up_status: follow_up as 'pending' | 'completed' | '',
          page,
          limit,
        } as Parameters<typeof getConversations>[0])
        return NextResponse.json(result)
      }

      case 'by-customer': {
        const customer_id = params.get('customer_id')
        if (!customer_id) {
          return NextResponse.json({ error: 'customer_id is required' }, { status: 400 })
        }
        const data = await getConversationsByCustomer(customer_id)
        return NextResponse.json({ data })
      }

      case 'follow-ups': {
        const data = await getFollowUpsDue()
        return NextResponse.json({ data })
      }

      case 'stats': {
        const data = await getConversationStats()
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!auth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = await createConversation(body)
    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  if (!auth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const params = req.nextUrl.searchParams
  const action = params.get('action') ?? 'complete-follow-up'
  const id = params.get('id')

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  try {
    switch (action) {
      case 'complete-follow-up': {
        await markFollowUpComplete(id)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  if (!auth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = req.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  try {
    await deleteConversation(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
