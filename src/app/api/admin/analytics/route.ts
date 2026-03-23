import { NextRequest, NextResponse } from 'next/server'
import {
  getServiceMixTrend,
  getCustomerAcquisitionCurve,
  getRetentionCohorts,
  getRevenueConcentration,
  getSeasonalPatterns,
  getUpsellEffectiveness,
} from '@/lib/admin/analytics'
import {
  getScorecardData,
  getAllScorecards,
} from '@/lib/admin/scorecard'

function auth(req: NextRequest): boolean {
  const key = process.env.CASTUDIO_API_KEY
  if (!key) return false
  return req.headers.get('authorization') === `Bearer ${key}`
}

export async function GET(request: NextRequest) {
  if (!auth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sp = request.nextUrl.searchParams
  const action = sp.get('action')
  if (!action) return NextResponse.json({ error: 'action query parameter is required' }, { status: 400 })

  try {
    switch (action) {
      case 'service-mix': {
        const months = parseInt(sp.get('months') ?? '6', 10)
        if (isNaN(months)) return NextResponse.json({ error: 'months must be an integer' }, { status: 400 })
        const data = await getServiceMixTrend(months)
        return NextResponse.json({ data })
      }

      case 'acquisition': {
        const months = parseInt(sp.get('months') ?? '6', 10)
        if (isNaN(months)) return NextResponse.json({ error: 'months must be an integer' }, { status: 400 })
        const data = await getCustomerAcquisitionCurve(months)
        return NextResponse.json({ data })
      }

      case 'retention': {
        const data = await getRetentionCohorts()
        return NextResponse.json({ data })
      }

      case 'concentration': {
        const data = await getRevenueConcentration()
        return NextResponse.json({ data })
      }

      case 'seasonal': {
        const data = await getSeasonalPatterns()
        return NextResponse.json({ data })
      }

      case 'upsell': {
        const data = await getUpsellEffectiveness()
        return NextResponse.json({ data })
      }

      case 'scorecard': {
        const monthParam = sp.get('month')
        if (!monthParam) return NextResponse.json({ error: 'month is required' }, { status: 400 })
        const month = parseInt(monthParam, 10)
        if (isNaN(month)) return NextResponse.json({ error: 'month must be an integer' }, { status: 400 })
        const data = await getScorecardData(month)
        return NextResponse.json({ data })
      }

      case 'all-scorecards': {
        const data = await getAllScorecards()
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (err) {
    console.error('GET /api/admin/analytics error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
