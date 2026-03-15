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
    Target,
    TrendingUp,
    FileText,
    Globe,
    Handshake,
    Shield,
    CheckCircle,
    HeartHandshake
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const services = [
    {
        id: "assessment",
        num: "01",
        title: "Exit Assessment",
        icon: Target,
        summary: "We evaluate your business's exit readiness, benchmark valuations against recent comparable transactions, map the buyer landscape, and develop a strategic roadmap designed to position you for maximum value at sale.",
        fullDescription: `This foundational service evaluates your business's exit readiness and establishes the strategic framework for maximizing value. We conduct a thorough assessment of your company's current position, including financial health, market standing, competitive advantages, and potential buyer appeal. This encompasses business valuation, market timing analysis, buyer landscape mapping, and identification of value drivers and detractors. We also evaluate various exit alternatives including full sale, partial sale, recapitalization, or strategic partnerships.

Our assessment goes beyond numbers to examine qualitative factors that influence valuation, including management depth, customer concentration, technology infrastructure, and scalability potential. We benchmark your business against recent comparable transactions and current market multiples, providing realistic expectations for valuation ranges and deal structures. This includes analyzing industry consolidation trends, identifying strategic and financial buyer interests, and understanding how current market conditions affect your specific sector.

The outcome is a comprehensive exit readiness report with a clear roadmap outlining optimal timing, necessary preparations, and expected outcomes. We identify specific areas requiring attention before going to market, estimate value improvement potential, and develop a timeline that balances market conditions with your personal objectives. This strategic foundation ensures every subsequent action is aligned with achieving maximum value at exit.`
    },
    {
        id: "optimization",
        num: "02",
        title: "Value Enhancement",
        icon: TrendingUp,
        summary: "We identify and implement concrete improvements across your business that directly increase valuation multiples and buyer appeal, from financial clean-up and margin optimization to building management depth and reducing key-person risk.",
        fullDescription: `This transformative service focuses on implementing concrete improvements that directly impact your business's valuation multiple and buyer appeal. We work across all functional areas to optimize operations, strengthen financial performance, reduce risk factors, and enhance growth potential. This includes EBITDA margin improvement initiatives, working capital optimization, customer and supplier diversification, management team development, systems and process documentation, and intellectual property protection.

Our value enhancement process typically spans 6-18 months and follows a structured methodology. We begin by identifying quick wins that demonstrate momentum, then tackle larger structural improvements that fundamentally strengthen the business. This might involve implementing new financial reporting systems, establishing recurring revenue models, expanding into adjacent markets, or building strategic partnerships. We also address risk factors that concern buyers, such as customer concentration, key person dependencies, or regulatory compliance gaps.

Every enhancement initiative is evaluated through the lens of buyer perception and ROI. We focus on improvements that buyers will pay for, those that reduce risk, increase scalability, or unlock growth potential. This might include digital transformation projects that modernize operations, geographic expansion that diversifies revenue, or building a second-tier management team that ensures continuity post-sale. Our hands-on approach ensures these improvements are actually implemented, not just recommended.

The measurable impact of this service often exceeds the cost by 10-20x, with businesses typically seeing valuation increases of 2-3 EBITDA turns. More importantly, these improvements make your business more attractive to a broader universe of buyers, creating competitive tension that further drives value.`
    },
    {
        id: "documentation",
        num: "03",
        title: "Transaction Preparation",
        icon: FileText,
        summary: "We transform your business information into professional, institutional-grade documentation, including Confidential Information Memorandums, financial models, management presentations, and fully organized virtual data rooms that anticipate buyer questions.",
        fullDescription: `This service transforms your business information into compelling, professional documentation that tells your story effectively while facilitating efficient due diligence. We develop comprehensive information memorandums, detailed financial models, management presentations, and virtual data rooms that anticipate buyer questions and accelerate decision-making. This includes historical financial restatements, quality of earnings analysis, customer and market analytics, growth strategy documentation, and competitive positioning materials.

We craft a compelling equity story that resonates with different buyer types, including strategic acquirers seeking synergies, financial buyers focused on returns, or international buyers looking for market entry. This narrative weaves together your historical performance, current capabilities, and future potential into a coherent investment thesis. We prepare detailed management presentations that showcase your team's expertise, create financial models that buyers can rely on for their own analysis, and compile supporting documentation that validates every claim.

The preparation extends to organizing your legal, financial, and operational documentation for seamless due diligence. We conduct pre-sale due diligence to identify and address potential issues before buyers discover them, prepare disclosure schedules that properly manage liability, and create vendor due diligence reports that accelerate buyer evaluation. This proactive approach reduces deal friction, maintains momentum, and prevents the value erosion that occurs when buyers uncover surprises.`
    },
    {
        id: "outreach",
        num: "04",
        title: "Buyer Outreach",
        icon: Globe,
        summary: "We execute targeted, confidential outreach campaigns across our global buyer network spanning strategic acquirers, private equity, family offices, and high-net-worth individuals to create competitive tension and drive premium valuations for your business.",
        fullDescription: `This service leverages our extensive network and systematic approach to identify and engage the optimal mix of potential acquirers for your business. We go beyond obvious buyers to uncover international acquirers, adjacent industry players, and financial buyers who see unique value in your company. This includes strategic buyer mapping across your value chain, private equity fund targeting based on investment thesis fit, international buyer identification particularly from Asia and other high-growth markets, and cultivation of management buyout or employee ownership alternatives.

Our outreach strategy is carefully orchestrated to create competitive tension while maintaining confidentiality. We develop customized approaches for different buyer segments, crafting targeted teasers that highlight relevant synergies or investment merits. For strategic buyers, we emphasize operational synergies and market expansion opportunities. For financial buyers, we focus on cash flow generation and growth potential. For international buyers, we position your business as a platform for geographic expansion.

We manage a controlled auction process that balances broad market exposure with confidentiality protection. This includes coordinating NDAs and initial information exchange, managing a staged information release that maintains buyer interest, facilitating management meetings that showcase your team effectively, and creating competitive dynamics through parallel negotiations. Our process typically engages 50-150 potential buyers to yield 5-10 serious bidders, ultimately driving premium valuations through competition.`
    },
    {
        id: "negotiation",
        num: "05",
        title: "Deal Negotiation",
        icon: Handshake,
        summary: "We negotiate across every dimension of the transaction, not just price, but structure, payment terms, earnout mechanics, escrow provisions, non-competes, and risk allocation, ensuring your total after-tax proceeds are maximized.",
        fullDescription: `This critical service focuses on negotiating optimal terms across all aspects of the transaction, not just price, but structure, timing, conditions, and risk allocation. We serve as your advocate in navigating complex negotiations around purchase price and payment terms, earnout structures and achievement metrics, escrow amounts and survival periods, representations, warranties, and indemnities, working capital adjustments and other purchase price modifications, and employment agreements and non-compete terms.

Our negotiation strategy goes beyond single-issue bargaining to create value through creative deal structuring. We might negotiate seller financing that achieves your price while giving buyers comfort, structure earnouts that reward future performance while protecting against manipulation, or design escrow terms that minimize holdbacks while addressing buyer concerns. We understand how different deal terms interact and can make strategic trade-offs that maximize your total after-tax proceeds.

We maintain competitive tension throughout negotiations, using multiple bidders to improve terms even after selecting a preferred buyer. Our experience with hundreds of transactions means we know what is market, what is negotiable, and where to push hard. We prevent deal fatigue by managing the negotiation pace, keeping momentum while ensuring critical issues are properly addressed. This includes coordinating with legal counsel on purchase agreement negotiations, working with tax advisors on structure optimization, and managing stakeholder communications to maintain alignment.`
    },
    {
        id: "diligence",
        num: "06",
        title: "Due Diligence Management",
        icon: Shield,
        summary: "We manage the entire due diligence process across financial, legal, commercial, and operational workstreams, coordinating hundreds of information requests while maintaining business confidentiality and deal momentum.",
        fullDescription: `This service manages the intensive scrutiny period where buyers verify assumptions and uncover risks, ensuring smooth information flow while protecting your negotiating position. We coordinate responses across financial, legal, commercial, operational, and technical due diligence workstreams, managing hundreds of information requests while maintaining business confidentiality. This includes establishing secure data rooms with staged information release, coordinating subject matter expert responses, managing site visits and management meetings, and tracking buyer concerns to address proactively.

Our approach transforms due diligence from a defensive exercise into an opportunity to reinforce value. We prepare your team to handle buyer inquiries confidently, ensuring consistent messaging that supports your equity story. We anticipate likely areas of concern based on buyer type and prepare robust responses that address issues while maintaining valuation arguments. This might involve preparing detailed customer retention analyses, providing additional color on financial adjustments, or demonstrating integration planning that validates synergy assumptions.

We maintain deal momentum by managing the due diligence timeline and preventing scope creep. This includes establishing clear protocols for information requests, pushing back on fishing expeditions that delay closing, and escalating critical issues for immediate resolution. We also monitor buyer behavior for signs of price renegotiation attempts, maintaining leverage by keeping backup bidders engaged when appropriate. Our systematic approach typically reduces due diligence timelines by 30-40% while improving outcomes.`
    },
    {
        id: "closing",
        num: "07",
        title: "Closing Execution",
        icon: CheckCircle,
        summary: "We manage every detail of the final phase from signing to close, coordinating all parties to resolve conditions, finalize documentation, navigate regulatory approvals, and ensure your transaction closes on schedule with terms intact.",
        fullDescription: `This service manages the complex final phase from signing to closing, where deals are won or lost in the details. We coordinate all parties to resolve conditions precedent, finalize legal documentation, manage regulatory approvals, coordinate financing confirmations, and oversee pre-closing adjustments. This includes shepherding purchase agreement finalization, managing third-party consents and approvals, coordinating employment and transition agreements, and overseeing escrow and payment logistics.

The closing phase often involves intense final negotiations as buyers attempt to renegotiate based on due diligence findings or market changes. We protect your value by distinguishing legitimate issues from negotiating tactics, maintaining walk-away credibility through backup options, and finding creative solutions to bridge gaps without sacrificing value. We also manage the numerous workstreams required for closing, ensuring nothing falls through the cracks during this critical period.

We coordinate with all advisors to ensure smooth execution, including legal counsel on documentation, accountants on working capital calculations, tax advisors on structure implementation, and banks on payment mechanics. Our project management approach includes detailed closing checklists, regular status calls with all parties, and contingency planning for potential delays. This orchestration ensures your transaction closes on schedule with terms intact.`
    },
    {
        id: "post-transaction",
        num: "08",
        title: "Post-Close Support",
        icon: HeartHandshake,
        summary: "We provide ongoing support after close to protect your interests during transition, manage earnout tracking and achievement, defend against improper escrow claims, and ensure working capital adjustments are calculated correctly.",
        fullDescription: `This often-overlooked service ensures you achieve maximum value from all transaction components, particularly contingent payments and transition obligations. We provide ongoing support for earnout achievement and protection, transition services agreement management, working capital adjustment disputes, escrow claim defense, and employment/consulting agreement optimization. This post-close support can significantly impact your total proceeds, particularly in deals with substantial deferred consideration.

For earnout arrangements, we help establish tracking and reporting mechanisms that protect your interests while working within the buyer's organization. This includes negotiating operational covenants that prevent manipulation, establishing clear metrics and calculation methodologies, and maintaining documentation for potential disputes. We have seen earnouts range from 10-40% of total consideration, making their successful achievement crucial for value realization.

We also manage transition services agreements that require ongoing involvement, ensuring you are fairly compensated while responsibilities are properly transferred. This includes defining specific deliverables and timelines, establishing appropriate compensation structures, and managing the gradual knowledge transfer process. Our support extends to defending against improper escrow claims and ensuring working capital adjustments are calculated correctly. This comprehensive post-close support typically adds 5-15% to total seller proceeds through successful earnout achievement and claim defense.`
    }
];

const processSteps = [
    {
        num: "01",
        title: "Discovery and Assessment",
        body: "We begin with a confidential consultation to understand your goals, timeline, and business fundamentals. From there, we conduct a thorough exit assessment that includes valuation benchmarking, readiness analysis, and strategic positioning to ensure you enter the market from a position of strength.",
    },
    {
        num: "02",
        title: "Preparation and Positioning",
        body: "If needed, we implement targeted value enhancement to strengthen your business before going to market. We then prepare institutional-grade transaction materials including a Confidential Information Memorandum, financial models, and a fully organized data room that anticipates buyer questions.",
    },
    {
        num: "03",
        title: "Outreach and Engagement",
        body: "We execute a confidential, targeted buyer outreach campaign across our global network of strategic acquirers, private equity firms, family offices, and qualified individuals. Our process creates competitive tension among serious bidders while protecting your confidentiality at every stage.",
    },
    {
        num: "04",
        title: "Negotiation Through Close",
        body: "We manage the entire negotiation, due diligence, and closing process on your behalf. From structuring deal terms and managing information flow to coordinating with legal counsel and handling last-minute issues, we stay deeply involved until the deal is closed and your proceeds are secured.",
    },
];

const whyUs = [
    {
        title: "Cross-Border Expertise",
        description: "We bridge Asian sellers with global buyers, accessing premium valuations from international acquirers who value your market position and growth potential. Our bilingual teams and cultural fluency eliminate communication barriers that often derail cross-border deals."
    },
    {
        title: "SME Specialization",
        description: "Unlike large investment banks focused on mega-deals, we understand the unique dynamics of selling SMEs, from owner dependencies to informal processes. We know how to position your business to institutional buyers while addressing the specific challenges mid-market companies face."
    },
    {
        title: "End-to-End Value Creation",
        description: "We do not just sell businesses; we transform them first. Our value enhancement programs typically increase exit valuations by 20-40%, meaning millions more in your pocket. We handle everything from operational improvements to buyer negotiations, ensuring no value is left on the table."
    },
    {
        title: "Proven Process",
        description: "Our systematic approach combines global best practices with local market knowledge. We create competitive tension through structured auctions, identify non-obvious buyers, and maintain leverage throughout negotiations, all while protecting confidentiality and ensuring business continuity."
    }
];

const testimonials = [
    {
        quote: "Working with Nobridge has been a truly fantastic experience. Their dedicated support has greatly simplified our exit process, allowing us to find the right buyer efficiently. We are grateful to have them as our partner.",
        author: "Daniel Rogh",
        role: "Founder at TechFlow Solutions"
    },
    {
        quote: "The valuation process was eye-opening. Nobridge did not just give us a number; they showed us how to increase it. Six months later, we exited at a 30% higher multiple than we initially expected.",
        author: "Sarah Jenkins",
        role: "CEO of GreenLeaf Logistics"
    },
    {
        quote: "Selling a family business is emotional. The team at Nobridge understood that. They handled the negotiations with such professionalism and care that I felt completely supported throughout the entire transition.",
        author: "Michael Chen",
        role: "Owner of Chen Manufacturing"
    },
    {
        quote: "I was skeptical about finding a buyer for my niche SaaS platform. Nobridge's network is real. They brought multiple qualified offers to the table within weeks, not months.",
        author: "Elena Rodriguez",
        role: "Founder of DataSync.io"
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

export default function SellerServicesPage() {
    return (
        <div className="bg-white">
            {/* Hero */}
            <section className="w-full min-h-[60vh] bg-brand-dark-blue flex items-center text-white section-lines-light">
                <div className="container mx-auto">
                    <FadeIn direction="up" delay={200}>
                        <div className="text-center px-4 space-y-6">
                            <p className="text-sm font-normal uppercase text-brand-sky-blue tracking-wider font-heading">
                                Sell-Side Advisory
                            </p>
                            <h1 className="text-4xl md:text-6xl font-normal font-heading tracking-tight">
                                Your business deserves the exit it earned.
                            </h1>
                            <p className="text-lg md:text-xl text-blue-100 font-light max-w-2xl mx-auto leading-relaxed">
                                From initial assessment and business positioning through buyer outreach, negotiation, due diligence, and close, we run your entire exit so you can stay focused on the business.
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
                                Full-service exit advisory for business owners across Asia
                            </h2>
                            <div className="max-w-3xl">
                                <p className="text-muted-foreground text-lg leading-relaxed">
                                    Most business owners go through an exit once in their lifetime. We do it every day. Our structured, eight-step process is designed to prepare your business for market, reach the widest possible universe of qualified buyers, and negotiate every detail of the transaction to maximize your outcome. Whether you are planning an exit in six months or three years, we meet you where you are and build a path to close.
                                </p>
                            </div>
                        </div>
                    </FadeIn>

                    <FadeIn>
                        <div className="flex flex-col md:flex-row">
                            <div className="flex-1 border border-brand-dark-blue/10 p-8 md:p-10">
                                <p className="text-sm font-normal uppercase text-brand-sky-blue tracking-wider mb-2 font-heading">Enterprise Value</p>
                                <p className="text-3xl md:text-4xl font-heading text-brand-dark-blue">$2M - $50M</p>
                                <p className="text-muted-foreground mt-2">Our core focus for sell-side mandates</p>
                            </div>
                            <div className="flex-1 border border-brand-dark-blue/10 border-t-0 md:border-t md:border-l-0 p-8 md:p-10">
                                <p className="text-sm font-normal uppercase text-brand-sky-blue tracking-wider mb-2 font-heading">Buyer Reach</p>
                                <p className="text-3xl md:text-4xl font-heading text-brand-dark-blue">Global</p>
                                <p className="text-muted-foreground mt-2">Strategic, PE, family offices, HNWIs</p>
                            </div>
                            <div className="flex-1 border border-brand-dark-blue/10 border-t-0 md:border-t md:border-l-0 p-8 md:p-10">
                                <p className="text-sm font-normal uppercase text-brand-sky-blue tracking-wider mb-2 font-heading">Sectors</p>
                                <p className="text-3xl md:text-4xl font-heading text-brand-dark-blue">All Industries</p>
                                <p className="text-muted-foreground mt-2">Manufacturing, tech, services, consumer, and more</p>
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
                                A structured path from assessment to close
                            </h2>
                            <p className="text-blue-100 text-lg max-w-3xl leading-relaxed">
                                Every engagement follows a disciplined, four-phase process. Within each phase, our team handles the detailed work across eight specialized service areas, so you always know where you are and what comes next.
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
                                Each service area is designed to address a specific phase of the exit journey. Click any card to explore the full scope of what we deliver.
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
                                                    href="https://cal.com/fachri-budianto-nobridge-seller"
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
                                Built for the deals that matter most to you
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
                                            Ready to start a conversation?
                                        </h2>
                                        <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto mb-6 sm:mb-8 md:mb-10 text-center">
                                            Whether you are planning an exit in the next 6 months or 3 years, now is the time to prepare. Book a confidential, no-obligation consultation with our team.
                                        </p>
                                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                                            <a
                                                href="https://cal.com/fachri-budianto-nobridge-seller"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium bg-brand-dark-blue text-brand-white hover:bg-brand-dark-blue/90 h-11 py-3 px-12 text-base transition-colors"
                                            >
                                                Start Your Exit Journey
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
