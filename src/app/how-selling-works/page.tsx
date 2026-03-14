import Image from 'next/image';
import Link from 'next/link';
import { FadeIn } from '@/components/ui/fade-in';
import { ClipboardCheck, TrendingUp, Target, UserCheck, FileText, Globe, Handshake, Shield, CheckCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const preSteps = [
  {
    icon: TrendingUp,
    title: "Business Valuation",
    description: "We assess your business's financials, market position, competitive advantages, and growth potential to establish a realistic and competitive valuation benchmarked against recent comparable transactions in your sector.",
  },
  {
    icon: ClipboardCheck,
    title: "Exit Readiness",
    description: "We review your operations, documentation, financial reporting, and organizational structure to identify what needs to be strengthened before going to market. This ensures you present from a position of strength.",
  },
  {
    icon: Target,
    title: "Deal Objectives",
    description: "We define your goals for the sale: timeline, preferred deal structure, involvement post-sale, minimum acceptable terms, and any non-negotiable conditions around employees, customers, or legacy.",
  },
  {
    icon: UserCheck,
    title: "Seller Qualification",
    description: "We verify ownership, financials, and legal standing so buyers can engage with full confidence from the start. This step also prepares you for the scrutiny of formal due diligence later in the process.",
  },
];

const processSteps = [
  {
    num: "01",
    title: "Discovery and Assessment",
    description: "We begin with a confidential consultation to understand your goals, timeline, and business fundamentals. From there, we conduct a thorough exit assessment including valuation benchmarking, readiness analysis, and buyer landscape mapping. The outcome is a clear picture of where you stand and a strategic roadmap for maximizing value.",
  },
  {
    num: "02",
    title: "Value Enhancement",
    description: "If your business would benefit from targeted improvements before going to market, we identify and help implement changes that directly increase valuation multiples. This can include financial clean-up, margin optimization, customer diversification, building management depth, and reducing key-person risk. Businesses that go through this phase typically see valuation increases of 20 to 40 percent.",
  },
  {
    num: "03",
    title: "Transaction Preparation",
    description: "We prepare institutional-grade documentation that tells your business's story compellingly and accurately. This includes a Confidential Information Memorandum (CIM), detailed financial models, management presentations, and a fully organized virtual data room. We also conduct pre-sale due diligence to address potential issues before buyers discover them.",
  },
  {
    num: "04",
    title: "Buyer Outreach",
    description: "We execute a confidential, targeted outreach campaign across our global buyer network spanning strategic acquirers, private equity firms, family offices, and qualified individuals. Our process creates competitive tension among serious bidders while protecting your identity and business confidentiality at every stage.",
  },
  {
    num: "05",
    title: "Negotiation and Due Diligence",
    description: "We manage the entire negotiation across every deal dimension: price, structure, payment terms, earnout mechanics, escrow provisions, and risk allocation. During buyer due diligence, we coordinate information flow across all workstreams, maintain deal momentum, and protect your negotiating position throughout.",
  },
  {
    num: "06",
    title: "Closing and Transition",
    description: "We manage the final phase from signing through close, coordinating all parties to resolve conditions, finalize documentation, and handle regulatory approvals. After close, we provide ongoing support for transition services, earnout tracking, escrow claim defense, and working capital adjustments to ensure you receive your full proceeds.",
  },
];

const sellerBenefits = [
  {
    title: "Confidentiality Protected",
    description: "Your business is presented through anonymous teasers. Identifying details are only shared with NDA-signed, vetted buyers who demonstrate genuine interest and financial capacity. Employees, customers, and competitors will not know your business is for sale.",
  },
  {
    title: "Competitive Tension",
    description: "We do not find you one buyer. We run a structured process that engages multiple qualified bidders simultaneously, creating competition that drives premium valuations and gives you leverage on deal terms.",
  },
  {
    title: "Global Buyer Reach",
    description: "Our network extends across Asia-Pacific, Europe, and North America, connecting your business with strategic acquirers, private equity funds, family offices, holding companies, and high-net-worth individuals actively seeking opportunities in Asia.",
  },
  {
    title: "Nothing Left on the Table",
    description: "We negotiate every dimension of the deal, not just price. Structure, payment terms, earnout mechanics, escrow provisions, non-competes, and working capital adjustments all affect your total after-tax proceeds. We optimize across all of them.",
  },
];

export default function HowSellingWorksPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="w-full min-h-[60vh] bg-brand-dark-blue flex items-center text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up" delay={200}>
            <div className="text-center px-4 space-y-6">
              <p className="text-sm font-normal uppercase text-brand-sky-blue tracking-wider font-heading">
                How Selling Works
              </p>
              <h1 className="text-4xl md:text-6xl font-normal font-heading tracking-tight">
                A clear path from decision to close
              </h1>
              <p className="text-lg md:text-xl text-blue-100 font-light max-w-2xl mx-auto leading-relaxed">
                Selling a business is one of the most consequential decisions you will make. Here is exactly how we guide you through the process, step by step, so there are no surprises.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Before We Begin */}
      <section className="w-full py-20 md:py-24 bg-white section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="px-4 mb-16">
              <p className="text-sm font-normal uppercase text-brand-sky-blue tracking-wider mb-3 font-heading">
                Before We Begin
              </p>
              <h2 className="text-3xl md:text-4xl font-normal font-heading tracking-tight text-brand-dark-blue mb-6">
                Laying the groundwork for a successful exit
              </h2>
              <p className="text-muted-foreground text-lg max-w-3xl leading-relaxed">
                Before your business goes to market, we work with you to make sure everything is in place. A well-prepared seller attracts better buyers, stronger offers, and smoother negotiations. This preparation phase sets the foundation for everything that follows.
              </p>
            </div>
          </FadeIn>

          <div className="flex flex-col md:flex-row">
            {preSteps.slice(0, 2).map((step, index) => {
              const Icon = step.icon;
              return (
                <FadeIn key={step.title} delay={index * 100} className="flex-1">
                  <div className={cn(
                    "border border-brand-dark-blue/10 p-8 h-full flex items-start gap-4",
                    index > 0 && "border-t-0 md:border-t md:border-l-0"
                  )}>
                    <Icon className="h-6 w-6 text-brand-dark-blue shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-lg font-medium text-brand-dark-blue mb-1">{step.title}</h4>
                      <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
          <div className="flex flex-col md:flex-row">
            {preSteps.slice(2, 4).map((step, index) => {
              const Icon = step.icon;
              return (
                <FadeIn key={step.title} delay={(index + 2) * 100} className="flex-1">
                  <div className={cn(
                    "border border-brand-dark-blue/10 border-t-0 p-8 h-full flex items-start gap-4",
                    index > 0 && "md:border-l-0"
                  )}>
                    <Icon className="h-6 w-6 text-brand-dark-blue shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-lg font-medium text-brand-dark-blue mb-1">{step.title}</h4>
                      <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* Step by Step Process */}
      <div className="border-t border-brand-dark-blue/10" />
      <section className="w-full py-20 md:py-24 bg-brand-dark-blue text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="px-4 mb-16">
              <p className="text-sm font-normal uppercase text-brand-sky-blue tracking-wider mb-3 font-heading">
                The Process
              </p>
              <h2 className="text-3xl md:text-4xl font-normal tracking-tight font-heading mb-6">
                Six phases from assessment to close
              </h2>
              <p className="text-blue-100 text-lg max-w-3xl leading-relaxed">
                Every engagement follows a structured, disciplined process. You will always know where you are, what comes next, and exactly what our team is handling on your behalf.
              </p>
            </div>
          </FadeIn>

          <div className="flex flex-col">
            {processSteps.map((step, index) => (
              <FadeIn key={step.num} delay={index * 80}>
                <div className={cn(
                  "border border-white/15 p-8 md:p-10 flex flex-col md:flex-row gap-6 md:gap-12",
                  index > 0 && "border-t-0"
                )}>
                  <div className="shrink-0">
                    <span className="text-5xl md:text-6xl font-heading text-white/10">{step.num}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-white mb-3">{step.title}</h3>
                    <p className="text-blue-100/70 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Process Diagram */}
      <div className="border-t border-brand-dark-blue/10" />
      <section className="w-full py-20 md:py-24 bg-brand-light-gray/30 section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="px-4 mb-16">
              <p className="text-sm font-normal uppercase text-brand-sky-blue tracking-wider mb-3 font-heading">
                Marketplace Visual Overview
              </p>
              <h2 className="text-3xl md:text-4xl font-normal font-heading tracking-tight text-brand-dark-blue mb-6">
                How our platform works at a glance
              </h2>
            </div>
          </FadeIn>
          <FadeIn>
            <div className="border border-brand-dark-blue/10 bg-white">
              <Image
                src="/assets/how_selling_works.png"
                alt="Diagram explaining how to sell a business with Nobridge"
                width={1200}
                height={800}
                className="w-full h-auto"
                priority
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Why It Works */}
      <div className="border-t border-brand-dark-blue/10" />
      <section className="w-full py-20 md:py-24 bg-white section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="px-4 mb-16">
              <p className="text-sm font-normal uppercase text-brand-sky-blue tracking-wider mb-3 font-heading">
                Why This Approach Works
              </p>
              <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-brand-dark-blue font-heading mb-6">
                What you gain by selling with Nobridge
              </h2>
              <p className="text-muted-foreground text-lg max-w-3xl leading-relaxed">
                Our process is not just structured for efficiency. It is designed to protect your interests, maximize your outcome, and ensure nothing falls through the cracks.
              </p>
            </div>
          </FadeIn>

          <div className="flex flex-col md:flex-row">
            {sellerBenefits.slice(0, 2).map((item, index) => (
              <FadeIn key={item.title} delay={index * 100} className="flex-1">
                <div className={cn(
                  "border border-brand-dark-blue/10 p-8 md:p-10 h-full",
                  index > 0 && "border-t-0 md:border-t md:border-l-0"
                )}>
                  <h3 className="text-xl font-medium text-brand-dark-blue mb-4">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <div className="flex flex-col md:flex-row">
            {sellerBenefits.slice(2, 4).map((item, index) => (
              <FadeIn key={item.title} delay={(index + 2) * 100} className="flex-1">
                <div className={cn(
                  "border border-brand-dark-blue/10 border-t-0 p-8 md:p-10 h-full",
                  index > 0 && "md:border-l-0"
                )}>
                  <h3 className="text-xl font-medium text-brand-dark-blue mb-4">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="border-t border-brand-dark-blue/10" />
      <section className="w-full py-12 md:py-12 bg-brand-white section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="border border-brand-dark-blue/10">
              <div className="relative px-8 md:px-16 text-center overflow-hidden" style={{ backgroundImage: 'url(/assets/cta-cityscape-light.png)', backgroundSize: '100% 100%', backgroundPosition: 'center', aspectRatio: '21/9' }}>
                <div className="relative z-10 flex flex-col items-center justify-center h-full">
                  <div className="border border-brand-dark-blue/20 bg-white/50 backdrop-blur-sm px-10 md:px-16 py-10 md:py-14">
                    <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-brand-dark-blue mb-4 font-heading">
                      Ready to explore your exit options?
                    </h2>
                    <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto mb-10 text-center">
                      Schedule a confidential, no-obligation call with one of our experienced seller partners. We will help you understand your business's market value and map out a clear path forward.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                      <a
                        href="https://cal.com/fachri-budianto-nobridge-seller"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium bg-brand-dark-blue text-brand-white hover:bg-brand-dark-blue/90 h-11 py-3 px-12 text-base transition-colors"
                      >
                        Schedule a Free Call
                      </a>
                      <Link
                        href="/contact"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium border border-brand-dark-blue text-brand-dark-blue hover:bg-brand-dark-blue/5 h-11 py-3 px-8 text-base transition-colors"
                      >
                        Contact Our Team
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
