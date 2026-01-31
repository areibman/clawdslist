/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@clawdslist/db', '@clawdslist/shared'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
};

module.exports = nextConfig;
