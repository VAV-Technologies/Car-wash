import { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@/components/ui/fade-in";
import { cn } from "@/lib/utils";
import { Check, Sparkles, Droplets, ShieldCheck, MapPin, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Cuci Mobil Panggilan Premium | Castudio",
  description:
    "Premium mobile car wash delivered to your doorstep across JABODETABEK. Three service tiers from Rp 339,000. Professional products, two-bucket method, trained technicians.",
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const WA_BASE = "https://wa.me/62816104334";

const tiers = [
  {
    name: "Standard",
    tagline: "The Thorough Clean",
    price: "Rp 339,000",
    duration: "~2 hours",
    bg: "bg-brand-dark-gray",
    description:
      "Everything your car needs to look and feel fresh. Our Standard wash goes far beyond the typical street wash \u2014 we bring professional-grade foam wash, interior deep clean, engine bay attention, and spot treatment to your doorstep. This is our entry level, but there\u2019s nothing basic about it.",
    includes: [
      "Full foam pre-wash to loosen dirt and grime",
      "Two-bucket hand wash with premium pH-neutral shampoo",
      "Complete interior cleaning and vacuum",
      "Tire polish and rim cleaning",
      "Body spot remover (water spots, stains, encrusted marks)",
      "Engine bay cleaning",
    ],
    cta: "Book Standard Wash",
    href: `${WA_BASE}?text=Halo%2C%20saya%20ingin%20booking%20Standard%20Wash%20(Rp%20339.000).`,
  },
  {
    name: "Professional",
    tagline: "The Deep Restoration",
    price: "Rp 569,000",
    duration: "~3 hours",
    bg: "bg-brand-black",
    description:
      "Everything in Standard, plus specialized treatments for the two biggest enemies of cars in Jakarta: hard water scale on your windows and road tar on your paint. If your windshield looks hazy or your paint feels rough, this is your service.",
    includes: [
      "Everything in Standard",
      "Glass and window spot remover (water scale, mineral deposits)",
      "Tar remover treatment (asphalt, road tar, adhesive residue)",
    ],
    cta: "Book Professional Wash",
    href: `${WA_BASE}?text=Halo%2C%20saya%20ingin%20booking%20Professional%20Wash%20(Rp%20569.000).`,
  },
  {
    name: "Elite",
    tagline: "The Full Transformation",
    price: "Rp 919,000",
    duration: "~4 hours",
    bg: "bg-brand-dark-gray",
    description:
      "Our most comprehensive single-visit service. Everything in Professional, plus clay bar decontamination that makes your paint glass-smooth and a premium sealant coating that restores deep gloss and protects for 4\u20138 weeks. This is a mini-detail \u2014 your car will look like it just rolled off the showroom floor.",
    includes: [
      "Everything in Professional",
      "Full clay bar decontamination",
      "Premium sealant protection coating (4\u20138 week hydrophobic shield)",
    ],
    cta: "Book Elite Wash",
    href: `${WA_BASE}?text=Halo%2C%20saya%20ingin%20booking%20Elite%20Wash%20(Rp%20919.000).`,
  },
] as const;

const comparisonFeatures = [
  { label: "Foam Pre-Wash", standard: true, professional: true, elite: true },
  { label: "Hand Wash (Two-Bucket)", standard: true, professional: true, elite: true },
  { label: "Interior Clean & Vacuum", standard: true, professional: true, elite: true },
  { label: "Tire Polish & Rim Clean", standard: true, professional: true, elite: true },
  { label: "Body Spot Remover", standard: true, professional: true, elite: true },
  { label: "Engine Bay Clean", standard: true, professional: true, elite: true },
  { label: "Glass Spot Remover", standard: false, professional: true, elite: true },
  { label: "Tar Remover", standard: false, professional: true, elite: true },
  { label: "Clay Bar Decontamination", standard: false, professional: false, elite: true },
  { label: "Sealant Coating", standard: false, professional: false, elite: true },
];

const differentiators = [
  {
    icon: Sparkles,
    title: "Premium Products Only",
    body: "Professional-grade chemicals and coatings from trusted brands \u2014 not diluted bulk chemicals from the nearest supplier.",
  },
  {
    icon: Droplets,
    title: "Two-Bucket Method",
    body: "Separate wash and rinse buckets with grit guards on every job. This prevents swirl marks and paint damage that single-bucket washes cause.",
  },
  {
    icon: ShieldCheck,
    title: "Trained Technicians",
    body: "Every technician is trained on proper wash technique, paint decontamination, and sealant application before they touch your car.",
  },
  {
    icon: MapPin,
    title: "Total Convenience",
    body: "Home, office, apartment \u2014 we come to you across JABODETABEK. All equipment, water, and power included. You don\u2019t lift a finger.",
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function OneTimeWashPage() {
  return (
    <div className="bg-brand-black">
      {/* ── Subscription Upsell Banner (Above) ───────────────────── */}
      <section className="w-full bg-brand-dark-gray py-6 border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="border border-brand-orange/30 bg-brand-orange/5 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-white font-heading text-base font-medium">
                Want to save more? Subscribe and get a free Full Detail too.
              </p>
              <p className="text-white/60 text-sm mt-1">
                Plus and Unlimited subscribers save up to 63% and get a free Full Detail worth Rp 2,799,000.
              </p>
            </div>
            <Link
              href="/car-wash/subscriptions"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium border border-brand-orange text-brand-orange hover:bg-brand-orange/10 h-10 px-6 transition-colors shrink-0"
            >
              See Subscription Plans <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 1. Hero ──────────────────────────────────────────────── */}
      <section className="w-full min-h-[60vh] bg-brand-black flex items-center py-24 text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn
            direction="up"
            delay={200}
            className="text-center space-y-6 px-4 max-w-4xl mx-auto"
          >
            <p className="text-sm uppercase tracking-wider text-brand-orange font-heading">
              One-Time Wash Services
            </p>
            <h1 className="text-4xl md:text-6xl font-normal font-heading tracking-tight">
              No commitment. No subscription. Just book, and we&rsquo;ll make
              your car shine.
            </h1>
            <p className="text-lg md:text-xl text-white/70 font-light max-w-3xl mx-auto leading-relaxed">
              Choose the level of care your car needs. Every tier uses premium
              products, proper technique, and dedicated microfiber &mdash;
              delivered to your doorstep.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* -- Separator -- */}
      <div className="border-t border-white/10" />

      {/* ── 2. Service Tier Sections ─────────────────────────────── */}
      {tiers.map((tier, tierIndex) => (
        <div key={tier.name}>
          <section
            className={cn(
              "w-full py-20 md:py-24 text-white section-lines-light",
              tier.bg
            )}
          >
            <div className="container mx-auto">
              <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 px-4">
                {/* Left column — info */}
                <FadeIn direction="up" delay={100} className="lg:w-1/2">
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm uppercase tracking-wider text-brand-orange font-heading mb-3">
                        {tier.tagline}
                      </p>
                      <h2 className="text-3xl md:text-4xl font-normal font-heading tracking-tight mb-1">
                        {tier.name}
                      </h2>
                      <div className="flex items-baseline gap-4 mt-3">
                        <span className="text-2xl md:text-3xl font-heading text-brand-orange">
                          {tier.price}
                        </span>
                        <span className="text-sm text-white/50">
                          {tier.duration}
                        </span>
                      </div>
                    </div>

                    <p className="text-white/70 leading-relaxed text-base md:text-lg">
                      {tier.description}
                    </p>

                    <Link
                      href={tier.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium bg-brand-orange text-black hover:bg-brand-orange/90 h-11 py-3 px-10 text-base transition-colors"
                    >
                      {tier.cta}
                    </Link>
                  </div>
                </FadeIn>

                {/* Right column — includes list */}
                <FadeIn direction="up" delay={250} className="lg:w-1/2">
                  <div className="border border-white/10 p-8 md:p-10 h-full">
                    <p className="text-xs uppercase tracking-wider text-white/50 mb-6 font-heading">
                      What&rsquo;s Included
                    </p>
                    <ul className="space-y-4">
                      {tier.includes.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-3 text-white/80"
                        >
                          <Check
                            className="h-5 w-5 text-brand-orange shrink-0 mt-0.5"
                            strokeWidth={2}
                          />
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </FadeIn>
              </div>
            </div>
          </section>

          {/* Separator between tiers */}
          {tierIndex < tiers.length - 1 && (
            <div className="border-t border-white/10" />
          )}
        </div>
      ))}

      {/* -- Separator -- */}
      <div className="border-t border-white/10" />

      {/* ── 3. Comparison Table ──────────────────────────────────── */}
      <section className="w-full py-20 md:py-24 bg-brand-black text-white section-lines-light">
        <div className="container mx-auto px-4">
          <FadeIn direction="up">
            <div className="mb-12">
              <p className="text-sm uppercase tracking-wider text-brand-orange mb-3 font-heading">
                Compare Tiers
              </p>
              <h2 className="text-3xl md:text-4xl font-normal font-heading tracking-tight">
                Side-by-side comparison
              </h2>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={150}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 pr-4 text-sm text-white/50 font-normal">
                      Feature
                    </th>
                    <th className="text-center py-4 px-4 font-heading text-sm">
                      Standard
                      <span className="block text-xs text-white/40 font-normal mt-0.5">
                        Rp 339,000
                      </span>
                    </th>
                    <th className="text-center py-4 px-4 font-heading text-sm">
                      Professional
                      <span className="block text-xs text-white/40 font-normal mt-0.5">
                        Rp 569,000
                      </span>
                    </th>
                    <th className="text-center py-4 px-4 font-heading text-sm">
                      Elite
                      <span className="block text-xs text-white/40 font-normal mt-0.5">
                        Rp 919,000
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, index) => (
                    <tr
                      key={feature.label}
                      className={cn(
                        "border-b border-white/5",
                        index % 2 === 0 ? "bg-white/[0.02]" : ""
                      )}
                    >
                      <td className="py-3.5 pr-4 text-sm text-white/70">
                        {feature.label}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {feature.standard ? (
                          <Check className="h-4 w-4 text-brand-orange mx-auto" strokeWidth={2.5} />
                        ) : (
                          <span className="text-white/20">&mdash;</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {feature.professional ? (
                          <Check className="h-4 w-4 text-brand-orange mx-auto" strokeWidth={2.5} />
                        ) : (
                          <span className="text-white/20">&mdash;</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {feature.elite ? (
                          <Check className="h-4 w-4 text-brand-orange mx-auto" strokeWidth={2.5} />
                        ) : (
                          <span className="text-white/20">&mdash;</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-white/50 text-sm mt-8 text-center">
              Not sure which to pick? Message us and we&rsquo;ll recommend the
              right service for your car.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* -- Separator -- */}
      <div className="border-t border-white/10" />

      {/* ── 4. Why We're Different ───────────────────────────────── */}
      <section className="w-full py-20 md:py-24 bg-brand-dark-gray text-white section-lines-light">
        <div className="container mx-auto px-4">
          <FadeIn direction="up">
            <div className="text-center mb-16 md:mb-20">
              <p className="text-sm uppercase tracking-wider text-brand-orange mb-3 font-heading">
                Why We&rsquo;re Different
              </p>
              <h2 className="text-3xl md:text-4xl font-normal font-heading tracking-tight">
                Not your average car wash
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 border border-white/10">
            {differentiators.map((card, index) => (
              <FadeIn key={card.title} delay={(index + 1) * 100}>
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

      {/* ── 5. CTA ───────────────────────────────────────────────── */}
      <section className="w-full py-20 md:py-24 bg-brand-black text-white section-lines-light">
        <div className="container mx-auto px-4">
          <FadeIn direction="up">
            <div className="border border-white/10 px-6 sm:px-10 md:px-16 py-16 md:py-20 text-center">
              <h2 className="text-3xl md:text-4xl font-normal font-heading tracking-tight mb-4">
                Ready to book?
              </h2>
              <p className="text-white/60 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
                Pick your service tier and send us a message. We&rsquo;ll
                confirm your booking and bring everything to your doorstep.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Link
                  href={`${WA_BASE}?text=Halo%2C%20saya%20ingin%20booking%20cuci%20mobil.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium bg-brand-orange text-black hover:bg-brand-orange/90 h-11 py-3 px-12 text-base transition-colors"
                >
                  Book via WhatsApp
                </Link>
                <Link
                  href="/car-wash/subscriptions"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium border border-brand-orange text-brand-orange hover:bg-brand-orange/10 h-11 py-3 px-8 text-base transition-colors"
                >
                  See Subscription Plans
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Subscription Upsell Banner (Below) ───────────────────── */}
      <div className="border-t border-white/10" />
      <section className="w-full bg-brand-dark-gray py-10">
        <div className="container mx-auto px-4">
          <FadeIn direction="up">
            <div className="border border-brand-orange/30 bg-brand-orange/5 p-6 md:p-8 text-center">
              <h3 className="text-xl font-heading text-white mb-2">
                Wash regularly? Subscribe and save.
              </h3>
              <p className="text-white/60 text-sm max-w-2xl mx-auto mb-6">
                A Standard wash costs Rp 339,000. With an Essentials subscription (2 washes/month at Rp 609,000), your effective price drops to Rp 304,500/wash &mdash; that&rsquo;s a 10% saving. Plus and Unlimited subscribers save even more, and get a free Full Detail worth Rp 2,799,000.
              </p>
              <Link
                href="/car-wash/subscriptions"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium bg-brand-orange text-black hover:bg-brand-orange/90 h-11 py-3 px-10 text-base transition-colors"
              >
                View Subscription Plans <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
