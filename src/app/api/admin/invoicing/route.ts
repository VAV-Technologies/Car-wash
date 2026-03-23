import { NextRequest, NextResponse } from 'next/server'
import {
  getInvoices,
  getInvoiceById,
  getMonthlyInvoiceSummary,
  generateReceiptData,
} from '@/lib/admin/invoicing'

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
        const payment_status = params.get('payment_status') ?? ''
        const date_from = params.get('date_from') ?? ''
        const date_to = params.get('date_to') ?? ''
        const customer_id = params.get('customer_id') ?? ''
        const page = params.get('page') ? parseInt(params.get('page')!, 10) : 1
        const limit = params.get('limit') ? parseInt(params.get('limit')!, 10) : 25
        const result = await getInvoices({ payment_status, date_from, date_to, customer_id, page, limit } as Parameters<typeof getInvoices>[0])
        return NextResponse.json(result)
      }

      case 'get': {
        const id = params.get('id')
        if (!id) {
          return NextResponse.json({ error: 'id is required' }, { status: 400 })
        }
        const data = await getInvoiceById(id)
        if (!data) {
          return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
        }
        return NextResponse.json({ data })
      }

      case 'monthly-summary': {
        const year = params.get('year')
        const month = params.get('month')
        if (!year || !month) {
          return NextResponse.json({ error: 'year and month are required' }, { status: 400 })
        }
        const data = await getMonthlyInvoiceSummary(parseInt(year, 10), parseInt(month, 10))
        return NextResponse.json({ data })
      }

      case 'receipt': {
        const id = params.get('id')
        if (!id) {
          return NextResponse.json({ error: 'id is required' }, { status: 400 })
        }
        const data = await generateReceiptData(id)
        if (!data) {
          return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
        }
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
