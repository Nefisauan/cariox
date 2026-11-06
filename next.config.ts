import type { NextConfig } from 'next';
const config: NextConfig = {
  images: {
    // Cloudflare can serve the existing optimized assets without an Images subscription.
    // Vercel retains its normal Next image optimizer. No visual/layout changes.
    unoptimized: process.env.CLOUDFLARE_BUILD === '1',
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io', pathname: '/images/**' }],
  },
};
export default config;
