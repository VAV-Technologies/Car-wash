'use client';

import * as React from "react";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Star, CheckCircle, Search as SearchIconLucide, MapPin, Briefcase, ListChecks, DollarSign, ShieldCheck, FileText, MessageSquare, Info, Phone, Home, ExternalLink, Users2 as UsersIcon, Images as ImagesIcon, Banknote, BookOpen, Brain, HandCoins, Globe, Link as LinkIconLucide, ArrowRight, Zap, UsersRound, CheckCircle2, TrendingUp, Loader2 } from 'lucide-react'; // Added TrendingUp
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { NobridgeIcon, NobridgeIconType } from '@/components/ui/nobridge-icon';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { FadeIn } from '@/components/ui/fade-in';


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
  { src: "/assets/1.png", alt: "Featured Company Logo 1", dataAiHint: "company logo" },
  { src: "/assets/2.png", alt: "Featured Company Logo 2", dataAiHint: "company logo" },
  { src: "/assets/3.png", alt: "Featured Company Logo 3", dataAiHint: "company logo" },
  { src: "/assets/4.png", alt: "Featured Company Logo 4", dataAiHint: "company logo" },
  { src: "/assets/5.png", alt: "Featured Company Logo 5", dataAiHint: "company logo" },
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
      <section className="w-full relative text-brand-white">
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/hero_section_new.png"
            alt="Nobridge Hero"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="container mx-auto flex flex-col items-center justify-center text-center min-h-[calc(80vh-theme(spacing.20))] px-4 py-24 md:py-32 lg:py-40 relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight !leading-tight mb-6 font-heading animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-100">
            Find Your Next Business Venture with Nobridge
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-brand-light-gray max-w-3xl mx-auto mb-10 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-200">
            Nobridge is the premier marketplace connecting SME owners with motivated investors and buyers. Discover, inquire, and engage with verified opportunities.
          </p>
          <div className="mb-10 flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-8 text-sm md:text-base text-brand-light-gray animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-300">
            <div className="flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
              <NobridgeIcon icon="people" size="sm" className="mr-2 opacity-90" /> Verified Network
            </div>
            <div className="flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
              <NobridgeIcon icon="process" size="sm" className="mr-2 opacity-90" /> Efficient Process
            </div>
            <div className="flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
              <NobridgeIcon icon="worldwide" size="sm" className="mr-2 opacity-90" /> Expert Support
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-500">
            <Link href="/seller-dashboard/listings/create" className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-brand-white text-brand-dark-blue hover:bg-brand-light-gray hover:scale-105 hover:shadow-lg h-12 py-3 px-8 text-base shadow-xl">
              List Your Business <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/marketplace" className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-2 border-brand-white text-brand-white hover:bg-brand-white/10 hover:text-brand-white hover:scale-105 hover:shadow-lg h-12 py-3 px-8 text-base shadow-xl">
              Browse Businesses <SearchIconLucide className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Business Listings Preview */}
      <section id="marketplace-preview" className="py-16 md:py-24 bg-brand-light-gray">
        <div className="container mx-auto px-4">
          <FadeIn direction="up">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-brand-dark-blue font-heading">Featured Opportunities</h2>
              <p className="text-muted-foreground mt-3 text-lg">A Glimpse into Our Curated Marketplace</p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, index) => (
                <FadeIn key={index} delay={index * 100} className="h-full">
                  <Card className="bg-brand-white shadow-xl rounded-lg flex flex-col overflow-hidden h-full">
                    <div className="p-0 relative">
                      <Skeleton className="w-full h-48" />
                    </div>
                    <CardContent className="p-6 flex-grow">
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-6 w-full mb-2" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-4/5" />
                        <Skeleton className="h-4 w-3/5" />
                      </div>
                    </CardContent>
                    <CardFooter className="p-6 border-t border-brand-light-gray/80">
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                </FadeIn>
              ))
            ) : featuredListings.length > 0 ? (
              featuredListings.map((listing, index) => (
                <FadeIn key={listing.id} delay={index * 100} className="h-full">
                  <Card className="bg-brand-white shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-lg flex flex-col overflow-hidden h-full">
                    <CardHeader className="p-0 relative">
                      <Image
                        src={
                          listing.images
                            ? (typeof listing.images === 'string'
                              ? JSON.parse(listing.images)[0]
                              : listing.images[0]) || "https://placehold.co/400x250.png"
                            : "https://placehold.co/400x250.png"
                        }
                        alt={listing.title}
                        width={400}
                        height={250}
                        className="w-full h-48 object-cover"
                        data-ai-hint={listing.industry ? listing.industry.toLowerCase().replace(/\s+/g, '-') : "business"}
                      />
                      {listing.verification_status === 'verified' && (
                        <Badge variant="outline" className="absolute top-3 right-3 text-xs border-green-600 text-green-700 bg-green-100 dark:bg-green-700/20 dark:text-green-300 dark:border-green-500/50">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent className="p-6 flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="secondary" className="bg-brand-dark-blue/5 text-brand-dark-blue text-xs">{listing.industry}</Badge>
                      </div>
                      <CardTitle className="text-xl font-semibold text-brand-dark-blue mb-2 leading-tight hover:text-brand-sky-blue transition-colors font-heading">
                        <Link href={`/listings/${listing.id}`}>{listing.title}</Link>
                      </CardTitle>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p className="flex items-center"><Briefcase className="h-4 w-4 mr-2 text-brand-dark-blue/70" /> {listing.industry}</p>
                        <p className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-brand-dark-blue/70" /> {listing.location_city}, {listing.location_country}</p>
                        {listing.annual_revenue_range && (
                          <p className="flex items-center"><TrendingUp className="h-4 w-4 mr-2 text-brand-dark-blue/70" /> Revenue: {listing.annual_revenue_range}</p>
                        )}
                        <p className="flex items-center"><DollarSign className="h-4 w-4 mr-2 text-brand-dark-blue/70" /> Asking: ${(listing.asking_price / 1000000).toFixed(1)}M USD</p>
                      </div>
                      {listing.short_description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {listing.short_description.substring(0, 120)}...
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="p-6 border-t border-brand-light-gray/80 mt-auto">
                      <Link href={`/listings/${listing.id}`} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 w-full bg-brand-dark-blue text-brand-white hover:bg-brand-dark-blue/90 h-10 px-4 py-2">
                        View Details <SearchIconLucide className="ml-2 h-4 w-4" />
                      </Link>
                    </CardFooter>
                  </Card>
                </FadeIn>
              ))
            ) : (
              // Fallback if no listings
              <div className="col-span-full text-center py-8">
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
          </div>
          <FadeIn direction="up" delay={300}>
            <div className="mt-16 text-center">
              <Link href="/marketplace" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-brand-dark-blue text-brand-dark-blue hover:bg-brand-dark-blue/5 h-11 py-3 px-8 text-base">
                Explore Full Marketplace
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Your Journey with Nobridge Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-white to-brand-light-gray/30">
        <div className="container mx-auto px-4">
          <FadeIn direction="up">
            <div className="text-center mb-16 md:mb-20">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-brand-dark-blue font-heading mb-6">Your Journey with Nobridge</h2>
              <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                Whether you're selling your life's work or seeking your next strategic investment, Nobridge provides the premium tools and exclusive network you need.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {/* Selling Card */}
            <FadeIn direction="right" delay={200} className="h-full">
              <div className="group relative bg-white rounded-2xl p-8 md:p-12 shadow-lg hover:shadow-2xl transition-all duration-500 border border-brand-light-gray/50 hover:border-brand-sky-blue/30 overflow-hidden h-full flex flex-col">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-sky-blue/5 rounded-full blur-3xl -mr-32 -mt-32 transition-all duration-500 group-hover:bg-brand-sky-blue/10" />

                <div className="relative z-10 flex flex-col h-full">
                  <div className="mb-8 w-fit group-hover:scale-105 transition-transform duration-500">
                    <NobridgeIcon icon="growth" size={80} variant="blue" className="w-20 h-20" />
                  </div>

                  <h3 className="text-3xl font-bold text-brand-dark-blue mb-4 font-heading group-hover:text-brand-sky-blue transition-colors">List Your Business</h3>
                  <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                    Connect with verified buyers across Asia through a secure, efficient platform designed to maximize your business value.
                  </p>

                  <ul className="space-y-6 mb-10">
                    <li className="flex items-start">
                      <div className="mt-1 mr-4 p-3 bg-brand-dark-blue rounded-xl shadow-md group-hover:bg-brand-sky-blue transition-colors duration-300 shrink-0">
                        <NobridgeIcon icon="people" size="md" className="w-6 h-6 drop-shadow-md" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-brand-dark-blue text-lg">Access to Verified Buyers</h4>
                        <p className="text-sm text-muted-foreground mt-1">Reach serious investors pre-vetted for financial capability.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="mt-1 mr-4 p-3 bg-brand-dark-blue rounded-xl shadow-md group-hover:bg-brand-sky-blue transition-colors duration-300 shrink-0">
                        <NobridgeIcon icon="process" size="md" className="w-6 h-6 drop-shadow-md" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-brand-dark-blue text-lg">Step-by-Step Guidance</h4>
                        <p className="text-sm text-muted-foreground mt-1">Expert support from valuation to final negotiation.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="mt-1 mr-4 p-3 bg-brand-dark-blue rounded-xl shadow-md group-hover:bg-brand-sky-blue transition-colors duration-300 shrink-0">
                        <NobridgeIcon icon="documents" size="md" className="w-6 h-6 drop-shadow-md" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-brand-dark-blue text-lg">Secure Management</h4>
                        <p className="text-sm text-muted-foreground mt-1">Control who sees your sensitive data with our secure data room.</p>
                      </div>
                    </li>
                  </ul>

                  <div className="mt-auto pt-6">
                    <Link href="/seller-dashboard/listings/create" className="inline-flex items-center justify-center w-full md:w-auto px-8 py-4 text-base font-semibold text-white transition-all duration-300 bg-brand-dark-blue rounded-xl hover:bg-brand-sky-blue hover:shadow-lg hover:-translate-y-1 group-hover:w-full">
                      Start Selling
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Buying Card */}
            <FadeIn direction="left" delay={400} className="h-full">
              <div className="group relative bg-white rounded-2xl p-8 md:p-12 shadow-lg hover:shadow-2xl transition-all duration-500 border border-brand-light-gray/50 hover:border-brand-sky-blue/30 overflow-hidden h-full flex flex-col">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-dark-blue/5 rounded-full blur-3xl -mr-32 -mt-32 transition-all duration-500 group-hover:bg-brand-dark-blue/10" />

                <div className="relative z-10 flex flex-col h-full">
                  <div className="mb-8 w-fit group-hover:scale-105 transition-transform duration-500">
                    <NobridgeIcon icon="investment" size={80} variant="blue" className="w-20 h-20" />
                  </div>

                  <h3 className="text-3xl font-bold text-brand-dark-blue mb-4 font-heading group-hover:text-brand-sky-blue transition-colors">Find Opportunities</h3>
                  <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                    Discover curated, high-potential businesses. Get detailed insights and engage directly with sellers.
                  </p>

                  <ul className="space-y-6 mb-10">
                    <li className="flex items-start">
                      <div className="mt-1 mr-4 p-3 bg-brand-dark-blue rounded-xl shadow-md group-hover:bg-brand-sky-blue transition-colors duration-300 shrink-0">
                        <NobridgeIcon icon="business-listing" size="md" className="w-6 h-6 drop-shadow-md" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-brand-dark-blue text-lg">Vetted Listings</h4>
                        <p className="text-sm text-muted-foreground mt-1">Every business is verified for authenticity and operational status.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="mt-1 mr-4 p-3 bg-brand-dark-blue rounded-xl shadow-md group-hover:bg-brand-sky-blue transition-colors duration-300 shrink-0">
                        <NobridgeIcon icon="deal-structure" size="md" className="w-6 h-6 drop-shadow-md" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-brand-dark-blue text-lg">Advanced Filtering</h4>
                        <p className="text-sm text-muted-foreground mt-1">Find exactly what matches your investment criteria instantly.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="mt-1 mr-4 p-3 bg-brand-dark-blue rounded-xl shadow-md group-hover:bg-brand-sky-blue transition-colors duration-300 shrink-0">
                        <NobridgeIcon icon="worldwide" size="md" className="w-6 h-6 drop-shadow-md" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-brand-dark-blue text-lg">Direct Engagement</h4>
                        <p className="text-sm text-muted-foreground mt-1">Connect directly with business owners after verification.</p>
                      </div>
                    </li>
                  </ul>

                  <div className="mt-auto pt-6">
                    <Link href="/marketplace" className="inline-flex items-center justify-center w-full md:w-auto px-8 py-4 text-base font-semibold text-brand-dark-blue transition-all duration-300 bg-white border-2 border-brand-dark-blue rounded-xl hover:bg-brand-dark-blue hover:text-white hover:shadow-lg hover:-translate-y-1 group-hover:w-full">
                      Explore Marketplace
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <AnimatedBackground position="absolute" className="z-0" />
        <div className="container mx-auto px-4 relative z-10">
          <FadeIn direction="up">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white text-center mb-4 font-heading">Trusted by the Business Community</h2>
            <p className="text-center text-brand-light-gray/90 text-lg mb-12 md:mb-16">Hear from entrepreneurs and investors who have found success with Nobridge.</p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { quote: "We were skeptical about listing our logistics firm online, but Nobridge's verification process brought us three serious offers within a month. The due diligence support was exceptional.", name: "Wei Chen", role: "Founder of SwiftLogistics, Singapore" },
              { quote: "As a family office looking to diversify into Vietnamese manufacturing, finding trustworthy deals is hard. Nobridge's curated marketplace allowed us to bypass the usual noise and connect directly with vetted sellers.", name: "Sarah Thong", role: "Managing Partner at Horizon Ventures, Malaysia" },
              { quote: "Selling a 20-year-old family business is emotional. The team at Nobridge understood that. They didn't just find a buyer; they found a successor who respected our legacy.", name: "Budi Santoso", role: "Former Owner of Santoso Textiles, Indonesia" },
            ].map((testimonial, index) => (
              <FadeIn key={index} delay={index * 100} className="h-full">
                <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl hover:shadow-2xl transition-shadow rounded-lg text-white h-full">
                  <CardContent className="p-8">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="h-5 w-5 text-amber-400 drop-shadow-sm" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-200 mb-4 italic text-base leading-relaxed">&quot;{testimonial.quote}&quot;</p>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-300">{testimonial.role}</p>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* "As Mentioned In" / Credibility Logos - REPLACED */}
      <section className="py-12 md:py-16 bg-brand-white">
        <div className="container mx-auto px-4 text-center">
          <FadeIn>
            <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider mb-10 font-heading">Featured In</h3>
          </FadeIn>
          <FadeIn delay={200}>
            <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-10 md:gap-x-16 lg:gap-x-20">
              {featuredCompanyLogos.map((logo, index) => (
                <div key={index} className="h-20 md:h-24 lg:h-28 flex items-center"> {/* Made even bigger */}
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={220} // Increased width more
                    height={90} // Increased height more
                    className="object-contain max-h-full"
                    data-ai-hint={logo.dataAiHint}
                  />
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-20 md:py-32 bg-brand-dark-blue text-brand-white">
        <div className="container mx-auto px-4 text-center">
          <FadeIn direction="up">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-light-gray/70 mb-3">OUR COMMITMENT</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 font-heading">Empowering SME Growth and Transitions Across Asia</h2>
            <p className="text-lg md:text-xl text-brand-light-gray/90 max-w-3xl mx-auto mb-10">
              At Nobridge, we believe in the power of small and medium-sized enterprises. Our mission is to provide a transparent, efficient, and supportive platform that connects business owners with the right investors and buyers, fostering growth and successful transitions throughout the continent.
            </p>
            <Link href="/about" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-brand-white text-brand-dark-blue bg-brand-white hover:bg-brand-light-gray h-11 py-3 px-8 text-base">
              Learn More About Us
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Final Call to Action Section */}
      <section className="py-16 md:py-24 bg-brand-white">
        <div className="container mx-auto px-4 text-center">
          <FadeIn direction="up">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-brand-dark-blue mb-4 font-heading">Ready to Begin Your Journey?</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10">
              Whether you&apos;re looking to sell your business, find your next investment, or simply learn more, our team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link href="/auth/register" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-brand-dark-blue text-brand-white hover:bg-brand-dark-blue/90 h-11 py-3 px-8 text-base">
                Register Now
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-brand-dark-blue text-brand-dark-blue hover:bg-brand-dark-blue/5 h-11 py-3 px-8 text-base">
                Contact Our Team
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}

