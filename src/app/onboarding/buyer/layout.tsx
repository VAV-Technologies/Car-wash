
'use client';

import * as React from 'react';
import { BuyerStepper } from '@/components/onboarding/buyer-stepper';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/shared/logo';

export default function BuyerOnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const currentStep = params.step ? parseInt(params.step as string, 10) : 1;

  const isSuccessPage = pathname === '/onboarding/buyer/success';


  const buyerStepTitles = [
    "Welcome & Info", // Step 1: Info
    "Identity Document",           // Step 2: Document Upload
  ];

  return (
    <div className="min-h-screen bg-brand-light-gray flex flex-col items-center py-8 md:py-12 px-4">
      <div className="w-full max-w-3xl">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block mb-6">
            <Logo size="xl" forceTheme="light" />
          </Link>
          <h1 className="text-3xl md:text-4xl font-semibold text-brand-dark-blue mt-4 mb-2 font-heading">
            Become a Verified Nobridge Buyer
          </h1>
          <p className="text-muted-foreground">
            Complete your verification to unlock full access to detailed business information.
          </p>
        </div>

        {!isSuccessPage && (
          <div className="mb-10 max-w-xl mx-auto">
            <BuyerStepper currentStep={currentStep} stepTitles={buyerStepTitles} />
          </div>
        )}

        <main className="bg-brand-white p-6 md:p-10 rounded-xl shadow-xl">
          {children}
        </main>
      </div>
    </div>
  );
}
