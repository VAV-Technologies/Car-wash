
'use client';

import Link from 'next/link';
import { Logo } from '@/components/shared/logo';
import { useTranslation } from '@/i18n';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <footer className="bg-brand-black text-white/80 section-lines-light">
      <div className="container mx-auto py-12">
        <div className="flex flex-col lg:flex-row mb-8">
          {/* Logo + description */}
          <div className="lg:w-1/3 p-6 sm:p-8 md:p-10 border border-white/15">
            <Logo size="2xl" forceTheme="dark" />
            <div className="border-t border-white/15 mt-4 mb-4" />
            <p className="text-sm">
              {t('common.footer.description')}
            </p>
          </div>

          {/* Nav columns in a 4-col grid */}
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-4">
            <div className="border border-white/15 border-t-0 lg:border-t lg:border-l-0 p-4 sm:p-6 lg:p-8 text-sm space-y-3">
              <p className="text-base font-medium tracking-wide text-brand-white">
                {t('common.footer.services')}
              </p>
              <div className="flex flex-col space-y-2">
                <Link href="/car-wash/one-time" className="flex items-center gap-2 hover:text-brand-white transition-colors duration-300">
                  <span className="text-white/40 text-[5px] shrink-0">&#x25CF;</span> {t('common.footer.oneTimeWashes')}
                </Link>
                <Link href="/car-wash/subscriptions" className="flex items-center gap-2 hover:text-brand-white transition-colors duration-300">
                  <span className="text-white/40 text-[5px] shrink-0">&#x25CF;</span> {t('common.footer.subscriptions')}
                </Link>
                <Link href="/detailing" className="flex items-center gap-2 hover:text-brand-white transition-colors duration-300">
                  <span className="text-white/40 text-[5px] shrink-0">&#x25CF;</span> {t('common.footer.autoDetailing')}
                </Link>
              </div>
            </div>

            <div className="border border-white/15 border-t-0 border-l-0 lg:border-t p-4 sm:p-6 lg:p-8 text-sm space-y-3">
              <p className="text-base font-medium tracking-wide text-brand-white">
                {t('common.footer.company')}
              </p>
              <div className="flex flex-col space-y-2">
                <Link href="/about" className="flex items-center gap-2 hover:text-brand-white transition-colors duration-300">
                  <span className="text-white/40 text-[5px] shrink-0">&#x25CF;</span> {t('common.footer.aboutUs')}
                </Link>
                <Link href="/faq" className="flex items-center gap-2 hover:text-brand-white transition-colors duration-300">
                  <span className="text-white/40 text-[5px] shrink-0">&#x25CF;</span> FAQ
                </Link>
                <Link href="/tips" className="flex items-center gap-2 hover:text-brand-white transition-colors duration-300">
                  <span className="text-white/40 text-[5px] shrink-0">&#x25CF;</span> {t('common.footer.carCareTips')}
                </Link>
              </div>
            </div>

            <div className="border border-white/15 border-t-0 lg:border-t lg:border-l-0 p-4 sm:p-6 lg:p-8 text-sm space-y-3">
              <p className="text-base font-medium tracking-wide text-brand-white">
                {t('common.footer.connect')}
              </p>
              <div className="flex flex-col space-y-2">
                <a href="https://wa.me/6285591222000" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-brand-white transition-colors duration-300">
                  <span className="text-white/40 text-[5px] shrink-0">&#x25CF;</span> WhatsApp
                </a>
                <a href="mailto:hi@castudio.id" className="flex items-center gap-2 hover:text-brand-white transition-colors duration-300">
                  <span className="text-white/40 text-[5px] shrink-0">&#x25CF;</span> hi@castudio.id
                </a>
                <span className="flex items-center gap-2 text-white/60">
                  <span className="text-white/40 text-[5px] shrink-0">&#x25CF;</span> {t('common.footer.monToSat')}
                </span>
              </div>
            </div>

            <div className="border border-white/15 border-t-0 border-l-0 lg:border-t p-4 sm:p-6 lg:p-8 text-sm space-y-3">
              <p className="text-base font-medium tracking-wide text-brand-white">
                {t('common.footer.legal')}
              </p>
              <div className="flex flex-col space-y-2">
                <Link href="/terms" className="flex items-center gap-2 hover:text-brand-white transition-colors duration-300">
                  <span className="text-white/40 text-[5px] shrink-0">&#x25CF;</span> {t('common.footer.termsOfService')}
                </Link>
                <Link href="/privacy" className="flex items-center gap-2 hover:text-brand-white transition-colors duration-300">
                  <span className="text-white/40 text-[5px] shrink-0">&#x25CF;</span> {t('common.footer.privacyPolicy')}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/20 pt-8 flex flex-col-reverse justify-between items-center sm:flex-row">
          <p className="text-sm">
            &copy; {currentYear} {t('common.footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
