'use client';

import * as React from "react";
import Link from 'next/link';
import { Droplets, Sparkles, CalendarCheck, ArrowRight, Clock, UsersRound, ShieldCheck, Wrench, CreditCard, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FadeIn } from '@/components/ui/fade-in';

const PlaceholderLogo = ({ text = "Logo", className = "" }: { text?: string, className?: string }) => (
  <div
    className={cn("bg-white/5 flex items-center justify-center rounded-md p-4 h-12 md:h-16 w-auto min-w-[120px] md:min-w-[150px]", className)}
    data-ai-hint="company logo"
  >
    <span className="text-white/50 text-xs md:text-sm font-medium text-center">{text}</span>
  </div>
);

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="w-full relative text-brand-white section-lines-light">
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/assets/hero-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/30" />
        </div>
        <div className="container mx-auto flex flex-col items-center justify-center text-center min-h-screen px-4 py-24 md:py-32 lg:py-40 relative z-10">
          <h1 style={{ letterSpacing: '-2.5px' }} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal !leading-tight mb-6 font-heading animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-100">
            Premium Car Care,<br />Zero Compromise
          </h1>
          <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-white/80 max-w-[85%] sm:max-w-3xl mx-auto mb-10 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-200 text-balance sm:text-pretty">
            Castudio is the car wash and detailing studio built for drivers who care. Professional hand wash, expert detailing, and flexible subscription plans — all with premium products.
          </p>
          <div className="mb-10 text-sm md:text-base text-white/80 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-300">
            {/* Desktop: original single row with pipes, no borders */}
            <div className="hidden sm:flex items-center justify-center">
              <div className="flex items-center">
                <Droplets className="mr-2 h-4 w-4 opacity-90" /> Professional Detailing
              </div>
              <span className="mx-4 text-white/30">|</span>
              <div className="flex items-center">
                <Sparkles className="mr-2 h-4 w-4 opacity-90" /> Flexible Subscriptions
              </div>
              <span className="mx-4 text-white/30">|</span>
              <div className="flex items-center">
                <CalendarCheck className="mr-2 h-4 w-4 opacity-90" /> Premium Products
              </div>
            </div>
            {/* Mobile: pills, two on top row + one centered below */}
            <div className="flex sm:hidden flex-col items-center gap-2">
              <div className="flex gap-2">
                <div className="flex items-center border border-white/20 px-3 py-1.5 text-xs">
                  <Droplets className="mr-1.5 h-4 w-4 opacity-90" /> Professional Detailing
                </div>
                <div className="flex items-center border border-white/20 px-3 py-1.5 text-xs">
                  <Sparkles className="mr-1.5 h-4 w-4 opacity-90" /> Flexible Subscriptions
                </div>
              </div>
              <div className="flex items-center border border-white/20 px-3 py-1.5 text-xs">
                <CalendarCheck className="mr-1.5 h-4 w-4 opacity-90" /> Premium Products
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-500">
            <Link href="/contact" className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-brand-orange text-black hover:bg-brand-orange/90 h-11 py-3 px-8 text-base min-w-[220px] sm:min-w-[260px]">
              Book a Wash <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/pricing" className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-brand-white text-brand-white hover:bg-brand-white/10 h-11 py-3 px-8 text-base min-w-[220px] sm:min-w-[260px]">
              View Plans
            </Link>
          </div>
        </div>
      </section>

      {/* Trusted By - Credibility Logos */}
      <div className="border-t border-white/10" />
      <section className="py-10 md:py-14 bg-brand-dark-gray section-lines-dark">
        <div className="container mx-auto">
          <FadeIn>
            <p className="text-sm font-normal uppercase text-white/60 tracking-wider text-center mb-8 font-heading">Trusted By</p>
          </FadeIn>
          <FadeIn delay={200}>
            <div className="flex flex-wrap">
              {["Partner 1", "Partner 2", "Partner 3", "Partner 4"].map((partner, index) => (
                <div key={index} className="flex items-center justify-center h-20 md:h-24 w-1/2 md:w-1/4 border border-white/10 px-6">
                  <PlaceholderLogo text={partner} />
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Separator */}
      <div className="border-t border-white/10" />

      {/* Our Services */}
      <section className="py-20 md:py-24 bg-brand-black text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-16 md:mb-20 px-4">
              <p className="text-sm font-normal uppercase text-white/50 tracking-wider mb-3 font-heading">Our Services</p>
              <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-white font-heading mb-6">
                Everything your car needs, under one roof
              </h2>
              <p className="text-white/70 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                From a quick exterior rinse to full paint correction and ceramic coating, Castudio delivers professional car care with premium products and trained technicians.
              </p>
            </div>
          </FadeIn>

          {(() => {
            const services = [
              {
                num: "01",
                title: "Car Wash",
                body: "From express exterior rinses to full interior-exterior packages, our professional hand wash leaves your car spotless. Every wash uses pH-balanced shampoo and microfiber mitts to protect your paint.",
                tags: ["Express Wash", "Full Wash", "Hand Wash", "Paint Safe", "Interior Clean"],
              },
              {
                num: "02",
                title: "Car Detailing",
                body: "Go beyond clean. Our detailing services restore your car to showroom condition with clay bar treatment, paint correction, polish, and ceramic coating for lasting protection.",
                tags: ["Clay Bar", "Paint Correction", "Polish", "Ceramic Coating", "Restoration"],
              },
              {
                num: "03",
                title: "Subscriptions",
                body: "Never worry about scheduling again. Our weekly and monthly plans keep your car looking its best with regular professional care at a fraction of one-off prices.",
                tags: ["Weekly Plans", "Monthly Plans", "Priority Booking", "Member Perks", "Flexible"],
              },
            ];
            return (
              <>
                {/* Desktop: separate image row + content row (guarantees equal heights) */}
                <div className="hidden md:block">
                  <div className="flex flex-row">
                    {services.map((card, index) => (
                      <FadeIn key={card.num} delay={index * 100} className="flex-1">
                        <div className={cn(
                          "border border-white/10 h-56 bg-brand-dark-gray relative overflow-hidden flex items-center justify-center",
                          index > 0 && "border-l-0"
                        )}>
                          <span className="text-white/30 text-sm">[IMAGE: {card.title}]</span>
                        </div>
                      </FadeIn>
                    ))}
                  </div>
                  <div className="flex flex-row">
                    {services.map((card, index) => (
                      <FadeIn key={card.num} delay={index * 100} className="flex-1">
                        <div className={cn(
                          "group relative border border-white/10 border-t-0 bg-brand-dark-gray p-10 h-full flex flex-col overflow-hidden",
                          index > 0 && "border-l-0"
                        )}>
                          <div className="absolute top-0 left-0 right-0 h-[3px] bg-brand-orange scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                          <span className="text-sm font-heading font-semibold text-white/30 mb-4">{card.num}</span>
                          <h3 className="text-xl font-normal text-white font-heading mb-4 text-left">{card.title}</h3>
                          <p className="text-white/60 leading-relaxed mb-6 text-justify flex-grow">{card.body}</p>
                          <div className="flex flex-wrap gap-2">
                            {card.tags.map((tag) => (
                              <span key={tag} className="text-xs px-3 py-1 border border-white/10 text-white/70">{tag}</span>
                            ))}
                          </div>
                        </div>
                      </FadeIn>
                    ))}
                  </div>
                </div>

                {/* Mobile: image + content paired per card */}
                <div className="md:hidden flex flex-col">
                  {services.map((card, index) => (
                    <FadeIn key={card.num} delay={index * 100}>
                      <div className={cn(
                        "border border-white/10 h-48 bg-brand-dark-gray relative overflow-hidden flex items-center justify-center",
                        index > 0 && "border-t-0"
                      )}>
                        <span className="text-white/30 text-sm">[IMAGE: {card.title}]</span>
                      </div>
                      <div className={cn(
                        "group relative border border-white/10 border-t-0 bg-brand-dark-gray p-6 sm:p-8 flex flex-col overflow-hidden"
                      )}>
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-brand-orange scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                        <span className="text-sm font-heading font-semibold text-white/30 mb-4">{card.num}</span>
                        <h3 className="text-xl font-normal text-white font-heading mb-4 text-left">{card.title}</h3>
                        <p className="text-white/60 leading-relaxed mb-6 text-justify">{card.body}</p>
                        <div className="flex flex-wrap gap-2">
                          {card.tags.map((tag) => (
                            <span key={tag} className="text-xs px-3 py-1 border border-white/10 text-white/70">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </FadeIn>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      </section>

      {/* How It Works */}
      <div className="border-t border-white/10" />
      <section className="py-20 md:py-24 bg-brand-dark-gray section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-16 md:mb-20 px-4">
              <p className="text-sm font-normal uppercase text-white/60 tracking-wider mb-3 font-heading">How It Works</p>
              <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-white font-heading">
                From booking to brand-new shine
              </h2>
            </div>
          </FadeIn>

          <div className="flex flex-col">
            {[
              {
                num: "01",
                title: "Book Your Slot",
                body: "Choose your service, pick a time, and book online or via WhatsApp. Same-day slots often available.",
              },
              {
                num: "02",
                title: "Drop Off or We Come to You",
                body: "Bring your car to our studio or request our mobile service. Either way, we make it easy.",
              },
              {
                num: "03",
                title: "Professional Service",
                body: "Our trained technicians follow a systematic process using premium products. No shortcuts, no rushing.",
              },
              {
                num: "04",
                title: "Quality Inspection",
                body: "Every car goes through a multi-point quality check before handover. We don\u2019t release a car we wouldn\u2019t drive ourselves.",
              },
              {
                num: "05",
                title: "Pickup & Shine",
                body: "Collect your car looking brand new, or we deliver it back to you. Clean, protected, and ready to drive.",
              },
            ].map((step, index) => (
              <FadeIn key={step.num} delay={index * 100}>
                <div className={cn(
                  "border border-white/10 flex flex-col md:flex-row",
                  index > 0 && "border-t-0"
                )}>
                  {/* Step number — separate column on desktop only */}
                  <div className="hidden md:flex md:w-[23%] shrink-0 p-8 md:p-10 items-center justify-center">
                    <span className="text-6xl font-heading font-medium text-white/10 leading-none">
                      {step.num}
                    </span>
                  </div>
                  <div className="flex-1 p-6 sm:p-8 md:p-10 md:border-l border-white/10 flex items-center">
                    <div>
                      {/* Step number — inline on mobile only */}
                      <span className="md:hidden text-2xl font-heading font-medium text-white/10 leading-none mb-2 block">
                        {step.num}
                      </span>
                      <h3 className="text-lg font-normal text-white font-heading mb-2">{step.title}</h3>
                      <p className="text-white/60 leading-relaxed">{step.body}</p>
                    </div>
                  </div>
                  <div className="md:w-[23%] h-40 md:h-auto border-t md:border-t-0 md:border-l border-white/10 relative overflow-hidden shrink-0 bg-brand-black flex items-center justify-center">
                    <span className="text-white/20 text-sm">[IMAGE: Step {step.num}]</span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription Plans */}
      <div className="border-t border-white/10" />
      <section id="subscription-plans" className="py-20 md:py-24 bg-brand-black section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-12 md:mb-16 px-4">
              <p className="text-sm font-normal uppercase text-white/50 tracking-wider mb-3 font-heading">Subscription Plans</p>
              <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-white font-heading">Keep your car looking its best, every week</h2>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={100}>
            <div className="flex flex-col md:flex-row border border-white/10 mb-12 md:mb-16">
              <div className="md:w-1/2 min-h-[250px] md:min-h-[350px] border-b md:border-b-0 md:border-r border-white/10 relative overflow-hidden shrink-0 bg-brand-dark-gray flex items-center justify-center">
                <span className="text-white/30 text-sm">[IMAGE: Subscription plan comparison]</span>
              </div>
              <div className="flex-1 bg-brand-dark-gray p-6 sm:p-8 md:p-10 flex flex-col justify-center">
                <p className="text-white text-base leading-relaxed text-justify mb-4 font-medium">Stop paying full price every time. Our subscription plans give you regular professional car care at member-only rates, with priority booking and perks that make ownership effortless.</p>
                <p className="text-white/60 text-base leading-relaxed text-justify mb-6">Choose from weekly or monthly plans designed around how often you drive and how clean you like to keep your car. Every plan includes priority scheduling, free interior vacuum, and WhatsApp booking so you never have to wait.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                  {[
                    "Wash as often as your plan allows",
                    "Priority booking for subscribers",
                    "Free interior vacuum with every wash",
                    "Member-only pricing on detailing",
                    "No contracts — cancel anytime",
                    "WhatsApp booking for subscribers",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <span className="text-white/60 text-[5px] shrink-0">&#x25CF;</span>
                      <p className="text-base text-white/60 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={200}>
            <div className="border border-white/10 bg-brand-dark-gray p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <p className="text-lg font-normal text-white font-heading">View All Plans</p>
                <p className="text-white/60 max-w-xl">Compare our weekly and monthly subscription options, see what&apos;s included, and find the plan that fits your driving habits.</p>
                <Link href="/pricing" className="inline-flex items-center text-sm font-medium text-brand-orange hover:text-brand-orange/80 transition-colors">
                  View pricing and plans <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={300}>
            <div className="border border-white/10 border-t-0 bg-brand-dark-gray py-6 text-center">
              <Link href="/contact" className="inline-flex items-center text-sm font-medium text-brand-orange hover:text-brand-orange/80 transition-colors">
                Contact Us <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Why Castudio */}
      <div className="border-t border-white/10" />
      <section className="py-20 md:py-24 bg-brand-dark-gray section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-16 md:mb-20 px-4">
              <p className="text-sm font-normal uppercase text-white/50 tracking-wider mb-3 font-heading">Why Castudio</p>
              <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-white font-heading">
                The car care studio built different
              </h2>
            </div>
          </FadeIn>

          {/* Manifesto card - image left, content right */}
          <FadeIn direction="up" delay={100}>
            <div className="border border-white/15 flex flex-col md:flex-row">
              {/* Left - Placeholder image */}
              <div className="md:w-1/2 bg-brand-dark-gray border-b md:border-b-0 md:border-r border-white/10 flex items-center justify-center aspect-[4/3] md:aspect-square relative overflow-hidden">
                <div className="w-full h-full bg-brand-dark-gray flex items-center justify-center"><span className="text-white/30 text-sm">[IMAGE: Castudio workshop interior]</span></div>
              </div>
              {/* Right - Quote, body, stats */}
              <div className="md:w-1/2 bg-brand-dark-gray p-6 sm:p-8 md:p-10 flex flex-col justify-center">
                <p className="text-xl sm:text-2xl md:text-3xl font-heading font-normal text-white leading-snug pb-6 sm:pb-8">
                  &ldquo;Most car washes cut corners. We don&apos;t.&rdquo;
                </p>
                <div className="border-t border-white/10" />
                <p className="text-sm sm:text-base text-white/60 leading-relaxed text-justify py-6 sm:py-8">
                  At Castudio, every wash follows a strict multi-step process using pH-balanced shampoos, microfiber mitts, and premium finishing products. Our technicians are trained, not just hired. We invest in the best tools and products because your car deserves more than a quick rinse with a dirty sponge.
                </p>
                <p className="text-sm sm:text-base text-white/60 leading-relaxed text-justify pb-6 sm:pb-8">
                  We built Castudio because we were tired of car washes that damage paint, skip steps, and rush through every job. Whether it&apos;s a weekly wash or a full detail, we treat every car like it&apos;s our own. That&apos;s not a tagline — it&apos;s how we operate, every single day.
                </p>
                <div className="flex flex-col sm:flex-row border-t border-white/10 pt-6 sm:pt-8">
                  {[
                    { stat: "30 min", label: "Avg service time", icon: Clock },
                    { stat: "500+", label: "Cars washed monthly", icon: UsersRound },
                    { stat: "Premium", label: "Products only", icon: Sparkles },
                  ].map((item, index) => (
                    <div key={item.stat} className={cn(
                      "flex-1 py-4 sm:py-0 sm:px-6 text-center border-white/10 flex flex-col items-center",
                      index > 0 && "border-t sm:border-t-0 sm:border-l"
                    )}>
                      <item.icon className="h-5 w-5 text-white/70 mb-3" strokeWidth={1.5} />
                      <p className="text-xl font-medium text-white">{item.stat}</p>
                      <p className="text-xs text-white/60 mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* 2x2 feature grid - separate from manifesto */}
          <div className="grid grid-cols-1 md:grid-cols-2 mt-10 border border-white/10">
            {[
              { title: "Premium Products", body: "We only use pH-balanced shampoos, professional-grade polishes, and ceramic coatings from trusted brands. No cheap shortcuts, no harsh chemicals that damage your paint over time.", icon: Sparkles },
              { title: "Trained Technicians", body: "Every team member goes through hands-on training before touching a customer's car. We teach technique, product knowledge, and the Castudio standard of care.", icon: Wrench },
              { title: "Flexible Plans", body: "Weekly washes, monthly details, or one-off services — we fit around your schedule. Subscribers get priority booking, member pricing, and WhatsApp scheduling.", icon: CreditCard },
              { title: "Satisfaction Guaranteed", body: "If you're not happy with the result, we'll redo it on the spot. Every car goes through our quality inspection before handover because we don't release work we're not proud of.", icon: Star },
            ].map((card, index) => (
              <FadeIn key={card.title} delay={(index + 2) * 100}>
                <div className={cn(
                  "bg-brand-dark-gray p-5 sm:p-8 md:p-10 h-full flex flex-col",
                  (index === 1) && "md:border-l border-white/10",
                  (index === 2) && "border-t border-white/10",
                  (index === 3) && "border-t md:border-l border-white/10"
                )}>
                  <card.icon className="h-5 w-5 text-white/70 mb-4" strokeWidth={1.5} />
                  <h4 className="text-lg font-normal text-white font-heading mb-3">{card.title}</h4>
                  <p className="text-white/60 text-sm leading-relaxed text-justify">{card.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>


      {/* Final Call to Action Section */}
      <div className="border-t border-white/10" />
      <section className="py-12 bg-brand-black section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="border border-white/10">
              <div className="relative px-4 sm:px-8 md:px-16 py-16 md:py-20 text-center overflow-hidden bg-brand-dark-gray">
                <div className="relative z-10 flex flex-col items-center justify-center h-full">
                  <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-white mb-4 font-heading">Book Your First Wash</h2>
                  <p className="text-white/60 text-lg md:text-xl max-w-xl mx-auto mb-6 sm:mb-8 md:mb-10">
                    Experience the Castudio difference. Premium products, trained technicians, and a result you can see and feel.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    <Link href="/contact" className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-brand-orange text-black hover:bg-brand-orange/90 h-11 py-3 px-12 text-base">
                      Book Now
                    </Link>
                    <Link href="/contact" className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-brand-orange text-brand-orange hover:bg-brand-orange/10 h-11 py-3 px-8 text-base">
                      Contact Our Team
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
