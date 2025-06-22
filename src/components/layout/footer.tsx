
import Link from 'next/link';
import { Logo } from '@/components/shared/logo';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-dark-blue text-brand-light-gray/80">
      <div className="container mx-auto py-16 md:py-20 px-6 md:px-8">
        <div className="grid gap-10 row-gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo size="xl" forceTheme="dark" />
            <p className="mt-4 text-sm ">
              Connecting SME owners with investors and buyers across Asia. Your trusted partner for business transitions.
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <p className="text-base font-semibold tracking-wide text-brand-white">
              Sell Your Business
            </p>
            <div className="flex flex-col space-y-2">
              <Link href="/seller-dashboard/listings/create" className="hover:text-brand-white transition-colors duration-300">
                List Your Business
              </Link>
              <Link href="/how-selling-works" className="hover:text-brand-white transition-colors duration-300">
                How Selling Works
              </Link>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <p className="text-base font-semibold tracking-wide text-brand-white">
              Buy a Business
            </p>
            <div className="flex flex-col space-y-2">
              <Link href="/marketplace" className="hover:text-brand-white transition-colors duration-300">
                Browse Listings
              </Link>
              <Link href="/how-buying-works" className="hover:text-brand-white transition-colors duration-300">
                How Buying Works
              </Link>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <p className="text-base font-semibold tracking-wide text-brand-white">
              Company
            </p>
            <div className="flex flex-col space-y-2">
              <Link href="/about" className="hover:text-brand-white transition-colors duration-300">
                About Us
              </Link>
              <Link href="/contact" className="hover:text-brand-white transition-colors duration-300">
                Contact Us
              </Link>
              <Link href="/faq" className="hover:text-brand-white transition-colors duration-300">
                FAQ
              </Link>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <p className="text-base font-semibold tracking-wide text-brand-white">
              Legal
            </p>
            <div className="flex flex-col space-y-2">
               <Link href="/terms" className="hover:text-brand-white transition-colors duration-300">
                Terms of Service
              </Link>
              <Link href="/privacy" className="hover:text-brand-white transition-colors duration-300">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-brand-light-gray/20 pt-8 flex flex-col-reverse justify-between items-center sm:flex-row">
          <p className="text-sm">
            © {currentYear} Nobridge. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
