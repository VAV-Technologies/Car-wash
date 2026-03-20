'use client';

import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';

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
  const href = `https://wa.me/${WA_NUMBER}?text=${message}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 md:w-12 md:h-12 rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#20BD5A] transition-colors"
    >
      <MessageCircle className="h-6 w-6 md:h-5 md:w-5" fill="currentColor" strokeWidth={0} />
    </a>
  );
}
