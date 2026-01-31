import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile monorepo packages
  transpilePackages: ["@clawdslist/db", "@clawdslist/shared"],
  
  // Skip type checking during build (run separately in CI)
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
