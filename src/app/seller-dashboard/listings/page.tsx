'use client';

// Force dynamic rendering due to client-side interactivity
export const dynamic = 'force-dynamic'

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import {
  PlusCircle,
  Edit3,
  Trash2,
  Eye,
  ShieldCheck,
  AlertTriangle,
  MessageSquare,
  CheckCircle2,
  Loader2,
  XCircle,
  FileText,
  Clock,
  AlertCircle,
  MessageCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { NobridgeIcon } from "@/components/ui/nobridge-icon"; // Import NobridgeIcon

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
  images: string[];
  status: string;
  verification_status: string;
  created_at: string;
  updated_at: string;
  annual_revenue_range?: string;
  net_profit_margin_range?: string;
  key_strength_1?: string;
  key_strength_2?: string;
  key_strength_3?: string;
  growth_opportunity_1?: string;
  growth_opportunity_2?: string;
  growth_opportunity_3?: string;
  // Admin rejection fields
  admin_notes?: string;
  rejection_category?: string;
  admin_action_at?: string;
  // Appeal fields
  appeal_status?: string;
  appeal_message?: string;
  appeal_created_at?: string;
  admin_response?: string;
}

export default function ManageSellerListingsPage() {
  const { toast } = useToast();
  const { profile } = useCurrentUser();
  const [listings, setListings] = useState<ListingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Appeal dialog state
  const [appealDialog, setAppealDialog] = useState<{
    isOpen: boolean;
    listing: ListingData | null;
  }>({
    isOpen: false,
    listing: null,
  });
  const [appealMessage, setAppealMessage] = useState('');
  const [isSubmittingAppeal, setIsSubmittingAppeal] = useState(false);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setIsLoading(true);
        const listingsResponse = await fetch('/api/user/listings?sort_by=updated_at&sort_order=desc');
        if (listingsResponse.ok) {
          const data = await listingsResponse.json();
          setListings(data.listings || []);
        } else {
          toast({
            title: "Error Loading Listings",
            description: "Failed to load your listings. Please try again.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error fetching listings:', error);
        toast({
          title: "Connection Error",
          description: "Unable to connect to the server. Please check your connection.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchListings();
  }, [toast]);

  const handleDeactivate = async (listingId: string, listingTitle: string) => {
    setIsUpdating(listingId);
    try {
      console.log(`[DEACTIVATE] Attempting to deactivate listing ${listingId}: "${listingTitle}"`);

      const response = await fetch(`/api/listings/${listingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'inactive' }), // Use 'inactive' for soft delete
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`[DEACTIVATE] Success:`, result);

        // Update local state with the new status
        setListings(prev => prev.map(listing =>
          listing.id === listingId ? { ...listing, status: 'inactive' } : listing
        ));

        toast({
          title: "✅ Listing Deactivated",
          description: result.message || `'${listingTitle}' has been deactivated and withdrawn from the marketplace.`
        });
      } else {
        // Enhanced error handling with specific status codes
        let errorMessage = 'Failed to deactivate listing';

        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;

          // Handle specific error cases
          if (response.status === 401) {
            errorMessage = 'You are not authorized to perform this action. Please log in again.';
          } else if (response.status === 403) {
            errorMessage = 'You do not have permission to deactivate this listing.';
          } else if (response.status === 404) {
            errorMessage = 'Listing not found. It may have already been removed.';
          }

          console.error(`[DEACTIVATE] Error ${response.status}:`, errorData);
        } catch (parseError) {
          console.error(`[DEACTIVATE] Failed to parse error response:`, parseError);
          errorMessage = `Server error (${response.status}). Please try again.`;
        }

        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('[DEACTIVATE] Error:', error);
      toast({
        title: "❌ Deactivation Failed",
        description: error instanceof Error ? error.message : "Failed to deactivate listing. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleReactivate = async (listingId: string, listingTitle: string) => {
    setIsUpdating(listingId);
    try {
      console.log(`[REACTIVATE] Attempting to reactivate listing ${listingId}: "${listingTitle}"`);

      const response = await fetch(`/api/listings/${listingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' }), // Reactivate to active status
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`[REACTIVATE] Success:`, result);

        // Update local state with the new status
        setListings(prev => prev.map(listing =>
          listing.id === listingId ? { ...listing, status: 'active' } : listing
        ));

        toast({
          title: "✅ Listing Reactivated",
          description: result.message || `'${listingTitle}' is now active and visible to buyers.`
        });
      } else {
        // Enhanced error handling with specific status codes
        let errorMessage = 'Failed to reactivate listing';

        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;

          // Handle specific error cases
          if (response.status === 401) {
            errorMessage = 'You are not authorized to perform this action. Please log in again.';
          } else if (response.status === 403) {
            errorMessage = 'You do not have permission to reactivate this listing.';
          } else if (response.status === 404) {
            errorMessage = 'Listing not found. It may have been removed.';
          }

          console.error(`[REACTIVATE] Error ${response.status}:`, errorData);
        } catch (parseError) {
          console.error(`[REACTIVATE] Failed to parse error response:`, parseError);
          errorMessage = `Server error (${response.status}). Please try again.`;
        }

        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('[REACTIVATE] Error:', error);
      toast({
        title: "❌ Reactivation Failed",
        description: error instanceof Error ? error.message : "Failed to reactivate listing. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleAppealSubmission = async () => {
    if (!appealDialog.listing || !appealMessage.trim()) {
      toast({
        title: "Appeal Message Required",
        description: "Please provide a detailed message explaining why this listing should be reconsidered.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmittingAppeal(true);
      console.log(`[APPEAL] Submitting appeal for listing ${appealDialog.listing.id}`);

      const response = await fetch(`/api/listings/${appealDialog.listing.id}/appeal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appealMessage: appealMessage.trim(),
          originalRejectionReason: appealDialog.listing.admin_notes,
          originalRejectionCategory: appealDialog.listing.rejection_category
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`[APPEAL] Success:`, result);

        // Update local state to show appeal submitted
        setListings(prev => prev.map(listing =>
          listing.id === appealDialog.listing!.id
            ? {
                ...listing,
                status: 'appealing_rejection',
                appeal_status: 'pending',
                appeal_message: appealMessage.trim(),
                appeal_created_at: new Date().toISOString()
              }
            : listing
        ));

        toast({
          title: "✅ Appeal Submitted",
          description: "Your appeal has been submitted and will be reviewed by our admin team. You'll be notified of the decision."
        });

        // Close dialog and reset form
        setAppealDialog({ isOpen: false, listing: null });
        setAppealMessage('');

      } else {
        let errorMessage = 'Failed to submit appeal';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error(`[APPEAL] Failed to parse error response:`, parseError);
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('[APPEAL] Error:', error);
      toast({
        title: "❌ Appeal Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit appeal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingAppeal(false);
    }
  };

  const openAppealDialog = (listing: ListingData) => {
    setAppealDialog({ isOpen: true, listing });
    setAppealMessage('');
  };

  // Enhanced status badge function with rejection handling
  const getStatusBadge = (listing: ListingData) => {
    const status = listing.status;

    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-300">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );

      case 'inactive':
      case 'withdrawn':
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-700/20 dark:text-gray-300">
            <XCircle className="h-3 w-3 mr-1" />
            {status === 'withdrawn' ? 'Withdrawn' : 'Inactive'}
          </Badge>
        );

      case 'pending_approval':
        return (
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-700/20 dark:text-blue-300">
            <Clock className="h-3 w-3 mr-1" />
            Pending Approval
          </Badge>
        );

      case 'under_review':
        return (
          <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-700/20 dark:text-purple-300">
            <AlertCircle className="h-3 w-3 mr-1" />
            Under Review
          </Badge>
        );

      case 'rejected_by_admin':
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-300">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );

      case 'appealing_rejection':
        return (
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-700/20 dark:text-amber-300">
            <MessageCircle className="h-3 w-3 mr-1" />
            Appeal Submitted
          </Badge>
        );

      case 'draft':
        return (
          <Badge variant="outline" className="bg-slate-100 text-slate-700 dark:bg-slate-700/20 dark:text-slate-300">
            <FileText className="h-3 w-3 mr-1" />
            Draft
          </Badge>
        );

      default:
        return (
          <Badge variant="outline">
            {status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')}
          </Badge>
        );
    }
  };

  // Function to get rejection reason display
  const getRejectionReasonDisplay = (category?: string) => {
    const categoryMap: Record<string, string> = {
      'quality': 'Poor Quality',
      'compliance': 'Policy Violation',
      'incomplete': 'Incomplete Information',
      'fraud': 'Suspected Fraud',
      'duplicate': 'Duplicate Listing',
      'inappropriate': 'Inappropriate Content',
      'other': 'Other'
    };
    return category ? categoryMap[category] || category : 'Not specified';
  };

  // Function to determine if listing can be edited
  const canEditListing = (status: string) => {
    return !['rejected_by_admin', 'appealing_rejection', 'under_review'].includes(status);
  };

  // Function to determine if listing can be appealed
  const canAppealListing = (listing: ListingData) => {
    return listing.status === 'rejected_by_admin' && !listing.appeal_status;
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <Skeleton className="h-9 w-64 rounded-md" />
          <Skeleton className="h-10 w-48 mt-4 md:mt-0 rounded-md" />
        </div>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="shadow-lg flex flex-col bg-card rounded-lg">
              <CardHeader className="p-0">
                <Skeleton className="w-full h-40 rounded-t-lg" />
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-6 w-3/4 rounded" />
                <Skeleton className="h-4 w-1/2 rounded" />
                <Skeleton className="h-4 w-2/3 rounded" />
                <Skeleton className="h-4 w-1/3 rounded" />
              </CardContent>
              <CardFooter className="p-4 border-t border-border">
                <div className="grid grid-cols-2 gap-2 w-full">
                  <Skeleton className="h-8 rounded-md" />
                  <Skeleton className="h-8 rounded-md" />
                  <Skeleton className="h-8 rounded-md" />
                  <Skeleton className="h-8 rounded-md" />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">My Business Listings</h1>
        {/* "Create New Listing" button is in the sidebar and empty state card, removed from header */}
      </div>

      {listings.length === 0 ? (
        <Card className="shadow-lg text-center py-12 md:py-20 bg-card border border-dashed border-border rounded-lg">
          <CardContent className="flex flex-col items-center">
            <NobridgeIcon icon="business-listing" size="xl" className="mb-6 text-muted-foreground opacity-70" />
            <h2 className="text-2xl font-semibold text-foreground mb-2 font-heading">No Listings Yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Showcase your business to motivated buyers. Create your first listing to get started.
            </p>
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/seller-dashboard/listings/create">
                <PlusCircle className="mr-2 h-5 w-5" /> Create First Listing
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => (
            <Card key={listing.id} className="shadow-lg flex flex-col bg-card rounded-lg overflow-hidden transition-all hover:shadow-xl">
              <CardHeader className="relative p-0">
                 <Image
                    src={listing.images?.[0] || "https://placehold.co/400x200.png"}
                    alt={listing.title}
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover" // Consistent image height
                    data-ai-hint="business building city"
                  />
                   {listing.verification_status === 'verified' ? (
                    <Badge className="absolute top-3 right-3 bg-green-100 text-green-700 border-green-300 dark:bg-green-700/20 dark:text-green-300">
                        <ShieldCheck className="h-3 w-3 mr-1.5" /> Verified
                    </Badge>
                    ) : listing.verification_status === 'pending' ? (
                    <Badge variant="outline" className="absolute top-3 right-3 bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-700/20 dark:text-yellow-300">
                        <AlertTriangle className="h-3 w-3 mr-1.5" /> Pending Verification
                    </Badge>
                    ) : (
                    <Badge variant="outline" className="absolute top-3 right-3 bg-muted text-muted-foreground border-border">
                        <AlertTriangle className="h-3 w-3 mr-1.5" /> Anonymous
                    </Badge>
                )}
              </CardHeader>
              <CardContent className="p-5 flex-grow space-y-2">
                <CardTitle className="text-lg font-semibold text-foreground font-heading leading-tight hover:text-primary transition-colors">
                  <Link href={`/listings/${listing.id}`} target="_blank" title={`View public page for ${listing.title}`}>
                    {listing.title}
                  </Link>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground line-clamp-2">{listing.industry} - {listing.location_city}, {listing.location_country}</CardDescription>
                <p className="text-sm text-muted-foreground">Revenue: {listing.annual_revenue_range || 'Not specified'}</p>
                <p className="text-sm text-muted-foreground">Asking Price: ${listing.asking_price?.toLocaleString() || 'Not specified'}</p>
                <p className="text-xs text-muted-foreground">Created: {new Date(listing.created_at).toLocaleDateString()}</p>

                {/* Enhanced status badge */}
                <div className="mt-2">
                  {getStatusBadge(listing)}
                </div>

                {/* Rejection information */}
                {listing.status === 'rejected_by_admin' && (
                  <Alert className="mt-3 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-sm">
                      <div className="font-medium text-red-800 dark:text-red-200 mb-1">
                        Rejection Reason: {getRejectionReasonDisplay(listing.rejection_category)}
                      </div>
                      {listing.admin_notes && (
                        <div className="text-red-700 dark:text-red-300 text-xs">
                          {listing.admin_notes}
                        </div>
                      )}
                      {listing.admin_action_at && (
                        <div className="text-red-600 dark:text-red-400 text-xs mt-1">
                          Rejected on {new Date(listing.admin_action_at).toLocaleDateString()}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Appeal status information */}
                {listing.appeal_status && (
                  <Alert className="mt-3 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
                    <MessageCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-sm">
                      <div className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                        Appeal Status: {listing.appeal_status.charAt(0).toUpperCase() + listing.appeal_status.slice(1)}
                      </div>
                      {listing.appeal_created_at && (
                        <div className="text-amber-700 dark:text-amber-300 text-xs">
                          Submitted on {new Date(listing.appeal_created_at).toLocaleDateString()}
                        </div>
                      )}
                      {listing.admin_response && (
                        <div className="text-amber-700 dark:text-amber-300 text-xs mt-1">
                          Admin Response: {listing.admin_response}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter className="p-4 border-t border-border bg-muted/30">
                <div className="grid grid-cols-2 gap-2 w-full">
                    {/* Public View - Always available */}
                    <Button variant="outline" size="sm" asChild className="border-input hover:bg-accent/50 hover:text-accent-foreground">
                        <Link href={`/listings/${listing.id}`} target="_blank">
                        <Eye className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Public View</span>
                        </Link>
                    </Button>

                    {/* Edit - Only if listing can be edited */}
                    {canEditListing(listing.status) ? (
                      <Button variant="outline" size="sm" asChild className="border-input hover:bg-accent/50 hover:text-accent-foreground">
                          <Link href={`/seller-dashboard/listings/${listing.id}/edit`}>
                          <Edit3 className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Edit</span>
                          </Link>
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" disabled className="border-input opacity-50">
                          <Edit3 className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Edit</span>
                      </Button>
                    )}

                    {/* Inquiries - Always available */}
                    <Button variant="outline" size="sm" asChild className="border-input hover:bg-accent/50 hover:text-accent-foreground">
                        <Link href={`/seller-dashboard/inquiries?listingId=${listing.id}`}>
                        <MessageSquare className="h-4 w-4 mr-1 sm:mr-2" /> Inquiries
                        </Link>
                    </Button>

                    {/* Status-specific action button */}
                    {listing.status === 'active' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeactivate(listing.id, listing.title)}
                          disabled={isUpdating === listing.id}
                          className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          {isUpdating === listing.id ? (
                            <Loader2 className="h-4 w-4 mr-1 sm:mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-1 sm:mr-2" />
                          )}
                          Deactivate
                        </Button>
                    ) : listing.status === 'inactive' || listing.status === 'withdrawn' ? (
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => handleReactivate(listing.id, listing.title)}
                           disabled={isUpdating === listing.id}
                           className="border-green-500/50 text-green-600 hover:bg-green-500/10 hover:text-green-700"
                         >
                           {isUpdating === listing.id ? (
                             <Loader2 className="h-4 w-4 mr-1 sm:mr-2 animate-spin" />
                           ) : (
                             <CheckCircle2 className="h-4 w-4 mr-1 sm:mr-2" />
                           )}
                           Reactivate
                        </Button>
                    ) : canAppealListing(listing) ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openAppealDialog(listing)}
                          className="border-amber-500/50 text-amber-600 hover:bg-amber-500/10 hover:text-amber-700"
                        >
                          <MessageCircle className="h-4 w-4 mr-1 sm:mr-2" />
                          Appeal
                        </Button>
                                        ) : listing.status === 'verified_anonymous' || listing.status === 'verified_public' ? (
                        /* VERIFIED LISTINGS - Admin approved, seller can deactivate if needed
                         *
                         * STATUS EXPLANATION:
                         * - verified_anonymous: Admin approved listing, shows basic business info publicly
                         *   but hides detailed financials (annual revenue, net profit, cash flow, seller_id)
                         * - verified_public: Admin approved listing, shows full verified details including
                         *   all financial information and seller identification
                         *
                         * Both statuses indicate successful admin review and marketplace visibility.
                         * Sellers can deactivate verified listings if they no longer want them active.
                         * TODO: Consider renaming for clarity - "verified_limited" vs "verified_full"
                         */
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeactivate(listing.id, listing.title)}
                          disabled={isUpdating === listing.id}
                          className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          {isUpdating === listing.id ? (
                            <Loader2 className="h-4 w-4 mr-1 sm:mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-1 sm:mr-2" />
                          )}
                          Deactivate
                        </Button>
                    ) : (
                        <Button variant="outline" size="sm" disabled className="border-input opacity-50">
                          <Clock className="h-4 w-4 mr-1 sm:mr-2" />
                          {listing.status === 'pending_approval' ? 'Pending' :
                           listing.status === 'under_review' ? 'Reviewing' :
                           listing.status === 'appealing_rejection' ? 'Appealing' : 'Processing'}
                        </Button>
                    )}
                </div>
                 {profile?.verification_status !== 'verified' && listing.verification_status !== 'pending' && (
                    <Button variant="secondary" size="sm" className="w-full mt-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-700/20 dark:text-yellow-300" asChild>
                         <Link href="/seller-dashboard/verification">
                            <ShieldCheck className="h-4 w-4 mr-2" /> Get Verified
                        </Link>
                    </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Appeal Dialog */}
      <Dialog open={appealDialog.isOpen} onOpenChange={(open) => {
        if (!open) {
          setAppealDialog({ isOpen: false, listing: null });
          setAppealMessage('');
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-amber-600" />
              Appeal Listing Rejection
            </DialogTitle>
            <DialogDescription>
              Submit an appeal for "{appealDialog.listing?.title}". Please provide a detailed explanation of why this listing should be reconsidered.
            </DialogDescription>
          </DialogHeader>

          {appealDialog.listing && (
            <div className="space-y-4">
              {/* Show original rejection details */}
              <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription>
                  <div className="font-medium text-red-800 dark:text-red-200 mb-1">
                    Original Rejection: {getRejectionReasonDisplay(appealDialog.listing.rejection_category)}
                  </div>
                  {appealDialog.listing.admin_notes && (
                    <div className="text-red-700 dark:text-red-300 text-sm">
                      Admin Notes: {appealDialog.listing.admin_notes}
                    </div>
                  )}
                </AlertDescription>
              </Alert>

              {/* Appeal message input */}
              <div className="space-y-2">
                <label htmlFor="appeal-message" className="text-sm font-medium">
                  Your Appeal Message *
                </label>
                <Textarea
                  id="appeal-message"
                  placeholder="Please explain why you believe this listing should be approved. Include any additional information or corrections that address the rejection reason..."
                  value={appealMessage}
                  onChange={(e) => setAppealMessage(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                <div className="text-xs text-muted-foreground">
                  {appealMessage.length}/1000 characters
                </div>
              </div>

              {/* Guidelines */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <div className="font-medium mb-1">Appeal Guidelines:</div>
                  <ul className="text-xs space-y-1 ml-4 list-disc">
                    <li>Be specific about what changes you've made or why the rejection was incorrect</li>
                    <li>Provide additional context or documentation if relevant</li>
                    <li>Appeals are typically reviewed within 2-3 business days</li>
                    <li>You can only submit one appeal per listing</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAppealDialog({ isOpen: false, listing: null });
                setAppealMessage('');
              }}
              disabled={isSubmittingAppeal}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAppealSubmission}
              disabled={isSubmittingAppeal || !appealMessage.trim() || appealMessage.length > 1000}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isSubmittingAppeal ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting Appeal...
                </>
              ) : (
                <>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Submit Appeal
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
