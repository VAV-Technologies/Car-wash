
'use client';

import Link from 'next/link';
import { Logo } from '@/components/shared/logo';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-black text-white/80 section-lines-light">
      <div className="container mx-auto py-12">
        <div className="flex flex-col lg:flex-row mb-8">
          {/* Logo + description */}
          <div className="lg:w-1/3 p-6 sm:p-8 md:p-10 border border-white/15">
            <Logo size="2xl" forceTheme="dark" />
            <div className="border-t border-white/15 mt-4 mb-4" />
            <p className="text-sm">
              Premium car wash and detailing studio in Indonesia. Professional care for drivers who demand the best.
            </p>
          </div>

          {/* Nav columns in a 4-col grid */}
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-4">
            <div className="border border-white/15 border-t-0 lg:border-t lg:border-l-0 p-4 sm:p-6 lg:p-8 text-sm space-y-3">
              <p className="text-base font-medium tracking-wide text-brand-white">
                Services
              </p>
              <div className="flex flex-col space-y-2">
                <Link href="/services" className="flex items-center gap-2 hover:text-brand-white transition-colors duration-300">
                  <span className="text-white/40 text-[5px] shrink-0">&#x25CF;</span> Car Wash
                </Link>
                <Link href="/services" className="flex items-center gap-2 hover:text-brand-white transition-colors duration-300">
                  <span className="text-white/40 text-[5px] shrink-0">&#x25CF;</span> Car Detailing
                </Link>
                <Link href="/pricing" className="flex items-center gap-2 hover:text-brand-white transition-colors duration-300">
                  <span className="text-white/40 text-[5px] shrink-0">&#x25CF;</span> Subscriptions
                </Link>
              </div>
            </div>

            <div className="border border-white/15 border-t-0 border-l-0 lg:border-t p-4 sm:p-6 lg:p-8 text-sm space-y-3">
              <p className="text-base font-medium tracking-wide text-brand-white">
                Company
              </p>
              <div className="flex flex-col space-y-2">
                <Link href="/about" className="flex items-center gap-2 hover:text-brand-white transition-colors duration-300">
                  <span className="text-white/40 text-[5px] shrink-0">&#x25CF;</span> About Us
                </Link>
                <Link href="/contact" className="flex items-center gap-2 hover:text-brand-white transition-colors duration-300">
                  <span className="text-white/40 text-[5px] shrink-0">&#x25CF;</span> Contact Us
                </Link>
                <Link href="/faq" className="flex items-center gap-2 hover:text-brand-white transition-colors duration-300">
                  <span className="text-white/40 text-[5px] shrink-0">&#x25CF;</span> FAQ
                </Link>
                <Link href="/resources" className="flex items-center gap-2 hover:text-brand-white transition-colors duration-300">
                  <span className="text-white/40 text-[5px] shrink-0">&#x25CF;</span> Car Care Tips
                </Link>
              </div>
            </div>

            <div className="border border-white/15 border-t-0 lg:border-t lg:border-l-0 p-4 sm:p-6 lg:p-8 text-sm space-y-3">
              <p className="text-base font-medium tracking-wide text-brand-white">
                Legal
              </p>
              <div className="flex flex-col space-y-2">
                <Link href="/terms" className="flex items-center gap-2 hover:text-brand-white transition-colors duration-300">
                  <span className="text-white/40 text-[5px] shrink-0">&#x25CF;</span> Terms of Service
                </Link>
                <Link href="/privacy" className="flex items-center gap-2 hover:text-brand-white transition-colors duration-300">
                  <span className="text-white/40 text-[5px] shrink-0">&#x25CF;</span> Privacy Policy
                </Link>
              </div>
            </div>

            <div className="border border-white/15 border-t-0 border-l-0 lg:border-t p-4 sm:p-6 lg:p-8 text-sm space-y-3">
              <p className="text-base font-medium tracking-wide text-brand-white">
                Support
              </p>
              <div className="flex flex-col space-y-2">
                <Link href="/help" className="flex items-center gap-2 hover:text-brand-white transition-colors duration-300">
                  <span className="text-white/40 text-[5px] shrink-0">&#x25CF;</span> Help Center
                </Link>
                <Link href="/contact" className="flex items-center gap-2 hover:text-brand-white transition-colors duration-300">
                  <span className="text-white/40 text-[5px] shrink-0">&#x25CF;</span> Book a Wash
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/20 pt-8 flex flex-col-reverse justify-between items-center sm:flex-row">
          <p className="text-sm">
            &copy; {currentYear} Castudio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
