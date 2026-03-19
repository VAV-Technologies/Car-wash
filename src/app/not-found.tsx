'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-black">
      <Card className="w-full max-w-md bg-brand-dark-gray border-white/10">
        <CardContent className="pt-10 pb-8 px-8 text-center">
          {/* 404 Icon */}
          <div className="mb-6">
            <div className="text-8xl font-semibold text-white/20 mb-2">404</div>
          </div>

          {/* Error Message */}
          <h1 className="text-2xl font-semibold text-white mb-2">
            Page Not Found
          </h1>
          <p className="text-white/60 mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go to Homepage
              </Link>
            </Button>

            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-sm text-white/40 mt-8">
            Need help? <Link href="/contact" className="text-brand-orange hover:underline">Contact us</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
