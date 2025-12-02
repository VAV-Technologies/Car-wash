import Image from "next/image";
import { Globe, Handshake, ShieldCheck, Zap, TrendingUp, Users, Award, BarChart3 } from 'lucide-react';
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
            <h1 className="text-5xl md:text-7xl font-normal font-heading tracking-tight">
              Our Mission
            </h1>
            <p className="text-xl md:text-2xl font-light leading-relaxed text-white/90 text-justify">
              We revolutionize cross-border M&A by connecting ambitious buyers with exceptional sellers across Asia. Through our verified marketplace and expert advisory services, we ensure every transaction achieves optimal outcomes for all parties, making successful deals accessible, transparent, and efficient.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Challenge Section */}
      <section className="w-full min-h-[85vh] flex items-center py-24 bg-white">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <div className="grid md:grid-cols-[45%_55%] gap-12 md:gap-20 items-center">
            <FadeIn direction="right" delay={200} className="space-y-8 md:pl-16 lg:pl-24">
              <h2 className="text-3xl md:text-5xl font-normal text-brand-dark-blue font-heading leading-tight tracking-tight">
                The M&A Challenge <br /> in Asia
              </h2>
              <div className="space-y-6">
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-justify">
                  <span className="font-medium text-brand-dark-blue">For Sellers:</span> SME owners face complex valuation challenges, limited buyer access, and often lack the expertise to navigate sophisticated negotiations. Without proper representation, they risk leaving significant value on the table.
                </p>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-justify">
                  <span className="font-medium text-brand-dark-blue">For Buyers:</span> Identifying quality acquisition targets across Asia's fragmented markets is time-consuming and risky. Language barriers, varying business practices, and limited transparency make due diligence challenging and expensive.
                </p>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-medium text-brand-dark-blue text-justify">
                  Nobridge bridges these gaps, creating a trusted ecosystem where both parties can transact with confidence.
                </p>
              </div>
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
              <h3 className="text-lg md:text-xl font-medium tracking-[0.2em] text-blue-200">
                Our Solution:
              </h3>
              <h2 className="text-4xl md:text-6xl font-normal font-heading leading-tight">
                The Complete <br /> M&A Ecosystem
              </h2>

              {/* Arrow */}
              <div className="flex justify-center py-4">
                <svg width="100%" height="24" viewBox="0 0 400 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="max-w-[300px] text-white">
                  <path d="M0 12H390M390 12L380 2M390 12L380 22" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>

              <p className="text-lg md:text-xl text-blue-100 leading-relaxed max-w-2xl mx-auto">
                Nobridge combines cutting-edge technology with deep M&A expertise to create Asia's premier deal-making platform. We provide verified opportunities, expert advisory, and seamless transaction support, empowering both buyers and sellers to achieve their strategic objectives.
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
                <h2 className="text-3xl md:text-5xl font-normal text-brand-dark-blue font-heading leading-tight tracking-tight">
                  Built on Trust, <br /> Powered by Verification
                </h2>
                <div className="space-y-4">
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-justify">
                    Every participant in the Nobridge ecosystem undergoes rigorous verification. Our multi-stage process ensures you're dealing with serious, qualified counterparties, whether you're a seller evaluating buyers or a buyer assessing opportunities.
                  </p>
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-justify">
                    We protect sensitive information through jurisdiction-specific NDAs, secure data rooms, and controlled information flow. Both buyers and sellers maintain complete control over what information is shared and when, ensuring confidentiality without sacrificing deal momentum.
                  </p>
                </div>
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
      {/* Dual Advisory Excellence Section */}
      <section className="w-full py-24 md:py-32 bg-brand-dark-blue text-white">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <div className="grid md:grid-cols-[1fr_1fr] gap-12 md:gap-24 items-center">
            {/* Left Image */}
            <FadeIn direction="right" delay={200} className="relative h-full min-h-[400px] w-full rounded-lg overflow-hidden shadow-2xl order-2 md:order-1">
              <Image
                src="/assets/about_2.png"
                alt="Expert Advisory"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700 opacity-90"
              />
            </FadeIn>

            {/* Right Content */}
            <FadeIn direction="left" delay={400} className="space-y-8 order-1 md:order-2">
              <h2 className="text-3xl md:text-5xl font-normal font-heading leading-tight tracking-tight">
                Expert Advisory <br /> for Every Deal
              </h2>
              <div className="space-y-6 text-lg md:text-xl text-blue-100 leading-relaxed">
                <p className="text-justify">
                  <span className="text-white font-medium">For Sellers:</span> We provide comprehensive exit planning, valuation optimization, buyer identification, and negotiation support. Our goal is to maximize value and ensure smooth transitions while protecting your legacy.
                </p>
                <p className="text-justify">
                  <span className="text-white font-medium">For Buyers:</span> We offer strategic target identification, detailed due diligence coordination, deal structuring advice, and integration planning. We help you find the right opportunities and execute transactions that drive growth.
                </p>
                <p className="text-white/90 font-medium text-justify">
                  Our success is measured by your success, whether you're exiting or expanding.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Why Choose Nobridge Section */}
      <section className="w-full py-24 md:py-32 bg-white">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <FadeIn direction="up">
            <h2 className="text-3xl md:text-5xl font-normal text-center text-brand-dark-blue font-heading leading-tight tracking-tight mb-16">
              Why Choose Nobridge?
            </h2>
            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 bg-brand-sky-blue/10 p-4 rounded-full">
                  <Globe className="h-8 w-8 text-brand-dark-blue" />
                </div>
                <div>
                  <h4 className="text-xl font-normal text-brand-dark-blue font-heading mb-2">Cross-Border Expertise</h4>
                  <p className="text-muted-foreground leading-relaxed text-justify">Deep understanding of Asian markets combined with global best practices. We bridge cultural and regulatory complexities to ensure smooth transactions.</p>
                </div>
              </div>
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 bg-brand-sky-blue/10 p-4 rounded-full">
                  <ShieldCheck className="h-8 w-8 text-brand-dark-blue" />
                </div>
                <div>
                  <h4 className="text-xl font-normal text-brand-dark-blue font-heading mb-2">Verified Ecosystem</h4>
                  <p className="text-muted-foreground leading-relaxed text-justify">Every participant is thoroughly vetted. Sellers meet genuine buyers with proven capacity, while buyers access pre-qualified opportunities.</p>
                </div>
              </div>
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 bg-brand-sky-blue/10 p-4 rounded-full">
                  <Zap className="h-8 w-8 text-brand-dark-blue" />
                </div>
                <div>
                  <h4 className="text-xl font-normal text-brand-dark-blue font-heading mb-2">Technology-Enabled Efficiency</h4>
                  <p className="text-muted-foreground leading-relaxed text-justify">Our platform streamlines deal flow, due diligence, and communication, reducing transaction times while maintaining quality and confidentiality.</p>
                </div>
              </div>
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 bg-brand-sky-blue/10 p-4 rounded-full">
                  <Handshake className="h-8 w-8 text-brand-dark-blue" />
                </div>
                <div>
                  <h4 className="text-xl font-normal text-brand-dark-blue font-heading mb-2">Success-Based Partnership</h4>
                  <p className="text-muted-foreground leading-relaxed text-justify">Our interests align with yours. We succeed when deals close successfully, ensuring maximum effort and dedication to every transaction.</p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Market Coverage Section */}
      <section className="w-full py-24 md:py-32 bg-brand-dark-blue text-white">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <FadeIn direction="up">
            <h2 className="text-3xl md:text-5xl font-normal text-center font-heading leading-tight tracking-tight mb-16">
              Our Market Coverage
            </h2>
            <div className="grid md:grid-cols-4 gap-8 text-center mb-16">
              <div>
                <div className="text-4xl md:text-5xl font-normal text-brand-sky-blue mb-2">10+</div>
                <p className="text-lg text-blue-100">Asian Markets</p>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-normal text-brand-sky-blue mb-2">$2B+</div>
                <p className="text-lg text-blue-100">Transaction Value</p>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-normal text-brand-sky-blue mb-2">500+</div>
                <p className="text-lg text-blue-100">Verified Buyers</p>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-normal text-brand-sky-blue mb-2">15+</div>
                <p className="text-lg text-blue-100">Industry Sectors</p>
              </div>
            </div>
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-lg md:text-xl text-blue-100 leading-relaxed">
                From technology startups in Singapore to manufacturing giants in Vietnam, from e-commerce platforms in Thailand to service businesses in Malaysia, Nobridge connects opportunities across the entire Asian economic landscape.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Our Team Section */}
      <section className="w-full py-24 md:py-32 bg-white">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <FadeIn direction="up">
            <h2 className="text-3xl md:text-5xl font-normal text-center text-brand-dark-blue font-heading leading-tight tracking-tight mb-8">
              Led by Industry Veterans
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground text-center max-w-4xl mx-auto mb-16 leading-relaxed">
              Our team combines decades of M&A experience from leading investment banks, private equity firms, and successful entrepreneurial ventures across Asia.
            </p>
            <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-brand-sky-blue/10 p-4 rounded-full">
                    <TrendingUp className="h-12 w-12 text-brand-dark-blue" />
                  </div>
                </div>
                <h4 className="text-xl font-normal text-brand-dark-blue font-heading mb-2">M&A Professionals</h4>
                <p className="text-muted-foreground text-justify">Former investment bankers and corporate development executives from global firms</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-brand-sky-blue/10 p-4 rounded-full">
                    <Users className="h-12 w-12 text-brand-dark-blue" />
                  </div>
                </div>
                <h4 className="text-xl font-normal text-brand-dark-blue font-heading mb-2">Regional Experts</h4>
                <p className="text-muted-foreground text-justify">Deep local knowledge with presence in key Asian markets and multilingual capabilities</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-brand-sky-blue/10 p-4 rounded-full">
                    <Award className="h-12 w-12 text-brand-dark-blue" />
                  </div>
                </div>
                <h4 className="text-xl font-normal text-brand-dark-blue font-heading mb-2">Proven Operators</h4>
                <p className="text-muted-foreground text-justify">Successful entrepreneurs who understand the challenges of building and selling businesses</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Conclusion Section */}
      <section className="w-full py-24 bg-brand-light-gray/30">
        <div className="container mx-auto px-6 md:px-12 lg:px-24 text-center">
          <FadeIn direction="up">
            <h2 className="text-3xl md:text-4xl font-normal text-brand-dark-blue font-heading mb-8">Ready to Transform Your M&A Journey?</h2>
            <p className="text-xl md:text-2xl font-normal text-brand-dark-blue/80 max-w-4xl mx-auto leading-relaxed mb-12">
              Whether you're looking to acquire your next growth engine or seeking the perfect exit for your life's work, Nobridge provides the platform, expertise, and network to make it happen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/seller-services" className="inline-flex items-center justify-center px-8 py-3 text-lg font-normal text-white bg-brand-dark-blue hover:bg-brand-dark-blue/90 rounded-md transition-colors">
                I'm a Seller
              </a>
              <a href="/buyer-services" className="inline-flex items-center justify-center px-8 py-3 text-lg font-normal text-brand-dark-blue bg-white border-2 border-brand-dark-blue hover:bg-brand-light-gray rounded-md transition-colors">
                I'm a Buyer
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
