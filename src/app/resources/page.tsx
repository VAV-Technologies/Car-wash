import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { FadeIn } from '@/components/ui/fade-in'
import { getPublishedPosts, type BlogCategory, type BlogPostListItem } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Car Care Tips & News | Castudio',
  description:
    'Expert car care tips, detailing guides, and Castudio news for drivers in Indonesia who want to keep their vehicles in top condition.',
  openGraph: {
    title: 'Car Care Tips & News | Castudio',
    description:
      'Expert car care tips, detailing guides, and Castudio news for drivers in Indonesia who want to keep their vehicles in top condition.',
  },
}

const categories: { value: BlogCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'tips', label: 'Tips' },
  { value: 'guides', label: 'Guides' },
  { value: 'news', label: 'News' },
  { value: 'promotions', label: 'Promotions' },
]

const categoryLabels: Record<BlogCategory, string> = {
  tips: 'Tips',
  guides: 'Guides',
  news: 'News',
  promotions: 'Promotions',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function BlogCard({ post, index }: { post: BlogPostListItem; index: number }) {
  return (
    <FadeIn delay={index * 80} direction="up">
      <Link
        href={`/resources/${post.slug}`}
        className="group flex flex-col h-full border border-white/10 hover:border-white/25 transition-colors"
      >
        {/* Image — always rendered, placeholder if no cover */}
        <div className="relative aspect-square overflow-hidden border-b border-white/10 bg-brand-dark-gray">
          {post.cover_image_url ? (
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-10 h-10 text-white/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="0" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            </div>
          )}
        </div>

        {/* Content — flex-1 to fill remaining height */}
        <div className="flex flex-col flex-1 p-5">
          <span className="inline-block self-start text-xs font-medium uppercase tracking-wider text-brand-orange border border-brand-orange/30 px-2 py-0.5 mb-3">
            {categoryLabels[post.category]}
          </span>
          <h3 className="text-lg font-heading text-white group-hover:text-white/80 transition-colors leading-snug mb-2">
            {post.title}
          </h3>
          <p className="text-sm text-white/60 line-clamp-3 flex-1">
            {post.excerpt}
          </p>
          <p className="text-xs text-white/50 mt-4 pt-3 border-t border-white/5">
            {post.author_name}
            {post.published_at && <> &middot; {formatDate(post.published_at)}</>}
            {' '}&middot; {post.reading_time_minutes} min read
          </p>
        </div>
      </Link>
    </FadeIn>
  )
}

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>
}) {
  const resolvedParams = await searchParams
  const categoryParam = resolvedParams.category as BlogCategory | undefined
  const currentPage = parseInt(resolvedParams.page || '1', 10)

  const validCategory =
    categoryParam && ['tips', 'guides', 'news', 'promotions'].includes(categoryParam)
      ? (categoryParam as BlogCategory)
      : undefined

  const { posts, total } = await getPublishedPosts({
    page: currentPage,
    limit: 12,
    category: validCategory,
  })

  const totalPages = Math.ceil(total / 12)

  return (
    <div className="bg-brand-dark-gray">
      {/* Hero */}
      <section className="w-full min-h-[60vh] bg-brand-black flex items-center py-24 text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up" delay={200} className="text-center space-y-6 px-4 max-w-4xl mx-auto">
            <p className="text-sm uppercase tracking-wider text-brand-orange font-heading">
              Resources
            </p>
            <h1 className="text-4xl md:text-6xl font-normal font-heading tracking-tight">
              Car Care Tips, News &amp; Guides
            </h1>
            <p className="text-lg md:text-xl text-white/70 font-light max-w-3xl mx-auto leading-relaxed">
              Expert car care advice, product guides, and Castudio updates for drivers who care.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Separator */}
      <div className="border-t border-white/10" />

      {/* Content */}
      <section className="w-full py-20 md:py-24 bg-brand-dark-gray section-lines-dark">
        <div className="container mx-auto">
          {/* Category tabs + pagination row */}
          <FadeIn direction="up">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-12">
              {/* Left: category tabs */}
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const isActive =
                    cat.value === 'all' ? !validCategory : cat.value === validCategory
                  const href =
                    cat.value === 'all' ? '/resources' : `/resources?category=${cat.value}`

                  return (
                    <Link
                      key={cat.value}
                      href={href}
                      className={
                        isActive
                          ? 'px-4 py-2 text-sm font-medium bg-brand-orange text-black border border-brand-orange transition-colors'
                          : 'px-4 py-2 text-sm font-medium border border-white/10 text-white/70 hover:border-white/20 hover:text-white transition-colors'
                      }
                    >
                      {cat.label}
                    </Link>
                  )
                })}
              </div>

              {/* Right: pagination */}
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  {currentPage > 1 && (
                    <Link
                      href={`/resources?${new URLSearchParams({
                        ...(validCategory ? { category: validCategory } : {}),
                        page: String(currentPage - 1),
                      }).toString()}`}
                      className="px-3 py-2 text-sm font-medium border border-white/10 text-white hover:border-white/20 transition-colors"
                    >
                      Previous
                    </Link>
                  )}
                  <span className="px-3 py-2 text-sm text-white/50">
                    {currentPage} / {totalPages}
                  </span>
                  {currentPage < totalPages && (
                    <Link
                      href={`/resources?${new URLSearchParams({
                        ...(validCategory ? { category: validCategory } : {}),
                        page: String(currentPage + 1),
                      }).toString()}`}
                      className="px-3 py-2 text-sm font-medium border border-white/10 text-white hover:border-white/20 transition-colors"
                    >
                      Next
                    </Link>
                  )}
                </div>
              )}
            </div>
          </FadeIn>

          {/* Posts grid */}
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, i) => (
                <BlogCard key={post.id} post={post} index={i} />
              ))}
            </div>
          ) : (
            <FadeIn>
              <div className="border border-white/10 p-12 text-center">
                <p className="text-white/50">
                  No articles found{validCategory ? ` in ${categoryLabels[validCategory]}` : ''}. Check back soon.
                </p>
              </div>
            </FadeIn>
          )}

        </div>
      </section>

      {/* JSON-LD CollectionPage schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Castudio Resources',
            description:
              'Expert car care tips, detailing guides, and Castudio news for drivers in Indonesia who want to keep their vehicles in top condition.',
            url: 'https://www.castudio.co/resources',
            publisher: {
              '@type': 'Organization',
              name: 'Castudio',
              url: 'https://www.castudio.co',
            },
          }),
        }}
      />
    </div>
  )
}
