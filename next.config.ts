import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Google user avatars
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      // GitHub avatars
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      // Discord avatars
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
      },
      // Cloudflare R2 / Images CDN
      {
        protocol: 'https',
        hostname: 'pub-*.r2.dev', // For R2 public buckets
      },
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com', // General R2 endpoint
      },
      {
        protocol: 'https',
        hostname: '*.cloudflareimages.com', // For Cloudflare Images service
      },
      {
        protocol: 'https',
        hostname: '*.cf-ipfs.com', // If you ever use IPFS via Cloudflare
      },
      {
        protocol: 'https',
        hostname: '*.piee.app', // Replace with your custom CDN domain
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  reactStrictMode: true,

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ]
  },
};

export default nextConfig;