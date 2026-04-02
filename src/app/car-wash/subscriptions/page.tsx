'use client';

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, X, ArrowRight, Droplets, Sparkles, Star, CalendarCheck, CreditCard, MessageCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTranslation } from '@/i18n';

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

const WA_BASE = "https://wa.me/6285591222000";

export default function SubscriptionsPage() {
  const { t } = useTranslation();

  /* ---------------------------------------------------------------- */
  /*  DATA (inside component so t() is accessible)                     */
  /* ---------------------------------------------------------------- */

  const plans = [
    {
      name: t('subscriptions.plans.essentials.name'),
      monthlyPrice: t('subscriptions.plans.essentials.monthlyPrice'),
      termNote: t('subscriptions.plans.essentials.termNote'),
      savings: t('subscriptions.plans.essentials.savings'),
      features: [
        t('subscriptions.plans.essentials.feature1'),
        t('subscriptions.plans.essentials.feature2'),
        t('subscriptions.plans.essentials.feature3'),
      ],
      detailingBonus: null as string | null,
      detailingBonusValue: null as string | null,
      bestFor: t('subscriptions.plans.essentials.bestFor'),
      cta: t('subscriptions.plans.essentials.cta'),
      ctaLink: `${WA_BASE}?text=Halo%2C%20saya%20ingin%20berlangganan%20paket%20Essentials%20(Rp%201.356.000%2F4%20bulan).`,
      icon: Droplets,
      popular: false,
    },
    {
      name: t('subscriptions.plans.plus.name'),
      monthlyPrice: t('subscriptions.plans.plus.monthlyPrice'),
      termNote: t('subscriptions.plans.plus.termNote'),
      savings: t('subscriptions.plans.plus.savings'),
      features: [
        t('subscriptions.plans.plus.feature1'),
        t('subscriptions.plans.plus.feature2'),
        t('subscriptions.plans.plus.feature3'),
        t('subscriptions.plans.plus.feature4'),
      ],
      detailingBonus: null as string | null,
      detailingBonusValue: null as string | null,
      bestFor: t('subscriptions.plans.plus.bestFor'),
      cta: t('subscriptions.plans.plus.cta'),
      ctaLink: `${WA_BASE}?text=Halo%2C%20saya%20ingin%20berlangganan%20paket%20Plus%20(Rp%201.796.000%2F4%20bulan).`,
      icon: Sparkles,
      popular: true,
    },
    {
      name: t('subscriptions.plans.elite.name'),
      monthlyPrice: t('subscriptions.plans.elite.monthlyPrice'),
      termNote: t('subscriptions.plans.elite.termNote'),
      savings: t('subscriptions.plans.elite.savings'),
      features: [
        t('subscriptions.plans.elite.feature1'),
        t('subscriptions.plans.elite.feature2'),
        t('subscriptions.plans.elite.feature3'),
        t('subscriptions.plans.elite.feature4'),
      ],
      detailingBonus: t('subscriptions.plans.elite.detailingBonus'),
      detailingBonusValue: t('subscriptions.plans.elite.detailingBonusValue'),
      bestFor: t('subscriptions.plans.elite.bestFor'),
      cta: t('subscriptions.plans.elite.cta'),
      ctaLink: `${WA_BASE}?text=Halo%2C%20saya%20ingin%20berlangganan%20paket%20Elite%20(Rp%2012.000.000%2Ftahun).`,
      icon: Star,
      popular: false,
    },
  ];

  const comparisonData = [
    {
      category: t('subscriptions.comparison.quarterlyPrice'),
      features: [
        { name: t('subscriptions.comparison.pricePer4Months'), essentials: t('subscriptions.comparison.essentials4Months'), plus: t('subscriptions.comparison.plus4Months'), elite: t('subscriptions.comparison.elite4Months') },
        { name: t('subscriptions.comparison.perMonth'), essentials: t('subscriptions.comparison.essentialsPerMonth'), plus: t('subscriptions.comparison.plusPerMonth'), elite: t('subscriptions.comparison.elitePerMonth') },
      ],
    },
    {
      category: t('subscriptions.comparison.washesIncluded'),
      features: [
        { name: t('subscriptions.comparison.standardWashes'), essentials: t('subscriptions.comparison.essentials4Standard'), plus: t('subscriptions.comparison.plus2Standard'), elite: t('subscriptions.comparison.elite3Standard') },
        { name: t('subscriptions.comparison.professionalWashes'), essentials: false as (string | boolean), plus: t('subscriptions.comparison.plus2Professional'), elite: t('subscriptions.comparison.elite3Professional') },
      ],
    },
    {
      category: t('subscriptions.comparison.freeFullDetail'),
      features: [
        { name: t('subscriptions.comparison.freeFullDetailLabel'), essentials: false as (string | boolean), plus: false as (string | boolean), elite: t('subscriptions.comparison.elite1FullDetail') },
      ],
    },
    {
      category: t('subscriptions.comparison.features'),
      features: [
        { name: t('subscriptions.comparison.priorityScheduling'), essentials: false as (string | boolean), plus: true as (string | boolean), elite: true as (string | boolean) },
        { name: t('subscriptions.comparison.whatsappPriority'), essentials: false as (string | boolean), plus: false as (string | boolean), elite: true as (string | boolean) },
      ],
    },
  ];

  const howItWorks = [
    {
      icon: CalendarCheck,
      title: t('subscriptions.howItWorks.scheduling.title'),
      body: t('subscriptions.howItWorks.scheduling.body'),
    },
    {
      icon: CreditCard,
      title: t('subscriptions.howItWorks.payment.title'),
      body: t('subscriptions.howItWorks.payment.body'),
    },
    {
      icon: MessageCircle,
      title: t('subscriptions.howItWorks.flexibility.title'),
      body: t('subscriptions.howItWorks.flexibility.body'),
    },
    {
      icon: ShieldCheck,
      title: t('subscriptions.howItWorks.cancellation.title'),
      body: t('subscriptions.howItWorks.cancellation.body'),
    },
  ];

  const faqs = [
    { question: t('subscriptions.faq.q1'), answer: t('subscriptions.faq.a1') },
    { question: t('subscriptions.faq.q2'), answer: t('subscriptions.faq.a2') },
    { question: t('subscriptions.faq.q3'), answer: t('subscriptions.faq.a3') },
    { question: t('subscriptions.faq.q4'), answer: t('subscriptions.faq.a4') },
    { question: t('subscriptions.faq.q5'), answer: t('subscriptions.faq.a5') },
    { question: t('subscriptions.faq.q6'), answer: t('subscriptions.faq.a6') },
  ];

  return (
    <div className="bg-brand-black">
      {/* -- 1. Hero ------------------------------------------------- */}
      <section className="w-full min-h-[75vh] flex items-center py-24 bg-brand-dark-gray section-lines-dark">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-orange mb-3">
            {t('subscriptions.hero.eyebrow')}
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-brand-white mb-6 font-heading">
            {t('subscriptions.hero.title')}
          </h1>
          <p className="mt-4 text-lg md:text-xl text-brand-white/80 max-w-3xl mx-auto">
            {t('subscriptions.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* -- Separator -- */}
      <div className="border-t border-white/10" />

      {/* -- 2. Subscription Plan Cards ------------------------------ */}
      <section className="w-full py-16 md:py-24 bg-brand-black section-lines-light">
        <div className="container mx-auto">
          {/* MOST POPULAR badge -- outside table, above Plus column, full column width */}
          <div className="hidden md:grid grid-cols-3 mb-3">
            <div />
            <div className="bg-brand-orange py-2 text-center">
              <span className="text-black text-xs font-semibold uppercase tracking-wider">
                {t('subscriptions.mostPopular')}
              </span>
            </div>
            <div />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 border border-white/10">
            {plans.map((plan, planIndex) => {
              const IconComponent = plan.icon;
              return (
                <div
                  key={plan.name}
                  className={cn(
                    "flex flex-col p-6 sm:p-8",
                    plan.popular
                      ? "bg-brand-orange/10"
                      : "bg-brand-dark-gray",
                    planIndex > 0 && "border-t md:border-t-0 md:border-l border-white/10"
                  )}
                >
                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className="mb-4 flex justify-center">
                      <IconComponent className="h-10 w-10 text-brand-orange" />
                    </div>
                    {/* Mobile-only MOST POPULAR badge */}
                    {plan.popular && (
                      <span className="inline-block px-4 py-1 bg-brand-orange text-black text-xs font-semibold uppercase tracking-wider mb-4 md:hidden">
                        {t('subscriptions.mostPopular')}
                      </span>
                    )}
                    <h3 className="text-2xl font-semibold text-brand-white mb-2 font-heading">
                      {plan.name}
                    </h3>
                    <p className="text-4xl font-extrabold text-brand-white">
                      {plan.monthlyPrice}<span className="text-lg font-medium text-brand-white/60">{t('subscriptions.perMonth')}</span>
                    </p>
                    <p className="text-xs text-brand-white/50 mt-3">
                      {plan.termNote}
                    </p>
                    {plan.savings && (
                      <span className="inline-block mt-3 px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-semibold uppercase tracking-wider">
                        {t('subscriptions.save')} {plan.savings}
                      </span>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="h-5 w-5 text-brand-orange mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-brand-white/90">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {plan.detailingBonus && (
                    <div className="border border-brand-orange/30 bg-brand-orange/5 p-3 mb-4">
                      <p className="text-sm text-brand-orange font-medium">
                        {plan.detailingBonus}
                      </p>
                      <p className="text-xs text-brand-white/50 mt-1">
                        {plan.detailingBonusValue}
                      </p>
                    </div>
                  )}

                  {/* CTA */}
                  <div className="mt-auto">
                    <p className="text-xs text-brand-white/50 italic mb-4">
                      {t('subscriptions.bestFor')} {plan.bestFor}
                    </p>
                    <Button
                      size="lg"
                      className={cn(
                        "w-full font-semibold",
                        plan.popular
                          ? "bg-brand-orange text-black hover:bg-brand-orange/90"
                          : "bg-white/10 text-brand-white hover:bg-white/20 border border-white/10"
                      )}
                      asChild
                    >
                      <a href={plan.ctaLink} target="_blank" rel="noopener noreferrer">
                        {plan.cta}
                      </a>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* One-time reference note -- below cards */}
          <div className="border border-white/10 border-t-0 p-6 text-center">
            <p className="text-brand-white/60 text-sm">
              {t('subscriptions.oneTimeRef')}{" "}
              <Link
                href="/car-wash/one-time"
                className="text-brand-orange underline underline-offset-4 hover:text-brand-orange/80 transition-colors"
              >
                {t('subscriptions.oneTimeRefLink')}
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* -- Separator -- */}
      <div className="border-t border-white/10" />

      {/* -- 3. Comparison Table ------------------------------------ */}
      <section className="w-full py-16 md:py-24 bg-brand-black section-lines-light">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold text-brand-white text-center mb-12 font-heading px-4">
            {t('subscriptions.comparePlans')}
          </h2>
          <div className="overflow-x-auto border border-white/10">
            <table className="w-full table-fixed divide-y divide-white/10">
              <colgroup>
                <col className="w-1/4" />
                <col className="w-1/4" />
                <col className="w-1/4" />
                <col className="w-1/4" />
              </colgroup>
              <thead>
                <tr className="bg-brand-black">
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-brand-white uppercase tracking-wider font-heading"
                  >
                    {t('subscriptions.comparison.feature')}
                  </th>
                  {plans.map((plan) => (
                    <th
                      key={plan.name}
                      scope="col"
                      className={cn(
                        "px-6 py-4 text-center text-sm font-semibold text-brand-white uppercase tracking-wider font-heading",
                        plan.popular ? "bg-brand-orange/10" : ""
                      )}
                    >
                      {plan.name}
                      {plan.popular && (
                        <div className="text-xs font-normal text-brand-orange normal-case">
                          ({t('subscriptions.mostPopular')})
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {comparisonData.map((group) => (
                  <React.Fragment key={group.category}>
                    <tr>
                      <th
                        colSpan={4}
                        className="px-6 py-3 text-left text-sm font-semibold text-brand-white bg-brand-orange/20 tracking-wide font-heading"
                      >
                        {group.category}
                      </th>
                    </tr>
                    {group.features.map((feature) => (
                      <tr
                        key={feature.name}
                        className="bg-brand-dark-gray"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-brand-white/90">
                          {feature.name}
                        </td>
                        {(["essentials", "plus", "elite"] as const).map(
                          (planKey) => {
                            const value =
                              feature[planKey as keyof typeof feature];
                            return (
                              <td
                                key={`${feature.name}-${planKey}`}
                                className="px-6 py-4 text-sm text-brand-white/80 text-center"
                              >
                                {typeof value === "boolean" ? (
                                  value ? (
                                    <Check className="h-5 w-5 text-brand-orange mx-auto" />
                                  ) : (
                                    <X className="h-5 w-5 text-red-500/70 mx-auto" />
                                  )
                                ) : (
                                  value || "N/A"
                                )}
                              </td>
                            );
                          }
                        )}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* -- Separator -- */}
      <div className="border-t border-white/10" />

      {/* -- 5. How Subscriptions Work ------------------------------- */}
      <section className="w-full py-16 md:py-24 bg-brand-dark-gray section-lines-dark">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold text-brand-white text-center mb-12 font-heading px-4">
            {t('subscriptions.howItWorks')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-white/10">
            {howItWorks.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div key={item.title} className={cn(
                  "text-center p-8",
                  index > 0 && "border-t sm:border-t-0 sm:border-l border-white/10",
                  index === 2 && "sm:border-t lg:border-t-0"
                )}>
                  <div className="mb-4 flex justify-center">
                    <div className="rounded-full bg-brand-orange/10 p-4">
                      <IconComponent className="h-8 w-8 text-brand-orange" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-brand-white mb-2 font-heading">
                    {item.title}
                  </h3>
                  <p className="text-sm text-brand-white/70">{item.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* -- Separator -- */}
      <div className="border-t border-white/10" />

      {/* -- 6. FAQ -------------------------------------------------- */}
      <section className="w-full py-16 md:py-24 bg-brand-black section-lines-light">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold text-brand-white text-center mb-12 font-heading px-4">
            {t('subscriptions.faq.title')}
          </h2>
          <div className="border border-white/10 px-6 sm:px-8 md:px-10">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem
                  value={`item-${index + 1}`}
                  key={index}
                  className="border-b-white/10"
                >
                  <AccordionTrigger className="py-5 text-left text-lg font-medium text-brand-white hover:text-brand-orange hover:no-underline font-heading">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="pt-0 pb-5 text-base text-brand-white/80">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* -- Separator -- */}
      <div className="border-t border-white/10" />

      {/* -- 7. Final CTA ------------------------------------------- */}
      <section className="w-full py-12 bg-brand-dark-gray text-center section-lines-dark">
        <div className="container mx-auto">
          <div className="border border-white/10 px-6 sm:px-10 md:px-16 py-16 md:py-20">
            <h2 className="text-3xl md:text-4xl font-semibold text-brand-white mb-6 font-heading">
              {t('common.cta.bookYourFirstWash')}
            </h2>
            <p className="text-brand-white/70 mb-8 max-w-xl mx-auto">
              {t('common.cta.bookYourFirstWashDesc')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button
                size="lg"
                className="bg-brand-orange text-black hover:bg-brand-orange/90 py-4 px-10 text-lg font-semibold"
                asChild
              >
                <a
                  href={`${WA_BASE}?text=Halo%2C%20saya%20tertarik%20untuk%20berlangganan%20Castudio.`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('common.cta.whatsappUs')}
                </a>
              </Button>
              <Link
                href="/car-wash/one-time"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium border border-brand-orange text-brand-orange hover:bg-brand-orange/10 h-11 py-3 px-8 text-base transition-colors"
              >
                {t('common.cta.seeOurPlans')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="border-t border-white/10" />
    </div>
  );
}
