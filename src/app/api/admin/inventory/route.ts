import { NextRequest, NextResponse } from 'next/server'
import {
  getInventoryItems,
  getLowStockItems,
  getCriticalStockItems,
  getDefaultChemicals,
  updateInventoryItem,
  restockItem,
  deductChemicals,
  deleteInventoryItem,
} from '@/lib/admin/inventory'

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
        const data = await getInventoryItems()
        return NextResponse.json({ data })
      }

      case 'low-stock': {
        const data = await getLowStockItems()
        return NextResponse.json({ data })
      }

      case 'critical': {
        const data = await getCriticalStockItems()
        return NextResponse.json({ data })
      }

      case 'default-chemicals': {
        const service_type = params.get('service_type')
        if (!service_type) {
          return NextResponse.json({ error: 'service_type is required' }, { status: 400 })
        }
        const data = getDefaultChemicals(service_type)
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

export async function PUT(req: NextRequest) {
  if (!auth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const params = req.nextUrl.searchParams
  const action = params.get('action') ?? 'update'
  const id = params.get('id')

  try {
    switch (action) {
      case 'update': {
        if (!id) {
          return NextResponse.json({ error: 'id is required' }, { status: 400 })
        }
        const body = await req.json()
        const data = await updateInventoryItem(id, body)
        return NextResponse.json({ data })
      }

      case 'restock': {
        if (!id) {
          return NextResponse.json({ error: 'id is required' }, { status: 400 })
        }
        const body = await req.json()
        if (body.qty == null) {
          return NextResponse.json({ error: 'qty is required' }, { status: 400 })
        }
        const data = await restockItem(id, parseInt(String(body.qty), 10))
        return NextResponse.json({ data })
      }

      case 'deduct': {
        const body = await req.json()
        if (!body.job_id) {
          return NextResponse.json({ error: 'job_id is required' }, { status: 400 })
        }
        const data = await deductChemicals(body.job_id)
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
    await deleteInventoryItem(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
