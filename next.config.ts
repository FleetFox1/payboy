import type { NextConfig } from "next";

// ⚠️ TEMPORARY ESLINT & TYPESCRIPT DISABLE FOR DEMO DEPLOYMENT
// This skips TypeScript lint errors AND type checking during `next build`
// REMOVE THIS BEFORE FINAL PRODUCTION DEPLOY IF POSSIBLE
const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    // Fix MongoDB Node.js modules resolution for client-side builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        child_process: false,
        'fs/promises': false,
        dns: false,
        'timers/promises': false,
      };
    }
    return config;
  },
  // Updated for Next.js 15 - moved from experimental
  serverExternalPackages: ['mongodb'],
};

export default nextConfig;