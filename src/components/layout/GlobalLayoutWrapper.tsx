
'use client';

import { Navbar } from './navbar';
import { Footer } from './footer';
import type { ReactNode } from 'react';

interface GlobalLayoutWrapperProps {
  children: ReactNode;
}

export default function GlobalLayoutWrapper({ children }: GlobalLayoutWrapperProps) {
  return (
    <>
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
}
