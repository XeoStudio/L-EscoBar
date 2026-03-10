import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  experimental: {
    serverActions: {
      allowedOrigins: ["*.z.ai", "*.vercel.app", "localhost:3000"],
    },
  },
  // Required for Prisma with Edge Runtime
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;
