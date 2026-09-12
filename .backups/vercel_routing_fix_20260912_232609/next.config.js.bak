/** @type {import('next').NextConfig} */
const path = require("path");

// Detect if we're in a monorepo (apps/web is nested)
const isMonorepo = __dirname.includes("apps");
const tracingRoot = isMonorepo
  ? path.join(__dirname, "../../")
  : __dirname;

const nextConfig = {
  reactStrictMode: true,

  // Transpile workspace packages
  transpilePackages: [
    "@zeal/database",
    "@zeal/ui",
    "@zeal/types",
    "@zeal/utils",
  ],

  // Image optimization
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

  // Compiler
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },

  // Experimental
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

  // Monorepo tracing
  outputFileTracingRoot: tracingRoot,

  // Disable powered-by header
  poweredByHeader: false,

  // Compression
  compress: true,

  // ─── Security headers (moved from vercel.json) ─────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(self), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      {
        source: "/api/health",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
      {
        source: "/api/realtime/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
      {
        source: "/api/wallet/webhooks/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
    ];
  },

  // ─── Redirects ─────────────────────────────────────────────────────────────
  async redirects() {
    return [
      { source: "/signin", destination: "/auth/login", permanent: true },
      { source: "/signup", destination: "/auth/register", permanent: true },
      { source: "/app", destination: "/dashboard", permanent: false },
    ];
  },
};

module.exports = nextConfig;
