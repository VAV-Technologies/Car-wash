'use client';

import Link from "next/link";
import Image from "next/image";
import { FadeIn } from "@/components/ui/fade-in";
import { cn } from "@/lib/utils";
import { Check, ArrowRight, ShieldCheck, Sparkles, Paintbrush, Eye } from "lucide-react";
import { useTranslation } from '@/i18n';

const WA_BASE = "https://wa.me/62816104334";

export default function DetailingPage() {
  const { t } = useTranslation();

  const services = [
    {
      name: t('detailing.interior.name'),
      price: t('detailing.interior.price'),
      duration: t('detailing.interior.duration'),
      image: '/images/detailing/interior.jpg',
      bg: "bg-brand-black",
      description: t('detailing.interior.desc'),
      includes: [
        t('detailing.interior.include1'),
        t('detailing.interior.include2'),
        t('detailing.interior.include3'),
        t('detailing.interior.include4'),
        t('detailing.interior.include5'),
        t('detailing.interior.include6'),
      ],
      cta: t('detailing.interior.cta'),
      href: `${WA_BASE}?text=Halo%2C%20saya%20ingin%20booking%20Interior%20Detailing%20(Rp%201.039.000).`,
    },
    {
      name: t('detailing.exterior.name'),
      price: t('detailing.exterior.price'),
      duration: t('detailing.exterior.duration'),
      image: '/images/detailing/exterior.jpg',
      bg: "bg-brand-dark-gray",
      description: t('detailing.exterior.desc'),
      includes: [
        t('detailing.exterior.include1'),
        t('detailing.exterior.include2'),
        t('detailing.exterior.include3'),
        t('detailing.exterior.include4'),
        t('detailing.exterior.include5'),
        t('detailing.exterior.include6'),
      ],
      cta: t('detailing.exterior.cta'),
      href: `${WA_BASE}?text=Halo%2C%20saya%20ingin%20booking%20Exterior%20Detailing%20(Rp%201.039.000).`,
    },
    {
      name: t('detailing.window.name'),
      price: t('detailing.window.price'),
      duration: t('detailing.window.duration'),
      image: '/images/detailing/window.jpg',
      bg: "bg-brand-black",
      description: t('detailing.window.desc'),
      includes: [
        t('detailing.window.include1'),
        t('detailing.window.include2'),
        t('detailing.window.include3'),
        t('detailing.window.include4'),
      ],
      cta: t('detailing.window.cta'),
      href: `${WA_BASE}?text=Halo%2C%20saya%20ingin%20booking%20Window%20Detailing%20(Rp%20689.000).`,
    },
    {
      name: t('detailing.tireRims.name'),
      price: t('detailing.tireRims.price'),
      duration: t('detailing.tireRims.duration'),
      image: '/images/detailing/tire-rims.jpg',
      bg: "bg-brand-dark-gray",
      description: t('detailing.tireRims.desc'),
      includes: [
        t('detailing.tireRims.include1'),
        t('detailing.tireRims.include2'),
        t('detailing.tireRims.include3'),
        t('detailing.tireRims.include4'),
      ],
      cta: t('detailing.tireRims.cta'),
      href: `${WA_BASE}?text=Halo%2C%20saya%20ingin%20booking%20Tire%20%26%20Rims%20Detailing%20(Rp%20289.000).`,
    },
  ];

  const fullDetailIncludes = [
    t('detailing.fullDetail.include1'),
    t('detailing.fullDetail.include2'),
    t('detailing.fullDetail.include3'),
    t('detailing.fullDetail.include4'),
  ];

  const whyCards = [
    { title: t('detailing.why.1.title'), body: t('detailing.why.1.body'), icon: ShieldCheck },
    { title: t('detailing.why.2.title'), body: t('detailing.why.2.body'), icon: Sparkles },
    { title: t('detailing.why.3.title'), body: t('detailing.why.3.body'), icon: Paintbrush },
    { title: t('detailing.why.4.title'), body: t('detailing.why.4.body'), icon: Eye },
  ];

  return (
    <div className="bg-brand-black">
      {/* -- 1. Hero -- */}
      <section className="w-full min-h-[75vh] bg-brand-black flex items-center py-24 text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn
            direction="up"
            delay={200}
            className="text-center space-y-6 px-4 max-w-4xl mx-auto"
          >
            <p className="text-sm uppercase tracking-wider text-brand-orange font-heading">
              {t('detailing.hero.eyebrow')}
            </p>
            <h1 className="text-4xl md:text-6xl font-normal font-heading tracking-tight">
              {t('detailing.hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-white/70 font-light max-w-3xl mx-auto leading-relaxed">
              {t('detailing.hero.subtitle')}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* -- Separator -- */}
      <div className="border-t border-white/10" />

      {/* -- 2. Services -- */}
      <section className="w-full py-12 bg-brand-dark-gray text-white section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="px-4 mb-12">
              <p className="text-sm uppercase tracking-wider text-brand-orange mb-3 font-heading">
                {t('detailing.services.eyebrow')}
              </p>
              <h2 className="text-3xl md:text-4xl font-normal font-heading tracking-tight">
                {t('detailing.services.title')}
              </h2>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={100}>
            <div className="border-2 border-brand-orange relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
                <span className="px-6 py-1.5 bg-brand-orange text-black text-xs font-semibold uppercase tracking-wider">
                  {t('detailing.bestValue')}
                </span>
              </div>

              <div className="flex flex-col md:flex-row">
                {/* Left: title + price + description */}
                <div className="md:w-1/3 p-6 md:p-8 flex flex-col justify-center pt-8">
                  <h2 className="text-2xl md:text-3xl font-normal font-heading tracking-tight mb-2">
                    {t('detailing.fullDetail.title')}
                  </h2>
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="text-2xl font-heading text-brand-orange">{t('detailing.fullDetail.price')}</span>
                    <span className="text-xs text-white/50">{t('detailing.fullDetail.duration')}</span>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed">
                    {t('detailing.fullDetail.desc')}
                  </p>
                </div>

                {/* Middle: includes list */}
                <div className="md:w-1/3 p-6 md:p-8 border-t md:border-t-0 md:border-l border-white/10 flex flex-col justify-center">
                  <p className="text-xs uppercase tracking-wider text-white/50 mb-4 font-heading">{t('detailing.fullDetail.everythingIncluded')}</p>
                  <ul className="space-y-2">
                    {fullDetailIncludes.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-white/70 text-sm">
                        <Check className="h-4 w-4 text-brand-orange shrink-0 mt-0.5" strokeWidth={2} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right: image placeholder */}
                <div className="md:w-1/3 min-h-[200px] border-t md:border-t-0 md:border-l border-white/10 bg-brand-black relative overflow-hidden">
                  <Image src="/images/detailing/full-detail.jpg" alt="Full Detail" fill className="object-cover" />
                </div>
              </div>

              {/* Full-width book button */}
              <div className="border-t border-white/10">
                <Link
                  href={`${WA_BASE}?text=Halo%2C%20saya%20ingin%20booking%20Full%20Detail%20Package%20(Rp%202.799.000).`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center whitespace-nowrap text-sm font-medium bg-brand-orange text-black hover:bg-brand-orange/90 h-12 w-full transition-colors"
                >
                  {t('detailing.fullDetail.cta')}
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* -- Or Choose Individual Services -- */}
      <section className="w-full py-3 bg-brand-dark-gray section-lines-dark">
        <div className="container mx-auto">
          <div className="flex items-center gap-6">
            <div className="flex-1 border-t border-white/10" />
            <span className="text-white/40 text-sm font-heading uppercase tracking-widest">{t('detailing.orChoose')}</span>
            <div className="flex-1 border-t border-white/10" />
          </div>
        </div>
      </section>

      {/* -- 3. Individual Services Table -- */}
      <section className="w-full py-12 bg-brand-dark-gray text-white section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up" delay={100}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-white/10">
              {services.map((service, i) => (
                <div
                  key={service.name}
                  className={cn(
                    "flex flex-col",
                    i > 0 && "border-t sm:border-t-0 sm:border-l border-white/10",
                    i === 2 && "sm:border-t lg:border-t-0"
                  )}
                >
                  <div className="h-48 bg-brand-black relative overflow-hidden border-b border-white/10">
                    <Image src={service.image} alt={service.name} fill className="object-cover" />
                  </div>
                  <div className="p-5 sm:p-6 flex flex-col flex-grow">
                    <h3 className="text-lg font-heading text-white mb-1">{service.name}</h3>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-xl font-heading text-brand-orange">{service.price}</span>
                      <span className="text-xs text-white/40">{service.duration}</span>
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed mb-4 flex-grow">{service.description}</p>
                    <ul className="space-y-2 mb-6">
                      {service.includes.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-white/70 text-xs">
                          <Check className="h-3.5 w-3.5 text-brand-orange shrink-0 mt-0.5" strokeWidth={2} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto">
                      <Link
                        href={service.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-xs sm:text-sm font-medium bg-brand-orange text-black hover:bg-brand-orange/90 h-10 w-full transition-colors"
                      >
                        {service.cta}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* -- Separator -- */}
      <div className="border-t border-white/10" />

      {/* -- 4. Why Our Detailing -- */}
      <section className="w-full py-20 md:py-24 bg-brand-black text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-16 md:mb-20 px-4">
              <p className="text-sm uppercase tracking-wider text-brand-orange mb-3 font-heading">
                {t('detailing.why.eyebrow')}
              </p>
              <h2 className="text-3xl md:text-4xl font-normal font-heading tracking-tight">
                {t('detailing.why.title')}
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 border border-white/10">
            {whyCards.map((item, index) => (
              <FadeIn key={item.title} delay={(index + 1) * 100}>
                <div className={cn(
                  "p-8 md:p-10 h-full flex flex-col",
                  index === 1 && "md:border-l border-white/10",
                  index === 2 && "border-t border-white/10",
                  index === 3 && "border-t md:border-l border-white/10"
                )}>
                  <item.icon className="h-5 w-5 text-brand-orange mb-4" strokeWidth={1.5} />
                  <h4 className="text-lg font-normal font-heading text-white mb-3">{item.title}</h4>
                  <p className="text-white/60 text-sm leading-relaxed">{item.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* -- Separator -- */}
      <div className="border-t border-white/10" />

      {/* -- 5. Subscription Cross-Sell -- */}
      <section className="w-full py-12 bg-brand-dark-gray text-white section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="border border-white/10 p-8 md:p-12 text-center">
              <p className="text-sm uppercase tracking-wider text-brand-orange mb-3 font-heading">
                {t('detailing.subscriberBonus.eyebrow')}
              </p>
              <h2 className="text-3xl md:text-4xl font-normal font-heading tracking-tight mb-4">
                {t('detailing.subscriberBonus.title')}
              </h2>
              <p className="text-white/70 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
                {t('detailing.subscriberBonus.body')}
              </p>
              <Link
                href="/car-wash/subscriptions"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium bg-brand-orange text-black hover:bg-brand-orange/90 h-11 py-3 px-10 text-base transition-colors"
              >
                {t('common.cta.seeSubscriptionPlans')} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* -- Separator -- */}
      <div className="border-t border-white/10" />

      {/* -- 5. CTA -- */}
      <section className="w-full py-12 bg-brand-black text-white section-lines-light">
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
                      href={`${WA_BASE}?text=Halo%2C%20saya%20ingin%20booking%20cuci%20mobil.`}
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
