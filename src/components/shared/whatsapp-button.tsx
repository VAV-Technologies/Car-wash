'use client';

import { usePathname } from 'next/navigation';
import { MessageCircle, Mail, Phone } from 'lucide-react';

const WA_NUMBER = '62816104334';

function getWhatsAppMessage(pathname: string): string {
  if (pathname === '/car-wash/one-time') {
    return 'Halo, saya ingin booking cuci mobil.';
  }
  if (pathname === '/car-wash/subscriptions') {
    return 'Halo, saya tertarik untuk berlangganan Castudio.';
  }
  if (pathname === '/detailing') {
    return 'Halo, saya ingin booking auto detailing.';
  }
  return 'Halo, saya ingin tahu lebih lanjut tentang layanan Castudio.';
}

export function WhatsAppButton() {
  const pathname = usePathname();
  const message = encodeURIComponent(getWhatsAppMessage(pathname));
  const waHref = `https://wa.me/${WA_NUMBER}?text=${message}`;

  return (
    <div className="fixed bottom-6 right-0 left-0 z-50 pointer-events-none">
      <div className="container mx-auto flex justify-end">
        <div className="pointer-events-auto flex border border-white/10 bg-brand-black/90 backdrop-blur-xl supports-[backdrop-filter]:bg-brand-black/80 shadow-lg">
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
            <span className="text-sm font-medium">WhatsApp</span>
          </a>
          <div className="w-px bg-white/10" />
          <a
            href="mailto:hello@castudio.co"
            className="flex items-center gap-2 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Mail className="h-4 w-4" strokeWidth={1.5} />
            <span className="text-sm font-medium">Email</span>
          </a>
          <div className="w-px bg-white/10" />
          <a
            href="tel:+62816104334"
            className="flex items-center gap-2 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Phone className="h-4 w-4" strokeWidth={1.5} />
            <span className="text-sm font-medium">Phone</span>
          </a>
        </div>
      </div>
    </div>
  );
}
