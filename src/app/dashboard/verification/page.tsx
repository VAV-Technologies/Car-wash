'use client';

// Force dynamic rendering due to client-side interactivity
export const dynamic = 'force-dynamic'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, CheckCircle2, Loader2, Mail, AlertCircle } from "lucide-react";
import { useState, Suspense } from "react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useVerificationRequest } from "@/hooks/use-verification-request";

// Fallback if Suspense is not wrapping this page for searchParams
function BuyerVerificationContent() {
  const { toast } = useToast();
  const { user, profile, loading: isLoadingUser } = useCurrentUser();
  const {
    requests,
    currentStatus: userProfileVerificationStatus,
    isLoading: isLoadingRequests,
    bumpRequest,
    refreshRequests
  } = useVerificationRequest();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoading = isLoadingUser || isLoadingRequests;

  const handleBump = async (requestId: string, reason?: string) => {
    const success = await bumpRequest(requestId, reason, () => {
      refreshRequests(); // Refresh after successful bump
    });
    return success;
  };

  const handleRequestVerification = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // 🔒 TRUST MIDDLEWARE: If we're here, user is authenticated
    // Only validate that we have the necessary data, don't block on auth checks
    if (!profile?.phone_number) {
      toast({
        title: "Phone Number Required",
        description: "Please add a phone number to your profile before requesting verification.",
        variant: "destructive"
      });
      return;
    }

    const formData = new FormData(event.currentTarget);
    const bestTimeToCall = formData.get('bestTimeToCall') as string;
    const notes = formData.get('notes') as string;

    setIsSubmitting(true);

    try {
      const requestData = {
        request_type: 'user_verification',
        reason: 'Buyer profile verification request',
        phone_number: profile?.phone_number || '', // Use phone number from profile
        best_time_to_call: bestTimeToCall,
        user_notes: notes
      };

      const response = await fetch('/api/verification/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: "Verification Request Submitted",
          description: "Our team has received your request and will contact you soon.",
        });

        // Refresh verification requests to show updated status
        refreshRequests();
      } else {
        throw new Error(result.error || 'Failed to submit verification request');
      }
    } catch (error) {
      console.error('Verification request error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit verification request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🚀 GRACEFUL LOADING: Show loading state while auth context initializes
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Loading verification status...</p>
      </div>
    );
  }

  // 🔒 TRUST MIDDLEWARE: Only handle genuine data loading issues
  // If middleware allowed access, user is authenticated as buyer
  if (!profile && !isLoadingUser) {
    return (
      <div className="space-y-8 text-center max-w-md mx-auto">
        <AlertCircle className="h-16 w-16 text-amber-500 mx-auto" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Profile Loading Issue</h1>
          <p className="text-muted-foreground mt-2">
            We're having trouble loading your profile data. This is usually temporary.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button onClick={() => window.location.reload()} className="w-full">
            Refresh Page
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  // 🛡️ ROLE VALIDATION: Only validate role if we have profile data
  if (profile && profile.role !== 'buyer') {
     return (
      <div className="space-y-8 text-center max-w-md mx-auto">
        <AlertCircle className="h-16 w-16 text-amber-500 mx-auto" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Incorrect Role</h1>
          <p className="text-muted-foreground mt-2">
            This is the buyer verification page. Your current role: {profile.role}
          </p>
        </div>
        <Button asChild className="w-full">
          <Link href={profile.role === 'seller' ? '/seller-dashboard' : '/dashboard'}>
            Go to {profile.role === 'seller' ? 'Seller' : 'Main'} Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  // Check if user has a pending verification request
  const hasPendingRequest = requests.some((r: any) =>
    r.request_type === 'user_verification' &&
    ['New Request', 'Contacted', 'Docs Under Review', 'More Info Requested'].includes(r.status)
  );

      const renderStatusCard = () => {
    // If user already has a pending request, show pending status
    if (hasPendingRequest || userProfileVerificationStatus === 'pending_verification') {
      const pendingRequest = requests.find((r: any) =>
        ['New Request', 'Contacted', 'Docs Under Review', 'More Info Requested'].includes(r.status)
      );

      return (
        <Card className="shadow-lg bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Mail className="h-7 w-7" /> Verification Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-600 dark:text-blue-400">
              Your verification request has been submitted and is currently {pendingRequest?.status.toLowerCase() || 'being processed'}.
              Our team will contact you at the phone number provided.
            </p>
            {pendingRequest?.best_time_to_call && (
              <p className="text-sm text-blue-500 dark:text-blue-300 mt-2">
                Best time to call: {pendingRequest.best_time_to_call}
              </p>
            )}
          </CardContent>
        </Card>
      );
    }

    // If user is already verified
    if (userProfileVerificationStatus === 'verified') {
      return (
        <Card className="shadow-lg bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle2 className="h-7 w-7" /> You are a Verified Buyer!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-600 dark:text-green-400">
              Congratulations! Your buyer profile is fully verified.
              You now have access to all platform features and can view complete listing details.
            </p>
          </CardContent>
        </Card>
      );
    }

    // Show verification form for anonymous or rejected users
    return renderVerificationForm();
  };

    const renderVerificationForm = () => (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-7 w-7 text-primary" /> Become a Verified Buyer
        </CardTitle>
        <CardDescription>
          Unlock full platform access and build trust. Verified buyers gain access to detailed listings and seller contact information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRequestVerification} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <FormItemDisabled label="Full Name" value={profile?.full_name} />
            <FormItemDisabled label="Email" value={profile?.email || user?.email} />
            <FormItemDisabled label="Phone Number" value={profile?.phone_number} />
          </div>

          {!profile?.phone_number && (
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
              <CardContent className="pt-4">
                <p className="text-amber-800 dark:text-amber-200 text-sm">
                  <strong>Phone number required:</strong> Please add a phone number to your profile before requesting verification.
                </p>
                <Button asChild variant="outline" size="sm" className="mt-2">
                  <Link href="/dashboard/profile">Update Profile</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <div>
            <Label htmlFor="bestTimeToCall">Best Time to Call (Optional)</Label>
            <Input
              id="bestTimeToCall"
              name="bestTimeToCall"
              placeholder="e.g., Weekdays 2-4 PM SGT"
            />
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Any additional information you'd like to share..."
              rows={3}
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !profile?.phone_number}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting Request...
              </>
            ) : (
              <>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Request Verification
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );

    return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight">Buyer Verification</h1>
          <p className="text-xl text-muted-foreground">
            Get verified to unlock full marketplace access and build trust with sellers.
          </p>
        </div>

        {renderStatusCard()}
      </div>
      </div>
    );
  }

// Helper component for disabled form fields
function FormItemDisabled({ label, value }: { label: string; value?: string }) {
    return (
    <div>
      <Label className="text-sm font-medium">{label}</Label>
      <Input
        value={value || 'Not provided'}
        disabled
        className="bg-muted text-muted-foreground"
      />
    </div>
  );
}

export default function BuyerVerificationPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary"/> Loading...</div>}>
      <BuyerVerificationContent />
    </Suspense>
  );
}
