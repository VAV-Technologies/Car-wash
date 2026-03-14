'use client';

// Force dynamic rendering due to client-side interactivity
export const dynamic = 'force-dynamic'

import * as React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, MessageSquare, Users, Eye, ShieldAlert, CheckCircle2, ExternalLink, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Inquiry {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  status: string;
  initial_message?: string;
  inquiry_timestamp: string;
  engagement_timestamp?: string;
  conversation_id?: string;
  listing?: {
    id: string;
    listing_title_anonymous: string;
    industry: string;
    asking_price: number;
    location_city_region_general?: string;
    location_country: string;
    is_seller_verified: boolean;
  };
  buyer?: {
    id: string;
    full_name: string;
    email: string;
    verification_status: string;
  };
}

interface User {
  id: string;
  fullName: string;
  role: string;
  verificationStatus: string;
}

export default function SellerInquiriesPage() {
  const { toast } = useToast();
  const [inquiries, setInquiries] = React.useState<Inquiry[]>([]);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [userListings, setUserListings] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [engagingInquiry, setEngagingInquiry] = React.useState<string | null>(null);

  // Fetch current user, inquiries, and user's listings
  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch current user
      const userResponse = await fetch('/api/auth/current-user');
      const userData = await userResponse.json();

      if (!userResponse.ok || userData.error) {
        throw new Error(userData.error || 'Failed to fetch user data');
      }

      if (!userData.user || !userData.profile || userData.profile.role !== 'seller') {
        throw new Error('This page is for sellers only');
      }

      const user: User = {
        id: userData.user.id,
        fullName: userData.profile.full_name || 'Seller',
        role: userData.profile.role,
        verificationStatus: userData.profile.verification_status || 'anonymous'
      };

      setCurrentUser(user);

      // Fetch seller inquiries and listings in parallel
      const [inquiriesResponse, listingsResponse] = await Promise.all([
        fetch('/api/inquiries?role=seller&limit=50'),
        fetch('/api/user/listings?limit=50')
      ]);

      const [inquiriesData, listingsData] = await Promise.all([
        inquiriesResponse.json(),
        listingsResponse.json()
      ]);

      if (!inquiriesResponse.ok || inquiriesData.error) {
        throw new Error(inquiriesData.error || 'Failed to fetch inquiries');
      }

      if (!listingsResponse.ok || listingsData.error) {
        console.warn('Failed to fetch listings:', listingsData.error);
        // Don't throw error for listings, just set empty array
        setUserListings([]);
      } else {
        setUserListings(listingsData.listings || []);
      }

      setInquiries(inquiriesData.inquiries || []);
    } catch (error) {
      console.error('[SELLER-INQUIRIES] Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data fetch
  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle engagement with inquiry
  const handleEngage = async (inquiryId: string, listingTitle: string, buyerName?: string) => {
    try {
      setEngagingInquiry(inquiryId);

      const response = await fetch(`/api/inquiries/${inquiryId}/engage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Engagement doesn't require additional data, but send empty object for consistency
        }),
      });

      // Gracefully handle non-JSON responses
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          // If response is not JSON, use status text
          throw new Error(response.statusText || 'An unknown error occurred');
        }

        // Handle specific verification error from API
        if (errorData.type === 'verification_required') {
            toast({
                title: "Verification Required",
                description: "You must verify your profile before you can engage with buyers.",
                variant: "destructive",
                action: <Button asChild><Link href="/seller-dashboard/verification">Verify Now</Link></Button>
            });
            return; // Stop execution
        }

        throw new Error(errorData.error || 'Failed to engage with inquiry');
      }

      const data = await response.json();

      toast({
        title: "Engagement Successful",
        description: data.message || `You've engaged with ${buyerName || 'the buyer'} for '${listingTitle}'.`
      });

      // Refresh data to show updated status
      await fetchData();
    } catch (error) {
      console.error('[SELLER-INQUIRIES] Error engaging with inquiry:', error);
      toast({
        title: "Engagement Failed",
        description: error instanceof Error ? error.message : 'Failed to engage with inquiry',
        variant: "destructive"
      });
    } finally {
      setEngagingInquiry(null);
    }
  };

  // Map inquiry status to user-friendly text
  const getStatusDisplay = (inquiry: Inquiry): string => {
    switch (inquiry.status) {
      case 'new_inquiry':
        return 'New Inquiry';
      case 'seller_engaged_buyer_pending_verification':
        return 'You Engaged - Buyer Verification Pending';
      case 'seller_engaged_seller_pending_verification':
        return 'You Engaged - Your Verification Pending';
      case 'ready_for_admin_connection':
        return 'Ready for Admin Connection';
      case 'connection_facilitated_in_app_chat_opened':
        return 'Chat Active';
      case 'archived':
        return 'Archived';
      default:
        return inquiry.status;
    }
  };

  // Get badge styling for status
  const getStatusBadgeVariant = (status: string) => {
    if (status === 'new_inquiry') return "destructive";
    if (status.includes('pending')) return "secondary";
    if (status === 'ready_for_admin_connection') return "default";
    if (status === 'connection_facilitated_in_app_chat_opened') return "default";
    return "outline";
  };

  const getStatusBadgeClass = (status: string) => {
    if (status === 'connection_facilitated_in_app_chat_opened') return "bg-green-100 text-green-800";
    if (status === 'ready_for_admin_connection') return "bg-blue-100 text-blue-800";
    if (status.includes('pending')) return "bg-amber-100 text-amber-800";
    return "";
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-semibold tracking-tight text-brand-dark-blue">My Inquiries</h1>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span>Loading inquiries...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-semibold tracking-tight text-brand-dark-blue">My Inquiries</h1>
        <Card className="shadow-md text-center py-12 bg-brand-white">
          <CardContent>
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <p className="text-xl font-semibold text-destructive mb-2">Error Loading Inquiries</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchData} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Auth check
  if (!currentUser) {
    return (
      <div className="space-y-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Access Denied</h1>
        <p className="text-muted-foreground">You must be logged in as a seller to view this page.</p>
        <Button asChild><Link href="/auth/login">Login</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-brand-dark-blue">
            My Inquiries {inquiries.length > 0 && `(${inquiries.length})`}
          </h1>
          <p className="text-muted-foreground">
            Manage inquiries from potential buyers for your business listings.
          </p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {inquiries.length === 0 ? (
        <Card className="shadow-md text-center py-12 bg-brand-white">
          <CardContent>
            <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            {userListings.length === 0 ? (
              // User has no listings
              <>
                <p className="text-xl font-semibold text-muted-foreground">No listings created yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
                  Create your first business listing to start receiving inquiries from potential buyers.
            </p>
                <Button asChild className="mt-4" variant="default">
              <Link href="/seller-dashboard/listings/create">
                Create Your First Listing
              </Link>
            </Button>
              </>
            ) : (
              // User has listings but no inquiries
              <>
                <p className="text-xl font-semibold text-muted-foreground">No inquiries received yet.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  You have {userListings.length} active listing{userListings.length > 1 ? 's' : ''}.
                  Inquiries from interested buyers will appear here once they contact you.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center mt-4">
                  <Button asChild variant="outline">
                    <Link href="/seller-dashboard/listings">
                      <Eye className="mr-2 h-4 w-4" />
                      View My Listings
                    </Link>
                  </Button>
                  <Button asChild variant="default">
                    <Link href="/seller-dashboard/listings/create">
                      Create Another Listing
                    </Link>
                  </Button>
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg text-left">
                  <h3 className="font-semibold text-sm text-blue-900 mb-2">💡 Tips to attract more inquiries:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Ensure your listing has detailed descriptions and clear pricing</li>
                    <li>• Complete your seller verification to build trust</li>
                    <li>• Add high-quality images or documents if applicable</li>
                    <li>• Keep your listing information up-to-date</li>
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {inquiries.map((inquiry) => (
            <Card key={inquiry.id} className="shadow-lg bg-brand-white">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                  <CardTitle className="text-xl text-brand-dark-blue">
                    Inquiry for:{" "}
                    <Link
                      href={`/listings/${inquiry.listing_id}`}
                      className="text-brand-sky-blue hover:underline"
                      target="_blank"
                    >
                      {inquiry.listing?.listing_title_anonymous || 'Listing'}
                    </Link>
                  </CardTitle>
                  <Badge
                    variant={getStatusBadgeVariant(inquiry.status) as any}
                    className={getStatusBadgeClass(inquiry.status)}
                  >
                    {getStatusDisplay(inquiry)}
                  </Badge>
                </div>
                <CardDescription className="text-xs text-muted-foreground">
                  Received on: {new Date(inquiry.inquiry_timestamp).toLocaleDateString()} at {new Date(inquiry.inquiry_timestamp).toLocaleTimeString()}
                  <br />
                  From: <span className="font-medium">{inquiry.buyer?.full_name || 'Anonymous Buyer'}</span>
                  {inquiry.buyer?.verification_status && (
                    <span> (Status: {inquiry.buyer.verification_status})</span>
                  )}
                  <div className="mt-2 p-2 bg-muted rounded text-sm">
                    <strong>Message:</strong> "A {inquiry.listing?.industry || 'Business'} from {inquiry.listing?.location_country || 'Unknown'} is interested in opening a conversation with you"
                  </div>
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="border-brand-dark-blue/50 text-brand-dark-blue hover:bg-brand-light-gray/70"
                >
                  <Link href={`/listings/${inquiry.listing_id}`} target="_blank">
                    <Eye className="mr-2 h-4 w-4" />View Listing
                  </Link>
                </Button>

                {inquiry.status === 'new_inquiry' && (
                  <>
                    {currentUser.verificationStatus === 'verified' ? (
                        <Button
                            onClick={() => handleEngage(inquiry.id, inquiry.listing?.listing_title_anonymous || 'listing', inquiry.buyer?.full_name)}
                            disabled={engagingInquiry === inquiry.id}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {engagingInquiry === inquiry.id ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Engaging...
                                </>
                            ) : (
                                <>
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Engage in Conversation
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button asChild variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                            <Link href="/seller-dashboard/verification">
                                <ShieldAlert className="mr-2 h-4 w-4" />
                                Verify to Engage
                            </Link>
                        </Button>
                    )}
                  </>
                )}

                {inquiry.status === 'seller_engaged_seller_pending_verification' && (
                  <Button size="sm" variant="default" asChild className="bg-amber-500 hover:bg-amber-600 text-white">
                    <Link href="/seller-dashboard/verification">
                      <ShieldAlert className="mr-2 h-4 w-4" />
                      Complete Verification
                    </Link>
                  </Button>
                )}

                {inquiry.status === 'ready_for_admin_connection' && (
                  <Button size="sm" variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-200" disabled>
                    <Users className="mr-2 h-4 w-4" />
                    Awaiting Admin Approval
                  </Button>
                )}

                {inquiry.status === 'connection_facilitated_in_app_chat_opened' && inquiry.conversation_id && (
                  <Button size="sm" variant="default" asChild className="bg-brand-dark-blue text-brand-white hover:bg-brand-dark-blue/90">
                    <Link href={`/seller-dashboard/messages/${inquiry.conversation_id}`}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Open Chat
                    </Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

