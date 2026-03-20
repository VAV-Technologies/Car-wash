"use client";

import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  forceTheme?: 'light' | 'dark';
}

export function Logo({ size = 'xl', forceTheme }: LogoProps) {
  const heights: Record<string, number> = {
    sm: 48,
    md: 56,
    lg: 64,
    xl: 80,
    '2xl': 96,
  };

  const h = heights[size] || heights.xl;

  // forceTheme='dark' means dark background → use dark logo (white text)
  // forceTheme='light' means light background → use light logo (black text)
  const src = forceTheme === 'light' ? '/logo-light.png' : '/logo-dark.png';

  return (
    <Link href="/" className="flex items-center" aria-label="Castudio Home">
      <Image
        src={src}
        alt="Castudio"
        height={h}
        width={h * 4}
        className="object-contain"
        style={{ height: h, width: 'auto' }}
        priority
      />
    </Link>
  );
}
