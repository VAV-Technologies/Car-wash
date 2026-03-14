'use client';

// Force dynamic rendering due to client-side interactivity
export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, MessageSquare, Loader2, RefreshCw, Info, ShieldAlert, Eye, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

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
  created_at: string;
  updated_at: string;
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
  seller?: {
    id: string;
    full_name: string;
    email: string;
    verification_status: string;
  };
}

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  verification_status: string;
}

function FormattedTimestamp({ timestamp }: { timestamp: Date | string }) {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);

  if (isNaN(date.getTime())) {
    return <span>Invalid date</span>;
  }

  return (
    <span>
      {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </span>
  );
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use auth context instead of making redundant API calls
  const { user, profile, isLoading: isAuthLoading } = useAuth();

  // Fetch inquiries only - user data comes from context
  const fetchInquiries = React.useCallback(async () => {
    if (!user || !profile) return; // Don't fetch if no user data

    try {
      setIsLoadingInquiries(true);
      setError(null);

      // Only fetch inquiries - user data comes from auth context
      const inquiriesResponse = await fetch('/api/inquiries?role=buyer&limit=50');
      const inquiriesData = await inquiriesResponse.json();

      if (!inquiriesResponse.ok || inquiriesData.error) {
        throw new Error(inquiriesData.error || 'Failed to fetch inquiries');
      }

      setInquiries(inquiriesData.inquiries || []);
    } catch (error) {
      console.error('[BUYER-INQUIRIES] Error fetching inquiries:', error);
      setError(error instanceof Error ? error.message : 'Failed to load inquiries');
    } finally {
      setIsLoadingInquiries(false);
    }
  }, [user, profile]);

  // Fetch inquiries when auth data is available
  useEffect(() => {
    if (user && profile && profile.role === 'buyer') {
      fetchInquiries();
    }
  }, [user, profile, fetchInquiries]);

  // Map inquiry status to user-friendly text for buyer perspective
  const getStatusDisplay = (inquiry: Inquiry): string => {
    switch (inquiry.status) {
      case 'new_inquiry':
        return 'Inquiry Sent';
      case 'seller_engaged_buyer_pending_verification':
        return 'Seller Engaged - Your Verification Required';
      case 'seller_engaged_seller_pending_verification':
        return 'Seller Engaged - Seller Verification Pending';
      case 'ready_for_admin_connection':
        return 'Ready for Admin Connection';
      case 'connection_facilitated_in_app_chat_opened':
        return 'Connection Facilitated - Chat Open';
      case 'archived':
        return 'Archived';
      default:
        return inquiry.status;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    if (status === 'new_inquiry') return "default";
    if (status.includes('pending') || status.includes('Required')) return "destructive";
    if (status.includes('Ready') || status.includes('Facilitated') || status.includes('Chat')) return "default";
    return "outline";
  };

  const getStatusBadgeClass = (status: string) => {
    if (status === 'connection_facilitated_in_app_chat_opened' || status.includes('Ready') || status.includes('Facilitated')) return "bg-green-500 text-white";
    if (status.includes('Required') || status.includes('pending')) return "bg-amber-500 text-white";
    if (status === 'new_inquiry') return "bg-blue-500 text-white";
    return "";
  };

  // Show loading while auth is initializing
  if (isAuthLoading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-semibold tracking-tight text-brand-dark-blue">My Inquiries</h1>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span>Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Access denied for non-buyers or unauthenticated users
  if (!user || !profile || profile.role !== 'buyer') {
    return (
      <div className="space-y-8 text-center p-8">
        <h1 className="text-3xl font-semibold tracking-tight text-destructive">Access Denied</h1>
        <p className="text-muted-foreground">You must be logged in as a buyer to view this page.</p>
        <Button asChild><Link href="/auth/login">Login</Link></Button>
      </div>
    );
  }

  // Show loading while fetching inquiries
  if (isLoadingInquiries) {
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
        <Card className="shadow-md bg-red-50 border-red-200">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-semibold text-red-700 mb-2">Failed to Load Inquiries</p>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <Button onClick={fetchInquiries} variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
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
        Track your inquiries sent to sellers about their businesses.
      </p>
        </div>
        <Button onClick={fetchInquiries} variant="outline" disabled={isLoadingInquiries}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {inquiries.length === 0 ? (
        <Card className="shadow-md text-center py-12 bg-brand-white">
          <CardContent>
            <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl font-semibold text-muted-foreground">No inquiries yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your inquiries to sellers will be shown here once you make them.
            </p>
            <Button asChild className="mt-4 bg-brand-dark-blue text-brand-white hover:bg-brand-dark-blue/90">
                <Link href="/marketplace">Browse Marketplace</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {inquiries.map((inquiry) => {
            const statusDisplay = getStatusDisplay(inquiry);
            const listingTitle = inquiry.listing?.listing_title_anonymous || 'Untitled Listing';
            const sellerStatus = inquiry.listing?.is_seller_verified ? 'Platform Verified Seller' : 'Anonymous Seller';

            return (
            <Card key={inquiry.id} id={inquiry.id} className="shadow-lg bg-brand-white">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                  <CardTitle className="text-xl text-brand-dark-blue">
                      Inquiry for: <Link href={`/listings/${inquiry.listing_id}`} className="text-brand-sky-blue hover:underline">{listingTitle}</Link>
                  </CardTitle>
                  <Badge
                      variant={getStatusBadgeVariant(inquiry.status)}
                      className={getStatusBadgeClass(inquiry.status)}
                  >
                      {statusDisplay}
                  </Badge>
                </div>
                <CardDescription className="text-xs text-muted-foreground">
                    Inquired on: <FormattedTimestamp timestamp={inquiry.inquiry_timestamp} />
                    <br/>
                    Seller Status: <span className="font-medium">{sellerStatus}</span>
                    {inquiry.initial_message && (
                      <>
                  <br/>
                        Your message: <span className="italic">"{inquiry.initial_message}"</span>
                      </>
                    )}
                </CardDescription>
              </CardHeader>

                {inquiry.status === "seller_engaged_buyer_pending_verification" && (
                <CardContent className="pt-0 pb-4 border-t mt-2">
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-700 flex flex-col sm:flex-row items-start gap-3">
                    <Info className="h-6 w-6 flex-shrink-0 mt-0.5 text-amber-600"/>
                    <div className="flex-grow space-y-2">
                      <p className="font-semibold">Action Required: Verify Your Profile</p>
                      <p>
                          The seller has engaged with your inquiry! To access their private data and for our team to facilitate the connection, you need to become a Verified Buyer. Please verify your profile so our team can proceed.
                      </p>
                       <Button size="sm" asChild className="bg-amber-500 hover:bg-amber-600 text-white">
                        <Link href="/dashboard/verification">
                          <ShieldAlert className="mr-2 h-4 w-4" /> Verify Profile Now
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}

              <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
                <Button size="sm" variant="outline" asChild className="border-brand-dark-blue/50 text-brand-dark-blue hover:bg-brand-light-gray/70">
                     <Link href={`/listings/${inquiry.listing_id}`} target="_blank"><Eye className="mr-2 h-4 w-4" />View Listing</Link>
                </Button>

                   {inquiry.status === "seller_engaged_buyer_pending_verification" && (
                   <Button size="sm" variant="default" asChild className="bg-amber-500 hover:bg-amber-600 text-white">
                     <Link href="/dashboard/verification">
                        <ShieldAlert className="mr-2 h-4 w-4" />Proceed to Verification
                     </Link>
                   </Button>
                )}

                   {inquiry.status === "ready_for_admin_connection" && (
                   <Button size="sm" variant="default" className="bg-green-500 text-white hover:bg-green-600" disabled>
                     Admin Connecting <Mail className="ml-2 h-4 w-4" />
                   </Button>
                )}

                  {inquiry.status === 'connection_facilitated_in_app_chat_opened' && inquiry.conversation_id && (
                   <Button size="sm" variant="default" asChild className="bg-brand-dark-blue text-brand-white hover:bg-brand-dark-blue/90">
                       <Link href={`/dashboard/messages/${inquiry.conversation_id}`}>
                       <MessageSquare className="mr-2 h-4 w-4" /> Open Conversation
                     </Link>
                   </Button>
                )}
              </CardFooter>
            </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

