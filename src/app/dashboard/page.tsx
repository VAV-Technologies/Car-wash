'use client';

// Force dynamic rendering due to client-side interactivity
export const dynamic = 'force-dynamic'

import * as React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessageSquare, ShieldCheck, CheckCircle2, Eye, Search, LayoutDashboard, ExternalLink, User, Clock, AlertCircle, TrendingUp, Send, UserCircle, ListFilter, Inbox, UserCheck, ArrowRight, Loader2, RefreshCw, Timer, Verified, Settings } from "lucide-react";
import { NobridgeIcon } from "@/components/ui/nobridge-icon";
import { Progress } from "@/components/ui/progress";
import { VERIFICATION_CONFIG } from "@/lib/verification-config";
import { useBuyerDashboard } from "@/hooks/use-buyer-dashboard";
import { useVerificationRequest } from "@/hooks/use-verification-request";

// Helper to format timestamp
function FormattedTimestamp({ timestamp }: { timestamp: Date | string }) {
  const [formattedDate, setFormattedDate] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (timestamp) {
      const dateObj = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
      if (!isNaN(dateObj.getTime())) {
        setFormattedDate(dateObj.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' }));
      } else {
        setFormattedDate('Invalid Date');
      }
    } else {
      setFormattedDate('N/A');
    }
  }, [timestamp]);

  if (timestamp && !formattedDate) {
    return <span className="italic text-xs">Loading date...</span>;
  }
  return <>{formattedDate || 'N/A'}</>;
}

export default function BuyerDashboardPage() {
  const { user, stats, recentInquiries, verificationRequests, isLoading, error, refreshData } = useBuyerDashboard();
  const { canSubmitNewRequest } = useVerificationRequest();

  const getVerificationStatusInfo = () => {
    const pendingUserRequest = verificationRequests.find(r =>
      r.request_type === 'user_verification' &&
      ['New Request', 'Contacted', 'Docs Under Review', 'More Info Requested'].includes(r.status)
    );

    const isProfileOnboardingConsideredComplete = (user?.onboardingStepCompleted || 0) >= 2;

    switch (stats.verificationStatus) {
      case 'verified':
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
          status: 'Verified Buyer',
          description: 'Your profile has been verified by our team. Access full listings and connect with sellers.',
          badgeVariant: 'default' as const,
          badgeColor: 'bg-green-100 text-green-800 border-green-200',
          actionText: 'View Profile',
          actionLink: '/dashboard/profile',
          showButton: true,
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
            'Your profile verification is being reviewed by our team.',
          badgeVariant: 'outline' as const,
          badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          actionText: pendingUserRequest?.can_bump ? 'Bump Request' : (pendingUserRequest?.hours_until_can_bump && pendingUserRequest.hours_until_can_bump > 0) ? `Bump in ${VERIFICATION_CONFIG.formatTimeRemaining(pendingUserRequest.hours_until_can_bump)}` : 'View Status',
          actionLink: '/dashboard/verification',
          showButton: true,
          canBump: pendingUserRequest?.can_bump || false,
          hoursUntilBump: pendingUserRequest?.hours_until_can_bump || 0,
          progress: isProfileOnboardingConsideredComplete ? 80 : 50,
          progressColor: 'bg-yellow-500',
          progressText: isProfileOnboardingConsideredComplete ? 'Profile 80% Complete (Verification Pending)' : 'Onboarding Incomplete'
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
          actionLink: '/dashboard/verification',
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
          status: 'Anonymous Buyer',
          description: canSubmit.canSubmit ?
            'Get verified to build trust and access detailed listings.' :
            canSubmit.message || 'Verification request pending.',
          badgeVariant: 'outline' as const,
          badgeColor: 'bg-muted text-muted-foreground border-border',
          actionText,
          actionLink: '/dashboard/verification',
          showButton: true,
          disabled: !canSubmit.canSubmit,
          hoursRemaining: canSubmit.hoursRemaining || 0,
          progress: 60,
          progressColor: 'bg-primary',
          progressText: 'Profile 60% Complete (Verification Needed)'
        };
    }
  };

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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <div>
            <h2 className="text-xl font-semibold text-destructive">Authentication Required</h2>
            <p className="text-muted-foreground">Please log in to access your dashboard.</p>
            <Button asChild className="mt-4">
              <Link href="/auth/login">Login</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const verificationInfo = getVerificationStatusInfo();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-brand-dark-blue font-heading">
              Welcome back, {user.fullName}!
          </h1>
            <p className="text-muted-foreground">Here's an overview of your buyer activity.</p>
        </div>
        <Button variant="outline" asChild className="border-brand-dark-blue/50 text-brand-dark-blue hover:bg-brand-light-gray/70">
          <Link href="/marketplace">
            <Search className="mr-2 h-4 w-4" /> Explore Marketplace
          </Link>
        </Button>
      </div>

        {/* Verification Status Card */}
        <Card className={`mb-8 border-2 shadow-md ${
          stats.verificationStatus === 'verified' ? 'border-green-500/50 bg-green-500/5' :
          stats.verificationStatus === 'pending_verification' ? 'border-yellow-500/50 bg-yellow-500/5' :
          stats.verificationStatus === 'rejected' ? 'border-red-500/50 bg-red-500/5' :
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
                {stats.verificationStatus === 'verified' && <CheckCircle2 className="h-3 w-3 mr-1.5" />}
                {stats.verificationStatus === 'pending_verification' && <Clock className="h-3 w-3 mr-1.5" />}
                {stats.verificationStatus === 'rejected' && <AlertCircle className="h-3 w-3 mr-1.5" />}
                {stats.verificationStatus === 'anonymous' && <User className="h-3 w-3 mr-1.5" />}
                {verificationInfo.status}
              </Badge>
            </div>
          </CardHeader>

          {verificationInfo.showButton && (
            <CardContent className="pt-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1">
                  {(verificationInfo.hoursUntilBump !== undefined && verificationInfo.hoursUntilBump > 0) && (
                    <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
                      <Timer className="h-3.5 w-3.5" />
                      <span>
                        Can bump request in {VERIFICATION_CONFIG.formatTimeRemaining(verificationInfo.hoursUntilBump)}
                      </span>
                    </div>
                  )}
                  <div className="space-y-3 mt-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{verificationInfo.progressText}</span>
                      <span className="text-muted-foreground">{verificationInfo.progress}%</span>
                    </div>
                    <Progress value={verificationInfo.progress} className={`[&>div]:${verificationInfo.progressColor} bg-muted`} />
                  </div>
                </div>

                {stats.verificationStatus === 'anonymous' || stats.verificationStatus === 'rejected' ? (
                  <Link href={verificationInfo.actionLink}>
                    <Button
                      size="sm"
                      disabled={verificationInfo.disabled}
                      className={`
                        ${!verificationInfo.disabled ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
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
                ) : stats.verificationStatus === 'pending_verification' ? (
                  <Link href={verificationInfo.actionLink}>
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
                ) : stats.verificationStatus === 'verified' ? (
                  <Link href={verificationInfo.actionLink}>
                    <Button size="sm" variant="outline">
                      <UserCircle className="h-4 w-4 mr-2" />
                      {verificationInfo.actionText}
                    </Button>
                  </Link>
                ) : null}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Inquiries</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-semibold">{stats.activeInquiriesCount}</div>
              <p className="text-xs text-muted-foreground">
                Inquiries awaiting response
              </p>
          </CardContent>
        </Card>



          <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Messages</CardTitle>
              <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-semibold">{stats.newMessagesCount}</div>
              <p className="text-xs text-muted-foreground">
                Unread conversations
              </p>
          </CardContent>
        </Card>
      </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Inquiries */}
          <Card className="shadow-lg">
          <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Recent Inquiries
                </CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/inquiries">
                    View All
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </Link>
                </Button>
              </div>
          </CardHeader>
            <CardContent>
              {recentInquiries.length > 0 ? (
                <div className="space-y-4">
                  {recentInquiries.map((inquiry) => (
                    <div key={inquiry.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{inquiry.listingTitle}</h4>
                        <p className="text-xs text-muted-foreground">
                          Status: {inquiry.statusBuyerPerspective}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <FormattedTimestamp timestamp={inquiry.inquiryTimestamp} />
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/inquiries`}>
                          <Eye className="h-4 w-4" />
                    </Link>
                      </Button>
                  </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No inquiries yet</p>
                  <p className="text-sm">Start exploring listings to make your first inquiry!</p>
                </div>
            )}
          </CardContent>
        </Card>

          {/* Quick Actions */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/marketplace">
                    <Search className="mr-2 h-4 w-4" />
                    Browse Marketplace
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/dashboard/inquiries">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Manage Inquiries{stats.activeInquiriesCount > 0 ? ` (${stats.activeInquiriesCount})` : ''}
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/dashboard/profile">
                    <UserCircle className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Link>
                </Button>
              </div>
            </CardContent>
        </Card>
      </div>
                    </div>
    </div>
  );
}
