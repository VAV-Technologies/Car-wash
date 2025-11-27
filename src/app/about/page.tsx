import Image from "next/image";
import { Globe, Handshake, ShieldCheck, Zap } from 'lucide-react';
import { FadeIn } from "@/components/ui/fade-in";

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Our Mission Section */}
      <section className="relative w-full min-h-[85vh] flex items-center justify-end">
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/about_our_mission.png"
            alt="Our Mission Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-12 lg:px-24 text-right text-white">
          <FadeIn direction="left" delay={200} className="max-w-2xl ml-auto space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold font-heading tracking-tight">
              OUR MISSION
            </h1>
            <p className="text-xl md:text-2xl font-light leading-relaxed text-white/90">
              We empower SME owners to exit with confidence, clarity, and maximum value. By bridging the gap between traditional brokerage and institutional-grade advisory, we provide the expertise, transparency, and advocacy sellers deserve.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Challenge Section */}
      <section className="w-full min-h-[85vh] flex items-center py-24 bg-white">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <div className="grid md:grid-cols-[45%_55%] gap-12 md:gap-20 items-center">
            <FadeIn direction="right" delay={200} className="space-y-8 md:pl-16 lg:pl-24">
              <h2 className="text-3xl md:text-5xl font-bold text-brand-dark-blue font-heading uppercase leading-tight tracking-tight">
                The Challenge for <br /> SME Owners
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                The mergers and acquisitions (M&A) landscape can be daunting, especially for SME owners. They often face sophisticated buyers, such as private equity firms and strategic acquirers, who possess significant transactional experience. This information and experience gap can leave sellers at a disadvantage. Nobridge was created to level the playing field, providing SME owners with the dedicated, expert advisory they need to navigate the complexities of a sale with confidence.
              </p>
            </FadeIn>
            <FadeIn direction="left" delay={400} className="w-full">
              <Image
                src="/assets/about_challenge_sme_owners.png"
                alt="The Challenge for SME Owners"
                width={1200}
                height={900}
                className="w-full h-auto rounded-lg shadow-2xl hover:scale-105 transition-transform duration-700"
              />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="w-full min-h-[85vh] bg-brand-dark-blue flex items-center py-24 text-white">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <div className="grid md:grid-cols-[1fr_1.5fr_1fr] gap-8 md:gap-16 items-center">
            {/* Left Image */}
            <FadeIn direction="right" delay={200} className="relative w-full aspect-[9/16] md:aspect-[3/5]">
              <Image
                src="/assets/about_solution_left.png"
                alt="Solution Left"
                fill
                className="object-cover rounded-lg shadow-2xl opacity-90 hover:scale-105 transition-transform duration-700"
              />
            </FadeIn>

            {/* Center Text */}
            <FadeIn direction="up" delay={400} className="text-center space-y-8 md:px-8">
              <h3 className="text-lg md:text-xl font-medium tracking-[0.2em] text-blue-200 uppercase">
                Our Solution:
              </h3>
              <h2 className="text-4xl md:text-6xl font-bold font-heading uppercase leading-tight">
                A Partner From <br /> Start to Finish
              </h2>

              {/* Arrow */}
              <div className="flex justify-center py-4">
                <svg width="100%" height="24" viewBox="0 0 400 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="max-w-[300px] text-white">
                  <path d="M0 12H390M390 12L380 2M390 12L380 22" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>

              <p className="text-lg md:text-xl text-blue-100 leading-relaxed max-w-2xl mx-auto">
                Nobridge is more than just a marketplace; we are a comprehensive platform and advisory partner designed to support business owners through every stage of their exit.
              </p>
            </FadeIn>

            {/* Right Image */}
            <FadeIn direction="left" delay={600} className="relative w-full aspect-[9/16] md:aspect-[3/5]">
              <Image
                src="/assets/about_solution_right.png"
                alt="Solution Right"
                fill
                className="object-cover rounded-lg shadow-2xl opacity-90 hover:scale-105 transition-transform duration-700"
              />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="w-full py-24 md:py-32 bg-white">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-12 md:gap-24 items-stretch">
            {/* Left Content */}
            <FadeIn direction="right" delay={200} className="space-y-12">
              <div className="w-full overflow-hidden rounded-lg shadow-xl">
                <Image
                  src="/assets/about-us-2.jpg"
                  alt="Handshake"
                  width={800}
                  height={500}
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl md:text-5xl font-bold text-brand-dark-blue font-heading uppercase leading-tight tracking-tight">
                  A Foundation of Trust <br /> and Confidentiality
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                  We have built a secure and trustworthy ecosystem. Sensitive business data is protected through a robust, manual verification process that can take up to 48 hours and may include direct contact. Communication between parties is enabled only after both are verified and have executed a jurisdiction-specific Non-Disclosure Agreement (NDA), ensuring all discussions are protected.
                </p>
              </div>
            </FadeIn>

            {/* Right Image */}
            <FadeIn direction="left" delay={400} className="relative h-full min-h-[500px] w-full rounded-lg overflow-hidden shadow-2xl">
              <Image
                src="/assets/about_foundation_right.png"
                alt="Foundation Right"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  );
}
