'use client';

// Force dynamic rendering due to client-side interactivity
export const dynamic = 'force-dynamic'

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
  MapPin, DollarSign, Briefcase, ShieldCheck, MessageSquare, CalendarDays, UserCircle,
  Info, TrendingUp, Tag, HandCoins, FileText, Link as LinkIconLucide, Building, Brain, Globe,
  BookOpen, ExternalLink, Users2 as UsersIcon, Images as ImagesIcon, Banknote, Eye,
  ChevronLeft, ChevronRight, CheckCircle2, Loader2, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { ConversationButton } from "@/components/marketplace/ConversationButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUPPORTED_CURRENCIES, getCurrency } from '@/lib/currency-config';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatedBackground } from '@/components/ui/animated-background';

// Type definitions for the listing data
interface ListingData {
  id: string;
  title: string;
  short_description: string;
  asking_price: number;
  industry: string;
  location_country: string;
  location_city: string;
  established_year?: number;
  number_of_employees?: string;
  website_url?: string;
  images?: string[];
  status: string;
  verification_status: string;
  seller_id: string;
  annual_revenue_range?: string;
  net_profit_margin_range?: string;
  verified_annual_revenue?: number;
  verified_net_profit?: number;
  verified_cash_flow?: number;
  key_strength_1?: string;
  key_strength_2?: string;
  key_strength_3?: string;
  growth_opportunity_1?: string;
  growth_opportunity_2?: string;
  growth_opportunity_3?: string;
  key_strengths_anonymous?: string[];
  specific_growth_opportunities?: string;

  business_model?: string;
  deal_structure_looking_for?: string[];
  reason_for_selling_anonymous?: string;
  detailed_reason_for_selling?: string;
  adjusted_cash_flow?: number;
  ebitda?: number;
  social_media_links?: string;
  registered_business_name?: string;
  is_seller_verified?: boolean;

  financial_documents_url?: string;
  key_metrics_report_url?: string;
  ownership_documents_url?: string;
  financial_snapshot_url?: string;
  ownership_details_url?: string;
  location_real_estate_info_url?: string;
  web_presence_info_url?: string;
  secure_data_room_link?: string;
  created_at: string;
}

// Helper to format currency
const formatCurrency = (amount?: number, currencyCode: string = 'USD', rates: Record<string, number> | null = null) => {
  if (amount === undefined || amount === null) return 'N/A';

  const rate = rates ? rates[currencyCode] : 1;
  const convertedAmount = amount * (rate || 1);

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(convertedAmount);
};

// Function to parse and convert revenue ranges like "$1M - $5M USD"
const convertRevenueRange = (rangeString: string, currencyCode: string = 'USD', rates: Record<string, number> | null = null) => {
  if (!rangeString) return null;

  // Extract numbers and convert notation (K, M, B) to actual values
  const parseAmount = (str: string): number | null => {
    const match = str.match(/\$?(\d+(?:\.\d+)?)\s*([KMB])?/i);
    if (!match) return null;

    const num = parseFloat(match[1]);
    const multiplier = match[2]?.toUpperCase();

    switch (multiplier) {
      case 'K': return num * 1000;
      case 'M': return num * 1000000;
      case 'B': return num * 1000000000;
      default: return num;
    }
  };

  // Format with appropriate abbreviation
  const formatWithAbbreviation = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(amount % 1000000000 === 0 ? 0 : 1)}B`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(amount % 1000000 === 0 ? 0 : 1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`;
    } else {
      return amount.toFixed(0);
    }
  };

  // Split on " - " or "-" and parse each part
  const parts = rangeString.split(/\s*-\s*/);

  if (parts.length === 1) {
    const amount = parseAmount(parts[0]);
    if (amount === null) return rangeString;

    const rate = rates ? rates[currencyCode] : 1;
    const converted = amount * (rate || 1);

    const currency = getCurrency(currencyCode);
    if (!currency) return rangeString;

    return `${currency.symbol}${formatWithAbbreviation(converted)}${rangeString.includes('+') ? '+' : ''} ${currencyCode}`;
  }

  if (parts.length !== 2) return rangeString; // Return original if can't parse

  const minAmount = parseAmount(parts[0]);
  const maxAmount = parseAmount(parts[1]);

  if (minAmount === null || maxAmount === null) return rangeString;

  // Convert to selected currency
  const rate = rates ? rates[currencyCode] : 1;
  const convertedMin = minAmount * (rate || 1);
  const convertedMax = maxAmount * (rate || 1);

  const currency = getCurrency(currencyCode);
  if (!currency) return rangeString; // Fallback if currency not found
  return `${currency.symbol}${formatWithAbbreviation(convertedMin)} - ${currency.symbol}${formatWithAbbreviation(convertedMax)} ${currencyCode}`;
};

const DEFAULT_LISTING_IMAGES = [
  'https://placehold.co/800x600.png',
  'https://placehold.co/600x400.png',
  'https://placehold.co/600x450.png',
  'https://placehold.co/800x500.png',
  'https://placehold.co/700x500.png'
];

function ImageGallery({ imageUrls, listingTitle }: { imageUrls?: string[]; listingTitle: string }) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

  const validImageUrls = React.useMemo(() => {
    const filtered = (imageUrls || []).filter(url => url && url.trim() !== "");
    return filtered.length > 0 ? filtered : [DEFAULT_LISTING_IMAGES[0]];
  }, [imageUrls]);

  // Reset index if urls change
  React.useEffect(() => {
    setCurrentIndex(0);
  }, [validImageUrls]);

  const mainImage = validImageUrls[0]; // Always show the first image in the sidebar
  const currentDialogImage = validImageUrls[currentIndex];

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex + 1) % validImageUrls.length);
  };

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex - 1 + validImageUrls.length) % validImageUrls.length);
  };

  const openPreview = () => {
    setIsPreviewOpen(true);
  };

  return (
    <div className="w-full">
      <Card className="shadow-md bg-white/10 backdrop-blur-md border-white/20 overflow-hidden">
        <CardContent className="p-0">
          <div
            className={cn(
              "shadow-inner bg-muted aspect-[16/10] flex items-center justify-center relative cursor-pointer group w-full",
            )}
            onClick={openPreview}
          >
            <Image
              src={mainImage}
              alt={`Main image for ${listingTitle}`}
              fill={true}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 400px, 400px"
              className="transition-transform duration-300 group-hover:scale-105 object-cover"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.src = DEFAULT_LISTING_IMAGES[0];
              }}
              data-ai-hint="business office product"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
            {validImageUrls.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm flex items-center gap-1">
                <ImagesIcon className="h-3 w-3" />
                <span>+{validImageUrls.length - 1}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl p-2 sm:p-4 !rounded-lg">
          <DialogHeader className="sr-only">
            <DialogTitle>Image Preview: {listingTitle}</DialogTitle>
          </DialogHeader>
          <div className="relative aspect-video bg-black rounded-md">
            <Image
              src={currentDialogImage}
              alt={`Enlarged image for ${listingTitle} (${currentIndex + 1} of ${validImageUrls.length})`}
              fill={true}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              className="object-contain"
              key={`dialog-${currentDialogImage}`}
            />
            {validImageUrls.length > 1 && (
              <>
                <Button variant="ghost" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full h-10 w-10" onClick={handlePrevImage} aria-label="Previous image"><ChevronLeft className="h-6 w-6" /></Button>
                <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full h-10 w-10" onClick={handleNextImage} aria-label="Next image"><ChevronRight className="h-6 w-6" /></Button>
              </>
            )}
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-black/40 hover:bg-black/60 text-white rounded-full h-8 w-8">
                <X className="h-5 w-5" />
                <span className="sr-only">Close preview</span>
              </Button>
            </DialogClose>
          </div>
          {validImageUrls.length > 1 && (
            <div className="text-center text-sm text-muted-foreground mt-2">
              Image {currentIndex + 1} of {validImageUrls.length}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ListingDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const listingId = typeof params.listingId === 'string' ? params.listingId : '';

  const [listing, setListing] = React.useState<ListingData | null | undefined>(undefined);
  const [currentUser, setCurrentUser] = React.useState<any | null | undefined>(undefined);
  const [inquirySent, setInquirySent] = React.useState(false);
  const [isSubmittingInquiry, setIsSubmittingInquiry] = React.useState(false);
  const [showVerificationPopup, setShowVerificationPopup] = React.useState(false);
  const [isCheckingInquiry, setIsCheckingInquiry] = React.useState(false);
  const [showInquiryDialog, setShowInquiryDialog] = React.useState(false);
  const [inquiryMessage, setInquiryMessage] = React.useState("");

  const [rates, setRates] = React.useState<Record<string, number> | null>(null);
  const [selectedCurrency, setSelectedCurrency] = React.useState('USD');
  const [ratesError, setRatesError] = React.useState<string | null>(null);
  const [isLoadingRates, setIsLoadingRates] = React.useState(true);

  const checkExistingInquiry = React.useCallback(async () => {
    if (!currentUser || currentUser.role !== 'buyer' || !listingId) return;
    setIsCheckingInquiry(true);
    try {
      const response = await fetch(`/api/inquiries/check?listing_id=${listingId}`);
      if (response.ok) {
        const data = await response.json();
        setInquirySent(data.has_inquired);
      } else {
        console.warn('Failed to check existing inquiry, assuming not inquired.');
        setInquirySent(false);
      }
    } catch (error) {
      console.error('Error checking inquiry status:', error);
      setInquirySent(false);
    } finally {
      setIsCheckingInquiry(false);
    }
  }, [currentUser, listingId]);

  React.useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/current-user');
        if (response.ok) {
          const data = await response.json();
          const transformedUser = data.profile ? { ...data.profile, id: data.user.id, email: data.user.email, verificationStatus: data.profile.verificationStatus || data.profile.verification_status || 'anonymous', isPaid: data.profile.isPaid || (data.profile.verification_status === 'verified'), phoneNumber: data.profile.phoneNumber || data.profile.phone_number, isOnboardingCompleted: data.profile.isOnboardingCompleted || data.profile.is_onboarding_completed, isEmailVerified: data.profile.isEmailVerified || data.profile.is_email_verified } : null;
          setCurrentUser(transformedUser);
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setCurrentUser(null);
      }
    };
    fetchCurrentUser();
  }, []);

  React.useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`/api/listings/${listingId}`);
        if (response.ok) { setListing(await response.json()); }
        else if (response.status === 404) { setListing(null); }
        else { console.error('Error fetching listing:', response.statusText); setListing(null); }
      } catch (error) { console.error('Error fetching listing:', error); setListing(null); }
    };
    if (listingId) { fetchListing(); }
  }, [listingId]);

  React.useEffect(() => { if (currentUser && listing) { checkExistingInquiry(); } }, [currentUser, listing, checkExistingInquiry]);

  const keyStrengths = React.useMemo(() => {
    if (!listing) return [];
    const strengths = [listing.key_strength_1, listing.key_strength_2, listing.key_strength_3].filter(s => s && s.trim() !== "") as string[];
    return strengths.length > 0 ? strengths : (listing.key_strengths_anonymous || []);
  }, [listing]);

  const growthOpportunities = React.useMemo(() => {
    if (!listing) return [];
    const opportunities = [listing.growth_opportunity_1, listing.growth_opportunity_2, listing.growth_opportunity_3].filter(o => o && o.trim() !== "") as string[];
    return opportunities.length > 0 ? opportunities : (listing.specific_growth_opportunities?.split('\n').filter((line: string) => line.trim() !== '') || []);
  }, [listing]);

  const cfMultiple = React.useMemo(() => {
    if (!listing) return 'N/A';
    return (listing.asking_price && listing.adjusted_cash_flow && listing.adjusted_cash_flow > 0)
      ? (listing.asking_price / listing.adjusted_cash_flow).toFixed(2) + 'x'
      : 'N/A';
  }, [listing]);

  React.useEffect(() => {
    const fetchRates = async () => {
      try {
        setIsLoadingRates(true);
        const response = await fetch('/api/currency/rates');
        if (!response.ok) throw new Error('Failed to fetch exchange rates.');
        const data = await response.json();
        setRates(data);
        setRatesError(null);
      } catch (err) {
        setRatesError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoadingRates(false);
      }
    };
    fetchRates();
  }, []);

  if (listing === undefined || currentUser === undefined || isCheckingInquiry) {
    return <div className="container py-8 text-center min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <p className="ml-3">Loading listing details...</p></div>;
  }

  if (!listing) { notFound(); return null; }

  const isVerifiedBuyer = (user: any): boolean => {
    if (!user) return false;
    const verificationStatus = user.verificationStatus || user.verification_status;
    const isVerified = verificationStatus === 'verified';
    const isPaid = user.isPaid || isVerified; // Assuming verified implies paid access for MVP
    return isVerified && isPaid;
  };

  /**
   * Determines if current user can view verified listing details
   * Access is granted to:
   * - Listing owner (seller who created the listing) - ALWAYS, regardless of verification status
   * - Admin users (for moderation purposes) - ALWAYS
   * - Verified buyers (who have completed verification process) - ONLY for verified seller listings
   */
  const canViewVerifiedDetails = currentUser && (
    (currentUser.id === listing.seller_id) ||  // Seller always sees own content
    (currentUser.role === 'admin') ||          // Admin always sees all content
    (listing.is_seller_verified && isVerifiedBuyer(currentUser))  // Only verified sellers' content visible to verified buyers
  );

  const handleInquireClick = () => {
    if (!currentUser) {
      toast({ title: 'Login Required', description: 'Please login or register as a buyer to inquire.', variant: 'destructive' });
      return;
    }
    if (currentUser.role === 'seller') {
      toast({ title: 'Action Not Available', description: 'Sellers cannot inquire about businesses.', className: 'border-yellow-200 bg-yellow-50 text-yellow-800' });
      return;
    }
    if (inquirySent) {
      toast({ title: 'Already Inquired', description: 'You have already sent an inquiry for this listing.' });
      return;
    }
    setShowInquiryDialog(true);
  };

  const handleInquirySubmit = async () => {
    if (!currentUser || !listingId) return;
    setIsSubmittingInquiry(true);
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ listing_id: listingId, message: inquiryMessage }),
      });
      const data = await response.json();
      if (response.ok) {
        setInquirySent(true);
        setShowInquiryDialog(false);
        setInquiryMessage("");
        toast({ title: 'Inquiry Sent!', description: `Your inquiry for "${listing.title}" has been submitted.` });
      } else if (response.status === 409) {
        setInquirySent(true);
        setShowInquiryDialog(false);
        setInquiryMessage("");
        toast({ title: 'Already Inquired', description: data.error || 'You have already sent an inquiry for this listing.' });
      } else {
        throw new Error(data.error || 'Failed to send inquiry');
      }
    } catch (error) {
      console.error('Error sending inquiry:', error);
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to send inquiry. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  const DocumentLink = ({ href, children }: { href?: string; children: React.ReactNode }) => {
    const isOwner = currentUser && currentUser.id === listing.seller_id;
    const isAdmin = currentUser && currentUser.role === 'admin';
    const isVerifiedBuyerUser = currentUser && isVerifiedBuyer(currentUser);

    // Seller/Owner access - full document management capabilities
    if (isOwner) {
      if (!href || href.trim() === "" || href.trim() === "#") {
        return <p className="text-sm text-slate-600">You haven't uploaded this document yet. <Link href={`/seller-dashboard/listings/${listing.id}/edit`} className="text-blue-600 hover:underline">Upload now</Link></p>;
      }
      return <Link href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-200 hover:underline font-medium flex items-center gap-1"><FileText className="h-4 w-4" />{children}</Link>;
    }

    // Admin access - full visibility for moderation purposes
    if (isAdmin) {
      if (!href || href.trim() === "" || href.trim() === "#") {
        return <p className="text-sm text-slate-600">Document not provided by seller.</p>;
      }
      return <Link href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-200 hover:underline font-medium flex items-center gap-1"><FileText className="h-4 w-4" />{children}</Link>;
    }

    // Non-verified seller content - show restriction message
    if (!listing.is_seller_verified) {
      return <p className="text-sm text-muted-foreground italic">Only available for verified seller listings</p>;
    }

    // Verified buyer access
    if (isVerifiedBuyerUser) {
      if (!href || href.trim() === "" || href.trim() === "#") {
        return <p className="text-sm text-slate-600">Document not provided by seller.</p>;
      }
      return <Link href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-200 hover:underline font-medium flex items-center gap-1"><FileText className="h-4 w-4" />{children}</Link>;
    }

    // Unverified buyer - show verification requirement
    return <p className="text-sm text-gray-300 italic">Complete buyer verification to access documents</p>;
  };

  const FinancialValue = ({ usdAmount }: { usdAmount: number | null | undefined }) => {
    if (usdAmount === null || usdAmount === undefined) {
      return <span className="text-lg font-normal text-white">N/A</span>;
    }
    return (
      <span className="text-lg font-normal text-white">
        {formatCurrency(usdAmount, selectedCurrency, rates)}
      </span>
    );
  };

  return (
    <>
      <AnimatedBackground />
      <div className="container py-8 md:py-12 relative z-10">
        <Card className="shadow-xl overflow-hidden bg-white/10 backdrop-blur-md border-white/20 text-white">

          <CardHeader className="p-4 md:p-6 border-white/10 border-b">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-normal text-white tracking-tight">{listing.title}</h1>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="bg-white/10 text-white border border-white/20">{listing.industry}</Badge>
                  {listing.is_seller_verified ? (
                    <Badge variant="secondary" className="bg-green-500/10 text-green-400 border border-green-500/30"><ShieldCheck className="h-4 w-4 mr-1.5" /> Verified Seller</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border border-amber-500/30"><Info className="h-4 w-4 mr-1.5" /> Unverified Seller</Badge>
                  )}
                  {/* Listing Verification Badge */}
                  {(() => {
                    const verificationStatus = (listing as any).listingVerificationStatus || 'unverified';
                    if (verificationStatus === 'verified') {
                      return (
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border border-blue-500/30">
                          <ShieldCheck className="h-4 w-4 mr-1.5" /> Verified Listing
                        </Badge>
                      );
                    } else if (verificationStatus === 'deactivated') {
                      return (
                        <Badge variant="secondary" className="bg-red-500/10 text-red-400 border border-red-500/30">
                          <Info className="h-4 w-4 mr-1.5" /> Listing Deactivated
                        </Badge>
                      );
                    }
                    // Don't show badge for 'unverified' to avoid clutter
                    return null;
                  })()}
                </div>
              </div>
              <Button
                onClick={handleInquireClick}
                className="bg-brand-sky-blue text-white hover:bg-white hover:text-brand-dark-blue font-normal shadow-lg transition-all duration-300 border border-white/20 shrink-0"
                disabled={!currentUser || currentUser.role === 'seller' || inquirySent || isSubmittingInquiry || isCheckingInquiry}
              >
                {inquirySent ? 'Inquiry Sent' : 'Inquire Now'}
              </Button>
            </div>
            {/* Financial Highlights Bubble */}
            <Card className="bg-white/5 p-4 md:p-6 rounded-lg shadow-sm border border-white/10 mt-4 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-normal text-white flex items-center"><Banknote className="h-6 w-6 mr-2" />Financial Snapshot</h2>
                {isLoadingRates ? <Skeleton className="h-9 w-40" /> : !ratesError && (
                  <div className="flex items-center gap-2 bg-white/10 p-2 rounded-lg border border-white/20 shadow-sm">
                    <span className="text-sm text-white font-medium">Currency:</span>
                    <Select onValueChange={setSelectedCurrency} defaultValue="USD">
                      <SelectTrigger className="w-[80px] border-0 bg-transparent p-0 h-6 focus:ring-0 text-white">
                        <SelectValue placeholder="USD" />
                      </SelectTrigger>
                      <SelectContent className="bg-brand-dark-blue text-white border-white/20">
                        {SUPPORTED_CURRENCIES.map(currency => (
                          <SelectItem key={currency.code} value={currency.code} className="focus:bg-white/10 focus:text-white">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{currency.code}</span>
                              <span className="text-xs text-gray-300">{currency.symbol}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div>
                  <p className="text-xs text-gray-300 uppercase tracking-wider">Annual Revenue</p>
                  <p className="text-lg font-normal text-white">
                    {listing.annual_revenue_range
                      ? convertRevenueRange(listing.annual_revenue_range, selectedCurrency, rates) || listing.annual_revenue_range
                      : <FinancialValue usdAmount={listing.verified_annual_revenue} />
                    }
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-300 uppercase tracking-wider">EBITDA (TTM)</p>
                  <FinancialValue usdAmount={listing.ebitda} />
                </div>
                {(listing.adjusted_cash_flow || listing.verified_cash_flow) && (
                  <div>
                    <p className="text-xs text-gray-300 uppercase tracking-wider">Adj. Cash Flow (TTM)</p>
                    <FinancialValue usdAmount={listing.adjusted_cash_flow || listing.verified_cash_flow} />
                  </div>
                )}
                {cfMultiple !== 'N/A' && (
                  <div>
                    <p className="text-xs text-gray-300 uppercase tracking-wider">Est. C.F. Multiple</p>
                    <p className="text-lg font-normal text-white">{cfMultiple}</p>
                  </div>
                )}
              </div>
            </Card>
          </CardHeader>
          <CardContent className="p-6 md:p-8 pt-6 grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8 border-r border-white/10 pr-0 lg:pr-8">
              {/* Alerts Section */}
              {listing.is_seller_verified && !currentUser && (<Card className="bg-brand-light-gray border-brand-dark-blue/20 dark:bg-white/5 dark:border-white/10"><CardHeader><CardTitle className="text-brand-dark-blue dark:text-white flex items-center"><UserCircle className="h-5 w-5 mr-2" />Access Full Details</CardTitle></CardHeader><CardContent><p className="text-sm text-brand-dark-blue/80 dark:text-gray-300">This listing is from a verified seller. <Link href={`/auth/login?redirect=/listings/${listing.id}`} className="font-normal underline hover:text-brand-dark-blue dark:hover:text-white">Login</Link> or <Link href={`/auth/register?redirect=/listings/${listing.id}`} className="font-normal underline hover:text-brand-dark-blue dark:hover:text-white">Register</Link> as a buyer and complete verification to view detailed information and documents.</p></CardContent></Card>)}
              {listing.is_seller_verified && currentUser && currentUser.role === 'buyer' && !isVerifiedBuyer(currentUser) && (<Card className="bg-amber-50 border-amber-300 dark:bg-amber-900/20 dark:border-amber-700"><CardHeader><CardTitle className="text-amber-700 dark:text-amber-300 flex items-center"><ShieldCheck className="h-5 w-5 mr-2" />Unlock Verified Access</CardTitle></CardHeader><CardContent><p className="text-sm text-amber-600 dark:text-amber-400">This listing is from a seller who has completed Due Diligence. To view specific company details, financials, and documents, please <Link href="/dashboard/verification" className="font-normal underline hover:text-amber-700">complete buyer verification</Link>.</p></CardContent></Card>)}
              {listing.is_seller_verified && currentUser && currentUser.id === listing.seller_id && (<Card className="bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700"><CardHeader><CardTitle className="text-green-700 dark:text-green-300 flex items-center"><Eye className="h-5 w-5 mr-2" />Seller View</CardTitle></CardHeader><CardContent><p className="text-sm text-green-600 dark:text-green-400">You are viewing your own verified listing. All details and documents are visible to you. Buyers will need to complete verification to see this level of detail.</p></CardContent></Card>)}
              {currentUser && currentUser.role === 'admin' && (<Card className="bg-purple-50 border-purple-300 dark:bg-purple-900/20 dark:border-purple-700"><CardHeader><CardTitle className="text-purple-700 dark:text-purple-300 flex items-center"><ShieldCheck className="h-5 w-5 mr-2" />Admin Access</CardTitle></CardHeader><CardContent><p className="text-sm text-purple-600 dark:text-purple-400">You have administrative access to view all listing content for moderation purposes. All details and documents are visible regardless of seller verification status.</p></CardContent></Card>)}

              <section id="business-overview"><h2 className="text-2xl font-normal text-white mb-3 flex items-center"><BookOpen className="h-6 w-6 mr-2 text-white/90" />Business Overview</h2><p className="text-gray-200 leading-relaxed whitespace-pre-wrap text-justify">{listing.short_description}</p></section><Separator className="bg-white/10" />
              {keyStrengths.length > 0 && (<><section id="key-strengths"><h2 className="text-2xl font-normal text-white mb-3 flex items-center"><TrendingUp className="h-6 w-6 mr-2 text-white/90" />Key Strengths</h2><ul className="list-disc list-inside space-y-1 text-gray-200 pl-5">{keyStrengths.map((strength, index) => (<li key={index}>{strength}</li>))}</ul></section><Separator className="bg-white/10" /></>)}
              {listing.reason_for_selling_anonymous && (<><section id="reason-for-selling"><h2 className="text-2xl font-normal text-white mb-3 flex items-center"><Tag className="h-6 w-6 mr-2 text-white/90" />Reason for Selling</h2><p className="text-gray-200 leading-relaxed text-justify">{listing.reason_for_selling_anonymous}</p></section><Separator className="bg-white/10" /></>)}
              {growthOpportunities.length > 0 && (<><section id="growth-potential"><h2 className="text-2xl font-normal text-white mb-3 flex items-center"><Brain className="h-6 w-6 mr-2 text-white/90" />Specific Growth Opportunities</h2><ul className="list-disc list-inside space-y-1 text-gray-200 pl-5">{growthOpportunities.map((opportunity, index) => (<li key={index}>{opportunity.replace(/^[•\-]\s*/, '')}</li>))}</ul></section><Separator className="bg-white/10" /></>)}
              <section id="verified-details" className={`p-6 rounded-lg border ${canViewVerifiedDetails ? 'bg-white/5 border-white/10' : 'bg-white/5 border-white/10'}`}>
                <h2 className="text-2xl font-normal text-white mb-4 flex items-center"><ShieldCheck className="h-6 w-6 mr-2" />{canViewVerifiedDetails ? "Verified Information & Documents" : "Verified Information (Restricted Access)"}</h2>
                <div className="space-y-6">
                  <div><h3 className="font-normal text-white flex items-center gap-2 mb-2"><Building className="h-5 w-5" />Company Details</h3>{canViewVerifiedDetails ? (<div className="space-y-1"><p className="text-sm text-gray-200"><span className="font-medium text-white">Registered Business Name:</span> {listing.registered_business_name || 'N/A'}</p><p className="text-sm text-gray-200"><span className="font-medium text-white">Year Established:</span> {listing.established_year || 'N/A'}</p><p className="text-sm text-gray-200"><span className="font-medium text-white">Number of Employees:</span> {listing.number_of_employees || 'N/A'}</p></div>) : (<p className="text-sm text-gray-300 italic">Complete buyer verification to view detailed company information</p>)}</div>
                  <div><h3 className="font-normal text-white flex items-center gap-2 mb-2"><Globe className="h-5 w-5" />Web Presence</h3>{canViewVerifiedDetails ? (<div className="space-y-1"><p className="text-sm text-gray-200"><span className="font-medium text-white">Business Website:</span> {listing.website_url ? <Link href={listing.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-200 hover:underline font-medium">{listing.website_url}</Link> : 'N/A'}</p>{listing.social_media_links && <p className="text-sm text-gray-200"><span className="font-medium text-white">Social Media:</span> <span className="whitespace-pre-wrap">{listing.social_media_links}</span></p>}</div>) : (<p className="text-sm text-gray-300 italic">Complete buyer verification to view web presence details</p>)}</div>
                  <div><h3 className="font-normal text-white flex items-center gap-2 mb-2"><DollarSign className="h-5 w-5" />Specific Financials</h3>{canViewVerifiedDetails ? (<div className="space-y-1"><p className="text-sm text-gray-200"><span className="font-medium text-white">Specific Annual Revenue (TTM):</span> {listing.verified_annual_revenue ? <FinancialValue usdAmount={listing.verified_annual_revenue} /> : 'N/A'}</p><p className="text-sm text-gray-200"><span className="font-medium text-white">Specific Net Profit (TTM):</span> {listing.verified_net_profit ? <FinancialValue usdAmount={listing.verified_net_profit} /> : 'N/A'}</p>{listing.net_profit_margin_range && <p className="text-sm text-gray-200"><span className="font-medium text-white">Net Profit Margin Range:</span> {listing.net_profit_margin_range}</p>}</div>) : (<p className="text-sm text-gray-300 italic">Complete buyer verification to view specific financial details</p>)}</div>
                  <div><h3 className="font-normal text-white flex items-center gap-2 mb-2"><UsersIcon className="h-5 w-5" />Seller & Deal Information</h3>{canViewVerifiedDetails ? (<div className="space-y-1"><p className="text-sm text-gray-200"><span className="font-medium text-white">Detailed Reason for Selling:</span> <span className="whitespace-pre-wrap">{listing.detailed_reason_for_selling || 'N/A'}</span></p>{(() => {
                    const dealStructure = listing.deal_structure_looking_for
                      ? (typeof listing.deal_structure_looking_for === 'string'
                        ? JSON.parse(listing.deal_structure_looking_for)
                        : listing.deal_structure_looking_for)
                      : null;
                    return dealStructure && Array.isArray(dealStructure) && dealStructure.length > 0 && (
                      <p className="text-sm text-gray-200"><span className="font-medium text-white">Deal Structure Preferences:</span> {dealStructure.join(', ')}</p>
                    );
                  })()}</div>) : (<p className="text-sm text-gray-300 italic">Complete buyer verification to view seller and deal information</p>)}</div>
                  <div><h3 className="font-normal text-white flex items-center gap-2 mb-2"><FileText className="h-5 w-5" />Supporting Documents</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-3"><div><p className="text-xs font-medium text-white mb-1">Financial Documents</p><DocumentLink href={listing.financial_documents_url}>Financial Statements (P&L, Balance Sheet)</DocumentLink></div><div><p className="text-xs font-medium text-white mb-1">Business Metrics</p><DocumentLink href={listing.key_metrics_report_url}>Key Performance Indicators Report</DocumentLink></div><div><p className="text-xs font-medium text-white mb-1">Ownership Documents</p><DocumentLink href={listing.ownership_documents_url}>Company Registration & Certificates</DocumentLink></div><div><p className="text-xs font-medium text-white mb-1">Financial Summary</p><DocumentLink href={listing.financial_snapshot_url}>Recent Financial Summary</DocumentLink></div><div><p className="text-xs font-medium text-white mb-1">Location & Assets</p><DocumentLink href={listing.location_real_estate_info_url}>Real Estate & Location Info</DocumentLink></div><div><p className="text-xs font-medium text-white mb-1">Digital Presence</p><DocumentLink href={listing.web_presence_info_url}>Website Analytics & SEO Data</DocumentLink></div>{listing.secure_data_room_link && (<div className="md:col-span-2"><p className="text-xs font-medium text-white mb-1">Additional Documents</p><DocumentLink href={listing.secure_data_room_link}>Secure Data Room Access</DocumentLink></div>)}</div></div>
                </div>
              </section>
            </div>
            <aside className="lg:col-span-4 space-y-6 md:sticky md:top-24 h-fit">
              {/* Moved Image Gallery to top of sidebar */}
              <ImageGallery
                imageUrls={
                  listing.images
                    ? (typeof listing.images === 'string'
                      ? JSON.parse(listing.images)
                      : listing.images)
                    : undefined
                }
                listingTitle={listing.title}
              />

              <Card className="shadow-md bg-white/10 backdrop-blur-md border-white/20 text-white"><CardHeader><CardTitle className="text-xl text-white font-heading">Listing Summary</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center"><Briefcase className="h-5 w-5 mr-3 text-white/80 flex-shrink-0" /><div><p className="font-medium text-white">Industry</p><p className="text-gray-300">{listing.industry}</p></div></div>
                  <div className="flex items-center"><MapPin className="h-5 w-5 mr-3 text-white/80 flex-shrink-0" /><div><p className="font-medium text-white">Location</p><p className="text-gray-300">{listing.location_city}, {listing.location_country}</p></div></div>
                  <div className="flex items-center"><DollarSign className="h-5 w-5 mr-3 text-white/80 flex-shrink-0" /><div><p className="font-medium text-white">Asking Price</p><p className="text-gray-300">{listing.asking_price > 0 ? formatCurrency(listing.asking_price, selectedCurrency, rates) : 'Contact for Price'}</p></div></div>
                  {(() => {
                    const dealStructure = listing.deal_structure_looking_for
                      ? (typeof listing.deal_structure_looking_for === 'string'
                        ? JSON.parse(listing.deal_structure_looking_for)
                        : listing.deal_structure_looking_for)
                      : null;
                    return dealStructure && Array.isArray(dealStructure) && dealStructure.length > 0 && (
                      <div className="flex items-start"><HandCoins className="h-5 w-5 mr-3 text-white/80 flex-shrink-0 mt-0.5" /><div><p className="font-medium text-white">Deal Structure</p><p className="text-gray-300">{dealStructure.join(', ')}</p></div></div>
                    );
                  })()}
                  <div className="flex items-center"><UserCircle className="h-5 w-5 mr-3 text-white/80 flex-shrink-0" /><div><p className="font-medium text-white">Seller Status</p><p className="text-gray-300">{listing.is_seller_verified ? 'Verified Seller' : 'Unverified Seller'}</p></div></div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!currentUser || currentUser.role === 'seller' || inquirySent || isSubmittingInquiry || isCheckingInquiry} onClick={handleInquireClick}>
                    {(isSubmittingInquiry || isCheckingInquiry) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {isCheckingInquiry ? 'Checking...' : isSubmittingInquiry ? 'Sending...' : inquirySent ? 'Inquiry Sent' : 'Inquire About Business'}
                    {!isSubmittingInquiry && !isCheckingInquiry && <MessageSquare className="h-4 w-4 ml-2" />}
                  </Button>
                  {inquirySent && (
                    <ConversationButton
                      listingId={listing.id}
                      buyerId={currentUser?.id}
                      sellerName="the seller"
                      listingTitle={listing.title}
                      isAuthenticated={!!currentUser}
                      userRole={currentUser?.role}
                      variant="outline"
                      className="w-full border-primary text-primary hover:bg-primary/10"
                    />
                  )}
                </CardFooter>
              </Card>
              {!currentUser && (
                <>
                  <Card className="shadow-md bg-brand-sky-blue/10 border-brand-sky-blue/30">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-white mb-2">Want to learn more or see verified details?</p>
                      <Button variant="outline" asChild className="w-full border-brand-dark-blue text-brand-dark-blue hover:bg-brand-dark-blue/5">
                        <Link href={`/auth/login?redirect=/listings/${listing.id}`}>Login / Register as a Buyer to Inquire</Link>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="shadow-md bg-white/5 border-white/10 mt-4">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-gray-300 mb-2">Have questions or need assistance?</p>
                      <Button variant="ghost" asChild className="w-full text-white hover:text-brand-sky-blue hover:bg-white/5 border border-white/20">
                        <Link href="/contact">Contact Support</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </>
              )}
              {currentUser && currentUser.role === 'buyer' && !isVerifiedBuyer(currentUser) && listing.is_seller_verified && (<Card className="shadow-md bg-amber-500/10 border-amber-500/30"><CardContent className="p-4 text-center"><p className="text-sm text-amber-700 dark:text-amber-300 mb-2">Complete buyer verification to access full details and documents for verified listings.</p><Button variant="outline" asChild className="border-amber-600 text-amber-700 hover:bg-amber-600/20"><Link href="/dashboard/verification">Get Verified</Link></Button></CardContent></Card>)}
            </aside>
          </CardContent>
        </Card>

        <AlertDialog open={showVerificationPopup} onOpenChange={setShowVerificationPopup}>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Business Verification Pending</AlertDialogTitle><AlertDialogDescription>This business is currently undergoing our verification due diligence process. We&apos;ll notify you once they are ready for direct communication.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>OK</AlertDialogCancel></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={showInquiryDialog} onOpenChange={setShowInquiryDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Your Interest: {listing.title}</DialogTitle>
              <DialogDescription>
                You are about to send an inquiry for this business. You can optionally add a message below.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder="Optional: Add a brief message to the seller or ask an initial question..."
                value={inquiryMessage}
                onChange={(e) => setInquiryMessage(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Nobridge will facilitate further communication upon mutual interest and verification.
              </p>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button onClick={handleInquirySubmit} disabled={isSubmittingInquiry}>
                {isSubmittingInquiry && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isSubmittingInquiry ? "Submitting..." : "Submit Inquiry"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </>
  );
}
