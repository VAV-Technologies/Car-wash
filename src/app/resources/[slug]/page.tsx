import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { Linkedin, Twitter, Mail, ArrowLeft } from 'lucide-react'
import { FadeIn } from '@/components/ui/fade-in'
import { getPostBySlug, getRelatedPosts, type BlogCategory } from '@/lib/blog'

const categoryLabels: Record<BlogCategory, string> = {
  news: 'News',
  insights: 'Insights',
  guides: 'Guides',
  company: 'Company Updates',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return { title: 'Post Not Found | Nobridge' }
  }

  return {
    title: post.meta_title || `${post.title} | Nobridge Resources`,
    description: post.meta_description || post.excerpt,
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt,
      type: 'article',
      publishedTime: post.published_at ?? undefined,
      authors: [post.author_name],
      ...(post.cover_image_url ? { images: [post.cover_image_url] } : {}),
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) notFound()

  const relatedPosts = await getRelatedPosts(post.category, post.slug, 3)

  const postUrl = `https://www.nobridge.co/resources/${post.slug}`
  const shareText = encodeURIComponent(post.title)

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="w-full min-h-[60vh] bg-brand-dark-blue flex items-end py-24 text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up" delay={100}>
            <div className="px-4">
              {/* Back link — above the divider */}
              <Link
                href="/resources"
                className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors mb-6"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Resources
              </Link>
            </div>

            {/* Separator line spanning full container width */}
            <div className="border-t border-white/15 mb-8" />

            {/* Title row: text left, image right — image aligns with sidebar below */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:gap-0">
              {/* Left: category, title, meta */}
              <div className="flex-1 min-w-0 px-4">
                <span className="inline-block text-xs font-medium uppercase tracking-wider text-brand-sky-blue border border-brand-sky-blue/30 px-2 py-0.5 mb-5">
                  {categoryLabels[post.category]}
                </span>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading text-white tracking-tight mb-5 line-clamp-2">
                  {post.title}
                </h1>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/60">
                  <span className="font-medium text-white/80">{post.author_name}</span>
                  {post.author_role && (
                    <>
                      <span>&middot;</span>
                      <span>{post.author_role}</span>
                    </>
                  )}
                  {post.published_at && (
                    <>
                      <span>&middot;</span>
                      <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
                    </>
                  )}
                  <span>&middot;</span>
                  <span>{post.reading_time_minutes} min read</span>
                </div>
              </div>

              {/* Right: cover image 1:1 — flush with container edge to align with sidebar */}
              <div className="shrink-0 mt-6 lg:mt-0 px-4 lg:px-0 w-full lg:w-72 xl:w-80">
                <div className="w-full aspect-square border border-white/15 overflow-hidden">
                  {post.cover_image_url ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={post.cover_image_url}
                        alt={post.title}
                        fill
                        priority
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                      <svg className="w-10 h-10 text-white/15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <rect x="3" y="3" width="18" height="18" rx="0" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Separator */}
      <div className="border-t border-brand-dark-blue/10" />

      {/* Article body — content left, sticky sidebar right */}
      <section className="w-full py-10 md:py-12 bg-white section-lines-dark">
        <div className="container mx-auto">
          <article>
            <FadeIn direction="up" delay={200}>
              <div className="flex flex-col lg:flex-row">
                {/* Left: article content (~80%) */}
                <div className="flex-1 min-w-0 border border-brand-dark-blue/10 p-6 md:p-10 lg:p-14">
                  <div
                    className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-brand-dark-blue prose-a:text-brand-sky-blue prose-a:no-underline hover:prose-a:underline prose-img:border prose-img:border-brand-dark-blue/10 prose-p:text-muted-foreground prose-li:text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                </div>

                {/* Right: sticky sidebar (~20%) */}
                <div className="w-full lg:w-72 xl:w-80 shrink-0 border border-brand-dark-blue/10 border-t-0 lg:border-t lg:border-l-0">
                  <div className="lg:sticky lg:top-28">
                    {/* Share section */}
                    <div className="p-6 border-b border-brand-dark-blue/10">
                      <p className="text-xs uppercase tracking-wider text-brand-dark-blue/50 font-heading mb-3">Share</p>
                      <div className="border-t border-brand-dark-blue/10 mb-4" />
                      <div className="flex flex-col gap-2">
                        <a
                          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 text-sm text-brand-dark-blue/70 hover:text-brand-dark-blue transition-colors py-1.5"
                        >
                          <Linkedin className="h-4 w-4 shrink-0" />
                          Share on LinkedIn
                        </a>
                        <a
                          href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(postUrl)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 text-sm text-brand-dark-blue/70 hover:text-brand-dark-blue transition-colors py-1.5"
                        >
                          <Twitter className="h-4 w-4 shrink-0" />
                          Share on X
                        </a>
                        <a
                          href={`mailto:?subject=${shareText}&body=${encodeURIComponent(postUrl)}`}
                          className="flex items-center gap-2.5 text-sm text-brand-dark-blue/70 hover:text-brand-dark-blue transition-colors py-1.5"
                        >
                          <Mail className="h-4 w-4 shrink-0" />
                          Send via Email
                        </a>
                      </div>
                    </div>

                    {/* CTA box — dark blue */}
                    <div className="bg-brand-dark-blue text-white p-6">
                      <p className="text-xs uppercase tracking-wider text-brand-sky-blue font-heading mb-3">Nobridge Advisory</p>
                      <div className="border-t border-white/15 mb-3" />
                      <p className="text-sm font-heading text-white mb-3 leading-snug">
                        Expert M&amp;A advisory for business owners across Asia
                      </p>
                      <p className="text-xs text-white/60 leading-relaxed mb-5">
                        Whether you are exploring an exit, seeking acquisition opportunities, or want to understand what your business is worth, our partners are ready to have a confidential conversation.
                      </p>
                      <Link
                        href="/contact"
                        className="inline-flex items-center justify-center w-full h-10 text-sm font-medium bg-white text-brand-dark-blue hover:bg-white/90 transition-colors"
                      >
                        Connect with a Partner
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Related posts */}
            {relatedPosts.length > 0 && (
              <FadeIn direction="up" delay={100}>
                <div className="mt-16">
                  <div className="mb-8">
                    <p className="text-sm uppercase tracking-wider text-brand-sky-blue mb-3 font-heading">
                      Keep Reading
                    </p>
                    <h2 className="text-2xl md:text-3xl font-heading text-brand-dark-blue tracking-tight">
                      More from {categoryLabels[post.category]}
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
                    {relatedPosts.map((related, i) => (
                      <FadeIn key={related.id} delay={i * 80} direction="up">
                        <Link
                          href={`/resources/${related.slug}`}
                          className={`group flex flex-col h-full border border-brand-dark-blue/10 hover:border-brand-dark-blue/25 transition-colors ${i > 0 ? 'border-t-0 sm:border-t sm:border-l-0' : ''}`}
                        >
                          <div className="relative aspect-[16/10] overflow-hidden border-b border-brand-dark-blue/10 bg-brand-light-gray">
                            {related.cover_image_url ? (
                              <Image
                                src={related.cover_image_url}
                                alt={related.title}
                                fill
                                className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <svg className="w-8 h-8 text-brand-dark-blue/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                  <rect x="3" y="3" width="18" height="18" rx="0" />
                                  <circle cx="8.5" cy="8.5" r="1.5" />
                                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col flex-1 p-5">
                            <span className="inline-block self-start text-xs font-medium uppercase tracking-wider text-brand-sky-blue border border-brand-sky-blue/30 px-2 py-0.5 mb-3">
                              {categoryLabels[related.category]}
                            </span>
                            <h3 className="text-sm font-heading text-brand-dark-blue group-hover:text-brand-dark-blue/80 transition-colors leading-snug mb-auto">
                              {related.title}
                            </h3>
                            <p className="text-xs text-muted-foreground/70 mt-3 pt-3 border-t border-brand-dark-blue/5">
                              {related.reading_time_minutes} min read
                            </p>
                          </div>
                        </Link>
                      </FadeIn>
                    ))}
                  </div>
                </div>
              </FadeIn>
            )}
          </article>
        </div>
      </section>

      {/* JSON-LD Article schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.meta_description || post.excerpt,
            image: post.cover_image_url || undefined,
            datePublished: post.published_at,
            dateModified: post.updated_at,
            author: {
              '@type': 'Person',
              name: post.author_name,
              ...(post.author_role ? { jobTitle: post.author_role } : {}),
            },
            publisher: {
              '@type': 'Organization',
              name: 'Nobridge',
              url: 'https://www.nobridge.co',
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': postUrl,
            },
            keywords: post.tags.join(', '),
          }),
        }}
      />
    </div>
  )
}
