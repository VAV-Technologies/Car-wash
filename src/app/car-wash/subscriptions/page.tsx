'use client';

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, X, ArrowRight, Droplets, Sparkles, Star, CalendarCheck, CreditCard, MessageCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const WA_BASE = "https://wa.me/62816104334";

const plans = [
  {
    name: "Essentials",
    price: "Rp 609.000",
    priceShort: "Rp 609K",
    perMonth: "/month per car",
    features: [
      "2 Standard washes per month",
      "You pick the days, we show up",
      "Effective price: Rp 304.500/wash",
      "Save 10% vs. one-time",
    ],
    detailingBonus: null,
    bestFor: "Car owners who want thorough bi-weekly maintenance",
    cta: "Subscribe to Essentials",
    ctaLink: `${WA_BASE}?text=Halo%2C%20saya%20ingin%20berlangganan%20paket%20Essentials%20(Rp%20609.000%2Fbulan).`,
    icon: Droplets,
    popular: false,
  },
  {
    name: "Plus",
    price: "Rp 1.349.000",
    priceShort: "Rp 1.349K",
    perMonth: "/month per car",
    features: [
      "3 Standard + 1 Professional wash/month",
      "Weekly maintenance + monthly deep clean",
      "Save 15% vs. one-time pricing",
      "Glass descaling + tar removal included",
    ],
    detailingBonus: "1 Free Full Detail per year",
    bestFor: "Jakarta drivers who want weekly care plus monthly deep restoration",
    cta: "Subscribe to Plus",
    ctaLink: `${WA_BASE}?text=Halo%2C%20saya%20ingin%20berlangganan%20paket%20Plus%20(Rp%201.349.000%2Fbulan).`,
    icon: Sparkles,
    popular: true,
  },
  {
    name: "Unlimited",
    price: "Rp 3.199.000",
    priceShort: "Rp 3.199K",
    perMonth: "/month \u00b7 1 car only",
    features: [
      "Unlimited Standard washes (call anytime)",
      "2 Professional washes per week",
      "Priority scheduling",
      "1 registered vehicle only",
    ],
    detailingBonus: "1 Free Full Detail every 6 months (2x/year)",
    bestFor: "Executives and car enthusiasts who want their car pristine at all times",
    cta: "Subscribe to Unlimited",
    ctaLink: `${WA_BASE}?text=Halo%2C%20saya%20ingin%20berlangganan%20paket%20Unlimited%20(Rp%203.199.000%2Fbulan).`,
    icon: Star,
    popular: false,
  },
];

const comparisonData = [
  {
    category: "MONTHLY PRICE",
    features: [
      { name: "Price", essentials: "Rp 609K", plus: "Rp 1.349K", unlimited: "Rp 3.199K" },
    ],
  },
  {
    category: "WASHES INCLUDED",
    features: [
      { name: "Standard washes", essentials: "2/month", plus: "3/month", unlimited: "Unlimited" },
      { name: "Professional washes", essentials: "\u2014", plus: "1/month", unlimited: "2/week (~8/month)" },
    ],
  },
  {
    category: "SAVINGS",
    features: [
      { name: "Savings vs. one-time", essentials: "10%", plus: "15%", unlimited: "Up to 63%" },
    ],
  },
  {
    category: "FREE FULL DETAIL",
    features: [
      { name: "Full Detail included", essentials: "\u2014", plus: "1x/year", unlimited: "2x/year (every 6 months)" },
      { name: "Full Detail value", essentials: "\u2014", plus: "Rp 2,799,000", unlimited: "Rp 5,598,000" },
    ],
  },
  {
    category: "FEATURES",
    features: [
      { name: "Priority scheduling", essentials: false, plus: true, unlimited: true },
      { name: "WhatsApp priority", essentials: false, plus: false, unlimited: true },
    ],
  },
  {
    category: "TERMS",
    features: [
      { name: "Per car", essentials: "Yes", plus: "Yes", unlimited: "1 car only (license plate)" },
      { name: "Minimum commitment", essentials: "None", plus: "None", unlimited: "None" },
      { name: "Unused washes roll over", essentials: false, plus: false, unlimited: "N/A" },
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
      "Plus subscribers receive 1 Free Full Detail per year (worth Rp 2,799,000). Unlimited subscribers receive 1 Free Full Detail every 6 months (2x per year). The Full Detail includes Interior Detailing, Exterior Detailing, Window Detailing, and Tire & Rims Detailing \u2014 approximately 8 hours of work.",
  },
  {
    question: "Can I use Unlimited for multiple cars?",
    answer:
      "No. The Unlimited plan is registered to a single license plate. If you need coverage for additional vehicles, you can subscribe to a separate plan for each car.",
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
    <>
      {/* \u2500\u2500 1. Hero \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
      <section className="min-h-[60vh] flex items-center py-24 bg-brand-dark-gray">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-orange mb-3">
            SUBSCRIPTION PLANS
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-brand-white mb-6 font-heading">
            Set it and forget it.
          </h1>
          <p className="mt-4 text-lg md:text-xl text-brand-white/80 max-w-3xl mx-auto">
            We&rsquo;ll keep your car pristine on a schedule that works for you.
            Save up to 63% vs. one-time pricing &mdash; and Plus &amp; Unlimited
            subscribers get a free Full Detail worth Rp 2.8M.
          </p>
        </div>
      </section>

      {/* \u2500\u2500 2. One-time reference note \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
      <section className="bg-brand-black py-6">
        <div className="container mx-auto px-4 text-center">
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
      </section>

      {/* \u2500\u2500 3. Subscription Plan Cards \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
      <section className="py-16 md:py-24 bg-brand-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan) => {
              const IconComponent = plan.icon;
              return (
                <Card
                  key={plan.name}
                  className={`flex flex-col shadow-xl rounded-lg bg-brand-dark-gray ${
                    plan.popular
                      ? "border-2 border-brand-orange relative"
                      : "border border-white/10"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
                      <span className="px-4 py-1 bg-brand-orange text-brand-white text-xs font-semibold rounded-full uppercase tracking-wider">
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  <CardHeader
                    className={`p-6 text-center ${
                      plan.popular ? "pt-10" : "pt-6"
                    }`}
                  >
                    <div className="mb-4 flex justify-center">
                      <IconComponent className="h-10 w-10 text-brand-orange" />
                    </div>
                    <CardTitle className="text-2xl font-semibold text-brand-white mb-2 font-heading">
                      {plan.name}
                    </CardTitle>
                    <p className="text-4xl font-extrabold text-brand-white">
                      {plan.price}
                    </p>
                    <p className="text-sm text-brand-white/70 mt-1">
                      {plan.perMonth}
                    </p>
                  </CardHeader>

                  <CardContent className="p-6 flex-grow">
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
                    <p className="text-xs text-brand-white/50 italic">
                      Best for: {plan.bestFor}
                    </p>
                  </CardContent>

                  <CardFooter className="p-6 mt-auto">
                    <Button
                      size="lg"
                      className={`w-full font-semibold ${
                        plan.popular
                          ? "bg-brand-orange text-brand-white hover:bg-brand-orange/90"
                          : "bg-white/10 text-brand-white hover:bg-white/20 border border-white/10"
                      }`}
                      asChild
                    >
                      <a href={plan.ctaLink} target="_blank" rel="noopener noreferrer">
                        {plan.cta}
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* \u2500\u2500 4. Free Full Detail for Plus & Unlimited \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
      <section className="py-16 md:py-24 bg-brand-dark-gray">
        <div className="container mx-auto px-4">
          <div className="rounded-lg border border-brand-orange/30 bg-brand-dark-gray p-8 md:p-12">
            <div className="text-center mb-10">
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-orange mb-3">
                SUBSCRIBER BONUS
              </p>
              <h2 className="text-3xl md:text-4xl font-semibold text-brand-white font-heading mb-4">
                Free Full Detail for Plus &amp; Unlimited Subscribers
              </h2>
              <p className="text-brand-white/80 max-w-3xl mx-auto">
                Subscribe to Plus or Unlimited and receive a complimentary Full
                Detail &mdash; our most comprehensive detailing service worth
                Rp 2,799,000. Interior, exterior, windows, tires &amp; rims,
                all in one 8-hour session.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              {/* Left column */}
              <div>
                <h3 className="text-lg font-semibold text-brand-orange mb-4 font-heading">
                  What&rsquo;s Included in a Full Detail
                </h3>
                <ul className="space-y-3">
                  {[
                    "Interior Detailing \u2014 deep clean, upholstery, dashboard",
                    "Exterior Detailing \u2014 paint correction, polish, sealant",
                    "Window Detailing \u2014 inside and out, streak-free",
                    "Tire & Rims Detailing \u2014 deep clean and dressing",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-brand-orange mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-brand-white/90">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right column */}
              <div>
                <h3 className="text-lg font-semibold text-brand-orange mb-4 font-heading">
                  Worth Rp 2,799,000
                </h3>
                <ul className="space-y-3">
                  {[
                    "Plus: 1 Free Full Detail per year",
                    "Unlimited: 1 Free Full Detail every 6 months (2x/year)",
                    "Essentials: Not included (upgrade to unlock)",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-brand-orange mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-brand-white/90">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-center">
              <Button
                size="lg"
                className="bg-brand-orange text-brand-white hover:bg-brand-orange/90 font-semibold"
                asChild
              >
                <a
                  href={`${WA_BASE}?text=Halo%2C%20saya%20tertarik%20berlangganan%20untuk%20mendapat%20Free%20Full%20Detail.`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Subscribe Now <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* \u2500\u2500 5. Comparison Table \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
      <section className="py-16 md:py-24 bg-brand-black">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-semibold text-brand-white text-center mb-12 font-heading">
            Compare Plans
          </h2>
          <div className="overflow-x-auto rounded-lg border border-white/10 shadow-lg">
            <table className="min-w-full divide-y divide-white/10 bg-brand-dark-gray">
              <thead className="bg-brand-black">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-brand-white uppercase tracking-wider sticky left-0 bg-brand-black z-10 font-heading"
                  >
                    Feature
                  </th>
                  {plans.map((plan) => (
                    <th
                      key={plan.name}
                      scope="col"
                      className={`px-6 py-4 text-center text-sm font-semibold text-brand-white uppercase tracking-wider font-heading ${
                        plan.popular ? "bg-brand-orange/10" : ""
                      }`}
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
                        className="px-6 py-3 text-left text-sm font-semibold text-brand-white bg-brand-orange/20 tracking-wide sticky left-0 z-10 font-heading"
                      >
                        {group.category}
                      </th>
                    </tr>
                    {group.features.map((feature) => (
                      <tr
                        key={feature.name}
                        className="even:bg-brand-black/30 hover:bg-brand-orange/5"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-white/90 sticky left-0 bg-inherit z-0">
                          {feature.name}
                        </td>
                        {(["essentials", "plus", "unlimited"] as const).map(
                          (planKey) => {
                            const value =
                              feature[planKey as keyof typeof feature];
                            return (
                              <td
                                key={`${feature.name}-${planKey}`}
                                className="px-6 py-4 whitespace-nowrap text-sm text-brand-white/80 text-center"
                              >
                                {typeof value === "boolean" ? (
                                  value ? (
                                    <Check className="h-5 w-5 text-brand-orange mx-auto" />
                                  ) : (
                                    <X className="h-5 w-5 text-red-500/70 mx-auto" />
                                  )
                                ) : (
                                  value || "\u2014"
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

      {/* \u2500\u2500 6. How Subscriptions Work \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
      <section className="py-16 md:py-24 bg-brand-dark-gray">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-semibold text-brand-white text-center mb-12 font-heading">
            How Subscriptions Work
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item) => {
              const IconComponent = item.icon;
              return (
                <div key={item.title} className="text-center">
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

      {/* \u2500\u2500 7. FAQ \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
      <section className="py-16 md:py-24 bg-brand-black">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-semibold text-brand-white text-center mb-12 font-heading">
            Frequently Asked Questions
          </h2>
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
      </section>

      {/* \u2500\u2500 8. Final CTA \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
      <section className="py-16 bg-brand-dark-gray text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-semibold text-brand-white mb-6 font-heading">
            Ready to keep your car pristine?
          </h2>
          <p className="text-brand-white/70 mb-8 max-w-xl mx-auto">
            Choose a plan and get started today. We&rsquo;ll handle the rest.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button
              size="lg"
              className="bg-brand-orange text-brand-white hover:bg-brand-orange/90 py-4 px-10 text-lg font-semibold"
              asChild
            >
              <a
                href={`${WA_BASE}?text=Halo%2C%20saya%20tertarik%20untuk%20berlangganan%20Castudio.`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Start Your Subscription <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Link
              href="/car-wash/one-time"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium border border-brand-orange text-brand-orange hover:bg-brand-orange/10 h-11 py-3 px-8 text-base transition-colors"
            >
              Not ready? Try one-time first
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
