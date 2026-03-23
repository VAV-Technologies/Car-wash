
'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './navbar';
import { Footer } from './footer';
import { WhatsAppButton } from '@/components/shared/whatsapp-button';
import { LanguageProvider } from '@/i18n';
import type { ReactNode } from 'react';

interface GlobalLayoutWrapperProps {
  children: ReactNode;
}

export default function GlobalLayoutWrapper({ children }: GlobalLayoutWrapperProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  if (isAdminRoute) {
    return <>{children}</>;
  }

  const isHomePage = pathname === '/';

  return (
    <LanguageProvider>
      <Navbar />
      <main className="flex-grow">
        {!isHomePage && (
          <>
            {/* Spacer: navbar area (96px) + matching gap below (24px) = 120px, with section-lines */}
            <div className="h-[120px] bg-brand-black section-lines-light" />
            <div className="container mx-auto">
              <div className="border-t border-white/10" />
            </div>
          </>
        )}
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
    </LanguageProvider>
  );
}
