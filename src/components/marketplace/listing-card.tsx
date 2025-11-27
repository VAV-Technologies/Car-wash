'use client';

import * as React from "react";
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, DollarSign, Briefcase, CheckCircle2, ExternalLink, TrendingUp } from 'lucide-react'; // Replaced ShieldCheck with CheckCircle2
import { NobridgeIcon } from '@/components/ui/nobridge-icon';

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
      <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-2xl hover:scale-[1.02] hover:border-brand-sky-blue/50 transition-all duration-300 rounded-lg bg-white/10 backdrop-blur-md border-white/20 text-white cursor-pointer">
        <CardHeader className="p-0 relative">
          <div className="overflow-hidden h-48 w-full">
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
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              data-ai-hint={listing.images ? (listing.industry ? listing.industry.toLowerCase().replace(/\s+/g, '-') : "business") : "generic business"}
            />
          </div>
          {listing.verification_status === 'verified' && (
            <Badge variant="outline" className="absolute top-2 right-2 bg-green-500/20 border-green-400 text-green-100 backdrop-blur-sm">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Verified Seller
            </Badge>
          )}
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-lg text-white mb-2 leading-tight group-hover:text-brand-sky-blue transition-colors">
            {listing.title}
          </CardTitle>
          <div className="space-y-2 text-sm text-gray-300">
            <div className="flex items-center">
              <Briefcase className="h-4 w-4 mr-2 text-brand-sky-blue" />
              <span>{listing.industry}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-brand-sky-blue" />
              <span>{listing.location_city}, {listing.location_country}</span>
            </div>
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-brand-sky-blue" />
              <span>Revenue: {formatRevenueDisplay(listing)}</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-brand-sky-blue" />
              <span>Asking Price: {displayPrice}</span>
            </div>
            <p className="text-sm text-gray-200 pt-1">{truncatedDescription}</p>
          </div>
        </CardContent>
        <CardFooter className="p-4 border-t border-white/10">
          <div className="flex justify-end items-center w-full">
            <div className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-3 bg-white/20 text-white group-hover:bg-brand-sky-blue group-hover:text-brand-dark-blue border border-white/20 backdrop-blur-sm">
              View Details <ExternalLink className="ml-2 h-4 w-4" />
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

