'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { asianCountries, buyerTypes } from "@/lib/types";
import { useState, useTransition, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { useSellerProfile } from "@/hooks/use-seller-profile";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ProfileSchema = z.object({
  fullName: z.string().min(1, { message: "Full name is required." }),
  phoneNumber: z.string().min(1, { message: "Phone number is required." }),
  country: z.string().min(1, { message: "Country is required." }),
  role: z.enum(['seller', 'buyer'], { required_error: "Role is required." }),
  initialCompanyName: z.string().optional(),
  buyerType: z.enum(buyerTypes).optional(),
}).superRefine((data, ctx) => {
  if (data.role === 'seller') {
    if (!data.initialCompanyName || data.initialCompanyName.trim().length < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Initial company name is required for sellers.",
        path: ["initialCompanyName"],
      });
    }
  } else if (data.role === 'buyer') {
    if (!data.buyerType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Buyer type is required for buyers.",
        path: ["buyerType"],
      });
    }
  }
});

const PasswordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(8, "New password must be at least 8 characters."),
  confirmNewPassword: z.string(),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "New passwords do not match.",
  path: ["confirmNewPassword"],
});

const defaultProfileValues: z.infer<typeof ProfileSchema> = {
  fullName: "",
  phoneNumber: "",
  country: "",
  role: "seller",
  initialCompanyName: "",
  buyerType: undefined,
};

export default function SellerProfilePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isProfilePending, startProfileTransition] = useTransition();
  const [isPasswordPending, startPasswordTransition] = useTransition();
  const [hasInitialized, setHasInitialized] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Use auth context for initial session check
  const { user: authUser, profile: authProfile, isLoading: authLoading, refreshAuth } = useAuth();

  // Then use the seller profile hook for detailed data
  const { user, isLoading: profileLoading, error, updateProfile, changePassword } = useSellerProfile();

  const profileForm = useForm<z.infer<typeof ProfileSchema>>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: defaultProfileValues,
  });

  const passwordForm = useForm<z.infer<typeof PasswordChangeSchema>>({
    resolver: zodResolver(PasswordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  // Combined loading state
  const isLoading = authLoading || (profileLoading && !hasInitialized);

  // Initialize form data when user data is available
  useEffect(() => {
    if (user && !hasInitialized) {
      console.log('[SELLER-PROFILE] Initializing form with user data:', user.email);
      profileForm.reset({
        fullName: user.fullName || "",
        phoneNumber: user.phoneNumber || "",
        country: user.country || "",
        role: user.role || "seller",
        initialCompanyName: user.initialCompanyName || "",
        buyerType: user.buyerType as any || undefined,
      });
      setHasInitialized(true);
    }
  }, [user, profileForm, hasInitialized]);

  // Handle authentication state
  useEffect(() => {
    if (!authLoading && !authUser) {
      console.log('[SELLER-PROFILE] No authenticated user, redirecting to login');
      router.push('/auth/login?redirectTo=/seller-dashboard/profile');
    }
  }, [authLoading, authUser, router]);

  // Handle profile role mismatch
  useEffect(() => {
    if (authProfile && authProfile.role !== 'seller') {
      console.log('[SELLER-PROFILE] User is not a seller, redirecting');
      router.push('/dashboard');
    }
  }, [authProfile, router]);

  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    setHasInitialized(false);
    try {
      await refreshAuth();
      // Force reload the page to ensure fresh data
      window.location.reload();
    } catch (error) {
      console.error('[SELLER-PROFILE] Retry failed:', error);
      toast({
        variant: "destructive",
        title: "Retry Failed",
        description: "Please try refreshing the page manually."
      });
    }
  };

  const onProfileSubmit = (values: z.infer<typeof ProfileSchema>) => {
    startProfileTransition(async () => {
      try {
        const success = await updateProfile(values);
        if (success) {
          toast({
            title: "Profile Updated",
            description: "Your profile information has been successfully updated."
          });
          // Refresh auth to ensure consistent state
          await refreshAuth();
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update profile. Please try again."
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update profile. Please try again."
        });
      }
    });
  };

  const onPasswordSubmit = (values: z.infer<typeof PasswordChangeSchema>) => {
    startPasswordTransition(async () => {
      try {
        await changePassword(values.currentPassword, values.newPassword);
        toast({
          title: "Password Changed",
          description: "Your password has been successfully updated."
        });
        passwordForm.reset();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to change password";
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage
        });
      }
    });
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state with retry option
  if (error || (!user && hasInitialized)) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h1 className="text-2xl font-semibold text-destructive mb-2">
            {error || "Failed to Load Profile"}
          </h1>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            We're having trouble loading your profile data. This can happen due to session issues.
            {retryCount > 0 && " Please try refreshing the page."}
          </p>
          <div className="flex gap-3">
            <Button onClick={handleRetry} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              {retryCount > 0 ? "Try Again" : "Retry"}
            </Button>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
          {retryCount > 1 && (
            <p className="text-sm text-muted-foreground mt-4">
              Still having issues? Try <Link href="/auth/login" className="text-primary underline">logging in again</Link>.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Show not found state if no user after loading
  if (!user && !profileLoading) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Profile Not Found</h1>
        <p className="text-muted-foreground mb-4">Unable to load your profile. Please try logging in again.</p>
        <Button asChild>
          <Link href="/auth/login?redirectTo=/seller-dashboard/profile">Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight">My Seller Profile</h1>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details. Your email ({user?.email}) cannot be changed here.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
              <FormField
                control={profileForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input {...field} disabled={isProfilePending} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl><Input {...field} type="tel" disabled={isProfilePending} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isProfilePending}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select your country"/></SelectTrigger></FormControl>
                      <SelectContent>
                        {asianCountries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormLabel>Your Role</FormLabel>
                     <Select onValueChange={field.onChange} value={field.value} disabled={true}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="seller">Business Seller</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={profileForm.control}
                name="initialCompanyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name (for listing purposes)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Your Company Pte Ltd" disabled={isProfilePending} />
                    </FormControl>
                    <FormDescription>This can be your registered business name or a trading name.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isProfilePending}>
                {isProfilePending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Profile Changes"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Separator />

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl><Input {...field} type="password" disabled={isPasswordPending} /></FormControl>
                    <FormDescription>Note: The current password field is for verification only.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl><Input {...field} type="password" disabled={isPasswordPending} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmNewPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl><Input {...field} type="password" disabled={isPasswordPending} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPasswordPending}>
                {isPasswordPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Changing...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
