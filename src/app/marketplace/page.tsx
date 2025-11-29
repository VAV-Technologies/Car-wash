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
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { SlidersHorizontal, Briefcase, AlertCircle, Filter } from 'lucide-react';
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
      <div className="container py-8 md:py-12 relative z-10">
        <div className="mb-6 w-full bg-white/10 backdrop-blur-md p-6 md:p-8 rounded-lg border border-white/20 shadow-xl">
          <h1 className="text-3xl font-semibold tracking-tight text-white font-heading">Business Marketplace</h1>
          <p className="text-gray-200 mt-2 text-lg">
            {isLoading ? 'Loading listings...' : `Explore all available business opportunities. Found ${totalListings} listings.`}
            {hasActiveFilters && !isLoading && (
              <span className="ml-2 text-brand-sky-blue font-medium">
                (Filtered results)
              </span>
            )}
          </p>
        </div>

        <div className="mb-8 flex justify-end items-center gap-4">
          <div className="md:hidden flex-grow">
            <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 h-11">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <span className="ml-2 bg-brand-sky-blue text-white text-xs rounded-full px-2 py-1">
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
                    <Button variant="outline" className="m-4 border-white/20 text-white hover:bg-white/10 hover:text-white">Close Filters</Button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="w-full md:w-auto">
            <SortDropdown />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <aside className="hidden md:block md:col-span-3 md:sticky md:top-24 h-fit">
            <Filters />
          </aside>
          <main className="md:col-span-9">
            {error ? (
              <div className="text-center py-12 col-span-full flex flex-col items-center justify-center h-[400px] bg-red-900/20 backdrop-blur-md rounded-md border border-red-500/30">
                <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
                <p className="text-xl text-red-300 font-semibold mb-2">Failed to Load Listings</p>
                <p className="text-sm text-red-200 mb-4">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-red-500/50 text-red-300 hover:bg-red-500/20"
                >
                  Try Again
                </Button>
              </div>
            ) : isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-96 w-full rounded-lg bg-white/5" />)}
              </div>
            ) : listings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 col-span-full flex flex-col items-center justify-center h-[400px] bg-white/5 backdrop-blur-md rounded-md border border-white/10 border-dashed">
                <Briefcase className="h-16 w-16 text-gray-400 mb-4" />
                <p className="text-xl text-gray-200 font-semibold">No listings available, but we can help.</p>
                <div className="text-sm text-gray-300 mt-2 max-w-md leading-relaxed">
                  <p>If you have a buyer mandate, please reach out to <a href="mailto:business@nobridge.co" className="text-brand-sky-blue hover:underline">business@nobridge.co</a>.</p>
                  <p className="mt-1">We have the most advanced systems to find and reach out to any company that meet your criteria.</p>
                </div>
                <Button variant="link" asChild className="mt-4 text-brand-sky-blue hover:text-white">
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
