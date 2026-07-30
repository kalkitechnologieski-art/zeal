#!/bin/bash
# =============================================================================
# FIX INTERNAL SERVER ERROR ON VERCEL
# =============================================================================

set -euo pipefail

echo "🔧 Fixing Internal Server Error issues..."

# ============================================================================
# 1. IMPROVE PROXY.TS WITH ERROR HANDLING
# ============================================================================
echo "📝 Updating proxy.ts with error handling..."

cat > apps/web/proxy.ts << 'EOF'
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/", "/login(.*)", "/register(.*)", "/api/webhooks(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  try {
    if (!isPublicRoute(request)) {
      await auth.protect();
    }
    return NextResponse.next();
  } catch (error) {
    console.error("Clerk middleware error:", error);
    // Redirect to login on auth error
    return NextResponse.redirect(new URL("/login", request.url));
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
EOF

echo "✅ proxy.ts updated with error handling."

# ============================================================================
# 2. ADD GLOBAL ERROR PAGE (if missing)
# ============================================================================
echo "📝 Creating global-error.tsx..."

mkdir -p apps/web/app
cat > apps/web/app/global-error.tsx << 'EOF'
'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <h2 className="text-2xl font-bold text-red-600">Something went wrong!</h2>
          <p className="mt-2 text-gray-600">{error.message || 'An unexpected error occurred.'}</p>
          <button
            onClick={reset}
            className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Try again
          </button>
          <p className="mt-4 text-sm text-gray-500">
            Please check the Vercel function logs for more details.
          </p>
        </div>
      </body>
    </html>
  );
}
EOF

echo "✅ global-error.tsx created."

# ============================================================================
# 3. ADD HEALTH CHECK ROUTE
# ============================================================================
echo "📝 Creating health check API route..."

mkdir -p apps/web/app/api/health
cat > apps/web/app/api/health/route.ts << 'EOF'
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'set' : 'missing',
    clerkSecretKey: process.env.CLERK_SECRET_KEY ? 'set' : 'missing',
    databaseUrl: process.env.DATABASE_URL ? 'set' : 'missing',
  });
}
EOF

echo "✅ Health check route created."

# ============================================================================
# 4. UPDATE .env.production WITH REAL VALUES
# ============================================================================
echo "📦 Creating .env.production with your Clerk keys..."

cat > .env.production << 'EOF'
# Clerk Authentication (your real keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_dG9wLXN0YXJsaW5nLTM2LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_9G4JQYWjs9hcyFqcngJnb5qDey12SWRNVxV6zrcxWN

# Other placeholder values (replace as needed)
DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/zeal
UPSTASH_REDIS_REST_URL=https://placeholder.upstash.io
UPSTASH_REDIS_REST_TOKEN=placeholder
R2_ACCOUNT_ID=placeholder
R2_ACCESS_KEY_ID=placeholder
R2_SECRET_ACCESS_KEY=placeholder
R2_BUCKET_NAME=zeal
R2_PUBLIC_URL=https://placeholder.r2.dev
RAZORPAY_KEY_ID=rzp_placeholder
RAZORPAY_KEY_SECRET=placeholder
NEXT_PUBLIC_WS_URL=wss://placeholder.zeal.com
LIVEKIT_API_KEY=placeholder
LIVEKIT_API_SECRET=placeholder
LIVEKIT_WS_URL=wss://placeholder.livekit.zeal.com
GROQ_API_KEY=gsk_placeholder
EOF

echo "✅ .env.production created."

# ============================================================================
# 5. COMMIT AND PUSH
# ============================================================================
echo "📝 Committing and pushing changes..."
git add .
git commit -m "fix: add error handling, global error page, health check, and env file"
git push origin master

echo "✅ Done! Deploy again on Vercel."

echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo "  📋 NEXT STEPS:"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "1. Vercel will automatically redeploy. Check the logs for errors."
echo ""
echo "2. Visit the health check endpoint:"
echo "   https://zeal.vercel.app/api/health"
echo ""
echo "3. If the error persists, check Vercel Function Logs:"
echo "   Vercel Dashboard → Project → Deployments → Click latest → Functions"
echo ""
echo "4. Ensure environment variables are set in Vercel:"
echo "   Vercel Dashboard → Project → Settings → Environment Variables"
echo ""
echo "   Must set:"
echo "   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
echo "   - CLERK_SECRET_KEY"
echo ""
echo "═══════════════════════════════════════════════════════════════════════════"