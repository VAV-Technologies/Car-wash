import { NextRequest, NextResponse } from 'next/server'
import {
  getCustomers,
  getCustomerById,
  getFollowUpCustomers,
  getCustomerConversations,
  createCustomer,
  addConversation,
  updateCustomer,
  deleteCustomer,
} from '@/lib/admin/customers'

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
        const data = await getCustomers({
          search: searchParams.get('search') || '',
          neighborhood: searchParams.get('neighborhood') || '',
          segment: searchParams.get('segment') || '',
          acquisition_source: searchParams.get('acquisition_source') || '',
          page: parseInt(searchParams.get('page') || '1'),
          limit: parseInt(searchParams.get('limit') || '25'),
          sort_by: searchParams.get('sort_by') || 'created_at',
          sort_dir: (searchParams.get('sort_dir') as 'asc' | 'desc') || 'desc',
        })
        return NextResponse.json({ data })
      }

      case 'get': {
        const id = searchParams.get('id')
        if (!id) {
          return NextResponse.json({ error: 'Missing required param: id' }, { status: 400 })
        }
        const data = await getCustomerById(id)
        if (!data) {
          return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
        }
        return NextResponse.json({ data })
      }

      case 'follow-ups': {
        const data = await getFollowUpCustomers()
        return NextResponse.json({ data })
      }

      case 'conversations': {
        const customer_id = searchParams.get('customer_id')
        if (!customer_id) {
          return NextResponse.json({ error: 'Missing required param: customer_id' }, { status: 400 })
        }
        const data = await getCustomerConversations(customer_id)
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

  const searchParams = req.nextUrl.searchParams
  const action = searchParams.get('action') || 'create'

  try {
    const body = await req.json()

    switch (action) {
      case 'create': {
        const data = await createCustomer(body)
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'add-conversation': {
        const data = await addConversation(body)
        return NextResponse.json({ data }, { status: 201 })
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
    const data = await updateCustomer(id, body)
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
    await deleteCustomer(id)
    return NextResponse.json({ data: { success: true } })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
