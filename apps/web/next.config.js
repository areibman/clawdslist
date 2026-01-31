/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@clawdslist/db', '@clawdslist/shared'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;
