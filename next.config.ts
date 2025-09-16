require('dotenv').config();

import type {NextConfig} from 'next';

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: ({ request }) => request.mode === 'navigate',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    {
        urlPattern: /\.(?:js|css|woff2|png|svg|jpg|jpeg)$/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-assets',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 Days
          },
        },
    },
    {
        urlPattern: ({url}) => url.protocol.startsWith('https:'),
        handler: 'NetworkFirst',
        options: {
            cacheName: 'api-and-images',
            networkTimeoutSeconds: 10,
            expiration: {
                maxEntries: 60,
                maxAgeSeconds: 24 * 60 * 60, // 1 day
            },
            cacheableResponse: {
                statuses: [0, 200],
            },
        },
    }
  ],
});

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config) => {
    // Required by pdfjs-dist
    config.resolve.alias.canvas = false;
    return config;
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  serverActions: {
    bodySizeLimit: '4.5mb',
  }
};

export default withPWA(nextConfig);
