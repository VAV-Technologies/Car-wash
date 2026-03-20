'use client';

import * as React from "react";
import Link from 'next/link';
import { Droplets, Sparkles, ArrowRight, Clock, ShieldCheck, MapPin, CheckCircle2, CalendarDays, MessageCircle, Paintbrush, Car } from 'lucide-react';
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
          <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-white/80 max-w-[85%] sm:max-w-3xl mx-auto mb-10 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-200 text-balance sm:text-pretty">
            Premium at-home car wash and detailing, delivered to your doorstep across JABODETABEK. Professional-grade products. Meticulous technique. Zero effort from you.
          </p>
          <div className="mb-10 text-sm md:text-base text-white/80 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-300">
            {/* Desktop: single row with pipes */}
            <div className="hidden sm:flex items-center justify-center">
              <div className="flex items-center">
                <Sparkles className="mr-2 h-4 w-4 opacity-90" /> Premium Products Only
              </div>
              <span className="mx-4 text-white/30">|</span>
              <div className="flex items-center">
                <ShieldCheck className="mr-2 h-4 w-4 opacity-90" /> Trained &amp; Uniformed Technicians
              </div>
              <span className="mx-4 text-white/30">|</span>
              <div className="flex items-center">
                <MapPin className="mr-2 h-4 w-4 opacity-90" /> All JABODETABEK
              </div>
            </div>
            {/* Mobile: pills */}
            <div className="flex sm:hidden flex-col items-center gap-2">
              <div className="flex gap-2">
                <div className="flex items-center border border-white/20 px-3 py-1.5 text-xs">
                  <Sparkles className="mr-1.5 h-4 w-4 opacity-90" /> Premium Products Only
                </div>
                <div className="flex items-center border border-white/20 px-3 py-1.5 text-xs">
                  <ShieldCheck className="mr-1.5 h-4 w-4 opacity-90" /> Trained Technicians
                </div>
              </div>
              <div className="flex items-center border border-white/20 px-3 py-1.5 text-xs">
                <MapPin className="mr-1.5 h-4 w-4 opacity-90" /> All JABODETABEK
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

      {/* Trust Bar */}
      <div className="border-t border-white/10" />
      <section className="py-10 md:py-14 bg-brand-dark-gray section-lines-dark">
        <div className="container mx-auto">
          <FadeIn>
            <div className="flex flex-wrap">
              {[
                { icon: Sparkles, label: "Premium Products Only" },
                { icon: ShieldCheck, label: "Trained Technicians" },
                { icon: MapPin, label: "Serving All JABODETABEK" },
                { icon: CheckCircle2, label: "Satisfaction Guaranteed" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-center gap-3 h-20 md:h-24 w-1/2 md:w-1/4 border border-white/10 px-6">
                  <item.icon className="h-5 w-5 text-white/50 shrink-0" strokeWidth={1.5} />
                  <span className="text-white/70 text-sm md:text-base font-medium text-center">{item.label}</span>
                </div>
              ))}
            </div>
          </FadeIn>
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
                body: "Our technician arrives fully equipped — water tank, generator, premium products, fresh microfiber towels. Your car comes back spotless. Zero effort from you.",
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
              <p className="text-sm font-normal uppercase text-white/50 tracking-wider mb-3 font-heading">Our Services</p>
              <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-white font-heading mb-6">
                Three tiers. One standard: excellence.
              </h2>
              <p className="text-white/70 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                Every wash uses pH-neutral shampoo, the two-bucket method, fresh microfiber towels, and professional-grade chemicals. Choose the depth of care your car needs.
              </p>
            </div>
          </FadeIn>

          {(() => {
            const services = [
              {
                num: "01",
                title: "Standard",
                subtitle: "The Thorough Clean",
                price: "Rp 339,000",
                duration: "~2 hours",
                body: "Foam wash, interior clean, spot treatment, engine bay. The complete foundation wash with premium products and proper technique.",
                tags: ["Foam Wash", "Interior Clean", "Spot Treatment", "Engine Bay", "Tire Polish"],
              },
              {
                num: "02",
                title: "Professional",
                subtitle: "The Deep Restoration",
                price: "Rp 569,000",
                duration: "~3 hours",
                body: "Everything in Standard plus glass spot remover and tar remover. For cars that need deeper cleaning and restoration.",
                tags: ["Glass Descaling", "Tar Removal", "Full Standard", "Deep Clean"],
              },
              {
                num: "03",
                title: "Elite",
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
                          <p className="text-lg font-heading text-white mb-4">{card.price}</p>
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
                        <p className="text-lg font-heading text-white mb-4">{card.price}</p>
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
        </div>
      </section>

      {/* Detailing Preview */}
      <div className="border-t border-white/10" />
      <section className="py-20 md:py-24 bg-brand-dark-gray text-white section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-12 md:mb-16 px-4">
              <p className="text-sm font-normal uppercase text-white/50 tracking-wider mb-3 font-heading">Auto Detailing</p>
              <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-white font-heading">
                Deep restoration, delivered to your door
              </h2>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={100}>
            <div className="max-w-3xl mx-auto border-2 border-brand-orange p-8 md:p-10 text-center relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
                <span className="px-4 py-1 bg-brand-orange text-black text-xs font-semibold uppercase tracking-wider">
                  FEATURED
                </span>
              </div>
              <h3 className="text-2xl font-heading text-white mb-2 pt-2">Full Detail Package</h3>
              <p className="text-2xl font-heading text-brand-orange mb-3">Rp 2,799,000</p>
              <p className="text-white/60 text-sm mb-4">Interior + Exterior + Windows + Tire &amp; Rims &mdash; ~8 hours</p>
              <p className="text-white/50 text-sm mb-6">Individual services from Rp 289,000</p>
              <Link href="/detailing" className="inline-flex items-center text-sm font-medium text-brand-orange hover:text-brand-orange/80 transition-colors">
                See All Detailing Services <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </FadeIn>
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
                  Subscribe and we&apos;ll keep your car pristine on a schedule that works for you. Plans start at Rp 609,000/month.
                </p>
                <div className="border border-brand-orange/30 bg-brand-orange/5 p-4 mb-6">
                  <p className="text-brand-orange text-sm font-medium">
                    Plus and Unlimited subscribers get a free Full Detail worth Rp 2.8M
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                  {[
                    "Essentials: 2 washes/month from Rp 609K",
                    "Plus: 4 washes/month from Rp 1,349K",
                    "Unlimited: Wash anytime from Rp 3,199K",
                    "Plus/Unlimited bonus: Free Full Detail (Rp 2.8M)",
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
                <p className="text-white/60 max-w-xl">Compare Essentials, Plus, and Unlimited plans. Find the right fit for your schedule and budget.</p>
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
                  &ldquo;We&apos;re not the cheapest. We don&apos;t want to be. We&apos;re for the car owner who values their time and their vehicle.&rdquo;
                </p>
                <div className="border-t border-white/10" />
                <p className="text-sm sm:text-base text-white/60 leading-relaxed text-justify py-6 sm:py-8">
                  Most street washes use dirty rags, harsh chemicals, and zero technique. The result? Swirl marks, scratches, and paint that ages faster than it should. Castudio exists because we believe there&apos;s a better way.
                </p>
                <p className="text-sm sm:text-base text-white/60 leading-relaxed text-justify pb-6 sm:pb-8">
                  We use pH-neutral shampoo, the two-bucket method with grit guards, fresh microfiber towels on every car, and professional-grade chemicals that protect rather than strip your paint. Our technicians are trained, uniformed, and equipped to deliver a premium wash at your home or office — with all water, power, and products included.
                </p>
                <div className="flex flex-col sm:flex-row border-t border-white/10 pt-6 sm:pt-8">
                  {[
                    { stat: "2 hrs", label: "Avg Standard wash", icon: Clock },
                    { stat: "500L", label: "Water tank onboard", icon: Droplets },
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
              { title: "Premium Products Only", body: "pH-neutral shampoo, professional sealants, ceramic coatings from trusted brands. Never diluted bulk chemicals or harsh detergents that strip your paint.", icon: Sparkles },
              { title: "Two-Bucket Method", body: "Separate wash and rinse buckets with grit guards on every job. This proven technique prevents the swirl marks and scratches that street washes leave behind.", icon: Droplets },
              { title: "Trained Technicians", body: "Uniformed, trained on proper wash technique, paint decontamination, and sealant application. Every technician follows the Castudio standard before they touch your car.", icon: Paintbrush },
              { title: "Total Convenience", body: "Home, office, apartment basement — we come to you with all equipment, water tank, generator, and products. You don\u2019t lift a finger.", icon: Car },
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

      {/* Coverage Area Snapshot */}
      <div className="border-t border-white/10" />
      <section className="py-20 md:py-24 bg-brand-dark-gray section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-12 md:mb-16 px-4">
              <p className="text-sm font-normal uppercase text-white/60 tracking-wider mb-3 font-heading">Coverage Area</p>
              <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-white font-heading mb-6">
                We come to you, across JABODETABEK
              </h2>
              <p className="text-white/70 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                Our technicians follow a zone schedule to serve all major areas efficiently. Here&apos;s our weekly rotation:
              </p>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={100}>
            <div className="border border-white/10">
              {[
                { day: "Monday", zone: "South Jakarta, Depok" },
                { day: "Tuesday", zone: "Tangerang, BSD" },
                { day: "Wednesday", zone: "Central &amp; North Jakarta" },
                { day: "Thursday", zone: "East Jakarta, Bekasi" },
                { day: "Friday", zone: "Flex Day (Any Zone)" },
                { day: "Saturday", zone: "Premium Slots (Any Zone)" },
              ].map((row, index) => (
                <div key={row.day} className={cn(
                  "flex flex-col sm:flex-row",
                  index > 0 && "border-t border-white/10"
                )}>
                  <div className="sm:w-[200px] shrink-0 p-4 sm:p-6 flex items-center sm:justify-center bg-brand-black/30">
                    <span className="text-sm font-heading font-medium text-white/80">{row.day}</span>
                  </div>
                  <div className="flex-1 p-4 sm:p-6 sm:border-l border-white/10 flex items-center">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-brand-orange shrink-0" strokeWidth={1.5} />
                      <span className="text-white/60 text-sm" dangerouslySetInnerHTML={{ __html: row.zone }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={200}>
            <div className="border border-white/10 border-t-0 bg-brand-dark-gray p-8 text-center">
              <Link href="/coverage" className="inline-flex items-center text-sm font-medium text-brand-orange hover:text-brand-orange/80 transition-colors">
                Check My Area <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </FadeIn>
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
