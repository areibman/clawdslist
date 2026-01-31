/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@clawdslist/db', '@clawdslist/shared'],
  images: {
    domains: ['localhost', 'placehold.co', 'images.unsplash.com'],
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
};

module.exports = nextConfig;
