/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@zeal/ui', '@zeal/types'],
  images: {
    domains: ['ui-avatars.com'],
  },
};

module.exports = nextConfig;
