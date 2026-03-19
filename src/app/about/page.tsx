import Image from "next/image";
import Link from "next/link";
import { FadeIn } from "@/components/ui/fade-in";
import { cn } from "@/lib/utils";

const values = [
  {
    num: "01",
    title: "Quality over speed",
    body: "We never rush a job. Every car gets the time and attention it deserves.",
  },
  {
    num: "02",
    title: "Premium products, always",
    body: "We use only pH-balanced, paint-safe products. No cheap chemicals.",
  },
  {
    num: "03",
    title: "Trained, not guessing",
    body: "Every technician completes our training program before touching a car.",
  },
  {
    num: "04",
    title: "Transparent pricing",
    body: "What you see is what you pay. No hidden fees, no surprise upsells.",
  },
  {
    num: "05",
    title: "Convenience built in",
    body: "Online booking, WhatsApp support, mobile service — we fit your schedule.",
  },
  {
    num: "06",
    title: "Satisfaction guaranteed",
    body: "Not happy with the result? We'll redo it for free. No questions asked.",
  },
];

const team = [
  {
    name: "Founders",
    role: "Vision & Operations",
    bio: "Driven by a passion for car care and a frustration with the status quo, our founders built Castudio from the ground up. They oversee every aspect of operations, from product sourcing to technician training, ensuring every car gets the treatment it deserves.",
    tags: ["Strategy", "Operations", "Product Quality", "Growth", "Customer Experience"],
    image: "",
  },
  {
    name: "Wash Technicians",
    role: "Expert Car Wash",
    bio: "Our wash technicians are trained professionals who treat every vehicle with care. Each one completes a structured training program covering hand wash techniques, product knowledge, and quality standards before they ever touch a customer's car.",
    tags: ["Hand Wash", "Interior Clean", "Quality Check", "Product Knowledge", "Care"],
    image: "",
  },
  {
    name: "Detail Specialists",
    role: "Advanced Detailing",
    bio: "Our detail specialists handle paint correction, ceramic coating, and interior restoration. With advanced training and experience across a wide range of vehicles, they deliver results that protect and transform your car's finish.",
    tags: ["Paint Correction", "Ceramic Coating", "Interior Restoration", "Polish", "Protection"],
    image: "",
  },
];

const steps = [
  {
    num: "01",
    title: "We use the right products",
    body: "Premium, pH-balanced shampoos, ceramic-grade sealants, microfiber everything. The products we use are chosen because they deliver results and protect your paint — not because they're cheap.",
  },
  {
    num: "02",
    title: "We train every technician",
    body: "Formal training program before anyone touches a car. Regular skill assessments ensure standards don't slip over time.",
  },
  {
    num: "03",
    title: "We follow a system",
    body: "Every wash and detail follows a documented, multi-step process. Consistency isn't luck — it's built into how we work.",
  },
  {
    num: "04",
    title: "We inspect before handover",
    body: "Multi-point quality check on every car. We don't release it until it's right. If something's off, we fix it before you see it.",
  },
];

const regions = [
  { region: "Jakarta", sub: "Our flagship studio with full detailing capabilities", type: "Flagship" },
  { region: "Bandung", sub: "Full-service studio serving West Java", type: "Studio" },
  { region: "Surabaya", sub: "Expanding to East Java — coming soon", type: "Coming Soon" },
];

const serviceTypes = [
  "Express Wash",
  "Full Wash",
  "Interior Deep Clean",
  "Exterior Polish",
  "Ceramic Coating",
  "Premium Detail",
  "Mobile Service",
  "Subscription Plans",
];

const edgeBullets = [
  "Safer for your paint long-term",
  "Better shine and protection",
  "Consistent results every visit",
  "Products that actually protect",
  "Technicians who know what they're doing",
  "No shortcuts, ever",
];

export default function AboutPage() {
  return (
    <div className="bg-brand-black">
      {/* ── 1. Hero ── */}
      <section className="w-full min-h-[60vh] bg-brand-black flex items-center py-24 text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up" delay={200} className="text-center space-y-6 px-4 max-w-4xl mx-auto">
            <p className="text-sm uppercase tracking-wider text-brand-orange font-heading">
              About Castudio
            </p>
            <h1 className="text-4xl md:text-6xl font-normal font-heading tracking-tight text-white">
              Built for Drivers Who Care
            </h1>
            <p className="text-lg md:text-xl text-white/70 font-light max-w-3xl mx-auto leading-relaxed">
              Castudio was founded because Indonesian drivers deserve better than a rushed, automated car wash. We built a studio where quality products, trained technicians, and real attention to detail come standard — not as an upsell.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── Separator ── */}
      <div className="border-t border-white/10" />

      {/* ── 2. Our Story ── */}
      <section className="w-full py-20 md:py-24 bg-brand-dark-gray section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="mb-12 px-4">
              <p className="text-sm uppercase tracking-wider text-brand-orange mb-3 font-heading">
                Our Story
              </p>
              <h2 className="text-3xl md:text-4xl font-normal text-white font-heading tracking-tight">
                Started from a simple frustration
              </h2>
            </div>
          </FadeIn>

          {/* Full-width image placeholder */}
          <FadeIn delay={50}>
            <div className="border border-white/10 overflow-hidden">
              <div className="w-full h-[28rem] md:h-[36rem] bg-brand-dark-gray relative overflow-hidden flex items-center justify-center">
                <p className="text-white/20 text-sm uppercase tracking-wider font-heading">Image Placeholder</p>
              </div>
            </div>
          </FadeIn>

          <div className="flex flex-col lg:flex-row">
            {/* Left column: paragraphs */}
            <FadeIn delay={100} className="flex-1">
              <div className="border border-white/10 border-t-0 p-8 md:p-10 h-full space-y-6">
                <p className="text-white/60 leading-relaxed">
                  Like most car owners in Indonesia, we spent years cycling through car washes that left swirl marks, used harsh chemicals, and rushed through every job. The &ldquo;premium&rdquo; options weren&apos;t much better — just the same shortcuts at a higher price.
                </p>
                <p className="text-white/60 leading-relaxed">
                  So we built Castudio. A studio designed around one idea: every car that comes in should leave genuinely clean, properly protected, and handled by someone who knows what they&apos;re doing. We sourced premium, paint-safe products. We built a real training program for our technicians. We created a process that doesn&apos;t skip steps.
                </p>
                <p className="text-white/60 leading-relaxed">
                  Today, we serve hundreds of cars every month across our studios. But the standard hasn&apos;t changed — every car still gets the same attention to detail we demanded for our own.
                </p>
              </div>
            </FadeIn>

            {/* Right column: pull quote + metrics */}
            <FadeIn delay={200} className="flex-1">
              <div className="border border-white/10 border-t-0 lg:border-l-0 p-8 md:p-10 h-full flex flex-col justify-between">
                {/* Pull quote */}
                <div className="border-l-2 border-brand-orange pl-6 mb-8">
                  <p className="text-xl md:text-2xl font-heading text-white leading-snug mb-3">
                    &ldquo;Every car that leaves our studio should look better than when it arrived. No exceptions.&rdquo;
                  </p>
                  <p className="text-sm text-white/60">Castudio Founding Team</p>
                </div>

                {/* 2x2 metrics grid */}
                <div className="grid grid-cols-2">
                  {[
                    { value: "500+", label: "Cars per month" },
                    { value: "30 min", label: "Avg wash time" },
                    { value: "Jakarta", label: "Home base" },
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

      {/* ── Separator ── */}
      <div className="border-t border-white/10" />

      {/* ── 3. What We Stand For ── */}
      <section className="w-full py-20 md:py-24 bg-brand-black section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="mb-12 px-4">
              <p className="text-sm uppercase tracking-wider text-brand-orange mb-3 font-heading">
                What We Stand For
              </p>
              <h2 className="text-3xl md:text-4xl font-normal text-white font-heading tracking-tight mb-4">
                The standards we hold ourselves to
              </h2>
            </div>
          </FadeIn>

          {/* Row 1: cards 01-03 */}
          <div className="flex flex-col md:flex-row">
            {values.slice(0, 3).map((card, index) => (
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

          {/* Row 2: cards 04-06 */}
          <div className="flex flex-col md:flex-row">
            {values.slice(3, 6).map((card, index) => (
              <FadeIn key={card.num} delay={(index + 3) * 100} className="flex-1">
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

      {/* ── Separator ── */}
      <div className="border-t border-white/10" />

      {/* ── 4. The Team ── */}
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
                From our founders to our wash technicians, everyone at Castudio shares the same obsession with quality.
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

      {/* ── Separator ── */}
      <div className="border-t border-white/10" />

      {/* ── 5. Our Approach ── */}
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

            {/* Right: Sticky Our Edge card */}
            <FadeIn delay={200} className="lg:w-[400px] xl:w-[440px]">
              <div className="border border-white/10 border-t-0 lg:border-t lg:border-l-0 bg-brand-dark-gray text-white p-8 md:p-10 sticky top-24 h-fit">
                <p className="text-sm uppercase tracking-wider text-brand-orange mb-3 font-heading">
                  Our Edge
                </p>
                <h3 className="text-xl font-heading mb-4 text-white">
                  Why premium matters
                </h3>
                <p className="text-white/70 leading-relaxed mb-6 text-sm">
                  Cheap products and untrained staff might get the dirt off, but they also leave swirl marks, strip wax, and degrade your paint over time. Premium products and proper technique don&apos;t just clean — they protect. That&apos;s the difference between a car wash and a studio.
                </p>
                <ul className="space-y-3">
                  {edgeBullets.map((bullet) => (
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

      {/* ── Separator ── */}
      <div className="border-t border-white/10" />

      {/* ── 6. Where We Operate ── */}
      <section className="w-full py-20 md:py-24 bg-brand-dark-gray section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="mb-12 px-4">
              <p className="text-sm uppercase tracking-wider text-brand-orange mb-3 font-heading">
                Where We Operate
              </p>
              <h2 className="text-3xl md:text-4xl font-normal text-white font-heading tracking-tight">
                Growing across Indonesia
              </h2>
            </div>
          </FadeIn>

          <div className="flex flex-col lg:flex-row">
            {/* Left: Region table */}
            <FadeIn delay={100} className="flex-1">
              <div className="border border-white/10 h-full">
                {regions.map((r, index) => (
                  <div
                    key={r.region}
                    className={cn(
                      "flex items-center gap-4 px-6 py-5",
                      index > 0 && "border-t border-white/10"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white">{r.region}</p>
                      <p className="text-xs text-white/60 mt-1">{r.sub}</p>
                    </div>
                    <span className={cn(
                      "text-xs px-3 py-1 border shrink-0",
                      r.type === "Flagship"
                        ? "border-brand-orange/30 text-brand-orange bg-brand-orange/5"
                        : r.type === "Studio"
                          ? "border-white/20 text-white/70 bg-white/5"
                          : "border-white/10 text-white/60"
                    )}>
                      {r.type}
                    </span>
                  </div>
                ))}
              </div>
            </FadeIn>

            {/* Right: Body text */}
            <FadeIn delay={200} className="flex-1">
              <div className="border border-white/10 border-t-0 lg:border-t lg:border-l-0 p-8 md:p-10 h-full space-y-6">
                <p className="text-white/60 leading-relaxed">
                  Jakarta is home — our flagship studio with full wash and detailing capabilities. It&apos;s where we developed the processes and standards that define every Castudio experience.
                </p>
                <p className="text-white/60 leading-relaxed">
                  We&apos;re expanding to serve more Indonesian cities, starting with Bandung and Surabaya. Every new location follows the same playbook: premium products, trained technicians, and a process that doesn&apos;t cut corners.
                </p>
                <p className="text-white/60 leading-relaxed">
                  Whether you visit us at a studio or book our mobile service, the quality is the same. That&apos;s the point.
                </p>
              </div>
            </FadeIn>
          </div>

          {/* Service types tag cloud */}
          <FadeIn delay={300}>
            <div className="border border-white/10 border-t-0 p-6">
              <p className="text-xs uppercase tracking-wider text-white/60 mb-4 font-heading">
                Services We Offer
              </p>
              <div className="flex flex-wrap gap-2">
                {serviceTypes.map((type) => (
                  <span key={type} className="text-xs px-3 py-1 border border-white/10 text-white/70">
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Separator ── */}
      <div className="border-t border-white/10" />

      {/* ── 7. CTA ── */}
      <section className="w-full py-12 md:py-12 bg-brand-black section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="border border-white/10">
              <div className="px-4 sm:px-8 md:px-16 py-16 md:py-20 text-center">
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="border border-white/10 bg-brand-dark-gray/50 backdrop-blur-sm px-6 sm:px-10 md:px-16 py-8 sm:py-10 md:py-14">
                    <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-white mb-4 font-heading">
                      Ready to experience the difference?
                    </h2>
                    <p className="text-white/60 text-lg md:text-xl max-w-xl mx-auto mb-6 sm:mb-8 md:mb-10 text-center">
                      Book your first wash and see why hundreds of drivers trust Castudio with their cars every month. No contracts, no commitments — just a better car wash.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                      <Link
                        href="/contact"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium bg-brand-orange text-black hover:bg-brand-orange/90 h-11 py-3 px-12 text-base transition-colors"
                      >
                        Book a Wash
                      </Link>
                      <Link
                        href="/pricing"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium border border-brand-orange text-brand-orange hover:bg-brand-orange/5 h-11 py-3 px-8 text-base transition-colors"
                      >
                        View Plans
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
