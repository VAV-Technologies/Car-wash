'use client';

// Force dynamic rendering due to client-side interactivity
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  User,
  Building2,
  MessageSquare,
  Calendar,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  MessageCircle,
  Shield
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface InquiryDetail {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  message?: string;
  status: string;
  conversation_id?: string;
  engagement_timestamp?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  listings: {
    id: string;
    listing_title_anonymous: string;
    anonymous_business_description: string;
    asking_price: number;
    industry: string;
    location_country: string;
    status: string;
  };
  buyer_profile: {
    id: string;
    full_name: string;
    verification_status: string;
    role: string;
  };
  seller_profile: {
    id: string;
    full_name: string;
    verification_status: string;
    role: string;
  };
}

export default function AdminInquiryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [inquiry, setInquiry] = useState<InquiryDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFacilitating, setIsFacilitating] = useState(false);

  const inquiryId = params.id as string;

  useEffect(() => {
    const fetchInquiry = async () => {
      try {
        setIsLoading(true);

        // Get auth token from cookies or session
        const response = await fetch(`/api/inquiries/${inquiryId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies for authentication
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Authentication required. Please log in as an admin.');
          }
          if (response.status === 403) {
            throw new Error('Access denied. Admin privileges required.');
          }
          if (response.status === 404) {
            throw new Error('Inquiry not found');
          }

          // Try to get error details from response
          try {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch inquiry details');
          } catch {
            throw new Error(`Server error (${response.status}): Failed to fetch inquiry details`);
          }
        }

        const data = await response.json();
        setInquiry(data.inquiry);
        setAdminNotes(data.inquiry.admin_notes || '');
      } catch (err) {
        console.error('Error fetching inquiry:', err);
        setError(err instanceof Error ? err.message : 'Failed to load inquiry');
      } finally {
        setIsLoading(false);
      }
    };

    if (inquiryId) {
      fetchInquiry();
    }
  }, [inquiryId]);

  const updateAdminNotes = async () => {
    if (!inquiry) return;

    try {
      setIsUpdating(true);
      const response = await fetch(`/api/inquiries/${inquiry.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          admin_notes: adminNotes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update admin notes');
      }

      const data = await response.json();
      setInquiry(data.inquiry);

      toast({
        title: 'Notes Updated',
        description: 'Admin notes have been saved successfully.',
      });
    } catch (err) {
      console.error('Error updating notes:', err);
      toast({
        title: 'Update Failed',
        description: err instanceof Error ? err.message : 'Failed to update notes',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const facilitateChat = async () => {
    if (!inquiry) return;

    try {
      setIsFacilitating(true);
      const response = await fetch(`/api/admin/chat-facilitation/${inquiry.id}/facilitate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          admin_note: `Chat facilitated for inquiry ${inquiry.id} via admin inquiry detail page`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to facilitate chat');
      }

      const data = await response.json();

      toast({
        title: 'Chat Facilitated',
        description: data.message,
      });

      // Refresh inquiry data
      window.location.reload();
    } catch (err) {
      console.error('Error facilitating chat:', err);
      toast({
        title: 'Facilitation Failed',
        description: err instanceof Error ? err.message : 'Failed to facilitate chat',
        variant: 'destructive',
      });
    } finally {
      setIsFacilitating(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'new_inquiry':
        return 'default';
      case 'ready_for_admin_connection':
        return 'secondary';
      case 'connection_facilitated_in_app_chat_opened':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new_inquiry':
        return 'bg-blue-100 text-blue-800';
      case 'ready_for_admin_connection':
        return 'bg-amber-100 text-amber-800';
      case 'connection_facilitated_in_app_chat_opened':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerificationBadge = (status: string) => {
    return status === 'verified'
      ? <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>
      : <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" />Unverified</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-semibold tracking-tight">Inquiry Details</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span>Loading inquiry details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !inquiry) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-semibold tracking-tight">Inquiry Details</h1>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Inquiry</h2>
            <p className="text-muted-foreground mb-4">{error || 'Inquiry not found'}</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Inquiry Details</h1>
            <p className="text-muted-foreground">ID: {inquiry.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(inquiry.status)}>
            {inquiry.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Badge>
          {inquiry.conversation_id && (
            <Button variant="outline" asChild>
              <Link href={`/admin/conversations/${inquiry.conversation_id}`}>
                <MessageSquare className="h-4 w-4 mr-2" />
                View Conversation
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Inquiry Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Inquiry Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Status</Label>
              <p className="mt-1">{inquiry.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Created</Label>
              <p className="mt-1 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDistanceToNow(new Date(inquiry.created_at), { addSuffix: true })}
              </p>
            </div>

            {inquiry.engagement_timestamp && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Engagement Time</Label>
                <p className="mt-1 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {formatDistanceToNow(new Date(inquiry.engagement_timestamp), { addSuffix: true })}
                </p>
              </div>
            )}

            {inquiry.message && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Initial Message</Label>
                <p className="mt-1 p-3 bg-muted rounded-md">{inquiry.message}</p>
              </div>
            )}

            <Separator />

            {/* Admin Actions */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Admin Actions</Label>

              {inquiry.status === 'ready_for_admin_connection' && (
                <Button
                  onClick={facilitateChat}
                  disabled={isFacilitating}
                  className="w-full"
                >
                  {isFacilitating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Facilitating Chat...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Facilitate Chat Connection
                    </>
                  )}
                </Button>
              )}

              <div className="space-y-2">
                <Label htmlFor="admin-notes">Admin Notes</Label>
                <Textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add admin notes about this inquiry..."
                  rows={4}
                />
                <Button
                  onClick={updateAdminNotes}
                  disabled={isUpdating}
                  variant="outline"
                  size="sm"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Update Notes'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Listing Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Listing Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Title</Label>
              <p className="mt-1 font-medium">{inquiry.listings.listing_title_anonymous}</p>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Description</Label>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
                {inquiry.listings.anonymous_business_description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Industry</Label>
                <p className="mt-1">{inquiry.listings.industry}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                <p className="mt-1 flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {inquiry.listings.location_country}
                </p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Asking Price</Label>
              <p className="mt-1 flex items-center gap-1 font-semibold">
                <DollarSign className="h-4 w-4" />
                {inquiry.listings.asking_price.toLocaleString()}
              </p>
            </div>

            <Button variant="outline" asChild className="w-full">
              <Link href={`/listings/${inquiry.listing_id}`} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Full Listing
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Parties Information */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Buyer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Buyer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                <p className="mt-1 font-medium">{inquiry.buyer_profile.full_name}</p>
              </div>
              {getVerificationBadge(inquiry.buyer_profile.verification_status)}
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Role</Label>
              <p className="mt-1 capitalize">{inquiry.buyer_profile.role}</p>
            </div>

            <Button variant="outline" asChild className="w-full">
              <Link href={`/admin/users/${inquiry.buyer_id}`}>
                <User className="mr-2 h-4 w-4" />
                View Buyer Profile
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Seller Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Seller Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                <p className="mt-1 font-medium">{inquiry.seller_profile.full_name}</p>
              </div>
              {getVerificationBadge(inquiry.seller_profile.verification_status)}
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Role</Label>
              <p className="mt-1 capitalize">{inquiry.seller_profile.role}</p>
            </div>

            <Button variant="outline" asChild className="w-full">
              <Link href={`/admin/users/${inquiry.seller_id}`}>
                <User className="mr-2 h-4 w-4" />
                View Seller Profile
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
