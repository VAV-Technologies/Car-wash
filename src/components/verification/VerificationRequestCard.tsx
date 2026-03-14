'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Clock, CheckCircle, XCircle, Lock, Unlock, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface VerificationRequest {
  id: string;
  status: string;
  reason: string;
  bump_count: number;
  last_bump_time?: string;
  created_at: string;
  updated_at: string;
  can_bump: boolean;
  hours_until_can_bump: number;
  is_pending: boolean;
  bump_enabled: boolean;
  bump_disabled_reason?: string;
  admin_locked_at?: string;
  admin_lock_reason?: string;
  user_notes?: string;
  listings?: {
    listing_title_anonymous: string;
    status: string;
  };
}

interface VerificationRequestCardProps {
  request: VerificationRequest;
  onBump: (requestId: string, reason?: string) => Promise<boolean>;
  isProcessing?: boolean;
}

export default function VerificationRequestCard({
  request,
  onBump,
  isProcessing = false
}: VerificationRequestCardProps) {
  const [bumpReason, setBumpReason] = useState('');
  const [isSubmittingBump, setIsSubmittingBump] = useState(false);
  const [showBumpForm, setShowBumpForm] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'Docs Under Review':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'More Info Requested':
        return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      case 'Contacted':
        return <MessageSquare className="h-4 w-4 text-purple-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Docs Under Review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'More Info Requested':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Contacted':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-brand-dark-blue border-gray-200';
    }
  };

  const getBumpButtonText = () => {
    if (!request.bump_enabled) {
      return 'Bump Disabled';
    }
    if (request.admin_locked_at) {
      return 'Admin Reviewing';
    }
    if (!request.can_bump && request.hours_until_can_bump > 0) {
      const hours = Math.ceil(request.hours_until_can_bump);
      return `Wait ${hours}h`;
    }
    if (request.bump_count === 0) {
      return 'Bump to Top';
    }
    return `Bump Again (${request.bump_count + 1})`;
  };

  const getBumpDisabledMessage = () => {
    if (!request.bump_enabled && request.bump_disabled_reason) {
      return request.bump_disabled_reason;
    }
    if (request.admin_locked_at && request.admin_lock_reason) {
      return request.admin_lock_reason;
    }
    if (!request.can_bump && request.hours_until_can_bump > 0) {
      const hours = Math.ceil(request.hours_until_can_bump);
      return `You can bump your request in ${hours} hour${hours > 1 ? 's' : ''}`;
    }
    return null;
  };

  const handleBumpSubmit = async () => {
    setIsSubmittingBump(true);
    try {
      const success = await onBump(request.id, bumpReason.trim() || undefined);
      if (success) {
        setBumpReason('');
        setShowBumpForm(false);
      }
    } finally {
      setIsSubmittingBump(false);
    }
  };

  const showBumpButton = request.is_pending && (request.bump_enabled || request.can_bump);
  const disabledMessage = getBumpDisabledMessage();

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(request.status)}
            <CardTitle className="text-lg">
              {request.listings?.listing_title_anonymous || 'User Verification'}
            </CardTitle>
          </div>
          <Badge variant="outline" className={getStatusColor(request.status)}>
            {request.status}
          </Badge>
        </div>

        {request.bump_count > 0 && (
          <CardDescription className="flex items-center gap-1">
            <span className="font-medium text-amber-600">
              Bumped {request.bump_count} time{request.bump_count > 1 ? 's' : ''}
            </span>
            {request.last_bump_time && (
              <span className="text-muted-foreground">
                • Last bump {formatDistanceToNow(new Date(request.last_bump_time), { addSuffix: true })}
              </span>
            )}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Admin Lock Status */}
        {request.admin_locked_at && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-800">
              <Lock className="h-4 w-4" />
              <span className="font-medium">Admin Review in Progress</span>
            </div>
            <p className="text-blue-700 text-sm mt-1">
              {request.admin_lock_reason || 'An admin is currently reviewing your documents'}
            </p>
          </div>
        )}

        {/* Bump Disabled Status */}
        {!request.bump_enabled && request.bump_disabled_reason && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-brand-dark-blue">
              <Lock className="h-4 w-4" />
              <span className="font-medium">Bumping Temporarily Disabled</span>
            </div>
            <p className="text-gray-700 text-sm mt-1">
              {request.bump_disabled_reason}
            </p>
          </div>
        )}

        {/* Request Details */}
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium text-muted-foreground">Submitted:</span>
            <span className="ml-2">
              {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
            </span>
          </div>

          {request.user_notes && (
            <div className="text-sm">
              <span className="font-medium text-muted-foreground">Your Message:</span>
              <p className="mt-1 text-brand-dark-blue bg-gray-50 p-2 rounded border">
                {request.user_notes}
              </p>
            </div>
          )}

          {request.reason && request.reason !== request.user_notes && (
            <div className="text-sm">
              <span className="font-medium text-muted-foreground">Original Reason:</span>
              <p className="mt-1 text-brand-dark-blue">
                {request.reason}
              </p>
            </div>
          )}
        </div>

        <Separator />

        {/* Bump Section */}
        {showBumpButton ? (
          <div className="space-y-3">
            {!showBumpForm ? (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Want to prioritize your request?
                </div>
                <Button
                  onClick={() => setShowBumpForm(true)}
                  disabled={!request.can_bump || isProcessing}
                  variant={request.can_bump ? "default" : "secondary"}
                  size="sm"
                >
                  {getBumpButtonText()}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm font-medium">Add a note (optional):</div>
                <Textarea
                  placeholder="Let us know if there's anything specific you'd like us to review..."
                  value={bumpReason}
                  onChange={(e) => setBumpReason(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleBumpSubmit}
                    disabled={isSubmittingBump || !request.can_bump}
                    size="sm"
                  >
                    {isSubmittingBump ? 'Bumping...' : getBumpButtonText()}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowBumpForm(false);
                      setBumpReason('');
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {disabledMessage && (
              <div className="text-sm text-muted-foreground bg-gray-50 p-2 rounded border">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  {disabledMessage}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            {request.status === 'Approved'
              ? '✅ Verification completed successfully!'
              : request.status === 'Rejected'
              ? '❌ Request was rejected - you can submit a new request with updated information'
              : '⏳ Your request is being processed'
            }
          </div>
        )}
      </CardContent>
    </Card>
  );
}
