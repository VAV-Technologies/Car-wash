'use client';

import * as React from "react";
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, DollarSign, Briefcase, CheckCircle2, ExternalLink, TrendingUp } from 'lucide-react';

interface ApiListing {
  id: string;
  title: string;
  short_description: string;
  asking_price?: number;
  industry: string;
  location_country: string;
  location_city: string;
  verification_status: string;
  images?: string[];
  annual_revenue_range?: string;
  verified_annual_revenue?: number;
  created_at: string;
}

interface ListingCardProps {
  listing: ApiListing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const truncatedDescription = listing.short_description && listing.short_description.length > 100
    ? listing.short_description.substring(0, 100) + "..."
    : listing.short_description || 'No description available';

  const displayPrice = listing.asking_price ? `$${listing.asking_price.toLocaleString()} USD` : 'Contact for Price';

  const formatRevenueDisplay = (listing: ApiListing): string => {
    if (typeof listing.verified_annual_revenue === 'number' && listing.verified_annual_revenue > 0) {
      return `$${listing.verified_annual_revenue.toLocaleString()} USD (Verified)`;
    }
    if (listing.annual_revenue_range) {
      return listing.annual_revenue_range;
    }
    return 'N/A';
  };

  return (
    <Link href={`/listings/${listing.id}`} className="block h-full group">
      <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-2xl hover:scale-[1.02] hover:border-brand-sky-blue/50 transition-all duration-300 rounded-none bg-white/10 backdrop-blur-md border-white/20 text-white cursor-pointer p-3 sm:p-4 gap-2 sm:gap-3">
        {/* Square image - inner box */}
        <div className="relative border border-white/15 overflow-hidden">
          <div className="aspect-square w-full">
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
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              data-ai-hint={listing.images ? (listing.industry ? listing.industry.toLowerCase().replace(/\s+/g, '-') : "business") : "generic business"}
            />
          </div>
          {listing.verification_status === 'verified' && (
            <Badge variant="outline" className="absolute top-2 right-2 bg-green-600 border-green-500 text-white">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Verified Seller
            </Badge>
          )}
        </div>

        {/* Title - inner box */}
        <div className="border border-white/15 px-4 py-3">
          <h3 className="text-lg font-medium text-white leading-tight group-hover:text-brand-sky-blue transition-colors">
            {listing.title}
          </h3>
        </div>

        {/* Detail rows - merged into one box */}
        <div className="border border-white/15 text-sm text-gray-300">
          <div className="flex items-center px-4 py-2.5">
            <Briefcase className="h-4 w-4 mr-2 text-brand-sky-blue shrink-0" />
            <span>{listing.industry}</span>
          </div>
          <div className="flex items-center px-4 py-2.5 border-t border-white/10">
            <MapPin className="h-4 w-4 mr-2 text-brand-sky-blue shrink-0" />
            <span>{listing.location_city}, {listing.location_country}</span>
          </div>
          <div className="flex items-center px-4 py-2.5 border-t border-white/10">
            <TrendingUp className="h-4 w-4 mr-2 text-brand-sky-blue shrink-0" />
            <span>Revenue: {formatRevenueDisplay(listing)}</span>
          </div>
        </div>

        {/* Description - inner box */}
        <div className="border border-white/15 px-4 py-3 flex-grow">
          <p className="text-sm text-gray-200 leading-relaxed">{truncatedDescription}</p>
        </div>

        {/* View Details - full width inner box */}
        <div className="border border-white/15 flex items-center justify-center w-full h-11 text-sm font-medium bg-white/10 text-white group-hover:bg-brand-sky-blue group-hover:text-brand-dark-blue transition-colors">
          View Details <ExternalLink className="ml-2 h-4 w-4" />
        </div>
      </Card>
    </Link>
  );
}
