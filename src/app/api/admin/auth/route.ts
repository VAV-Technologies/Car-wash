import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase'

async function isAuthorized(req: NextRequest): Promise<boolean> {
  // Check Bearer token (for external API access)
  const key = process.env.CASTUDIO_API_KEY
  if (key && req.headers.get('authorization') === `Bearer ${key}`) return true

  // Check Supabase session (for admin panel browser access)
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll() } } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    return !!user
  } catch {
    return false
  }
}

export async function GET(req: NextRequest) {
  if (!(await isAuthorized(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action') ?? 'list-users'

  try {
    const supabase = getSupabaseAdmin()

    switch (action) {
      case 'list-users': {
        const { data, error } = await supabase.auth.admin.listUsers()
        if (error) throw error
        return NextResponse.json(data.users ?? [])
      }
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAuthorized(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action') ?? 'create-user'

  try {
    const supabase = getSupabaseAdmin()
    const body = await req.json()

    switch (action) {
      case 'create-user': {
        const { email, password, name } = body
        if (!email || !password) return NextResponse.json({ error: 'email and password required' }, { status: 400 })

        const { data, error } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { name: name || '' },
        })
        if (error) throw error
        return NextResponse.json({ user_id: data.user.id }, { status: 201 })
      }

      case 'reset-password': {
        const { user_id, new_password } = body
        if (!user_id || !new_password) return NextResponse.json({ error: 'user_id and new_password required' }, { status: 400 })

        const { error } = await supabase.auth.admin.updateUserById(user_id, { password: new_password })
        if (error) throw error
        return NextResponse.json({ ok: true })
      }

      case 'delete-user': {
        const { user_id } = body
        if (!user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 })

        const { error } = await supabase.auth.admin.deleteUser(user_id)
        if (error) throw error
        return NextResponse.json({ ok: true })
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed' }, { status: 500 })
  }
}
