'use client';

import { usePathname } from 'next/navigation';
import { MessageCircle, Mail, Phone, Globe } from 'lucide-react';
import { useTranslation } from '@/i18n';

const WA_NUMBER = '62816104334';

export function WhatsAppButton() {
  const pathname = usePathname();
  const { locale, setLocale, t } = useTranslation();

  const getWhatsAppMessage = () => {
    if (pathname === '/car-wash/one-time') return t('common.wa.oneTime');
    if (pathname === '/car-wash/subscriptions') return t('common.wa.subscription');
    if (pathname === '/detailing') return t('common.wa.detailing');
    return t('common.wa.default');
  };

  const message = encodeURIComponent(getWhatsAppMessage());
  const waHref = `https://wa.me/${WA_NUMBER}?text=${message}`;

  const toggleLocale = () => {
    setLocale(locale === 'id' ? 'en' : 'id');
  };

  return (
    <div className="fixed bottom-6 right-0 left-0 z-50 pointer-events-none">
      <div className="container mx-auto flex justify-between items-center">
        <button
          onClick={toggleLocale}
          className="pointer-events-auto flex items-center gap-2 px-4 py-3 border border-white/10 bg-brand-black/90 backdrop-blur-xl supports-[backdrop-filter]:bg-brand-black/80 shadow-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Globe className="h-4 w-4" strokeWidth={1.5} />
          <span className="text-sm font-medium">{locale === 'id' ? 'EN' : 'ID'}</span>
        </button>
        <div className="pointer-events-auto flex border border-white/10 bg-brand-black/90 backdrop-blur-xl supports-[backdrop-filter]:bg-brand-black/80 shadow-lg">
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
            <span className="text-sm font-medium">{t('common.contact.whatsapp')}</span>
          </a>
          <div className="w-px bg-white/10" />
          <a
            href="mailto:hello@castudio.co"
            className="flex items-center gap-2 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Mail className="h-4 w-4" strokeWidth={1.5} />
            <span className="text-sm font-medium">{t('common.contact.email')}</span>
          </a>
          <div className="w-px bg-white/10" />
          <a
            href="tel:+62816104334"
            className="flex items-center gap-2 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Phone className="h-4 w-4" strokeWidth={1.5} />
            <span className="text-sm font-medium">{t('common.contact.phone')}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
