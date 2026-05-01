import { getSupabaseAdmin } from '@/lib/supabase'

export async function loadAgentKnowledge(): Promise<string> {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('agent_knowledge')
    .select('agent_name, file_name, file_type, content')
    .in('agent_name', ['shera', 'johan'])
  if (!data || !Array.isArray(data) || data.length === 0) return ''

  const text = (data as any[]).filter((r) => r.file_type !== 'image')
  if (text.length === 0) return ''

  const lines = text.map(
    (r: any) => `[${r.agent_name}/${r.file_name}]\n${(r.content || '').slice(0, 1500)}`,
  )
  return [
    '',
    '═══════════════ KNOWLEDGE BASE (agent_knowledge) ═══════════════',
    'Reference these for biz facts in MODE B, and as backup detail in MODE A.',
    '',
    lines.join('\n\n'),
  ].join('\n')
}
