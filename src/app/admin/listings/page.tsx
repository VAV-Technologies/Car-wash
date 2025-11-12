'use client';
import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { AdminListingWithContext, ListingStatus, RejectionCategory, ListingVerificationStatus } from "@/lib/types";
import Link from "next/link";
import {
  Eye,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  CalendarDays,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Settings,
  Pencil
} from "lucide-react";
import { industries } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { ListingVerificationDialog } from "@/components/admin/listing-verification-dialog";

// Helper component for client-side date formatting
function FormattedDate({ dateString }: { dateString: Date | string }) {
  const [formattedDate, setFormattedDate] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (dateString) {
      const dateObj = typeof dateString === 'string' ? new Date(dateString) : dateString;
      if (!isNaN(dateObj.getTime())) {
        setFormattedDate(dateObj.toLocaleDateString());
      } else {
        setFormattedDate('N/A');
      }
    } else {
      setFormattedDate('N/A');
    }
  }, [dateString]);

  if (dateString && !formattedDate) {
    return <span className="italic text-xs">Loading date...</span>;
  }
  return <>{formattedDate}</>;
}

// Interfaces for component state
interface ListingsResponse {
  success: boolean;
  data: {
    listings: AdminListingWithContext[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
      limit: number;
    };
    summary: {
      statusCounts: Record<string, number>;
      totalListings: number;
    };
    filters: {
      appliedFilters: {
        status: string | null;
        industry: string | null;
        sellerVerification: string | null;
        search: string | null;
      };
    };
  };
}

interface AdminActionDialogState {
  isOpen: boolean;
  type: 'approve' | 'reject' | null;
  listing: AdminListingWithContext | null;
}

export default function AdminListingsPage() {
  const { toast } = useToast();

  // State management
  const [listings, setListings] = React.useState<AdminListingWithContext[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [pagination, setPagination] = React.useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false,
    limit: 10,
  });
  const [summary, setSummary] = React.useState({
    statusCounts: {} as Record<string, number>,
    totalListings: 0,
  });

  // Filter state
  const [filters, setFilters] = React.useState({
    search: '',
    status: 'all',
    industry: 'all',
    sellerVerification: 'all',
  });

  // Action dialog state
  const [actionDialog, setActionDialog] = React.useState<AdminActionDialogState>({
    isOpen: false,
    type: null,
    listing: null,
  });
  const [actionLoading, setActionLoading] = React.useState(false);
  const [rejectionCategory, setRejectionCategory] = React.useState<RejectionCategory>('quality');
  const [adminNotes, setAdminNotes] = React.useState('');

  // Verification dialog state
  const [verificationDialog, setVerificationDialog] = React.useState<{
    isOpen: boolean;
    listing: AdminListingWithContext | null;
  }>({
    isOpen: false,
    listing: null,
  });

  // Fetch listings from API
  const fetchListings = React.useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      // Add filters to params
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.industry !== 'all') params.append('industry', filters.industry);
      if (filters.sellerVerification !== 'all') params.append('seller_verification', filters.sellerVerification);
      if (filters.search.trim()) params.append('search', filters.search.trim());

      const response = await fetch(`/api/admin/listings?${params}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch listings: ${response.statusText}`);
      }

      const data: ListingsResponse = await response.json();

      if (!data.success) {
        throw new Error('Failed to fetch listings');
      }

      setListings(data.data.listings);
      setPagination(data.data.pagination);
      setSummary(data.data.summary);

    } catch (err) {
      console.error('Error fetching listings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch listings');
      toast({
        title: "Error",
        description: "Failed to fetch listings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit, toast]);

  // Initial load and filter changes
  React.useEffect(() => {
    fetchListings(1);
  }, [fetchListings]);

  // Handle admin actions
  const handleAdminAction = async (type: 'approve' | 'reject', listing: AdminListingWithContext) => {
    setActionDialog({
      isOpen: true,
      type,
      listing,
    });
    setAdminNotes('');
    setRejectionCategory('quality');
  };

  const executeAdminAction = async () => {
    if (!actionDialog.listing || !actionDialog.type) return;

    try {
      setActionLoading(true);

      const endpoint = `/api/admin/listings/${actionDialog.listing.listing.id}/${actionDialog.type}`;
      const body = actionDialog.type === 'approve'
        ? { adminNotes }
        : { rejectionCategory, adminNotes };

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${actionDialog.type} listing`);
      }

      const result = await response.json();

      toast({
        title: "Success",
        description: result.message,
      });

      // Refresh listings
      await fetchListings(pagination.currentPage);

      // Close dialog
      setActionDialog({ isOpen: false, type: null, listing: null });

    } catch (err) {
      console.error(`Error ${actionDialog.type}ing listing:`, err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : `Failed to ${actionDialog.type} listing`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getListingStatusBadge = (status: ListingStatus, isSellerVerified: boolean) => {
    const statusConfig = {
      'verified_public': { color: 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200 border-green-300', icon: ShieldCheck, text: 'Verified Public' },
      'verified_anonymous': { color: 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200 border-blue-300', icon: ShieldCheck, text: 'Verified (Anon)' },
      'pending_verification': { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200 border-yellow-300', icon: AlertTriangle, text: 'Pending Verification' },
      'pending_approval': { color: 'bg-orange-100 text-orange-700 dark:bg-orange-800 dark:text-orange-200 border-orange-300', icon: AlertTriangle, text: 'Pending Approval' },
      'under_review': { color: 'bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-200 border-purple-300', icon: AlertTriangle, text: 'Under Review' },
      'appealing_rejection': { color: 'bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-200 border-amber-300', icon: AlertTriangle, text: 'Appealing Rejection' },
      'rejected_by_admin': { color: 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200 border-red-300', icon: XCircle, text: 'Rejected' },
      'closed_deal': { color: 'bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-200 border-purple-300', icon: CheckCircle, text: 'Deal Closed' },
      'inactive': { color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200 border-gray-300', icon: XCircle, text: 'Inactive' },
      'draft': { color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border-slate-300', icon: AlertTriangle, text: 'Draft' },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (config) {
      const Icon = config.icon;
      return (
        <Badge className={`${config.color} dark:border-gray-600`}>
          <Icon className="h-3 w-3 mr-1" />
          {config.text}
        </Badge>
      );
    }

    // Handle active status with seller verification
    if (status === 'active') {
      if (isSellerVerified) {
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200 border-green-300 dark:border-green-600">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Active (Verified Seller)
          </Badge>
        );
      } else {
        return <Badge variant="outline">Active (Anonymous)</Badge>;
      }
    }

    return <Badge variant="outline" className="capitalize">{status.replace(/_/g, ' ')}</Badge>;
  };

  // Verification status badge helper
  const getVerificationStatusBadge = (verificationStatus?: ListingVerificationStatus) => {
    const status = verificationStatus || 'unverified';
    const statusConfig = {
      'unverified': { 
        color: 'bg-gray-100 text-gray-700 border-gray-300', 
        icon: AlertTriangle, 
        text: 'Unverified',
        iconColor: 'text-gray-600'
      },
      'verified': { 
        color: 'bg-green-100 text-green-700 border-green-300', 
        icon: ShieldCheck, 
        text: 'Verified',
        iconColor: 'text-green-600'
      },
      'deactivated': { 
        color: 'bg-red-100 text-red-700 border-red-300', 
        icon: ShieldX, 
        text: 'Deactivated',
        iconColor: 'text-red-600'
      }
    };

    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} text-xs`}>
        <Icon className={`h-3 w-3 mr-1 ${config.iconColor}`} />
        {config.text}
      </Badge>
    );
  };

  // Handle verification dialog
  const handleVerificationClick = (listing: AdminListingWithContext) => {
    setVerificationDialog({
      isOpen: true,
      listing,
    });
  };

  const canApprove = (status: ListingStatus) => {
    return ['pending_approval', 'under_review', 'rejected_by_admin', 'appealing_rejection', 'inactive'].includes(status);
  };

  const canReject = (status: ListingStatus) => {
    return ['pending_approval', 'under_review', 'active', 'verified_anonymous', 'verified_public', 'appealing_rejection'].includes(status);
  };

  if (error) {
    return (
      <div className="space-y-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              className="ml-4"
              onClick={() => fetchListings(pagination.currentPage)}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-md bg-brand-white">
        <CardHeader>
          <CardTitle className="text-brand-dark-blue">Listing Management</CardTitle>
          <CardDescription>
            View, search, filter, and manage all business listings on the platform.
            Total: {summary.totalListings} listings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or Listing ID..."
                className="pl-8 w-full md:w-[300px]"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <Select value={filters.industry} onValueChange={(value) => setFilters(prev => ({ ...prev, industry: value }))}>
                <SelectTrigger className="w-full sm:w-auto min-w-[180px]">
                  <SelectValue placeholder="Filter by Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {industries.map(industry => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.sellerVerification} onValueChange={(value) => setFilters(prev => ({ ...prev, sellerVerification: value }))}>
                <SelectTrigger className="w-full sm:w-auto min-w-[200px]">
                  <SelectValue placeholder="Filter by Seller Verification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sellers</SelectItem>
                  <SelectItem value="verified">Verified Seller</SelectItem>
                  <SelectItem value="not_verified">Not Verified Seller</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="w-full sm:w-auto min-w-[200px]">
                  <SelectValue placeholder="Filter by Listing Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="pending_verification">Pending Verification</SelectItem>
                  <SelectItem value="verified_public">Verified (Public)</SelectItem>
                  <SelectItem value="verified_anonymous">Verified (Anonymous)</SelectItem>
                  <SelectItem value="rejected_by_admin">Rejected by Admin</SelectItem>
                  <SelectItem value="appealing_rejection">Appealing Rejection</SelectItem>
                  <SelectItem value="closed_deal">Deal Closed</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading listings...</span>
            </div>
          )}

          {/* Listings Table */}
          {!loading && (
            <>
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px]">Anonymous Title</TableHead>
                        <TableHead className="hidden md:table-cell min-w-[120px]">Seller Name</TableHead>
                        <TableHead className="hidden lg:table-cell text-center">Paid</TableHead>
                        <TableHead className="hidden lg:table-cell min-w-[100px]">Industry</TableHead>
                        <TableHead className="hidden xl:table-cell text-right min-w-[120px]">Asking Price</TableHead>
                        <TableHead className="min-w-[120px]">Status</TableHead>
                        <TableHead className="min-w-[120px]">Verification</TableHead>
                        <TableHead className="hidden lg:table-cell text-center min-w-[100px]">
                          <CalendarDays className="h-4 w-4 mx-auto"/>
                          <span className="sr-only">Created On</span>
                        </TableHead>
                        <TableHead className="text-right sticky right-0 bg-background min-w-[60px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                  <TableBody>
                    {listings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          No listings found matching your criteria.
                        </TableCell>
                      </TableRow>
                    ) : (
                      listings.map((listingWithContext) => {
                        const { listing, seller } = listingWithContext;
                        return (
                          <TableRow key={listing.id}>
                            <TableCell className="min-w-[200px]">
                              <div className="space-y-1">
                                <div className="font-medium truncate" title={listing.listingTitleAnonymous}>
                                  <Link href={`/listings/${listing.id}`} className="text-primary hover:underline">
                                    {listing.listingTitleAnonymous}
                                  </Link>
                                </div>
                                <div className="md:hidden text-xs text-muted-foreground">
                                  by {seller.fullName} • {listing.industry}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell min-w-[120px]">
                              <Link href={`/admin/users/${seller.id}`} className="text-primary hover:underline">
                                {seller.fullName}
                              </Link>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-center">
                              {seller.isPaid ? (
                                <Badge className="bg-green-500 text-white text-xs">Yes</Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">No</Badge>
                              )}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell min-w-[100px] text-sm">{listing.industry}</TableCell>
                            <TableCell className="hidden xl:table-cell text-right min-w-[120px] text-sm">
                              {listing.askingPrice ? `$${listing.askingPrice.toLocaleString()}` : 'N/A'}
                            </TableCell>
                            <TableCell className="min-w-[120px]">{getListingStatusBadge(listing.status, listing.isSellerVerified)}</TableCell>
                            <TableCell className="min-w-[120px]">{getVerificationStatusBadge(listing.listingVerificationStatus)}</TableCell>
                            <TableCell className="hidden lg:table-cell text-center min-w-[100px] text-sm">
                              <FormattedDate dateString={listing.createdAt} />
                            </TableCell>
                            <TableCell className="text-right sticky right-0 bg-background min-w-[60px]">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="icon" asChild title="View Listing Details" className="h-8 w-8">
                                  <Link href={`/listings/${listing.id}`}>
                                    <Eye className="h-3 w-3" />
                                  </Link>
                                </Button>

                                <Button variant="ghost" size="icon" asChild title="Edit Listing" className="h-8 w-8">
                                  <Link href={`/admin/listings/${listing.id}/edit`}>
                                    <Pencil className="h-3 w-3 text-blue-600" />
                                  </Link>
                                </Button>

                                {canApprove(listing.status) && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Approve Listing"
                                    onClick={() => handleAdminAction('approve', listingWithContext)}
                                    className="h-8 w-8"
                                  >
                                    <CheckCircle className="h-3 w-3 text-green-600" />
                                  </Button>
                                )}

                                {canReject(listing.status) && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Reject Listing"
                                    onClick={() => handleAdminAction('reject', listingWithContext)}
                                    className="h-8 w-8"
                                  >
                                    <XCircle className="h-3 w-3 text-red-600" />
                                  </Button>
                                )}

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Manage Listing Verification"
                                  onClick={() => handleVerificationClick(listingWithContext)}
                                  className="h-8 w-8"
                                >
                                  <Settings className="h-3 w-3 text-blue-600" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                  </Table>
                </div>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of{' '}
                    {pagination.totalCount} listings
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchListings(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrev}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchListings(pagination.currentPage + 1)}
                      disabled={!pagination.hasNext}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Admin Action Dialog */}
      <Dialog open={actionDialog.isOpen} onOpenChange={(open) => !open && setActionDialog({ isOpen: false, type: null, listing: null })}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {actionDialog.type === 'approve' ? 'Approve Listing' : 'Reject Listing'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.type === 'approve'
                ? `Approve "${actionDialog.listing?.listing.listingTitleAnonymous}" and make it active on the platform.`
                : `Reject "${actionDialog.listing?.listing.listingTitleAnonymous}" and remove it from the platform.`
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {actionDialog.type === 'reject' && (
              <div>
                <label className="text-sm font-medium">Rejection Category</label>
                <Select value={rejectionCategory} onValueChange={(value: RejectionCategory) => setRejectionCategory(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quality">Poor Quality</SelectItem>
                    <SelectItem value="compliance">Policy Violation</SelectItem>
                    <SelectItem value="incomplete">Incomplete Information</SelectItem>
                    <SelectItem value="fraud">Suspected Fraud</SelectItem>
                    <SelectItem value="duplicate">Duplicate Listing</SelectItem>
                    <SelectItem value="inappropriate">Inappropriate Content</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium">
                {actionDialog.type === 'approve' ? 'Admin Notes (Optional)' : 'Admin Notes'}
              </label>
              <Textarea
                placeholder={actionDialog.type === 'approve'
                  ? "Add any notes about this approval..."
                  : "Provide detailed reason for rejection..."
                }
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialog({ isOpen: false, type: null, listing: null })}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={executeAdminAction}
              disabled={actionLoading}
              variant={actionDialog.type === 'approve' ? 'default' : 'destructive'}
            >
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {actionDialog.type === 'approve' ? 'Approve Listing' : 'Reject Listing'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Listing Verification Dialog */}
      <ListingVerificationDialog
        isOpen={verificationDialog.isOpen}
        onOpenChange={(isOpen) => setVerificationDialog(prev => ({ ...prev, isOpen }))}
        listing={verificationDialog.listing}
        onVerificationUpdate={() => fetchListings(pagination.currentPage)}
      />
    </div>
  );
}
