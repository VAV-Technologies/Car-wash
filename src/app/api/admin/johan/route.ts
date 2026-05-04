import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// Admin endpoint for Johan agent config. Protected by /admin middleware.

export async function GET() {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('agent_settings')
    .select('api_key, model, max_tokens, system_prompt')
    .eq('agent_name', 'johan')
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // api_key is base64-encoded for storage. Don't return the raw key — return a masked preview.
  let apiKeyPreview: string | null = null
  if (data?.api_key) {
    try {
      const decoded = Buffer.from(data.api_key, 'base64').toString('utf-8')
      apiKeyPreview = decoded.length > 12
        ? `${decoded.slice(0, 6)}…${decoded.slice(-4)}`
        : '***'
    } catch {
      apiKeyPreview = '***'
    }
  }

  return NextResponse.json({
    api_key_preview: apiKeyPreview,
    has_api_key: !!data?.api_key,
    model: data?.model ?? null,
    max_tokens: data?.max_tokens ?? null,
    system_prompt: data?.system_prompt ?? null,
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { api_key, model, max_tokens, system_prompt } = body as {
    api_key?: string
    model?: string
    max_tokens?: number
    system_prompt?: unknown
  }

  const supabase = getSupabaseAdmin()
  const update: Record<string, unknown> = {}
  if (typeof api_key === 'string' && api_key.length > 0) {
    update.api_key = Buffer.from(api_key, 'utf-8').toString('base64')
  }
  if (typeof model === 'string') update.model = model
  if (typeof max_tokens === 'number') update.max_tokens = max_tokens
  if (system_prompt !== undefined) update.system_prompt = system_prompt

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'no fields to update' }, { status: 400 })
  }

  // Upsert by agent_name
  const { data: existing } = await supabase
    .from('agent_settings')
    .select('id')
    .eq('agent_name', 'johan')
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('agent_settings')
      .update(update)
      .eq('agent_name', 'johan')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    const { error } = await supabase
      .from('agent_settings')
      .insert({ agent_name: 'johan', ...update })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
