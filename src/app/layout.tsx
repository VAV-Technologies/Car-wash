import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import GlobalLayoutWrapper from '@/components/layout/GlobalLayoutWrapper';
import NoticeListener from '@/components/NoticeListener';
import { DebugState } from '@/components/shared/DebugState';
import { AuthProvider } from '@/contexts/auth-context';
import { SWRProvider } from '@/contexts/swr-provider';
import { QueryProvider } from '@/contexts/query-provider';
import { GeistSans } from 'geist/font/sans';
import { Toaster as SonnerToaster } from "sonner";
import StructuredData from '@/components/seo/StructuredData';

// Force all pages to be dynamic
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    default: 'Nobridge - Business Marketplace Platform',
    template: '%s | Nobridge'
  },
  description: 'Connecting SME owners with investors and buyers in Asia. Find businesses for sale, investment opportunities, and connect with verified buyers and sellers.',
  keywords: ['business marketplace', 'SME', 'investors', 'buyers', 'sellers', 'Asia', 'business for sale', 'investment opportunities'],
  authors: [{ name: 'Nobridge' }],
  creator: 'Nobridge',
  publisher: 'Nobridge',
  metadataBase: new URL('https://www.nobridge.co'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.nobridge.co',
    title: 'Nobridge - Business Marketplace Platform',
    description: 'Connecting SME owners with investors and buyers in Asia. Find businesses for sale, investment opportunities, and connect with verified buyers and sellers.',
    siteName: 'Nobridge',
    images: [
      {
        url: '/assets/nobridge_app_icon.png',
        width: 512,
        height: 512,
        alt: 'Nobridge Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nobridge - Business Marketplace Platform',
    description: 'Connecting SME owners with investors and buyers in Asia. Find businesses for sale, investment opportunities, and connect with verified buyers and sellers.',
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
    // google: 'your-google-verification-code',
    // bing: 'your-bing-verification-code',
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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Favicons and icons */}
        <link rel="icon" href="/nobridge-favicon.ico?v=3" sizes="any" />
        <link rel="icon" href="/nobridge-favicon.png?v=3" type="image/png" />
        <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png?v=3" />
        <meta name="theme-color" content="#1e3a8a" />

        {/* Satoshi Font from Fontshare CDN */}
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap"
        />
        <StructuredData type="organization" />
      </head>
      <body className="font-sans antialiased flex flex-col min-h-screen bg-background text-foreground">
        <QueryProvider>
          <SWRProvider>
            <AuthProvider>
              <GlobalLayoutWrapper>
                {children}
              </GlobalLayoutWrapper>
              <NoticeListener />
              <Toaster />
              <DebugState />
            </AuthProvider>
          </SWRProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
