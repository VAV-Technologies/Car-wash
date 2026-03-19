// --- Types ---
export type BlogCategory = 'tips' | 'guides' | 'news' | 'promotions'

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image_url: string | null
  category: BlogCategory
  tags: string[]
  author_name: string
  author_role: string | null
  published_at: string | null
  created_at: string
  updated_at: string
  is_published: boolean
  meta_title: string | null
  meta_description: string | null
  reading_time_minutes: number
}

export type BlogPostListItem = Omit<BlogPost, 'content'>

// --- Sample data (static content) ---
const now = new Date().toISOString()

const samplePosts: BlogPost[] = [
  {
    id: 'sample-1',
    title: "How Often Should You Wash Your Car in Indonesia's Climate?",
    slug: 'how-often-wash-car-indonesia',
    excerpt: "Indonesia's tropical climate is tough on cars. Here's how often you should wash to keep your paint protected.",
    content: `<h2>The tropical challenge</h2><p>Indonesia's hot, humid climate means your car faces constant exposure to intense UV rays, heavy rainfall, road dust, and pollution. All of these can degrade your paint, cause water spots, and accelerate rust if left unchecked.</p><h2>Rain doesn't mean clean</h2><p>Many drivers assume rain washes the car. In reality, tropical rain often carries pollutants and leaves mineral deposits that etch into your clear coat over time. After every heavy downpour, a quick rinse at minimum is recommended.</p><h2>Recommended wash frequency</h2><p>For most drivers in Indonesian cities, we recommend a thorough wash every 5 to 7 days. If you park outdoors or drive through dusty areas regularly, consider increasing that to twice a week. A consistent wash schedule paired with periodic waxing or coating will keep your paint looking fresh year-round.</p>`,
    cover_image_url: null,
    category: 'tips',
    tags: ['Car Wash', 'Indonesia', 'Climate'],
    author_name: 'Castudio Team',
    author_role: null,
    published_at: '2026-03-18T08:00:00Z',
    created_at: now,
    updated_at: now,
    is_published: true,
    meta_title: null,
    meta_description: null,
    reading_time_minutes: 4,
  },
  {
    id: 'sample-2',
    title: "Car Wash vs. Car Detailing: What's the Difference?",
    slug: 'car-wash-vs-detailing',
    excerpt: "Many drivers confuse washing with detailing. Here's what each involves and when you need which.",
    content: `<h2>What a car wash covers</h2><p>A standard car wash removes surface dirt, dust, and grime from the exterior of your vehicle. It typically includes a rinse, soap wash, wheel cleaning, and a dry. It's a maintenance step that keeps your car looking presentable day to day.</p><h2>What detailing adds</h2><p>Detailing goes far deeper. Exterior detailing includes clay bar treatment, paint correction, polishing, and protective coating. Interior detailing covers deep cleaning of upholstery, dashboard conditioning, leather treatment, and odour removal. Think of it as a full restoration of your car's appearance.</p><h2>When to choose which</h2><p>Regular washes should happen weekly. Full detailing is best done every 3 to 6 months, or before special occasions. If your paint feels rough to the touch or your interior has stubborn stains, it's time for a detail.</p>`,
    cover_image_url: null,
    category: 'guides',
    tags: ['Car Wash', 'Detailing', 'Comparison'],
    author_name: 'Castudio Team',
    author_role: null,
    published_at: '2026-03-15T08:00:00Z',
    created_at: now,
    updated_at: now,
    is_published: true,
    meta_title: null,
    meta_description: null,
    reading_time_minutes: 5,
  },
  {
    id: 'sample-3',
    title: 'Why Ceramic Coating Is Worth the Investment',
    slug: 'ceramic-coating-worth-investment',
    excerpt: 'Ceramic coating provides long-lasting paint protection that saves time and money. Here is why more car owners are making the switch.',
    content: `<h2>What is ceramic coating?</h2><p>Ceramic coating is a liquid polymer applied to the exterior of your car. It bonds chemically with the factory paint, creating a durable layer of protection that repels water, dirt, and UV damage. Unlike wax that wears off in weeks, a quality ceramic coating can last 2 to 5 years.</p><h2>The benefits</h2><p>Coated cars are significantly easier to clean — dirt and contaminants slide off the hydrophobic surface. You'll spend less time and money on frequent waxing and polishing. The coating also protects against minor scratches, bird droppings, tree sap, and oxidation from the tropical sun.</p><h2>Is it worth the cost?</h2><p>While the upfront investment is higher than a wax treatment, the long-term savings on maintenance and the preserved resale value of your vehicle make ceramic coating one of the smartest investments for any car owner in Indonesia.</p>`,
    cover_image_url: null,
    category: 'guides',
    tags: ['Ceramic Coating', 'Paint Protection'],
    author_name: 'Castudio Team',
    author_role: null,
    published_at: '2026-03-12T08:00:00Z',
    created_at: now,
    updated_at: now,
    is_published: true,
    meta_title: null,
    meta_description: null,
    reading_time_minutes: 6,
  },
  {
    id: 'sample-4',
    title: '5 Signs Your Car Needs Professional Detailing',
    slug: '5-signs-car-needs-detailing',
    excerpt: 'Not sure if your car needs a detail? These five telltale signs mean it is time to book a professional service.',
    content: `<h2>1. Your paint feels rough</h2><p>Run your hand across a clean panel. If it feels gritty or rough instead of glass-smooth, contaminants have bonded to your clear coat. A clay bar treatment and polish will restore that factory feel.</p><h2>2. Swirl marks are visible in sunlight</h2><p>Fine circular scratches that show up under direct light are caused by improper washing techniques. Professional paint correction removes these swirl marks and restores clarity.</p><h2>3. Your interior smells stale</h2><p>If air fresheners are no longer cutting it, deep-seated odours from food, pets, or humidity need professional extraction. Interior detailing includes steam cleaning and odour treatment that gets to the source.</p><h2>4. Water no longer beads on the surface</h2><p>When water sheets across your paint instead of forming tight beads, your wax or coating has worn off. A fresh application of sealant or ceramic coating will restore protection.</p><h2>5. Stains on seats and carpets won't come out</h2><p>Stubborn stains from coffee, food, or mud require professional-grade extractors and cleaning solutions. Regular vacuuming simply can't reach deep into fabric fibres the way a detail can.</p>`,
    cover_image_url: null,
    category: 'tips',
    tags: ['Detailing', 'Car Care'],
    author_name: 'Castudio Team',
    author_role: null,
    published_at: '2026-03-08T08:00:00Z',
    created_at: now,
    updated_at: now,
    is_published: true,
    meta_title: null,
    meta_description: null,
    reading_time_minutes: 4,
  },
  {
    id: 'sample-5',
    title: 'The Complete Guide to Car Wash Subscriptions',
    slug: 'guide-car-wash-subscriptions',
    excerpt: 'Car wash subscriptions save you time and money. Here is how they work and how to choose the right plan for your needs.',
    content: `<h2>How subscriptions work</h2><p>A car wash subscription gives you unlimited or a set number of washes per month for a flat fee. Instead of paying per visit, you simply drive in whenever your car needs attention. Most plans include exterior washes, with premium tiers adding interior cleaning and detailing extras.</p><h2>The cost advantage</h2><p>If you wash your car weekly, a subscription typically saves 30 to 50 percent compared to paying per wash. The convenience factor is equally valuable — no need to think about whether today is a wash day, just come whenever you need it.</p><h2>Choosing the right plan</h2><p>Consider your driving habits, where you park, and how much you care about your car's appearance. A basic plan works for most daily commuters. If you have a premium vehicle or park outdoors, a plan with wax or coating top-ups is worth the upgrade.</p>`,
    cover_image_url: null,
    category: 'guides',
    tags: ['Subscriptions', 'Plans'],
    author_name: 'Castudio Team',
    author_role: null,
    published_at: '2026-03-05T08:00:00Z',
    created_at: now,
    updated_at: now,
    is_published: true,
    meta_title: null,
    meta_description: null,
    reading_time_minutes: 5,
  },
  {
    id: 'sample-6',
    title: "Protecting Your Car's Paint in Tropical Weather",
    slug: 'protecting-paint-tropical-weather',
    excerpt: 'Tropical sun, rain, and humidity take a toll on your paint. Learn how to protect your car from the elements year-round.',
    content: `<h2>UV damage is real</h2><p>Indonesia sits near the equator, which means UV exposure is intense year-round. Over time, unprotected paint fades, oxidises, and loses its gloss. Regular waxing or a ceramic coating acts as a sunscreen for your vehicle.</p><h2>The rain factor</h2><p>Acid rain and mineral-heavy water leave spots and etch marks on unprotected surfaces. Parking under cover when possible and applying a hydrophobic sealant are the best defences. If your car gets caught in a downpour, a quick rinse afterwards prevents water spots from setting in.</p><h2>A layered approach</h2><p>The most effective protection combines regular washing, a paint sealant or ceramic coating, and periodic polishing to remove any surface damage before it becomes permanent. Think of it as a skincare routine for your car.</p>`,
    cover_image_url: null,
    category: 'tips',
    tags: ['Paint Protection', 'Tropical'],
    author_name: 'Castudio Team',
    author_role: null,
    published_at: '2026-02-28T08:00:00Z',
    created_at: now,
    updated_at: now,
    is_published: true,
    meta_title: null,
    meta_description: null,
    reading_time_minutes: 5,
  },
  {
    id: 'sample-7',
    title: 'Interior Detailing: What to Expect',
    slug: 'interior-detailing-what-to-expect',
    excerpt: 'Booking an interior detail for the first time? Here is a step-by-step look at what our technicians do and why.',
    content: `<h2>The process</h2><p>An interior detail begins with a thorough vacuum of all surfaces including seats, carpets, door panels, and the boot. Next, our technicians use specialised brushes and compressed air to remove dust from vents, crevices, and hard-to-reach areas.</p><h2>Deep cleaning and conditioning</h2><p>Fabric seats and carpets are treated with extraction cleaners that lift deep stains. Leather surfaces are cleaned and conditioned to prevent cracking and fading. The dashboard, console, and trim are wiped down with UV-protective products that restore a factory-fresh look without the greasy shine.</p><h2>The finishing touches</h2><p>Glass is cleaned inside and out for streak-free clarity. A final odour treatment neutralises any lingering smells. The result is an interior that looks, feels, and smells like new — ready for your next drive.</p>`,
    cover_image_url: null,
    category: 'guides',
    tags: ['Interior', 'Detailing'],
    author_name: 'Castudio Team',
    author_role: null,
    published_at: '2026-02-22T08:00:00Z',
    created_at: now,
    updated_at: now,
    is_published: true,
    meta_title: null,
    meta_description: null,
    reading_time_minutes: 4,
  },
  {
    id: 'sample-8',
    title: 'Castudio Launches Premium Ceramic Coating Service',
    slug: 'castudio-launches-ceramic-coating',
    excerpt: 'We are excited to announce our new premium ceramic coating service, delivering long-lasting paint protection for your vehicle.',
    content: `<h2>A new standard in protection</h2><p>Castudio is proud to introduce our premium ceramic coating service. Using industry-leading products and trained technicians, we now offer multi-year paint protection that keeps your car looking showroom-fresh through Indonesia's toughest conditions.</p><h2>What to expect</h2><p>The service includes a full paint correction to remove swirl marks and imperfections, followed by the application of a professional-grade ceramic coating. The result is a deep, glossy finish with hydrophobic properties that make maintenance effortless. Packages start from a single-layer coating with a 2-year warranty up to a multi-layer application with 5-year coverage.</p>`,
    cover_image_url: null,
    category: 'news',
    tags: ['Ceramic Coating', 'Launch'],
    author_name: 'Castudio Team',
    author_role: null,
    published_at: '2026-02-15T08:00:00Z',
    created_at: now,
    updated_at: now,
    is_published: true,
    meta_title: null,
    meta_description: null,
    reading_time_minutes: 3,
  },
  {
    id: 'sample-9',
    title: 'How We Choose Our Detailing Products',
    slug: 'how-we-choose-detailing-products',
    excerpt: 'Not all car care products are equal. Here is how Castudio selects the products we trust on your vehicle.',
    content: `<h2>Quality over cost</h2><p>We test dozens of products before adding anything to our lineup. Every shampoo, polish, coating, and conditioner must meet strict standards for effectiveness, safety, and longevity. We never cut corners with cheap alternatives that could damage your paint or interior.</p><h2>Safe for all surfaces</h2><p>Our products are pH-balanced and formulated to be safe on clear coats, ceramic coatings, vinyl wraps, leather, and fabric. We work closely with suppliers to ensure compatibility across all vehicle types and finishes.</p><h2>Continuous improvement</h2><p>The car care industry evolves constantly. We regularly review and update our product selection based on new formulations, customer feedback, and our own in-house testing. When we find something better, we switch — because your car deserves the best available.</p>`,
    cover_image_url: null,
    category: 'tips',
    tags: ['Products', 'Quality'],
    author_name: 'Castudio Team',
    author_role: null,
    published_at: '2026-02-10T08:00:00Z',
    created_at: now,
    updated_at: now,
    is_published: true,
    meta_title: null,
    meta_description: null,
    reading_time_minutes: 4,
  },
  {
    id: 'sample-10',
    title: 'Monsoon Season Car Care Tips',
    slug: 'monsoon-season-car-care-tips',
    excerpt: 'The monsoon season brings heavy rain and flooding risks. Here is how to protect your car during the wettest months.',
    content: `<h2>Before the rains hit</h2><p>Apply a fresh coat of wax or sealant before monsoon season begins. This creates a barrier against water spots, mineral deposits, and road grime that gets splashed up during heavy rains. Check your windshield wipers and replace them if they streak.</p><h2>During the monsoon</h2><p>Wash your car more frequently during the rainy season, not less. Rain carries pollutants that sit on your paint and cause damage over time. After driving through flooded streets, rinse the undercarriage to remove salt, mud, and debris that accelerate rust.</p><h2>Watch your interior</h2><p>Wet shoes and umbrellas introduce moisture into your cabin, which can lead to mould and musty smells in Indonesia's humidity. Use rubber floor mats during monsoon season and crack your windows when parked in covered areas to allow air circulation.</p>`,
    cover_image_url: null,
    category: 'tips',
    tags: ['Monsoon', 'Car Care', 'Seasonal'],
    author_name: 'Castudio Team',
    author_role: null,
    published_at: '2026-02-05T08:00:00Z',
    created_at: now,
    updated_at: now,
    is_published: true,
    meta_title: null,
    meta_description: null,
    reading_time_minutes: 5,
  },
  {
    id: 'sample-11',
    title: 'The Truth About Automatic vs. Hand Car Wash',
    slug: 'automatic-vs-hand-car-wash',
    excerpt: 'Is an automatic car wash safe for your paint? We break down the pros and cons of each method.',
    content: `<h2>Automatic car washes</h2><p>Drive-through washes are fast and convenient, but many use abrasive brushes that can leave swirl marks and micro-scratches over time. Touchless automatic washes are gentler but often rely on harsh chemicals to compensate for the lack of physical contact.</p><h2>Hand wash advantages</h2><p>A professional hand wash uses soft mitts, pH-balanced shampoos, and the two-bucket method to minimise the risk of scratching. Technicians can pay attention to problem areas like wheel wells, door jambs, and trim that machines miss entirely.</p><h2>Our recommendation</h2><p>For any car you care about, hand washing is the clear winner. The extra time invested translates directly into better paint condition and a longer-lasting finish. At Castudio, every wash is done by hand with premium products and trained staff.</p>`,
    cover_image_url: null,
    category: 'guides',
    tags: ['Hand Wash', 'Comparison'],
    author_name: 'Castudio Team',
    author_role: null,
    published_at: '2026-01-28T08:00:00Z',
    created_at: now,
    updated_at: now,
    is_published: true,
    meta_title: null,
    meta_description: null,
    reading_time_minutes: 4,
  },
  {
    id: 'sample-12',
    title: 'Leather Care 101: Keeping Your Interior Fresh',
    slug: 'leather-care-101',
    excerpt: 'Leather interiors need regular care to stay supple and crack-free. Here is how to maintain yours properly.',
    content: `<h2>Why leather needs attention</h2><p>Leather is a natural material that dries out and cracks without proper conditioning, especially in Indonesia's heat. UV exposure through windows accelerates fading, while sweat and body oils from daily use can stain and discolour the surface over time.</p><h2>The cleaning routine</h2><p>Use a dedicated leather cleaner — never household products — to gently lift dirt and oils. Apply with a soft brush in circular motions, then wipe clean with a microfibre cloth. Follow with a leather conditioner that replenishes moisture and creates a protective barrier.</p><h2>How often to condition</h2><p>For daily drivers in tropical climates, we recommend conditioning every 4 to 6 weeks. If you park in direct sun regularly, consider a UV-protective leather treatment or window tinting to reduce heat and light exposure on your seats.</p>`,
    cover_image_url: null,
    category: 'tips',
    tags: ['Leather', 'Interior Care'],
    author_name: 'Castudio Team',
    author_role: null,
    published_at: '2026-01-20T08:00:00Z',
    created_at: now,
    updated_at: now,
    is_published: true,
    meta_title: null,
    meta_description: null,
    reading_time_minutes: 5,
  },
  {
    id: 'sample-13',
    title: 'Castudio Expands to Bandung',
    slug: 'castudio-expands-bandung',
    excerpt: 'We are thrilled to announce the opening of our new Castudio location in Bandung, bringing premium car care to West Java.',
    content: `<h2>Growing across Java</h2><p>After establishing our presence in Jakarta, Castudio is expanding to Bandung to serve the growing community of car enthusiasts in West Java. Our new location offers the same premium wash and detailing services that our Jakarta clients know and trust.</p><h2>What to expect</h2><p>The Bandung studio features dedicated detailing bays, a comfortable waiting lounge, and our full range of services including hand wash, interior detailing, paint correction, and ceramic coating. Grand opening specials will be available for the first month — follow our social media for details.</p>`,
    cover_image_url: null,
    category: 'news',
    tags: ['Expansion', 'Bandung'],
    author_name: 'Castudio Team',
    author_role: null,
    published_at: '2026-01-15T08:00:00Z',
    created_at: now,
    updated_at: now,
    is_published: true,
    meta_title: null,
    meta_description: null,
    reading_time_minutes: 3,
  },
  {
    id: 'sample-14',
    title: 'New Year, New Shine: Detailing Promotions for 2026',
    slug: 'new-year-detailing-promotions-2026',
    excerpt: 'Start 2026 with a freshly detailed car. Check out our special New Year promotions on wash packages and ceramic coating.',
    content: `<h2>New Year specials</h2><p>Kick off 2026 with your car looking its absolute best. Throughout January, Castudio is offering exclusive discounts on our most popular services. Get 20 percent off any full detail package or upgrade to our premium ceramic coating at a special introductory rate.</p><h2>Bundle and save</h2><p>Pair an exterior detail with an interior deep clean and save even more. Our New Year bundles are designed for drivers who want a complete refresh without breaking the bank. All promotions are available at both our Jakarta and Bandung locations while slots last.</p>`,
    cover_image_url: null,
    category: 'promotions',
    tags: ['Promotions', '2026', 'Detailing'],
    author_name: 'Castudio Team',
    author_role: null,
    published_at: '2026-01-05T08:00:00Z',
    created_at: now,
    updated_at: now,
    is_published: true,
    meta_title: null,
    meta_description: null,
    reading_time_minutes: 3,
  },
]

function getSampleListItems(): BlogPostListItem[] {
  return samplePosts.map(({ content, ...rest }) => rest)
}

// --- Query helpers (static data only) ---
export async function getPublishedPosts(params: {
  page?: number
  limit?: number
  category?: BlogCategory
  search?: string
}): Promise<{ posts: BlogPostListItem[]; total: number }> {
  const page = params.page ?? 1
  const limit = params.limit ?? 12
  const from = (page - 1) * limit

  let items = getSampleListItems()
  if (params.category) items = items.filter((p) => p.category === params.category)
  if (params.search) {
    const s = params.search.toLowerCase()
    items = items.filter((p) => p.title.toLowerCase().includes(s) || p.excerpt.toLowerCase().includes(s))
  }
  const total = items.length
  return { posts: items.slice(from, from + limit), total }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  return samplePosts.find((p) => p.slug === slug) ?? null
}

export async function getRelatedPosts(category: BlogCategory, excludeSlug: string, limit = 3): Promise<BlogPostListItem[]> {
  return getSampleListItems()
    .filter((p) => p.category === category && p.slug !== excludeSlug)
    .slice(0, limit)
}

export async function getAllPublishedSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  return samplePosts.map((p) => ({ slug: p.slug, updated_at: p.updated_at }))
}
