import { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@/components/ui/fade-in";
import { cn } from "@/lib/utils";
import { Sparkles, Users, CalendarCheck, ShieldCheck, Droplets, ArrowRight, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Professional car wash and detailing services. From express wash to premium ceramic coating, Castudio delivers expert car care in Indonesia.",
};

const services = [
  {
    num: "01",
    title: "Express Wash",
    price: "Rp 50.000",
    duration: "30 min",
    description:
      "Quick exterior and interior clean for everyday maintenance. Perfect for busy schedules when your car needs a fast refresh.",
    tags: ["Exterior Rinse", "Interior Vacuum", "Window Clean", "Tire Dress"],
  },
  {
    num: "02",
    title: "Full Wash",
    price: "Rp 85.000",
    duration: "45 min",
    description:
      "Comprehensive wash with tire dressing, glass cleaning, and a thorough interior wipe-down. The complete standard care package.",
    tags: [
      "Full Exterior",
      "Interior Detail",
      "Glass Polish",
      "Tire & Rim",
      "Air Freshener",
    ],
  },
  {
    num: "03",
    title: "Interior Deep Clean",
    price: "Rp 250.000",
    duration: "2-3 hrs",
    description:
      "Fabric and leather shampoo, dashboard detailing, and odor removal. Restores your cabin to showroom condition.",
    tags: [
      "Fabric Shampoo",
      "Leather Care",
      "Dashboard Detail",
      "Odor Removal",
      "Deep Vacuum",
    ],
  },
  {
    num: "04",
    title: "Exterior Polish",
    price: "Rp 350.000",
    duration: "3-4 hrs",
    description:
      "Clay bar treatment, single-stage machine polish, and hand wax application. Removes swirl marks and restores paint depth.",
    tags: [
      "Clay Bar",
      "Single-Stage Polish",
      "Hand Wax",
      "Paint Prep",
      "Swirl Removal",
    ],
  },
  {
    num: "05",
    title: "Ceramic Coating",
    price: "Rp 1.500.000",
    duration: "6-8 hrs",
    description:
      "Multi-stage paint correction followed by professional ceramic protection. Hydrophobic finish with up to two years of UV shield.",
    tags: [
      "Paint Correction",
      "Ceramic Coat",
      "UV Protection",
      "Hydrophobic",
      "2-Year Shield",
    ],
  },
  {
    num: "06",
    title: "Premium Detail",
    price: "Rp 2.500.000",
    duration: "Full day",
    description:
      "Full interior and exterior restoration. Engine bay cleaning, paint correction, ceramic finish, and complete interior renovation.",
    tags: [
      "Full Restoration",
      "Engine Bay",
      "Interior Reno",
      "Paint Correction",
      "Ceramic Finish",
    ],
  },
];

const steps = [
  {
    num: "01",
    title: "Book your slot",
    body: "Pick a date, choose your service, and reserve your spot online or via WhatsApp. We confirm within minutes.",
  },
  {
    num: "02",
    title: "We get to work",
    body: "Drop off your car or let us come to you. Our trained technicians follow a detailed, step-by-step process for every service.",
  },
  {
    num: "03",
    title: "Quality inspection",
    body: "Every vehicle goes through a final multi-point inspection before handover. We check every surface, every panel, every detail.",
  },
  {
    num: "04",
    title: "Drive away happy",
    body: "Pick up your car in pristine condition. Not satisfied? We will redo it on the spot, no questions asked.",
  },
];

const whyUs = [
  {
    title: "Premium Products",
    body: "We use only professional-grade chemicals and coatings sourced from trusted international brands. No shortcuts, no cheap substitutes.",
    icon: Sparkles,
  },
  {
    title: "Expert Technicians",
    body: "Every team member is trained and certified in detailing techniques. Consistent quality on every car, every time.",
    icon: Users,
  },
  {
    title: "Flexible Plans",
    body: "From one-off washes to monthly subscriptions, we offer plans that fit your schedule and budget. No lock-in contracts.",
    icon: CalendarCheck,
  },
  {
    title: "Guaranteed Results",
    body: "If you are not completely satisfied with the result, we will redo the service at no extra charge. Your car, our reputation.",
    icon: ShieldCheck,
  },
];

const testimonials = [
  {
    quote:
      "I have tried every car wash in Jakarta. Castudio is the only one where I never have to double-check their work. Spotless every single time.",
    name: "Andi Prasetyo",
    car: "BMW 3 Series",
  },
  {
    quote:
      "The ceramic coating on my Fortuner still beads water like day one, six months later. Worth every rupiah.",
    name: "Rina Susanti",
    car: "Toyota Fortuner",
  },
  {
    quote:
      "Booked the interior deep clean after a road trip with kids. The car came back smelling and looking brand new. Incredible attention to detail.",
    name: "Dimas Kurniawan",
    car: "Honda CR-V",
  },
  {
    quote:
      "I run a small fleet of rental cars. Castudio handles all of them on a monthly plan. Reliable, fast, and the cars always look showroom-ready.",
    name: "Sari Wijaya",
    car: "Fleet Owner",
  },
];

export default function ServicesPage() {
  return (
    <div className="bg-brand-black">
      {/* -- 1. Hero -- */}
      <section className="w-full min-h-[60vh] bg-brand-black flex items-center py-24 text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn
            direction="up"
            delay={200}
            className="text-center space-y-6 px-4 max-w-4xl mx-auto"
          >
            <p className="text-sm uppercase tracking-wider text-brand-orange font-heading">
              Our Services
            </p>
            <h1 className="text-4xl md:text-6xl font-normal font-heading tracking-tight">
              Professional car care, every detail covered
            </h1>
            <p className="text-lg md:text-xl text-white/70 font-light max-w-3xl mx-auto leading-relaxed">
              From a quick express wash to a full-day premium detail, Castudio
              offers a complete range of professional car care services. Every
              service uses premium products, trained technicians, and a process
              built around getting the details right.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* -- Separator -- */}
      <div className="border-t border-white/10" />

      {/* -- 2. Overview Stats -- */}
      <section className="w-full py-16 md:py-20 bg-brand-dark-gray text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="flex flex-col md:flex-row border border-white/10">
              {[
                { value: "6+", label: "Services" },
                { value: "Premium", label: "Products" },
                { value: "500+", label: "Cars / Month" },
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className={cn(
                    "flex-1 py-10 text-center",
                    index > 0 && "border-t md:border-t-0 md:border-l border-white/10"
                  )}
                >
                  <p className="text-3xl md:text-4xl font-heading text-brand-orange mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-white/50">{stat.label}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* -- Separator -- */}
      <div className="border-t border-white/10" />

      {/* -- 3. Four-Step Process -- */}
      <section className="w-full py-20 md:py-24 bg-brand-black text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="mb-12 px-4">
              <p className="text-sm uppercase tracking-wider text-brand-orange mb-3 font-heading">
                How It Works
              </p>
              <h2 className="text-3xl md:text-4xl font-normal font-heading tracking-tight">
                Four steps to a spotless car
              </h2>
            </div>
          </FadeIn>

          <div className="flex flex-col">
            {steps.map((step, index) => (
              <FadeIn key={step.num} delay={index * 100}>
                <div
                  className={cn(
                    "border border-white/10 p-8 md:p-10 flex items-start gap-8",
                    index > 0 && "border-t-0"
                  )}
                >
                  <span className="text-5xl md:text-6xl font-heading font-medium text-white/10 leading-none shrink-0">
                    {step.num}
                  </span>
                  <div>
                    <h3 className="text-lg font-normal font-heading mb-2">
                      {step.title}
                    </h3>
                    <p className="text-white/60 leading-relaxed">{step.body}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* -- Separator -- */}
      <div className="border-t border-white/10" />

      {/* -- 4. Services Grid -- */}
      <section className="w-full py-20 md:py-24 bg-brand-dark-gray text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="mb-12 px-4">
              <p className="text-sm uppercase tracking-wider text-brand-orange mb-3 font-heading">
                Services & Pricing
              </p>
              <h2 className="text-3xl md:text-4xl font-normal font-heading tracking-tight mb-4">
                Choose the service that fits your car
              </h2>
              <p className="text-white/60 text-lg max-w-3xl leading-relaxed">
                Every package is designed around a specific need, from quick
                maintenance to full restoration. All prices include premium
                products and a quality guarantee.
              </p>
            </div>
          </FadeIn>

          {/* Row 1: cards 01-03 */}
          <div className="flex flex-col md:flex-row">
            {services.slice(0, 3).map((card, index) => (
              <FadeIn key={card.num} delay={index * 100} className="flex-1">
                <div
                  className={cn(
                    "border border-white/10 p-8 h-full flex flex-col",
                    index > 0 && "border-t-0 md:border-t md:border-l-0"
                  )}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-heading text-brand-orange">
                      {card.num}
                    </span>
                    <span className="text-xs text-white/40">{card.duration}</span>
                  </div>
                  <h4 className="text-lg font-medium mb-1">{card.title}</h4>
                  <p className="text-brand-orange font-heading text-xl mb-3">
                    {card.price}
                  </p>
                  <p className="text-white/60 leading-relaxed mb-6 flex-grow">
                    {card.description}
                  </p>
                  <div className="border-t border-white/10 pt-4 flex flex-wrap gap-2">
                    {card.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-3 py-1 border border-white/15 text-white/70"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Row 2: cards 04-06 */}
          <div className="flex flex-col md:flex-row">
            {services.slice(3, 6).map((card, index) => (
              <FadeIn
                key={card.num}
                delay={(index + 3) * 100}
                className="flex-1"
              >
                <div
                  className={cn(
                    "border border-white/10 border-t-0 p-8 h-full flex flex-col",
                    index > 0 && "md:border-l-0"
                  )}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-heading text-brand-orange">
                      {card.num}
                    </span>
                    <span className="text-xs text-white/40">{card.duration}</span>
                  </div>
                  <h4 className="text-lg font-medium mb-1">{card.title}</h4>
                  <p className="text-brand-orange font-heading text-xl mb-3">
                    {card.price}
                  </p>
                  <p className="text-white/60 leading-relaxed mb-6 flex-grow">
                    {card.description}
                  </p>
                  <div className="border-t border-white/10 pt-4 flex flex-wrap gap-2">
                    {card.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-3 py-1 border border-white/15 text-white/70"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* -- Separator -- */}
      <div className="border-t border-white/10" />

      {/* -- 5. Why Choose Castudio -- */}
      <section className="w-full py-20 md:py-24 bg-brand-black text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-16 md:mb-20 px-4">
              <p className="text-sm uppercase tracking-wider text-brand-orange mb-3 font-heading">
                Why Castudio
              </p>
              <h2 className="text-3xl md:text-4xl font-normal font-heading tracking-tight">
                The car care studio built for people who care
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 border border-white/10">
            {whyUs.map((card, index) => (
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

      {/* -- 6. Testimonials -- */}
      <section className="w-full py-20 md:py-24 bg-brand-dark-gray text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-16 md:mb-20 px-4">
              <p className="text-sm uppercase tracking-wider text-brand-orange mb-3 font-heading">
                What Our Customers Say
              </p>
              <h2 className="text-3xl md:text-4xl font-normal font-heading tracking-tight">
                Trusted by car owners across Indonesia
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {testimonials.map((t, index) => (
              <FadeIn key={t.name} delay={(index + 1) * 100}>
                <div
                  className={cn(
                    "border border-white/10 p-8 md:p-10 h-full flex flex-col",
                    index === 1 && "border-t-0 md:border-t md:border-l-0",
                    index === 2 && "border-t-0 md:border-t-0",
                    index === 3 &&
                      "border-t-0 md:border-t-0 md:border-l-0"
                  )}
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 text-brand-orange fill-brand-orange"
                      />
                    ))}
                  </div>
                  <p className="text-white/80 leading-relaxed mb-6 flex-grow">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="border-t border-white/10 pt-4">
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-white/40">{t.car}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* -- Separator -- */}
      <div className="border-t border-white/10" />

      {/* -- 7. CTA -- */}
      <section className="w-full py-20 md:py-24 bg-brand-black text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="border border-white/10 px-6 sm:px-10 md:px-16 py-16 md:py-20 text-center">
              <Droplets
                className="h-8 w-8 text-brand-orange mx-auto mb-6"
                strokeWidth={1.5}
              />
              <h2 className="text-3xl md:text-4xl font-normal font-heading tracking-tight mb-4">
                Ready for a premium wash?
              </h2>
              <p className="text-white/60 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
                Book your first service today or explore our subscription plans
                for regular car care at a better price.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium bg-brand-orange text-black hover:bg-brand-orange/90 h-11 py-3 px-12 text-base transition-colors"
                >
                  Book Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium border border-brand-orange text-brand-orange hover:bg-brand-orange/10 h-11 py-3 px-8 text-base transition-colors"
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
