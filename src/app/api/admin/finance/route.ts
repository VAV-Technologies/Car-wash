import { NextRequest, NextResponse } from 'next/server'
import {
  getTransactions,
  createTransaction,
  confirmPayment,
  markPaymentFailed,
  deleteTransaction,
  getPendingPayments,
  getMonthlyPL,
  getRevenueBreakdown,
  getExpensesByCategory,
  getCashPosition,
  getAgingPayments,
} from '@/lib/admin/finance'

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
        const type = params.get('type') ?? ''
        const payment_status = params.get('payment_status') ?? ''
        const date_from = params.get('date_from') ?? ''
        const date_to = params.get('date_to') ?? ''
        const customer_id = params.get('customer_id') ?? ''
        const page = params.get('page') ? parseInt(params.get('page')!, 10) : 1
        const limit = params.get('limit') ? parseInt(params.get('limit')!, 10) : 25
        const result = await getTransactions({ type, payment_status, date_from, date_to, customer_id, page, limit } as Parameters<typeof getTransactions>[0])
        return NextResponse.json(result)
      }

      case 'pending': {
        const data = await getPendingPayments()
        return NextResponse.json({ data })
      }

      case 'monthly-pl': {
        const year = params.get('year')
        const month = params.get('month')
        if (!year || !month) {
          return NextResponse.json({ error: 'year and month are required' }, { status: 400 })
        }
        const data = await getMonthlyPL(parseInt(year, 10), parseInt(month, 10))
        return NextResponse.json({ data })
      }

      case 'revenue-breakdown': {
        const year = params.get('year')
        const month = params.get('month')
        if (!year || !month) {
          return NextResponse.json({ error: 'year and month are required' }, { status: 400 })
        }
        const data = await getRevenueBreakdown(parseInt(year, 10), parseInt(month, 10))
        return NextResponse.json({ data })
      }

      case 'expenses': {
        const year = params.get('year')
        const month = params.get('month')
        if (!year || !month) {
          return NextResponse.json({ error: 'year and month are required' }, { status: 400 })
        }
        const data = await getExpensesByCategory(parseInt(year, 10), parseInt(month, 10))
        return NextResponse.json({ data })
      }

      case 'cash-position': {
        const data = await getCashPosition()
        return NextResponse.json({ data })
      }

      case 'aging': {
        const data = await getAgingPayments()
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
    const data = await createTransaction(body)
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
  const action = params.get('action') ?? 'confirm-payment'
  const id = params.get('id')

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  try {
    switch (action) {
      case 'confirm-payment': {
        const body = await req.json()
        if (!body.confirmed_by) {
          return NextResponse.json({ error: 'confirmed_by is required' }, { status: 400 })
        }
        const data = await confirmPayment(id, body.confirmed_by)
        return NextResponse.json({ data })
      }

      case 'fail-payment': {
        const data = await markPaymentFailed(id)
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

export async function DELETE(req: NextRequest) {
  if (!auth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = req.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  try {
    await deleteTransaction(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
