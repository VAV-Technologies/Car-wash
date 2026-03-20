'use client';

import * as React from "react";
import Link from 'next/link';
import { Droplets, Sparkles, ArrowRight, Clock, ShieldCheck, MapPin, CheckCircle2, CalendarDays, MessageCircle, Paintbrush, Car, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FadeIn } from '@/components/ui/fade-in';

const WA_LINK = "https://wa.me/62816104334?text=Halo%2C%20saya%20ingin%20booking%20cuci%20mobil.";

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
            Your Car Deserves Better<br />Than a Street Wash
          </h1>
          <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-white/80 max-w-[85%] sm:max-w-3xl mx-auto mb-8 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-200 text-balance sm:text-pretty">
            Premium at-home car wash and detailing across Jakarta and surrounding areas. We keep working until you&apos;re satisfied.
          </p>
          <div className="mb-10 text-sm md:text-base text-white/80 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-300">
            <div className="flex items-center justify-center gap-6 sm:gap-8">
              <div className="flex items-center">
                <Sparkles className="mr-2 h-4 w-4 opacity-90" /> Premium Products
              </div>
              <span className="text-white/30">|</span>
              <div className="flex items-center">
                <ShieldCheck className="mr-2 h-4 w-4 opacity-90" /> Trained Technicians
              </div>
              <span className="text-white/30">|</span>
              <div className="flex items-center">
                <CheckCircle2 className="mr-2 h-4 w-4 opacity-90" /> Proper Best Practices
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-500">
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-brand-orange text-black hover:bg-brand-orange/90 h-11 py-3 px-8 text-base min-w-[220px] sm:min-w-[260px]">
              Book Your First Wash <ArrowRight className="ml-2 h-5 w-5" />
            </a>
            <Link href="/car-wash/subscriptions" className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-brand-white text-brand-white hover:bg-brand-white/10 h-11 py-3 px-8 text-base min-w-[220px] sm:min-w-[260px]">
              See Our Plans
            </Link>
          </div>
        </div>
      </section>


      {/* Separator */}
      <div className="border-t border-white/10" />

      {/* How It Works */}
      <section className="py-20 md:py-24 bg-brand-dark-gray section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-16 md:mb-20 px-4">
              <p className="text-sm font-normal uppercase text-white/60 tracking-wider mb-3 font-heading">How It Works</p>
              <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-white font-heading">
                Three steps to a spotless car
              </h2>
            </div>
          </FadeIn>

          <div className="flex flex-col">
            {[
              {
                num: "01",
                title: "Choose",
                body: "Pick your wash tier, detailing service, or subscription.",
              },
              {
                num: "02",
                title: "Schedule",
                body: "Tell us your preferred date, time, and location via WhatsApp. We\u2019ll confirm your slot and assign a technician in your zone.",
              },
              {
                num: "03",
                title: "Relax",
                body: "Our technician arrives fully equipped with premium products and fresh microfiber towels. Your car comes back spotless. Zero effort from you.",
              },
            ].map((step, index) => (
              <FadeIn key={step.num} delay={index * 100}>
                <div className={cn(
                  "border border-white/10 flex flex-col md:flex-row",
                  index > 0 && "border-t-0"
                )}>
                  {/* Step number — separate column on desktop */}
                  <div className="hidden md:flex md:w-[23%] shrink-0 p-8 md:p-10 items-center justify-center">
                    <span className="text-6xl font-heading font-medium text-white/10 leading-none">
                      {step.num}
                    </span>
                  </div>
                  <div className="flex-1 p-6 sm:p-8 md:p-10 md:border-l border-white/10 flex items-center">
                    <div>
                      {/* Step number — inline on mobile */}
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

      {/* Services Preview */}
      <div className="border-t border-white/10" />
      <section className="py-20 md:py-24 bg-brand-black text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-16 md:mb-20 px-4">
              <p className="text-sm font-normal uppercase text-white/50 tracking-wider mb-3 font-heading">Car Washing Services</p>
              <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-white font-heading mb-6">
                Car Wash
              </h2>
              <p className="text-white/70 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                Every wash uses premium car shampoo, the two-bucket method, fresh microfiber towels, and top-quality products. Choose the depth of care your car needs.
              </p>
            </div>
          </FadeIn>

          {(() => {
            const services = [
              {
                num: "01",
                title: "Standard Wash",
                subtitle: "The Thorough Clean",
                price: "Rp 339,000",
                duration: "~2 hours",
                body: "Foam wash, interior clean, spot treatment, engine bay. The complete foundation wash with premium products and proper technique.",
                tags: ["Foam Wash", "Interior Clean", "Spot Treatment", "Engine Bay", "Tire Polish"],
              },
              {
                num: "02",
                title: "Professional Wash",
                subtitle: "The Deep Restoration",
                price: "Rp 569,000",
                duration: "~3 hours",
                body: "Everything in Standard plus glass spot remover and tar remover. For cars that need deeper cleaning and restoration.",
                tags: ["Glass Descaling", "Tar Removal", "Full Standard", "Deep Clean"],
              },
              {
                num: "03",
                title: "Elite Wash",
                subtitle: "The Full Transformation",
                price: "Rp 919,000",
                duration: "~4 hours",
                body: "Everything in Professional plus clay bar decontamination and premium sealant coating. The ultimate treatment for cars that deserve the best.",
                tags: ["Clay Bar", "Sealant Coating", "Paint Restoration", "Hydrophobic Shield"],
              },
            ];
            return (
              <>
                {/* Desktop: image row + content row */}
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
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-heading font-semibold text-white/30">{card.num}</span>
                            <span className="text-xs text-white/40">{card.duration}</span>
                          </div>
                          <h3 className="text-xl font-normal text-white font-heading mb-1 text-left">{card.title}</h3>
                          <p className="text-sm text-brand-orange font-medium mb-2">{card.subtitle}</p>
                          <p className="text-white/60 leading-relaxed mb-6 text-justify flex-grow">{card.body}</p>
                          <div className="flex flex-wrap gap-2 mb-6">
                            {card.tags.map((tag) => (
                              <span key={tag} className="text-xs px-3 py-1 border border-white/10 text-white/70">{tag}</span>
                            ))}
                          </div>
                          <Link href="/car-wash/one-time" className="inline-flex items-center text-sm font-medium text-brand-orange hover:text-brand-orange/80 transition-colors">
                            Learn More <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
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
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-heading font-semibold text-white/30">{card.num}</span>
                          <span className="text-xs text-white/40">{card.duration}</span>
                        </div>
                        <h3 className="text-xl font-normal text-white font-heading mb-1 text-left">{card.title}</h3>
                        <p className="text-sm text-brand-orange font-medium mb-2">{card.subtitle}</p>
                        <p className="text-white/60 leading-relaxed mb-6 text-justify">{card.body}</p>
                        <div className="flex flex-wrap gap-2 mb-6">
                          {card.tags.map((tag) => (
                            <span key={tag} className="text-xs px-3 py-1 border border-white/10 text-white/70">{tag}</span>
                          ))}
                        </div>
                        <Link href="/car-wash/one-time" className="inline-flex items-center text-sm font-medium text-brand-orange hover:text-brand-orange/80 transition-colors">
                          Learn More <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </div>
                    </FadeIn>
                  ))}
                </div>
              </>
            );
          })()}

          {/* Auto Detailing Services */}
          <div className="mt-12 md:mt-16">
            <FadeIn direction="up">
              <div className="text-center mb-10 md:mb-12 px-4">
                <p className="text-sm font-normal uppercase text-white/50 tracking-wider mb-3 font-heading">Auto Detailing</p>
                <h3 className="text-2xl md:text-3xl font-normal tracking-tight text-white font-heading">
                  Auto Detailing Services
                </h3>
              </div>
            </FadeIn>

            <div className="flex flex-col">
              {[
                { title: "Interior Detailing", body: "Complete cabin restoration — deep vacuum, upholstery extraction, leather conditioning, dashboard UV treatment, air vent detail, and odour neutralisation. Your interior will look and smell like new." },
                { title: "Exterior Detailing", body: "Full paint correction and protection — clay bar decontamination, machine polish to remove swirl marks, premium sealant coating for deep gloss and hydrophobic finish. Trim and rubber restoration included." },
                { title: "Window Detailing", body: "Crystal-clear glass inside and out — water scale and mineral deposit removal, film and haze cleaning, finished with a hydrophobic coating that repels rain for weeks." },
                { title: "Tire & Rims Detailing", body: "Deep wheel restoration — brake dust and iron fallout removal, tar and adhesive cleaning, rim polish, and tire sidewall dressing that protects and restores the deep black finish." },
                { title: "Full Detail Package", body: "All four detailing services in one comprehensive 8-hour session. Interior, exterior, windows, and tires & rims — the complete restoration for cars that deserve the best." },
              ].map((item, index) => (
                <FadeIn key={item.title} delay={index * 80}>
                  <div className={cn(
                    "border border-white/10 flex flex-col md:flex-row",
                    index > 0 && "border-t-0"
                  )}>
                    {/* Title — left column */}
                    <div className="hidden md:flex md:w-[23%] shrink-0 p-8 md:p-10 items-center justify-center">
                      <h4 className="text-lg font-normal text-white font-heading text-center">{item.title}</h4>
                    </div>
                    {/* Content — middle column */}
                    <div className="flex-1 p-6 sm:p-8 md:p-10 md:border-l border-white/10 flex items-center">
                      <div>
                        <h4 className="md:hidden text-lg font-normal text-white font-heading mb-2">{item.title}</h4>
                        <p className="text-white/60 leading-relaxed">{item.body}</p>
                      </div>
                    </div>
                    {/* Image — right column */}
                    <div className="md:w-[23%] h-40 md:h-auto border-t md:border-t-0 md:border-l border-white/10 relative overflow-hidden shrink-0 bg-brand-dark-gray flex items-center justify-center">
                      <span className="text-white/20 text-sm">[IMAGE: {item.title}]</span>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>

            <FadeIn direction="up" delay={400}>
              <div className="border border-white/10 border-t-0 bg-brand-dark-gray p-8 text-center">
                <Link href="/detailing" className="inline-flex items-center text-sm font-medium text-brand-orange hover:text-brand-orange/80 transition-colors">
                  See All Detailing Services <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Subscription Teaser */}
      <div className="border-t border-white/10" />
      <section className="py-20 md:py-24 bg-brand-black section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-12 md:mb-16 px-4">
              <p className="text-sm font-normal uppercase text-white/50 tracking-wider mb-3 font-heading">Subscriptions</p>
              <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-white font-heading">Never Think About Car Washing Again</h2>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={100}>
            <div className="flex flex-col md:flex-row border border-white/10 mb-12 md:mb-16">
              <div className="flex-1 bg-brand-dark-gray p-6 sm:p-8 md:p-10 flex flex-col justify-center">
                <p className="text-white text-base leading-relaxed text-justify mb-4 font-medium">
                  Subscribe and we&apos;ll keep your car pristine on a schedule that works for you. Plans start at Rp 609,000/quarter.
                </p>
                <div className="border border-brand-orange/30 bg-brand-orange/5 p-4 mb-6">
                  <p className="text-brand-orange text-sm font-medium">
                    Elite subscribers get a free Full Detail worth Rp 2.8M/year
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                  {[
                    "Essentials: 2 Professional/quarter from Rp 609K",
                    "Plus: 2 Standard + 2 Professional/quarter from Rp 1,349K",
                    "Elite: 4 Standard + 2 Professional/quarter from Rp 3,199K",
                    "Elite bonus: Free Full Detail every year (Rp 2.8M)",
                    "No contracts on monthly plans",
                    "WhatsApp booking for subscribers",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <span className="text-white/60 text-[5px] shrink-0">&#x25CF;</span>
                      <p className="text-base text-white/60 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="md:w-[45%] min-h-[250px] md:min-h-[350px] border-t md:border-t-0 md:border-l border-white/10 relative overflow-hidden shrink-0 bg-brand-dark-gray flex items-center justify-center">
                <span className="text-white/30 text-sm">[IMAGE: Subscription plans]</span>
              </div>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={200}>
            <div className="border border-white/10 bg-brand-dark-gray p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <p className="text-lg font-normal text-white font-heading">See Subscription Plans</p>
                <p className="text-white/60 max-w-xl">Compare Essentials, Plus, and Elite plans. Find the right fit for your schedule and budget.</p>
                <Link href="/car-wash/subscriptions" className="inline-flex items-center text-sm font-medium text-brand-orange hover:text-brand-orange/80 transition-colors">
                  View pricing and plans <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
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
                Premium car care, delivered to your door
              </h2>
            </div>
          </FadeIn>

          {/* Manifesto card */}
          <FadeIn direction="up" delay={100}>
            <div className="border border-white/15 flex flex-col md:flex-row">
              {/* Left - Placeholder */}
              <div className="md:w-1/2 bg-brand-dark-gray border-b md:border-b-0 md:border-r border-white/10 flex items-center justify-center aspect-[4/3] md:aspect-square relative overflow-hidden">
                <div className="w-full h-full bg-brand-dark-gray flex items-center justify-center">
                  <span className="text-white/30 text-sm">[IMAGE: Castudio technician at work]</span>
                </div>
              </div>
              {/* Right - Quote, body, stats */}
              <div className="md:w-1/2 bg-brand-dark-gray p-6 sm:p-8 md:p-10 flex flex-col justify-center">
                <p className="text-xl sm:text-2xl md:text-3xl font-heading font-normal text-white leading-snug pb-6 sm:pb-8">
                  &ldquo;We&apos;re for the car owner who values their time and their vehicle &mdash; and refuses to settle for anything less than the best.&rdquo;
                </p>
                <div className="border-t border-white/10" />
                <p className="text-sm sm:text-base text-white/60 leading-relaxed text-justify py-6 sm:py-8">
                  Most street washes use dirty rags, harsh chemicals, and zero technique. The result? Swirl marks, scratches, and paint that ages faster than it should. Castudio exists because we believe there&apos;s a better way.
                </p>
                <p className="text-sm sm:text-base text-white/60 leading-relaxed text-justify pb-6 sm:pb-8">
                  We use premium car shampoo, the two-bucket method with grit guards, and fresh microfiber towels on every car. Our technicians are trained, uniformed, and equipped to deliver a premium wash at your home or office — everything included.
                </p>
                <div className="flex flex-col sm:flex-row border-t border-white/10 pt-6 sm:pt-8">
                  {[
                    { stat: "2 hrs", label: "Avg Standard wash", icon: Clock },
                    { stat: "100%", label: "Satisfaction rate", icon: Droplets },
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

          {/* 2x2 feature grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 mt-10 border border-white/10">
            {[
              { title: "Premium Products Only", body: "Premium car shampoos, professional sealants, and ceramic coatings from trusted brands. Never diluted bulk chemicals or harsh detergents.", icon: Sparkles },
              { title: "Two-Bucket Method", body: "Separate wash and rinse buckets with grit guards on every job. This proven technique prevents the swirl marks and scratches that street washes leave behind.", icon: Droplets },
              { title: "Trained Technicians", body: "Uniformed, trained on proper wash technique, paint decontamination, and sealant application. Every technician follows the Castudio standard before they touch your car.", icon: Paintbrush },
              { title: "Total Convenience", body: "Home, office, apartment basement — we come to you with all the equipment and products needed. You don\u2019t lift a finger.", icon: Car },
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

      {/* Reviews */}
      <div className="border-t border-white/10" />
      <section className="py-20 md:py-24 bg-brand-dark-gray section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-16 md:mb-20 px-4">
              <p className="text-sm font-normal uppercase text-white/60 tracking-wider mb-3 font-heading">Reviews</p>
              <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-white font-heading">
                What our customers say
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3">
            {[
              { name: "Andi S.", stars: 5, quote: "Best car wash I\u2019ve ever had. My car looks brand new every time." },
              { name: "Rina M.", stars: 5, quote: "The convenience of having them come to my apartment is unbeatable. Professional team." },
              { name: "Budi P.", stars: 5, quote: "Finally a car wash that actually cares about paint protection. Worth every rupiah." },
              { name: "Diana K.", stars: 5, quote: "Subscribed to Plus and never looked back. The quarterly plan keeps my car looking showroom fresh." },
              { name: "Tommy L.", stars: 5, quote: "Their two-bucket method makes a real difference. No more swirl marks on my black car." },
              { name: "Sarah W.", stars: 5, quote: "On time, professional, and the result speaks for itself. Highly recommended." },
            ].map((review, index) => (
              <FadeIn key={review.name} delay={index * 100}>
                <div className={cn(
                  "border border-white/10 p-6 sm:p-8 flex flex-col h-full",
                  index > 0 && "border-t-0 md:border-t",
                  index % 3 !== 0 && "md:border-l-0",
                  index >= 3 && "md:border-t-0"
                )}>
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: review.stars }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-brand-orange fill-brand-orange" />
                    ))}
                  </div>
                  <p className="text-white/70 leading-relaxed mb-6 flex-grow">&ldquo;{review.quote}&rdquo;</p>
                  <p className="text-sm font-heading text-white">{review.name}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <div className="border-t border-white/10" />
      <section className="py-12 bg-brand-black section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="border border-white/10">
              <div className="relative px-4 sm:px-8 md:px-16 py-16 md:py-20 text-center overflow-hidden bg-brand-dark-gray">
                <div className="relative z-10 flex flex-col items-center justify-center h-full">
                  <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-white mb-4 font-heading">Book Your First Wash</h2>
                  <p className="text-white/60 text-lg md:text-xl max-w-xl mx-auto mb-6 sm:mb-8 md:mb-10">
                    Experience the Castudio difference. Premium products, trained technicians, and a result you can see and feel — at your doorstep.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-brand-orange text-black hover:bg-brand-orange/90 h-11 py-3 px-12 text-base">
                      <MessageCircle className="mr-2 h-5 w-5" /> WhatsApp Us
                    </a>
                    <Link href="/car-wash/subscriptions" className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-brand-orange text-brand-orange hover:bg-brand-orange/10 h-11 py-3 px-8 text-base">
                      See Our Plans
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
