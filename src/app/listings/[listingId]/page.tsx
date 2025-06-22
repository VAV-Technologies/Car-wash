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
const formatCurrency = (amount?: number) => {
  if (typeof amount !== 'number' || isNaN(amount)) return 'Contact for Price';
  return `$${amount.toLocaleString()} USD`;
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

  React.useEffect(() => {
    if (currentIndex >= validImageUrls.length && validImageUrls.length > 0) {
      setCurrentIndex(0);
    } else if (validImageUrls.length === 0 && currentIndex !== 0) { // Should not happen due to fallback
      setCurrentIndex(0);
    }
  }, [validImageUrls, currentIndex]);

  const mainImage = validImageUrls[currentIndex];

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent dialog from closing if clicking on arrows inside it
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
      <Card className="shadow-md bg-muted/30 border-border">
        <CardContent className="p-3">
          <div
            className={cn(
              "rounded-md overflow-hidden shadow-inner bg-muted aspect-[16/10] flex items-center justify-center relative cursor-pointer group",
              "h-48 md:h-56" // Adjusted height for sidebar
            )}
            onClick={openPreview}
          >
            <Image
              src={mainImage}
              alt={`Main image for ${listingTitle} (${currentIndex + 1} of ${validImageUrls.length})`}
              fill={true}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 400px, 400px"
              className="transition-transform duration-300 group-hover:scale-105 object-cover"
              key={mainImage} // Force re-render on image change
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                const triedUrls = target.dataset.triedUrls ? target.dataset.triedUrls.split(',') : [];
                if (!triedUrls.includes(mainImage)) {
                   triedUrls.push(mainImage);
                   target.dataset.triedUrls = triedUrls.join(',');
                   const fallbackIndex = DEFAULT_LISTING_IMAGES.findIndex(img => !triedUrls.includes(img));
                   if (fallbackIndex !== -1) target.src = DEFAULT_LISTING_IMAGES[fallbackIndex];
                   else target.src = DEFAULT_LISTING_IMAGES[0]; // Ultimate fallback
                }
              }}
              data-ai-hint="business office product"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
            {validImageUrls.length > 1 && (
              <>
                <Button variant="ghost" size="icon" className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white border-none rounded-full h-7 w-7" onClick={handlePrevImage} aria-label="Previous image"><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white border-none rounded-full h-7 w-7" onClick={handleNextImage} aria-label="Next image"><ChevronRight className="h-4 w-4" /></Button>
              </>
            )}
          </div>
          {validImageUrls.length > 1 && (
            <div className="text-center text-xs text-muted-foreground mt-2">
              Image {currentIndex + 1} of {validImageUrls.length} (Click to enlarge)
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl p-2 sm:p-4 !rounded-lg">
          <DialogHeader className="sr-only">
            <DialogTitle>Image Preview: {listingTitle}</DialogTitle>
          </DialogHeader>
          <div className="relative aspect-video bg-black rounded-md">
            <Image
              src={mainImage} // Dialog always shows the current main image
              alt={`Enlarged image for ${listingTitle} (${currentIndex + 1} of ${validImageUrls.length})`}
              fill={true}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              className="object-contain"
              key={`dialog-${mainImage}`}
              onError={(e) => { /* Similar error handling as above if needed */ }}
            />
            {validImageUrls.length > 1 && (
              <>
                <Button variant="ghost" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full h-10 w-10" onClick={handlePrevImage} aria-label="Previous image"><ChevronLeft className="h-6 w-6" /></Button>
                <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full h-10 w-10" onClick={handleNextImage} aria-label="Next image"><ChevronRight className="h-6 w-6" /></Button>
              </>
            )}
            <DialogClose asChild>
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-black/40 hover:bg-black/60 text-white rounded-full h-8 w-8">
                    <X className="h-5 w-5"/>
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
      return <Link href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium flex items-center gap-1"><FileText className="h-4 w-4"/>{children}</Link>;
    }

    // Admin access - full visibility for moderation purposes
    if (isAdmin) {
      if (!href || href.trim() === "" || href.trim() === "#") {
        return <p className="text-sm text-slate-600">Document not provided by seller.</p>;
      }
      return <Link href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium flex items-center gap-1"><FileText className="h-4 w-4"/>{children}</Link>;
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
      return <Link href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium flex items-center gap-1"><FileText className="h-4 w-4"/>{children}</Link>;
    }

    // Unverified buyer - show verification requirement
    return <p className="text-sm text-muted-foreground italic">Complete buyer verification to access documents</p>;
  };

  return (
    <div className="container py-8 md:py-12 bg-brand-light-gray">
      <Card className="shadow-xl overflow-hidden bg-brand-white">
        <CardHeader className="p-4 md:p-6 border-b">
            <div className="mb-4">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-brand-dark-blue tracking-tight">{listing.title}</h1>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="bg-brand-dark-blue/10 text-brand-dark-blue">{listing.industry}</Badge>
                  {listing.is_seller_verified ? (
                    <Badge variant="secondary" className="bg-green-500/10 text-green-700 border border-green-500/30"><ShieldCheck className="h-4 w-4 mr-1.5" /> Verified Seller</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 border border-amber-500/30"><Info className="h-4 w-4 mr-1.5" /> Unverified Seller</Badge>
                  )}
                </div>
            </div>
            {/* Financial Highlights Bubble */}
            <Card className="bg-primary/5 p-4 md:p-6 rounded-lg shadow-sm border border-primary/20 mt-4">
              <h2 className="text-xl font-semibold text-primary mb-3 flex items-center"><Banknote className="h-6 w-6 mr-2"/>Financial Snapshot</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Asking Price</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(listing.asking_price)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Annual Revenue</p>
                  <p className="text-lg font-semibold text-primary">{listing.annual_revenue_range || formatCurrency(listing.verified_annual_revenue) || 'N/A'}</p>
                </div>
                {(listing.adjusted_cash_flow || listing.verified_cash_flow) && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Adj. Cash Flow (TTM)</p>
                    <p className="text-lg font-semibold text-primary">{formatCurrency(listing.adjusted_cash_flow || listing.verified_cash_flow)}</p>
                  </div>
                )}
                {cfMultiple !== 'N/A' && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Est. C.F. Multiple</p>
                    <p className="text-lg font-semibold text-primary">{cfMultiple}</p>
                  </div>
                )}
              </div>
            </Card>
        </CardHeader>
        <CardContent className="p-6 md:p-8 pt-6 grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
                {/* Alerts Section */}
                {listing.is_seller_verified && !currentUser && ( <Card className="bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-700"><CardHeader><CardTitle className="text-blue-700 dark:text-blue-300 flex items-center"><UserCircle className="h-5 w-5 mr-2"/>Access Full Details</CardTitle></CardHeader><CardContent><p className="text-sm text-blue-600 dark:text-blue-400">This listing is from a verified seller. <Link href={`/auth/login?redirect=/listings/${listing.id}`} className="font-semibold underline hover:text-blue-700">Login</Link> or <Link href={`/auth/register?redirect=/listings/${listing.id}`} className="font-semibold underline hover:text-blue-700">Register</Link> as a buyer and complete verification to view detailed information and documents.</p></CardContent></Card> )}
                {listing.is_seller_verified && currentUser && currentUser.role === 'buyer' && !isVerifiedBuyer(currentUser) && ( <Card className="bg-amber-50 border-amber-300 dark:bg-amber-900/20 dark:border-amber-700"><CardHeader><CardTitle className="text-amber-700 dark:text-amber-300 flex items-center"><ShieldCheck className="h-5 w-5 mr-2"/>Unlock Verified Access</CardTitle></CardHeader><CardContent><p className="text-sm text-amber-600 dark:text-amber-400">This listing is from a seller who has completed Due Diligence. To view specific company details, financials, and documents, please <Link href="/dashboard/verification" className="font-semibold underline hover:text-amber-700">complete buyer verification</Link>.</p></CardContent></Card> )}
                {listing.is_seller_verified && currentUser && currentUser.id === listing.seller_id && ( <Card className="bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700"><CardHeader><CardTitle className="text-green-700 dark:text-green-300 flex items-center"><Eye className="h-5 w-5 mr-2"/>Seller View</CardTitle></CardHeader><CardContent><p className="text-sm text-green-600 dark:text-green-400">You are viewing your own verified listing. All details and documents are visible to you. Buyers will need to complete verification to see this level of detail.</p></CardContent></Card> )}
                {currentUser && currentUser.role === 'admin' && ( <Card className="bg-purple-50 border-purple-300 dark:bg-purple-900/20 dark:border-purple-700"><CardHeader><CardTitle className="text-purple-700 dark:text-purple-300 flex items-center"><ShieldCheck className="h-5 w-5 mr-2"/>Admin Access</CardTitle></CardHeader><CardContent><p className="text-sm text-purple-600 dark:text-purple-400">You have administrative access to view all listing content for moderation purposes. All details and documents are visible regardless of seller verification status.</p></CardContent></Card> )}

                <section id="business-overview"><h2 className="text-2xl font-semibold text-brand-dark-blue mb-3 flex items-center"><BookOpen className="h-6 w-6 mr-2 text-primary"/>Business Overview</h2><p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{listing.short_description}</p></section><Separator />
                {keyStrengths.length > 0 && ( <><section id="key-strengths"><h2 className="text-2xl font-semibold text-brand-dark-blue mb-3 flex items-center"><TrendingUp className="h-6 w-6 mr-2 text-primary"/>Key Strengths</h2><ul className="list-disc list-inside space-y-1 text-muted-foreground pl-5">{keyStrengths.map((strength, index) => (<li key={index}>{strength}</li>))}</ul></section><Separator /></> )}
                {listing.reason_for_selling_anonymous && ( <><section id="reason-for-selling"><h2 className="text-2xl font-semibold text-brand-dark-blue mb-3 flex items-center"><Tag className="h-6 w-6 mr-2 text-primary"/>Reason for Selling</h2><p className="text-muted-foreground leading-relaxed">{listing.reason_for_selling_anonymous}</p></section><Separator /></> )}
                {growthOpportunities.length > 0 && ( <><section id="growth-potential"><h2 className="text-2xl font-semibold text-brand-dark-blue mb-3 flex items-center"><Brain className="h-6 w-6 mr-2 text-primary"/>Specific Growth Opportunities</h2><ul className="list-disc list-inside space-y-1 text-muted-foreground pl-5">{growthOpportunities.map((opportunity, index) => (<li key={index}>{opportunity.replace(/^[•\-]\s*/, '')}</li>))}</ul></section><Separator /></> )}
                <section id="verified-details" className={`p-6 rounded-lg border ${canViewVerifiedDetails ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-muted/50'}`}>
                    <h2 className="text-2xl font-semibold text-primary mb-4 flex items-center"><ShieldCheck className="h-6 w-6 mr-2"/>{canViewVerifiedDetails ? "Verified Information & Documents" : "Verified Information (Restricted Access)"}</h2>
                    <div className="space-y-6">
                        <div><h3 className="font-semibold text-brand-dark-blue flex items-center gap-2 mb-2"><Building className="h-5 w-5"/>Company Details</h3>{canViewVerifiedDetails ? (<div className="space-y-1"><p className="text-sm text-slate-700"><span className="font-medium text-slate-900">Registered Business Name:</span> {listing.registered_business_name || 'N/A'}</p><p className="text-sm text-slate-700"><span className="font-medium text-slate-900">Year Established:</span> {listing.established_year || 'N/A'}</p><p className="text-sm text-slate-700"><span className="font-medium text-slate-900">Number of Employees:</span> {listing.number_of_employees || 'N/A'}</p></div>) : (<p className="text-sm text-muted-foreground italic">Complete buyer verification to view detailed company information</p>)}</div>
                        <div><h3 className="font-semibold text-brand-dark-blue flex items-center gap-2 mb-2"><Globe className="h-5 w-5"/>Web Presence</h3>{canViewVerifiedDetails ? (<div className="space-y-1"><p className="text-sm text-slate-700"><span className="font-medium text-slate-900">Business Website:</span> {listing.website_url ? <Link href={listing.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline font-medium">{listing.website_url}</Link> : 'N/A'}</p>{listing.social_media_links && <p className="text-sm text-slate-700"><span className="font-medium text-slate-900">Social Media:</span> <span className="whitespace-pre-wrap">{listing.social_media_links}</span></p>}</div>) : (<p className="text-sm text-muted-foreground italic">Complete buyer verification to view web presence details</p>)}</div>
                        <div><h3 className="font-semibold text-brand-dark-blue flex items-center gap-2 mb-2"><DollarSign className="h-5 w-5"/>Specific Financials</h3>{canViewVerifiedDetails ? (<div className="space-y-1"><p className="text-sm text-slate-700"><span className="font-medium text-slate-900">Specific Annual Revenue (TTM):</span> {listing.verified_annual_revenue ? `${formatCurrency(listing.verified_annual_revenue)}` : 'N/A'}</p><p className="text-sm text-slate-700"><span className="font-medium text-slate-900">Specific Net Profit (TTM):</span> {listing.verified_net_profit ? `${formatCurrency(listing.verified_net_profit)}` : 'N/A'}</p>{listing.net_profit_margin_range && <p className="text-sm text-slate-700"><span className="font-medium text-slate-900">Net Profit Margin Range:</span> {listing.net_profit_margin_range}</p>}</div>) : (<p className="text-sm text-muted-foreground italic">Complete buyer verification to view specific financial details</p>)}</div>
                        <div><h3 className="font-semibold text-brand-dark-blue flex items-center gap-2 mb-2"><UsersIcon className="h-5 w-5"/>Seller & Deal Information</h3>{canViewVerifiedDetails ? (<div className="space-y-1"><p className="text-sm text-slate-700"><span className="font-medium text-slate-900">Detailed Reason for Selling:</span> <span className="whitespace-pre-wrap">{listing.detailed_reason_for_selling || 'N/A'}</span></p>{(() => {
  const dealStructure = listing.deal_structure_looking_for
    ? (typeof listing.deal_structure_looking_for === 'string'
        ? JSON.parse(listing.deal_structure_looking_for)
        : listing.deal_structure_looking_for)
    : null;
  return dealStructure && Array.isArray(dealStructure) && dealStructure.length > 0 && (
    <p className="text-sm text-slate-700"><span className="font-medium text-slate-900">Deal Structure Preferences:</span> {dealStructure.join(', ')}</p>
  );
})()}</div>) : (<p className="text-sm text-muted-foreground italic">Complete buyer verification to view seller and deal information</p>)}</div>
                        <div><h3 className="font-semibold text-brand-dark-blue flex items-center gap-2 mb-2"><FileText className="h-5 w-5"/>Supporting Documents</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-3"><div><p className="text-xs font-medium text-slate-800 mb-1">Financial Documents</p><DocumentLink href={listing.financial_documents_url}>Financial Statements (P&L, Balance Sheet)</DocumentLink></div><div><p className="text-xs font-medium text-slate-800 mb-1">Business Metrics</p><DocumentLink href={listing.key_metrics_report_url}>Key Performance Indicators Report</DocumentLink></div><div><p className="text-xs font-medium text-slate-800 mb-1">Ownership Documents</p><DocumentLink href={listing.ownership_documents_url}>Company Registration & Certificates</DocumentLink></div><div><p className="text-xs font-medium text-slate-800 mb-1">Financial Summary</p><DocumentLink href={listing.financial_snapshot_url}>Recent Financial Summary</DocumentLink></div><div><p className="text-xs font-medium text-slate-800 mb-1">Ownership Details</p><DocumentLink href={listing.ownership_details_url}>Detailed Ownership Structure</DocumentLink></div><div><p className="text-xs font-medium text-slate-800 mb-1">Location & Assets</p><DocumentLink href={listing.location_real_estate_info_url}>Real Estate & Location Info</DocumentLink></div><div><p className="text-xs font-medium text-slate-800 mb-1">Digital Presence</p><DocumentLink href={listing.web_presence_info_url}>Website Analytics & SEO Data</DocumentLink></div>{listing.secure_data_room_link && (<div className="md:col-span-2"><p className="text-xs font-medium text-slate-800 mb-1">Additional Documents</p><DocumentLink href={listing.secure_data_room_link}>Secure Data Room Access</DocumentLink></div>)}</div></div>
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

                <Card className="shadow-md bg-brand-white"><CardHeader><CardTitle className="text-xl text-brand-dark-blue font-heading">Listing Summary</CardTitle></CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex items-center"><Briefcase className="h-5 w-5 mr-3 text-primary flex-shrink-0" /><div><p className="font-medium text-brand-dark-blue">Industry</p><p className="text-muted-foreground">{listing.industry}</p></div></div>
                        <div className="flex items-center"><MapPin className="h-5 w-5 mr-3 text-primary flex-shrink-0" /><div><p className="font-medium text-brand-dark-blue">Location</p><p className="text-muted-foreground">{listing.location_city}, {listing.location_country}</p></div></div>
                        {/* Moved Asking Price & Revenue to top Financial Snapshot */}
{(() => {
  const dealStructure = listing.deal_structure_looking_for
    ? (typeof listing.deal_structure_looking_for === 'string'
        ? JSON.parse(listing.deal_structure_looking_for)
        : listing.deal_structure_looking_for)
    : null;
  return dealStructure && Array.isArray(dealStructure) && dealStructure.length > 0 && (
    <div className="flex items-start"><HandCoins className="h-5 w-5 mr-3 text-primary flex-shrink-0 mt-0.5" /><div><p className="font-medium text-brand-dark-blue">Deal Structure</p><p className="text-muted-foreground">{dealStructure.join(', ')}</p></div></div>
  );
})()}
                        <div className="flex items-center"><UserCircle className="h-5 w-5 mr-3 text-primary flex-shrink-0" /><div><p className="font-medium text-brand-dark-blue">Seller Status</p><p className="text-muted-foreground">{listing.is_seller_verified ? 'Verified Seller' : 'Unverified Seller'}</p></div></div>
                         <div className="flex items-center"><CalendarDays className="h-5 w-5 mr-3 text-primary flex-shrink-0" /><div><p className="font-medium text-brand-dark-blue">Listed On</p><p className="text-muted-foreground">{new Date(listing.created_at).toLocaleDateString()}</p></div></div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!currentUser || currentUser.role === 'seller' || inquirySent || isSubmittingInquiry || isCheckingInquiry} onClick={handleInquireClick}>
                            {(isSubmittingInquiry || isCheckingInquiry) && <Loader2 className="h-4 w-4 mr-2 animate-spin"/>}
                            {isCheckingInquiry ? 'Checking...' : isSubmittingInquiry ? 'Sending...' : inquirySent ? 'Inquiry Sent' : 'Inquire About Business'}
                            {!isSubmittingInquiry && !isCheckingInquiry && <MessageSquare className="h-4 w-4 ml-2"/>}
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
                {!currentUser && (<Card className="shadow-md bg-brand-sky-blue/10 border-brand-sky-blue/30"><CardContent className="p-4 text-center"><p className="text-sm text-brand-dark-blue mb-2">Want to learn more or see verified details?</p><Button variant="outline" asChild className="border-brand-dark-blue text-brand-dark-blue hover:bg-brand-dark-blue/5"><Link href={`/auth/login?redirect=/listings/${listing.id}`}>Login or Register to Inquire</Link></Button></CardContent></Card>)}
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
              {isSubmittingInquiry && <Loader2 className="h-4 w-4 mr-2 animate-spin"/>}
              {isSubmittingInquiry ? "Submitting..." : "Submit Inquiry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
