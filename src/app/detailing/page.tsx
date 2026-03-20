import { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@/components/ui/fade-in";
import { cn } from "@/lib/utils";
import { Check, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Auto Detailing Mobil di Rumah | Castudio",
  description:
    "Professional auto detailing delivered to your doorstep across Jakarta and surrounding areas. Interior, exterior, window, and tire & rims detailing. Full Detail package from Rp 2,799,000.",
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const WA_BASE = "https://wa.me/62816104334";

const services = [
  {
    name: "Interior Detailing",
    price: "Rp 1,039,000",
    duration: "~3 hours",
    bg: "bg-brand-black",
    description:
      "A deep restoration of your car\u2019s cabin. We clean every surface from headliner to floor mats. Upholstery extraction, dashboard conditioning, leather treatment, vent cleaning, and odour removal. Your interior will look and smell like the day you bought it.",
    includes: [
      "Deep vacuum of all surfaces including boot",
      "Upholstery and fabric extraction cleaning",
      "Leather cleaning and conditioning",
      "Dashboard, console, and trim UV-protection treatment",
      "Air vent and crevice detail with compressed air",
      "Odour neutralisation treatment",
    ],
    cta: "Book Interior Detailing",
    href: `${WA_BASE}?text=Halo%2C%20saya%20ingin%20booking%20Interior%20Detailing%20(Rp%201.039.000).`,
  },
  {
    name: "Exterior Detailing",
    price: "Rp 1,039,000",
    duration: "~3 hours",
    bg: "bg-brand-dark-gray",
    description:
      "Complete paint restoration and protection. We decontaminate, polish, and seal your exterior to remove swirl marks, restore gloss, and protect against UV, rain, and road grime. Your paint will look deep and glossy with a hydrophobic finish.",
    includes: [
      "Full foam pre-wash and decontamination wash",
      "Clay bar treatment to remove bonded contaminants",
      "Machine polish to remove swirl marks and light scratches",
      "Premium sealant coating application",
      "Trim and rubber restoration",
      "Door jamb and panel gap cleaning",
    ],
    cta: "Book Exterior Detailing",
    href: `${WA_BASE}?text=Halo%2C%20saya%20ingin%20booking%20Exterior%20Detailing%20(Rp%201.039.000).`,
  },
  {
    name: "Window Detailing",
    price: "Rp 689,000",
    duration: "~1 hour",
    bg: "bg-brand-black",
    description:
      "Crystal-clear windows inside and out. We remove water scale, mineral deposits, and film buildup that regular cleaning misses. Finished with a hydrophobic coating that repels rain for weeks.",
    includes: [
      "Interior glass deep clean (all windows and mirrors)",
      "Exterior water scale and mineral deposit removal",
      "Film and haze removal",
      "Hydrophobic glass coating application",
    ],
    cta: "Book Window Detailing",
    href: `${WA_BASE}?text=Halo%2C%20saya%20ingin%20booking%20Window%20Detailing%20(Rp%20689.000).`,
  },
  {
    name: "Tire & Rims Detailing",
    price: "Rp 289,000",
    duration: "~1 hour",
    bg: "bg-brand-dark-gray",
    description:
      "Deep cleaning and restoration for your wheels. We remove brake dust, road tar, and grime from rims, clean tire sidewalls, and apply a lasting dressing that protects and restores the deep black finish.",
    includes: [
      "Brake dust and iron fallout removal",
      "Tar and adhesive residue removal",
      "Rim deep clean and polish",
      "Tire sidewall cleaning and dressing",
    ],
    cta: "Book Tire & Rims Detailing",
    href: `${WA_BASE}?text=Halo%2C%20saya%20ingin%20booking%20Tire%20%26%20Rims%20Detailing%20(Rp%20289.000).`,
  },
];

const fullDetailIncludes = [
  "Interior Detailing: complete cabin deep clean and conditioning",
  "Exterior Detailing: paint correction, polish, and sealant",
  "Window Detailing: inside and out with hydrophobic coating",
  "Tire & Rims Detailing: deep clean, polish, and dressing",
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function DetailingPage() {
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
              Auto Detailing
            </p>
            <h1 className="text-4xl md:text-6xl font-normal font-heading tracking-tight">
              Deep restoration that goes far beyond a wash.
            </h1>
            <p className="text-lg md:text-xl text-white/70 font-light max-w-3xl mx-auto leading-relaxed">
              Professional detailing delivered to your doorstep. Choose individual services or get the Full Detail package for complete restoration.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* -- Separator -- */}
      <div className="border-t border-white/10" />

      {/* ── 2. Individual Services — Table Layout ──────────────── */}
      <section className="w-full py-20 md:py-24 bg-brand-dark-gray text-white section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="px-4 mb-12">
              <p className="text-sm uppercase tracking-wider text-brand-orange mb-3 font-heading">
                Individual Services
              </p>
              <h2 className="text-3xl md:text-4xl font-normal font-heading tracking-tight">
                Choose the service your car needs
              </h2>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={100}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-white/10">
              {services.map((service, i) => (
                <div
                  key={service.name}
                  className={cn(
                    "flex flex-col",
                    i > 0 && "border-t sm:border-t-0 sm:border-l border-white/10",
                    i === 2 && "sm:border-t lg:border-t-0"
                  )}
                >
                  {/* Image */}
                  <div className="h-48 bg-brand-black flex items-center justify-center border-b border-white/10">
                    <span className="text-white/20 text-sm">[IMAGE: {service.name}]</span>
                  </div>

                  {/* Content */}
                  <div className="p-5 sm:p-6 flex flex-col flex-grow">
                    <h3 className="text-lg font-heading text-white mb-1">{service.name}</h3>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-xl font-heading text-brand-orange">{service.price}</span>
                      <span className="text-xs text-white/40">{service.duration}</span>
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed mb-4 flex-grow">{service.description}</p>

                    {/* Includes */}
                    <ul className="space-y-2 mb-6">
                      {service.includes.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-white/70 text-xs">
                          <Check className="h-3.5 w-3.5 text-brand-orange shrink-0 mt-0.5" strokeWidth={2} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto">
                      <Link
                        href={service.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-xs sm:text-sm font-medium bg-brand-orange text-black hover:bg-brand-orange/90 h-10 w-full transition-colors"
                      >
                        {service.cta}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* -- OR Separator -- */}
      <div className="border-t border-white/10" />
      <section className="w-full py-8 bg-brand-black section-lines-light">
        <div className="container mx-auto">
          <div className="flex items-center gap-6">
            <div className="flex-1 border-t border-white/10" />
            <span className="text-white/40 text-sm font-heading uppercase tracking-widest">or</span>
            <div className="flex-1 border-t border-white/10" />
          </div>
        </div>
      </section>
      <div className="border-t border-white/10" />

      {/* ── 3. Full Detail Package (Featured) ────────────────────── */}
      <section className="w-full py-20 md:py-24 bg-brand-black text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="border-2 border-brand-orange p-8 md:p-12 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
                <span className="px-6 py-1.5 bg-brand-orange text-black text-xs font-semibold uppercase tracking-wider">
                  BEST VALUE
                </span>
              </div>

              <div className="text-center mb-10 pt-4">
                <h2 className="text-3xl md:text-4xl font-normal font-heading tracking-tight mb-3">
                  Full Detail Package
                </h2>
                <div className="flex items-baseline justify-center gap-4">
                  <span className="text-3xl md:text-4xl font-heading text-brand-orange">
                    Rp 2,799,000
                  </span>
                  <span className="text-sm text-white/50">~8 hours</span>
                </div>
                <p className="text-white/70 text-base mt-4 max-w-2xl mx-auto leading-relaxed">
                  All four detailing services in one comprehensive session.
                  Save Rp 257,000 compared to booking each service individually
                  (total individual price: Rp 3,056,000).
                </p>
              </div>

              <div className="border border-white/10 p-8 md:p-10 mb-8">
                <p className="text-xs uppercase tracking-wider text-white/50 mb-6 font-heading">
                  Everything Included
                </p>
                <ul className="space-y-4">
                  {fullDetailIncludes.map((item) => (
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

              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Link
                  href={`${WA_BASE}?text=Halo%2C%20saya%20ingin%20booking%20Full%20Detail%20Package%20(Rp%202.799.000).`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium bg-brand-orange text-black hover:bg-brand-orange/90 h-11 py-3 px-12 text-base transition-colors"
                >
                  Book Full Detail via WhatsApp
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* -- Separator -- */}
      <div className="border-t border-white/10" />

      {/* ── 4. Subscription Cross-Sell ────────────────────────────── */}
      <section className="w-full py-20 md:py-24 bg-brand-dark-gray text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="border border-white/10 p-8 md:p-12 text-center">
              <p className="text-sm uppercase tracking-wider text-brand-orange mb-3 font-heading">
                Subscriber Bonus
              </p>
              <h2 className="text-3xl md:text-4xl font-normal font-heading tracking-tight mb-4">
                Get Full Detailing for Free
              </h2>
              <p className="text-white/70 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
                Elite subscribers get 1 free Full Detail per year (worth
                Rp 2,799,000) on top of your regular washes. Subscribe to
                Elite to unlock this bonus.
              </p>
              <Link
                href="/car-wash/subscriptions"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium bg-brand-orange text-black hover:bg-brand-orange/90 h-11 py-3 px-10 text-base transition-colors"
              >
                See Subscription Plans <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
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
            <div className="border border-white/10">
              <div className="relative px-4 sm:px-8 md:px-16 py-16 md:py-20 text-center overflow-hidden bg-brand-dark-gray">
                <div className="relative z-10 flex flex-col items-center justify-center h-full">
                  <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-white mb-4 font-heading">Book Your First Wash</h2>
                  <p className="text-white/60 text-lg md:text-xl max-w-xl mx-auto mb-6 sm:mb-8 md:mb-10">
                    Experience the Castudio difference. Premium products, trained technicians, and a result you can see and feel, at your doorstep.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    <Link
                      href={`${WA_BASE}?text=Halo%2C%20saya%20ingin%20booking%20cuci%20mobil.`}
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
