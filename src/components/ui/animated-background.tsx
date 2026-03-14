import React, { useMemo } from 'react';
import styles from './animated-background.module.css';

interface AnimatedBackgroundProps {
  className?: string;
  position?: 'fixed' | 'absolute';
}

export function AnimatedBackground({ className = '', position = 'fixed' }: AnimatedBackgroundProps) {
  // Generate unique IDs to prevent conflicts when multiple instances exist
  const uniqueId = useMemo(() => `bg-${Math.random().toString(36).substr(2, 9)}`, []);
  return (
    <div
      className={`${styles.backgroundContainer} ${className}`}
      style={{
        position,
        contain: 'layout style paint',
        isolation: 'isolate'
      }}
    >
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.svg}
        style={{ pointerEvents: 'none' }}
      >
        <defs>
          {/* Deep: brand base to slightly lighter */}
          <linearGradient id={`${uniqueId}-gradDeep`} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#0D0D39', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#1E1E4D', stopOpacity: 0.9 }} />
          </linearGradient>

          {/* Mid: lighter tint fading back to brand */}
          <linearGradient id={`${uniqueId}-gradMid`} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#272754', stopOpacity: 0.85 }} />
            <stop offset="100%" style={{ stopColor: '#0D0D39', stopOpacity: 0.4 }} />
          </linearGradient>

          {/* Light: most visible highlight, brand + white */}
          <linearGradient id={`${uniqueId}-gradLight`} x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#30305E', stopOpacity: 0.7 }} />
            <stop offset="100%" style={{ stopColor: '#0D0D39', stopOpacity: 0 }} />
          </linearGradient>

          {/* Ribbon: subtle accent sweep */}
          <linearGradient id={`${uniqueId}-gradRibbon`} x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" style={{ stopColor: '#1E1E4D', stopOpacity: 0.5 }} />
            <stop offset="100%" style={{ stopColor: '#0D0D39', stopOpacity: 0 }} />
          </linearGradient>
        </defs>

        <rect width="1440" height="900" fill="#0D0D39" />

        <path
          className={`${styles.wave} ${styles.layer1}`}
          d="M0 900 C 600 900 800 200 1440 100 L 1440 900 Z"
          fill={`url(#${uniqueId}-gradDeep)`}
        />

        <path
          className={`${styles.wave} ${styles.layer2}`}
          d="M1440 0 C 1000 0 800 700 100 900 L 1440 900 Z"
          fill={`url(#${uniqueId}-gradMid)`}
        />

        <path
          className={`${styles.wave} ${styles.layer3}`}
          d="M-100 400 C 400 400 700 0 1100 0 L 1440 0 L 1440 300 C 1000 300 800 800 300 800 Z"
          fill={`url(#${uniqueId}-gradLight)`}
        />

        <path
          className={`${styles.wave} ${styles.layer4}`}
          d="M0 200 C 500 200 700 600 0 800 Z"
          fill={`url(#${uniqueId}-gradRibbon)`}
          style={{ mixBlendMode: 'screen' }}
        />

        <path
          className={`${styles.wave} ${styles.layer5}`}
          d="M0 0 C 400 0 600 400 0 600 Z"
          fill={`url(#${uniqueId}-gradDeep)`}
          opacity="0.4"
        />
      </svg>
    </div>
  );
}
