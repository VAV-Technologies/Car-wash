'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FadeIn } from '@/components/ui/fade-in';
import { useSearchParams } from 'next/navigation';
import { getPublishedPosts, type BlogCategory, type BlogPostListItem } from '@/lib/blog';
import { useTranslation } from '@/i18n';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function BlogCard({ post, index, t }: { post: BlogPostListItem; index: number; t: (key: string) => string }) {
  const categoryKey = `tips.categories.${post.category}` as const;

  return (
    <FadeIn delay={index * 80} direction="up">
      <Link
        href={`/tips/${post.slug}`}
        className="group flex flex-col h-full border border-white/10 hover:border-white/25 transition-colors"
      >
        {/* Image */}
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

        {/* Content */}
        <div className="flex flex-col flex-1 p-5">
          <span className="inline-block self-start text-xs font-medium uppercase tracking-wider text-brand-orange border border-brand-orange/30 px-2 py-0.5 mb-3">
            {t(categoryKey)}
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
            {' '}&middot; {post.reading_time_minutes} {t('tips.minRead')}
          </p>
        </div>
      </Link>
    </FadeIn>
  );
}

function TipsPageInner() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') as BlogCategory | null;
  const pageParam = searchParams.get('page');
  const currentPage = parseInt(pageParam || '1', 10);

  const validCategory =
    categoryParam && ['tips', 'guides', 'news', 'promotions'].includes(categoryParam)
      ? (categoryParam as BlogCategory)
      : undefined;

  const [posts, setPosts] = useState<BlogPostListItem[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    getPublishedPosts({
      page: currentPage,
      limit: 12,
      category: validCategory,
    }).then(({ posts, total }) => {
      setPosts(posts);
      setTotal(total);
    });
  }, [currentPage, validCategory]);

  const totalPages = Math.ceil(total / 12);

  const categories: { value: BlogCategory | 'all'; labelKey: string }[] = [
    { value: 'all', labelKey: 'tips.categories.all' },
    { value: 'tips', labelKey: 'tips.categories.tips' },
    { value: 'guides', labelKey: 'tips.categories.guides' },
    { value: 'news', labelKey: 'tips.categories.news' },
    { value: 'promotions', labelKey: 'tips.categories.promotions' },
  ];

  return (
    <div className="bg-brand-dark-gray">
      {/* Hero */}
      <section className="w-full min-h-[75vh] bg-brand-black flex items-center py-24 text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up" delay={200} className="text-center space-y-6 px-4 max-w-4xl mx-auto">
            <p className="text-sm uppercase tracking-wider text-brand-orange font-heading">
              {t('tips.hero.eyebrow')}
            </p>
            <h1 className="text-4xl md:text-6xl font-normal font-heading tracking-tight">
              {t('tips.hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-white/70 font-light max-w-3xl mx-auto leading-relaxed">
              {t('tips.hero.subtitle')}
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
                    cat.value === 'all' ? !validCategory : cat.value === validCategory;
                  const href =
                    cat.value === 'all' ? '/tips' : `/tips?category=${cat.value}`;

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
                      {t(cat.labelKey)}
                    </Link>
                  );
                })}
              </div>

              {/* Right: pagination */}
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  {currentPage > 1 && (
                    <Link
                      href={`/tips?${new URLSearchParams({
                        ...(validCategory ? { category: validCategory } : {}),
                        page: String(currentPage - 1),
                      }).toString()}`}
                      className="px-3 py-2 text-sm font-medium border border-white/10 text-white hover:border-white/20 transition-colors"
                    >
                      {t('tips.previous')}
                    </Link>
                  )}
                  <span className="px-3 py-2 text-sm text-white/50">
                    {currentPage} / {totalPages}
                  </span>
                  {currentPage < totalPages && (
                    <Link
                      href={`/tips?${new URLSearchParams({
                        ...(validCategory ? { category: validCategory } : {}),
                        page: String(currentPage + 1),
                      }).toString()}`}
                      className="px-3 py-2 text-sm font-medium border border-white/10 text-white hover:border-white/20 transition-colors"
                    >
                      {t('tips.next')}
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
                <BlogCard key={post.id} post={post} index={i} t={t} />
              ))}
            </div>
          ) : (
            <FadeIn>
              <div className="border border-white/10 p-12 text-center">
                <p className="text-white/50">
                  {t('tips.noArticles')}{validCategory ? ` ${t('tips.noArticlesIn')} ${t(`tips.categories.${validCategory}`)}` : ''}{t('tips.checkBackSoon')}
                </p>
              </div>
            </FadeIn>
          )}

        </div>
      </section>

      <div className="border-t border-white/10" />
    </div>
  );
}

export default function TipsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-dark-gray" />}>
      <TipsPageInner />
    </Suspense>
  );
}
