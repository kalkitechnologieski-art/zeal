/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@zeal/ui', '@zeal/types', '@zeal/utils'],
  experimental: {
    serverActions: {
      enabled: true,
    },
  },
  // Turbopack configuration for Next.js 16 [5†L4-L7][5†L10-L14]
  turbopack: {
    // Ignore specific issues if needed
    // ignoreIssues: [/Module not found/],
  },
};

module.exports = nextConfig;
