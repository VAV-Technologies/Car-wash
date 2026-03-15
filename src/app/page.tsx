'use client';

import * as React from "react";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Star, CheckCircle, Search as SearchIconLucide, MapPin, Briefcase, ListChecks, DollarSign, ShieldCheck, FileText, MessageSquare, Info, Phone, Home, ExternalLink, Users2 as UsersIcon, Images as ImagesIcon, Banknote, BookOpen, Brain, HandCoins, Globe, Link as LinkIconLucide, ArrowRight, Zap, UsersRound, CheckCircle2, TrendingUp, Loader2, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { NobridgeIcon, NobridgeIconType } from '@/components/ui/nobridge-icon';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { FadeIn } from '@/components/ui/fade-in';
import dynamic from 'next/dynamic';

const World = dynamic(() => import('@/components/ui/globe').then((m) => m.World), {
  ssr: false,
});


const PlaceholderLogo = ({ text = "Logo", className = "" }: { text?: string, className?: string }) => (
  <div
    className={cn("bg-brand-light-gray/30 flex items-center justify-center rounded-md p-4 h-12 md:h-16 w-auto min-w-[120px] md:min-w-[150px]", className)}
    data-ai-hint="company logo"
  >
    <span className="text-brand-dark-blue/70 text-xs md:text-sm font-medium text-center">{text}</span>
  </div>
);

// Listing interface for real data from API response
interface FeaturedListing {
  id: string;
  title: string; // API returns 'title' not 'listing_title_anonymous'
  industry: string;
  location_city: string; // API returns 'location_city'
  location_country: string;
  asking_price: number;
  annual_revenue_range?: string;
  images?: string; // API returns 'images' as JSON string
  verification_status: string; // API returns 'verification_status'
  short_description?: string; // API returns 'short_description'
}

const featuredCompanyLogos = [
  { src: "/assets/featured-harian-jabar.png", alt: "Harian Jabar", dataAiHint: "company logo" },
  { src: "/assets/featured-merdeka.png", alt: "Merdeka.com", dataAiHint: "company logo" },
  { src: "/assets/featured-upberita.png", alt: "UpBerita", dataAiHint: "company logo" },
  { src: "/assets/featured-independent-observer.png", alt: "Independent Observer", dataAiHint: "company logo" },
];

export default function HomePage() {
  const [featuredListings, setFeaturedListings] = useState<FeaturedListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch featured listings on component mount
  useEffect(() => {
    const fetchFeaturedListings = async () => {
      try {
        const response = await fetch('/api/listings?limit=3&sort=created_at&order=desc');
        if (response.ok) {
          const data = await response.json();
          setFeaturedListings(data.listings || []);
        } else {
          console.error('Failed to fetch featured listings');
        }
      } catch (error) {
        console.error('Error fetching featured listings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedListings();
  }, []);

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
          <a href="https://acfi.asia/directory/nobridge" target="_blank" rel="noopener noreferrer" className="mb-4 inline-flex flex-col md:flex-row items-center gap-2 md:gap-0 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-75">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm text-brand-light-gray md:hidden">
              <ShieldCheck className="h-4 w-4 opacity-90" />
            </span>
            <span className="px-3 md:px-4 py-2 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm text-xs md:text-sm text-brand-light-gray hover:bg-white/10 transition-colors self-center">
              <ShieldCheck className="hidden md:inline mr-2 h-4 w-4 opacity-90 align-text-bottom" />CERTIFIED & ACCREDITED BY ASIA CORPORATE FINANCE INSTITUTE (ACFI)
            </span>
          </a>
          <h1 style={{ letterSpacing: '-2.5px' }} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal !leading-tight mb-6 font-heading animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-100">
            Where As<span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '0.92em' }}>i</span>an bus<span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '0.92em' }}>i</span>nesses<br />meet global cap<span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '0.92em' }}>i</span>tal
          </h1>
          <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-brand-light-gray max-w-[85%] sm:max-w-3xl mx-auto mb-10 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-200 text-balance sm:text-pretty">
            Nobridge is the advisory firm built for Asian SMEs, connecting sellers with global acquirers, guiding buyers into new markets, and powering deals through a live deal marketplace.
          </p>
          <div className="mb-10 text-sm md:text-base text-brand-light-gray animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-300">
            {/* Desktop: original single row with pipes, no borders */}
            <div className="hidden sm:flex items-center justify-center">
              <div className="flex items-center">
                <NobridgeIcon icon="people" size="sm" className="mr-2 opacity-90" /> End To End M&A Advisory
              </div>
              <span className="mx-4 text-white/30">|</span>
              <div className="flex items-center">
                <NobridgeIcon icon="process" size="sm" className="mr-2 opacity-90" /> 3X More Efficient Process
              </div>
              <span className="mx-4 text-white/30">|</span>
              <div className="flex items-center">
                <NobridgeIcon icon="worldwide" size="sm" className="mr-2 opacity-90" /> Global Investor Network
              </div>
            </div>
            {/* Mobile: pills, two on top row + one centered below */}
            <div className="flex sm:hidden flex-col items-center gap-2">
              <div className="flex gap-2">
                <div className="flex items-center border border-white/20 px-3 py-1.5 text-xs">
                  <NobridgeIcon icon="people" size="sm" className="mr-1.5 opacity-90" /> End To End M&A
                </div>
                <div className="flex items-center border border-white/20 px-3 py-1.5 text-xs">
                  <NobridgeIcon icon="worldwide" size="sm" className="mr-1.5 opacity-90" /> Global Network
                </div>
              </div>
              <div className="flex items-center border border-white/20 px-3 py-1.5 text-xs">
                <NobridgeIcon icon="process" size="sm" className="mr-1.5 opacity-90" /> 3X More Efficient Process
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-500">
            <Link href="/seller-dashboard/listings/create" className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-brand-white text-brand-dark-blue hover:bg-brand-light-gray h-11 py-3 px-8 text-base min-w-[220px] sm:min-w-[260px]">
              Talk to Us <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/marketplace" className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-brand-white text-brand-white hover:bg-brand-white/10 h-11 py-3 px-8 text-base min-w-[220px] sm:min-w-[260px]">
              Browse Marketplace <SearchIconLucide className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured In - Credibility Logos */}
      <div className="border-t border-brand-dark-blue/10" />
      <section className="py-10 md:py-14 bg-brand-white section-lines-dark">
        <div className="container mx-auto">
          <FadeIn>
            <p className="text-sm font-normal uppercase text-muted-foreground tracking-wider text-center mb-8 font-heading">Featured In</p>
          </FadeIn>
          <FadeIn delay={200}>
            <div className="flex flex-wrap">
              {featuredCompanyLogos.map((logo, index) => (
                <div key={index} className="flex items-center justify-center h-20 md:h-24 w-1/2 md:w-1/4 border border-brand-dark-blue/10 px-6">
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={180}
                    height={70}
                    className="object-contain max-h-full"
                    data-ai-hint={logo.dataAiHint}
                  />
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Separator */}
      <div className="border-t border-brand-dark-blue/10" />

      {/* What We Do */}
      <section className="py-20 md:py-24 bg-brand-dark-blue text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-16 md:mb-20 px-4">
              <p className="text-sm font-normal uppercase text-brand-light-gray/70 tracking-wider mb-3 font-heading">What We Do</p>
              <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-white font-heading mb-6">
                Three ways we move deals forward
              </h2>
              <p className="text-blue-100 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                Whether you&apos;re exiting a business you&apos;ve built, acquiring your next platform in Asia, or looking to discover opportunities, Nobridge covers the full M&amp;A journey.
              </p>
            </div>
          </FadeIn>

          {/* Service cards — image + content paired together */}
          <div className="flex flex-col md:flex-row">
            {[
              {
                num: "01",
                src: "/assets/what-we-do-sell-side.png",
                alt: "Sell-Side Advisory",
                title: "Sell-Side Advisory",
                body: "You've built something valuable. We make sure the market knows it. From business positioning and valuation to buyer outreach, negotiation, and close, we run your exit so you can stay focused on the business.",
                tags: ["Exit Planning", "Valuation", "Buyer Matching", "Negotiation", "Due Diligence Support"],
              },
              {
                num: "02",
                src: "/assets/what-we-do-marketplace.png",
                alt: "Buy-Side Advisory",
                title: "Buy-Side Advisory",
                body: "Looking to acquire in Asia? We source proprietary off-market deals, run target screening, coordinate due diligence, and sit across the table with you through close. Your boots on the ground.",
                tags: ["Deal Sourcing", "Target Screening", "Market Entry", "LOI Support", "Local Intelligence"],
              },
              {
                num: "03",
                src: "/assets/what-we-do-buy-side.png",
                alt: "Deal Marketplace",
                title: "Deal Marketplace",
                body: "A curated, live listing of pre-screened Asian businesses available for acquisition, accessible to qualified buyers globally. Structured data. Verified financials. Real opportunities.",
                tags: ["Live Listings", "Pre-Screened", "Buyer Access", "Teaser Packages", "NDA-Gated CIMs"],
              },
            ].map((card, index) => (
              <FadeIn key={card.num} delay={index * 100} className="flex-1">
                <div className={cn(
                  "flex flex-col",
                  index > 0 && "border-t-0 md:border-t"
                )}>
                  {/* Image */}
                  <div className={cn(
                    "border border-brand-dark-blue/10 h-48 md:h-56 bg-white relative overflow-hidden",
                    index > 0 && "border-t-0 md:border-t md:border-l-0"
                  )}>
                    <Image
                      src={card.src}
                      alt={card.alt}
                      fill
                      className="object-contain scale-[0.8]"
                    />
                  </div>
                  {/* Content */}
                  <div className={cn(
                    "group relative border border-brand-dark-blue/10 border-t-0 bg-white p-6 sm:p-8 md:p-10 h-full flex flex-col overflow-hidden",
                    index > 0 && "md:border-l-0"
                  )}>
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-brand-dark-blue scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                    <span className="text-sm font-heading font-semibold text-brand-dark-blue/30 mb-4">
                      {card.num}
                    </span>
                    <h3 className="text-xl font-normal text-brand-dark-blue font-heading mb-4 text-left">
                      {card.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-6 text-justify flex-grow">
                      {card.body}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {card.tags.map((tag) => (
                        <span key={tag} className="text-xs px-3 py-1 border border-brand-dark-blue/10 text-brand-dark-blue/70">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <div className="border-t border-brand-dark-blue/10" />
      <section className="py-20 md:py-24 bg-white section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-16 md:mb-20 px-4">
              <p className="text-sm font-normal uppercase text-muted-foreground tracking-wider mb-3 font-heading">How It Works</p>
              <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-brand-dark-blue font-heading">
                From first conversation to signed deal
              </h2>
            </div>
          </FadeIn>

          <div className="flex flex-col">
            {[
              {
                num: "01",
                title: "Discovery & Scoping",
                body: "We start with a confidential consultation to understand your goals, timeline, and deal parameters, whether you're selling or acquiring.",
                image: "/assets/how-it-works-step-1.png",
              },
              {
                num: "02",
                title: "Value Creation (Optional)",
                body: "Before going to market, we can help optimize your business for sale through operational improvements, financial clean-up, and strategic repositioning to maximize deal value.",
                image: "/assets/how-it-works-step-2.png",
              },
              {
                num: "03",
                title: "Preparation & Positioning",
                body: "For sellers: business valuation, CIM preparation, and buyer targeting. For buyers: target criteria setting, market mapping, and initial deal origination.",
                image: "/assets/how-it-works-step-3.png",
              },
              {
                num: "04",
                title: "Outreach & Matching",
                body: "Our outreach engine connects sellers with our global buyer network. Buyers get curated target pipelines built around their acquisition thesis.",
                image: "/assets/how-it-works-step-4.png",
              },
              {
                num: "05",
                title: "Negotiation & Close",
                body: "We sit at the table through LOI, due diligence, and definitive agreements, protecting your interests and keeping deals moving forward to close.",
                image: "/assets/how-it-works-step-5.png",
              },
            ].map((step, index) => (
              <FadeIn key={step.num} delay={index * 100}>
                <div className={cn(
                  "border border-brand-dark-blue/10 flex flex-col md:flex-row",
                  index > 0 && "border-t-0"
                )}>
                  {/* Step number — separate column on desktop only */}
                  <div className="hidden md:flex md:w-[23%] shrink-0 p-8 md:p-10 items-center justify-center">
                    <span className="text-6xl font-heading font-medium text-brand-dark-blue/10 leading-none">
                      {step.num}
                    </span>
                  </div>
                  <div className="flex-1 p-6 sm:p-8 md:p-10 md:border-l border-brand-dark-blue/10 flex items-center">
                    <div>
                      {/* Step number — inline on mobile only */}
                      <span className="md:hidden text-2xl font-heading font-medium text-brand-dark-blue/10 leading-none mb-2 block">
                        {step.num}
                      </span>
                      <h3 className="text-lg font-normal text-brand-dark-blue font-heading mb-2">{step.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{step.body}</p>
                    </div>
                  </div>
                  <div className="md:w-[23%] h-40 md:h-auto border-t md:border-t-0 md:border-l border-brand-dark-blue/10 relative overflow-hidden shrink-0 bg-brand-dark-blue">
                    <Image
                      src={step.image}
                      alt={step.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Marketplace Preview */}
      <div className="border-t border-brand-dark-blue/10" />
      <section id="marketplace-preview" className="py-20 md:py-24 bg-brand-light-gray section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-12 md:mb-16 px-4">
              <p className="text-sm font-normal uppercase text-muted-foreground tracking-wider mb-3 font-heading">Deal Marketplace</p>
              <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-brand-dark-blue font-heading">Browse live acquisi<span style={{ fontSize: '1.06em' }}>t</span>ion <span style={{ fontSize: '1.06em', marginRight: '0.05em' }}>t</span>arge<span style={{ fontSize: '1.06em' }}>t</span>s in Asia</h2>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={100}>
            <div className="flex flex-col md:flex-row border border-brand-dark-blue/10 mb-12 md:mb-16">
              <div className="md:w-1/2 min-h-[250px] md:min-h-[350px] border-b md:border-b-0 md:border-r border-brand-dark-blue/10 relative overflow-hidden shrink-0 bg-white">
                <Image
                  src="/assets/marketplace-preview-v4.png"
                  alt="Browse live acquisition targets in Asia"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex-1 bg-brand-white p-6 sm:p-8 md:p-10 flex flex-col justify-center">
                <p className="text-brand-dark-blue text-base leading-relaxed text-justify mb-4 font-medium">A curated, always-current directory of pre-screened Asian businesses seeking acquisition. Each listing is verified, structured, and ready for qualified buyer engagement.</p>
                <p className="text-muted-foreground text-base leading-relaxed text-justify mb-6">Whether you are a strategic acquirer, private equity fund, family office, or independent sponsor, our marketplace gives you direct access to deal-ready opportunities across Asia, filtered by sector, geography, deal size, and financial profile, so you spend less time searching and more time evaluating.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                  {[
                    "Teaser packages available without NDA",
                    "Full CIMs released under NDA",
                    "Sector, geography, and deal size filters",
                    "Direct access to Nobridge deal team",
                    "Verified financials and structured data",
                    "New opportunities added weekly",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <span className="text-muted-foreground text-[5px] shrink-0">&#x25CF;</span>
                      <p className="text-base text-muted-foreground leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={200}>
            <div className="text-center mb-12 md:mb-16 px-4">
              <p className="text-sm font-normal uppercase text-muted-foreground tracking-wider mb-3 font-heading">Featured Opportunities</p>
            </div>
          </FadeIn>

          {isLoading ? (
            <>
              {/* Mobile: 2-col grid */}
              <div className="grid grid-cols-2 gap-px bg-brand-dark-blue/10 border border-brand-dark-blue/10 md:hidden">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="bg-brand-white p-4 flex flex-col h-full">
                    <Skeleton className="w-full h-40 mb-4" />
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-6 w-full mb-3" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                    <Skeleton className="h-10 w-full mt-6" />
                  </div>
                ))}
              </div>
              {/* Desktop: original flex layout */}
              <div className="hidden md:flex flex-row">
                {Array.from({ length: 3 }).map((_, index) => (
                  <FadeIn key={index} delay={index * 100} className="flex-1">
                    <div className={cn(
                      "border border-brand-dark-blue/10 bg-brand-white p-6 flex flex-col",
                      index > 0 && "border-l-0"
                    )}>
                      <Skeleton className="w-full h-40 mb-4" />
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-6 w-full mb-3" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-3/5" />
                      </div>
                      <Skeleton className="h-10 w-full mt-6" />
                    </div>
                  </FadeIn>
                ))}
              </div>
            </>
          ) : featuredListings.length > 0 ? (
            <>
              {/* Mobile: 2-col grid */}
              <div className="grid grid-cols-2 gap-px bg-brand-dark-blue/10 border border-brand-dark-blue/10 md:hidden">
                {featuredListings.map((listing) => (
                  <div key={listing.id} className="bg-brand-white flex flex-col h-full">
                    <div className="relative aspect-square">
                      <Image
                        src={
                          listing.images
                            ? (typeof listing.images === 'string'
                              ? JSON.parse(listing.images)[0]
                              : listing.images[0]) || "https://placehold.co/400x400.png"
                            : "https://placehold.co/400x400.png"
                        }
                        alt={listing.title}
                        width={400}
                        height={400}
                        className="w-full h-full object-cover"
                        data-ai-hint={listing.industry ? listing.industry.toLowerCase().replace(/\s+/g, '-') : "business"}
                      />
                      {listing.verification_status === 'verified' && (
                        <Badge variant="outline" className="absolute top-2 right-2 text-[10px] border-green-600 text-green-700 bg-green-100">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="p-3 flex flex-col flex-grow">
                      <Badge variant="secondary" className="bg-brand-dark-blue/5 text-brand-dark-blue text-[10px] w-fit mb-2">{listing.industry}</Badge>
                      <h3 className="text-sm font-normal text-brand-dark-blue mb-2 leading-tight hover:text-brand-sky-blue transition-colors font-heading">
                        <Link href={`/listings/${listing.id}`}>{listing.title}</Link>
                      </h3>
                      <div className="space-y-1 text-xs text-muted-foreground mb-4">
                        <p className="flex items-center"><MapPin className="h-3 w-3 mr-1 text-brand-dark-blue/70 shrink-0" /> {listing.location_city}, {listing.location_country}</p>
                        {listing.annual_revenue_range && (
                          <p className="flex items-center"><TrendingUp className="h-3 w-3 mr-1 text-brand-dark-blue/70 shrink-0" /> {listing.annual_revenue_range}</p>
                        )}
                        <p className="flex items-center"><DollarSign className="h-3 w-3 mr-1 text-brand-dark-blue/70 shrink-0" /> ${(listing.asking_price / 1000000).toFixed(1)}M USD</p>
                      </div>
                      <div className="mt-auto pt-3 border-t border-brand-dark-blue/10">
                        <Link href={`/listings/${listing.id}`} className="inline-flex items-center text-xs font-medium text-brand-dark-blue hover:text-brand-sky-blue transition-colors">
                          View Details <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop: original flex layout */}
              <div className="hidden md:flex flex-row">
                {featuredListings.map((listing, index) => (
                  <FadeIn key={listing.id} delay={index * 100} className="flex-1">
                    <div className={cn(
                      "border border-brand-dark-blue/10 bg-brand-white flex flex-col h-full",
                      index > 0 && "border-l-0"
                    )}>
                      <div className="relative aspect-square">
                        <Image
                          src={
                            listing.images
                              ? (typeof listing.images === 'string'
                                ? JSON.parse(listing.images)[0]
                                : listing.images[0]) || "https://placehold.co/400x400.png"
                              : "https://placehold.co/400x400.png"
                          }
                          alt={listing.title}
                          width={400}
                          height={400}
                          className="w-full h-full object-cover"
                          data-ai-hint={listing.industry ? listing.industry.toLowerCase().replace(/\s+/g, '-') : "business"}
                        />
                        {listing.verification_status === 'verified' && (
                          <Badge variant="outline" className="absolute top-3 right-3 text-xs border-green-600 text-green-700 bg-green-100">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
                          </Badge>
                        )}
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <Badge variant="secondary" className="bg-brand-dark-blue/5 text-brand-dark-blue text-xs w-fit mb-2">{listing.industry}</Badge>
                        <h3 className="text-lg font-normal text-brand-dark-blue mb-2 leading-tight hover:text-brand-sky-blue transition-colors font-heading">
                          <Link href={`/listings/${listing.id}`}>{listing.title}</Link>
                        </h3>
                        <div className="space-y-1 text-sm text-muted-foreground mb-4">
                          <p className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-brand-dark-blue/70" /> {listing.location_city}, {listing.location_country}</p>
                          {listing.annual_revenue_range && (
                            <p className="flex items-center"><TrendingUp className="h-4 w-4 mr-2 text-brand-dark-blue/70" /> Revenue: {listing.annual_revenue_range}</p>
                          )}
                          <p className="flex items-center"><DollarSign className="h-4 w-4 mr-2 text-brand-dark-blue/70" /> Asking: ${(listing.asking_price / 1000000).toFixed(1)}M USD</p>
                        </div>
                        <div className="mt-auto pt-4 border-t border-brand-dark-blue/10">
                          <Link href={`/listings/${listing.id}`} className="inline-flex items-center text-sm font-medium text-brand-dark-blue hover:text-brand-sky-blue transition-colors">
                            View Details <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </>
          ) : (
            <div className="border border-brand-dark-blue/10 bg-brand-white p-8 text-center">
              <FadeIn>
                <div className="flex flex-col items-center gap-4">
                  <Briefcase className="h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">No featured listings available at the moment.</p>
                  <Link href="/marketplace" className="inline-flex items-center text-brand-dark-blue hover:text-brand-sky-blue">
                    Browse all listings <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </FadeIn>
            </div>
          )}

          <FadeIn direction="up" delay={300}>
            <div className="border border-brand-dark-blue/10 border-t-0 bg-brand-white py-6 text-center">
              <Link href="/marketplace" className="inline-flex items-center text-sm font-medium text-brand-dark-blue hover:text-brand-sky-blue transition-colors">
                Access the Marketplace <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Why Nobridge */}
      <div className="border-t border-brand-dark-blue/10" />
      <section className="py-20 md:py-24 bg-brand-dark-blue text-white section-lines-light">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="text-center mb-16 md:mb-20 px-4">
              <p className="text-sm font-normal uppercase text-brand-light-gray/70 tracking-wider mb-3 font-heading">Why Nobridge</p>
              <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-white font-heading">
                The M&amp;A firm built for this region
              </h2>
            </div>
          </FadeIn>

          {/* Manifesto card - image left, content right */}
          <FadeIn direction="up" delay={100}>
            <div className="border border-white/15 flex flex-col md:flex-row">
              {/* Left - Interactive globe */}
              <div className="md:w-1/2 bg-white border-b md:border-b-0 md:border-r border-brand-dark-blue/10 flex items-center justify-center aspect-[4/3] md:aspect-square relative overflow-hidden">
                <World
                  data={[
                    /* === Asian routes (dark blue #0D0D39) === */
                    { order: 1, startLat: 1.3521, startLng: 103.8198, endLat: 35.6762, endLng: 139.6503, arcAlt: 0.25, color: "#0D0D39" },
                    { order: 1, startLat: -6.2088, startLng: 106.8456, endLat: 22.3193, endLng: 114.1694, arcAlt: 0.15, color: "#0D0D39" },
                    { order: 2, startLat: 3.139, startLng: 101.6869, endLat: 37.5665, endLng: 126.978, arcAlt: 0.25, color: "#0D0D39" },
                    { order: 2, startLat: 13.7563, startLng: 100.5018, endLat: 1.3521, endLng: 103.8198, arcAlt: 0.1, color: "#0D0D39" },
                    { order: 3, startLat: 21.0278, startLng: 105.8342, endLat: -6.2088, endLng: 106.8456, arcAlt: 0.15, color: "#0D0D39" },
                    { order: 3, startLat: 14.5995, startLng: 120.9842, endLat: 35.6762, endLng: 139.6503, arcAlt: 0.2, color: "#0D0D39" },
                    { order: 4, startLat: 22.3193, startLng: 114.1694, endLat: 1.3521, endLng: 103.8198, arcAlt: 0.1, color: "#0D0D39" },
                    { order: 4, startLat: 35.6762, startLng: 139.6503, endLat: 37.5665, endLng: 126.978, arcAlt: 0.08, color: "#0D0D39" },
                    { order: 5, startLat: 11.5564, startLng: 104.9282, endLat: 13.7563, endLng: 100.5018, arcAlt: 0.06, color: "#0D0D39" },
                    { order: 5, startLat: 1.3521, startLng: 103.8198, endLat: -6.2088, endLng: 106.8456, arcAlt: 0.08, color: "#0D0D39" },
                    { order: 6, startLat: 19.076, startLng: 72.8777, endLat: 1.3521, endLng: 103.8198, arcAlt: 0.25, color: "#0D0D39" },
                    { order: 6, startLat: 3.139, startLng: 101.6869, endLat: 14.5995, endLng: 120.9842, arcAlt: 0.15, color: "#0D0D39" },
                    { order: 7, startLat: 22.3193, startLng: 114.1694, endLat: 35.6762, endLng: 139.6503, arcAlt: 0.2, color: "#0D0D39" },
                    { order: 7, startLat: 37.5665, startLng: 126.978, endLat: -6.2088, endLng: 106.8456, arcAlt: 0.3, color: "#0D0D39" },
                    { order: 8, startLat: 25.0343, startLng: 121.5645, endLat: 1.3521, endLng: 103.8198, arcAlt: 0.2, color: "#0D0D39" },
                    { order: 8, startLat: 16.8661, startLng: 96.1951, endLat: 22.3193, endLng: 114.1694, arcAlt: 0.15, color: "#0D0D39" },
                    { order: 9, startLat: 28.6139, startLng: 77.209, endLat: 3.139, endLng: 101.6869, arcAlt: 0.2, color: "#0D0D39" },
                    { order: 9, startLat: 31.2304, startLng: 121.4737, endLat: 22.3193, endLng: 114.1694, arcAlt: 0.1, color: "#0D0D39" },
                    { order: 10, startLat: 39.9042, startLng: 116.4074, endLat: 35.6762, endLng: 139.6503, arcAlt: 0.15, color: "#0D0D39" },
                    { order: 10, startLat: -6.2088, startLng: 106.8456, endLat: 3.139, endLng: 101.6869, arcAlt: 0.08, color: "#0D0D39" },

                    /* === Global routes (dark lines, white dots) === */
                    { order: 1, startLat: 1.3521, startLng: 103.8198, endLat: 51.5074, endLng: -0.1278, arcAlt: 0.5, color: "#0D0D39", dotColor: "#0D0D39" },
                    { order: 2, startLat: 22.3193, startLng: 114.1694, endLat: 40.7128, endLng: -74.006, arcAlt: 0.55, color: "#0D0D39", dotColor: "#0D0D39" },
                    { order: 3, startLat: 35.6762, startLng: 139.6503, endLat: 37.7749, endLng: -122.4194, arcAlt: 0.5, color: "#0D0D39", dotColor: "#0D0D39" },
                    { order: 3, startLat: -6.2088, startLng: 106.8456, endLat: 25.2048, endLng: 55.2708, arcAlt: 0.3, color: "#0D0D39", dotColor: "#0D0D39" },
                    { order: 4, startLat: 3.139, startLng: 101.6869, endLat: -33.8688, endLng: 151.2093, arcAlt: 0.3, color: "#0D0D39", dotColor: "#0D0D39" },
                    { order: 5, startLat: 1.3521, startLng: 103.8198, endLat: 48.8566, endLng: 2.3522, arcAlt: 0.5, color: "#0D0D39", dotColor: "#0D0D39" },
                    { order: 5, startLat: 22.3193, startLng: 114.1694, endLat: 52.52, endLng: 13.405, arcAlt: 0.5, color: "#0D0D39", dotColor: "#0D0D39" },
                    { order: 6, startLat: 35.6762, startLng: 139.6503, endLat: 34.0522, endLng: -118.2437, arcAlt: 0.5, color: "#0D0D39", dotColor: "#0D0D39" },
                    { order: 6, startLat: 37.5665, startLng: 126.978, endLat: 51.5074, endLng: -0.1278, arcAlt: 0.5, color: "#0D0D39", dotColor: "#0D0D39" },
                    { order: 7, startLat: 1.3521, startLng: 103.8198, endLat: 47.6062, endLng: -122.3321, arcAlt: 0.55, color: "#0D0D39", dotColor: "#0D0D39" },
                    { order: 7, startLat: -6.2088, startLng: 106.8456, endLat: -23.5505, endLng: -46.6333, arcAlt: 0.6, color: "#0D0D39", dotColor: "#0D0D39" },
                    { order: 8, startLat: 51.5074, startLng: -0.1278, endLat: 40.7128, endLng: -74.006, arcAlt: 0.3, color: "#0D0D39", dotColor: "#0D0D39" },
                    { order: 8, startLat: 48.8566, startLng: 2.3522, endLat: 25.2048, endLng: 55.2708, arcAlt: 0.3, color: "#0D0D39", dotColor: "#0D0D39" },
                    { order: 9, startLat: 40.7128, startLng: -74.006, endLat: -23.5505, endLng: -46.6333, arcAlt: 0.4, color: "#0D0D39", dotColor: "#0D0D39" },
                    { order: 9, startLat: 52.52, startLng: 13.405, endLat: 55.7558, endLng: 37.6173, arcAlt: 0.15, color: "#0D0D39", dotColor: "#0D0D39" },
                    { order: 10, startLat: 37.7749, startLng: -122.4194, endLat: 19.4326, endLng: -99.1332, arcAlt: 0.2, color: "#0D0D39", dotColor: "#0D0D39" },
                    { order: 10, startLat: 25.2048, startLng: 55.2708, endLat: -1.2921, endLng: 36.8219, arcAlt: 0.25, color: "#0D0D39", dotColor: "#0D0D39" },
                    { order: 11, startLat: 51.5074, startLng: -0.1278, endLat: 43.6532, endLng: -79.3832, arcAlt: 0.3, color: "#0D0D39", dotColor: "#0D0D39" },
                    { order: 11, startLat: -33.8688, startLng: 151.2093, endLat: -36.8485, endLng: 174.7633, arcAlt: 0.1, color: "#0D0D39", dotColor: "#0D0D39" },
                    { order: 12, startLat: 34.0522, startLng: -118.2437, endLat: 41.8781, endLng: -87.6298, arcAlt: 0.15, color: "#0D0D39", dotColor: "#0D0D39" },
                    { order: 12, startLat: 55.7558, startLng: 37.6173, endLat: 59.3293, endLng: 18.0686, arcAlt: 0.12, color: "#0D0D39", dotColor: "#0D0D39" },
                  ]}
                  globeConfig={{
                    pointSize: 4,
                    globeColor: "#F4F6FC",
                    showAtmosphere: true,
                    atmosphereColor: "#0D0D39",
                    atmosphereAltitude: 0.1,
                    emissive: "#F4F6FC",
                    emissiveIntensity: 1.0,
                    shininess: 0.05,
                    polygonColor: "rgba(13,13,57,0.8)",
                    ambientLight: "#ffffff",
                    directionalLeftLight: "#ffffff",
                    directionalTopLight: "#ffffff",
                    pointLight: "#ffffff",
                    arcTime: 1000,
                    arcLength: 0.9,
                    rings: 1,
                    maxRings: 3,
                    initialPosition: { lat: 1.3521, lng: 103.8198 },
                    autoRotate: true,
                    autoRotateSpeed: 0.5,
                  }}
                />
              </div>
              {/* Right - Quote, body, stats */}
              <div className="md:w-1/2 bg-white p-6 sm:p-8 md:p-10 flex flex-col justify-center">
                <p className="text-xl sm:text-2xl md:text-3xl font-heading font-normal text-brand-dark-blue leading-snug pb-6 sm:pb-8">
                  &ldquo;Traditional M&amp;A firms weren&apos;t built for Asian SMEs. We were.&rdquo;
                </p>
                <div className="border-t border-brand-dark-blue/10" />
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed text-justify py-6 sm:py-8">
                  Most global advisory firms ignore deals under $100M. Local brokers lack the buyer networks and process to execute efficiently. Nobridge fills this gap, combining deep regional expertise with technology-enabled deal execution and a global buyer network that most mid-market firms can&apos;t access.
                </p>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed text-justify pb-6 sm:pb-8">
                  We work exclusively with founders, family businesses, and institutional owners across Asia, guiding them through every stage of the transaction,from preparation and positioning to negotiation and close. Our process is built around discretion, speed, and outcomes that reflect the true value of what you&apos;ve built.
                </p>
                <div className="flex flex-col sm:flex-row border-t border-brand-dark-blue/10 pt-6 sm:pt-8">
                  {[
                    { stat: "3-6 months", label: "Average time to LOI", icon: Clock },
                    { stat: "500+", label: "Qualified buyer network", icon: UsersRound },
                    { stat: "AI-Enabled", label: "Deal infrastructure", icon: Brain },
                  ].map((item, index) => (
                    <div key={item.stat} className={cn(
                      "flex-1 py-4 sm:py-0 sm:px-6 text-center border-brand-dark-blue/10 flex flex-col items-center",
                      index > 0 && "border-t sm:border-t-0 sm:border-l"
                    )}>
                      <item.icon className="h-5 w-5 text-brand-dark-blue/70 mb-3" strokeWidth={1.5} />
                      <p className="text-xl font-medium text-brand-dark-blue">{item.stat}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* 2x2 feature grid - separate from manifesto */}
          <div className="grid grid-cols-1 md:grid-cols-2 mt-10 border border-brand-dark-blue/10">
            {[
              { title: "Regional Expertise", body: "Built by practitioners with deep roots in Indonesian and Malaysian markets. We understand local business culture, regulatory environments, and what makes a deal actually close.", icon: Globe },
              { title: "Technology-Enabled Process", body: "Our systems streamline deal sourcing, buyer outreach, and due diligence coordination, allowing our advisory team to move faster and match more effectively than traditional firms.", icon: Zap },
              { title: "Confidential by Design", body: "Every deal is handled with strict confidentiality protocols. NDA-gated information flow, anonymous teasers, and controlled buyer access keep your business protected throughout.", icon: ShieldCheck },
              { title: "Aligned Incentives", body: "Success-fee based pricing means we only win when you do. Optional retainer structures for buyers ensure dedicated sourcing without misaligned incentives.", icon: HandCoins },
            ].map((card, index) => (
              <FadeIn key={card.title} delay={(index + 2) * 100}>
                <div className={cn(
                  "bg-white p-5 sm:p-8 md:p-10 h-full flex flex-col",
                  (index === 1) && "md:border-l border-brand-dark-blue/10",
                  (index === 2) && "border-t border-brand-dark-blue/10",
                  (index === 3) && "border-t md:border-l border-brand-dark-blue/10"
                )}>
                  <card.icon className="h-5 w-5 text-brand-dark-blue/70 mb-4" strokeWidth={1.5} />
                  <h4 className="text-lg font-normal text-brand-dark-blue font-heading mb-3">{card.title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed text-justify">{card.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>


      {/* Final Call to Action Section */}
      <div className="border-t border-brand-dark-blue/10" />
      <section className="py-12 bg-brand-white section-lines-dark">
        <div className="container mx-auto">
          <FadeIn direction="up">
            <div className="border border-brand-dark-blue/10">
              <div className="relative px-4 sm:px-8 md:px-16 py-16 md:py-0 md:aspect-[21/9] text-center overflow-hidden" style={{ backgroundImage: 'url(/assets/cta-cityscape-light.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="relative z-10 flex flex-col items-center justify-center h-full">
                  <div className="border border-brand-dark-blue/20 bg-white/50 backdrop-blur-sm px-6 sm:px-10 md:px-16 py-8 sm:py-10 md:py-14">
                    <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-brand-dark-blue mb-4 font-heading">Speak Wi<span style={{ fontSize: '1.06em' }}>t</span>h Our <span style={{ fontSize: '1.06em' }}>T</span>eam</h2>
                    <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto mb-6 sm:mb-8 md:mb-10">
                      Whether you&apos;re planning an exit, seeking an acquisition, or exploring strategic options, our advisors are ready to help.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                      <Link href="/auth/register" className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-brand-dark-blue text-brand-white hover:bg-brand-dark-blue/90 h-11 py-3 px-12 text-base">
                        Get Started
                      </Link>
                      <Link href="/contact" className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-brand-dark-blue text-brand-dark-blue hover:bg-brand-dark-blue/5 h-11 py-3 px-8 text-base">
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
    </>
  );
}

