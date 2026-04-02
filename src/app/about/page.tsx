'use client';

import Link from "next/link";
import Image from "next/image";
import { FadeIn } from "@/components/ui/fade-in";
import { cn } from "@/lib/utils";
import { useTranslation } from '@/i18n';

export default function AboutPage() {
  const { t } = useTranslation();

  const differentiators = [
    {
      num: "01",
      title: t('about.differentiators.1.title'),
      body: t('about.differentiators.1.body'),
    },
    {
      num: "02",
      title: t('about.differentiators.2.title'),
      body: t('about.differentiators.2.body'),
    },
    {
      num: "03",
      title: t('about.differentiators.3.title'),
      body: t('about.differentiators.3.body'),
    },
    {
      num: "04",
      title: t('about.differentiators.4.title'),
      body: t('about.differentiators.4.body'),
    },
  ];

  const steps = [
    {
      num: "01",
      title: t('about.approach.step1.title'),
      body: t('about.approach.step1.body'),
    },
    {
      num: "02",
      title: t('about.approach.step2.title'),
      body: t('about.approach.step2.body'),
    },
    {
      num: "03",
      title: t('about.approach.step3.title'),
      body: t('about.approach.step3.body'),
    },
    {
      num: "04",
      title: t('about.approach.step4.title'),
      body: t('about.approach.step4.body'),
    },
  ];

  const qualityBullets = [
    t('about.promise.bullet1'),
    t('about.promise.bullet2'),
    t('about.promise.bullet3'),
    t('about.promise.bullet4'),
    t('about.promise.bullet5'),
    t('about.promise.bullet6'),
  ];

  return (
    <div className="bg-brand-black">
      {/* -- 1. Hero -- */}
      <section className="w-full min-h-[75vh] bg-brand-black flex items-center py-24 text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up" delay={200} className="text-center space-y-6 px-4 max-w-4xl mx-auto">
            <p className="text-sm uppercase tracking-wider text-brand-orange font-heading">
              {t('about.hero.eyebrow')}
            </p>
            <h1 className="text-4xl md:text-6xl font-normal font-heading tracking-tight text-white">
              {t('about.hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-white/70 font-light max-w-3xl mx-auto leading-relaxed">
              {t('about.hero.subtitle')}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* -- Separator -- */}
      <div className="border-t border-white/10" />

      {/* -- 2. About Us (replaces Team section) -- */}
      <section className="w-full py-20 md:py-24 bg-brand-dark-gray text-white section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="text-center space-y-4 mb-16 px-4">
              <p className="text-sm uppercase tracking-wider text-brand-orange font-heading">
                {t('about.aboutUs.eyebrow')}
              </p>
              <h2 className="text-3xl md:text-4xl font-normal font-heading tracking-tight text-white">
                {t('about.aboutUs.title')}
              </h2>
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <div className="border border-white/15 flex flex-col md:flex-row">
              {/* Left - Image placeholder */}
              <div className="md:w-1/2 bg-brand-dark-gray border-b md:border-b-0 md:border-r border-white/10 aspect-[4/3] md:aspect-auto relative overflow-hidden">
                <Image src="/images/wash/technician-at-work.jpg" alt="The Castudio Team" fill className="object-cover" />
              </div>
              {/* Right - Content */}
              <div className="md:w-1/2 bg-brand-dark-gray p-6 sm:p-8 md:p-10 flex flex-col justify-center">
                <p className="text-xl sm:text-2xl md:text-3xl font-heading font-normal text-white leading-snug pb-6 sm:pb-8">
                  {t('about.aboutUs.quote')}
                </p>
                <div className="border-t border-white/10" />
                <p className="text-sm sm:text-base text-white/60 leading-relaxed text-justify py-6 sm:py-8">
                  {t('about.aboutUs.body1')}
                </p>
                <p className="text-sm sm:text-base text-white/60 leading-relaxed text-justify pb-6 sm:pb-8">
                  {t('about.aboutUs.body2')}
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* -- Separator -- */}
      <div className="border-t border-white/10" />

      {/* -- 3. Our Story -- */}
      <section className="w-full py-20 md:py-24 bg-brand-black section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="mb-12 px-4">
              <p className="text-sm uppercase tracking-wider text-brand-orange mb-3 font-heading">
                {t('about.story.eyebrow')}
              </p>
              <h2 className="text-3xl md:text-4xl font-normal text-white font-heading tracking-tight">
                {t('about.story.title')}
              </h2>
            </div>
          </FadeIn>

          <div className="flex flex-col lg:flex-row">
            <FadeIn delay={100} className="flex-1">
              <div className="border border-white/10 p-8 md:p-10 h-full space-y-6">
                <p className="text-white/60 leading-relaxed">
                  {t('about.story.body1')}
                </p>
                <p className="text-white/60 leading-relaxed">
                  {t('about.story.body2')}
                </p>
                <p className="text-white/60 leading-relaxed">
                  {t('about.story.body3')}
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={200} className="flex-1">
              <div className="border border-white/10 border-t-0 lg:border-t lg:border-l-0 p-8 md:p-10 h-full flex flex-col justify-between">
                <div className="border-l-2 border-brand-orange pl-6 mb-8">
                  <p className="text-xl md:text-2xl font-heading text-white leading-snug mb-3">
                    {t('about.story.quote')}
                  </p>
                </div>

                <div className="grid grid-cols-2">
                  {[
                    { value: t('about.story.metric1.value'), label: t('about.story.metric1.label') },
                    { value: t('about.story.metric2.value'), label: t('about.story.metric2.label') },
                    { value: t('about.story.metric3.value'), label: t('about.story.metric3.label') },
                    { value: t('about.story.metric4.value'), label: t('about.story.metric4.label') },
                  ].map((metric, index) => (
                    <div
                      key={metric.value}
                      className={cn(
                        "border border-white/10 p-5 text-center",
                        index === 1 && "border-l-0",
                        index === 2 && "border-t-0",
                        index === 3 && "border-t-0 border-l-0"
                      )}
                    >
                      <p className="text-2xl md:text-3xl font-heading text-white mb-1">{metric.value}</p>
                      <p className="text-xs text-white/60">{metric.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* -- Separator -- */}
      <div className="border-t border-white/10" />

      {/* -- 4. Why We're Different -- */}
      <section className="w-full py-20 md:py-24 bg-brand-dark-gray section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="mb-12 px-4">
              <p className="text-sm uppercase tracking-wider text-brand-orange mb-3 font-heading">
                {t('about.differentiators.eyebrow')}
              </p>
              <h2 className="text-3xl md:text-4xl font-normal text-white font-heading tracking-tight mb-4">
                {t('about.differentiators.title')}
              </h2>
            </div>
          </FadeIn>

          <div className="flex flex-col md:flex-row">
            {differentiators.slice(0, 2).map((card, index) => (
              <FadeIn key={card.num} delay={index * 100} className="flex-1">
                <div className={cn(
                  "border border-white/10 bg-brand-dark-gray p-8 h-full flex flex-col",
                  index > 0 && "border-t-0 md:border-t md:border-l-0"
                )}>
                  <span className="text-sm font-heading text-brand-orange mb-4">{card.num}</span>
                  <h4 className="text-lg font-medium text-white mb-2">{card.title}</h4>
                  <p className="text-white/60 leading-relaxed">{card.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <div className="flex flex-col md:flex-row">
            {differentiators.slice(2, 4).map((card, index) => (
              <FadeIn key={card.num} delay={(index + 2) * 100} className="flex-1">
                <div className={cn(
                  "border border-white/10 bg-brand-dark-gray border-t-0 p-8 h-full flex flex-col",
                  index > 0 && "md:border-l-0"
                )}>
                  <span className="text-sm font-heading text-brand-orange mb-4">{card.num}</span>
                  <h4 className="text-lg font-medium text-white mb-2">{card.title}</h4>
                  <p className="text-white/60 leading-relaxed">{card.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* -- Separator -- */}
      <div className="border-t border-white/10" />

      {/* -- 5. Our Approach -- */}
      <section className="w-full py-20 md:py-24 bg-brand-black section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="mb-12 px-4">
              <p className="text-sm uppercase tracking-wider text-brand-orange mb-3 font-heading">
                {t('about.approach.eyebrow')}
              </p>
              <h2 className="text-3xl md:text-4xl font-normal text-white font-heading tracking-tight">
                {t('about.approach.title')}
              </h2>
            </div>
          </FadeIn>

          <div className="flex flex-col lg:flex-row gap-0">
            {/* Left: Steps */}
            <div className="flex-1">
              {steps.map((step, index) => (
                <FadeIn key={step.num} delay={index * 100}>
                  <div className={cn(
                    "border border-white/10 p-8 md:p-10 flex items-start gap-8",
                    index > 0 && "border-t-0"
                  )}>
                    <span className="text-5xl md:text-6xl font-heading font-medium text-white/10 leading-none shrink-0">
                      {step.num}
                    </span>
                    <div>
                      <h3 className="text-lg font-normal text-white font-heading mb-2">{step.title}</h3>
                      <p className="text-white/60 leading-relaxed">{step.body}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>

            {/* Right: Our Quality Promise */}
            <FadeIn delay={200} className="lg:w-[400px] xl:w-[440px]">
              <div className="border border-white/10 border-t-0 lg:border-t lg:border-l-0 bg-brand-dark-gray text-white p-8 md:p-10 sticky top-24 h-fit">
                <p className="text-sm uppercase tracking-wider text-brand-orange mb-3 font-heading">
                  {t('about.promise.eyebrow')}
                </p>
                <h3 className="text-xl font-heading mb-4 text-white">
                  {t('about.promise.title')}
                </h3>
                <ul className="space-y-3">
                  {qualityBullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3 text-sm text-white/70">
                      <span className="text-brand-orange mt-1 text-xs">&#x25C6;</span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* -- Separator -- */}
      <div className="border-t border-white/10" />

      {/* -- 6. CTA -- */}
      <section className="w-full py-12 bg-brand-black section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="border border-white/10">
              <div className="relative px-4 sm:px-8 md:px-16 py-16 md:py-20 text-center overflow-hidden bg-brand-dark-gray">
                <div className="relative z-10 flex flex-col items-center justify-center h-full">
                  <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-white mb-4 font-heading">{t('common.cta.bookYourFirstWash')}</h2>
                  <p className="text-white/60 text-lg md:text-xl max-w-xl mx-auto mb-6 sm:mb-8 md:mb-10">
                    {t('common.cta.bookYourFirstWashDesc')}
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    <Link
                      href="https://wa.me/6285591222000?text=Halo%2C%20saya%20ingin%20booking%20cuci%20mobil."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium bg-brand-orange text-black hover:bg-brand-orange/90 h-11 py-3 px-12 text-base transition-colors"
                    >
                      {t('common.cta.whatsappUs')}
                    </Link>
                    <Link
                      href="/car-wash/subscriptions"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium border border-brand-orange text-brand-orange hover:bg-brand-orange/10 h-11 py-3 px-8 text-base transition-colors"
                    >
                      {t('common.cta.seeOurPlans')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <div className="border-t border-white/10" />
    </div>
  );
}
