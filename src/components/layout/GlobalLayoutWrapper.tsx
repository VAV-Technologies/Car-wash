
'use client';

import { Navbar } from './navbar';
import { Footer } from './footer';
import { WhatsAppButton } from '@/components/shared/whatsapp-button';
import type { ReactNode } from 'react';

interface GlobalLayoutWrapperProps {
  children: ReactNode;
}

export default function GlobalLayoutWrapper({ children }: GlobalLayoutWrapperProps) {
  return (
    <>
      <Navbar />
      <main className="flex-grow">
        {/* Spacer to push content below fixed navbar (pt-6 + h-[72px] = 96px) */}
        <div className="h-[96px] bg-brand-black" />
        <div className="border-t border-white/10" />
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
