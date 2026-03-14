
'use client'; 

// Force dynamic rendering due to client-side interactivity
export const dynamic = 'force-dynamic'

import * as React from "react"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, X, ArrowRight, Info, Phone, Newspaper } from "lucide-react";
import Link from "next/link";
import { NobridgeIcon, NobridgeIconType } from '@/components/ui/nobridge-icon';

const plans = [
  {
    name: "Free",
    price: "$0",
    priceDetails: "No Hidden Fees – Truly Free!",
    description: "Get a confidential business valuation and gauge buyer interest on Nobridge.",
    features: [
      "Data-driven valuation",
      "Anonymous Private Listing",
      "Buyer Interest Dashboard",
    ],
    cta: "Get Started Free",
    ctaLink: "/auth/register/seller", 
    variant: "secondary",
    icon: "calculator" as NobridgeIconType,
  },
  {
    name: "Lite",
    price: "$500",
    priceDetails: "/month + X% Success Fee",
    description: "Sell your business independently, with limited Nobridge advisor support.",
    features: [
      "Everything in Free, plus:",
      "Reconcile financials to tax returns",
      "Data Room + Action Items on platform",
      "Negotiation support",
    ],
    cta: "Choose Lite",
    ctaLink: "/auth/register/seller?plan=lite", 
    variant: "secondary",
    icon: "growth" as NobridgeIconType,
  },
  {
    name: "Pro",
    price: "$1,000",
    priceDetails: "/month + Y% Success Fee",
    description: "Get expert Nobridge guidance every step of the way.",
    features: [
      "Everything in Lite, plus:",
      "Nobridge support on listing materials",
      "Tailored strategic buyer outreach",
      "Hands-on advisor support",
    ],
    cta: "Choose Pro",
    ctaLink: "/auth/register/seller?plan=pro", 
    variant: "default",
    popular: true,
    icon: "featured" as NobridgeIconType,
  },
  {
    name: "Premium",
    price: "$2,000",
    priceDetails: "/month + Z% Success Fee",
    description: "Hands-on support with attention to every detail from Nobridge experts.",
    features: [
      "Everything in Pro, plus:",
      "Weekly check-ins with Nobridge advisor",
      "Complete recasting of financials",
      "Legal services covered (up to X hours)",
    ],
    cta: "Choose Premium",
    ctaLink: "/auth/register/seller?plan=premium", 
    variant: "secondary",
    icon: "investment" as NobridgeIconType,
  },
];

const featureComparison = [
  {
    category: "MONTHLY RETAINER",
    features: [
      { name: "Monthly Retainer Cost", free: "$0", lite: "$500", pro: "$1,000", premium: "$2,000" },
    ],
  },
  {
    category: "GENERAL",
    features: [
      { name: "Exclusive Listing Agreement", free: true, lite: true, pro: true, premium: true },
      { name: "Minimum Term", free: "None", lite: "6 Months", pro: "6 Months", premium: "6 Months" },
      { name: "Success Fee", free: "N/A", lite: "X%", pro: "Y%", premium: "Z%" },
      { name: "Minimum Annual Cash Flow", free: "Any", lite: "$50k+", pro: "$100k+", premium: "$250k+" },
    ],
  },
  {
    category: "PREP AND GO TO MARKET",
    features: [
      { name: "Business Valuation", free: true, lite: true, pro: true, premium: true },
      { name: "Valuation Review Call", free: false, lite: true, pro: true, premium: true },
      { name: "Go-To-Market Dashboard", free: true, lite: true, pro: true, premium: true },
      { name: "Reconcile Financials Pre-Listing", free: false, lite: true, pro: true, premium: true },
      { name: "Produce Marketing Materials", free: false, lite: false, pro: true, premium: true },
      { name: "Provide and Prepare Data Room", free: false, lite: true, pro: true, premium: true },
      { name: "Redact PII from Data Room Files", free: false, lite: false, pro: true, premium: true },
      { name: "Refresh Financials on Listing¹", free: "N/A", lite: "Quarterly", pro: "Monthly", premium: "Monthly" },
    ],
  },
  {
    category: "FIND THE RIGHT BUYER",
    features: [
      { name: "Listing on Nobridge Platform", free: true, lite: true, pro: true, premium: true },
      { name: "Buyer Interest Dashboard", free: true, lite: true, pro: true, premium: true },
      { name: "Market on 3rd Party Listing Site(s)", free: false, lite: false, pro: true, premium: true },
      { name: "Conduct Outreach to Strategic Buyers", free: false, lite: false, pro: true, premium: true },
      { name: "Participate in Buyer-Seller Meetings", free: false, lite: "Schedule Only", pro: true, premium: true },
      { name: "Advisor on Buyer-Seller Meetings", free: false, lite: false, pro: true, premium: true },
      { name: "Weekly Scheduled Calls with Advisor", free: false, lite: false, pro: false, premium: true },
    ],
  },
  {
    category: "ACCEPTING THE LOI AND CLOSING",
    features: [
      { name: "Negotiation Support for Owner", free: false, lite: true, pro: true, premium: true },
      { name: "Diligence & Closing Platform", free: false, lite: true, pro: true, premium: true },
      { name: "Diligence Check-Ins with Advisor", free: false, lite: false, pro: true, premium: true },
      { name: "Loan Services for Interested Buyers", free: "Referral", lite: "Referral", pro: true, premium: true },
      { name: "Recast Financials (if required)", free: false, lite: false, pro: false, premium: true },
      { name: "Owner Legal Services Covered²", free: "N/A", lite: "N/A", pro: "Up to X hours", premium: "Up to Y hours" },
    ],
  },
];

const faqs = [
  {
    question: "What size companies does Nobridge work with?",
    answer: "Nobridge specializes in Small to Medium Enterprises (SMEs) across Asia. While our 'Free' tier is open to all, our 'Lite', 'Pro', and 'Premium' plans are typically best suited for businesses with at least $50k in annual cash flow.",
  },
  {
    question: "What financials do I need to complete the free Nobridge valuation?",
    answer: "For the free valuation, you'll typically need to provide basic financial summaries like profit and loss statements for the last 2-3 years, and a current balance sheet. Our platform will guide you through the required inputs.",
  },
  {
    question: "How do I get my Nobridge valuation?",
    answer: "Once you sign up for any of our seller plans, including the 'Free' tier, you'll gain access to our data-driven valuation tool. You input your business's financial and operational data, and our system generates an estimated valuation range.",
  },
  {
    question: "What is your fee structure at Nobridge?",
    answer: "We offer a range of plans. Our 'Free' plan has no upfront costs. Our paid plans ('Lite', 'Pro', 'Premium') involve a monthly retainer and a success fee, which is a percentage of the final sale price, only payable if your business sells through Nobridge. Specific success fee percentages vary by plan.",
  },
  {
    question: "What happens to my retainer if my business doesn't sell on Nobridge?",
    answer: "The monthly retainer for our paid plans covers the ongoing services, support, and platform access provided by Nobridge to actively market your business. Retainers are typically non-refundable as they cover the work performed, regardless of a sale outcome within a specific timeframe.",
  },
  {
    question: "What if I sign with Nobridge and a buyer I am already speaking with becomes more serious?",
    answer: "Our exclusive listing agreement will have terms addressing pre-existing buyer discussions. Typically, buyers you were in active, documented negotiations with prior to signing with Nobridge may be excluded from the success fee, provided they are disclosed upfront.",
  },
];


export default function PricingPage() {
  return (
    <>
      {/* Introductory Section */}
      <section className="py-16 md:py-24 bg-brand-light-gray">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-sky-blue mb-3">PRICING PLANS FOR SELLERS</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-brand-dark-blue mb-6 font-heading">
            Select the Best Plan to Sell Your Business
          </h1>
          <p className="mt-4 text-lg md:text-xl text-brand-dark-blue/80 max-w-3xl mx-auto">
            Selling your business can feel overwhelming, so we&apos;ve designed plans to meet your needs – whether you want full-service support or a cost-effective way to explore the market with Nobridge.
          </p>
        </div>
      </section>

      {/* Pricing Plan Cards */}
      <section className="py-16 md:py-24 bg-brand-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
            {plans.map((plan) => (
              <Card key={plan.name} className={`flex flex-col shadow-xl rounded-lg overflow-hidden ${plan.popular ? 'border-2 border-brand-sky-blue relative' : 'border border-brand-light-gray/70'}`}>
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
                    <span className="px-4 py-1 bg-brand-sky-blue text-brand-white text-xs font-semibold rounded-full uppercase tracking-wider">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                <CardHeader className={`p-6 text-center ${plan.popular ? 'pt-10' : 'pt-6'}`}>
                  <div className="mb-4 flex justify-center">
                    <NobridgeIcon icon={plan.icon} size="xl" />
                  </div>
                  <CardTitle className="text-2xl font-semibold text-brand-dark-blue mb-2 font-heading">{plan.name}</CardTitle>
                  <p className="text-4xl font-extrabold text-brand-dark-blue">
                    {plan.price}
                    {(plan.price !== "$0" && plan.priceDetails) && <span className="text-base font-normal text-brand-dark-blue/70">{plan.priceDetails.replace('/month', '').replace('Success Fee','').trim()}</span>}
                  </p>
                  {plan.priceDetails && <p className="text-sm text-brand-dark-blue/70 mt-1">{plan.priceDetails.includes('/month') ? '/month' : ''} {plan.priceDetails.includes('Success Fee') ? `+ ${plan.priceDetails.split('+')[1].trim()}` : ''}</p>}
                  <CardDescription className="text-sm text-brand-dark-blue/70 mt-3 min-h-[3em]">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-6 flex-grow">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-brand-dark-blue/90">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="p-6 mt-auto">
                  <Button
                    size="lg"
                    className={`w-full font-semibold ${plan.variant === 'default' ? 'bg-brand-dark-blue text-brand-white hover:bg-brand-dark-blue/90' : 'bg-brand-sky-blue text-brand-white hover:bg-brand-sky-blue/90'}`}
                    asChild
                  >
                    <Link href={plan.ctaLink || '#'}>{plan.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Get Started Central CTA */}
      <section className="py-16 bg-brand-white text-center">
        <div className="container mx-auto px-4">
          <Button size="xl" className="bg-brand-dark-blue text-brand-white hover:bg-brand-dark-blue/90 py-4 px-10 text-lg font-semibold rounded-none">
            Get Started with Nobridge <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Detailed Feature Comparison Table */}
      <section className="py-16 md:py-24 bg-brand-light-gray">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-semibold text-brand-dark-blue text-center mb-12 font-heading">
            Compare Our Seller Plans
          </h2>
          <div className="overflow-x-auto rounded-lg border border-brand-light-gray/70 shadow-lg">
            <table className="min-w-full divide-y divide-brand-light-gray/70 bg-brand-white">
              <thead className="bg-brand-light-gray/50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-brand-dark-blue uppercase tracking-wider sticky left-0 bg-brand-light-gray/50 z-10 font-heading">
                    Feature
                  </th>
                  {plans.map((plan) => (
                    <th key={plan.name} scope="col" className={`px-6 py-4 text-center text-sm font-semibold text-brand-dark-blue uppercase tracking-wider ${plan.popular ? 'bg-brand-sky-blue/10' : ''} font-heading`}>
                      {plan.name}
                      {plan.popular && <div className="text-xs font-normal text-brand-sky-blue normal-case">(Most Popular)</div>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-light-gray/70">
                {featureComparison.map((group) => (
                  <React.Fragment key={group.category}>
                    <tr>
                      <th colSpan={plans.length + 1} className="px-6 py-3 text-left text-sm font-semibold text-brand-white bg-brand-dark-blue/90 tracking-wide sticky left-0 z-10 font-heading">
                        {group.category}
                      </th>
                    </tr>
                    {group.features.map((feature) => (
                      <tr key={feature.name} className="even:bg-brand-light-gray/30 hover:bg-brand-sky-blue/5">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-dark-blue/90 sticky left-0 bg-inherit z-0">{feature.name}</td>
                        {(['free', 'lite', 'pro', 'premium'] as const).map(planKey => {
                          const value = feature[planKey as keyof typeof feature];
                          return (
                            <td key={`${feature.name}-${planKey}`} className="px-6 py-4 whitespace-nowrap text-sm text-brand-dark-blue/80 text-center">
                              {typeof value === 'boolean' ? (
                                value ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-red-500 mx-auto" />
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
          <p className="text-xs text-brand-dark-blue/70 mt-4">
            ¹ Feature details: Refresh Financials on Listing is Quarterly for Pro, Monthly for Premium.
            <br />
            ² Feature details: Owner Legal Services Covered up to X hours for Pro, up to Y hours for Premium (specifics to be defined).
          </p>
        </div>
      </section>

      {/* Another "Get Started" Central CTA */}
      <section className="py-16 bg-brand-white text-center">
        <div className="container mx-auto px-4">
            <Button size="xl" className="bg-brand-dark-blue text-brand-white hover:bg-brand-dark-blue/90 py-4 px-10 text-lg font-semibold rounded-none">
             Get Started with Nobridge <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-brand-light-gray">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-semibold text-brand-dark-blue text-center mb-12 font-heading">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem value={`item-${index + 1}`} key={index} className="border-b-brand-light-gray/70">
                <AccordionTrigger className="py-5 text-left text-lg font-medium text-brand-dark-blue hover:text-brand-sky-blue hover:no-underline font-heading">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pt-0 pb-5 text-base text-brand-dark-blue/80">
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
