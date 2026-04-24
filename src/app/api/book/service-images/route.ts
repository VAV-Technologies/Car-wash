import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('agent_knowledge')
    .select('file_name, content')
    .eq('agent_name', 'shera')
    .like('file_name', 'service_image_%')

  const map: Record<string, string> = {}
  for (const row of data ?? []) {
    const key = row.file_name.replace('service_image_', '')
    if (row.content) map[key] = row.content
  }
  return NextResponse.json({ ok: true, images: map })
}
