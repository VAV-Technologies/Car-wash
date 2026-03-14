
'use client'

// Force dynamic rendering due to client-side interactivity
export const dynamic = 'force-dynamic'

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  User,
  FileText,
  MessageSquare,
  PlusCircle,
  ExternalLink,
  BarChart3,
  Verified,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Timer,
  TrendingUp,
  ShieldCheck,
  Eye,
  Send
} from 'lucide-react';
import { useSellerDashboard } from '@/hooks/use-seller-dashboard';
import { useVerificationRequest } from '@/hooks/use-verification-request';
import { VERIFICATION_CONFIG } from '@/lib/verification-config';
import React from 'react';
import { NobridgeIcon } from '@/components/ui/nobridge-icon';

export default function SellerDashboard() {
  const { user, stats, recentListings, isLoading, error, refreshData, isPolling } = useSellerDashboard();
  const { requests: verificationRequests, currentStatus: verificationStatus, canSubmitNewRequest } = useVerificationRequest();

  const [isSubmittingVerification, setIsSubmittingVerification] = React.useState(false);

  const handleDirectVerificationRequest = async () => {
    setIsSubmittingVerification(true);

    try {
      const response = await fetch('/api/verification/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          request_type: 'user_verification',
          reason: 'MVP verification request - streamlined process for immediate verification'
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        await refreshData();
        console.log('✅ Verification approved instantly:', result.message);
      } else {
        console.error('❌ Verification request failed:', result.error || result.message);
      }
    } catch (error) {
      console.error('❌ Network error during verification request:', error);
    } finally {
      setIsSubmittingVerification(false);
    }
  };

  const getVerificationStatusInfo = () => {
    const pendingUserRequest = verificationRequests.find(r =>
      r.request_type === 'user_verification' &&
      ['New Request', 'Contacted', 'Docs Under Review', 'More Info Requested'].includes(r.status)
    );

    switch (verificationStatus) {
      case 'verified':
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
          status: 'Verified Seller',
          description: 'Your profile has been verified by our team.',
          badgeVariant: 'default' as const,
          badgeColor: 'bg-green-100 text-green-800 border-green-200',
          actionText: 'Manage Verification',
          showButton: false,
          progress: 100,
          progressColor: 'bg-green-500',
          progressText: 'Profile 100% Verified & Optimized!'
        };
      case 'pending_verification':
        return {
          icon: <Clock className="h-5 w-5 text-yellow-600" />,
          status: 'Verification Pending',
          description: pendingUserRequest ?
            `Your verification request is ${pendingUserRequest.status.toLowerCase()}. ${pendingUserRequest.can_bump ? 'You can bump it to the top!' : (pendingUserRequest.hours_until_can_bump && pendingUserRequest.hours_until_can_bump > 0) ? `You can bump it in ${VERIFICATION_CONFIG.formatTimeRemaining(pendingUserRequest.hours_until_can_bump)}.` : ''}` :
            'Your profile verification is being reviewed.',
          badgeVariant: 'outline' as const,
          badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          actionText: pendingUserRequest?.can_bump ? 'Bump Request' : (pendingUserRequest?.hours_until_can_bump && pendingUserRequest.hours_until_can_bump > 0) ? `Bump in ${VERIFICATION_CONFIG.formatTimeRemaining(pendingUserRequest.hours_until_can_bump)}` : 'View Status',
          showButton: true,
          canBump: pendingUserRequest?.can_bump || false,
          hoursUntilBump: pendingUserRequest?.hours_until_can_bump || 0,
          progress: 80,
          progressColor: 'bg-yellow-500',
          progressText: 'Profile 80% Complete (Verification Pending)'
        };
      case 'rejected':
        const canSubmitAfterRejection = canSubmitNewRequest('user_verification');
        let rejectedActionText = 'Request Verification Again';
        if (!canSubmitAfterRejection.canSubmit) {
          if (canSubmitAfterRejection.hoursRemaining && canSubmitAfterRejection.hoursRemaining > 0) {
            rejectedActionText = `Available in ${VERIFICATION_CONFIG.formatTimeRemaining(canSubmitAfterRejection.hoursRemaining)}`;
          } else {
            rejectedActionText = 'Request Pending';
          }
        }

        return {
          icon: <AlertCircle className="h-5 w-5 text-red-600" />,
          status: 'Verification Rejected',
          description: canSubmitAfterRejection.canSubmit ?
            'Your previous verification was rejected. You can submit a new request with additional information.' :
            canSubmitAfterRejection.message || 'Previous verification rejected. You can resubmit after the cooldown period.',
          badgeVariant: 'outline' as const,
          badgeColor: 'bg-red-100 text-red-800 border-red-200',
          actionText: rejectedActionText,
          showButton: true,
          disabled: !canSubmitAfterRejection.canSubmit,
          hoursRemaining: canSubmitAfterRejection.hoursRemaining || 0,
          progress: 40,
          progressColor: 'bg-red-500',
          progressText: 'Profile Needs Attention (Verification Rejected)'
        };
      default: // anonymous
        const canSubmit = canSubmitNewRequest('user_verification');
        let actionText = 'Request Verification';
        if (!canSubmit.canSubmit) {
          if (canSubmit.hoursRemaining && canSubmit.hoursRemaining > 0) {
            actionText = `Available in ${VERIFICATION_CONFIG.formatTimeRemaining(canSubmit.hoursRemaining)}`;
          } else {
            actionText = 'Request Pending';
          }
        }

        return {
          icon: <User className="h-5 w-5 text-muted-foreground" />,
          status: 'Anonymous Seller',
          description: canSubmit.canSubmit ?
            'Get verified to build trust and increase visibility.' :
            canSubmit.message || 'Verification request pending.',
          badgeVariant: 'outline' as const,
          badgeColor: 'bg-muted text-muted-foreground border-border',
          actionText,
          showButton: true,
          disabled: !canSubmit.canSubmit,
          hoursRemaining: canSubmit.hoursRemaining || 0,
          progress: 60,
          progressColor: 'bg-primary',
          progressText: 'Profile 60% Complete (Verification Needed)'
        };
    }
  };

  const verificationInfo = getVerificationStatusInfo();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <div>
            <h2 className="text-xl font-semibold text-destructive">Error Loading Dashboard</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={refreshData} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-foreground font-heading">Seller Dashboard</h1>
            <div className="text-muted-foreground mt-1">
              Welcome back, {user?.fullName || 'User'}!
            </div>
          </div>
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${isPolling && !isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Verification Status Card */}
         <Card className={`mb-8 border-2 shadow-md ${
          verificationStatus === 'verified' ? 'border-green-500/50 bg-green-500/5' :
          verificationStatus === 'pending_verification' ? 'border-yellow-500/50 bg-yellow-500/5' :
          verificationStatus === 'rejected' ? 'border-red-500/50 bg-red-500/5' :
          'border-border bg-card'
        }`}>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {verificationInfo.icon}
                <div>
                  <CardTitle className="text-lg text-foreground">{verificationInfo.status}</CardTitle>
                  <CardDescription className="mt-1 text-sm">
                    {verificationInfo.description}
                  </CardDescription>
                </div>
              </div>
              <Badge variant={verificationInfo.badgeVariant} className={`${verificationInfo.badgeColor} text-xs py-1 px-2.5`}>
                {verificationStatus === 'verified' && <Verified className="h-3 w-3 mr-1.5" />}
                {verificationStatus === 'pending_verification' && <Clock className="h-3 w-3 mr-1.5" />}
                {verificationStatus === 'rejected' && <AlertCircle className="h-3 w-3 mr-1.5" />}
                {verificationStatus === 'anonymous' && <User className="h-3 w-3 mr-1.5" />}
                {verificationInfo.status}
              </Badge>
            </div>
          </CardHeader>

          {verificationInfo.showButton && (
            <CardContent className="pt-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1">
                  {(verificationInfo.hoursRemaining !== undefined && verificationInfo.hoursRemaining > 0) && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Timer className="h-3.5 w-3.5" />
                      <span>
                        Cooldown: {VERIFICATION_CONFIG.formatTimeRemaining(verificationInfo.hoursRemaining)} remaining
                      </span>
                    </div>
                  )}
                  {(verificationInfo.hoursUntilBump !== undefined && verificationInfo.hoursUntilBump > 0) && (
                    <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
                      <Timer className="h-3.5 w-3.5" />
                      <span>
                        Can bump request in {VERIFICATION_CONFIG.formatTimeRemaining(verificationInfo.hoursUntilBump)}
                      </span>
                    </div>
                  )}
                </div>

                {verificationStatus === 'anonymous' || verificationStatus === 'rejected' ? (
                  <Link href="/seller-dashboard/verification">
                    <Button
                      size="sm"
                      disabled={verificationInfo.disabled}
                      className={`
                        ${!verificationInfo.disabled ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}
                        ${verificationInfo.disabled ?
                          "bg-muted text-muted-foreground border-border opacity-60 cursor-not-allowed hover:bg-muted" : ""
                        }
                      `}
                    >
                      {verificationInfo.disabled ? (
                        <>
                          <Timer className="h-4 w-4 mr-2" />
                          {verificationInfo.actionText}
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          {verificationInfo.actionText}
                        </>
                      )}
                    </Button>
                  </Link>
                ) : verificationStatus === 'pending_verification' ? (
                  <Link href="/seller-dashboard/verification">
                    <Button
                      size="sm"
                      variant={verificationInfo.canBump ? "default" : "secondary"}
                      className={`
                        ${verificationInfo.canBump ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                      `}
                    >
                      {verificationInfo.canBump ? (
                        <>
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Bump to Top
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          {verificationInfo.actionText}
                        </>
                      )}
                    </Button>
                  </Link>
                ) : null}
              </div>
            </CardContent>
          )}
        </Card>


        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-md bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Active Listings</CardTitle>
              <NobridgeIcon icon="business-listing" size="sm" className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-primary">{stats.activeListingsCount}</div>
              <p className="text-xs text-muted-foreground">
                Listings currently visible to buyers
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Total Inquiries</CardTitle>
              <NobridgeIcon icon="interaction" size="sm" className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-primary">{stats.totalInquiriesReceived}</div>
              <p className="text-xs text-muted-foreground">
                All-time inquiries received
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Awaiting Response</CardTitle>
              <NobridgeIcon icon="verification" size="sm" className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-destructive">{stats.inquiriesAwaitingEngagement}</div>
              <p className="text-xs text-muted-foreground">
                New inquiries needing attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-md bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground font-heading">
                <NobridgeIcon icon="core-details" size="md" className="text-accent" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/seller-dashboard/listings/create">
                <Button className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create New Listing
                </Button>
              </Link>
              <Link href="/seller-dashboard/inquiries">
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  View All Inquiries{stats.totalInquiriesReceived > 0 ? ` (${stats.totalInquiriesReceived})` : ''}
                </Button>
              </Link>
              <Link href="/seller-dashboard/settings">
                <Button variant="outline" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Account Settings
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-md bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground font-heading">
                <NobridgeIcon icon="growth" size="md" className="text-accent" />
                Profile Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground">{verificationInfo.progressText}</span>
                  <span className={`font-medium ${verificationStatus === 'verified' ? 'text-green-600' : verificationStatus === 'pending_verification' ? 'text-yellow-600' : verificationStatus === 'rejected' ? 'text-red-600' : 'text-primary'}`}>
                    {verificationInfo.progress}%
                  </span>
                </div>
                <Progress value={verificationInfo.progress} className={`[&>div]:${verificationInfo.progressColor} bg-muted`} />
                <p className="text-xs text-muted-foreground">
                  {verificationStatus === 'verified'
                    ? 'Your profile is fully verified and optimized for maximum trust.'
                    : verificationStatus === 'pending_verification'
                    ? 'Your verification is pending. Verified profiles get more inquiries.'
                    : verificationStatus === 'rejected'
                    ? 'Action required. Update your information to complete verification.'
                    : 'Complete verification to increase buyer trust and inquiry rates.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Listings */}
        <Card className="shadow-md bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-foreground font-heading">
              <NobridgeIcon icon="transactions" size="md" className="text-accent" />
              Recent Listings
            </CardTitle>
            <Link href="/seller-dashboard/listings">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentListings.length > 0 ? (
              <div className="space-y-4">
                {recentListings.map((listing) => (
                  <div key={listing.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{listing.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {listing.status.replace('_', ' ')}
                        </Badge>
                        {listing.asking_price && (
                          <span className="text-sm text-muted-foreground">
                            ${listing.asking_price.toLocaleString()}
                          </span>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {listing.inquiry_count || 0} inquiries
                        </span>
                      </div>
                    </div>
                    <Link href={`/seller-dashboard/listings/${listing.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2 text-foreground">No listings yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first listing to start connecting with buyers.
                </p>
                <Link href="/seller-dashboard/listings/create">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Your First Listing
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

