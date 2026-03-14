'use client';

// Force dynamic rendering due to client-side interactivity
export const dynamic = 'force-dynamic'

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Clock, XCircle, AlertCircle, Loader2, Shield, FileText, Building, RefreshCw } from 'lucide-react';
import { Suspense } from 'react';
import Link from 'next/link';

// Import our new TanStack Query hooks
import { useCurrentUser } from '@/hooks/queries/use-user-data';
import { useVerificationRequest } from '@/hooks/queries/use-verification-data';

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-muted animate-pulse rounded-md" />
      <Card>
        <CardHeader>
          <div className="h-6 bg-muted animate-pulse rounded-md w-1/3" />
          <div className="h-4 bg-muted animate-pulse rounded-md w-2/3" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded-md w-1/4" />
              <div className="h-9 bg-muted animate-pulse rounded-md" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// Error fallback component
function ErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Something went wrong
        </CardTitle>
        <CardDescription>
          {error.message || 'Failed to load verification data'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={retry} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}

// Form field component with proper loading state
function FormField({ label, value, isLoading, placeholder }: {
  label: string;
  value?: string;
  isLoading?: boolean;
  placeholder?: string;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-4 bg-muted animate-pulse rounded-md w-1/4" />
        <div className="h-9 bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  const displayValue = value || '';
  const placeholderText = placeholder || `Your ${label.toLowerCase()}`;

  return (
    <div className="space-y-2">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <Input
        value={displayValue}
        disabled
        className="bg-muted/50"
        placeholder={!displayValue ? placeholderText : undefined}
      />
    </div>
  );
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return { icon: CheckCircle, className: 'bg-green-50 text-green-700 border-green-200', label: 'Approved' };
      case 'pending':
        return { icon: Clock, className: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: 'Pending Review' };
      case 'rejected':
        return { icon: XCircle, className: 'bg-red-50 text-red-700 border-red-200', label: 'Rejected' };
      default:
        return { icon: AlertCircle, className: 'bg-gray-50 text-gray-700 border-gray-200', label: 'Not Submitted' };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={config.className}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}

// Main verification content component
function VerificationContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Use our new TanStack Query hooks
  const { user, profile, loading: isLoadingUser, error: userError, refetch: refetchUser } = useCurrentUser();
  const { requests, currentStatus, isLoading: isLoadingRequests, error: requestsError, refetch: refetchRequests } = useVerificationRequest();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationType, setVerificationType] = useState<'profile' | 'listing'>('profile');
  const [selectedListingId, setSelectedListingId] = useState<string | undefined>(searchParams.get('listingId') || undefined);

  // Combined loading state
  const isLoading = isLoadingUser || isLoadingRequests;

  // Combined error state
  const error = userError || requestsError;

  // Handle errors
  if (error && !isLoading) {
    return (
      <ErrorFallback
        error={error as Error}
        retry={() => {
          refetchUser();
          refetchRequests();
        }}
      />
    );
  }

  // Handle loading state
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Handle unauthenticated state
  if (!user || !profile) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Authentication Required</CardTitle>
          <CardDescription>Please log in to access verification.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Check if user has a pending verification request
  const hasPendingRequest = requests.some((r: any) =>
    ['New Request', 'Contacted', 'Docs Under Review', 'More Info Requested'].includes(r.status)
  );

  // If user already has a pending request, show pending status
  if (hasPendingRequest || currentStatus === 'pending_verification') {
    const pendingRequest = requests.find((r: any) =>
      ['New Request', 'Contacted', 'Docs Under Review', 'More Info Requested'].includes(r.status)
    );

    return (
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Seller Verification</h1>
            <p className="text-muted-foreground">
              Get verified to build trust with potential buyers and access premium features.
            </p>
          </div>
          <StatusBadge status="pending" />
        </div>

        <Card className="shadow-lg bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Clock className="h-7 w-7" /> Verification Pending
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
            {pendingRequest?.user_notes && (
              <div className="mt-3">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Your notes:</p>
                <p className="text-sm text-blue-500 dark:text-blue-300 mt-1">{pendingRequest.user_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user is already verified
  if (currentStatus === 'verified') {
    return (
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Seller Verification</h1>
            <p className="text-muted-foreground">
              You are a verified seller with full platform access.
            </p>
          </div>
          <StatusBadge status="approved" />
        </div>

        {/* Verification Success Card */}
        <Card className="shadow-lg bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle className="h-7 w-7" /> You are a Verified Seller!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-green-600 dark:text-green-400">
              Congratulations! Your seller profile is fully verified.
              You can now create verified listings that will display full details to buyers.
            </p>

            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4">
              <h4 className="font-medium text-green-700 dark:text-green-300 mb-2">Verification Benefits:</h4>
              <ul className="text-sm text-green-600 dark:text-green-400 space-y-1">
                <li>• Create listings with full business details visible to buyers</li>
                <li>• Higher visibility in search results</li>
                <li>• Verified badge on all your listings</li>
                <li>• Access to premium seller features</li>
                <li>• Direct buyer inquiries and messaging</li>
              </ul>
            </div>

            <div className="flex gap-3 pt-2">
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link href="/seller-dashboard/listings/create">
                  Create Your First Listing
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                <Link href="/seller-dashboard/listings">
                  View My Listings
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Verification History */}
        {requests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Verification History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {requests.map((request: any, index: number) => (
                  <div key={request.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {request.verification_type === 'profile' ? 'Profile Verification' : 'Listing Verification'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Submitted {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={request.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

     const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setIsSubmitting(true);

     try {
       const formData = new FormData(e.currentTarget as HTMLFormElement);
       const bestTimeToCall = formData.get('bestTimeToCall') as string;
       const notes = formData.get('notes') as string;

       const requestData = {
         request_type: verificationType === 'profile' ? 'user_verification' : 'listing_verification',
         listing_id: verificationType === 'listing' ? selectedListingId : undefined,
         reason: verificationType === 'profile'
           ? 'Seller profile verification request'
           : `Listing verification request for listing ID: ${selectedListingId}`,
         phone_number: profile?.phone_number || '',
         best_time_to_call: bestTimeToCall,
         user_notes: notes
       };

       const response = await fetch('/api/verification/request', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(requestData),
       });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit verification request');
      }

             toast({
         title: 'Verification Request Submitted',
         description: 'Our team has received your request and will contact you soon.',
       });

       // Refetch verification data to show updated status
       refetchRequests();
    } catch (error) {
      console.error('Verification submission error:', error);
      toast({
        title: 'Submission Failed',
        description: error instanceof Error ? error.message : 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Seller Verification</h1>
          <p className="text-muted-foreground">
            Get verified to build trust with potential buyers and access premium features.
          </p>
        </div>
        <StatusBadge status={currentStatus || 'not_submitted'} />
      </div>

      {/* Current Status Card */}
      {requests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Verification Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requests.map((request: any, index: number) => (
                <div key={request.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">
                      {request.verification_type === 'profile' ? 'Profile Verification' : 'Listing Verification'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Submitted {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={request.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

             {/* Verification Form */}
       <Card>
         <CardContent className="space-y-6 pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Building className="h-4 w-4" />
                Profile Information
              </h3>
              <Separator />

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField
                   label="Full Name"
                   value={profile.full_name}
                   placeholder="Your full name"
                 />
                 <FormField
                   label="Email"
                   value={user.email}
                   placeholder="Your email address"
                 />
                 <FormField
                   label="Phone Number"
                   value={profile.phone_number}
                   placeholder="Your phone number"
                 />
                 {/* Only show company field if we have company data */}
                 {(profile.company_name || profile.initial_company_name || profile.company) && (
                   <FormField
                     label="Company"
                     value={profile.company_name || profile.initial_company_name || profile.company}
                     placeholder="Your company name"
                   />
                 )}
               </div>
            </div>

            {/* Verification Type */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Verification Type</h3>
              <Separator />

              <RadioGroup
                value={verificationType}
                onValueChange={(value: 'profile' | 'listing') => setVerificationType(value)}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2 p-4 border rounded-lg">
                  <RadioGroupItem value="profile" id="profile" />
                  <div className="flex-1">
                    <Label htmlFor="profile" className="font-medium">Profile Verification</Label>
                    <p className="text-sm text-muted-foreground">Verify your identity and business information</p>
                  </div>
                </div>
                                 <div className="flex items-center space-x-2 p-4 border rounded-lg opacity-50">
                   <RadioGroupItem value="listing" id="listing" disabled />
                   <div className="flex-1">
                     <Label htmlFor="listing" className="font-medium text-muted-foreground">Listing Verification</Label>
                     <p className="text-sm text-muted-foreground">Coming soon - verify a specific business listing</p>
                   </div>
                 </div>
              </RadioGroup>
            </div>

                         {/* Listing Selection - Disabled for now */}
             {verificationType === 'listing' && (
               <div className="space-y-4 opacity-50">
                 <h3 className="text-lg font-medium text-muted-foreground">Select Listing</h3>
                 <Separator />
                 <Select disabled>
                   <SelectTrigger>
                     <SelectValue placeholder="Listing verification coming soon" />
                   </SelectTrigger>
                 </Select>
               </div>
             )}

                         {/* Contact Information */}
             <div className="space-y-4">
               <h3 className="text-lg font-medium">Contact Preferences</h3>
               <Separator />

               <div className="space-y-4">
                 <div>
                   <Label htmlFor="bestTimeToCall">Best Time to Call (Optional)</Label>
                   <Input
                     id="bestTimeToCall"
                     name="bestTimeToCall"
                     placeholder="e.g., Weekdays 2-4 PM SGT"
                     className="mt-1"
                   />
                 </div>

                 <div>
                   <Label htmlFor="notes">Additional Notes (Optional)</Label>
                   <Textarea
                     id="notes"
                     name="notes"
                     placeholder="Any specific information or questions for our team?"
                     className="resize-none mt-1"
                     rows={4}
                   />
                 </div>
               </div>
             </div>

             {/* Submit Button */}
             <div className="flex justify-end">
               <Button
                 type="submit"
                 disabled={isSubmitting || verificationType === 'listing'}
                 className="min-w-[120px]"
               >
                 {isSubmitting ? (
                   <>
                     <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                     Submitting...
                   </>
                 ) : (
                   'Request Verification Call'
                 )}
               </Button>
             </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Main page component with Suspense boundary
export default function SellerVerificationPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <VerificationContent />
    </Suspense>
  );
}

