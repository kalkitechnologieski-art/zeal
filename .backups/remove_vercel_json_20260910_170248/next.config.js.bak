/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Transpile workspace packages
  transpilePackages: [
    "@zeal/database",
    "@zeal/ui",
    "@zeal/types",
    "@zeal/utils",
  ],

  // Image optimization for external sources
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ui-avatars.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.r2.dev" },
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  // Compiler optimizations
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },

  // Experimental: enable server actions (already in use)
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "date-fns",
      "recharts",
    ],
  },

  // Production source maps (helps debugging on Vercel)
  productionBrowserSourceMaps: false,

  // Output file tracing root fix for monorepo
  outputFileTracingRoot: require("path").join(__dirname, "../../"),

  // Disable powered-by header
  poweredByHeader: false,

  // Compression
  compress: true,

  // Async redirects for common paths
  async redirects() {
    return [
      { source: "/signin", destination: "/auth/login", permanent: true },
      { source: "/signup", destination: "/auth/register", permanent: true },
      { source: "/app", destination: "/dashboard", permanent: false },
    ];
  },
};

module.exports = nextConfig;

// VERCEL_SETUP_APPLIED
