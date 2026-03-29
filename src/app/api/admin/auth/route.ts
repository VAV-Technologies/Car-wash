import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// No bearer auth — called from admin panel which is protected by middleware.

export async function GET(req: NextRequest) {
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
