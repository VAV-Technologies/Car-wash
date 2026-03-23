import { NextRequest, NextResponse } from 'next/server'
import {
  getJobs,
  getJobById,
  getJobStats,
  getRecentJobs,
} from '@/lib/admin/jobs'

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
        const data = await getJobs({
          washer_id: searchParams.get('washer_id') || '',
          date_from: searchParams.get('date_from') || '',
          date_to: searchParams.get('date_to') || '',
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
        const data = await getJobById(id)
        if (!data) {
          return NextResponse.json({ error: 'Job not found' }, { status: 404 })
        }
        return NextResponse.json({ data })
      }

      case 'stats': {
        const data = await getJobStats()
        return NextResponse.json({ data })
      }

      case 'recent': {
        const limit = parseInt(searchParams.get('limit') || '10')
        const data = await getRecentJobs(limit)
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
