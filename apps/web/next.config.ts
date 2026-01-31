import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@clawdslist/db", "@clawdslist/shared"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.discordapp.com" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
