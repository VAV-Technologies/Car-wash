"use client";

import { useState } from "react";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { FadeIn } from "@/components/ui/fade-in";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    ArrowRight,
    ChevronRight,
    Plus,
    Quote,
    Target,
    TrendingUp,
    FileText,
    Globe,
    Handshake,
    Shield,
    CheckCircle,
    HeartHandshake
} from "lucide-react";
import Link from "next/link";

// Content Data
const services = [
    {
        id: "assessment",
        title: "Exit Assessment",
        icon: Target,
        summary: "We evaluate exit readiness, benchmark valuations, and develop strategic roadmaps for maximum value.",
        fullDescription: `This foundational service evaluates your business's exit readiness and establishes the strategic framework for maximizing value. We conduct a thorough assessment of your company's current position, including financial health, market standing, competitive advantages, and potential buyer appeal. This encompasses business valuation, market timing analysis, buyer landscape mapping, and identification of value drivers and detractors. We also evaluate various exit alternatives including full sale, partial sale, recapitalization, or strategic partnerships.

Our assessment goes beyond numbers to examine qualitative factors that influence valuation – management depth, customer concentration, technology infrastructure, and scalability potential. We benchmark your business against recent comparable transactions and current market multiples, providing realistic expectations for valuation ranges and deal structures. This includes analyzing industry consolidation trends, identifying strategic and financial buyer interests, and understanding how current market conditions affect your specific sector.

The outcome is a comprehensive exit readiness report with a clear roadmap outlining optimal timing, necessary preparations, and expected outcomes. We identify specific areas requiring attention before going to market, estimate value improvement potential, and develop a timeline that balances market conditions with your personal objectives. This strategic foundation ensures every subsequent action is aligned with achieving maximum value at exit.`
    },
    {
        id: "optimization",
        title: "Value Enhancement",
        icon: TrendingUp,
        summary: "We implement improvements to strengthen fundamentals and increase value by 20-40 percent.",
        fullDescription: `This transformative service focuses on implementing concrete improvements that directly impact your business's valuation multiple and buyer appeal. We work across all functional areas to optimize operations, strengthen financial performance, reduce risk factors, and enhance growth potential. This includes EBITDA margin improvement initiatives, working capital optimization, customer and supplier diversification, management team development, systems and process documentation, and intellectual property protection.

Our value enhancement process typically spans 6-18 months and follows a structured methodology. We begin by identifying quick wins that demonstrate momentum, then tackle larger structural improvements that fundamentally strengthen the business. This might involve implementing new financial reporting systems, establishing recurring revenue models, expanding into adjacent markets, or building strategic partnerships. We also address risk factors that concern buyers, such as customer concentration, key person dependencies, or regulatory compliance gaps.

Every enhancement initiative is evaluated through the lens of buyer perception and ROI. We focus on improvements that buyers will pay for – those that reduce risk, increase scalability, or unlock growth potential. This might include digital transformation projects that modernize operations, geographic expansion that diversifies revenue, or building a second-tier management team that ensures continuity post-sale. Our hands-on approach ensures these improvements are actually implemented, not just recommended.

The measurable impact of this service often exceeds the cost by 10-20x, with businesses typically seeing valuation increases of 2-3 EBITDA turns. More importantly, these improvements make your business more attractive to a broader universe of buyers, creating competitive tension that further drives value.`
    },
    {
        id: "documentation",
        title: "Transaction Prep",
        icon: FileText,
        summary: "We create compelling documentation and data rooms that tell your story effectively.",
        fullDescription: `This service transforms your business information into compelling, professional documentation that tells your story effectively while facilitating efficient due diligence. We develop comprehensive information memorandums, detailed financial models, management presentations, and virtual data rooms that anticipate buyer questions and accelerate decision-making. This includes historical financial restatements, quality of earnings analysis, customer and market analytics, growth strategy documentation, and competitive positioning materials.

We craft a compelling equity story that resonates with different buyer types – strategic acquirers seeking synergies, financial buyers focused on returns, or international buyers looking for market entry. This narrative weaves together your historical performance, current capabilities, and future potential into a coherent investment thesis. We prepare detailed management presentations that showcase your team's expertise, create financial models that buyers can rely on for their own analysis, and compile supporting documentation that validates every claim.

The preparation extends to organizing your legal, financial, and operational documentation for seamless due diligence. We conduct pre-sale due diligence to identify and address potential issues before buyers discover them, prepare disclosure schedules that properly manage liability, and create vendor due diligence reports that accelerate buyer evaluation. This proactive approach reduces deal friction, maintains momentum, and prevents the value erosion that occurs when buyers uncover surprises.`
    },
    {
        id: "outreach",
        title: "Buyer Outreach",
        icon: Globe,
        summary: "We leverage our network to engage strategic and financial buyers for premium valuations.",
        fullDescription: `This service leverages our extensive network and systematic approach to identify and engage the optimal mix of potential acquirers for your business. We go beyond obvious buyers to uncover international acquirers, adjacent industry players, and financial buyers who see unique value in your company. This includes strategic buyer mapping across your value chain, private equity fund targeting based on investment thesis fit, international buyer identification particularly from Asia and other high-growth markets, and cultivation of management buyout or employee ownership alternatives.

Our outreach strategy is carefully orchestrated to create competitive tension while maintaining confidentiality. We develop customized approaches for different buyer segments, crafting targeted teasers that highlight relevant synergies or investment merits. For strategic buyers, we emphasize operational synergies and market expansion opportunities. For financial buyers, we focus on cash flow generation and growth potential. For international buyers, we position your business as a platform for geographic expansion.

We manage a controlled auction process that balances broad market exposure with confidentiality protection. This includes coordinating NDAs and initial information exchange, managing a staged information release that maintains buyer interest, facilitating management meetings that showcase your team effectively, and creating competitive dynamics through parallel negotiations. Our process typically engages 50-150 potential buyers to yield 5-10 serious bidders, ultimately driving premium valuations through competition.`
    },
    {
        id: "negotiation",
        title: "Deal Negotiation",
        icon: Handshake,
        summary: "We negotiate optimal terms across all dimensions to maximize your after-tax proceeds.",
        fullDescription: `This critical service focuses on negotiating optimal terms across all aspects of the transaction – not just price, but structure, timing, conditions, and risk allocation. We serve as your advocate in navigating complex negotiations around purchase price and payment terms, earnout structures and achievement metrics, escrow amounts and survival periods, representations, warranties, and indemnities, working capital adjustments and other purchase price modifications, and employment agreements and non-compete terms.

Our negotiation strategy goes beyond single-issue bargaining to create value through creative deal structuring. We might negotiate seller financing that achieves your price while giving buyers comfort, structure earnouts that reward future performance while protecting against manipulation, or design escrow terms that minimize holdbacks while addressing buyer concerns. We understand how different deal terms interact and can make strategic trade-offs that maximize your total after-tax proceeds.

We maintain competitive tension throughout negotiations, using multiple bidders to improve terms even after selecting a preferred buyer. Our experience with hundreds of transactions means we know what's market, what's negotiable, and where to push hard. We prevent deal fatigue by managing the negotiation pace, keeping momentum while ensuring critical issues are properly addressed. This includes coordinating with legal counsel on purchase agreement negotiations, working with tax advisors on structure optimization, and managing stakeholder communications to maintain alignment.`
    },
    {
        id: "diligence",
        title: "Due Diligence",
        icon: Shield,
        summary: "We manage due diligence across all workstreams while maintaining momentum and value.",
        fullDescription: `This service manages the intensive scrutiny period where buyers verify assumptions and uncover risks, ensuring smooth information flow while protecting your negotiating position. We coordinate responses across financial, legal, commercial, operational, and technical due diligence workstreams, managing hundreds of information requests while maintaining business confidentiality. This includes establishing secure data rooms with staged information release, coordinating subject matter expert responses, managing site visits and management meetings, and tracking buyer concerns to address proactively.

Our approach transforms due diligence from a defensive exercise into an opportunity to reinforce value. We prepare your team to handle buyer inquiries confidently, ensuring consistent messaging that supports your equity story. We anticipate likely areas of concern based on buyer type and prepare robust responses that address issues while maintaining valuation arguments. This might involve preparing detailed customer retention analyses, providing additional color on financial adjustments, or demonstrating integration planning that validates synergy assumptions.

We maintain deal momentum by managing the due diligence timeline and preventing scope creep. This includes establishing clear protocols for information requests, pushing back on fishing expeditions that delay closing, and escalating critical issues for immediate resolution. We also monitor buyer behavior for signs of price renegotiation attempts, maintaining leverage by keeping backup bidders engaged when appropriate. Our systematic approach typically reduces due diligence timelines by 30-40% while improving outcomes.`
    },
    {
        id: "closing",
        title: "Closing Execution",
        icon: CheckCircle,
        summary: "We manage the final phase from signing to closing, ensuring deals close with terms intact.",
        fullDescription: `This service manages the complex final phase from signing to closing, where deals are won or lost in the details. We coordinate all parties to resolve conditions precedent, finalize legal documentation, manage regulatory approvals, coordinate financing confirmations, and oversee pre-closing adjustments. This includes shepherding purchase agreement finalization, managing third-party consents and approvals, coordinating employment and transition agreements, and overseeing escrow and payment logistics.

The closing phase often involves intense final negotiations as buyers attempt to renegotiate based on due diligence findings or market changes. We protect your value by distinguishing legitimate issues from negotiating tactics, maintaining walk-away credibility through backup options, and finding creative solutions to bridge gaps without sacrificing value. We also manage the numerous workstreams required for closing, ensuring nothing falls through the cracks during this critical period.

We coordinate with all advisors to ensure smooth execution – legal counsel on documentation, accountants on working capital calculations, tax advisors on structure implementation, and banks on payment mechanics. Our project management approach includes detailed closing checklists, regular status calls with all parties, and contingency planning for potential delays. This orchestration ensures your transaction closes on schedule with terms intact.`
    },
    {
        id: "post-transaction",
        title: "Post-Close Support",
        icon: HeartHandshake,
        summary: "We maximize value from earnouts and escrows, adding 5-15% to total proceeds post-close.",
        fullDescription: `This often-overlooked service ensures you achieve maximum value from all transaction components, particularly contingent payments and transition obligations. We provide ongoing support for earnout achievement and protection, transition services agreement management, working capital adjustment disputes, escrow claim defense, and employment/consulting agreement optimization. This post-close support can significantly impact your total proceeds, particularly in deals with substantial deferred consideration.

For earnout arrangements, we help establish tracking and reporting mechanisms that protect your interests while working within the buyer's organization. This includes negotiating operational covenants that prevent manipulation, establishing clear metrics and calculation methodologies, and maintaining documentation for potential disputes. We've seen earnouts range from 10-40% of total consideration, making their successful achievement crucial for value realization.

We also manage transition services agreements that require ongoing involvement, ensuring you're fairly compensated while responsibilities are properly transferred. This includes defining specific deliverables and timelines, establishing appropriate compensation structures, and managing the gradual knowledge transfer process. Our support extends to defending against improper escrow claims and ensuring working capital adjustments are calculated correctly. This comprehensive post-close support typically adds 5-15% to total seller proceeds through successful earnout achievement and claim defense.`
    }
];

const testimonials = [
    {
        quote: "Working with Nobridge has been a truly fantastic experience. Their dedicated support has greatly simplified our exit process, allowing us to find the right buyer efficiently. We're grateful to have them as our partner.",
        author: "Daniel Rogh",
        role: "Founder at TechFlow Solutions"
    },
    {
        quote: "The valuation process was eye-opening. Nobridge didn't just give us a number; they showed us how to increase it. Six months later, we exited at a 30% higher multiple than we initially expected.",
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

const whyUs = [
    {
        title: "Cross-Border Expertise",
        description: "We bridge Asian sellers with global buyers, accessing premium valuations from international acquirers who value your market position and growth potential. Our bilingual teams and cultural fluency eliminate communication barriers that often derail cross-border deals."
    },
    {
        title: "SME Specialization",
        description: "Unlike large investment banks focused on mega-deals, we understand the unique dynamics of selling SMEs – from owner dependencies to informal processes. We know how to position your business to institutional buyers while addressing the specific challenges mid-market companies face."
    },
    {
        title: "End-to-End Value Creation",
        description: "We don't just sell businesses; we transform them first. Our value enhancement programs typically increase exit valuations by 20-40%, meaning millions more in your pocket. We handle everything from operational improvements to buyer negotiations, ensuring no value is left on the table."
    },
    {
        title: "Proven Process",
        description: "Our systematic approach combines global best practices with local market knowledge. We create competitive tension through structured auctions, identify non-obvious buyers, and maintain leverage throughout negotiations – all while protecting confidentiality and ensuring business continuity."
    }
];

function TestimonialCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const next = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    };

    const prev = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    return (
        <div className="max-w-4xl">
            <div className="min-h-[200px] md:min-h-[180px] flex items-center">
                <p className="text-3xl md:text-4xl font-medium leading-tight text-brand-dark-blue mb-12 transition-all duration-500 ease-in-out">
                    "{testimonials[currentIndex].quote}"
                </p>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mt-8">
                <div>
                    <h4 className="text-lg font-medium text-brand-dark-blue transition-all duration-300">{testimonials[currentIndex].author}</h4>
                    <p className="text-brand-dark-blue/60 transition-all duration-300">{testimonials[currentIndex].role}</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={prev}
                        className="w-12 h-12 rounded border border-brand-dark-blue/20 flex items-center justify-center text-brand-dark-blue/50 hover:bg-brand-dark-blue/10 hover:text-brand-dark-blue transition-colors"
                        aria-label="Previous testimonial"
                    >
                        <ChevronRight className="w-5 h-5 rotate-180" />
                    </button>
                    <button
                        onClick={next}
                        className="w-12 h-12 rounded border border-brand-dark-blue/20 flex items-center justify-center text-brand-dark-blue/50 hover:bg-brand-dark-blue/10 hover:text-brand-dark-blue transition-colors"
                        aria-label="Next testimonial"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function SellerServicesPage() {
    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-white text-white font-sans">
            {/* Main Content Wrapper */}
            <div className="relative z-10">

                {/* --- HEADER SECTION --- */}
                <section className="py-24 md:py-32 px-6 text-center border-b border-gray-200 bg-white">
                    <div className="container mx-auto max-w-5xl">
                        <FadeIn direction="up">
                            <span className="inline-flex items-center text-brand-dark-blue mb-6 tracking-wide font-medium">
                                <Plus className="w-4 h-4 mr-2" /> Strategic Exit Advisory
                            </span>
                            <h1 className="text-5xl md:text-7xl font-medium tracking-tight mb-8 text-brand-dark-blue">
                                Sell Your Business for 20-40% More
                            </h1>
                            <p className="text-lg md:text-xl text-brand-dark-blue/80 max-w-2xl mx-auto leading-relaxed">
                                We transform businesses before sale, create competitive bidding wars, and negotiate every detail to maximize your exit value. Our proven process has generated $2B+ in successful exits across Asia and globally.
                            </p>
                        </FadeIn>
                    </div>
                </section>

                {/* --- INTRO SECTION --- */}
                <section className="py-20 px-6 border-b border-white/10 bg-brand-dark-blue">
                    <div className="container mx-auto max-w-6xl">
                        <FadeIn direction="up" delay={100}>
                            <span className="inline-flex items-center text-brand-sky-blue mb-4 tracking-wide font-medium">
                                <Plus className="w-4 h-4 mr-2" /> The 8-Step Exit Maximization Process
                            </span>
                            <div className="max-w-2xl mt-4">
                                <h2 className="text-4xl md:text-5xl font-medium mb-6 text-white">
                                    Turn Years of Hard Work Into Generational Wealth
                                </h2>
                                <p className="text-xl text-blue-100/70 leading-relaxed text-justify">
                                    Most owners leave millions on the table when they sell. We fix operational weaknesses, position your business perfectly, engage 50-150 buyers to create bidding wars, and protect your interests through closing and beyond. Your business deserves the exit it earned.
                                </p>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* --- SERVICES GRID --- */}
                <section className="border-b border-gray-200 bg-white">
                    <div className="container mx-auto max-w-7xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                            {services.map((service, index) => (
                                <Dialog key={service.id}>
                                    <DialogTrigger asChild>
                                        <div className={`
                                            group relative p-10 min-h-[400px] flex flex-col justify-between cursor-pointer transition-all duration-300
                                            border-b border-gray-200
                                            ${index < 4 ? 'lg:border-b' : 'lg:border-b-0'}
                                            ${(index % 4) < 3 ? 'lg:border-r' : ''}
                                            ${index % 2 === 0 ? 'md:border-r' : 'md:border-r-0'}
                                            hover:bg-brand-light-gray/50
                                        `}>
                                            <div>
                                                <div className="mb-6">
                                                    <service.icon className="w-10 h-10 text-brand-dark-blue/40 group-hover:text-brand-sky-blue transition-colors" />
                                                </div>
                                                <h3 className="text-xl font-medium mb-4 text-brand-dark-blue group-hover:text-brand-sky-blue transition-colors leading-tight min-h-[3rem]">
                                                    {service.title}
                                                </h3>
                                                <p className="text-brand-dark-blue/60 leading-relaxed text-sm text-justify line-clamp-4">
                                                    {service.summary}
                                                </p>
                                            </div>
                                            <div className="mt-8">
                                                <div className="w-10 h-10 rounded border border-brand-dark-blue/20 flex items-center justify-center text-brand-dark-blue/50 group-hover:bg-brand-dark-blue group-hover:text-white group-hover:border-brand-dark-blue transition-all">
                                                    <ChevronRight className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </div>
                                    </DialogTrigger>
                                    <DialogContent className="bg-brand-dark-blue/95 backdrop-blur-2xl border-white/20 text-white max-w-2xl p-0 overflow-hidden">
                                        <div className="p-8 md:p-10 max-h-[80vh] overflow-y-auto">
                                            <DialogHeader className="mb-6">
                                                <DialogTitle className="text-3xl font-normal font-heading text-white mb-2">
                                                    {service.title}
                                                </DialogTitle>
                                                <DialogDescription className="text-brand-sky-blue text-lg font-normal">
                                                    Service Details
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 text-blue-100 leading-relaxed text-lg whitespace-pre-wrap text-justify">
                                                {service.fullDescription}
                                            </div>
                                            <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
                                                <Button asChild className="bg-brand-sky-blue text-brand-dark-blue hover:bg-white">
                                                    <Link href="/contact/seller">
                                                        Schedule Consultation
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            ))}
                        </div>
                    </div>
                </section>

                {/* --- WHY CHOOSE US SECTION --- */}
                <section className="py-24 px-6 border-b border-white/10 bg-brand-dark-blue">
                    <div className="container mx-auto max-w-6xl">
                        <FadeIn direction="up">
                            <span className="inline-flex items-center text-brand-sky-blue mb-12 tracking-wide font-medium">
                                <Plus className="w-4 h-4 mr-2" /> Why Choose Nobridge
                            </span>

                            <div className="grid md:grid-cols-2 gap-12">
                                {whyUs.map((item, index) => (
                                    <div key={index} className="flex flex-col">
                                        <h3 className="text-xl font-medium text-white mb-4">{item.title}</h3>
                                        <p className="text-blue-100/70 leading-relaxed text-justify">{item.description}</p>
                                    </div>
                                ))}
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* --- TESTIMONIAL SECTION --- */}
                <section className="py-24 px-6 border-b border-gray-200 bg-white">
                    <div className="container mx-auto max-w-5xl">
                        <FadeIn direction="up">
                            <span className="inline-flex items-center text-brand-dark-blue mb-8 tracking-wide font-medium">
                                <Plus className="w-4 h-4 mr-2" /> What our clients say
                            </span>
                            <TestimonialCarousel />
                        </FadeIn>
                    </div>
                </section>

                {/* --- CTA SECTION --- */}
                <section className="relative h-[600px] flex items-center px-6 overflow-hidden">
                    <AnimatedBackground position="absolute" className="z-0" />
                    <div className="container mx-auto max-w-6xl relative z-10">
                        <FadeIn direction="up">
                            <div className="max-w-2xl">
                                <h2 className="text-5xl md:text-6xl font-normal leading-tight text-white mb-6">
                                    Ready to maximize <br />
                                    your exit value?
                                </h2>
                                <p className="text-xl text-white/90 mb-10 leading-relaxed font-normal text-justify">
                                    Whether you're planning an exit in the next 6 months or 3 years, now is the time to prepare. Let us help you achieve the exit you deserve.
                                </p>
                                <Button asChild size="lg" className="bg-white text-brand-dark-blue hover:bg-brand-sky-blue hover:text-brand-dark-blue font-normal text-lg h-14 px-8 rounded transition-all duration-300 shadow-lg">
                                    <Link href="/contact/seller">
                                        Start Your Exit Journey <ChevronRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                            </div>
                        </FadeIn>
                    </div>
                </section>

            </div>
        </div>
    );
}
