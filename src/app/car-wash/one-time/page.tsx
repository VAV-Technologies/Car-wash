import { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@/components/ui/fade-in";
import { cn } from "@/lib/utils";
import { Check, Sparkles, Droplets, ShieldCheck, MapPin, ArrowRight, Waves, Wind, CircleDot, Eraser, Wrench, GlassWater, Flame, Gem } from "lucide-react";

export const metadata: Metadata = {
  title: "Cuci Mobil Panggilan Premium | Castudio",
  description:
    "Premium mobile car wash delivered to your doorstep across JABODETABEK. Three service tiers from Rp 339,000. Professional products, two-bucket method, trained technicians.",
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const WA_BASE = "https://wa.me/62816104334";

const comparisonFeatures = [
  { label: "Foam Pre-Wash", icon: Waves, standard: true, professional: true, elite: true },
  { label: "Two-Bucket Hand Wash", icon: Droplets, standard: true, professional: true, elite: true },
  { label: "Interior Clean & Vacuum", icon: Wind, standard: true, professional: true, elite: true },
  { label: "Tire Polish & Rim Clean", icon: CircleDot, standard: true, professional: true, elite: true },
  { label: "Body Spot Remover", icon: Eraser, standard: true, professional: true, elite: true },
  { label: "Engine Bay Clean", icon: Wrench, standard: true, professional: true, elite: true },
  { label: "Glass Spot Remover", icon: GlassWater, standard: false, professional: true, elite: true },
  { label: "Tar Remover", icon: Flame, standard: false, professional: true, elite: true },
  { label: "Clay Bar Decontamination", icon: Gem, standard: false, professional: false, elite: true },
  { label: "Sealant Coating", icon: ShieldCheck, standard: false, professional: false, elite: true },
];

const processSteps = [
  {
    num: "01",
    title: "Foam Pre-Wash",
    body: "We start with a thick foam layer that loosens dirt, grime, and contaminants without touching the paint. This minimizes the risk of scratching from the very first step.",
  },
  {
    num: "02",
    title: "Two-Bucket Hand Wash",
    body: "Separate wash and rinse buckets with grit guards. Fresh microfiber mitt for each panel. pH-neutral shampoo that cleans without stripping wax or sealant. This is the technique that prevents swirl marks.",
  },
  {
    num: "03",
    title: "Interior Deep Clean",
    body: "Full vacuum of seats, carpets, and boot. Dashboard, console, and trim wipe-down. Door panels and jambs cleaned. Air vents blown out with compressed air.",
  },
  {
    num: "04",
    title: "Wheels, Tires & Engine Bay",
    body: "Dedicated wheel cleaner for brake dust and grime. Tire sidewalls scrubbed and dressed. Engine bay degreased and detailed — areas most washes skip entirely.",
  },
];

const differentiators = [
  {
    icon: Sparkles,
    title: "Premium Products Only",
    body: "Professional-grade chemicals and coatings from trusted brands — not diluted bulk chemicals from the nearest supplier.",
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
    body: "Home, office, apartment — we come to you across JABODETABEK. All equipment, water, and power included. You don\u2019t lift a finger.",
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function OneTimeWashPage() {
  return (
    <div className="bg-brand-black">
      {/* ── 1. Hero ──────────────────────────────────────────────── */}
      <section className="w-full min-h-[75vh] bg-brand-black flex items-center py-24 text-white section-lines-light">
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
            <p className="text-sm text-white/50">
              Want to save more?{" "}
              <Link href="/car-wash/subscriptions" className="text-brand-orange underline underline-offset-4 hover:text-brand-orange/80 transition-colors">
                Subscribe and get a free Full Detail too &rarr;
              </Link>
            </p>
          </FadeIn>
        </div>
      </section>

      {/* -- Separator -- */}
      <div className="border-t border-white/10" />

      {/* ── 2. How We Clean — Step-by-step process ──────────────── */}
      <section className="w-full py-20 md:py-24 bg-brand-dark-gray text-white section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="px-4 mb-12">
              <p className="text-sm uppercase tracking-wider text-brand-orange mb-3 font-heading">
                How We Clean
              </p>
              <h2 className="text-3xl md:text-4xl font-normal font-heading tracking-tight">
                Every detail, every time
              </h2>
            </div>
          </FadeIn>

          <div className="flex flex-col">
            {processSteps.map((step, index) => (
              <FadeIn key={step.num} delay={index * 100}>
                <div className={cn(
                  "border border-white/10 flex flex-col md:flex-row",
                  index > 0 && "border-t-0"
                )}>
                  <div className="hidden md:flex md:w-[15%] shrink-0 p-8 items-center justify-center">
                    <span className="text-5xl font-heading font-medium text-white/10 leading-none">
                      {step.num}
                    </span>
                  </div>
                  <div className="flex-1 p-6 sm:p-8 md:border-l border-white/10 flex items-center">
                    <div>
                      <span className="md:hidden text-2xl font-heading font-medium text-white/10 leading-none mb-2 block">
                        {step.num}
                      </span>
                      <h3 className="text-lg font-normal text-white font-heading mb-2">{step.title}</h3>
                      <p className="text-white/60 leading-relaxed">{step.body}</p>
                    </div>
                  </div>
                  <div className="md:w-[25%] h-40 md:h-auto border-t md:border-t-0 md:border-l border-white/10 relative overflow-hidden shrink-0 bg-brand-black flex items-center justify-center">
                    <span className="text-white/20 text-sm">[IMAGE: {step.title}]</span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* -- Separator -- */}
      <div className="border-t border-white/10" />

      {/* ── 3. Why We're Different ───────────────────────────────── */}
      <section className="w-full py-20 md:py-24 bg-brand-black text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-16 md:mb-20 px-4">
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

      {/* ── 4. Unified Comparison Table ────────────────────────────── */}
      <section className="w-full py-20 md:py-24 bg-brand-dark-gray text-white section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-12 px-4">
              <p className="text-sm uppercase tracking-wider text-brand-orange mb-3 font-heading">
                Pricing
              </p>
              <h2 className="text-3xl md:text-4xl font-normal font-heading tracking-tight">
                Three tiers. One standard: excellence.
              </h2>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={100}>
            <div className="border border-white/10">
              {/* Table header — tier names + prices */}
              <div className="flex">
                <div className="w-[28%] sm:w-[24%] shrink-0 p-4 sm:p-6 flex items-end border-b border-white/10">
                  <span className="text-xs uppercase tracking-wider text-white/40 font-heading">Feature</span>
                </div>
                {[
                  { name: "Standard", tagline: "The Thorough Clean", price: "Rp 339,000", duration: "~2 hrs" },
                  { name: "Professional", tagline: "The Deep Restoration", price: "Rp 569,000", duration: "~3 hrs" },
                  { name: "Elite", tagline: "The Full Transformation", price: "Rp 919,000", duration: "~4 hrs" },
                ].map((tier) => (
                  <div key={tier.name} className="flex-1 p-4 sm:p-6 text-center border-b border-l border-white/10">
                    <p className="text-base sm:text-lg font-heading text-white mb-0.5">{tier.name}</p>
                    <p className="text-xs text-brand-orange mb-1 hidden sm:block">{tier.tagline}</p>
                    <p className="text-lg sm:text-xl font-heading text-brand-orange">{tier.price}</p>
                    <p className="text-xs text-white/40 mt-0.5">{tier.duration}</p>
                  </div>
                ))}
              </div>

              {/* Image placeholder row */}
              <div className="flex border-t border-white/10">
                <div className="w-[28%] sm:w-[24%] shrink-0" />
                {["Standard", "Professional", "Elite"].map((name) => (
                  <div key={name} className="flex-1 h-40 sm:h-48 border-l border-white/10 bg-brand-black flex items-center justify-center">
                    <span className="text-white/20 text-sm">[IMAGE: {name}]</span>
                  </div>
                ))}
              </div>

              {/* Table rows — features with icons */}
              {comparisonFeatures.map((feature, index) => {
                const FeatureIcon = feature.icon;
                return (
                  <div key={feature.label} className={cn(
                    "flex border-t border-white/10",
                    index % 2 === 0 ? "bg-white/[0.02]" : ""
                  )}>
                    <div className="w-[28%] sm:w-[24%] shrink-0 p-4 sm:p-5 flex items-center gap-3">
                      <FeatureIcon className="h-4 w-4 text-white/40 shrink-0 hidden sm:block" strokeWidth={1.5} />
                      <span className="text-sm text-white/70">{feature.label}</span>
                    </div>
                    {[feature.standard, feature.professional, feature.elite].map((val, i) => (
                      <div key={i} className="flex-1 p-4 sm:p-5 flex items-center justify-center border-l border-white/10">
                        {val ? (
                          <Check className="h-4 w-4 text-brand-orange" strokeWidth={2.5} />
                        ) : (
                          <span className="text-white/20">&mdash;</span>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}

              {/* Book buttons row */}
              <div className="flex border-t border-white/10">
                <div className="w-[28%] sm:w-[24%] shrink-0 p-4 sm:p-6 flex items-center">
                  <span className="text-xs uppercase tracking-wider text-white/40 font-heading hidden sm:block">Book Now</span>
                </div>
                {[
                  { label: "Book Standard", href: `${WA_BASE}?text=Halo%2C%20saya%20ingin%20booking%20Standard%20Wash%20(Rp%20339.000).` },
                  { label: "Book Professional", href: `${WA_BASE}?text=Halo%2C%20saya%20ingin%20booking%20Professional%20Wash%20(Rp%20569.000).` },
                  { label: "Book Elite", href: `${WA_BASE}?text=Halo%2C%20saya%20ingin%20booking%20Elite%20Wash%20(Rp%20919.000).` },
                ].map((cta) => (
                  <div key={cta.label} className="flex-1 p-4 sm:p-6 flex items-center justify-center border-l border-white/10">
                    <Link
                      href={cta.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-xs sm:text-sm font-medium bg-brand-orange text-black hover:bg-brand-orange/90 h-9 sm:h-10 w-full max-w-[180px] transition-colors"
                    >
                      {cta.label}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={200}>
            <div className="border border-white/10 border-t-0 p-6 sm:p-8 text-center">
              <p className="text-white/50 text-sm">
                Not sure which to pick? Message us and we&rsquo;ll recommend the right service for your car.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* -- Separator -- */}
      <div className="border-t border-white/10" />

      {/* ── 5. CTA ───────────────────────────────────────────────── */}
      <section className="w-full py-12 bg-brand-black text-white section-lines-light">
        <div className="container mx-auto">
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

      {/* -- Separator -- */}
      <div className="border-t border-white/10" />

      {/* ── 6. Subscription Upsell ───────────────────────────────── */}
      <section className="w-full py-12 bg-brand-dark-gray section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="border border-white/10 p-6 md:p-8 text-center">
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
