import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@clawdslist/db", "@clawdslist/shared"],
};

export default nextConfig;
