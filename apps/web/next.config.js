/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@clawdslist/db', '@clawdslist/shared'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
    ],
  },
}

module.exports = nextConfig
