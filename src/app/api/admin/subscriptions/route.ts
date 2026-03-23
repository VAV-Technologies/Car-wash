import { NextRequest, NextResponse } from 'next/server'
import {
  getSubscriptions,
  getSubscriptionById,
  getActiveSubscriptionStats,
  getChurnRiskSubscriptions,
  getUpcomingRenewals,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} from '@/lib/admin/subscriptions'

function auth(req: NextRequest): boolean {
  const key = process.env.CASTUDIO_API_KEY
  if (!key) return false
  return req.headers.get('authorization') === `Bearer ${key}`
}

export async function GET(req: NextRequest) {
  if (!auth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = req.nextUrl.searchParams
  const action = searchParams.get('action') || 'list'

  try {
    switch (action) {
      case 'list': {
        const data = await getSubscriptions({
          status: (searchParams.get('status') as 'active' | 'paused' | 'cancelled' | 'expired' | '') || '',
          tier: (searchParams.get('tier') as string) || '',
          page: parseInt(searchParams.get('page') || '1'),
          limit: parseInt(searchParams.get('limit') || '25'),
        })
        return NextResponse.json({ data })
      }

      case 'get': {
        const id = searchParams.get('id')
        if (!id) {
          return NextResponse.json({ error: 'Missing required param: id' }, { status: 400 })
        }
        const data = await getSubscriptionById(id)
        if (!data) {
          return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
        }
        return NextResponse.json({ data })
      }

      case 'stats': {
        const data = await getActiveSubscriptionStats()
        return NextResponse.json({ data })
      }

      case 'churn-risk': {
        const data = await getChurnRiskSubscriptions()
        return NextResponse.json({ data })
      }

      case 'renewals': {
        const days = parseInt(searchParams.get('days') || '7')
        const data = await getUpcomingRenewals(days)
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  if (!auth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = await createSubscription(body)
    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  if (!auth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = req.nextUrl.searchParams
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing required param: id' }, { status: 400 })
  }

  try {
    const body = await req.json()
    const data = await updateSubscription(id, body)
    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  if (!auth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = req.nextUrl.searchParams
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing required param: id' }, { status: 400 })
  }

  try {
    await deleteSubscription(id)
    return NextResponse.json({ data: { success: true } })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
