import { querySearchAnalytics } from './gsc'
import { DIMAS_CONFIG, getSupabaseClient } from './config'
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
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `I'm building a blog about ${DIMAS_CONFIG.blogNiche}. Generate 10 blog post topics targeting informational search intent. For each, provide a JSON object with: keyword (2-4 words, specific), intent (informational/transactional), content_type (how-to/listicle/guide/comparison/explainer). Return as a JSON array.`
    }],
  })

  const text = response.content.find(b => b.type === 'text')?.text || '[]'
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  return jsonMatch ? JSON.parse(jsonMatch[0]) : []
}

export async function scoreAndPickKeyword(): Promise<{ keyword: string; intent: string; content_type: string } | null> {
  const supabase = getSupabaseClient()

  // Try GSC data first
  const opportunities = await fetchOpportunityKeywords()

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
          }, { onConflict: 'keyword' }).catch(() => {})

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
        }, { onConflict: 'keyword' }).catch(() => {})

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
      }, { onConflict: 'keyword' }).catch(() => {})
      return { keyword: s, intent: 'informational', content_type: 'guide' }
    }
  }

  return null
}

// Export getAnthropicClient for use by writer
export { getAnthropicClient }
