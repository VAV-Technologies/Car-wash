export const DIMAS_CONFIG = {
  siteUrl: process.env.DIMAS_SITE_URL || 'sc-domain:castudio.id',
  blogBaseUrl: process.env.DIMAS_BLOG_BASE_URL || 'https://castudio.id/tips',
  blogNiche: process.env.DIMAS_BLOG_NICHE || 'car wash, auto detailing, and car care in Indonesia',
  targetCountry: process.env.DIMAS_TARGET_COUNTRY || 'idn',
  targetLanguage: process.env.DIMAS_TARGET_LANGUAGE || 'id',
  postsPerDay: parseInt(process.env.DIMAS_POSTS_PER_DAY || '1', 10),
}

export function getSupabaseClient() {
  const { createClient } = require('@supabase/supabase-js')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
