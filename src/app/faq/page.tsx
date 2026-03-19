import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import { Droplets, Sparkles, DollarSign, Phone } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";

const aboutFAQs = [
  {
    sectionTitle: "About Castudio",
    icon: Droplets,
    questions: [
      {
        q: "What is Castudio?",
        a: "Castudio is a premium car wash and detailing studio in Indonesia. We combine meticulous hand-wash techniques with high-end detailing services to deliver showroom-quality results every time. Our mission is to set a new standard for vehicle care in Indonesia.",
      },
      {
        q: "What services do you offer?",
        a: "We offer a full range of car care services including express wash, full wash, interior deep clean, exterior polish, paint correction, ceramic coating, and premium detail packages. Whether you need a quick refresh or a complete restoration, we have a service tailored to your needs.",
      },
      {
        q: "What products do you use?",
        a: "We exclusively use premium, pH-balanced, paint-safe products from trusted international brands. Our shampoos, coatings, and polishes are carefully selected to clean effectively without stripping wax, damaging clear coat, or leaving residue. Every product we use is safe for all paint types and finishes.",
      },
      {
        q: "Where are you located?",
        a: "Our flagship studio is in Jakarta, with a second studio in Bandung. We are expanding to Surabaya soon. Each location features comfortable waiting areas, premium equipment, and trained detailing specialists.",
      },
      {
        q: "Do you offer mobile service?",
        a: "Yes, we offer mobile car wash and detailing for select services and subscription plans. Our mobile team brings the same premium products and attention to detail directly to your home or office. Mobile service availability depends on your location and the service requested.",
      },
    ],
  },
];

const washFAQs = [
  {
    sectionTitle: "Car Wash Services",
    icon: Droplets,
    questions: [
      {
        q: "How long does a wash take?",
        a: "Our Express Wash takes approximately 30 minutes and covers a thorough exterior hand wash, rinse, and dry. Our Full Wash takes around 45 minutes and includes exterior wash, tire and rim cleaning, window cleaning, and a quick interior wipe-down. Exact times may vary depending on vehicle size and condition.",
      },
      {
        q: "Is hand wash really better than automated?",
        a: "Yes. Automated car washes use spinning brushes and harsh chemicals that can cause swirl marks, micro-scratches, and paint damage over time. Our professional hand wash uses soft microfiber mitts, paint-safe shampoos, and the two-bucket method to minimize contact damage and preserve your paint's finish for years.",
      },
      {
        q: "Can I wait while my car is washed?",
        a: "Absolutely. All our studios feature comfortable waiting areas with complimentary Wi-Fi, refreshments, and charging stations. You can relax, work, or watch the team in action through our viewing windows. Many of our clients enjoy the experience as part of their routine.",
      },
      {
        q: "Do you wash motorcycles?",
        a: "We are currently focused exclusively on cars to ensure the highest quality of service. We want to perfect every aspect of car care before expanding to other vehicle types. Stay tuned for future updates as we grow our service offerings.",
      },
      {
        q: "What if it rains right after my wash?",
        a: "We offer a free re-wash within 24 hours if it rains after your service. Simply bring your car back to the same studio with your receipt, and we will wash it again at no charge. This guarantee applies to all wash packages.",
      },
      {
        q: "Do you clean the engine bay?",
        a: "Engine bay cleaning is available as an add-on service for any wash package, or it is included in our Premium Detail package. Our team uses specialized degreasers and protective dressings to safely clean and protect your engine bay without risking damage to electrical components.",
      },
    ],
  },
];

const detailingFAQs = [
  {
    sectionTitle: "Car Detailing",
    icon: Sparkles,
    questions: [
      {
        q: "What's the difference between a wash and detailing?",
        a: "A wash cleans the surface of your vehicle, removing dirt, dust, and grime. Detailing goes much deeper — it restores, corrects, and protects your vehicle inside and out. This includes paint correction to remove scratches and swirl marks, interior deep cleaning, leather conditioning, and applying protective coatings. Think of a wash as maintenance and detailing as restoration.",
      },
      {
        q: "How long does detailing take?",
        a: "Detailing typically takes between 2 and 8 hours depending on the package and the condition of your vehicle. A basic detail may take 2-3 hours, while a full correction and ceramic coating package can take a full day. We never rush the process — quality results require proper time and attention.",
      },
      {
        q: "How often should I detail my car?",
        a: "We recommend a full detail every 3 to 6 months depending on your driving conditions, parking situation, and how well the vehicle is maintained between details. Cars parked outdoors in Indonesia's tropical climate may benefit from more frequent detailing. Regular washes between details help extend the results.",
      },
      {
        q: "What is ceramic coating?",
        a: "Ceramic coating is a liquid polymer that chemically bonds to your vehicle's paint, creating a durable, hydrophobic layer of protection. It repels water, UV rays, bird droppings, tree sap, and other contaminants. A properly applied ceramic coating lasts 2 or more years and makes your car significantly easier to clean and maintain.",
      },
      {
        q: "Is ceramic coating worth it?",
        a: "Yes, especially in Indonesia's tropical climate where intense sun, heavy rain, and humidity take a constant toll on your paint. Ceramic coating provides long-lasting protection against UV damage, oxidation, water spots, and chemical staining. It also reduces the need for frequent polishing and keeps your car looking glossy with minimal effort.",
      },
    ],
  },
];

const pricingFAQs = [
  {
    sectionTitle: "Subscriptions & Pricing",
    icon: DollarSign,
    questions: [
      {
        q: "How do subscription plans work?",
        a: "Choose your preferred wash frequency — weekly, bi-weekly, or monthly — and pay a fixed monthly fee. Once subscribed, you can book your wash anytime through our website or WhatsApp. Subscriptions offer significant savings compared to individual washes and include priority booking.",
      },
      {
        q: "Is there a contract?",
        a: "No contracts and no commitments. All our subscription plans are month-to-month, and you can cancel anytime before your next billing cycle with no penalties or cancellation fees. We believe in earning your loyalty through quality, not locking you in.",
      },
      {
        q: "Can I upgrade or downgrade my plan?",
        a: "Yes, you can change your subscription plan at any time. Upgrades take effect immediately, and downgrades take effect at the start of your next billing cycle. Simply contact us via WhatsApp or email to make changes.",
      },
      {
        q: "Do subscribers get priority?",
        a: "Yes. Subscribers enjoy priority booking, shorter wait times, and exclusive perks such as complimentary interior wipe-downs and discounts on detailing services. Our subscription members are always first in line.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept bank transfer (BCA, Mandiri, BNI), all major credit and debit cards, and popular e-wallets including GoPay, OVO, Dana, and ShopeePay. For subscriptions, we set up automatic recurring payments for your convenience.",
      },
    ],
  },
];

const bookingFAQs = [
  {
    sectionTitle: "Booking & Support",
    icon: Phone,
    questions: [
      {
        q: "How do I book a service?",
        a: "You can book online at castudio.co, through WhatsApp, or by calling us directly. Simply choose your service, preferred date and time, and location. You will receive a confirmation with all the details. Walk-ins are also welcome, but booking in advance guarantees your spot.",
      },
      {
        q: "Can I cancel or reschedule?",
        a: "Yes, you can cancel or reschedule free of charge up to 2 hours before your appointment. Changes made less than 2 hours before your scheduled time may be subject to a small rescheduling fee. Contact us via WhatsApp or phone to make changes.",
      },
      {
        q: "What are your operating hours?",
        a: "We are open daily from 8am to 6pm, including weekends and most public holidays. Last wash appointments are accepted at 5pm for express wash and 4pm for full wash. Detailing appointments should be booked for morning slots to allow adequate time.",
      },
      {
        q: "Do you offer gift cards?",
        a: "Yes, we offer gift cards for any service or any custom amount. Gift cards are available for purchase online or at any of our studios. They make a perfect gift for car enthusiasts and can be used for any service we offer, including detailing packages and subscriptions.",
      },
      {
        q: "How do I contact support?",
        a: "You can reach our support team via WhatsApp, email at hello@castudio.co, or by phone at +62 816 10 4334 during business hours (8am-6pm daily). We aim to respond to all inquiries within a few hours during operating hours.",
      },
    ],
  },
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
                Common questions about our car wash services, detailing, subscriptions, and more.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* About FAQs */}
      <section className="w-full py-20 md:py-24 bg-brand-dark-gray/50 section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="flex items-center gap-4 mb-12 px-4">
              <Droplets className="h-8 w-8 text-brand-orange" />
              <div>
                <h2 className="text-2xl md:text-3xl font-normal text-white font-heading">
                  About Castudio
                </h2>
                <p className="text-white/60 mt-1">Who we are, what we do, and where to find us.</p>
              </div>
            </div>
          </FadeIn>

          <div className="space-y-12">
            {aboutFAQs.map((category) => (
              <FadeIn key={category.sectionTitle}>
                <div className="px-4">
                  <Accordion type="single" collapsible className="w-full space-y-3">
                    {category.questions.map((faq, index) => (
                      <AccordionItem
                        value={`about-${index}`}
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
            ))}
          </div>
        </div>
      </section>

      <div className="border-t border-white/10" />

      {/* Wash FAQs */}
      <section className="w-full py-20 md:py-24 bg-brand-dark-gray section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="flex items-center gap-4 mb-12 px-4">
              <Droplets className="h-8 w-8 text-brand-orange" />
              <div>
                <h2 className="text-2xl md:text-3xl font-normal text-white font-heading">
                  Car Wash Services
                </h2>
                <p className="text-white/60 mt-1">Everything about our wash process and options.</p>
              </div>
            </div>
          </FadeIn>

          <div className="space-y-12">
            {washFAQs.map((category) => (
              <FadeIn key={category.sectionTitle}>
                <div className="px-4">
                  <Accordion type="single" collapsible className="w-full space-y-3">
                    {category.questions.map((faq, index) => (
                      <AccordionItem
                        value={`wash-${index}`}
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
            ))}
          </div>
        </div>
      </section>

      <div className="border-t border-white/10" />

      {/* Detailing FAQs */}
      <section className="w-full py-20 md:py-24 bg-brand-dark-gray/50 section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="flex items-center gap-4 mb-12 px-4">
              <Sparkles className="h-8 w-8 text-brand-orange" />
              <div>
                <h2 className="text-2xl md:text-3xl font-normal text-white font-heading">
                  Car Detailing
                </h2>
                <p className="text-white/60 mt-1">Paint correction, ceramic coating, and full restoration.</p>
              </div>
            </div>
          </FadeIn>

          <div className="space-y-12">
            {detailingFAQs.map((category) => (
              <FadeIn key={category.sectionTitle}>
                <div className="px-4">
                  <Accordion type="single" collapsible className="w-full space-y-3">
                    {category.questions.map((faq, index) => (
                      <AccordionItem
                        value={`detailing-${index}`}
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
            ))}
          </div>
        </div>
      </section>

      <div className="border-t border-white/10" />

      {/* Pricing FAQs */}
      <section className="w-full py-20 md:py-24 bg-brand-dark-gray section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="flex items-center gap-4 mb-12 px-4">
              <DollarSign className="h-8 w-8 text-brand-orange" />
              <div>
                <h2 className="text-2xl md:text-3xl font-normal text-white font-heading">
                  Subscriptions & Pricing
                </h2>
                <p className="text-white/60 mt-1">Plans, payments, and how to save.</p>
              </div>
            </div>
          </FadeIn>

          <div className="space-y-12">
            {pricingFAQs.map((category) => (
              <FadeIn key={category.sectionTitle}>
                <div className="px-4">
                  <Accordion type="single" collapsible className="w-full space-y-3">
                    {category.questions.map((faq, index) => (
                      <AccordionItem
                        value={`pricing-${index}`}
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
            ))}
          </div>
        </div>
      </section>

      <div className="border-t border-white/10" />

      {/* Booking FAQs */}
      <section className="w-full py-20 md:py-24 bg-brand-dark-gray/50 section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="flex items-center gap-4 mb-12 px-4">
              <Phone className="h-8 w-8 text-brand-orange" />
              <div>
                <h2 className="text-2xl md:text-3xl font-normal text-white font-heading">
                  Booking & Support
                </h2>
                <p className="text-white/60 mt-1">How to book, reschedule, and get help.</p>
              </div>
            </div>
          </FadeIn>

          <div className="space-y-12">
            {bookingFAQs.map((category) => (
              <FadeIn key={category.sectionTitle}>
                <div className="px-4">
                  <Accordion type="single" collapsible className="w-full space-y-3">
                    {category.questions.map((faq, index) => (
                      <AccordionItem
                        value={`booking-${index}`}
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
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="border-t border-white/10" />
      <section className="w-full py-12 md:py-12 bg-brand-black section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="relative border border-white/10 bg-brand-dark-gray py-36 md:py-48 px-8 md:px-16 text-center overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-white mb-4 font-heading">
                  Still Have Questions?
                </h2>
                <p className="text-white/60 text-lg md:text-xl max-w-xl mx-auto mb-10 text-center">
                  Reach out to our team. We are happy to help with any questions about our services.
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium bg-brand-orange text-black hover:bg-brand-orange/90 h-11 py-3 px-12 text-base transition-colors"
                  >
                    Contact Us
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
