/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@clawdslist/shared", "@clawdslist/db"]
};

export default nextConfig;
