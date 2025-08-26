'use client';

// Force dynamic rendering due to client-side interactivity
export const dynamic = 'force-dynamic'

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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AuthCardWrapper } from "@/components/auth/auth-card-wrapper";
import { AuthPageGuard } from "@/components/auth/auth-page-guard";
import { useState, useTransition, useEffect, Suspense } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2, Loader2, Eye, EyeOff } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const ResetPasswordSchema = z.object({
  newPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || '';
  const email = searchParams.get("email") || '';
  
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  
  const { toast } = useToast();

  const form = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Validate token on mount
  useEffect(() => {
    if (!token || !email) {
      setError("Invalid reset link. Please request a new password reset.");
      setIsValidating(false);
      return;
    }

    const validateToken = async () => {
      try {
        console.log('[RESET-PASSWORD] Validating token...');
        
        const response = await fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`);
        const result = await response.json();

        if (result.valid) {
          setTokenValid(true);
          console.log('[RESET-PASSWORD] Token validation successful');
        } else {
          setError(result.error || "Invalid or expired reset link. Please request a new password reset.");
          console.log('[RESET-PASSWORD] Token validation failed:', result.error);
        }
      } catch (err) {
        console.error('[RESET-PASSWORD] Token validation error:', err);
        setError("Unable to validate reset link. Please try again.");
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token, email]);

  const onSubmit = (values: z.infer<typeof ResetPasswordSchema>) => {
    setError("");
    setSuccess("");

    startTransition(async () => {
      try {
        console.log('[RESET-PASSWORD] Submitting password reset...');
        
        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            email,
            newPassword: values.newPassword
          })
        });

        const result = await response.json();

        if (result.success) {
          setSuccess(result.message);
          toast({
            title: "Password Updated Successfully",
            description: "You can now sign in with your new password."
          });
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/auth/login?message=password_reset_success');
          }, 3000);
        } else {
          setError(result.error || 'Failed to reset password. Please try again.');
          toast({
            variant: "destructive",
            title: "Password Reset Failed",
            description: result.error || 'Please try again.'
          });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to reset password.";
        setError(errorMessage);
        console.error('[RESET-PASSWORD] Reset error:', err);
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage
        });
      }
    });
  };

  if (isValidating) {
    return (
      <AuthPageGuard>
        <AuthCardWrapper
          headerLabel="Validating reset link..."
          backButtonLabel="Back to Login"
          backButtonHref="/auth/login"
        >
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Checking your reset link...</span>
          </div>
        </AuthCardWrapper>
      </AuthPageGuard>
    );
  }

  if (!tokenValid) {
    return (
      <AuthPageGuard>
        <AuthCardWrapper
          headerLabel="Invalid Reset Link"
          backButtonLabel="Request New Reset"
          backButtonHref="/auth/forgot-password"
        >
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Link Invalid or Expired</AlertTitle>
            <AlertDescription>
              {error || "This password reset link is invalid or has expired. Please request a new one."}
            </AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Button onClick={() => router.push('/auth/forgot-password')} variant="outline" className="w-full">
              Request New Password Reset
            </Button>
          </div>
        </AuthCardWrapper>
      </AuthPageGuard>
    );
  }

  return (
    <AuthPageGuard>
      <AuthCardWrapper
        headerLabel="Create New Password"
        backButtonLabel="Back to Login"
        backButtonHref="/auth/login"
      >
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">
            <strong>Account:</strong> {email}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Enter your new password below
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        placeholder="Enter your new password"
                        type={showPassword ? "text" : "password"}
                        disabled={isPending}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isPending}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        placeholder="Confirm your new password"
                        type={showConfirmPassword ? "text" : "password"}
                        disabled={isPending}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isPending}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert variant="default" className="bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-700">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-700 dark:text-green-300">Password Updated!</AlertTitle>
                <AlertDescription className="text-green-600 dark:text-green-400">
                  {success}
                  <br />
                  <span className="text-sm">Redirecting to login page...</span>
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "Updating Password..." : "Update Password"}
            </Button>

            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
              <p className="text-xs text-gray-600">
                <strong>Security tips:</strong>
              </p>
              <ul className="text-xs text-gray-500 mt-1 space-y-1">
                <li>• Use at least 8 characters</li>
                <li>• Include uppercase and lowercase letters</li>
                <li>• Add numbers and special characters</li>
                <li>• Don't reuse old passwords</li>
              </ul>
            </div>
          </form>
        </Form>
      </AuthCardWrapper>
    </AuthPageGuard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <AuthPageGuard>
        <AuthCardWrapper
          headerLabel="Loading..."
          backButtonLabel="Back to Login"
          backButtonHref="/auth/login"
        >
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </AuthCardWrapper>
      </AuthPageGuard>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}