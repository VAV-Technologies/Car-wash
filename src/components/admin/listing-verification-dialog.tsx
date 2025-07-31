'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ShieldCheck, 
  ShieldX, 
  AlertTriangle, 
  Loader2, 
  Clock,
  User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { 
  AdminListingWithContext, 
  ListingVerificationStatus,
  AdminListingAction 
} from "@/lib/types";

interface ListingVerificationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  listing: AdminListingWithContext | null;
  onVerificationUpdate?: () => void;
}

interface VerificationHistory {
  currentStatus: {
    verification_status: ListingVerificationStatus;
    verified_by_name: string | null;
    verified_at: string | null;
    verification_notes: string | null;
  } | null;
  history: AdminListingAction[];
  listingId: string;
}

const VERIFICATION_STATUS_CONFIG = {
  unverified: {
    label: 'Unverified',
    description: 'Listing content has not been verified by admin',
    icon: AlertTriangle,
    color: 'bg-gray-100 text-gray-700 border-gray-300',
    iconColor: 'text-gray-600'
  },
  verified: {
    label: 'Verified',
    description: 'Listing content has been verified and approved',
    icon: ShieldCheck,
    color: 'bg-green-100 text-green-700 border-green-300',
    iconColor: 'text-green-600'
  },
  deactivated: {
    label: 'Deactivated',
    description: 'Listing verification has been deactivated',
    icon: ShieldX,
    color: 'bg-red-100 text-red-700 border-red-300',
    iconColor: 'text-red-600'
  }
} as const;

export function ListingVerificationDialog({
  isOpen,
  onOpenChange,
  listing,
  onVerificationUpdate
}: ListingVerificationDialogProps) {
  const { toast } = useToast();
  
  // State management
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<ListingVerificationStatus>('unverified');
  const [notes, setNotes] = React.useState('');
  const [verificationHistory, setVerificationHistory] = React.useState<VerificationHistory | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (isOpen && listing) {
      setSelectedStatus(listing.listing.listingVerificationStatus || 'unverified');
      setNotes('');
      setError(null);
      fetchVerificationHistory();
    } else {
      setVerificationHistory(null);
      setError(null);
    }
  }, [isOpen, listing]);

  const fetchVerificationHistory = async () => {
    if (!listing) return;
    
    setIsLoadingHistory(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/listings/${listing.listing.id}/verification`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle case where verification data might be incomplete
      if (data.data) {
        setVerificationHistory(data.data);
      } else {
        // Set empty history if no data returned
        setVerificationHistory({
          currentStatus: null,
          history: [],
          listingId: listing.listing.id
        });
      }
    } catch (err) {
      console.error('Error fetching verification history:', err);
      // More specific error message based on the error type
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Network error. Please check your connection.');
      } else {
        setError(err.message || 'Failed to load verification history');
      }
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleUpdateVerification = async () => {
    if (!listing || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/listings/${listing.listing.id}/verification`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verificationStatus: selectedStatus,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update verification status');
      }

      toast({
        title: "Success",
        description: data.message,
      });

      // Refresh verification history
      await fetchVerificationHistory();
      
      // Callback to refresh parent component
      onVerificationUpdate?.();
      
      // Close dialog
      onOpenChange(false);

    } catch (err) {
      console.error('Error updating verification:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update verification status';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentStatusConfig = () => {
    const currentStatus = listing?.listing.listingVerificationStatus || 'unverified';
    return VERIFICATION_STATUS_CONFIG[currentStatus];
  };

  const getStatusConfig = (status: ListingVerificationStatus) => {
    return VERIFICATION_STATUS_CONFIG[status];
  };

  if (!listing) return null;

  const currentConfig = getCurrentStatusConfig();
  const CurrentStatusIcon = currentConfig.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Manage Listing Verification
          </DialogTitle>
          <DialogDescription>
            Update the verification status for "{listing.listing.listingTitleAnonymous}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Current Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Badge className={`${currentConfig.color} flex items-center gap-1`}>
                  <CurrentStatusIcon className={`h-3 w-3 ${currentConfig.iconColor}`} />
                  {currentConfig.label}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {currentConfig.description}
                </span>
              </div>
              
              {listing.listing.listingVerificationAt && (
                <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Last updated: {new Date(listing.listing.listingVerificationAt).toLocaleDateString()}
                  {listing.listing.listingVerificationNotes && (
                    <span className="ml-2">• {listing.listing.listingVerificationNotes}</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* New Status Selection */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">New Verification Status</label>
              <Select value={selectedStatus} onValueChange={(value: ListingVerificationStatus) => setSelectedStatus(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(VERIFICATION_STATUS_CONFIG).map(([value, config]) => {
                    const Icon = config.icon;
                    return (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${config.iconColor}`} />
                          <div>
                            <div className="font-medium">{config.label}</div>
                            <div className="text-xs text-muted-foreground">{config.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Admin Notes (Optional)</label>
              <Textarea
                placeholder="Add notes about this verification decision..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          {/* Verification History */}
          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Loading verification history...</span>
            </div>
          ) : verificationHistory?.history && verificationHistory.history.length > 0 ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Recent Verification Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {verificationHistory.history.slice(0, 5).map((action, index) => (
                    <div key={action.id} className="flex items-start gap-3 text-sm">
                      <div className="flex-shrink-0 mt-0.5">
                        {action.actionType === 'listing_verified' && <ShieldCheck className="h-3 w-3 text-green-600" />}
                        {action.actionType === 'listing_unverified' && <AlertTriangle className="h-3 w-3 text-gray-600" />}
                        {action.actionType === 'listing_verification_deactivated' && <ShieldX className="h-3 w-3 text-red-600" />}
                      </div>
                      <div className="flex-grow">
                        <div className="font-medium">
                          {action.actionType === 'listing_verified' && 'Verified'}
                          {action.actionType === 'listing_unverified' && 'Marked as Unverified'}
                          {action.actionType === 'listing_verification_deactivated' && 'Deactivated'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {action.adminNotes && <span>{action.adminNotes} • </span>}
                          {new Date(action.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : !isLoadingHistory && !error ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              No verification history available for this listing.
            </div>
          ) : null}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateVerification}
            disabled={isLoading || selectedStatus === (listing.listing.listingVerificationStatus || 'unverified')}
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Update Verification
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}