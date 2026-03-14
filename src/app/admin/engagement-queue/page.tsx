'use client';

// Force dynamic rendering due to client-side interactivity
export const dynamic = 'force-dynamic'

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  MessageSquare,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  ExternalLink,
  Shield,
  AlertTriangle,
  Bell,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface FacilitationRequest {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  status: string;
  initial_message?: string;
  inquiry_timestamp: string;
  engagement_timestamp?: string;
  listing?: {
    id: string;
    listing_title_anonymous: string;
    asking_price: number;
    industry: string;
    location_city_region_general?: string;
    location_country: string;
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

interface FacilitationStats {
  ready_for_connection: number;
  pending_verification: number;
  total_facilitated_today: number;
  total_active_conversations: number;
}

export default function AdminEngagementQueuePage() {
  const { toast } = useToast();

  // State management
  const [requests, setRequests] = useState<FacilitationRequest[]>([]);
  const [stats, setStats] = useState<FacilitationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [facilitatingId, setFacilitatingId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<FacilitationRequest | null>(null);

  // Fetch facilitation requests and stats
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch requests ready for facilitation
      const requestsResponse = await fetch('/api/admin/chat-facilitation/requests');
      const requestsData = await requestsResponse.json();

      if (!requestsResponse.ok) {
        throw new Error(requestsData.error || 'Failed to fetch facilitation requests');
      }

      // Fetch facilitation stats
      const statsResponse = await fetch('/api/admin/chat-facilitation/stats');
      const statsData = await statsResponse.json();

      if (!statsResponse.ok) {
        throw new Error(statsData.error || 'Failed to fetch facilitation stats');
      }

      setRequests(requestsData.requests || []);
      setStats(statsData.stats || null);

    } catch (error) {
      console.error('[ADMIN-ENGAGEMENT-QUEUE] Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Facilitate chat connection
  const facilitateChat = useCallback(async (requestId: string, buyerName: string, sellerName: string, listingTitle: string) => {
    try {
      setFacilitatingId(requestId);
      setIsProcessing(true);

      const response = await fetch(`/api/admin/chat-facilitation/${requestId}/facilitate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          admin_note: `Chat connection facilitated between ${buyerName} and ${sellerName} for listing: ${listingTitle}`
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to facilitate chat');
      }

      toast({
        title: 'Chat Connection Facilitated',
        description: `Successfully connected ${buyerName} and ${sellerName}. They can now chat about "${listingTitle}".`
      });

      // Refresh data to show updated status
      await fetchData();

    } catch (error) {
      console.error('[ADMIN-ENGAGEMENT-QUEUE] Error facilitating chat:', error);
      toast({
        title: 'Facilitation Failed',
        description: error instanceof Error ? error.message : 'Failed to facilitate chat connection',
        variant: 'destructive'
      });
    } finally {
      setFacilitatingId(null);
      setIsProcessing(false);
    }
  }, [fetchData, toast]);

  // Handle verification prompting
  const handlePromptVerification = useCallback(async (userId: string, userRole: 'buyer' | 'seller', reason: string) => {
    try {
      setIsProcessing(true);

      const response = await fetch('/api/admin/prompt-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userRole,
          reason,
          urgencyLevel: 'high'
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Verification Prompt Sent",
          description: result.message,
        });

        // Refresh the data to reflect any changes
        fetchData();
      } else {
        throw new Error(result.error || 'Failed to send verification prompt');
      }
    } catch (error) {
      console.error('Error prompting verification:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send verification prompt",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [fetchData, toast]);

  // Filter requests based on search term
  const filteredRequests = requests.filter(request => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      request.buyer?.full_name.toLowerCase().includes(searchLower) ||
      request.seller?.full_name.toLowerCase().includes(searchLower) ||
      request.listing?.listing_title_anonymous.toLowerCase().includes(searchLower) ||
      request.listing?.industry.toLowerCase().includes(searchLower) ||
      request.id.toLowerCase().includes(searchLower)
    );
  });

  // Get status display and badge styling
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'ready_for_admin_connection':
        return {
          text: 'Ready for Connection',
          variant: 'default' as const,
          className: 'bg-blue-100 text-blue-800',
          icon: <Users className="h-3 w-3" />
        };
      case 'connection_facilitated_in_app_chat_opened':
        return {
          text: 'Chat Active',
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800',
          icon: <MessageSquare className="h-3 w-3" />
        };
      case 'seller_engaged_buyer_pending_verification':
        return {
          text: 'Buyer Verification Pending',
          variant: 'secondary' as const,
          className: 'bg-amber-100 text-amber-800',
          icon: <Clock className="h-3 w-3" />
        };
      case 'seller_engaged_seller_pending_verification':
        return {
          text: 'Seller Verification Pending',
          variant: 'secondary' as const,
          className: 'bg-amber-100 text-amber-800',
          icon: <Clock className="h-3 w-3" />
        };
      default:
        return {
          text: status,
          variant: 'outline' as const,
          className: '',
          icon: <AlertCircle className="h-3 w-3" />
        };
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-semibold tracking-tight">Engagement Queue</h1>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span>Loading engagement queue...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-semibold tracking-tight">Engagement Queue</h1>
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Data</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Engagement Queue</h1>
          <p className="text-muted-foreground">
            Manage and facilitate chat connections between verified buyers and sellers.
          </p>
        </div>
        <Button onClick={fetchData} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ready for Connection</p>
                  <p className="text-2xl font-semibold">{stats.ready_for_connection}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Verification</p>
                  <p className="text-2xl font-semibold">{stats.pending_verification}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Facilitated Today</p>
                  <p className="text-2xl font-semibold">{stats.total_facilitated_today}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Conversations</p>
                  <p className="text-2xl font-semibold">{stats.total_active_conversations}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Engagement Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Ready for Connection</CardTitle>
          <CardDescription>
            Inquiries where both parties are verified and ready for chat connection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by buyer name, seller name, listing title, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Requests Table */}
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Pending Engagements</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'No requests match your search criteria.' : 'All inquiries are either pending verification or already connected.'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Listing</TableHead>
                    <TableHead>Initial Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Inquiry Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => {
                    const statusInfo = getStatusInfo(request.status);
                    const canFacilitate = request.status === 'ready_for_admin_connection';

                    return (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{request.buyer?.full_name}</span>
                              {request.buyer?.verification_status === 'verified' && (
                                <Shield className="h-3 w-3 text-green-500" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{request.buyer?.email}</p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{request.seller?.full_name}</span>
                              {request.seller?.verification_status === 'verified' && (
                                <Shield className="h-3 w-3 text-green-500" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{request.seller?.email}</p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            <Link
                              href={`/listings/${request.listing_id}`}
                              className="font-medium hover:underline text-primary"
                              target="_blank"
                            >
                              {request.listing?.listing_title_anonymous}
                            </Link>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{request.listing?.industry}</span>
                              <span>•</span>
                              <span>${request.listing?.asking_price?.toLocaleString()}</span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          {request.initial_message ? (
                            <div className="max-w-xs">
                              <p className="text-sm truncate" title={request.initial_message}>
                                "{request.initial_message}"
                              </p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">No message</span>
                          )}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={statusInfo.variant}
                              className={statusInfo.className}
                            >
                              {statusInfo.icon}
                              <span className="ml-1">{statusInfo.text}</span>
                            </Badge>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {formatTimestamp(request.inquiry_timestamp)}
                          </span>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/inquiries/${request.id}`}>
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            </Button>

                            {canFacilitate && (
                              <Button
                                size="sm"
                                onClick={() => facilitateChat(
                                  request.id,
                                  request.buyer?.full_name || 'Buyer',
                                  request.seller?.full_name || 'Seller',
                                  request.listing?.listing_title_anonymous || 'Listing'
                                )}
                                disabled={facilitatingId === request.id}
                              >
                                {facilitatingId === request.id ? (
                                  <>
                                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                    Facilitating...
                                  </>
                                ) : (
                                  <>
                                    <MessageSquare className="mr-2 h-3 w-3" />
                                    Facilitate Chat
                                  </>
                                )}
                              </Button>
                            )}

                            {request.status === 'connection_facilitated_in_app_chat_opened' && (
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/admin/conversations/${request.id}`}>
                                  View Chat
                                </Link>
                              </Button>
                            )}

                            {/* 🚀 VERIFICATION PROMPTING BUTTONS */}
                            {request.status === 'seller_engaged_buyer_pending_verification' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePromptVerification(request.buyer_id, 'buyer', `Your inquiry for "${request.listing?.listing_title_anonymous}" is ready to proceed. Please verify to connect with the seller.`)}
                                disabled={isProcessing}
                                className="border-amber-500 text-amber-700 hover:bg-amber-50"
                              >
                                <Bell className="h-4 w-4" />
                                <span className="ml-1">Prompt Buyer</span>
                              </Button>
                            )}

                            {request.status === 'seller_engaged_seller_pending_verification' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePromptVerification(request.seller_id, 'seller', `A buyer is interested in your listing "${request.listing?.listing_title_anonymous}". Please verify to proceed with connection.`)}
                                disabled={isProcessing}
                                className="border-amber-500 text-amber-700 hover:bg-amber-50"
                              >
                                <Bell className="h-4 w-4" />
                                <span className="ml-1">Prompt Seller</span>
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedRequest(request)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

