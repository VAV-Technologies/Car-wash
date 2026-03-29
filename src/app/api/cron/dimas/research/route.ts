import { NextResponse } from 'next/server'
import { fetchOpportunityKeywords, fetchAutocomplete, brainstormTopics } from '@/lib/agents/dimas/researcher'
import { getSupabaseClient } from '@/lib/agents/dimas/config'
import { DIMAS_CONFIG } from '@/lib/agents/dimas/config'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET() {
  const supabase = getSupabaseClient()

  try {
    let stored = 0

    // 1. GSC opportunities
    const gscKeywords = await fetchOpportunityKeywords()
    for (const row of gscKeywords) {
      const keyword = row.keys?.[0] || ''
      if (!keyword) continue
      await supabase.from('keyword_research').upsert({
        keyword,
        impressions: row.impressions,
        current_position: row.position,
        clicks: row.clicks,
        ctr: row.ctr,
        source: 'gsc',
        last_checked: new Date().toISOString(),
      }, { onConflict: 'keyword' }).catch(() => {})
      stored++
    }

    // 2. Autocomplete
    const niche = DIMAS_CONFIG.blogNiche.split(',')[0].trim()
    const seeds = [niche, `cara ${niche}`, `tips ${niche}`, `${niche} terbaik`]
    for (const seed of seeds) {
      const suggestions = await fetchAutocomplete(seed)
      for (const s of suggestions) {
        await supabase.from('keyword_research').upsert({
          keyword: s,
          source: 'autocomplete',
        }, { onConflict: 'keyword' }).catch(() => {})
        stored++
      }
    }

    // 3. Claude brainstorm
    const topics = await brainstormTopics()
    for (const t of topics) {
      await supabase.from('keyword_research').upsert({
        keyword: t.keyword,
        source: 'manual',
      }, { onConflict: 'keyword' }).catch(() => {})
      stored++
    }

    await supabase.from('agent_logs').insert({ action: 'deep_research', details: { keywords_stored: stored } })

    return NextResponse.json({ ok: true, keywords_stored: stored })
  } catch (err: any) {
    console.error('[dimas-research] Error:', err)
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
