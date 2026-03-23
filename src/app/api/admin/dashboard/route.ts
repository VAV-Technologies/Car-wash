import { NextRequest, NextResponse } from 'next/server'
import {
  getDashboardStats,
  getTargetsForMonth,
  getMonthNumber,
} from '@/lib/admin/dashboard'

function auth(req: NextRequest): boolean {
  const key = process.env.CASTUDIO_API_KEY
  if (!key) return false
  return req.headers.get('authorization') === `Bearer ${key}`
}

export async function GET(request: NextRequest) {
  if (!auth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sp = request.nextUrl.searchParams
  const action = sp.get('action') ?? 'stats'

  try {
    switch (action) {
      case 'stats': {
        const data = await getDashboardStats()
        return NextResponse.json({ data })
      }

      case 'targets': {
        const monthParam = sp.get('month')
        if (!monthParam) return NextResponse.json({ error: 'month is required' }, { status: 400 })
        const month = parseInt(monthParam, 10)
        if (isNaN(month)) return NextResponse.json({ error: 'month must be an integer' }, { status: 400 })
        const data = getTargetsForMonth(month)
        return NextResponse.json({ data })
      }

      case 'month-number': {
        const data = getMonthNumber()
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (err) {
    console.error('GET /api/admin/dashboard error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
