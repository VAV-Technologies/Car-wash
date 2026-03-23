'use client';

import Link from "next/link";
import Image from "next/image";
import { FadeIn } from "@/components/ui/fade-in";
import { cn } from "@/lib/utils";
import { Check, Sparkles, Droplets, ShieldCheck, MapPin, ArrowRight, Waves, Wind, CircleDot, Eraser, Wrench, GlassWater, Flame, Gem } from "lucide-react";
import { useTranslation } from '@/i18n';

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const WA_BASE = "https://wa.me/62816104334";

export default function OneTimeWashPage() {
  const { t } = useTranslation();

  const comparisonFeatures = [
    { label: t('oneTime.pricing.foamPreWash'), icon: Waves, standard: true, professional: true, elite: true },
    { label: t('oneTime.pricing.twoBucketHandWash'), icon: Droplets, standard: true, professional: true, elite: true },
    { label: t('oneTime.pricing.interiorCleanVacuum'), icon: Wind, standard: true, professional: true, elite: true },
    { label: t('oneTime.pricing.tirePolishRimClean'), icon: CircleDot, standard: true, professional: true, elite: true },
    { label: t('oneTime.pricing.bodySpotRemover'), icon: Eraser, standard: true, professional: true, elite: true },
    { label: t('oneTime.pricing.glassSpotRemover'), icon: GlassWater, standard: false, professional: true, elite: true },
    { label: t('oneTime.pricing.tarRemover'), icon: Flame, standard: false, professional: true, elite: true },
    { label: t('oneTime.pricing.clayBarDecontamination'), icon: Gem, standard: false, professional: false, elite: true },
    { label: t('oneTime.pricing.sealantCoating'), icon: ShieldCheck, standard: false, professional: false, elite: true },
  ];

  const processSteps = [
    {
      num: "01",
      title: t('oneTime.process.step1.title'),
      body: t('oneTime.process.step1.body'),
      image: '/images/process/foam-pre-wash.jpg',
    },
    {
      num: "02",
      title: t('oneTime.process.step2.title'),
      body: t('oneTime.process.step2.body'),
      image: '/images/process/hand-wash.jpg',
    },
    {
      num: "03",
      title: t('oneTime.process.step3.title'),
      body: t('oneTime.process.step3.body'),
      image: '/images/process/interior-clean.jpg',
    },
    {
      num: "04",
      title: t('oneTime.process.step4.title'),
      body: t('oneTime.process.step4.body'),
      image: '/images/process/tire-polish.jpg',
    },
  ];

  const differentiators = [
    {
      icon: Sparkles,
      title: t('oneTime.differentiators.1.title'),
      body: t('oneTime.differentiators.1.body'),
    },
    {
      icon: Droplets,
      title: t('oneTime.differentiators.2.title'),
      body: t('oneTime.differentiators.2.body'),
    },
    {
      icon: ShieldCheck,
      title: t('oneTime.differentiators.3.title'),
      body: t('oneTime.differentiators.3.body'),
    },
    {
      icon: MapPin,
      title: t('oneTime.differentiators.4.title'),
      body: t('oneTime.differentiators.4.body'),
    },
  ];

  return (
    <div className="bg-brand-black">
      {/* ── 1. Hero ──────────────────────────────────────────────── */}
      <section className="w-full min-h-[75vh] bg-brand-black flex items-center py-24 text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn
            direction="up"
            delay={200}
            className="text-center space-y-6 px-4 max-w-4xl mx-auto"
          >
            <p className="text-sm uppercase tracking-wider text-brand-orange font-heading">
              {t('oneTime.hero.eyebrow')}
            </p>
            <h1 className="text-4xl md:text-6xl font-normal font-heading tracking-tight">
              {t('oneTime.hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-white/70 font-light max-w-3xl mx-auto leading-relaxed">
              {t('oneTime.hero.subtitle')}
            </p>
            <p className="text-sm text-white/50">
              {t('oneTime.hero.saveMore')}{" "}
              <Link href="/car-wash/subscriptions" className="text-brand-orange underline underline-offset-4 hover:text-brand-orange/80 transition-colors">
                {t('oneTime.hero.subscribeAndSave')} &rarr;
              </Link>
            </p>
          </FadeIn>
        </div>
      </section>

      {/* -- Separator -- */}
      <div className="border-t border-white/10" />

      {/* ── 2. How We Clean — Step-by-step process ──────────────── */}
      <section className="w-full py-20 md:py-24 bg-brand-dark-gray text-white section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="px-4 mb-12">
              <p className="text-sm uppercase tracking-wider text-brand-orange mb-3 font-heading">
                {t('oneTime.process.eyebrow')}
              </p>
              <h2 className="text-3xl md:text-4xl font-normal font-heading tracking-tight">
                {t('oneTime.process.title')}
              </h2>
            </div>
          </FadeIn>

          <div className="flex flex-col">
            {processSteps.map((step, index) => (
              <FadeIn key={step.num} delay={index * 100}>
                <div className={cn(
                  "border border-white/10 flex flex-col md:flex-row",
                  index > 0 && "border-t-0"
                )}>
                  <div className="hidden md:flex md:w-[15%] shrink-0 p-8 items-center justify-center">
                    <span className="text-5xl font-heading font-medium text-white/10 leading-none">
                      {step.num}
                    </span>
                  </div>
                  <div className="flex-1 p-6 sm:p-8 md:border-l border-white/10 flex items-center">
                    <div>
                      <span className="md:hidden text-2xl font-heading font-medium text-white/10 leading-none mb-2 block">
                        {step.num}
                      </span>
                      <h3 className="text-lg font-normal text-white font-heading mb-2">{step.title}</h3>
                      <p className="text-white/60 leading-relaxed">{step.body}</p>
                    </div>
                  </div>
                  <div className="md:w-[25%] h-40 md:h-auto border-t md:border-t-0 md:border-l border-white/10 relative overflow-hidden shrink-0 bg-brand-black">
                    <Image src={step.image} alt={step.title} fill className="object-cover" />
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* -- Separator -- */}
      <div className="border-t border-white/10" />

      {/* ── 3. Why We're Different ───────────────────────────────── */}
      <section className="w-full py-20 md:py-24 bg-brand-black text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-16 md:mb-20 px-4">
              <p className="text-sm uppercase tracking-wider text-brand-orange mb-3 font-heading">
                {t('oneTime.differentiators.eyebrow')}
              </p>
              <h2 className="text-3xl md:text-4xl font-normal font-heading tracking-tight">
                {t('oneTime.differentiators.title')}
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 border border-white/10">
            {differentiators.map((card, index) => (
              <FadeIn key={index} delay={(index + 1) * 100}>
                <div
                  className={cn(
                    "p-8 md:p-10 h-full flex flex-col",
                    index === 1 && "md:border-l border-white/10",
                    index === 2 && "border-t border-white/10",
                    index === 3 && "border-t md:border-l border-white/10"
                  )}
                >
                  <card.icon
                    className="h-5 w-5 text-brand-orange mb-4"
                    strokeWidth={1.5}
                  />
                  <h4 className="text-lg font-normal font-heading mb-3">
                    {card.title}
                  </h4>
                  <p className="text-white/60 text-sm leading-relaxed">
                    {card.body}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* -- Separator -- */}
      <div className="border-t border-white/10" />

      {/* ── 4. Unified Comparison Table ────────────────────────────── */}
      <section className="w-full py-20 md:py-24 bg-brand-dark-gray text-white section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-12 px-4">
              <p className="text-sm uppercase tracking-wider text-brand-orange mb-3 font-heading">
                {t('oneTime.pricing.eyebrow')}
              </p>
              <h2 className="text-3xl md:text-4xl font-normal font-heading tracking-tight">
                {t('oneTime.pricing.title')}
              </h2>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={100}>
            {/* Image placeholders — above table, no borders on left cell */}
            <div className="flex">
              <div className="w-[28%] sm:w-[24%] shrink-0" />
              {[
                { name: t('oneTime.pricing.standard'), image: '/images/wash/standard-wash.jpg' },
                { name: t('oneTime.pricing.professional'), image: '/images/wash/professional-wash.jpg' },
                { name: t('oneTime.pricing.elite'), image: '/images/wash/elite-wash.jpg' },
              ].map((tier, i) => (
                <div key={tier.name} className={cn(
                  "flex-1 h-40 sm:h-48 bg-brand-black relative overflow-hidden",
                  i > 0 && "border-l border-white/10"
                )}>
                  <Image src={tier.image} alt={tier.name} fill className="object-cover" />
                </div>
              ))}
            </div>

            {/* Bordered table: header + feature rows */}
            <div className="border border-white/10">
              {/* Table header — tier names + prices */}
              <div className="flex">
                <div className="w-[28%] sm:w-[24%] shrink-0 p-4 sm:p-6 flex items-end">
                  <span className="text-xs uppercase tracking-wider text-white/40 font-heading">{t('oneTime.pricing.feature')}</span>
                </div>
                {[t('oneTime.pricing.standard'), t('oneTime.pricing.professional'), t('oneTime.pricing.elite')].map((name) => (
                  <div key={name} className="flex-1 p-4 sm:p-6 text-center border-l border-white/10">
                    <p className="text-base sm:text-lg font-heading text-white">{name}</p>
                  </div>
                ))}
              </div>

              {/* Table rows — features with icons */}
              {comparisonFeatures.map((feature, index) => {
                const FeatureIcon = feature.icon;
                return (
                  <div key={feature.label} className={cn(
                    "flex border-t border-white/10",
                    index % 2 === 0 ? "bg-white/[0.02]" : ""
                  )}>
                    <div className="w-[28%] sm:w-[24%] shrink-0 p-4 sm:p-5 flex items-center gap-3">
                      <FeatureIcon className="h-4 w-4 text-white/40 shrink-0 hidden sm:block" strokeWidth={1.5} />
                      <span className="text-sm text-white/70">{feature.label}</span>
                    </div>
                    {[feature.standard, feature.professional, feature.elite].map((val, i) => (
                      <div key={i} className="flex-1 p-4 sm:p-5 flex items-center justify-center border-l border-white/10">
                        {val ? (
                          <Check className="h-4 w-4 text-brand-orange" strokeWidth={2.5} />
                        ) : (
                          <span className="text-white/20">&#x2715;</span>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Book buttons — aligned under the 3 plan columns only */}
            <div className="flex">
              <div className="w-[28%] sm:w-[24%] shrink-0" />
              <div className="flex flex-1 border-x border-b border-white/10">
                {[
                  { label: t('oneTime.pricing.bookStandard'), tagline: t('oneTime.pricing.thoroughClean'), price: t('oneTime.pricing.standardPrice'), duration: t('oneTime.pricing.standardDuration'), href: `${WA_BASE}?text=Halo%2C%20saya%20ingin%20booking%20Standard%20Wash%20(Rp%20349.000).` },
                  { label: t('oneTime.pricing.bookProfessional'), tagline: t('oneTime.pricing.deepRestoration'), price: t('oneTime.pricing.professionalPrice'), duration: t('oneTime.pricing.professionalDuration'), href: `${WA_BASE}?text=Halo%2C%20saya%20ingin%20booking%20Professional%20Wash%20(Rp%20649.000).` },
                  { label: t('oneTime.pricing.bookElite'), tagline: t('oneTime.pricing.fullTransformation'), price: t('oneTime.pricing.elitePrice'), duration: t('oneTime.pricing.eliteDuration'), href: `${WA_BASE}?text=Halo%2C%20saya%20ingin%20booking%20Elite%20Wash%20(Rp%20949.000).` },
                ].map((cta, i) => (
                  <div key={cta.label} className={cn(
                    "flex-1 p-4 sm:p-6 flex flex-col items-center justify-center text-center gap-2",
                    i > 0 && "border-l border-white/10"
                  )}>
                    <p className="text-xs text-brand-orange hidden sm:block">{cta.tagline}</p>
                    <p className="text-lg font-heading text-brand-orange">{cta.price}</p>
                    <p className="text-xs text-white/40">{cta.duration}</p>
                    <Link
                      href={cta.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-xs sm:text-sm font-medium bg-brand-orange text-black hover:bg-brand-orange/90 h-9 sm:h-10 w-full max-w-[180px] transition-colors mt-2"
                    >
                      {cta.label}
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Subscription upsell — separate row below book buttons */}
            <div className="flex">
              <div className="w-[28%] sm:w-[24%] shrink-0" />
              <div className="flex-1 border-x border-b border-white/10 bg-brand-orange/5 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left">
                <p className="text-sm text-white/70">
                  <span className="text-brand-orange font-medium">{t('oneTime.pricing.save15')}</span> {t('oneTime.pricing.save15Desc')} <span className="text-brand-orange font-medium">{t('oneTime.pricing.freeFullDetail')}</span> {t('oneTime.pricing.everyYear')}
                </p>
                <Link
                  href="/car-wash/subscriptions"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-xs sm:text-sm font-medium border border-brand-orange text-brand-orange hover:bg-brand-orange/10 h-9 sm:h-10 px-5 transition-colors shrink-0"
                >
                  {t('common.cta.seePlans')} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </FadeIn>


        </div>
      </section>

      {/* -- Separator -- */}
      <div className="border-t border-white/10" />

      {/* ── 5. CTA ───────────────────────────────────────────────── */}
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
