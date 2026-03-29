export const DIMAS_CONFIG = {
  siteUrl: process.env.DIMAS_SITE_URL || 'sc-domain:castudio.id',
  blogBaseUrl: process.env.DIMAS_BLOG_BASE_URL || 'https://castudio.id/tips',
  blogNiche: process.env.DIMAS_BLOG_NICHE || 'automotive lifestyle, car care, and auto detailing in Indonesia',
  targetCountry: process.env.DIMAS_TARGET_COUNTRY || 'idn',
  targetLanguage: process.env.DIMAS_TARGET_LANGUAGE || 'id',
  postsPerDay: parseInt(process.env.DIMAS_POSTS_PER_DAY || '1', 10),
}

export const DIMAS_BRAND_CONTEXT = `Castudio is a premium mobile car wash and detailing service based in Jabodetabek (Jakarta, Bogor, Depok, Tangerang, Bekasi), Indonesia. We come to the customer's location with professional-grade equipment and premium products.

Services: Standard Wash (Rp 349.000), Professional Wash (Rp 649.000), Elite Wash (Rp 949.000), Interior Detail (Rp 1.039.000), Exterior Detail (Rp 1.039.000), Window Detail (Rp 689.000), Tire & Rims (Rp 289.000), Full Detail (Rp 2.799.000).

Subscriptions: Essentials (Rp 339.000/mo, 4x Standard), Plus (Rp 449.000/mo, 4x Professional), Elite (Rp 1.000.000/mo, 4x Pro + 2x Elite).

Website: castudio.id
WhatsApp: +62 855 9122 2000

Blog tone: Informative, conversational, knowledgeable. Write like a car enthusiast who also happens to run a detailing business. Not salesy. Naturally mention Castudio services where relevant but most posts should be genuinely useful car content that builds authority.

Content scope (NOT limited to car washing/detailing):
Car care tips and techniques (washing, waxing, polishing, paint protection)
New car model reviews and comparisons (Indonesian market focus)
Car brand news and industry updates
Automotive technology and trends
F1 and motorsport coverage
Car content creators and community
Driving tips and road trip guides in Indonesia
Car modifications and accessories
Electric vehicles and the EV transition in Indonesia
Car buying guides and market analysis

The goal is to become the go-to Indonesian automotive lifestyle blog, with car care being one vertical among many.`

export function getSupabaseClient() {
  const { createClient } = require('@supabase/supabase-js')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
