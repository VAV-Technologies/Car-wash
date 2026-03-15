"use client";

import { useState } from "react";
import { FadeIn } from "@/components/ui/fade-in";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    ChevronRight,
    Plus,
    Compass,
    Search,
    Calculator,
    Microscope,
    Building,
    Wallet,
    GitMerge,
    Rocket
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const services = [
    {
        id: "strategy",
        num: "01",
        title: "Acquisition Strategy",
        icon: Compass,
        summary: "We develop a clear acquisition strategy aligned with your corporate vision and growth objectives, defining target criteria across size, geography, capabilities, and financial parameters to guide every subsequent step.",
        fullDescription: `This foundational service develops a clear acquisition strategy that aligns with your corporate vision and growth objectives. We conduct thorough analysis of build-versus-buy alternatives, market expansion opportunities, capability gap assessments, competitive positioning requirements, and return on investment thresholds. This strategic planning encompasses industry landscape mapping, value chain analysis, technology and talent acquisition priorities, geographic expansion opportunities, and portfolio optimization strategies.

Our approach begins with understanding your core strategic drivers, whether seeking market share growth, geographic expansion, technology acquisition, or vertical integration. We analyze your competitive position and identify where acquisitions could create sustainable advantages versus organic development. This includes examining successful acquisition programs in your industry, understanding regulatory and market dynamics that affect consolidation, and identifying windows of opportunity created by industry disruption or generational transitions.

We develop detailed acquisition criteria that guide target identification and evaluation. This includes defining optimal target characteristics such as size, geography, capabilities, and culture, establishing financial parameters including valuation ranges and return requirements, identifying synergy potential across revenue, cost, and capability dimensions, and setting integration complexity thresholds. The output is a comprehensive acquisition playbook that guides all subsequent activity.

The strategy also addresses execution capabilities and governance structures needed for successful M&A programs. We help establish internal processes for opportunity evaluation, design stage-gate approval mechanisms, and create integration frameworks that can be repeatedly deployed. This institutional approach transforms M&A from episodic transactions to a sustainable growth engine.`
    },
    {
        id: "identification",
        num: "02",
        title: "Target Identification",
        icon: Search,
        summary: "We go beyond standard databases to uncover on-market and off-market acquisition opportunities through proprietary networks, industry relationships, local contacts, and systematic market mapping tailored to your specific criteria.",
        fullDescription: `This service employs sophisticated research and networking to identify acquisition targets that match your strategic criteria. We go beyond standard databases to uncover off-market opportunities through industry relationships, supply chain analysis, competitive intelligence, technology scouting, and international market scanning. Our identification process typically evaluates 200-500 companies to yield 20-30 qualified targets, ultimately focusing on 3-5 actionable opportunities.

Our multi-channel approach ensures comprehensive market coverage. We leverage proprietary databases and industry intelligence, engage sector advisors and industry insiders, monitor distressed situations and special opportunities, and identify succession-driven sales before they reach market. For international targets, particularly in Asia, we utilize local networks that provide early access to opportunities that might never reach Western buyers.

The screening process applies progressively refined filters to focus resources on the most promising opportunities. Initial screening evaluates strategic fit and basic financial metrics, secondary analysis examines business quality and growth potential, and detailed assessment investigates management capability and cultural alignment. We develop target dossiers that provide deep insight into each opportunity, including business model analysis, competitive positioning, financial performance, and acquisition rationale.

We also conduct pre-approach intelligence gathering to understand seller motivations, optimal timing, and negotiation leverage. This includes understanding ownership dynamics and succession plans, identifying financial pressures or strategic imperatives, and assessing competitive buyer interest. This intelligence shapes approach strategies that maximize success probability while minimizing competitive bidding situations.`
    },
    {
        id: "valuation",
        num: "03",
        title: "Valuation Analysis",
        icon: Calculator,
        summary: "We provide rigorous financial modeling and synergy quantification using multiple valuation methodologies, ensuring you pay fair prices that protect downside while enabling attractive risk-adjusted returns on your investment.",
        fullDescription: `This service provides rigorous valuation analysis to ensure you pay fair prices that enable attractive returns. We develop detailed financial models incorporating historical analysis and quality of earnings adjustments, growth projections under various scenarios, synergy quantification and achievement timelines, integration cost estimates, and sensitivity analysis across key value drivers. Our valuation approach combines multiple methodologies to triangulate appropriate pricing ranges.

We begin by reconstructing historical financial performance, making appropriate adjustments for non-recurring items, accounting policies, and hidden assets or liabilities. This quality of earnings analysis reveals true business performance and identifies sustainable EBITDA for valuation purposes. We examine revenue quality, customer concentration, and margin sustainability to understand business resilience. This includes analyzing contract terms, pricing power, and competitive dynamics that affect future performance.

Our forward-looking analysis models the business under your ownership, incorporating both standalone projections and synergy benefits. We quantify revenue synergies from cross-selling and market expansion, cost synergies from procurement and overhead optimization, and capability synergies from technology or talent acquisition. We also model integration costs and execution risks that offset these benefits. This comprehensive analysis yields return projections under various scenarios, informing maximum price thresholds.

We benchmark our valuations against comparable transactions and public market multiples, adjusting for size, growth, profitability, and risk factors. This market-based validation ensures pricing remains competitive while preserving return potential. We also structure valuations to optimize risk-adjusted returns, potentially incorporating earnouts, escrows, or contingent payments that align price with performance.`
    },
    {
        id: "duediligence",
        num: "04",
        title: "Due Diligence",
        icon: Microscope,
        summary: "We coordinate multi-disciplinary due diligence across financial, legal, commercial, operational, and technical workstreams to validate your investment thesis, uncover hidden risks, and identify value creation opportunities.",
        fullDescription: `This critical service manages multi-disciplinary due diligence efforts that validate investment thesis and uncover hidden risks or opportunities. We coordinate specialized workstreams including financial and tax diligence, commercial and market assessment, operational and technology review, legal and regulatory compliance, environmental and social governance, and human capital and culture evaluation. Our orchestration ensures comprehensive coverage while maintaining efficiency and confidentiality.

Our financial due diligence goes beyond validating historical numbers to understand business drivers and sustainability. We examine revenue recognition and quality, cost structure and scalability, working capital requirements and cash generation, capital expenditure needs and asset condition, and off-balance sheet items and contingent liabilities. This analysis identifies both risks that might reduce price and opportunities that could enhance value post-acquisition.

Commercial due diligence validates market assumptions and competitive positioning that underpin growth projections. We conduct customer interviews to assess satisfaction and retention, analyze market dynamics and growth drivers, evaluate competitive positioning and differentiation, assess technology disruption risks, and validate expansion opportunities. This outside-in perspective often reveals insights that management presentations miss, calibrating growth expectations to market realities.

Operational due diligence identifies both integration challenges and improvement opportunities. We assess organizational capabilities and talent depth, technology infrastructure and digital maturity, operational processes and efficiency potential, supply chain resilience and procurement opportunities, and regulatory compliance and risk management. This comprehensive evaluation informs integration planning and synergy validation while identifying critical risks requiring mitigation.`
    },
    {
        id: "dealstructuring",
        num: "05",
        title: "Deal Structuring",
        icon: Building,
        summary: "We design and negotiate optimal deal structures that balance purchase price, risk allocation, and post-close alignment, using creative mechanisms like earnouts, escrows, and contingent payments to bridge valuation gaps.",
        fullDescription: `This service designs and negotiates deal structures that balance purchase price, risk allocation, and post-close alignment to maximize success probability. We structure transactions considering cash versus stock consideration, upfront versus deferred payments, earnouts and performance-based adjustments, escrows and indemnification provisions, working capital and debt-like item adjustments, and representation and warranty insurance. Our creative structuring often bridges valuation gaps while protecting downside.

Our negotiation strategy leverages competitive dynamics and seller motivations to achieve favorable terms. We understand how to create competitive tension even in proprietary deals, when to push hard versus showing flexibility, and how to trade across multiple deal dimensions for optimal outcomes. This includes negotiating purchase price and payment timing, defining working capital targets and adjustment mechanisms, structuring earnouts that motivate without enabling manipulation, limiting survival periods and liability caps, and securing appropriate transition support and non-compete agreements.

We protect value through comprehensive risk allocation provisions that address known and unknown liabilities. This includes negotiating specific indemnities for identified risks, general representations and warranties for unknown issues, and materiality thresholds and survival periods that balance protection with seller acceptance. We also structure remedies that provide practical recourse, including escrow funding and release terms, setoff rights against deferred payments, and insurance solutions for catastrophic risks.

The deal structure must also facilitate successful integration and value capture. We negotiate provisions that ensure cooperation during transition, access to key employees and customers, protection of critical relationships, and flexibility for post-close integration. This forward-looking approach ensures the deal structure supports, rather than hinders, value realization.`
    },
    {
        id: "financing",
        num: "06",
        title: "Acquisition Financing",
        icon: Wallet,
        summary: "We arrange optimal financing packages from diverse capital sources, including senior debt, mezzanine, equity co-investment, and vendor financing, structured to fund the acquisition while maintaining flexibility for integration and growth.",
        fullDescription: `This service arranges optimal financing packages that fund acquisitions while maintaining financial flexibility for integration and growth. We evaluate and arrange various funding sources including senior bank debt and asset-based lending, subordinated debt and mezzanine financing, equity co-investment and partnership structures, vendor financing and deferred consideration, and government grants and incentives. Our capital structuring balances cost, flexibility, and risk to support both acquisition and post-close value creation.

We begin by modeling capital requirements including purchase price and transaction fees, integration and restructuring costs, working capital and growth investments, and contingency buffers for uncertainty. This comprehensive funding need drives capital structure design that maintains appropriate leverage while preserving operational flexibility. We model various structures to optimize weighted average cost of capital while maintaining covenant compliance through various scenarios.

Our financing process creates competition among capital providers to achieve optimal terms. We prepare compelling financing memorandums that articulate investment merits, manage parallel negotiations with multiple funding sources, and structure financing packages that align with integration plans. This includes negotiating interest rates and fee structures, covenant packages and reporting requirements, prepayment terms and refinancing flexibility, and security packages and guarantee requirements.

We also design creative financing solutions that enhance returns or enable otherwise difficult transactions. This might include stapled financing that accelerates execution, earnout financing that bridges valuation gaps, or portfolio approaches that finance multiple acquisitions. Our relationships with diverse capital providers ensure access to solutions tailored to specific situations, whether requiring speed, flexibility, or maximum leverage.`
    },
    {
        id: "integrationplanning",
        num: "07",
        title: "Integration Planning",
        icon: GitMerge,
        summary: "We develop and execute comprehensive integration blueprints covering organizational design, systems integration, commercial synergies, operational consolidation, cultural alignment, and stakeholder communication from day one through full integration.",
        fullDescription: `This crucial service develops and executes comprehensive integration plans that capture synergies while maintaining business continuity. We create detailed integration blueprints covering organizational design and talent retention, systems and process integration, commercial integration and revenue synergies, operational consolidation and cost synergies, cultural alignment and change management, and stakeholder communication and engagement. Our structured approach dramatically improves integration success rates.

Integration planning begins during due diligence, not after closing. We develop Day 1 readiness plans ensuring operational continuity, 100-day plans that capture quick wins and build momentum, and longer-term transformation roadmaps that realize full potential. This includes defining integration governance and decision rights, establishing integration management office and workstreams, creating detailed project plans with clear accountabilities, and developing tracking mechanisms for synergy realization.

We address the human dimension that determines integration success. This includes assessing cultural fit and alignment requirements, designing organizational structures that optimize capability, developing retention programs for critical talent, managing redundancy and restructuring sensitively, and creating communication plans that maintain morale and productivity. Our change management approach ensures organizations come together effectively rather than fragmenting into competing camps.

Our execution support ensures plans translate into results. We provide hands-on integration management including project management and workstream coordination, issue escalation and resolution, synergy tracking and reporting, and stakeholder communication and engagement. This active management maintains momentum through the challenging integration period, ensuring value creation targets are achieved or exceeded.`
    },
    {
        id: "optimization",
        num: "08",
        title: "Value Creation",
        icon: Rocket,
        summary: "We drive post-acquisition transformation beyond initial synergy capture, implementing revenue growth initiatives, operational excellence programs, digital transformation, and portfolio optimization that generate returns above the original investment case.",
        fullDescription: `This service focuses on value creation initiatives that transform acquired businesses beyond initial synergy capture. We implement comprehensive improvement programs addressing revenue growth acceleration, operational excellence and efficiency, strategic repositioning and portfolio optimization, digital transformation and technology enablement, and talent development and organizational capability. These initiatives often generate returns exceeding initial acquisition synergies.

Revenue growth initiatives expand beyond cost synergies that dominate early integration. We identify and execute cross-selling and customer expansion opportunities, new product development and innovation, geographic expansion and market penetration, pricing optimization and value capture, and channel development and partnership strategies. These growth programs leverage combined capabilities to accelerate organic expansion beyond what either organization could achieve independently.

Operational transformation goes beyond initial cost synergies to fundamentally improve business performance. We implement lean operations and continuous improvement, supply chain optimization and procurement excellence, shared services and center of excellence models, automation and digital process transformation, and asset optimization and capital efficiency. These structural improvements create sustainable competitive advantages while improving returns on invested capital.

We also support portfolio optimization for serial acquirers, identifying follow-on acquisition opportunities that build on the initial platform, divestiture candidates that no longer fit strategic criteria, and internal reorganization that maximizes value across holdings. This dynamic portfolio management ensures capital deploys to highest-return opportunities while maintaining strategic coherence. Our comprehensive value creation approach typically generates 25-50% returns above initial investment cases through systematic post-acquisition improvement.`
    }
];

const processSteps = [
    {
        num: "01",
        title: "Strategy and Criteria",
        body: "We begin by understanding your growth objectives, investment thesis, and operational capabilities. Together we define acquisition criteria across industry, geography, size, and financial parameters, creating a focused playbook that guides every subsequent step and ensures we pursue the right opportunities.",
    },
    {
        num: "02",
        title: "Sourcing and Screening",
        body: "We activate our network across Asia and globally to identify on-market and off-market targets that match your criteria. Through systematic market mapping, proprietary deal flow, and industry relationships, we build a qualified pipeline and develop detailed dossiers on the most promising opportunities.",
    },
    {
        num: "03",
        title: "Evaluation and Structuring",
        body: "We conduct rigorous valuation analysis and coordinate multi-workstream due diligence to validate the investment thesis and uncover risks. We then design deal structures that balance price, risk allocation, and post-close alignment, negotiating terms that protect your downside while enabling value creation.",
    },
    {
        num: "04",
        title: "Execution and Integration",
        body: "We manage the transaction through closing, arrange optimal financing, and execute comprehensive integration plans that capture synergies from day one. Our support continues post-close with value creation programs that drive performance beyond the original investment case.",
    },
];

const whyUs = [
    {
        title: "Proprietary Deal Flow",
        description: "Our established presence in Asian markets provides access to off-market opportunities before they reach competitive auction processes. We identify targets through industry relationships, not just databases, uncovering hidden value others miss."
    },
    {
        title: "Cultural Bridge",
        description: "Cross-border acquisitions fail more often from cultural misunderstandings than financial miscalculations. Our bilingual teams navigate both Eastern and Western business practices, ensuring smooth communication and building trust with sellers who might otherwise hesitate with foreign buyers."
    },
    {
        title: "Risk Mitigation",
        description: "We understand the unique risks in Asian acquisitions, from informal business practices to regulatory complexities. Our due diligence approach uncovers issues that standard Western playbooks miss, while our local presence enables ongoing verification and relationship management."
    },
    {
        title: "Integration Success",
        description: "Our support does not end at closing. We provide structured integration planning that respects local practices while achieving your strategic objectives. This balanced approach dramatically improves success rates for international acquisitions in Asian markets."
    }
];

const testimonials = [
    {
        quote: "Nobridge's due diligence team saved us from a potential disaster. Their deep dive into the target's technical debt revealed issues we would have missed. We adjusted our offer and secured a much better deal.",
        author: "James Sterling",
        role: "Managing Partner at Sterling Capital"
    },
    {
        quote: "As a first-time acquirer, I was overwhelmed. Nobridge guided me through every step, from identifying targets to closing financing. They made the complex simple.",
        author: "David Wu",
        role: "Director of Wu Holdings"
    },
    {
        quote: "We have worked with many advisory firms, but Nobridge's ability to bridge the cultural gap in cross-border deals is unmatched. They facilitated a smooth acquisition of a Japanese manufacturing firm that transformed our supply chain.",
        author: "Robert Muller",
        role: "COO of AutoParts Global"
    },
    {
        quote: "Their proprietary deal flow is impressive. We saw opportunities that were completely off-market. The acquisition we closed last quarter has already added significant value to our portfolio.",
        author: "Jennifer Law",
        role: "VP of Strategy at Nexus Group"
    }
];

function TestimonialCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const next = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    const prev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

    return (
        <div className="w-full">
            <div className="border border-brand-dark-blue/10 p-8 md:p-10 min-h-[280px] flex flex-col justify-between transition-all duration-500 ease-in-out">
                <p className="text-xl md:text-2xl font-normal leading-relaxed text-brand-dark-blue text-justify">
                    &ldquo;{testimonials[currentIndex].quote}&rdquo;
                </p>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-8 pt-6 border-t border-brand-dark-blue/10">
                    <div>
                        <h4 className="text-base font-medium text-brand-dark-blue">{testimonials[currentIndex].author}</h4>
                        <p className="text-sm text-muted-foreground">{testimonials[currentIndex].role}</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={prev}
                            className="w-10 h-10 border border-brand-dark-blue/20 flex items-center justify-center text-brand-dark-blue/50 hover:bg-brand-dark-blue/10 hover:text-brand-dark-blue transition-colors"
                            aria-label="Previous testimonial"
                        >
                            <ChevronRight className="w-4 h-4 rotate-180" />
                        </button>
                        <button
                            onClick={next}
                            className="w-10 h-10 border border-brand-dark-blue/20 flex items-center justify-center text-brand-dark-blue/50 hover:bg-brand-dark-blue/10 hover:text-brand-dark-blue transition-colors"
                            aria-label="Next testimonial"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function BuyerServicesPage() {
    return (
        <div className="bg-white">
            {/* Hero */}
            <section className="w-full min-h-[60vh] bg-brand-dark-blue flex items-center text-white section-lines-light">
                <div className="container mx-auto">
                    <FadeIn direction="up" delay={200}>
                        <div className="text-center px-4 space-y-6">
                            <p className="text-sm font-normal uppercase text-brand-sky-blue tracking-wider font-heading">
                                Buy-Side Advisory
                            </p>
                            <h1 className="text-4xl md:text-6xl font-normal font-heading tracking-tight">
                                Find the right business. Acquire it on the right terms.
                            </h1>
                            <p className="text-lg md:text-xl text-blue-100 font-light max-w-2xl mx-auto leading-relaxed">
                                We source proprietary deal flow, run rigorous target screening, coordinate due diligence, structure creative deals, and sit across the table with you through close and beyond.
                            </p>
                        </div>
                    </FadeIn>
                </div>
            </section>

            {/* Overview */}
            <section className="w-full py-20 md:py-24 bg-white section-lines-dark">
                <div className="container mx-auto">
                    <FadeIn direction="up">
                        <div className="px-4 mb-16">
                            <p className="text-sm font-normal uppercase text-brand-sky-blue tracking-wider mb-3 font-heading">
                                What We Do
                            </p>
                            <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-brand-dark-blue font-heading mb-6">
                                End-to-end acquisition advisory for buyers targeting Asia
                            </h2>
                            <div className="max-w-3xl">
                                <p className="text-muted-foreground text-lg leading-relaxed">
                                    Whether you are making your first acquisition or building a portfolio through serial M&A, we provide the local intelligence, cross-border expertise, and deal execution capability that international buyers need to succeed in Asian markets. Our eight-step process covers everything from strategy definition through post-close value creation, so nothing falls through the cracks.
                                </p>
                            </div>
                        </div>
                    </FadeIn>

                    <FadeIn>
                        <div className="flex flex-col md:flex-row">
                            <div className="flex-1 border border-brand-dark-blue/10 p-8 md:p-10">
                                <p className="text-sm font-normal uppercase text-brand-sky-blue tracking-wider mb-2 font-heading">Target Range</p>
                                <p className="text-3xl md:text-4xl font-heading text-brand-dark-blue">$2M - $50M</p>
                                <p className="text-muted-foreground mt-2">Enterprise value for acquisition targets</p>
                            </div>
                            <div className="flex-1 border border-brand-dark-blue/10 border-t-0 md:border-t md:border-l-0 p-8 md:p-10">
                                <p className="text-sm font-normal uppercase text-brand-sky-blue tracking-wider mb-2 font-heading">Market Coverage</p>
                                <p className="text-3xl md:text-4xl font-heading text-brand-dark-blue">Asia-Wide</p>
                                <p className="text-muted-foreground mt-2">On-the-ground presence and local networks</p>
                            </div>
                            <div className="flex-1 border border-brand-dark-blue/10 border-t-0 md:border-t md:border-l-0 p-8 md:p-10">
                                <p className="text-sm font-normal uppercase text-brand-sky-blue tracking-wider mb-2 font-heading">Deal Flow</p>
                                <p className="text-3xl md:text-4xl font-heading text-brand-dark-blue">On + Off Market</p>
                                <p className="text-muted-foreground mt-2">Proprietary sourcing and marketplace access</p>
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </section>

            {/* Process */}
            <div className="border-t border-brand-dark-blue/10" />
            <section className="w-full py-20 md:py-24 bg-brand-dark-blue text-white section-lines-light">
                <div className="container mx-auto">
                    <FadeIn direction="up">
                        <div className="px-4 mb-16">
                            <p className="text-sm font-normal uppercase text-brand-sky-blue tracking-wider mb-3 font-heading">
                                How It Works
                            </p>
                            <h2 className="text-3xl md:text-4xl font-normal tracking-tight font-heading mb-6">
                                From strategy to value creation, in four phases
                            </h2>
                            <p className="text-blue-100 text-lg max-w-3xl leading-relaxed">
                                Our acquisition process is structured into four clear phases, each supported by specialized service areas. This gives you visibility into where you are, what comes next, and exactly what our team is delivering at every stage.
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
                                        <p className="text-blue-100/70 leading-relaxed">{step.body}</p>
                                    </div>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Grid */}
            <div className="border-t border-brand-dark-blue/10" />
            <section className="w-full py-20 md:py-24 bg-white section-lines-dark">
                <div className="container mx-auto">
                    <FadeIn direction="up">
                        <div className="px-4 mb-16">
                            <p className="text-sm font-normal uppercase text-brand-sky-blue tracking-wider mb-3 font-heading">
                                Our Services
                            </p>
                            <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-brand-dark-blue font-heading mb-6">
                                Eight specialized service areas, one seamless process
                            </h2>
                            <p className="text-muted-foreground text-lg max-w-3xl leading-relaxed">
                                Each service area is designed to address a specific phase of the acquisition journey. Click any card to explore the full scope of what we deliver.
                            </p>
                        </div>
                    </FadeIn>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                        {services.map((service, index) => {
                            const Icon = service.icon;
                            return (
                                <Dialog key={service.id}>
                                    <DialogTrigger asChild>
                                        <FadeIn delay={index * 60}>
                                            <div className={cn(
                                                "group relative p-8 md:p-10 min-h-[340px] flex flex-col justify-between cursor-pointer transition-all duration-300 hover:bg-brand-light-gray/50",
                                                "border border-brand-dark-blue/10",
                                                index >= 4 && "border-t-0",
                                                index % 4 !== 0 && "lg:border-l-0",
                                                index % 2 !== 0 && "md:border-l-0 lg:border-l-0",
                                                index >= 1 && index < 4 && "border-t-0 md:border-t lg:border-t",
                                                index >= 4 && "md:border-t-0",
                                            )}>
                                                <div>
                                                    <span className="text-sm font-heading text-brand-sky-blue mb-4 block">{service.num}</span>
                                                    <div className="mb-4">
                                                        <Icon className="w-8 h-8 text-brand-dark-blue/30 group-hover:text-brand-sky-blue transition-colors" />
                                                    </div>
                                                    <h3 className="text-lg font-medium mb-3 text-brand-dark-blue group-hover:text-brand-sky-blue transition-colors leading-tight">
                                                        {service.title}
                                                    </h3>
                                                    <p className="text-muted-foreground leading-relaxed text-sm line-clamp-3">
                                                        {service.summary}
                                                    </p>
                                                </div>
                                                <div className="mt-6">
                                                    <div className="w-9 h-9 border border-brand-dark-blue/20 flex items-center justify-center text-brand-dark-blue/50 group-hover:bg-brand-dark-blue group-hover:text-white group-hover:border-brand-dark-blue transition-all">
                                                        <ChevronRight className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        </FadeIn>
                                    </DialogTrigger>
                                    <DialogContent className="bg-brand-dark-blue border-white/10 text-white max-w-4xl p-0 overflow-hidden rounded-none">
                                        <div className="flex flex-col max-h-[85vh]">
                                            <div className="px-8 md:px-10 pt-8 md:pt-10 pb-6">
                                                <DialogHeader>
                                                    <DialogDescription className="text-brand-sky-blue text-sm font-normal uppercase tracking-wider mb-2">
                                                        {service.num} / Service Details
                                                    </DialogDescription>
                                                    <DialogTitle className="text-2xl md:text-3xl font-normal font-heading text-white">
                                                        {service.title}
                                                    </DialogTitle>
                                                </DialogHeader>
                                            </div>
                                            <div className="mx-8 md:mx-10 border-t border-white/10" />
                                            <div className="px-8 md:px-10 py-6 overflow-y-auto flex-1">
                                                <div className="space-y-4 text-blue-100/80 leading-relaxed text-base whitespace-pre-wrap text-justify">
                                                    {service.fullDescription}
                                                </div>
                                            </div>
                                            <div className="mx-8 md:mx-10 border-t border-white/10" />
                                            <div className="px-8 md:px-10 py-6 flex justify-end">
                                                <a
                                                    href="https://cal.com/ahmad-fadil-lubis/nobridge-buyer"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-brand-dark-blue bg-white hover:bg-white/90 rounded-none transition-colors"
                                                >
                                                    Schedule Consultation
                                                </a>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Why Choose */}
            <div className="border-t border-brand-dark-blue/10" />
            <section className="w-full py-20 md:py-24 bg-brand-dark-blue text-white section-lines-light">
                <div className="container mx-auto">
                    <FadeIn direction="up">
                        <div className="px-4 mb-16">
                            <p className="text-sm font-normal uppercase text-brand-sky-blue tracking-wider mb-3 font-heading">
                                Why Nobridge
                            </p>
                            <h2 className="text-3xl md:text-4xl font-normal tracking-tight font-heading">
                                Your boots on the ground in Asia
                            </h2>
                        </div>
                    </FadeIn>

                    <FadeIn>
                        <div className="flex flex-col md:flex-row">
                            {whyUs.slice(0, 2).map((item, index) => (
                                <div key={index} className={cn(
                                    "flex-1 border border-white/15 p-8 md:p-10",
                                    index > 0 && "border-t-0 md:border-t md:border-l-0"
                                )}>
                                    <h3 className="text-xl font-medium text-white mb-4">{item.title}</h3>
                                    <p className="text-blue-100/70 leading-relaxed">{item.description}</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col md:flex-row">
                            {whyUs.slice(2, 4).map((item, index) => (
                                <div key={index} className={cn(
                                    "flex-1 border border-white/15 border-t-0 p-8 md:p-10",
                                    index > 0 && "md:border-l-0"
                                )}>
                                    <h3 className="text-xl font-medium text-white mb-4">{item.title}</h3>
                                    <p className="text-blue-100/70 leading-relaxed">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </FadeIn>
                </div>
            </section>

            {/* Testimonials */}
            <div className="border-t border-brand-dark-blue/10" />
            <section className="w-full py-20 md:py-24 bg-brand-light-gray/30 section-lines-dark">
                <div className="container mx-auto">
                    <FadeIn direction="up">
                        <div className="px-4">
                            <p className="text-sm font-normal uppercase text-brand-sky-blue tracking-wider mb-3 font-heading">
                                Client Feedback
                            </p>
                            <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-brand-dark-blue font-heading mb-12">
                                What our clients say
                            </h2>
                            <TestimonialCarousel />
                        </div>
                    </FadeIn>
                </div>
            </section>

            {/* CTA */}
            <div className="border-t border-brand-dark-blue/10" />
            <section className="w-full py-12 md:py-12 bg-brand-white section-lines-dark">
                <div className="container mx-auto">
                    <FadeIn direction="up">
                        <div className="border border-brand-dark-blue/10">
                            <div className="relative px-4 sm:px-8 md:px-16 py-16 md:py-0 md:aspect-[21/9] text-center overflow-hidden" style={{ backgroundImage: 'url(/assets/cta-cityscape-light.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                                <div className="relative z-10 flex flex-col items-center justify-center h-full">
                                    <div className="border border-brand-dark-blue/20 bg-white/50 backdrop-blur-sm px-6 sm:px-10 md:px-16 py-8 sm:py-10 md:py-14">
                                        <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-brand-dark-blue mb-4 font-heading">
                                            Ready to accelerate your growth?
                                        </h2>
                                        <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto mb-6 sm:mb-8 md:mb-10 text-center">
                                            Whether you are making your first acquisition or building through serial M&A, we provide the insights and execution support needed to achieve your objectives.
                                        </p>
                                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                                            <a
                                                href="https://cal.com/ahmad-fadil-lubis/nobridge-buyer"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium bg-brand-dark-blue text-brand-white hover:bg-brand-dark-blue/90 h-11 py-3 px-12 text-base transition-colors"
                                            >
                                                Start Your Acquisition Journey
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
