'use client';

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, X, ArrowRight, Droplets, Sparkles, Star } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Basic",
    price: "Rp 150.000",
    frequency: "1x/week",
    description: "Keep your car clean with a weekly professional wash.",
    features: [
      "Weekly exterior & interior wash",
      "pH-balanced shampoo",
      "Microfiber mitt wash",
      "Tire dressing",
    ],
    cta: "Choose Basic",
    ctaLink: "/contact",
    variant: "secondary",
    icon: Droplets,
  },
  {
    name: "Regular",
    price: "Rp 250.000",
    frequency: "2x/week",
    description: "Stay on top of your car's cleanliness with twice-weekly washes.",
    features: [
      "Everything in Basic",
      "2x washes per week",
      "Interior vacuum each visit",
      "Glass cleaning",
    ],
    cta: "Choose Regular",
    ctaLink: "/contact",
    variant: "secondary",
    icon: Droplets,
  },
  {
    name: "Premium",
    price: "Rp 400.000",
    frequency: "4x/week",
    description: "For drivers who want their car looking perfect every day.",
    features: [
      "Everything in Regular",
      "4x washes per week",
      "Priority booking",
      "Free air freshener",
    ],
    cta: "Choose Premium",
    ctaLink: "/contact",
    variant: "default",
    popular: true,
    icon: Sparkles,
  },
  {
    name: "Unlimited",
    price: "Rp 600.000",
    frequency: "Unlimited",
    description: "Wash as often as you want. The ultimate car care plan.",
    features: [
      "Everything in Premium",
      "Unlimited washes",
      "10% off all detailing",
      "WhatsApp priority support",
    ],
    cta: "Choose Unlimited",
    ctaLink: "/contact",
    variant: "secondary",
    icon: Star,
  },
];

const detailingPackages = [
  {
    name: "Refresh",
    price: "Rp 350.000",
    duration: "~2 hrs",
    description: "Exterior shine + interior cleanliness",
  },
  {
    name: "Restore",
    price: "Rp 750.000",
    duration: "~4-5 hrs",
    description: "Paint correction + deep interior",
  },
  {
    name: "Protect",
    price: "Rp 1.500.000",
    duration: "~6-8 hrs",
    description: "Ceramic coating + show-ready finish",
  },
];

const featureComparison = [
  {
    category: "PRICING",
    features: [
      { name: "Monthly cost", basic: "Rp 150.000", regular: "Rp 250.000", premium: "Rp 400.000", unlimited: "Rp 600.000" },
    ],
  },
  {
    category: "WASH SERVICES",
    features: [
      { name: "Wash frequency", basic: "1x/week", regular: "2x/week", premium: "4x/week", unlimited: "Unlimited" },
      { name: "Interior vacuum", basic: false, regular: true, premium: true, unlimited: true },
      { name: "Glass cleaning", basic: false, regular: true, premium: true, unlimited: true },
      { name: "Tire dressing", basic: true, regular: true, premium: true, unlimited: true },
      { name: "Air freshener", basic: false, regular: false, premium: true, unlimited: true },
    ],
  },
  {
    category: "EXTRAS",
    features: [
      { name: "Priority booking", basic: false, regular: false, premium: true, unlimited: true },
      { name: "WhatsApp support", basic: false, regular: false, premium: false, unlimited: true },
      { name: "Detailing discount", basic: false, regular: false, premium: false, unlimited: "10%" },
      { name: "Member events", basic: false, regular: false, premium: false, unlimited: true },
    ],
  },
  {
    category: "DETAILING ADD-ONS",
    features: [
      { name: "Interior deep clean discount", basic: false, regular: false, premium: "5%", unlimited: "10%" },
      { name: "Polish discount", basic: false, regular: false, premium: "5%", unlimited: "10%" },
      { name: "Ceramic coating discount", basic: false, regular: false, premium: false, unlimited: "10%" },
    ],
  },
];

const faqs = [
  {
    question: "Can I change my plan?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle, so you always get the full value of your current plan.",
  },
  {
    question: "Is there a contract?",
    answer: "No contracts at all. All Castudio plans are month-to-month and you can cancel anytime — no questions asked.",
  },
  {
    question: "What products do you use?",
    answer: "We use only premium, pH-balanced, paint-safe products that are gentle on your car's finish while delivering a thorough clean. Our products are sourced from trusted automotive care brands.",
  },
  {
    question: "How do I book?",
    answer: "You can book your wash online through our website or simply send us a message on WhatsApp. We'll confirm your slot within minutes.",
  },
  {
    question: "What if I'm not satisfied?",
    answer: "Your satisfaction is our priority. If you're not happy with any wash, we offer a free re-wash guarantee — just let us know within 24 hours and we'll make it right.",
  },
  {
    question: "Can I use my plan at any location?",
    answer: "Yes, your subscription is valid at all Castudio studios across Indonesia. Simply show your membership when you arrive at any of our locations.",
  },
];


export default function PricingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-brand-dark-gray">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-orange mb-3">PRICING &amp; PLANS</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-brand-white mb-6 font-heading">
            Choose the Right Plan for Your Car
          </h1>
          <p className="mt-4 text-lg md:text-xl text-brand-white/80 max-w-3xl mx-auto">
            From weekly washes to unlimited care, Castudio offers flexible plans designed to keep your car looking its best — all at prices that make sense.
          </p>
        </div>
      </section>

      {/* Subscription Plan Cards */}
      <section className="py-16 md:py-24 bg-brand-black">
        <div className="container mx-auto px-4">
          <p className="text-center text-brand-white/70 mb-10 text-base">
            One-off car wash from <span className="text-brand-orange font-semibold">Rp 50.000</span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
            {plans.map((plan) => {
              const IconComponent = plan.icon;
              return (
                <Card key={plan.name} className={`flex flex-col shadow-xl rounded-lg overflow-hidden bg-brand-dark-gray ${plan.popular ? 'border-2 border-brand-orange relative' : 'border border-white/10'}`}>
                  {plan.popular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
                      <span className="px-4 py-1 bg-brand-orange text-brand-white text-xs font-semibold rounded-full uppercase tracking-wider">
                        MOST POPULAR
                      </span>
                    </div>
                  )}
                  <CardHeader className={`p-6 text-center ${plan.popular ? 'pt-10' : 'pt-6'}`}>
                    <div className="mb-4 flex justify-center">
                      <IconComponent className="h-10 w-10 text-brand-orange" />
                    </div>
                    <CardTitle className="text-2xl font-semibold text-brand-white mb-2 font-heading">{plan.name}</CardTitle>
                    <p className="text-4xl font-extrabold text-brand-white">
                      {plan.price}
                    </p>
                    <p className="text-sm text-brand-white/70 mt-1">/month &middot; {plan.frequency}</p>
                    <CardDescription className="text-sm text-brand-white/70 mt-3 min-h-[3em]">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 flex-grow">
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-5 w-5 text-brand-orange mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-brand-white/90">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="p-6 mt-auto">
                    <Button
                      size="lg"
                      className={`w-full font-semibold ${plan.variant === 'default' ? 'bg-brand-orange text-brand-white hover:bg-brand-orange/90' : 'bg-white/10 text-brand-white hover:bg-white/20 border border-white/10'}`}
                      asChild
                    >
                      <Link href={plan.ctaLink || '#'}>{plan.cta}</Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Detailing Packages */}
      <section className="py-16 md:py-24 bg-brand-dark-gray">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-semibold text-brand-white text-center mb-12 font-heading">
            Detailing Packages
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {detailingPackages.map((pkg) => (
              <Card key={pkg.name} className="flex flex-col shadow-xl rounded-lg overflow-hidden bg-brand-black border border-white/10">
                <CardHeader className="p-6 text-center">
                  <CardTitle className="text-2xl font-semibold text-brand-white mb-2 font-heading">{pkg.name}</CardTitle>
                  <p className="text-3xl font-extrabold text-brand-orange">{pkg.price}</p>
                  <p className="text-sm text-brand-white/70 mt-1">{pkg.duration}</p>
                </CardHeader>
                <CardContent className="p-6 pt-0 flex-grow">
                  <p className="text-sm text-brand-white/70 text-center">{pkg.description}</p>
                </CardContent>
                <CardFooter className="p-6 mt-auto">
                  <Button
                    size="lg"
                    className="w-full font-semibold bg-white/10 text-brand-white hover:bg-white/20 border border-white/10"
                    asChild
                  >
                    <Link href="/contact">Book Now</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Get Started Central CTA */}
      <section className="py-16 bg-brand-black text-center">
        <div className="container mx-auto px-4">
          <Button size="lg" className="bg-brand-orange text-black hover:bg-brand-orange/90 py-4 px-10 text-lg font-semibold rounded-none">
            Get Started with Castudio <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16 md:py-24 bg-brand-black">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-semibold text-brand-white text-center mb-12 font-heading">
            Compare Our Plans
          </h2>
          <div className="overflow-x-auto rounded-lg border border-white/10 shadow-lg">
            <table className="min-w-full divide-y divide-white/10 bg-brand-dark-gray">
              <thead className="bg-brand-black">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-brand-white uppercase tracking-wider sticky left-0 bg-brand-black z-10 font-heading">
                    Feature
                  </th>
                  {plans.map((plan) => (
                    <th key={plan.name} scope="col" className={`px-6 py-4 text-center text-sm font-semibold text-brand-white uppercase tracking-wider ${plan.popular ? 'bg-brand-orange/10' : ''} font-heading`}>
                      {plan.name}
                      {plan.popular && <div className="text-xs font-normal text-brand-orange normal-case">(Most Popular)</div>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {featureComparison.map((group) => (
                  <React.Fragment key={group.category}>
                    <tr>
                      <th colSpan={plans.length + 1} className="px-6 py-3 text-left text-sm font-semibold text-brand-white bg-brand-orange/20 tracking-wide sticky left-0 z-10 font-heading">
                        {group.category}
                      </th>
                    </tr>
                    {group.features.map((feature) => (
                      <tr key={feature.name} className="even:bg-brand-black/30 hover:bg-brand-orange/5">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-white/90 sticky left-0 bg-inherit z-0">{feature.name}</td>
                        {(['basic', 'regular', 'premium', 'unlimited'] as const).map(planKey => {
                          const value = feature[planKey as keyof typeof feature];
                          return (
                            <td key={`${feature.name}-${planKey}`} className="px-6 py-4 whitespace-nowrap text-sm text-brand-white/80 text-center">
                              {typeof value === 'boolean' ? (
                                value ? <Check className="h-5 w-5 text-brand-orange mx-auto" /> : <X className="h-5 w-5 text-red-500/70 mx-auto" />
                              ) : (
                                value || '—'
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Another "Get Started" Central CTA */}
      <section className="py-16 bg-brand-black text-center">
        <div className="container mx-auto px-4">
          <Button size="lg" className="bg-brand-orange text-black hover:bg-brand-orange/90 py-4 px-10 text-lg font-semibold rounded-none">
            Get Started with Castudio <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-brand-dark-gray">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-semibold text-brand-white text-center mb-12 font-heading">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem value={`item-${index + 1}`} key={index} className="border-b-white/10">
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
    </>
  );
}
