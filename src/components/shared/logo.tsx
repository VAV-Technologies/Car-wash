"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  forceTheme?: 'light' | 'dark';
}

export function Logo({ size = 'xl', forceTheme }: LogoProps) {
  const { resolvedTheme: actualResolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dimensions = {
    sm: { width: 100, height: 33 },
    md: { width: 120, height: 40 },
    lg: { width: 150, height: 50 },
    xl: { width: 200, height: 67 }, // Kept larger size
    '2xl': { width: 220, height: 73 }
  };

  const { width, height } = dimensions[size] || dimensions.xl;

  let useDarkElementsLogoFile: boolean;

  if (forceTheme) {
    // If forceTheme is 'light', it means the background is light, so we need the dark elements logo.
    useDarkElementsLogoFile = forceTheme === 'light';
  } else if (mounted) {
    // If no forceTheme and component is mounted, use the actual resolved theme.
    // If actualResolvedTheme is 'light', we need dark logo elements.
    useDarkElementsLogoFile = actualResolvedTheme === 'light';
  } else {
    // Fallback for SSR or before mount if no forceTheme: assume light background by default.
    useDarkElementsLogoFile = true;
  }

  const logoSrc = useDarkElementsLogoFile
    ? '/assets/nobridge_logo_light_trimmed@2x.png'
    : '/assets/nobridge_logo_dark_trimmed@2x.png';

  if (!mounted && !forceTheme) {
    // Avoid hydration mismatch during SSR if theme isn't forced
    return <div style={{ width: `${width}px`, height: `${height}px` }} aria-hidden="true" className="inline-block" />;
  }

  return (
    <Link href="/" className="flex items-center" aria-label="Nobridge Home">
      <Image
        src={logoSrc}
        alt="Nobridge"
        width={width}
        height={height}
        className="object-contain"
        style={{ height: 'auto' }}
        priority
      />
    </Link>
  );
}
