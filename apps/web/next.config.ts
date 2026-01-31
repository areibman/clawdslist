import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@clawdslist/shared", "@clawdslist/db"],
};

export default nextConfig;
