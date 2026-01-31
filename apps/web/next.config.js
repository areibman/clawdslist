/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@clawdslist/db', '@clawdslist/shared'],
  images: {
    domains: ['localhost'],
  },
};

module.exports = nextConfig;
