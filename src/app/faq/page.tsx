import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import { HelpCircle, DollarSign, CalendarCheck, ShieldCheck, Droplets } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";

const generalFAQs = [
  {
    sectionTitle: "General Questions",
    icon: HelpCircle,
    questions: [
      {
        q: "How do I book?",
        a: "Tap the WhatsApp button, tell us the service you want, your preferred date and time, and your location. We will confirm your booking within 30 minutes.",
      },
      {
        q: "Do I need to provide water or electricity?",
        a: "No. We bring our own 500-litre water tank, generator, and all equipment needed. If you have a garden hose available we appreciate it, but it is not required.",
      },
      {
        q: "Where do you operate?",
        a: "We serve all of JABODETABEK — Jakarta, Bogor, Depok, Tangerang, and Bekasi. We use zone-based scheduling to keep service prompt. Check our Coverage Area page for full details.",
      },
      {
        q: "Can you wash at my apartment or office parking?",
        a: "Yes. We regularly service apartment basements, office towers, and residential driveways. Anywhere we can safely access your vehicle.",
      },
      {
        q: "How long does each service take?",
        a: "Standard takes approximately 2 hours, Professional approximately 3 hours, and Elite approximately 4 hours.",
      },
    ],
  },
];

const pricingFAQs = [
  {
    sectionTitle: "Pricing & Payment",
    icon: DollarSign,
    questions: [
      {
        q: "Why are you more expensive than other car washes?",
        a: "We use premium, professional-grade products — never diluted. Our technicians follow the two-bucket method and spend 2 to 4 hours on every car. Trained staff, proper equipment, quality chemicals. You get what you pay for.",
      },
      {
        q: "What payment methods do you accept?",
        a: "Bank transfer (BCA, Mandiri, BNI, BRI) and e-wallets (GoPay, OVO, DANA). For one-time bookings, you pay after the service is completed. For subscriptions, billing is monthly at the start of each cycle.",
      },
      {
        q: "Is there a cancellation fee?",
        a: "For one-time bookings, cancel at least 12 hours ahead and there is no fee. For subscriptions, we require 30 days notice after the minimum commitment period. Early termination of a 6-month plan forfeits the bonus service.",
      },
    ],
  },
];

const subscriptionFAQs = [
  {
    sectionTitle: "Subscriptions",
    icon: CalendarCheck,
    questions: [
      {
        q: "Can I change my subscription tier?",
        a: "Yes. You can upgrade or downgrade at the next billing cycle. Just give us 7 days notice before your renewal date.",
      },
      {
        q: "Do unused washes roll over to the next month?",
        a: "No. Use all your sessions each month — your car will thank you.",
      },
      {
        q: "What is included in the 6-month bonus?",
        a: "A qualified mechanic visits your home for a 30-point inspection covering engine, brakes, battery, tires, fluids, suspension, lights, and belts — plus a full oil change (4 litres + filter). This service is worth Rp 400,000 to Rp 500,000.",
      },
      {
        q: "Can the Unlimited plan be used for multiple cars?",
        a: "No. Each Unlimited subscription is locked to one vehicle, identified by the license plate you register at signup. Add a separate subscription for each additional car.",
      },
    ],
  },
];

const qualityFAQs = [
  {
    sectionTitle: "Quality & Guarantees",
    icon: ShieldCheck,
    questions: [
      {
        q: "What if I am not satisfied with the result?",
        a: "We offer a satisfaction guarantee. Contact us within 24 hours and we will come back and redo the service free of charge.",
      },
      {
        q: "What products do you use?",
        a: "Professional-grade pH-neutral shampoos, glass cleaners, tar removers, clay bars, and sealant coatings. We never use dish soap, generic all-purpose cleaners, or reused rags. Every car gets fresh microfiber towels.",
      },
      {
        q: "Will a hand wash scratch my paint?",
        a: "We use the two-bucket method with grit guards, premium microfiber mitts, and proper washing technique. This is the same method professional detailers use worldwide. It is the single-bucket street washes with dirty rags that cause scratches and swirl marks.",
      },
    ],
  },
];

const serviceDetailFAQs = [
  {
    sectionTitle: "Service Details",
    icon: Droplets,
    questions: [
      {
        q: "What is included in the Standard wash?",
        a: "Full foam pre-wash, two-bucket hand wash, interior clean and vacuum, tire polish, body spot remover, and engine bay cleaning.",
      },
      {
        q: "What is the difference between Standard and Professional?",
        a: "Professional adds glass spot remover for water scale and tar remover for rough, contaminated paint. If your windshield is hazy or your paint feels rough to the touch, Professional is the right choice.",
      },
      {
        q: "What is the Elite service?",
        a: "Everything in Professional plus clay bar decontamination and a premium sealant coating that provides 4 to 8 weeks of hydrophobic protection. Think of it as a mini-detail.",
      },
      {
        q: "Do you wash motorcycles?",
        a: "Not currently. We are focused exclusively on cars to deliver the highest quality of service.",
      },
      {
        q: "What about rainy days?",
        a: "Cars actually get dirtier in the rain — acidic rainwater, road spray, and mud make it the best time to wash. We work in covered parking when possible.",
      },
    ],
  },
];

const allSections = [
  { data: generalFAQs, key: "general", bg: "bg-brand-dark-gray" },
  { data: pricingFAQs, key: "pricing", bg: "bg-brand-black" },
  { data: subscriptionFAQs, key: "subscriptions", bg: "bg-brand-dark-gray" },
  { data: qualityFAQs, key: "quality", bg: "bg-brand-black" },
  { data: serviceDetailFAQs, key: "details", bg: "bg-brand-dark-gray" },
];

export default function FAQPage() {
  return (
    <div className="bg-brand-black">
      {/* Hero */}
      <section className="w-full min-h-[50vh] flex items-center justify-center bg-brand-black text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up" delay={200}>
            <div className="text-center space-y-6 px-4">
              <h1 className="text-4xl md:text-6xl font-normal font-heading tracking-tight">
                Frequently Asked Questions
              </h1>
              <p className="text-lg md:text-xl text-white/70 font-light max-w-2xl mx-auto">
                Everything you need to know about our mobile car wash service across JABODETABEK.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {allSections.map((section, sectionIdx) => {
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
      <section className="w-full py-12 md:py-12 bg-brand-black section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="relative border border-white/10 bg-brand-dark-gray py-36 md:py-48 px-8 md:px-16 text-center overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-white mb-4 font-heading">
                  Still have questions? We&apos;re happy to help.
                </h2>
                <p className="text-white/60 text-lg md:text-xl max-w-xl mx-auto mb-10 text-center">
                  Reach out to our team on WhatsApp and we will get back to you quickly.
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                  <Link
                    href="https://wa.me/62816104334"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium bg-brand-orange text-black hover:bg-brand-orange/90 h-11 py-3 px-12 text-base transition-colors"
                  >
                    Message Us on WhatsApp
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
