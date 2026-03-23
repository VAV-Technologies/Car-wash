import { NextRequest, NextResponse } from 'next/server'
import {
  getEquipment,
  getEquipmentById,
  getMaintenanceDue,
  updateEquipment,
  deleteEquipment,
  logMaintenance,
  incrementUsageCycles,
} from '@/lib/admin/equipment'

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
        const data = await getEquipment()
        return NextResponse.json({ data })
      }

      case 'get': {
        const id = params.get('id')
        if (!id) {
          return NextResponse.json({ error: 'id is required' }, { status: 400 })
        }
        const data = await getEquipmentById(id)
        if (!data) {
          return NextResponse.json({ error: 'Equipment not found' }, { status: 404 })
        }
        return NextResponse.json({ data })
      }

      case 'maintenance-due': {
        const data = await getMaintenanceDue()
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

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  try {
    switch (action) {
      case 'update': {
        const body = await req.json()
        const data = await updateEquipment(id, body)
        return NextResponse.json({ data })
      }

      case 'log-maintenance': {
        const data = await logMaintenance(id)
        return NextResponse.json({ data })
      }

      case 'increment-cycles': {
        const body = await req.json()
        if (body.count == null) {
          return NextResponse.json({ error: 'count is required' }, { status: 400 })
        }
        const data = await incrementUsageCycles(id, parseInt(String(body.count), 10))
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
    await deleteEquipment(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
