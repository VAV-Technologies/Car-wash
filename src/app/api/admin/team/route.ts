import { NextRequest, NextResponse } from 'next/server'
import {
  getEmployees,
  getEmployeeById,
  getEmployeeStats,
  calculatePayslip,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '@/lib/admin/team'

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
        const status = sp.get('status') || undefined
        const data = await getEmployees({ status: status as 'active' | 'inactive' | undefined })
        return NextResponse.json({ data })
      }

      case 'get': {
        const id = sp.get('id')
        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
        const data = await getEmployeeById(id)
        if (!data) return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
        return NextResponse.json({ data })
      }

      case 'stats': {
        const employeeId = sp.get('employee_id')
        const year = sp.get('year')
        const month = sp.get('month')
        if (!employeeId || !year || !month) {
          return NextResponse.json({ error: 'employee_id, year, and month are required' }, { status: 400 })
        }
        const y = parseInt(year, 10)
        const m = parseInt(month, 10)
        if (isNaN(y) || isNaN(m)) {
          return NextResponse.json({ error: 'year and month must be integers' }, { status: 400 })
        }
        const data = await getEmployeeStats(employeeId, y, m)
        return NextResponse.json({ data })
      }

      case 'payslip': {
        const employeeId = sp.get('employee_id')
        const year = sp.get('year')
        const month = sp.get('month')
        if (!employeeId || !year || !month) {
          return NextResponse.json({ error: 'employee_id, year, and month are required' }, { status: 400 })
        }
        const y = parseInt(year, 10)
        const m = parseInt(month, 10)
        if (isNaN(y) || isNaN(m)) {
          return NextResponse.json({ error: 'year and month must be integers' }, { status: 400 })
        }
        const attendanceBonus = sp.get('attendance_bonus') !== 'false'
        const data = await calculatePayslip(employeeId, y, m, attendanceBonus)
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (err) {
    console.error('GET /api/admin/team error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!auth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const data = await createEmployee(body)
    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('POST /api/admin/team error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  if (!auth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = request.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  try {
    const body = await request.json()
    const data = await updateEmployee(id, body)
    return NextResponse.json({ data })
  } catch (err) {
    console.error('PUT /api/admin/team error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!auth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = request.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  try {
    await deleteEmployee(id)
    return NextResponse.json({ data: { success: true } })
  } catch (err) {
    console.error('DELETE /api/admin/team error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
