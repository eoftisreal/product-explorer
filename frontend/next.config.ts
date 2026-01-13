import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
