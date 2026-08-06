/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@zeal/ui', '@zeal/types', '@zeal/utils'],
  experimental: {
    serverActions: {
      enabled: true,
    },
  },
  images: {
    domains: ['ui-avatars.com', 'images.unsplash.com', 'picsum.photos'],
    formats: ['image/avif', 'image/webp'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  compress: true,
  poweredByHeader: false,
  trailingSlash: false,
  swcMinify: true,
  // Production optimizations
  productionBrowserSourceMaps: false,
  optimizeFonts: true,
  // On-demand revalidation
  staticPageGenerationTimeout: 120,
};

module.exports = nextConfig;
