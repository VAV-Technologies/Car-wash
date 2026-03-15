'use client';

// Force dynamic rendering due to client-side interactivity
export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';

import { ListingCard } from '@/components/marketplace/listing-card';
import { Filters } from '@/components/marketplace/filters';
import { SortDropdown } from '@/components/marketplace/sort-dropdown';
import { PaginationControls } from '@/components/shared/pagination-controls';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { SlidersHorizontal, Briefcase, AlertCircle, Filter, Globe, ShieldCheck, Handshake, Building2, Users2, Lock, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMarketplaceFilters } from '@/hooks/use-marketplace-filters';
import { AnimatedBackground } from '@/components/ui/animated-background';

// Real API function to fetch marketplace listings with filters and pagination
async function getMarketplaceListings(
  apiParams: Record<string, string>
): Promise<{ listings: any[], totalPages: number, totalListings: number }> {
  const searchParams = new URLSearchParams(apiParams);
  const response = await fetch(`/api/listings?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch listings: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  return {
    listings: data.listings || [],
    totalPages: data.pagination?.totalPages || 0,
    totalListings: data.pagination?.total || 0
  };
}

function MarketplaceContent() {
  const { toast } = useToast();

  const {
    appliedFilters, // Use appliedFilters for fetching data
    setPage,
    getAPIParams,
    isLoading,
    setIsLoading,
    hasActiveFilters
  } = useMarketplaceFilters();

  const [listings, setListings] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalListings, setTotalListings] = useState(0);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  // Fetch listings whenever appliedFilters change (these are the filters after "Apply" is clicked)
  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const apiParams = getAPIParams(); // This now uses appliedFilters
        const data = await getMarketplaceListings(apiParams);

        setListings(data.listings);
        setTotalPages(data.totalPages);
        setTotalListings(data.totalListings);
      } catch (error) {
        console.error("Failed to fetch listings:", error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load listings';
        setError(errorMessage);
        toast({
          title: "Error Loading Listings",
          description: "Unable to load marketplace listings. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, [appliedFilters, getAPIParams, setIsLoading, toast]); // Depend on appliedFilters

  const handlePageChange = (page: number) => {
    setPage(page); // This updates appliedFilters and URL directly
  };

  return (
    <>
      <AnimatedBackground />
      <div className="container pt-32 md:pt-36 pb-16 md:pb-24 relative z-10">
        <div className="mb-6 w-full bg-white/10 backdrop-blur-md p-4 sm:p-6 md:p-8 rounded-none border border-white/20 shadow-xl">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-white font-heading">Business Marke<span style={{ fontSize: '1.06em' }}>t</span>place</h1>
            <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-white shrink-0" />
          </div>
          <Separator className="bg-white/10 my-4" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-gray-200 text-base sm:text-lg">
              {isLoading ? 'Loading listings...' : `Explore all available business opportunities. Found ${totalListings} listings.`}
              {hasActiveFilters && !isLoading && (
                <span className="ml-2 text-brand-sky-blue font-medium">
                  (Filtered results)
                </span>
              )}
            </p>
            <div className="border border-white/20 shrink-0 w-full sm:w-auto">
              <Button onClick={() => setShowHowItWorks(true)} className="rounded-none bg-brand-sky-blue text-white hover:bg-brand-sky-blue/90 h-9 text-sm px-4 border-0 w-full sm:w-auto">
                How Does It Work?
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile filter button and sort */}
        <div className="md:hidden mb-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 h-11 rounded-none">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <span className="ml-2 bg-brand-sky-blue text-white text-xs rounded-none px-2 py-1">
                      Active
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 border-r-white/20 bg-brand-dark-blue/95 backdrop-blur-xl text-white">
                <div className="h-full flex flex-col">
                  <div className="flex-grow overflow-y-auto p-4">
                    <Filters />
                  </div>
                  <SheetClose asChild>
                    <Button variant="outline" className="m-4 border-white/20 text-white hover:bg-white/10 hover:text-white rounded-none">Close Filters</Button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="flex-1">
            <SortDropdown />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <aside className="hidden md:block md:col-span-3">
            <div className="sticky top-24 h-fit">
              <Filters />
            </div>
          </aside>
          <main className="md:col-span-9">
            {/* Desktop sort dropdown aligned with top of filters */}
            <div className="hidden md:flex justify-end mb-6">
              <SortDropdown />
            </div>
            {error ? (
              <div className="text-center py-12 col-span-full flex flex-col items-center justify-center h-[400px] bg-red-900/20 backdrop-blur-md rounded-none border border-red-500/30">
                <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
                <p className="text-xl text-red-300 font-normal mb-2">Failed to Load Listings</p>
                <p className="text-sm text-red-200 mb-4">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-red-500/50 text-red-300 hover:bg-red-500/20 rounded-none"
                >
                  Try Again
                </Button>
              </div>
            ) : isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-96 w-full rounded-none bg-white/5" />)}
              </div>
            ) : listings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 col-span-full flex flex-col items-center justify-center h-[400px] bg-white/5 backdrop-blur-md rounded-none border border-white/10 border-dashed">
                <Briefcase className="h-16 w-16 text-gray-400 mb-4" />
                <p className="text-xl text-gray-200 font-normal">No listings available, but we can help.</p>
                <div className="text-sm text-gray-300 mt-2 max-w-md leading-relaxed">
                  <p>If you have a buyer mandate, please reach out to <a href="mailto:business@nobridge.co" className="text-brand-sky-blue hover:underline">business@nobridge.co</a>.</p>
                  <p className="mt-1">We have the most advanced systems to find and reach out to any company that meet your criteria.</p>
                </div>
                <Button variant="link" asChild className="mt-4 text-brand-sky-blue hover:text-white rounded-none">
                  <Link href="/marketplace">Clear all filters</Link>
                </Button>
              </div>
            )}
            {!isLoading && !error && totalListings > 0 && totalPages > 1 && (
              <PaginationControls
                currentPage={appliedFilters.page} // Use appliedFilters.page for current page
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </main>
        </div>
      </div>

      {/* How Does It Work Dialog */}
      <Dialog open={showHowItWorks} onOpenChange={setShowHowItWorks}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-brand-dark-blue/95 backdrop-blur-xl border border-white/20 rounded-none text-white p-0 [&>button:last-child]:hidden">
          <DialogHeader className="px-4 sm:px-8 pt-6 sm:pt-8 pb-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-normal text-white font-heading flex items-center gap-3">
                <Globe className="h-6 w-6 text-brand-sky-blue" />
                How Does It Work?
              </DialogTitle>
              <DialogClose className="text-white hover:text-gray-300">
                <X className="h-5 w-5" />
              </DialogClose>
            </div>
          </DialogHeader>

          <div className="px-4 sm:px-8 pb-6 sm:pb-8 pt-4 space-y-6 sm:space-y-8">
            {/* What Is This Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-brand-sky-blue uppercase tracking-wider">What Is This Business Marketplace?</h3>
              <Separator className="bg-white/10" />
              <div className="border border-white/15 bg-white/5 backdrop-blur-sm p-4 space-y-2">
                <p className="text-sm text-gray-300 text-justify">The Nobridge Business Marketplace is where prospective buyers can browse acquisition opportunities listed directly by Nobridge as well as through our trusted external partners. Each listing provides key business details, financials, and deal structure information to help you evaluate opportunities before making an inquiry.</p>
                <p className="text-sm text-gray-300 text-justify">Whether you are looking for a full acquisition, a partial stake, or a fundraising opportunity, this marketplace is designed to connect you with the right businesses across Asia.</p>
              </div>
            </div>

            {/* Badge Types Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-brand-sky-blue uppercase tracking-wider">Listing Badge Types</h3>
              <Separator className="bg-white/10" />
              <div className="space-y-3">
                <div className="border border-white/15 bg-white/5 backdrop-blur-sm p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-green-400" />
                    <span className="font-medium text-white">Nobridge / Full Acquisition</span>
                  </div>
                  <Separator className="bg-white/10" />
                  <p className="text-sm text-gray-300 text-justify">100% acquisition opportunity. The business is listed directly by Nobridge and is available for a complete buyout.</p>
                </div>

                <div className="border border-white/15 bg-white/5 backdrop-blur-sm p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Users2 className="h-4 w-4 text-green-400" />
                    <span className="font-medium text-white">Nobridge / Partial Acquisition / Fundraising</span>
                  </div>
                  <Separator className="bg-white/10" />
                  <p className="text-sm text-gray-300 text-justify">The business is seeking a partial stake sale or fundraising round. You can acquire a percentage of the company or invest as part of a capital raise.</p>
                </div>

                <div className="border border-white/15 bg-white/5 backdrop-blur-sm p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Handshake className="h-4 w-4 text-green-400" />
                    <span className="font-medium text-white">Nobridge / Open to Talks</span>
                  </div>
                  <Separator className="bg-white/10" />
                  <p className="text-sm text-gray-300 text-justify">The seller is open to both full and partial acquisition discussions. Deal structure is flexible and can be negotiated.</p>
                </div>

                <div className="border border-white/15 bg-white/5 backdrop-blur-sm p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Handshake className="h-4 w-4 text-amber-400" />
                    <span className="font-medium text-white">External Party / Full Acquisition</span>
                  </div>
                  <Separator className="bg-white/10" />
                  <p className="text-sm text-gray-300 text-justify">This listing was provided by an external partner. Nobridge can represent you as a buyer and conduct due diligence on your behalf.</p>
                </div>
              </div>
            </div>

            {/* Nobridge vs External Party */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-brand-sky-blue uppercase tracking-wider">Nobridge vs External Party Listings</h3>
              <Separator className="bg-white/10" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="border border-white/15 bg-white/5 backdrop-blur-sm p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-green-400" />
                    <span className="font-medium text-white">Nobridge Listings</span>
                  </div>
                  <Separator className="bg-white/10" />
                  <p className="text-sm text-gray-300 text-justify">Listed directly by Nobridge. You can communicate with us directly, submit inquiries through the platform, and access verified information after completing buyer verification.</p>
                </div>
                <div className="border border-white/15 bg-white/5 backdrop-blur-sm p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Handshake className="h-5 w-5 text-amber-400" />
                    <span className="font-medium text-white">External Party Listings</span>
                  </div>
                  <Separator className="bg-white/10" />
                  <p className="text-sm text-gray-300 text-justify">Listed by a trusted partner. Nobridge can act as your representative buyer to conduct due diligence and negotiations on your behalf.</p>
                </div>
              </div>
            </div>

            {/* Why Verification & NDA */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-brand-sky-blue uppercase tracking-wider">Why Verification & NDA?</h3>
                <Lock className="h-5 w-5 text-brand-sky-blue shrink-0" />
              </div>
              <Separator className="bg-white/10" />
              <div className="border border-white/15 bg-white/5 backdrop-blur-sm p-4 space-y-2">
                <p className="text-sm text-gray-300 text-justify">Certain listing details, such as the CIM, specific financials, seller information, and the Virtual Data Room, are restricted access.</p>
                <p className="text-sm text-gray-300 text-justify">This is because the information is confidential and requires a Non-Disclosure Agreement (NDA) to be executed within the correct legal framework, protecting both the seller and the buyer.</p>
                <p className="text-sm text-gray-300 text-justify">To access restricted content, create an account and complete the buyer verification process. Once verified, you will be able to view all confidential materials and submit inquiries.</p>
              </div>
            </div>

            {/* CTA */}
            <div className="border border-white/15 bg-white/5 backdrop-blur-sm p-4 flex items-center justify-between">
              <p className="text-sm text-gray-300 text-justify">Ready to explore opportunities?</p>
              <Button asChild className="rounded-none bg-brand-sky-blue text-white hover:bg-brand-sky-blue/90 h-9 text-sm px-4 border-0">
                <Link href="/auth/register">Create an Account</Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div>Loading marketplace filters...</div>}>
      <MarketplaceContent />
    </Suspense>
  );
}
