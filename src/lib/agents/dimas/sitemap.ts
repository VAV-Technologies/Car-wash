import { getSupabaseClient } from './config'
import { DIMAS_CONFIG } from './config'

export async function generateSitemapXml(): Promise<string> {
  const supabase = getSupabaseClient()
  const baseUrl = DIMAS_CONFIG.blogBaseUrl.replace(/\/tips$/, '')

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, published_at, updated_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

  // Homepage
  xml += '  <url>\n'
  xml += `    <loc>${baseUrl}/</loc>\n`
  xml += '    <changefreq>daily</changefreq>\n'
  xml += '    <priority>1.0</priority>\n'
  xml += '  </url>\n'

  // Blog index
  xml += '  <url>\n'
  xml += `    <loc>${baseUrl}/tips</loc>\n`
  xml += '    <changefreq>daily</changefreq>\n'
  xml += '    <priority>0.9</priority>\n'
  xml += '  </url>\n'

  // Individual posts
  for (const post of posts || []) {
    const lastmod = (post.updated_at || post.published_at || '').split('T')[0]
    xml += '  <url>\n'
    xml += `    <loc>${baseUrl}/tips/${post.slug}</loc>\n`
    if (lastmod) xml += `    <lastmod>${lastmod}</lastmod>\n`
    xml += '    <changefreq>weekly</changefreq>\n'
    xml += '    <priority>0.8</priority>\n'
    xml += '  </url>\n'
  }

  xml += '</urlset>'
  return xml
}
