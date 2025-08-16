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
};

export default nextConfig;