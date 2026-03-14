'use client';

import * as React from 'react';
import { SellerStepper } from '@/components/onboarding/seller-stepper';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/shared/logo';

export default function SellerOnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const currentStep = params.step ? parseInt(params.step as string, 10) : 1;

  // This ensures pathname is only accessed client-side
  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const pathname = isClient ? window.location.pathname : "";
  const isSuccessPage = params.step === 'success' || pathname.endsWith('/onboarding/seller/success');

  const sellerStepTitles = [
    "Business Overview",
    "Seller Identity",
    "Business Docs",
    "Financials",
    "Review & Submit",
  ];

  return (
    <div className="min-h-screen bg-brand-light-gray flex flex-col items-center py-8 md:py-12 px-4">
      <div className="w-full max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold text-brand-dark-blue mb-2 font-heading">
            Complete Your Seller Profile & Business Verification
          </h1>
          <p className="text-muted-foreground">
            Provide key details to get your business ready for verified buyers.
          </p>
        </div>

        {!isSuccessPage && (
          <div className="mb-10 max-w-3xl mx-auto">
            <SellerStepper currentStep={currentStep} stepTitles={sellerStepTitles} />
          </div>
        )}

        <main className="bg-brand-white p-6 md:p-10 rounded-xl shadow-xl">
          {children}
        </main>
      </div>
    </div>
  );
}
