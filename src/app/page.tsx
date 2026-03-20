'use client';

import * as React from "react";
import Link from 'next/link';
import { Droplets, Sparkles, ArrowRight, Clock, ShieldCheck, MapPin, CheckCircle2, CalendarDays, MessageCircle, Paintbrush, Car, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FadeIn } from '@/components/ui/fade-in';
import { useTranslation } from '@/i18n';

const WA_LINK = "https://wa.me/62816104334?text=Halo%2C%20saya%20ingin%20booking%20cuci%20mobil.";

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <>
      {/* Hero Section */}
      <section className="w-full relative text-brand-white section-lines-light">
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/assets/hero-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/30" />
        </div>
        <div className="container mx-auto flex flex-col items-center justify-center text-center min-h-screen px-4 py-24 md:py-32 lg:py-40 relative z-10">
          <h1 style={{ letterSpacing: '-2.5px' }} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal !leading-tight mb-6 font-heading animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-100">
            {t('home.hero.title.line1')}<br />{t('home.hero.title.line2')}
          </h1>
          <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-white/80 max-w-[85%] sm:max-w-3xl mx-auto mb-8 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-200 text-balance sm:text-pretty">
            {t('home.hero.subtitle')}
          </p>
          <div className="mb-10 text-sm md:text-base text-white/80 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-300">
            <div className="flex items-center justify-center gap-6 sm:gap-8">
              <div className="flex items-center">
                <Sparkles className="mr-2 h-4 w-4 opacity-90" /> {t('home.hero.badge.premiumProducts')}
              </div>
              <span className="text-white/30">|</span>
              <div className="flex items-center">
                <ShieldCheck className="mr-2 h-4 w-4 opacity-90" /> {t('home.hero.badge.trainedTechnicians')}
              </div>
              <span className="text-white/30">|</span>
              <div className="flex items-center">
                <CheckCircle2 className="mr-2 h-4 w-4 opacity-90" /> {t('home.hero.badge.properBestPractices')}
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-500">
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-brand-orange text-black hover:bg-brand-orange/90 h-11 py-3 px-8 text-base min-w-[220px] sm:min-w-[260px]">
              {t('home.hero.cta.bookFirstWash')} <ArrowRight className="ml-2 h-5 w-5" />
            </a>
            <Link href="/car-wash/subscriptions" className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-brand-white text-brand-white hover:bg-brand-white/10 h-11 py-3 px-8 text-base min-w-[220px] sm:min-w-[260px]">
              {t('home.hero.cta.seeOurPlans')}
            </Link>
          </div>
        </div>
      </section>


      {/* Separator */}
      <div className="border-t border-white/10" />

      {/* What Happens When You Choose the Wrong Wash */}
      <section className="py-20 md:py-24 bg-brand-dark-gray section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-16 md:mb-20 px-4">
              <p className="text-sm font-normal uppercase text-white/60 tracking-wider mb-3 font-heading">{t('home.problems.eyebrow')}</p>
              <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-white font-heading mb-6">
                {t('home.problems.title')}
              </h2>
              <p className="text-white/70 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                {t('home.problems.subtitle')}
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border border-white/10">
            {[
              {
                title: t('home.problems.swirlMarks.title'),
                body: t('home.problems.swirlMarks.body'),
              },
              {
                title: t('home.problems.fadedPaint.title'),
                body: t('home.problems.fadedPaint.body'),
              },
              {
                title: t('home.problems.waterSpots.title'),
                body: t('home.problems.waterSpots.body'),
              },
              {
                title: t('home.problems.crackedInterior.title'),
                body: t('home.problems.crackedInterior.body'),
              },
              {
                title: t('home.problems.brakeDust.title'),
                body: t('home.problems.brakeDust.body'),
              },
              {
                title: t('home.problems.resaleValue.title'),
                body: t('home.problems.resaleValue.body'),
              },
            ].map((problem, index) => (
              <FadeIn key={index} delay={(index % 3) * 100}>
                <div className={cn(
                  "flex flex-col h-full",
                  index > 0 && "border-t sm:border-t-0 sm:border-l border-white/10",
                  index >= 3 && "sm:border-t lg:border-t border-white/10",
                  index === 3 && "sm:border-l-0",
                  index >= 3 && index % 3 !== 0 && "sm:border-l"
                )}>
                  {/* Image */}
                  <div className="h-44 bg-brand-black flex items-center justify-center border-b border-white/10">
                    <span className="text-white/20 text-sm">[IMAGE: {problem.title}]</span>
                  </div>
                  {/* Content */}
                  <div className="p-5 sm:p-6 flex flex-col flex-grow">
                    <h3 className="text-base font-heading text-white mb-2">{problem.title}</h3>
                    <p className="text-white/60 text-sm leading-relaxed">{problem.body}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Why Castudio */}
      <div className="border-t border-white/10" />
      <section className="py-20 md:py-24 bg-brand-black section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-16 md:mb-20 px-4">
              <p className="text-sm font-normal uppercase text-white/50 tracking-wider mb-3 font-heading">{t('home.whyCastudio.eyebrow')}</p>
              <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-white font-heading">
                {t('home.whyCastudio.title')}
              </h2>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={100}>
            <div className="border border-white/15 flex flex-col md:flex-row">
              {/* Left - Image */}
              <div className="md:w-1/2 bg-brand-dark-gray border-b md:border-b-0 md:border-r border-white/10 flex items-center justify-center aspect-[4/3] md:aspect-square relative overflow-hidden">
                <span className="text-white/30 text-sm">[IMAGE: Castudio technician at work]</span>
              </div>
              {/* Right - Quote, body, 4 pillars */}
              <div className="md:w-1/2 bg-brand-dark-gray p-6 sm:p-8 md:p-10 flex flex-col justify-center">
                <p className="text-xl sm:text-2xl md:text-3xl font-heading font-normal text-white leading-snug pb-6 sm:pb-8">
                  &ldquo;{t('home.whyCastudio.quote')}&rdquo;
                </p>
                <div className="border-t border-white/10" />
                <p className="text-sm sm:text-base text-white/60 leading-relaxed text-justify py-6 sm:py-8">
                  {t('home.whyCastudio.body')}
                </p>
                <div className="grid grid-cols-2 border border-white/10 mt-6 sm:mt-8">
                  {[
                    { label: t('home.whyCastudio.premiumProducts'), desc: t('home.whyCastudio.premiumProductsDesc'), icon: Sparkles },
                    { label: t('home.whyCastudio.correctEquipment'), desc: t('home.whyCastudio.correctEquipmentDesc'), icon: Droplets },
                    { label: t('home.whyCastudio.trainedTechnicians'), desc: t('home.whyCastudio.trainedTechniciansDesc'), icon: Paintbrush },
                    { label: t('home.whyCastudio.totalConvenience'), desc: t('home.whyCastudio.totalConvenienceDesc'), icon: Car },
                  ].map((item, index) => (
                    <div key={index} className={cn(
                      "p-4 sm:p-5 flex flex-col gap-2",
                      index >= 2 && "border-t border-white/10",
                      index % 2 !== 0 && "border-l border-white/10"
                    )}>
                      <div className="flex items-center gap-2">
                        <item.icon className="h-4 w-4 text-brand-orange shrink-0" strokeWidth={1.5} />
                        <span className="text-sm font-medium text-white">{item.label}</span>
                      </div>
                      <p className="text-xs text-white/50 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Services Preview */}
      <div className="border-t border-white/10" />
      <section className="py-20 md:py-24 bg-brand-black text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-16 md:mb-20 px-4">
              <p className="text-sm font-normal uppercase text-white/50 tracking-wider mb-3 font-heading">{t('home.services.eyebrow')}</p>
              <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-white font-heading mb-6">
                {t('home.services.title')}
              </h2>
              <p className="text-white/70 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                {t('home.services.subtitle')}
              </p>
            </div>
          </FadeIn>

          {(() => {
            const services = [
              {
                num: "01",
                title: t('home.services.standard.title'),
                subtitle: t('home.services.standard.subtitle'),
                price: t('home.services.standard.price'),
                duration: t('home.services.standard.duration'),
                body: t('home.services.standard.body'),
                tags: [t('home.services.standard.tag1'), t('home.services.standard.tag2'), t('home.services.standard.tag3'), t('home.services.standard.tag4'), t('home.services.standard.tag5')],
              },
              {
                num: "02",
                title: t('home.services.professional.title'),
                subtitle: t('home.services.professional.subtitle'),
                price: t('home.services.professional.price'),
                duration: t('home.services.professional.duration'),
                body: t('home.services.professional.body'),
                tags: [t('home.services.professional.tag1'), t('home.services.professional.tag2'), t('home.services.professional.tag3'), t('home.services.professional.tag4')],
              },
              {
                num: "03",
                title: t('home.services.elite.title'),
                subtitle: t('home.services.elite.subtitle'),
                price: t('home.services.elite.price'),
                duration: t('home.services.elite.duration'),
                body: t('home.services.elite.body'),
                tags: [t('home.services.elite.tag1'), t('home.services.elite.tag2'), t('home.services.elite.tag3'), t('home.services.elite.tag4')],
              },
            ];
            return (
              <>
                {/* Desktop: image row + content row */}
                <div className="hidden md:block">
                  <div className="flex flex-row">
                    {services.map((card, index) => (
                      <FadeIn key={card.num} delay={index * 100} className="flex-1">
                        <div className={cn(
                          "border border-white/10 h-56 bg-brand-dark-gray relative overflow-hidden flex items-center justify-center",
                          index > 0 && "border-l-0"
                        )}>
                          <span className="text-white/30 text-sm">[IMAGE: {card.title}]</span>
                        </div>
                      </FadeIn>
                    ))}
                  </div>
                  <div className="flex flex-row">
                    {services.map((card, index) => (
                      <FadeIn key={card.num} delay={index * 100} className="flex-1">
                        <div className={cn(
                          "group relative border border-white/10 border-t-0 bg-brand-dark-gray p-10 h-full flex flex-col overflow-hidden",
                          index > 0 && "border-l-0"
                        )}>
                          <div className="absolute top-0 left-0 right-0 h-[3px] bg-brand-orange scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-heading font-semibold text-white/30">{card.num}</span>
                            <span className="text-xs text-white/40">{card.duration}</span>
                          </div>
                          <h3 className="text-xl font-normal text-white font-heading mb-1 text-left">{card.title}</h3>
                          <p className="text-sm text-brand-orange font-medium mb-2">{card.subtitle}</p>
                          <p className="text-white/60 leading-relaxed mb-6 text-justify flex-grow">{card.body}</p>
                          <div className="flex flex-wrap gap-2 mb-6">
                            {card.tags.map((tag, tagIndex) => (
                              <span key={tagIndex} className="text-xs px-3 py-1 border border-white/10 text-white/70">{tag}</span>
                            ))}
                          </div>
                          <Link href="/car-wash/one-time" className="inline-flex items-center text-sm font-medium text-brand-orange hover:text-brand-orange/80 transition-colors">
                            {t('common.cta.learnMore')} <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </div>
                      </FadeIn>
                    ))}
                  </div>
                </div>

                {/* Mobile: image + content paired per card */}
                <div className="md:hidden flex flex-col">
                  {services.map((card, index) => (
                    <FadeIn key={card.num} delay={index * 100}>
                      <div className={cn(
                        "border border-white/10 h-48 bg-brand-dark-gray relative overflow-hidden flex items-center justify-center",
                        index > 0 && "border-t-0"
                      )}>
                        <span className="text-white/30 text-sm">[IMAGE: {card.title}]</span>
                      </div>
                      <div className={cn(
                        "group relative border border-white/10 border-t-0 bg-brand-dark-gray p-6 sm:p-8 flex flex-col overflow-hidden"
                      )}>
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-brand-orange scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-heading font-semibold text-white/30">{card.num}</span>
                          <span className="text-xs text-white/40">{card.duration}</span>
                        </div>
                        <h3 className="text-xl font-normal text-white font-heading mb-1 text-left">{card.title}</h3>
                        <p className="text-sm text-brand-orange font-medium mb-2">{card.subtitle}</p>
                        <p className="text-white/60 leading-relaxed mb-6 text-justify">{card.body}</p>
                        <div className="flex flex-wrap gap-2 mb-6">
                          {card.tags.map((tag, tagIndex) => (
                            <span key={tagIndex} className="text-xs px-3 py-1 border border-white/10 text-white/70">{tag}</span>
                          ))}
                        </div>
                        <Link href="/car-wash/one-time" className="inline-flex items-center text-sm font-medium text-brand-orange hover:text-brand-orange/80 transition-colors">
                          {t('common.cta.learnMore')} <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </div>
                    </FadeIn>
                  ))}
                </div>
              </>
            );
          })()}

          {/* Auto Detailing Services */}
          <div className="mt-12 md:mt-16">
            <FadeIn direction="up">
              <div className="text-center mb-10 md:mb-12 px-4">
                <p className="text-sm font-normal uppercase text-white/50 tracking-wider mb-3 font-heading">{t('home.detailing.eyebrow')}</p>
                <h3 className="text-2xl md:text-3xl font-normal tracking-tight text-white font-heading">
                  {t('home.detailing.title')}
                </h3>
              </div>
            </FadeIn>

            <div className="flex flex-col">
              {[
                { title: t('home.detailing.interior.title'), body: t('home.detailing.interior.body') },
                { title: t('home.detailing.exterior.title'), body: t('home.detailing.exterior.body') },
                { title: t('home.detailing.window.title'), body: t('home.detailing.window.body') },
                { title: t('home.detailing.tireRims.title'), body: t('home.detailing.tireRims.body') },
                { title: t('home.detailing.fullDetail.title'), body: t('home.detailing.fullDetail.body') },
              ].map((item, index) => (
                <FadeIn key={index} delay={index * 80}>
                  <div className={cn(
                    "border border-white/10 flex flex-col md:flex-row",
                    index > 0 && "border-t-0"
                  )}>
                    {/* Title — left column */}
                    <div className="hidden md:flex md:w-[23%] shrink-0 p-8 md:p-10 items-center justify-center">
                      <h4 className="text-lg font-normal text-white font-heading text-center">{item.title}</h4>
                    </div>
                    {/* Content — middle column */}
                    <div className="flex-1 p-6 sm:p-8 md:p-10 md:border-l border-white/10 flex items-center">
                      <div>
                        <h4 className="md:hidden text-lg font-normal text-white font-heading mb-2">{item.title}</h4>
                        <p className="text-white/60 leading-relaxed">{item.body}</p>
                      </div>
                    </div>
                    {/* Image — right column */}
                    <div className="md:w-[23%] h-40 md:h-auto border-t md:border-t-0 md:border-l border-white/10 relative overflow-hidden shrink-0 bg-brand-dark-gray flex items-center justify-center">
                      <span className="text-white/20 text-sm">[IMAGE: {item.title}]</span>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>

            <FadeIn direction="up" delay={400}>
              <div className="border border-white/10 border-t-0 bg-brand-dark-gray p-8 text-center">
                <Link href="/detailing" className="inline-flex items-center text-sm font-medium text-brand-orange hover:text-brand-orange/80 transition-colors">
                  {t('common.cta.seeAllDetailingServices')} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Subscription Teaser */}
      <div className="border-t border-white/10" />
      <section className="py-20 md:py-24 bg-brand-black section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up" delay={100}>
            <div className="flex flex-col md:flex-row border border-white/10">
              <div className="flex-1 bg-brand-dark-gray p-6 sm:p-8 md:p-10 flex flex-col justify-center">
                <p className="text-sm font-normal uppercase text-white/50 tracking-wider mb-3 font-heading">{t('home.subscriptions.eyebrow')}</p>
                <h2 className="text-2xl md:text-3xl font-normal tracking-tight text-white font-heading mb-6">
                  {t('home.subscriptions.title')}
                </h2>
                <p className="text-white/60 text-base leading-relaxed mb-6">
                  {t('home.subscriptions.body')}
                </p>
                <div className="space-y-3 mb-8">
                  {[
                    t('home.subscriptions.bullet1'),
                    t('home.subscriptions.bullet2'),
                    t('home.subscriptions.bullet3'),
                    t('home.subscriptions.bullet4'),
                    t('home.subscriptions.bullet5'),
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 text-brand-orange shrink-0" strokeWidth={1.5} />
                      <p className="text-sm text-white/70 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <Link href="/car-wash/subscriptions" className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium bg-brand-orange text-black hover:bg-brand-orange/90 h-11 py-3 px-8 text-base transition-colors">
                    {t('home.subscriptions.cta')} <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </div>
              </div>
              <div className="md:w-[45%] min-h-[250px] md:min-h-[350px] border-t md:border-t-0 md:border-l border-white/10 relative overflow-hidden shrink-0 bg-brand-dark-gray flex items-center justify-center">
                <span className="text-white/30 text-sm">[IMAGE: Subscription plans]</span>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Reviews */}
      <div className="border-t border-white/10" />
      <section className="py-20 md:py-24 bg-brand-dark-gray section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-16 md:mb-20 px-4">
              <p className="text-sm font-normal uppercase text-white/60 tracking-wider mb-3 font-heading">{t('home.reviews.eyebrow')}</p>
              <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-white font-heading">
                {t('home.reviews.title')}
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3">
            {[
              { name: t('home.reviews.1.name'), stars: 5, quote: t('home.reviews.1.quote') },
              { name: t('home.reviews.2.name'), stars: 5, quote: t('home.reviews.2.quote') },
              { name: t('home.reviews.3.name'), stars: 5, quote: t('home.reviews.3.quote') },
              { name: t('home.reviews.4.name'), stars: 5, quote: t('home.reviews.4.quote') },
              { name: t('home.reviews.5.name'), stars: 5, quote: t('home.reviews.5.quote') },
              { name: t('home.reviews.6.name'), stars: 5, quote: t('home.reviews.6.quote') },
            ].map((review, index) => (
              <FadeIn key={index} delay={index * 100}>
                <div className={cn(
                  "border border-white/10 flex flex-col h-full",
                  index > 0 && "border-t-0 md:border-t",
                  index % 3 !== 0 && "md:border-l-0",
                  index >= 3 && "md:border-t-0"
                )}>
                  <div className="h-44 bg-brand-black flex items-center justify-center border-b border-white/10">
                    <span className="text-white/20 text-sm">[IMAGE: {review.name}]</span>
                  </div>
                  <div className="p-6 sm:p-8 flex flex-col flex-grow">
                    <div className="flex items-center gap-1 mb-4">
                      {Array.from({ length: review.stars }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-brand-orange fill-brand-orange" />
                      ))}
                    </div>
                    <p className="text-white/70 leading-relaxed mb-6 flex-grow">&ldquo;{review.quote}&rdquo;</p>
                    <p className="text-sm font-heading text-white">{review.name}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <div className="border-t border-white/10" />
      <section className="py-12 bg-brand-black section-lines-light">
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
                    <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-brand-orange text-black hover:bg-brand-orange/90 h-11 py-3 px-12 text-base">
                      <MessageCircle className="mr-2 h-5 w-5" /> {t('common.cta.whatsappUs')}
                    </a>
                    <Link href="/car-wash/subscriptions" className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-brand-orange text-brand-orange hover:bg-brand-orange/10 h-11 py-3 px-8 text-base">
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
    </>
  );
}
