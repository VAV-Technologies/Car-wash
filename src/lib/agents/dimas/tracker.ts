import { querySearchAnalytics } from './gsc'
import { getSupabaseClient } from './config'

function getDateString(daysAgo: number): string {
  const d = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
  return d.toISOString().split('T')[0]
}

export async function trackRankings() {
  const supabase = getSupabaseClient()

  // Get all published posts
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('id, target_keyword, slug')
    .eq('status', 'published')

  if (!posts || posts.length === 0) return { tracked: 0 }

  const today = getDateString(0)
  let tracked = 0

  for (const post of posts) {
    try {
      const rows = await querySearchAnalytics({
        startDate: getDateString(7),
        endDate: getDateString(1),
        dimensions: ['query'],
        filters: [{ dimension: 'query', expression: post.target_keyword }],
        rowLimit: 10,
      })

      const row = rows[0]
      if (row) {
        await supabase.from('rank_tracking').insert({
          blog_post_id: post.id,
          keyword: post.target_keyword,
          position: row.position,
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: row.ctr,
          tracked_at: today,
        })
        tracked++

        // Update keyword_research too
        await supabase.from('keyword_research')
          .update({ current_position: row.position, clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, last_checked: new Date().toISOString() })
          .eq('keyword', post.target_keyword)
      }
    } catch {
      // GSC query failed for this keyword — skip
    }
  }

  await supabase.from('agent_logs').insert({
    action: 'track',
    details: { tracked, total_posts: posts.length },
  })

  return { tracked }
}
