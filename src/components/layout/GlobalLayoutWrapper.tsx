
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
        {/* Spacer: navbar area (96px) + matching gap below (24px) = 120px, with section-lines */}
        <div className="h-[120px] bg-brand-black section-lines-light" />
        <div className="container mx-auto">
          <div className="border-t border-white/10" />
        </div>
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
