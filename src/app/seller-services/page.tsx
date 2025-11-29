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
import { ArrowRight, ChevronRight, Plus, Quote } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Content Data
const services = [
    {
        id: "valuation",
        title: "Business Valuation",
        summary: "Comprehensive evaluation of your business's current market value and strategic opportunities.",
        fullDescription: `We conduct a comprehensive evaluation of your business to establish its current market value and identify strategic opportunities. This includes detailed financial analysis, market positioning assessment, competitive benchmarking, and industry multiple comparisons. We examine your company's strengths, weaknesses, and unique value propositions to create a baseline understanding of where you stand in the market.

Beyond just determining a number, this assessment provides a roadmap of potential value creation opportunities and exit timeline recommendations. We analyze market trends, buyer appetite in your sector, and provide insights on optimal timing for an exit. This initial diagnostic serves as the foundation for all subsequent engagement, helping you understand not just what your business is worth today, but what it could be worth with the right preparation.`
    },
    {
        id: "enhancement",
        title: "Value Enhancement",
        summary: "Systematic implementation of improvements to increase your company's value by 20-40%.",
        fullDescription: `This service focuses on systematically increasing your company's value before going to market. We identify and implement operational improvements, financial optimizations, and strategic initiatives that directly impact valuation multiples. This includes EBITDA normalization, working capital optimization, tax structure planning, customer diversification strategies, and management team strengthening. We also work on reducing key person dependencies and documenting critical processes that buyers value.

The enhancement phase typically runs 6-18 months and can increase enterprise value by 20-40%. We help implement technology upgrades, improve recurring revenue models, secure intellectual property, and clean up legal or compliance issues. Every action is designed to make your business more attractive to buyers and command premium valuations. This isn't just about cosmetic improvements – it's about fundamental changes that reduce risk and increase growth potential in the eyes of acquirers.`
    },
    {
        id: "preparation",
        title: "Exit Preparation",
        summary: "Complete preparation for the M&A process, from data room creation to management training.",
        fullDescription: `We prepare your business for the intensive scrutiny of the M&A process, ensuring everything is professionally documented and ready for buyer due diligence. This includes creating vendor due diligence reports, preparing data rooms, developing management presentations, and crafting compelling equity stories. We coordinate with legal and tax advisors to ensure all corporate documentation is complete and potential deal-breakers are addressed proactively.

This phase also involves preparing you and your team for the M&A process itself – training on buyer meetings, negotiation strategies, and managing the emotional aspects of selling your business. We develop detailed information memorandums, financial models, and growth projections that tell your company's story effectively. By the end of this phase, your business is packaged professionally and ready to attract maximum buyer interest while minimizing surprises during due diligence.`
    },
    {
        id: "execution",
        title: "Transaction Execution",
        summary: "End-to-end management of your sale process, from buyer identification to closing.",
        fullDescription: `We run a comprehensive process to identify, approach, and negotiate with potential buyers to maximize value and ensure successful closing. This starts with mapping the buyer universe – strategic acquirers, financial buyers, international players, and sometimes unexpected buyers from adjacent industries. We design and manage competitive auction processes, coordinate buyer outreach, manage NDAs and initial discussions, and create competitive tension to drive valuations.

During execution, we quarterback the entire deal process including managing due diligence, negotiating terms and purchase agreements, structuring earnouts and escrows, and coordinating with all advisors. We serve as your advocate through every stage, from initial indication of interest through final closing. Our role includes managing multiple bidders, facilitating management meetings, resolving deal issues, and ensuring the transaction stays on track. We handle the complexity so you can focus on running your business and maintaining performance during the sale process.`
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
                <p className="text-3xl md:text-4xl font-medium leading-tight text-white mb-12 transition-all duration-500 ease-in-out">
                    "{testimonials[currentIndex].quote}"
                </p>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mt-8">
                <div>
                    <h4 className="text-lg font-medium text-white transition-all duration-300">{testimonials[currentIndex].author}</h4>
                    <p className="text-blue-100/60 transition-all duration-300">{testimonials[currentIndex].role}</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={prev}
                        className="w-12 h-12 rounded border border-white/20 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors"
                        aria-label="Previous testimonial"
                    >
                        <ChevronRight className="w-5 h-5 rotate-180" />
                    </button>
                    <button
                        onClick={next}
                        className="w-12 h-12 rounded border border-white/20 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors"
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
        <div className="relative min-h-screen w-full overflow-hidden bg-brand-dark-blue text-white font-sans">
            <AnimatedBackground position="fixed" className="z-0" />

            {/* Main Content Wrapper */}
            <div className="relative z-10">

                {/* --- HEADER SECTION --- */}
                <section className="py-24 md:py-32 px-6 text-center border-b border-white/10 bg-white/5 backdrop-blur-sm">
                    <div className="container mx-auto max-w-5xl">
                        <FadeIn direction="up">
                            <span className="inline-flex items-center text-brand-sky-blue mb-6 tracking-wide font-medium">
                                <Plus className="w-4 h-4 mr-2" /> We improve your business
                            </span>
                            <h1 className="text-5xl md:text-7xl font-medium tracking-tight mb-8 text-white">
                                Services
                            </h1>
                            <p className="text-lg md:text-xl text-blue-100/80 max-w-2xl mx-auto leading-relaxed">
                                Efficient office support services that let you focus on what matters most.
                                From administrative tasks to technical support, we manage the details so you can drive your business forward.
                            </p>
                        </FadeIn>
                    </div>
                </section>

                {/* --- INTRO SECTION --- */}
                <section className="py-20 px-6 border-b border-white/10 bg-brand-dark-blue/50 backdrop-blur-md">
                    <div className="container mx-auto max-w-6xl">
                        <FadeIn direction="up" delay={100}>
                            <span className="inline-flex items-center text-brand-sky-blue mb-4 tracking-wide font-medium">
                                <Plus className="w-4 h-4 mr-2" /> Our services
                            </span>
                            <div className="max-w-2xl mt-4">
                                <h2 className="text-4xl md:text-5xl font-medium mb-6 text-white">
                                    Focus on growth.
                                </h2>
                                <p className="text-xl text-blue-100/70 leading-relaxed">
                                    We offer comprehensive administrative support to manage tasks like scheduling, data entry, and document handling.
                                </p>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* --- SERVICES GRID --- */}
                <section className="border-b border-white/10 bg-brand-dark-blue/30 backdrop-blur-sm">
                    <div className="container mx-auto max-w-7xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                            {services.map((service, index) => (
                                <Dialog key={service.id}>
                                    <DialogTrigger asChild>
                                        <div className={`
                                            group relative p-10 min-h-[400px] flex flex-col justify-between cursor-pointer transition-all duration-300
                                            border-b border-white/10 lg:border-b-0
                                            ${index < 3 ? 'lg:border-r' : ''}
                                            ${index % 2 === 0 ? 'md:border-r' : 'md:border-r-0'}
                                            hover:bg-brand-sky-blue/10
                                        `}>
                                            <div>
                                                <h3 className="text-2xl font-medium mb-4 text-white group-hover:text-brand-sky-blue transition-colors">
                                                    {service.title}
                                                </h3>
                                                <p className="text-blue-100/60 leading-relaxed text-sm">
                                                    {service.summary}
                                                </p>
                                            </div>
                                            <div className="mt-8">
                                                <div className="w-10 h-10 rounded border border-white/20 flex items-center justify-center text-white/50 group-hover:bg-white group-hover:text-brand-dark-blue group-hover:border-white transition-all">
                                                    <ChevronRight className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </div>
                                    </DialogTrigger>
                                    <DialogContent className="bg-brand-dark-blue/95 backdrop-blur-2xl border-white/20 text-white max-w-2xl p-0 overflow-hidden">
                                        <div className="p-8 md:p-10 max-h-[80vh] overflow-y-auto">
                                            <DialogHeader className="mb-6">
                                                <DialogTitle className="text-3xl font-bold font-heading text-white mb-2">
                                                    {service.title}
                                                </DialogTitle>
                                                <DialogDescription className="text-brand-sky-blue text-lg font-medium">
                                                    Service Details
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 text-blue-100 leading-relaxed text-lg whitespace-pre-wrap">
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
                <section className="py-24 px-6 border-b border-white/10 bg-brand-dark-blue/50 backdrop-blur-md">
                    <div className="container mx-auto max-w-6xl">
                        <FadeIn direction="up">
                            <span className="inline-flex items-center text-brand-sky-blue mb-12 tracking-wide font-medium">
                                <Plus className="w-4 h-4 mr-2" /> Why Choose Nobridge
                            </span>

                            <div className="grid md:grid-cols-2 gap-12">
                                {whyUs.map((item, index) => (
                                    <div key={index} className="flex flex-col">
                                        <h3 className="text-xl font-medium text-white mb-4">{item.title}</h3>
                                        <p className="text-blue-100/70 leading-relaxed">{item.description}</p>
                                    </div>
                                ))}
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* --- TESTIMONIAL SECTION --- */}
                <section className="py-24 px-6 border-b border-white/10 bg-brand-dark-blue/50 backdrop-blur-md">
                    <div className="container mx-auto max-w-5xl">
                        <FadeIn direction="up">
                            <span className="inline-flex items-center text-brand-sky-blue mb-8 tracking-wide font-medium">
                                <Plus className="w-4 h-4 mr-2" /> What our clients say
                            </span>
                            <TestimonialCarousel />
                        </FadeIn>
                    </div>
                </section>

                {/* --- CTA SECTION --- */}
                <section className="relative h-[600px] flex items-center px-6 overflow-hidden">
                    {/* Background Image with Overlay */}
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
                            alt="Office meeting"
                            fill
                            className="object-cover opacity-60"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark-blue/80 to-brand-dark-blue/20" />
                    </div>

                    <div className="container mx-auto max-w-6xl relative z-10">
                        <FadeIn direction="up">
                            <div className="max-w-2xl">
                                <h2 className="text-5xl md:text-6xl font-medium leading-tight text-white mb-6">
                                    Boost your <br />
                                    business efficiency.
                                </h2>
                                <p className="text-xl text-blue-100/90 mb-10 leading-relaxed font-medium drop-shadow-md">
                                    Contact us today to discover how our comprehensive seller-side services can help you achieve the best possible outcome for your hard work.
                                </p>
                                <Button asChild size="lg" className="bg-white text-brand-dark-blue hover:bg-brand-sky-blue hover:text-brand-dark-blue font-bold text-lg h-14 px-8 rounded transition-all duration-300 shadow-lg">
                                    <Link href="/contact/seller">
                                        Let's collaborate <ChevronRight className="ml-2 h-5 w-5" />
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
