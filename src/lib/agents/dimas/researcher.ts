import { querySearchAnalytics } from './gsc'
import { DIMAS_CONFIG, DIMAS_BRAND_CONTEXT, getSupabaseClient } from './config'
import Anthropic from '@anthropic-ai/sdk'

function getDateString(daysAgo: number): string {
  const d = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
  return d.toISOString().split('T')[0]
}

async function getAnthropicClient(): Promise<Anthropic> {
  const supabase = getSupabaseClient()
  // Try agent_settings first
  const { data: settings } = await supabase.from('agent_settings').select('api_key').eq('agent_name', 'dimas').single()
  let apiKey: string | undefined
  if (settings?.api_key) {
    try { apiKey = Buffer.from(settings.api_key, 'base64').toString('utf-8') } catch {}
  }
  // Fallback to shera's key, then connectors, then env
  if (!apiKey) {
    const { data: shera } = await supabase.from('agent_settings').select('api_key').eq('agent_name', 'shera').single()
    if (shera?.api_key) try { apiKey = Buffer.from(shera.api_key, 'base64').toString('utf-8') } catch {}
  }
  if (!apiKey) {
    const { data } = await supabase.from('connectors').select('encrypted_key').eq('is_base_model', true).single()
    if (data?.encrypted_key) try { apiKey = Buffer.from(data.encrypted_key, 'base64').toString('utf-8') } catch {}
  }
  if (!apiKey) apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('No Claude API key configured for Dimas')
  return new Anthropic({ apiKey })
}

export async function fetchOpportunityKeywords(): Promise<any[]> {
  try {
    const rows = await querySearchAnalytics({
      startDate: getDateString(28),
      endDate: getDateString(1),
      dimensions: ['query'],
      rowLimit: 500,
    })

    // Filter: impressions > 10, position > 10 (page 2+) = opportunity keywords
    const opportunities = rows.filter((r: any) => r.impressions > 10 && r.position > 10)
    // Also find quick wins: position 5-15, CTR < 3%
    const quickWins = rows.filter((r: any) => r.position >= 5 && r.position <= 15 && r.ctr < 0.03)

    return [...opportunities, ...quickWins]
  } catch {
    return [] // No GSC data yet
  }
}

export async function fetchAutocomplete(seed: string): Promise<string[]> {
  try {
    const res = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(seed)}`)
    const data = await res.json()
    return (data[1] || []) as string[]
  } catch {
    return []
  }
}

export async function brainstormTopics(): Promise<Array<{ keyword: string; intent: string; content_type: string }>> {
  const client = await getAnthropicClient()
  const supabase = getSupabaseClient()

  // Load existing posts for semantic dedup
  const { data: existingPosts } = await supabase
    .from('blog_posts')
    .select('title, target_keyword')
    .eq('is_published', true)

  const existingTopics = (existingPosts || [])
    .map((p: any) => p.target_keyword || p.title)
    .filter(Boolean)
    .join('\n')

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: DIMAS_BRAND_CONTEXT,
    messages: [{
      role: 'user',
      content: `Generate 10 blog post topics for our Indonesian automotive lifestyle blog. Mix across these categories:

1. Car care (washing, waxing, polishing, paint protection, interior care)
2. New car reviews and comparisons (Indonesian market, popular brands like Toyota, Honda, Mitsubishi, Hyundai, Wuling)
3. Car brand news and industry updates
4. Automotive technology (ADAS, EV tech, connected cars)
5. F1 and motorsport
6. Car content creators and community in Indonesia
7. Road trip guides and driving tips in Indonesia
8. Car modifications and accessories
9. Electric vehicles in Indonesia
10. Car buying guides

${existingTopics ? `IMPORTANT: We already have posts about these topics. DO NOT suggest anything similar or overlapping:\n${existingTopics}` : ''}

For each topic, return a JSON object with:
- keyword: specific 2-5 word keyword in Bahasa Indonesia (target what Indonesians actually search)
- intent: informational or transactional
- content_type: how-to, listicle, guide, comparison, explainer, review, news

Return as a JSON array.`
    }],
  })

  const text = response.content.find(b => b.type === 'text')?.text || '[]'
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  return jsonMatch ? JSON.parse(jsonMatch[0]) : []
}

export async function scoreAndPickKeyword(): Promise<{ keyword: string; intent: string; content_type: string } | null> {
  const supabase = getSupabaseClient()

  // 1. Check for pre-planned keywords in DB
  const { data: planned } = await supabase
    .from('keyword_research')
    .select('keyword')
    .eq('status', 'candidate')
    .limit(1)
    .single()

  if (planned) {
    await supabase.from('keyword_research').update({ status: 'planned' }).eq('keyword', planned.keyword)
    return { keyword: planned.keyword, intent: 'informational', content_type: 'guide' }
  }

  // 2. Try autocomplete first (fast, no auth)
  const searchTerms = ['cuci mobil', 'tips mobil', 'detailing mobil', 'mobil baru 2026', 'review mobil', 'modifikasi mobil', 'road trip Indonesia', 'mobil listrik Indonesia', 'F1 2026', 'cara merawat mobil']
  const randomSeed = searchTerms[Math.floor(Math.random() * searchTerms.length)]
  const acSuggestions = await fetchAutocomplete(randomSeed)

  for (const s of acSuggestions) {
    const { count } = await supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('target_keyword', s)
    if (!count || count === 0) {
      const { count: kwCount } = await supabase.from('keyword_research').select('*', { count: 'exact', head: true }).eq('keyword', s).in('status', ['planned', 'published'])
      if (!kwCount || kwCount === 0) {
        await supabase.from('keyword_research').upsert({ keyword: s, status: 'planned', source: 'autocomplete' }, { onConflict: 'keyword' })
        return { keyword: s, intent: 'informational', content_type: 'guide' }
      }
    }
  }

  // 3. Try GSC (may not be configured yet)
  let opportunities: any[] = []
  try { opportunities = await fetchOpportunityKeywords() } catch {}

  if (opportunities.length > 0) {
    // Score: impressions * 0.4 + (1/position) * 0.3 + ctr_potential * 0.3
    const scored = opportunities.map((r: any) => ({
      keyword: r.keys?.[0] || r.query || '',
      impressions: r.impressions,
      position: r.position,
      score: (r.impressions * 0.4) + ((1 / r.position) * 100 * 0.3) + ((0.3 - (r.ctr || 0)) * 100 * 0.3),
    })).sort((a: any, b: any) => b.score - a.score)

    // Check against already written keywords
    for (const item of scored) {
      const { count } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true })
        .eq('target_keyword', item.keyword)

      if (!count || count === 0) {
        // Also check keyword_research for planned/written
        const { data: existing } = await supabase
          .from('keyword_research')
          .select('status')
          .eq('keyword', item.keyword)
          .single()

        if (!existing || existing.status === 'candidate') {
          // Store in keyword_research
          await supabase.from('keyword_research').upsert({
            keyword: item.keyword,
            impressions: item.impressions,
            current_position: item.position,
            status: 'planned',
            source: 'gsc',
          }, { onConflict: 'keyword' })
          return { keyword: item.keyword, intent: 'informational', content_type: 'guide' }
        }
      }
    }
  }

  // Fallback: brainstorm with Claude + autocomplete
  const seeds = await brainstormTopics()
  if (seeds.length > 0) {
    for (const topic of seeds) {
      const { count } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true })
        .eq('target_keyword', topic.keyword)

      if (!count || count === 0) {
        await supabase.from('keyword_research').upsert({
          keyword: topic.keyword,
          status: 'planned',
          source: 'manual',
        }, { onConflict: 'keyword' })
        return topic
      }
    }
  }

  // Last resort: autocomplete
  const niche = DIMAS_CONFIG.blogNiche.split(',')[0].trim()
  const suggestions = await fetchAutocomplete(niche)
  for (const s of suggestions) {
    const { count } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })
      .eq('target_keyword', s)
    if (!count || count === 0) {
      await supabase.from('keyword_research').upsert({
        keyword: s,
        status: 'planned',
        source: 'autocomplete',
      }, { onConflict: 'keyword' })      return { keyword: s, intent: 'informational', content_type: 'guide' }
    }
  }

  return null
}

// Export getAnthropicClient for use by writer
export { getAnthropicClient }
