'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import { HelpCircle, DollarSign, CalendarCheck, ShieldCheck, Droplets, Paintbrush } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";
import { useTranslation } from '@/i18n';

export default function FAQPage() {
  const { t } = useTranslation();

  const generalFAQs = [
    {
      sectionTitle: t('faq.general.title'),
      icon: HelpCircle,
      questions: [
        { q: t('faq.general.q1'), a: t('faq.general.a1') },
        { q: t('faq.general.q2'), a: t('faq.general.a2') },
        { q: t('faq.general.q3'), a: t('faq.general.a3') },
        { q: t('faq.general.q4'), a: t('faq.general.a4') },
        { q: t('faq.general.q5'), a: t('faq.general.a5') },
      ],
    },
  ];

  const pricingFAQs = [
    {
      sectionTitle: t('faq.pricing.title'),
      icon: DollarSign,
      questions: [
        { q: t('faq.pricing.q1'), a: t('faq.pricing.a1') },
        { q: t('faq.pricing.q2'), a: t('faq.pricing.a2') },
        { q: t('faq.pricing.q3'), a: t('faq.pricing.a3') },
      ],
    },
  ];

  const subscriptionFAQs = [
    {
      sectionTitle: t('faq.subscriptions.title'),
      icon: CalendarCheck,
      questions: [
        { q: t('faq.subscriptions.q1'), a: t('faq.subscriptions.a1') },
        { q: t('faq.subscriptions.q2'), a: t('faq.subscriptions.a2') },
        { q: t('faq.subscriptions.q3'), a: t('faq.subscriptions.a3') },
        { q: t('faq.subscriptions.q4'), a: t('faq.subscriptions.a4') },
      ],
    },
  ];

  const qualityFAQs = [
    {
      sectionTitle: t('faq.quality.title'),
      icon: ShieldCheck,
      questions: [
        { q: t('faq.quality.q1'), a: t('faq.quality.a1') },
        { q: t('faq.quality.q2'), a: t('faq.quality.a2') },
        { q: t('faq.quality.q3'), a: t('faq.quality.a3') },
      ],
    },
  ];

  const serviceDetailFAQs = [
    {
      sectionTitle: t('faq.serviceDetails.title'),
      icon: Droplets,
      questions: [
        { q: t('faq.serviceDetails.q1'), a: t('faq.serviceDetails.a1') },
        { q: t('faq.serviceDetails.q2'), a: t('faq.serviceDetails.a2') },
        { q: t('faq.serviceDetails.q3'), a: t('faq.serviceDetails.a3') },
        { q: t('faq.serviceDetails.q4'), a: t('faq.serviceDetails.a4') },
        { q: t('faq.serviceDetails.q5'), a: t('faq.serviceDetails.a5') },
      ],
    },
  ];

  const detailingFAQs = [
    {
      sectionTitle: t('faq.detailing.title'),
      icon: Paintbrush,
      questions: [
        { q: t('faq.detailing.q1'), a: t('faq.detailing.a1') },
        { q: t('faq.detailing.q2'), a: t('faq.detailing.a2') },
        { q: t('faq.detailing.q3'), a: t('faq.detailing.a3') },
        { q: t('faq.detailing.q4'), a: t('faq.detailing.a4') },
      ],
    },
  ];

  const allSections = [
    { data: generalFAQs, key: "general", bg: "bg-brand-dark-gray" },
    { data: pricingFAQs, key: "pricing", bg: "bg-brand-black" },
    { data: subscriptionFAQs, key: "subscriptions", bg: "bg-brand-dark-gray" },
    { data: detailingFAQs, key: "detailing", bg: "bg-brand-black" },
    { data: qualityFAQs, key: "quality", bg: "bg-brand-dark-gray" },
    { data: serviceDetailFAQs, key: "details", bg: "bg-brand-black" },
  ];

  return (
    <div className="bg-brand-black">
      {/* Hero */}
      <section className="w-full min-h-[75vh] flex items-center justify-center bg-brand-black text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up" delay={200}>
            <div className="text-center space-y-6 px-4">
              <h1 className="text-4xl md:text-6xl font-normal font-heading tracking-tight">
                {t('faq.hero.title')}
              </h1>
              <p className="text-lg md:text-xl text-white/70 font-light max-w-2xl mx-auto">
                {t('faq.hero.subtitle')}
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {allSections.map((section) => {
        const category = section.data[0];
        const Icon = category.icon;
        return (
          <div key={section.key}>
            <div className="border-t border-white/10" />
            <section className={`w-full py-20 md:py-24 ${section.bg} section-lines-dark`}>
              <div className="container mx-auto">
                <FadeIn direction="up">
                  <div className="flex items-center gap-4 mb-12 px-4">
                    <Icon className="h-8 w-8 text-brand-orange" />
                    <div>
                      <h2 className="text-2xl md:text-3xl font-normal text-white font-heading">
                        {category.sectionTitle}
                      </h2>
                    </div>
                  </div>
                </FadeIn>

                <div className="space-y-12">
                  <FadeIn>
                    <div className="px-4">
                      <Accordion type="single" collapsible className="w-full space-y-3">
                        {category.questions.map((faq, index) => (
                          <AccordionItem
                            value={`${section.key}-${index}`}
                            key={index}
                            className="border border-white/10 px-4 data-[state=open]:bg-white/5 transition-colors"
                          >
                            <AccordionTrigger className="text-left hover:no-underline text-base font-medium text-white py-4">
                              {faq.q}
                            </AccordionTrigger>
                            <AccordionContent className="text-white/60 text-base leading-relaxed pb-4">
                              {faq.a}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  </FadeIn>
                </div>
              </div>
            </section>
          </div>
        );
      })}

      {/* CTA */}
      <div className="border-t border-white/10" />
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
                      href="https://wa.me/62816104334?text=Halo%2C%20saya%20ingin%20booking%20cuci%20mobil."
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
