import Link from "next/link";
import { FadeIn } from "@/components/ui/fade-in";
import { cn } from "@/lib/utils";

const differentiators = [
  {
    num: "01",
    title: "Premium Products Only",
    body: "We use premium car shampoos, sealants, and coatings, never diluted bulk chemicals. Your car gets what it deserves.",
  },
  {
    num: "02",
    title: "Correct Equipment",
    body: "We use the right tools and techniques for every job. Proper wash mitts, grit guards, and dedicated microfiber for each section of your car.",
  },
  {
    num: "03",
    title: "Trained Technicians",
    body: "Our team is trained on proper wash technique, paint decontamination, and sealant application. They care about your paint as much as you do.",
  },
  {
    num: "04",
    title: "Total Convenience",
    body: "We come to your home, office, or apartment. Just provide access to a water source and power outlet, and we handle everything else.",
  },
];

const steps = [
  {
    num: "01",
    title: "We bring the right equipment",
    body: "Top-notch tools, premium car shampoos, dedicated cleaners, and fresh microfiber for every job. We come fully prepared.",
  },
  {
    num: "02",
    title: "We use the right products",
    body: "Premium car shampoos, dedicated glass cleaners, tar removers, clay bars, and sealant coatings. Never dish soap or diluted bulk chemicals.",
  },
  {
    num: "03",
    title: "We follow the correct techniques",
    body: "Proper wash methods, grit guards, fresh microfiber for each section, and a systematic process from foam pre-wash to final wipe.",
  },
  {
    num: "04",
    title: "We take our time",
    body: "Standard takes 2 hours, Professional 3, Elite 4. Quality takes time. We would rather do fewer cars right than more cars wrong.",
  },
];

const qualityBullets = [
  "Premium products that protect your paint, not strip it",
  "Trained technicians held to the highest standards",
  "Correct techniques that prevent swirl marks and scratches",
  "At-home convenience that saves you hours",
  "We keep working until you are completely satisfied",
  "Quality you can see and feel every single time",
];

export default function AboutPage() {
  return (
    <div className="bg-brand-black">
      {/* -- 1. Hero -- */}
      <section className="w-full min-h-[75vh] bg-brand-black flex items-center py-24 text-white section-lines-light">
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

      {/* -- 2. About Us (replaces Team section) -- */}
      <section className="w-full py-20 md:py-24 bg-brand-dark-gray text-white section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="text-center space-y-4 mb-16 px-4">
              <p className="text-sm uppercase tracking-wider text-brand-orange font-heading">
                About Us
              </p>
              <h2 className="text-3xl md:text-4xl font-normal font-heading tracking-tight text-white">
                Premium car care, delivered to your door
              </h2>
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <div className="border border-white/15 flex flex-col md:flex-row">
              {/* Left - Image placeholder */}
              <div className="md:w-1/2 bg-brand-dark-gray border-b md:border-b-0 md:border-r border-white/10 flex items-center justify-center aspect-[4/3] md:aspect-auto relative overflow-hidden">
                <span className="text-white/30 text-sm">[IMAGE: The Castudio Team]</span>
              </div>
              {/* Right - Content */}
              <div className="md:w-1/2 bg-brand-dark-gray p-6 sm:p-8 md:p-10 flex flex-col justify-center">
                <p className="text-xl sm:text-2xl md:text-3xl font-heading font-normal text-white leading-snug pb-6 sm:pb-8">
                  &ldquo;We&apos;re for the car owner who values their time and their vehicle,and refuses to settle.&rdquo;
                </p>
                <div className="border-t border-white/10" />
                <p className="text-sm sm:text-base text-white/60 leading-relaxed text-justify py-6 sm:py-8">
                  Most street washes use dirty rags, harsh chemicals, and zero technique. The result? Swirl marks, scratches, and paint that ages faster than it should. Castudio exists because we believe there&apos;s a better way.
                </p>
                <p className="text-sm sm:text-base text-white/60 leading-relaxed text-justify pb-6 sm:pb-8">
                  We use premium car shampoo, the two-bucket method with grit guards, and fresh microfiber towels on every car. Our technicians are trained, uniformed, and equipped to deliver a premium wash at your home or office,everything included.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* -- Separator -- */}
      <div className="border-t border-white/10" />

      {/* -- 3. Our Story -- */}
      <section className="w-full py-20 md:py-24 bg-brand-black section-lines-light">
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
            <FadeIn delay={100} className="flex-1">
              <div className="border border-white/10 p-8 md:p-10 h-full space-y-6">
                <p className="text-white/60 leading-relaxed">
                  We&apos;re car people. We know the frustration of sitting in Jakarta traffic for 45 minutes just to get a mediocre wash at a dirty roadside shop. We know the anxiety of handing your car to someone who uses the same rag on every vehicle. We know there&apos;s a better way.
                </p>
                <p className="text-white/60 leading-relaxed">
                  We bring premium car care to your doorstep. No cutting corners. No generic products. No rushed jobs. Every wash uses premium products, the proper two-bucket method, and dedicated microfiber for each section of your car. Our technicians are trained, uniformed, and held to a quality standard that most shops never reach.
                </p>
                <p className="text-white/60 leading-relaxed">
                  We&apos;re for the car owner who values their time and their vehicle,and refuses to settle for a street-level wash. If that sounds like you, welcome home.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={200} className="flex-1">
              <div className="border border-white/10 border-t-0 lg:border-t lg:border-l-0 p-8 md:p-10 h-full flex flex-col justify-between">
                <div className="border-l-2 border-brand-orange pl-6 mb-8">
                  <p className="text-xl md:text-2xl font-heading text-white leading-snug mb-3">
                    &ldquo;We&apos;re for the car owner who values their time and their vehicle,and refuses to settle.&rdquo;
                  </p>
                </div>

                <div className="grid grid-cols-2">
                  {[
                    { value: "Jakarta", label: "And surrounding areas" },
                    { value: "2hrs+", label: "Per wash, never rushed" },
                    { value: "Trained", label: "Certified technicians" },
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

      {/* -- 4. Why We're Different -- */}
      <section className="w-full py-20 md:py-24 bg-brand-dark-gray section-lines-dark">
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

      {/* -- 5. Our Approach -- */}
      <section className="w-full py-20 md:py-24 bg-brand-black section-lines-light">
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

            {/* Right: Our Quality Promise */}
            <FadeIn delay={200} className="lg:w-[400px] xl:w-[440px]">
              <div className="border border-white/10 border-t-0 lg:border-t lg:border-l-0 bg-brand-dark-gray text-white p-8 md:p-10 sticky top-24 h-fit">
                <p className="text-sm uppercase tracking-wider text-brand-orange mb-3 font-heading">
                  Our Promise
                </p>
                <h3 className="text-xl font-heading mb-4 text-white">
                  We deliver the best car care in Jakarta,no compromises.
                </h3>
                <ul className="space-y-3">
                  {qualityBullets.map((bullet) => (
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

      {/* -- 6. CTA -- */}
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

      <div className="border-t border-white/10" />
    </div>
  );
}
