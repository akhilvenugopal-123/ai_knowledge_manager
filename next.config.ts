/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.svgrepo.com',
        pathname: '/**', // Allows all image paths from this domain
      },
    ],
  },
};

module.exports = nextConfig;