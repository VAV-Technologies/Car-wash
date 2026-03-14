import Image from 'next/image';
import Link from 'next/link';
import { FadeIn } from '@/components/ui/fade-in';
import { Target, Building2, Wallet, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const preSteps = [
  {
    icon: Target,
    title: "Acquisition Criteria",
    description: "We define what you are looking for: industry, geography, deal size, growth profile, and strategic fit with your existing operations or investment thesis. This ensures every opportunity we present is relevant.",
  },
  {
    icon: Building2,
    title: "Company Assessment",
    description: "We review your background, operational capabilities, and strategic strengths to understand what kind of acquisition would create the most value. This shapes how we position you to sellers and prioritize targets.",
  },
  {
    icon: Wallet,
    title: "Budget and Financing",
    description: "We assess your available capital, financing preferences, and deal structuring capabilities to set realistic parameters. This includes evaluating leverage capacity, co-investment options, and creative financing structures.",
  },
  {
    icon: UserCheck,
    title: "Buyer Qualification",
    description: "We verify your credentials and readiness so sellers can engage with confidence from day one. Verified buyers get priority access to opportunities and faster NDA processing across our marketplace and advisory engagements.",
  },
];

const processSteps = [
  {
    num: "01",
    title: "Strategy Definition",
    description: "We work with you to develop a clear acquisition strategy aligned with your growth objectives. This includes analyzing build-versus-buy alternatives, defining target criteria across size, geography, and capabilities, and establishing financial parameters that guide every subsequent step.",
  },
  {
    num: "02",
    title: "Target Sourcing",
    description: "We activate our network across Asia and globally to identify on-market and off-market targets that match your criteria. Through systematic market mapping, proprietary deal flow from our marketplace, and industry relationships, we build a qualified pipeline of opportunities and develop detailed dossiers on the most promising targets.",
  },
  {
    num: "03",
    title: "Evaluation and Valuation",
    description: "We conduct rigorous financial analysis and valuation modelling using multiple methodologies to ensure you pay fair prices that enable attractive returns. This includes quality of earnings analysis, synergy quantification, integration cost estimates, and sensitivity analysis across key value drivers.",
  },
  {
    num: "04",
    title: "Due Diligence",
    description: "We coordinate multi-workstream due diligence across financial, legal, commercial, operational, and technical areas to validate your investment thesis and uncover hidden risks or opportunities. Our orchestration ensures comprehensive coverage while maintaining efficiency and deal momentum.",
  },
  {
    num: "05",
    title: "Deal Structuring and Negotiation",
    description: "We design and negotiate deal structures that balance price, risk allocation, and post-close alignment. This includes purchase price and payment terms, earnout mechanics, escrow provisions, working capital adjustments, and representation and warranty provisions. Our creative structuring often bridges valuation gaps while protecting your downside.",
  },
  {
    num: "06",
    title: "Closing and Integration",
    description: "We manage the transaction through closing, coordinate with all parties to resolve conditions precedent, and execute comprehensive integration plans that capture synergies from day one. Our support continues post-close with value creation programs designed to drive performance beyond the original investment case.",
  },
];

const buyerBenefits = [
  {
    title: "Proprietary Deal Flow",
    description: "Our established presence in Asian markets provides access to off-market opportunities before they reach competitive auctions. We identify targets through industry relationships and local networks, uncovering hidden value that buyers relying solely on databases and brokers will never see.",
  },
  {
    title: "Cultural Bridge",
    description: "Cross-border acquisitions fail more often from cultural misunderstandings than financial miscalculations. Our bilingual teams navigate both Eastern and Western business practices, building trust with sellers and ensuring smooth communication throughout the deal process.",
  },
  {
    title: "Risk Mitigation",
    description: "We understand the unique risks in Asian acquisitions, from informal accounting practices to complex regulatory environments. Our due diligence approach uncovers issues that standard Western playbooks miss, and our local presence enables ongoing verification and relationship management.",
  },
  {
    title: "End-to-End Execution",
    description: "From strategy to integration, we sit across the table with you at every stage. We do not hand off between teams or disappear after closing. The same advisors who sourced the opportunity manage the negotiation, coordinate diligence, and support integration.",
  },
];

export default function HowBuyingWorksPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="w-full min-h-[60vh] bg-brand-dark-blue flex items-center text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up" delay={200}>
            <div className="text-center px-4 space-y-6">
              <p className="text-sm font-normal uppercase text-brand-sky-blue tracking-wider font-heading">
                How Buying Works
              </p>
              <h1 className="text-4xl md:text-6xl font-normal font-heading tracking-tight">
                From strategy to ownership, step by step
              </h1>
              <p className="text-lg md:text-xl text-blue-100 font-light max-w-2xl mx-auto leading-relaxed">
                Acquiring a business is complex. Here is exactly how we guide you through the process, from defining what you are looking for to closing the deal and creating value post-acquisition.
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
                Setting the foundation for a successful acquisition
              </h2>
              <p className="text-muted-foreground text-lg max-w-3xl leading-relaxed">
                Before you start reviewing opportunities, we work with you to lay the groundwork. A successful acquisition starts well before the first target is evaluated. Getting these fundamentals right saves time, reduces risk, and dramatically improves outcomes.
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
                Six phases from strategy to value creation
              </h2>
              <p className="text-blue-100 text-lg max-w-3xl leading-relaxed">
                Every acquisition engagement follows a structured, disciplined process. You will always know where you are, what comes next, and exactly what our team is delivering at every stage.
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
                src="/assets/how_buying_works.png"
                alt="Diagram explaining how to buy a business with Nobridge"
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
                What you gain by acquiring with Nobridge
              </h2>
              <p className="text-muted-foreground text-lg max-w-3xl leading-relaxed">
                Acquiring in Asia requires more than financial analysis. It requires local intelligence, cultural fluency, and an advisor who stays with you from first conversation through post-close value creation.
              </p>
            </div>
          </FadeIn>

          <div className="flex flex-col md:flex-row">
            {buyerBenefits.slice(0, 2).map((item, index) => (
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
            {buyerBenefits.slice(2, 4).map((item, index) => (
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
                      Ready to find your next acquisition?
                    </h2>
                    <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto mb-10 text-center">
                      Schedule a confidential, no-obligation call with one of our experienced buyer partners. We will help you evaluate opportunities and outline a clear path forward.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                      <a
                        href="https://cal.com/ahmad-fadil-lubis/nobridge-buyer"
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
