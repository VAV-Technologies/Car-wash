import Image from "next/image";
import Link from "next/link";
import { FadeIn } from "@/components/ui/fade-in";
import { cn } from "@/lib/utils";

const differentiators = [
  {
    num: "01",
    title: "Premium Products Only",
    body: "We use professional-grade shampoos, sealants, and coatings \u2014 not diluted bulk chemicals. Your car gets what it deserves.",
  },
  {
    num: "02",
    title: "The Two-Bucket Method",
    body: "Separate wash and rinse buckets with grit guards. This prevents swirl marks and scratches that 90% of car washes cause.",
  },
  {
    num: "03",
    title: "Trained Technicians",
    body: "Our team is trained on proper wash technique, paint decontamination, and sealant application. They\u2019re not just washing \u2014 they\u2019re caring for your paint.",
  },
  {
    num: "04",
    title: "Total Convenience",
    body: "We come to you. Home, office, apartment parking \u2014 wherever your car is. All equipment, water, and power come with us.",
  },
];

const team = [
  {
    name: "The Founder",
    role: "Vision & Operations",
    bio: "Started Castudio because Jakarta\u2019s 4.35 million car owners deserve premium care without the hassle. Oversees service quality, product selection, and business growth.",
    tags: ["Strategy", "Operations", "Product Quality", "Growth"],
    image: "",
  },
  {
    name: "Wash Technicians",
    role: "Professional Car Care",
    bio: "Trained on the two-bucket method, paint-safe products, and proper technique. Uniformed, punctual, and held to quality standards that most shops never reach.",
    tags: ["Two-Bucket Method", "Paint Care", "Interior Clean", "Quality Check"],
    image: "",
  },
  {
    name: "Mobile Operations",
    role: "Logistics & Scheduling",
    bio: "Manages the zone-based scheduling system across JABODETABEK. Ensures every appointment runs on time with full equipment \u2014 500L water tank, generator, and all supplies onboard.",
    tags: ["Scheduling", "Logistics", "Fleet", "Zone Management"],
    image: "",
  },
];

const steps = [
  {
    num: "01",
    title: "We bring everything to you",
    body: "500L water tank, generator, pressure washer, vacuum, all chemicals and microfiber. No water or power needed from you.",
  },
  {
    num: "02",
    title: "We use the right products",
    body: "Professional-grade pH-neutral shampoos, dedicated glass cleaners, tar removers, clay bars, and sealant coatings. Never dish soap or diluted bulk chemicals.",
  },
  {
    num: "03",
    title: "We follow proper technique",
    body: "Two-bucket method with grit guards, fresh microfiber for each section, systematic process from foam pre-wash to final wipe.",
  },
  {
    num: "04",
    title: "We don\u2019t rush",
    body: "Standard takes 2 hours, Professional 3, Elite 4. Quality takes time. We\u2019d rather do fewer cars right than more cars wrong.",
  },
];

const pricingBullets = [
  "No budget tier \u2014 Standard is our minimum",
  "Premium products cost more but protect your paint",
  "Trained technicians cost more but deliver better results",
  "Two-bucket method takes longer but prevents damage",
  "At-home convenience saves you hours",
  "Quality you can see and feel every single time",
];

const zones = [
  { day: "Monday", zone: "South", areas: "Jaksel, Depok, Cinere, Pondok Indah" },
  { day: "Tuesday", zone: "West", areas: "Jakbar, Tangerang, BSD, Alam Sutera" },
  { day: "Wednesday", zone: "Central/North", areas: "Jakpus, Jakut, Kelapa Gading" },
  { day: "Thursday", zone: "East", areas: "Bekasi, Jaktim, Cibubur" },
  { day: "Friday", zone: "Flex", areas: "All areas, priority for Elite + subscribers" },
  { day: "Saturday", zone: "Premium", areas: "Half-day Elite and overflow" },
];

export default function AboutPage() {
  return (
    <div className="bg-brand-black">
      {/* -- 1. Hero -- */}
      <section className="w-full min-h-[60vh] bg-brand-black flex items-center py-24 text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up" delay={200} className="text-center space-y-6 px-4 max-w-4xl mx-auto">
            <p className="text-sm uppercase tracking-wider text-brand-orange font-heading">
              About Castudio
            </p>
            <h1 className="text-4xl md:text-6xl font-normal font-heading tracking-tight text-white">
              We Started Because Jakarta Deserves Better Car Care
            </h1>
            <p className="text-lg md:text-xl text-white/70 font-light max-w-3xl mx-auto leading-relaxed">
              We&apos;re car people. We know the frustration of sitting in Jakarta traffic for 45 minutes just to get a mediocre wash at a dirty roadside shop.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* -- Separator -- */}
      <div className="border-t border-white/10" />

      {/* -- 2. Our Story -- */}
      <section className="w-full py-20 md:py-24 bg-brand-dark-gray section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="mb-12 px-4">
              <p className="text-sm uppercase tracking-wider text-brand-orange mb-3 font-heading">
                Our Story
              </p>
              <h2 className="text-3xl md:text-4xl font-normal text-white font-heading tracking-tight">
                We know there&apos;s a better way
              </h2>
            </div>
          </FadeIn>

          <div className="flex flex-col lg:flex-row">
            {/* Left column: paragraphs */}
            <FadeIn delay={100} className="flex-1">
              <div className="border border-white/10 p-8 md:p-10 h-full space-y-6">
                <p className="text-white/60 leading-relaxed">
                  We&apos;re car people. We know the frustration of sitting in Jakarta traffic for 45 minutes just to get a mediocre wash at a dirty roadside shop. We know the anxiety of handing your car to someone who uses the same rag on every vehicle. We know there&apos;s a better way.
                </p>
                <p className="text-white/60 leading-relaxed">
                  We bring professional-grade car care to your doorstep. No cutting corners. No generic products. No rushed jobs. Every wash uses premium products, the proper two-bucket method, and dedicated microfiber for each section of your car. Our technicians are trained, uniformed, and held to a quality standard that most shops never reach.
                </p>
                <p className="text-white/60 leading-relaxed">
                  We&apos;re not the cheapest. We don&apos;t want to be. We&apos;re for the car owner who values their time and their vehicle &mdash; and refuses to settle for a street-level wash. If that sounds like you, welcome home.
                </p>
              </div>
            </FadeIn>

            {/* Right column: pull quote + metrics */}
            <FadeIn delay={200} className="flex-1">
              <div className="border border-white/10 border-t-0 lg:border-t lg:border-l-0 p-8 md:p-10 h-full flex flex-col justify-between">
                {/* Pull quote */}
                <div className="border-l-2 border-brand-orange pl-6 mb-8">
                  <p className="text-xl md:text-2xl font-heading text-white leading-snug mb-3">
                    &ldquo;We&apos;re for the car owner who values their time and their vehicle &mdash; and refuses to settle.&rdquo;
                  </p>
                </div>

                {/* 2x2 metrics grid */}
                <div className="grid grid-cols-2">
                  {[
                    { value: "339K", label: "Starting price" },
                    { value: "JABODETABEK", label: "Service area" },
                    { value: "15%", label: "Above market leader" },
                    { value: "Premium", label: "Products only" },
                  ].map((metric, index) => (
                    <div
                      key={metric.value}
                      className={cn(
                        "border border-white/10 p-5 text-center",
                        index === 1 && "border-l-0",
                        index === 2 && "border-t-0",
                        index === 3 && "border-t-0 border-l-0"
                      )}
                    >
                      <p className="text-2xl md:text-3xl font-heading text-white mb-1">{metric.value}</p>
                      <p className="text-xs text-white/60">{metric.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* -- Separator -- */}
      <div className="border-t border-white/10" />

      {/* -- 3. Why We're Different -- */}
      <section className="w-full py-20 md:py-24 bg-brand-black section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="mb-12 px-4">
              <p className="text-sm uppercase tracking-wider text-brand-orange mb-3 font-heading">
                Why We&apos;re Different
              </p>
              <h2 className="text-3xl md:text-4xl font-normal text-white font-heading tracking-tight mb-4">
                The standards we hold ourselves to
              </h2>
            </div>
          </FadeIn>

          {/* Row 1: cards 01-02 */}
          <div className="flex flex-col md:flex-row">
            {differentiators.slice(0, 2).map((card, index) => (
              <FadeIn key={card.num} delay={index * 100} className="flex-1">
                <div className={cn(
                  "border border-white/10 bg-brand-dark-gray p-8 h-full flex flex-col",
                  index > 0 && "border-t-0 md:border-t md:border-l-0"
                )}>
                  <span className="text-sm font-heading text-brand-orange mb-4">{card.num}</span>
                  <h4 className="text-lg font-medium text-white mb-2">{card.title}</h4>
                  <p className="text-white/60 leading-relaxed">{card.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Row 2: cards 03-04 */}
          <div className="flex flex-col md:flex-row">
            {differentiators.slice(2, 4).map((card, index) => (
              <FadeIn key={card.num} delay={(index + 2) * 100} className="flex-1">
                <div className={cn(
                  "border border-white/10 bg-brand-dark-gray border-t-0 p-8 h-full flex flex-col",
                  index > 0 && "md:border-l-0"
                )}>
                  <span className="text-sm font-heading text-brand-orange mb-4">{card.num}</span>
                  <h4 className="text-lg font-medium text-white mb-2">{card.title}</h4>
                  <p className="text-white/60 leading-relaxed">{card.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* -- Separator -- */}
      <div className="border-t border-white/10" />

      {/* -- 4. The Team -- */}
      <section className="w-full py-20 md:py-24 bg-brand-dark-gray text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="text-center space-y-4 mb-16 px-4">
              <p className="text-sm uppercase tracking-wider text-brand-orange font-heading">
                The Team
              </p>
              <h2 className="text-3xl md:text-4xl font-normal font-heading tracking-tight text-white">
                People who care about your car
              </h2>
              <p className="text-lg text-white/70 max-w-3xl mx-auto leading-relaxed">
                From our founder to our mobile operations crew, everyone at Castudio shares the same obsession with quality.
              </p>
            </div>
          </FadeIn>

          <div className="flex flex-col md:flex-row">
            {team.map((member, index) => (
              <FadeIn key={member.name} delay={index * 100} className="flex-1">
                <div className={cn(
                  "border border-white/15 h-full flex flex-col",
                  index > 0 && "border-t-0 md:border-t md:border-l-0"
                )}>
                  <div className="aspect-[3/2.5] relative overflow-hidden bg-brand-dark-gray flex items-center justify-center">
                    <p className="text-white/20 text-sm uppercase tracking-wider font-heading">{member.name}</p>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <h4 className="text-lg font-heading text-white">{member.name}</h4>
                    <p className="text-sm text-brand-orange mb-3">{member.role}</p>
                    <p className="text-white/70 text-sm leading-relaxed mb-4 flex-grow">{member.bio}</p>
                    <div className="border-t border-white/15 pt-4 flex flex-wrap gap-2">
                      {member.tags.map((tag) => (
                        <span key={tag} className="text-xs px-3 py-1 border border-white/15 text-white/70">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* -- Separator -- */}
      <div className="border-t border-white/10" />

      {/* -- 5. Our Approach -- */}
      <section className="w-full py-20 md:py-24 bg-brand-black section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="mb-12 px-4">
              <p className="text-sm uppercase tracking-wider text-brand-orange mb-3 font-heading">
                Our Approach
              </p>
              <h2 className="text-3xl md:text-4xl font-normal text-white font-heading tracking-tight">
                How we deliver consistent quality
              </h2>
            </div>
          </FadeIn>

          <div className="flex flex-col lg:flex-row gap-0">
            {/* Left: Steps */}
            <div className="flex-1">
              {steps.map((step, index) => (
                <FadeIn key={step.num} delay={index * 100}>
                  <div className={cn(
                    "border border-white/10 p-8 md:p-10 flex items-start gap-8",
                    index > 0 && "border-t-0"
                  )}>
                    <span className="text-5xl md:text-6xl font-heading font-medium text-white/10 leading-none shrink-0">
                      {step.num}
                    </span>
                    <div>
                      <h3 className="text-lg font-normal text-white font-heading mb-2">{step.title}</h3>
                      <p className="text-white/60 leading-relaxed">{step.body}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>

            {/* Right: Sticky Pricing Philosophy card */}
            <FadeIn delay={200} className="lg:w-[400px] xl:w-[440px]">
              <div className="border border-white/10 border-t-0 lg:border-t lg:border-l-0 bg-brand-dark-gray text-white p-8 md:p-10 sticky top-24 h-fit">
                <p className="text-sm uppercase tracking-wider text-brand-orange mb-3 font-heading">
                  Our Pricing Philosophy
                </p>
                <h3 className="text-xl font-heading mb-4 text-white">
                  We price 15% above the market leader because we deliver 15% more care.
                </h3>
                <ul className="space-y-3">
                  {pricingBullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3 text-sm text-white/70">
                      <span className="text-brand-orange mt-1 text-xs">&#x25C6;</span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* -- Separator -- */}
      <div className="border-t border-white/10" />

      {/* -- 6. Where We Operate -- */}
      <section className="w-full py-20 md:py-24 bg-brand-dark-gray section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="mb-12 px-4">
              <p className="text-sm uppercase tracking-wider text-brand-orange mb-3 font-heading">
                Coverage Area
              </p>
              <h2 className="text-3xl md:text-4xl font-normal text-white font-heading tracking-tight">
                Serving all of JABODETABEK
              </h2>
            </div>
          </FadeIn>

          <div className="flex flex-col lg:flex-row">
            {/* Left: Zone schedule table */}
            <FadeIn delay={100} className="flex-1">
              <div className="border border-white/10 h-full">
                {zones.map((z, index) => (
                  <div
                    key={z.day}
                    className={cn(
                      "flex items-center gap-4 px-6 py-5",
                      index > 0 && "border-t border-white/10"
                    )}
                  >
                    <div className="w-28 shrink-0">
                      <p className="font-medium text-white">{z.day}</p>
                    </div>
                    <span className={cn(
                      "text-xs px-3 py-1 border shrink-0",
                      z.zone === "Flex" || z.zone === "Premium"
                        ? "border-brand-orange/30 text-brand-orange bg-brand-orange/5"
                        : "border-white/20 text-white/70 bg-white/5"
                    )}>
                      {z.zone}
                    </span>
                    <p className="text-sm text-white/60">{z.areas}</p>
                  </div>
                ))}
              </div>
            </FadeIn>

            {/* Right: Body text */}
            <FadeIn delay={200} className="flex-1">
              <div className="border border-white/10 border-t-0 lg:border-t lg:border-l-0 p-8 md:p-10 h-full space-y-6">
                <p className="text-white/60 leading-relaxed">
                  We serve specific zones on specific days to minimize travel time and ensure prompt service. Subscription clients are assigned to their zone day for recurring appointments.
                </p>
                <div className="pt-4">
                  <Link
                    href="/coverage"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium border border-brand-orange text-brand-orange hover:bg-brand-orange/5 h-11 py-3 px-8 text-base transition-colors"
                  >
                    Check your area
                  </Link>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* -- Separator -- */}
      <div className="border-t border-white/10" />

      {/* -- 7. CTA -- */}
      <section className="w-full py-12 md:py-12 bg-brand-black section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="border border-white/10">
              <div className="px-4 sm:px-8 md:px-16 py-16 md:py-20 text-center">
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="border border-white/10 bg-brand-dark-gray/50 backdrop-blur-sm px-6 sm:px-10 md:px-16 py-8 sm:py-10 md:py-14">
                    <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-white mb-4 font-heading">
                      Ready for a wash that&apos;s actually premium?
                    </h2>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
                      <Link
                        href="https://wa.me/6281234567890"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium bg-brand-orange text-black hover:bg-brand-orange/90 h-11 py-3 px-12 text-base transition-colors"
                      >
                        Book via WhatsApp
                      </Link>
                      <Link
                        href="/services"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium border border-brand-orange text-brand-orange hover:bg-brand-orange/5 h-11 py-3 px-8 text-base transition-colors"
                      >
                        See Our Services
                      </Link>
                    </div>
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
