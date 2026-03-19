"use client";

import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  forceTheme?: 'light' | 'dark';
}

export function Logo({ size = 'xl', forceTheme }: LogoProps) {
  const fontSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
    '2xl': 'text-4xl',
  };

  const fontSize = fontSizes[size] || fontSizes.xl;

  // forceTheme='light' means light background → dark text
  // forceTheme='dark' means dark background → white text
  const textColor = forceTheme === 'dark' ? 'text-white' : 'text-brand-dark-blue';

  return (
    <Link href="/" className="flex items-center" aria-label="Castudio Home">
      <span className={`${fontSize} ${textColor} font-heading font-bold tracking-tight`}>
        Castudio
      </span>
    </Link>
  );
}
