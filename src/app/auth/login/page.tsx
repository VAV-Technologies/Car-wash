'use client';

// Force dynamic rendering due to client-side interactivity
export const dynamic = 'force-dynamic'

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
import { useState, useTransition } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react"; // Removed CheckCircle2 as it's not used here
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/auth";

const LoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export default function LoginPage() {
  const [error, setError] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError("");

    startTransition(async () => {
      console.log("Login values:", values);

      try {
        const result = await auth.signIn(values.email, values.password);

        // If the sign-in was successful but email is not verified, redirect to verification page.
        if (result.user && result.profile && !result.profile.is_email_verified) {
          console.log("User logged in but email not verified, redirecting to verify-email page.");
          toast({
            title: "Email Verification Required",
            description: "Your email needs to be verified before you can access your dashboard."
          });
          // Generate a secure verification token for redirection
          try {
            // Create proper verification URL with token
            const verifyEmailUrl = new URL(`/verify-email`, window.location.origin);
            verifyEmailUrl.searchParams.set('email', values.email);
            verifyEmailUrl.searchParams.set('type', 'login');
            verifyEmailUrl.searchParams.set('redirectTo', '/dashboard');
            verifyEmailUrl.searchParams.set('auto_send', 'true');

            // Try to generate a verification token by calling API
            const tokenResponse = await fetch('/api/auth/generate-verification-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: values.email,
                type: 'login',
                redirectTo: '/dashboard'
              })
            });

            if (tokenResponse.ok) {
              const { token } = await tokenResponse.json();
              if (token) {
                verifyEmailUrl.searchParams.set('token', token);
                console.log("Generated verification token for login redirect");
              }
            }

            router.push(verifyEmailUrl.toString());
          } catch (tokenError) {
            console.error("Failed to generate verification token:", tokenError);
            // Fallback to the old URL format without token
            router.push(`/verify-email?email=${encodeURIComponent(values.email)}&type=login&redirectTo=/dashboard&auto_send=true`);
          }
          return; // Stop execution
        }

        // If sign-in was successful and email is verified, redirect to the correct dashboard.
        if (result.user && result.profile) {
            toast({
              title: "Login Successful!",
              description: "Welcome back!"
            });

            if (result.profile.role === 'seller') {
              router.push('/seller-dashboard');
            } else if (result.profile.role === 'buyer') {
              router.push('/dashboard');
            } else if (result.profile.role === 'admin') {
               router.push('/admin');
            } else {
              console.warn('User logged in but has no role. Redirecting to home.');
              router.push('/');
            }
            return; // Stop execution
        }

        // Handle case where sign-in succeeds but profile is missing (should be rare).
        if(result.user && !result.profile) {
            console.error('CRITICAL: User signed in but profile is missing. Redirecting to error page.');
            router.push('/auth/verification-error?error=profile_missing');
            return;
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Login failed';

        // 🔥 IMPROVED ERROR HANDLING: Provide specific guidance based on error type
        if (errorMessage === 'ACCOUNT_NOT_FOUND') {
          setError("No account found with this email address. Please check your email or create a new account.");
          toast({
            variant: "destructive",
            title: "Account Not Found",
            description: "No account exists with this email address. Would you like to create a new account instead?"
          });
          return;
        }

        if (errorMessage === 'WRONG_PASSWORD') {
          setError("Incorrect password. Please check your password and try again.");
          toast({
            variant: "destructive",
            title: "Incorrect Password",
            description: "The password you entered is incorrect. Try the 'Forgot Password' link if you need to reset it."
          });
          return;
        }

        // Handle unconfirmed email case - redirect to verification
        if (errorMessage === 'UNCONFIRMED_EMAIL') {
          toast({
            title: "Email Verification Required",
            description: "Your email needs to be verified before you can login. We've sent you a new verification email."
          });
          router.push(`/verify-email?email=${encodeURIComponent(values.email)}&type=login`);
          return;
        }

        // Handle existing known error cases
        if (errorMessage.includes('Email not confirmed')) {
          toast({
            title: "Email Verification Required",
            description: "Your email needs to be verified before you can login. We've sent you a new verification email."
          });
          router.push(`/verify-email?email=${encodeURIComponent(values.email)}&type=login`);
          return;
        }

        // Generic error handling for other cases
        setError(errorMessage.replace('Login failed: ', ''));
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: errorMessage.replace('Login failed: ', '')
        });
      }
    });
  };

  return (
    <AuthPageGuard>
    <AuthCardWrapper
      headerLabel="Welcome back! Please login to your account."
      backButtonLabel="Don't have an account? Register here."
      backButtonHref="/auth/register"
      // showSocial prop is removed to hide the social login section
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="you@example.com"
                    type="email"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="********"
                    type="password"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
                <Button size="sm" variant="link" asChild className="px-0 font-normal">
                  <Link href="/auth/forgot-password">Forgot password?</Link>
                </Button>
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

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Processing..." : "Login"}
          </Button>
        </form>
      </Form>
    </AuthCardWrapper>
    </AuthPageGuard>
  );
}
