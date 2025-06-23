import type { Metadata } from 'next';
import StructuredData from '@/components/seo/StructuredData';

export const metadata: Metadata = {
  title: 'Business Marketplace - Find Investment Opportunities',
  description: 'Browse verified business listings from SME owners across Asia. Find investment opportunities, businesses for sale, and connect with motivated sellers.',
  keywords: ['business marketplace', 'investment opportunities', 'businesses for sale', 'SME', 'Asia', 'verified listings'],
  openGraph: {
    title: 'Business Marketplace - Find Investment Opportunities | Nobridge',
    description: 'Browse verified business listings from SME owners across Asia. Find investment opportunities, businesses for sale, and connect with motivated sellers.',
    url: 'https://www.nobridge.co/marketplace',
  },
  twitter: {
    title: 'Business Marketplace - Find Investment Opportunities | Nobridge',
    description: 'Browse verified business listings from SME owners across Asia. Find investment opportunities, businesses for sale, and connect with motivated sellers.',
  },
  alternates: {
    canonical: '/marketplace',
  },
};

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StructuredData type="marketplace" />
      {children}
    </>
  );
}
