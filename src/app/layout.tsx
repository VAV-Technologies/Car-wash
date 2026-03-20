import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import GlobalLayoutWrapper from '@/components/layout/GlobalLayoutWrapper';
import StructuredData from '@/components/seo/StructuredData';

export const metadata: Metadata = {
  title: {
    default: 'Castudio | Premium Car Wash & Detailing',
    template: '%s | Castudio'
  },
  description: 'Premium car wash and car detailing studio in Indonesia. Professional hand wash, ceramic coating, interior detailing, and flexible subscription plans.',
  keywords: ['car wash', 'car detailing', 'ceramic coating', 'interior detailing', 'car care', 'Indonesia', 'subscription car wash', 'premium car wash'],
  authors: [{ name: 'Castudio' }],
  creator: 'Castudio',
  publisher: 'Castudio',
  metadataBase: new URL('https://www.castudio.co'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.castudio.co',
    title: 'Castudio | Premium Car Wash & Detailing',
    description: 'Premium car wash and car detailing studio in Indonesia. Professional hand wash, ceramic coating, interior detailing, and flexible subscription plans.',
    siteName: 'Castudio',
    images: [
      {
        url: '/assets/nobridge_app_icon.png',
        width: 512,
        height: 512,
        alt: 'Castudio Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Castudio | Premium Car Wash & Detailing',
    description: 'Premium car wash and car detailing studio in Indonesia. Professional hand wash, ceramic coating, interior detailing, and flexible subscription plans.',
    images: ['/assets/nobridge_app_icon.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes when you get them
  },
  icons: {
    icon: [
      { url: '/nobridge-favicon.ico?v=3', sizes: 'any' },
      { url: '/nobridge-favicon.png?v=3', type: 'image/png', sizes: '32x32' },
      { url: '/assets/nobridge_app_icon.png?v=3', type: 'image/png', sizes: '512x512' },
      { url: '/assets/nobridge_app_icon.png?v=3', type: 'image/png', sizes: '192x192' },
      { url: '/assets/nobridge_app_icon.png?v=3', type: 'image/png', sizes: '16x16' },
    ],
    apple: [
      { url: '/assets/apple-touch-icon.png?v=3', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/nobridge-favicon.ico?v=3',
  },
  manifest: '/manifest.json?v=3',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Favicons and icons */}
        <link rel="icon" href="/nobridge-favicon.ico?v=3" sizes="any" />
        <link rel="icon" href="/nobridge-favicon.png?v=3" type="image/png" />
        <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png?v=3" />
        <meta name="theme-color" content="#0A0A0A" />

        {/* Satoshi Font from Fontshare CDN */}
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap"
        />
        <StructuredData type="organization" />
      </head>
      <body className="font-sans antialiased flex flex-col min-h-screen bg-background text-foreground">
        <GlobalLayoutWrapper>
          {children}
        </GlobalLayoutWrapper>
        <Toaster />
      </body>
    </html>
  );
}
