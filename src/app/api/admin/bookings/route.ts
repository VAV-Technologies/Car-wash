import { NextRequest, NextResponse } from 'next/server'
import {
  getBookings,
  getBookingById,
  getTodaysBookings,
  getBookingQueue,
  getBookingsByDate,
  getWashers,
  searchCustomers,
  createBooking,
  updateBooking,
  deleteBooking,
} from '@/lib/admin/bookings'

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
        const data = await getBookings({
          status: (searchParams.get('status') as '' | 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled') || '',
          service_type: (searchParams.get('service_type') as '' | string) || '',
          date_from: searchParams.get('date_from') || '',
          date_to: searchParams.get('date_to') || '',
          washer_id: searchParams.get('washer_id') || '',
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
        const data = await getBookingById(id)
        if (!data) {
          return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
        }
        return NextResponse.json({ data })
      }

      case 'today': {
        const data = await getTodaysBookings()
        return NextResponse.json({ data })
      }

      case 'queue': {
        const data = await getBookingQueue()
        return NextResponse.json({ data })
      }

      case 'by-date': {
        const date = searchParams.get('date')
        if (!date) {
          return NextResponse.json({ error: 'Missing required param: date' }, { status: 400 })
        }
        const data = await getBookingsByDate(date)
        return NextResponse.json({ data })
      }

      case 'washers': {
        const data = await getWashers()
        return NextResponse.json({ data })
      }

      case 'search-customers': {
        const query = searchParams.get('query')
        if (!query) {
          return NextResponse.json({ error: 'Missing required param: query' }, { status: 400 })
        }
        const data = await searchCustomers(query)
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
    const data = await createBooking(body)
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
    const data = await updateBooking(id, body)
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
    await deleteBooking(id)
    return NextResponse.json({ data: { success: true } })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
