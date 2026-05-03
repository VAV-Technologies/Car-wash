
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
  const isWashRoute = pathname.startsWith('/wash');

  if (isAdminRoute || isWashRoute) {
    return <>{children}</>;
  }

  const isHomePage = pathname === '/';
  // /book and /ai are full-viewport tools: keep site Navbar but hide site Footer + WhatsApp button.
  // Total page height = viewport, so window-level scrolling can't push internal nav off screen.
  const isBookRoute = pathname.startsWith('/book');
  const isAiRoute = pathname.startsWith('/ai');
  const isFullViewportTool = isBookRoute || isAiRoute;

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
      {!isFullViewportTool && <Footer />}
      {!isFullViewportTool && <WhatsAppButton />}
    </LanguageProvider>
  );
}
