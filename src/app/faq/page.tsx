import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import { HelpCircle, DollarSign, CalendarCheck, ShieldCheck, Droplets, Paintbrush } from "lucide-react";
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
        q: "Do I need to provide anything?",
        a: "We just need access to a water source and a power outlet. We bring all the equipment, products, and microfiber towels needed for the job.",
      },
      {
        q: "Where do you operate?",
        a: "We serve Jakarta and surrounding areas. We use zone-based scheduling to keep service prompt and on time.",
      },
      {
        q: "Where can you wash my car?",
        a: "We work at houses, townhouses, and locations with access to a water source and power outlet. Covered parking is ideal but not required.",
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
        q: "What makes Castudio different?",
        a: "We use premium products, the correct equipment, and trained technicians who follow proper techniques on every car. We take our time and keep working until you are satisfied with the result.",
      },
      {
        q: "What payment methods do you accept?",
        a: "Bank transfer (BCA, Mandiri, BNI, BRI) and e-wallets (GoPay, OVO, DANA). For one-time bookings, you pay after the service is completed. For subscriptions, billing is every 4 months at the start of each cycle.",
      },
      {
        q: "Is there a cancellation fee?",
        a: "For one-time bookings, cancel at least 12 hours ahead and there is no fee. For subscriptions, we require 30 days notice to cancel.",
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
        q: "Do unused washes roll over?",
        a: "No. We encourage you to use all your included washes each billing period to keep your car in top condition.",
      },
      {
        q: "What is the Free Full Detail bonus?",
        a: "Elite subscribers receive 1 Free Full Detail per year (worth Rp 2,799,000). The Full Detail includes Interior Detailing, Exterior Detailing, Window Detailing, and Tire & Rims Detailing, approximately 8 hours of comprehensive work. Essentials and Plus subscribers do not receive the detailing bonus but can upgrade anytime.",
      },
      {
        q: "Can I use my subscription for multiple cars?",
        a: "Yes. You can use your subscription washes across different vehicles. Just let us know when you book each session.",
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
        a: "Premium car shampoos, glass cleaners, tar removers, clay bars, and sealant coatings. We never use dish soap, generic all-purpose cleaners, or reused rags. Every car gets fresh microfiber towels.",
      },
      {
        q: "Will a hand wash scratch my paint?",
        a: "Not when done correctly. We use proper wash techniques with grit guards, premium microfiber mitts, and the correct equipment. This is the same method professional detailers use worldwide. It is the improper techniques and dirty rags that cause scratches and swirl marks.",
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
        a: "Full foam pre-wash, hand wash with proper technique, interior clean and vacuum, tire polish, and body spot remover.",
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
        a: "Cars actually get dirtier in the rain. Acidic rainwater, road spray, and mud make it the best time to wash. We work in covered parking when possible.",
      },
    ],
  },
];

const detailingFAQs = [
  {
    sectionTitle: "Detailing",
    icon: Paintbrush,
    questions: [
      {
        q: "What is included in a Full Detail?",
        a: "A Full Detail includes all four detailing services: Interior Detailing, Exterior Detailing, Window Detailing, and Tire & Rims Detailing. It takes approximately 8 hours and costs Rp 2,799,000, saving you Rp 257,000 compared to booking each service individually.",
      },
      {
        q: "Can I book individual detailing services?",
        a: "Yes. You can book Interior Detailing (Rp 1,039,000), Exterior Detailing (Rp 1,039,000), Window Detailing (Rp 689,000), or Tire & Rims Detailing (Rp 289,000) individually.",
      },
      {
        q: "How often should I detail my car?",
        a: "We recommend a full detail every 3 to 6 months for most drivers. If you park outdoors, drive frequently in dusty or polluted areas, or simply want your car in showroom condition, every 2 to 3 months is ideal.",
      },
      {
        q: "Do subscribers get free detailing?",
        a: "Elite subscribers receive 1 Free Full Detail per year (worth Rp 2,799,000). Essentials and Plus subscribers do not receive the detailing bonus but can upgrade to Elite anytime.",
      },
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

export default function FAQPage() {
  return (
    <div className="bg-brand-black">
      {/* Hero */}
      <section className="w-full min-h-[75vh] flex items-center justify-center bg-brand-black text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up" delay={200}>
            <div className="text-center space-y-6 px-4">
              <h1 className="text-4xl md:text-6xl font-normal font-heading tracking-tight">
                Frequently Asked Questions
              </h1>
              <p className="text-lg md:text-xl text-white/70 font-light max-w-2xl mx-auto">
                Everything you need to know about our mobile car wash service across Jakarta and surrounding areas.
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
                  <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-white mb-4 font-heading">Book Your First Wash</h2>
                  <p className="text-white/60 text-lg md:text-xl max-w-xl mx-auto mb-6 sm:mb-8 md:mb-10">
                    Experience the Castudio difference. Premium products, trained technicians, and a result you can see and feel, at your doorstep.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    <Link
                      href="https://wa.me/62816104334?text=Halo%2C%20saya%20ingin%20booking%20cuci%20mobil."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium bg-brand-orange text-black hover:bg-brand-orange/90 h-11 py-3 px-12 text-base transition-colors"
                    >
                      WhatsApp Us
                    </Link>
                    <Link
                      href="/car-wash/subscriptions"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium border border-brand-orange text-brand-orange hover:bg-brand-orange/10 h-11 py-3 px-8 text-base transition-colors"
                    >
                      See Our Plans
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
