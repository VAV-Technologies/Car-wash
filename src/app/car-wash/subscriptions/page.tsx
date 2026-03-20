'use client';

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, X, ArrowRight, Droplets, Sparkles, Star, CalendarCheck, CreditCard, MessageCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const WA_BASE = "https://wa.me/62816104334";

const plans = [
  {
    name: "Essentials",
    monthlyPrice: "Rp 387.250",
    price: "Rp 1.549.000",
    priceShort: "Rp 1.549K",
    perMonth: "/mo",
    termNote: "4-month term \u00b7 Rp 1,549,000 total",
    oneTimeValue: "Rp 1,356,000",
    savings: "Rp 207,000",
    features: [
      "4 Standard washes over 4 months",
      "You pick the days, we show up",
      "15% off vs. one-time pricing",
    ],
    detailingBonus: null,
    bestFor: "Car owners who want regular monthly maintenance and a consistently clean car.",
    cta: "Subscribe to Essentials",
    ctaLink: `${WA_BASE}?text=Halo%2C%20saya%20ingin%20berlangganan%20paket%20Essentials%20(Rp%201.549.000%2F4%20bulan).`,
    icon: Droplets,
    popular: false,
  },
  {
    name: "Plus",
    monthlyPrice: "Rp 534.750",
    price: "Rp 2.139.000",
    priceShort: "Rp 2.139K",
    perMonth: "/mo",
    termNote: "4-month term \u00b7 Rp 2,139,000 total",
    oneTimeValue: "Rp 1,816,000",
    savings: "Rp 267,000",
    features: [
      "2 Standard + 2 Professional washes over 4 months",
      "Regular maintenance + deep restoration",
      "15% off vs. one-time pricing",
      "Glass descaling + tar removal included",
    ],
    detailingBonus: null,
    bestFor: "Jakarta drivers who want regular care plus deep restoration every quarter.",
    cta: "Subscribe to Plus",
    ctaLink: `${WA_BASE}?text=Halo%2C%20saya%20ingin%20berlangganan%20paket%20Plus%20(Rp%202.139.000%2F4%20bulan).`,
    icon: Sparkles,
    popular: true,
  },
  {
    name: "Elite",
    monthlyPrice: "Rp 802.250",
    price: "Rp 3.209.000",
    priceShort: "Rp 3.209K",
    perMonth: "/mo",
    termNote: "4-month term \u00b7 Rp 3,209,000 total",
    oneTimeValue: "Rp 2,494,000",
    savings: "Rp 375,000",
    features: [
      "3 Standard + 3 Professional washes over 4 months",
      "Frequent maintenance + deep restoration",
      "15% off vs. one-time pricing",
      "Priority scheduling",
    ],
    detailingBonus: "1 Free Full Detail per year",
    bestFor: "Executives and car enthusiasts who want their car pristine at all times.",
    cta: "Subscribe to Elite",
    ctaLink: `${WA_BASE}?text=Halo%2C%20saya%20ingin%20berlangganan%20paket%20Elite%20(Rp%203.209.000%2F4%20bulan).`,
    icon: Star,
    popular: false,
  },
];

const comparisonData = [
  {
    category: "QUARTERLY PRICE",
    features: [
      { name: "Price (per 4 months)", essentials: "Rp 1.549K", plus: "Rp 2.139K", elite: "Rp 3.209K" },
      { name: "Per month", essentials: "Rp 387K", plus: "Rp 535K", elite: "Rp 802K" },
    ],
  },
  {
    category: "WASHES INCLUDED (PER QUARTER)",
    features: [
      { name: "Standard washes", essentials: "4 over 4 months", plus: "2 over 4 months", elite: "3 over 4 months" },
      { name: "Professional washes", essentials: false, plus: "2 over 4 months", elite: "3 over 4 months" },
    ],
  },
  {
    category: "FREE FULL DETAIL",
    features: [
      { name: "Free Full Detail", essentials: false, plus: false, elite: "1x/year (Rp 2,799,000 value)" },
    ],
  },
  {
    category: "FEATURES",
    features: [
      { name: "Priority scheduling", essentials: false, plus: true, elite: true },
      { name: "WhatsApp priority", essentials: false, plus: false, elite: true },
    ],
  },
];

const howItWorks = [
  {
    icon: CalendarCheck,
    title: "Scheduling",
    body: "Pick your preferred days and times. We lock in recurring slots so your car is always taken care of on schedule.",
  },
  {
    icon: CreditCard,
    title: "Payment",
    body: "Monthly billing via bank transfer or e-wallet (GoPay, OVO, DANA). Simple and automatic.",
  },
  {
    icon: MessageCircle,
    title: "Flexibility",
    body: "Need to reschedule? Just send us a WhatsApp message at least 24 hours in advance.",
  },
  {
    icon: ShieldCheck,
    title: "Cancellation",
    body: "30-day notice to cancel. No contracts. Stay because you want to, not because you have to.",
  },
];

const faqs = [
  {
    question: "Can I change my plan?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.",
  },
  {
    question: "Do unused washes roll over?",
    answer:
      "No. Unused washes do not carry over to the following month. We encourage you to use all your included washes each billing period.",
  },
  {
    question: "What's included in the Free Full Detail bonus?",
    answer:
      "Elite subscribers receive 1 Free Full Detail per year (worth Rp 2,799,000). The Full Detail includes Interior Detailing, Exterior Detailing, Window Detailing, and Tire & Rims Detailing. Approximately 8 hours of work. Essentials and Plus subscribers do not receive the detailing bonus.",
  },
  {
    question: "Can I use Elite for multiple cars?",
    answer:
      "No. The Elite plan is registered to a single license plate. If you need coverage for additional vehicles, you can subscribe to a separate plan for each car.",
  },
  {
    question: "Is there a contract?",
    answer:
      "No contract. All plans are month-to-month. Cancel anytime with 30 days notice.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept bank transfer, GoPay, OVO, and DANA. Invoices are sent monthly via WhatsApp.",
  },
];

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

export default function SubscriptionsPage() {
  return (
    <div className="bg-brand-black">
      {/* ── 1. Hero ───────────────────────────────────────────────── */}
      <section className="w-full min-h-[75vh] flex items-center py-24 bg-brand-dark-gray section-lines-dark">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-orange mb-3">
            SUBSCRIPTION PLANS
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-brand-white mb-6 font-heading">
            Set it and forget it.
          </h1>
          <p className="mt-4 text-lg md:text-xl text-brand-white/80 max-w-3xl mx-auto">
            We&rsquo;ll keep your car pristine on a schedule that works for you.
            Save 15% vs. one-time pricing. Elite subscribers
            also get a free Full Detail worth Rp 2.8M every year.
          </p>
        </div>
      </section>

      {/* -- Separator -- */}
      <div className="border-t border-white/10" />

      {/* ── 2. Subscription Plan Cards ──────────────────────────── */}
      <section className="w-full py-16 md:py-24 bg-brand-black section-lines-light">
        <div className="container mx-auto">
          {/* MOST POPULAR badge — outside table, above Plus column, full column width */}
          <div className="hidden md:grid grid-cols-3 mb-3">
            <div />
            <div className="bg-brand-orange py-2 text-center">
              <span className="text-black text-xs font-semibold uppercase tracking-wider">
                MOST POPULAR
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
                        MOST POPULAR
                      </span>
                    )}
                    <h3 className="text-2xl font-semibold text-brand-white mb-2 font-heading">
                      {plan.name}
                    </h3>
                    <p className="text-4xl font-extrabold text-brand-white">
                      {plan.monthlyPrice}<span className="text-lg font-medium text-brand-white/60">/MO</span>
                    </p>
                    <p className="text-xs text-brand-white/50 mt-3">
                      {plan.termNote}
                    </p>
                    <span className="inline-block mt-3 px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-semibold uppercase tracking-wider">
                      SAVE {plan.savings}
                    </span>
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
                        Worth Rp 2,799,000 per session
                      </p>
                    </div>
                  )}

                  {/* CTA */}
                  <div className="mt-auto">
                    <p className="text-xs text-brand-white/50 italic mb-4">
                      Best for: {plan.bestFor}
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

          {/* One-time reference note — below cards */}
          <div className="border border-white/10 border-t-0 p-6 text-center">
            <p className="text-brand-white/60 text-sm">
              Looking for a one-time wash? Standard from{" "}
              <span className="text-brand-orange font-semibold">Rp 339.000</span>.{" "}
              <Link
                href="/car-wash/one-time"
                className="text-brand-orange underline underline-offset-4 hover:text-brand-orange/80 transition-colors"
              >
                See our services &rarr;
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* -- Separator -- */}
      <div className="border-t border-white/10" />

      {/* ── 3. Comparison Table ────────────────────────────────── */}
      <section className="w-full py-16 md:py-24 bg-brand-black section-lines-light">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold text-brand-white text-center mb-12 font-heading px-4">
            Compare Plans
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
                    Feature
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
                          (Most Popular)
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

      {/* ── 5. How Subscriptions Work ─────────────────────────── */}
      <section className="w-full py-16 md:py-24 bg-brand-dark-gray section-lines-dark">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold text-brand-white text-center mb-12 font-heading px-4">
            How Subscriptions Work
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

      {/* ── 6. FAQ ────────────────────────────────────────────── */}
      <section className="w-full py-16 md:py-24 bg-brand-black section-lines-light">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold text-brand-white text-center mb-12 font-heading px-4">
            Frequently Asked Questions
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

      {/* ── 7. Final CTA ──────────────────────────────────────── */}
      <section className="w-full py-12 bg-brand-dark-gray text-center section-lines-dark">
        <div className="container mx-auto">
          <div className="border border-white/10 px-6 sm:px-10 md:px-16 py-16 md:py-20">
            <h2 className="text-3xl md:text-4xl font-semibold text-brand-white mb-6 font-heading">
              Book Your First Wash
            </h2>
            <p className="text-brand-white/70 mb-8 max-w-xl mx-auto">
              Experience the Castudio difference. Premium products, trained technicians, and a result you can see and feel, at your doorstep.
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
                  WhatsApp Us
                </a>
              </Button>
              <Link
                href="/car-wash/one-time"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium border border-brand-orange text-brand-orange hover:bg-brand-orange/10 h-11 py-3 px-8 text-base transition-colors"
              >
                See Our Plans
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
