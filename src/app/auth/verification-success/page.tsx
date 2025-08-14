'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthCardWrapper } from '@/components/auth/auth-card-wrapper';
import { useState } from 'react';

function VerificationSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const email = searchParams.get('email');
  const method = searchParams.get('method');

  const handleContinue = () => {
    setIsLoading(true);
    router.push('/auth/login');
  };

  return (
    <AuthCardWrapper
      headerLabel="Email Verification Successful!"
      backButtonLabel=""
      backButtonHref=""
    >
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-green-600" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            Welcome to Nobridge!
          </h2>
          <p className="text-muted-foreground">
            {email && (
              <>Your email address <strong>{email}</strong> has been successfully verified.</>
            )}
          </p>
          {method === 'bypass' && (
            <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
              Verified via secure bypass system
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handleContinue} 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Redirecting...' : 'Continue to Login'}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>Your account is now fully activated.</p>
          <p>You can now sign in and access all Nobridge features.</p>
        </div>
      </div>
    </AuthCardWrapper>
  );
}

export default function VerificationSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Suspense fallback={<div>Loading...</div>}>
        <VerificationSuccessContent />
      </Suspense>
    </div>
  );
}