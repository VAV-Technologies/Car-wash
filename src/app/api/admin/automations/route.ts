import { NextRequest, NextResponse } from 'next/server'
import {
  getAgents,
  getAgentById,
  getAgentRuns,
  getRunById,
  createAgent,
  updateAgent,
  toggleAgentStatus,
  deleteAgent,
} from '@/lib/admin/agents'

function auth(req: NextRequest): boolean {
  const key = process.env.CASTUDIO_API_KEY
  if (!key) return false
  return req.headers.get('authorization') === `Bearer ${key}`
}

export async function GET(request: NextRequest) {
  if (!auth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sp = request.nextUrl.searchParams
  const action = sp.get('action') ?? 'list'

  try {
    switch (action) {
      case 'list': {
        const search = sp.get('search') || undefined
        const status = (sp.get('status') || undefined) as 'active' | 'paused' | 'draft' | '' | undefined
        const page = parseInt(sp.get('page') ?? '1', 10)
        const limit = parseInt(sp.get('limit') ?? '20', 10)
        if (isNaN(page) || isNaN(limit)) {
          return NextResponse.json({ error: 'page and limit must be integers' }, { status: 400 })
        }
        const data = await getAgents({ search, status, page, limit })
        return NextResponse.json({ data: data.data, count: data.count })
      }

      case 'get': {
        const id = sp.get('id')
        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
        const data = await getAgentById(id)
        return NextResponse.json({ data })
      }

      case 'runs': {
        const agentId = sp.get('automation_id') || sp.get('agent_id')
        if (!agentId) return NextResponse.json({ error: 'agent_id is required' }, { status: 400 })
        const page = parseInt(sp.get('page') ?? '1', 10)
        const limit = parseInt(sp.get('limit') ?? '20', 10)
        if (isNaN(page) || isNaN(limit)) {
          return NextResponse.json({ error: 'page and limit must be integers' }, { status: 400 })
        }
        const data = await getAgentRuns(agentId, { page, limit })
        return NextResponse.json({ data: data.data, count: data.count })
      }

      case 'run': {
        const runId = sp.get('run_id')
        if (!runId) return NextResponse.json({ error: 'run_id is required' }, { status: 400 })
        const data = await getRunById(runId)
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (err) {
    console.error('GET /api/admin/automations error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!auth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const data = await createAgent(body)
    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('POST /api/admin/automations error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  if (!auth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sp = request.nextUrl.searchParams
  const action = sp.get('action') ?? 'update'
  const id = sp.get('id')
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  try {
    const body = await request.json()

    switch (action) {
      case 'update': {
        const data = await updateAgent(id, body)
        return NextResponse.json({ data })
      }

      case 'toggle': {
        const { status } = body
        if (!status || (status !== 'active' && status !== 'paused')) {
          return NextResponse.json({ error: 'status must be "active" or "paused"' }, { status: 400 })
        }
        const data = await toggleAgentStatus(id, status)
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (err) {
    console.error('PUT /api/admin/automations error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!auth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sp = request.nextUrl.searchParams
  const id = sp.get('id')
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  try {
    await deleteAgent(id)
    return NextResponse.json({ data: { success: true } })
  } catch (err) {
    console.error('DELETE /api/admin/automations error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
