import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Force dynamic rendering for interactive admin and dashboard pages
  experimental: {
    // Disable static exports for routes with client-side interactivity
    staleTimes: {
      dynamic: 0,
      static: 180,
    },
  },
  // SEO optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  headers: async () => {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      // Placeholder images
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      // Unsplash images
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      // Local Supabase development instance
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '54321',
        pathname: '/storage/v1/object/**',
      },
      // Alternative localhost format for Supabase
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '54321',
        pathname: '/storage/v1/object/**',
      },
      // Production Supabase hosted instance
      // Format: https://[project-ref].supabase.co/storage/v1/object/...
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/**',
      },
      // Self-hosted Supabase instances (if needed in future)
      // Add your production domain here when deploying
      // {
      //   protocol: 'https',
      //   hostname: 'your-production-domain.com',
      //   port: '',
      //   pathname: '/storage/v1/object/**',
      // },
    ],
  },
  // Ensure environment variables are loaded
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
  },
};

export default nextConfig;
