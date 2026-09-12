import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const RESERVED = new Set(["www", "admin", "api", "app", "auth"]);

export async function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const host = request.headers.get("host") || "";
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || "zeal.com";

  // Only handle subdomain routing for the base domain
  if (host.endsWith(baseDomain)) {
    const slug = host.slice(0, host.length - baseDomain.length - 1);
    if (slug && !RESERVED.has(slug) && !url.pathname.startsWith("/white-label")) {
      const rewriteUrl = url.clone();
      rewriteUrl.pathname = `/white-label/${slug}${url.pathname}`;
      return NextResponse.rewrite(rewriteUrl);
    }
  }

  // Non-subdomain traffic: check auth for private routes
  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf)).*)",
  ],
};

// BATCH3_APPLIED
