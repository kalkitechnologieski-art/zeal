import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const ADMIN_ROLES = new Set(["SUPER_ADMIN", "ADMIN", "SUPPORT", "VIEWER"]);
const CONSULTANT_ROLES = new Set(["CLIENT_ADMIN", "SUPER_ADMIN"]);

// Route → minimum role. Anything not listed requires only auth.
const ADMIN_ROUTE_MIN: Array<{ prefix: string; roles: Set<string> }> = [
  { prefix: "/settings",      roles: new Set(["SUPER_ADMIN"]) },
  { prefix: "/platform-fee",  roles: new Set(["SUPER_ADMIN"]) },
  { prefix: "/users",         roles: new Set(["SUPER_ADMIN", "ADMIN"]) },
  { prefix: "/consultants",   roles: new Set(["SUPER_ADMIN", "ADMIN"]) },
  { prefix: "/verification",  roles: new Set(["SUPER_ADMIN", "ADMIN"]) },
  { prefix: "/withdrawals",   roles: new Set(["SUPER_ADMIN", "ADMIN"]) },
  { prefix: "/broadcast",     roles: new Set(["SUPER_ADMIN", "ADMIN"]) },
  { prefix: "/recordings",    roles: new Set(["SUPER_ADMIN", "ADMIN", "SUPPORT"]) },
  { prefix: "/bookings",      roles: new Set(["SUPER_ADMIN", "ADMIN", "SUPPORT"]) },
  { prefix: "/wallet",        roles: new Set(["SUPER_ADMIN", "ADMIN", "SUPPORT"]) },
  { prefix: "/dashboard",     roles: new Set(["SUPER_ADMIN", "ADMIN", "SUPPORT", "VIEWER"]) },
];

const PUBLIC_ROUTES = new Set([
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/callback",
  "/api/health",
  "/api/auth/sync-user",
  "/api/ai/horoscope",
  "/api/ai/tarot",
  "/api/ai/kundali",
  "/api/ai/numerology",
  "/api/ai/palmistry",
  "/api/zeal/chat",
  "/api/zeal/categories",
  "/api/explore/consultants",
  "/api/explore/search",
  "/api/explore/trending",
  "/api/wallet/webhooks/razorpay",
  "/api/wallet/webhooks/instamojo",
  "/api/cron/reminders",
]);

const PUBLIC_PREFIXES = ["/white-label/"];

function isPublic(path: string): boolean {
  if (PUBLIC_ROUTES.has(path)) return true;
  if (PUBLIC_PREFIXES.some((p) => path.startsWith(p))) return true;
  if (path.startsWith("/api/ai/")) return true;
  return false;
}

function adminRoleFor(path: string): Set<string> | null {
  for (const r of ADMIN_ROUTE_MIN) {
    if (path === r.prefix || path.startsWith(r.prefix + "/")) return r.roles;
  }
  return null;
}

export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Env missing (build time) → passthrough
  if (!url || !anonKey) return NextResponse.next();

  const path = request.nextUrl.pathname;
  const host = request.headers.get("host") || "";
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || "localhost:3000";

  // ─── Subdomain rewrite ────────────────────────────────────────────────
  // If host is `<sub>.zeal.com` and path is not already a white-label route,
  // rewrite to /white-label/<sub>/<path>.
  if (
    host &&
    host !== baseDomain &&
    host.endsWith("." + baseDomain) &&
    !path.startsWith("/white-label/") &&
    !path.startsWith("/api/") &&
    !path.startsWith("/_next/")
  ) {
    const sub = host.slice(0, -(baseDomain.length + 1));
    if (sub && /^[a-z0-9-]+$/.test(sub)) {
      const rewritten = request.nextUrl.clone();
      rewritten.pathname = "/white-label/" + sub + (path === "/" ? "" : path);
      return NextResponse.rewrite(rewritten);
    }
  }

  // ─── Public routes bypass auth ────────────────────────────────────────
  if (isPublic(path)) return NextResponse.next();

  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      get(name) { return request.cookies.get(name)?.value; },
      set(name, value, options) { response.cookies.set({ name, value, ...options }); },
      remove(name, options) { response.cookies.set({ name, value: "", ...options }); },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  // ─── Not authenticated ────────────────────────────────────────────────
  if (!user) {
    if (path.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 },
      );
    }
    const redirect = new URL("/auth/login", request.url);
    redirect.searchParams.set("next", path);
    return NextResponse.redirect(redirect);
  }

  const role = (user.app_metadata?.role as string | undefined) ?? "USER";

  // ─── Admin route RBAC ─────────────────────────────────────────────────
  if (path.startsWith("/admin")) {
    if (!ADMIN_ROLES.has(role)) {
      const redirect = new URL("/dashboard", request.url);
      redirect.searchParams.set("error", "not_admin");
      return NextResponse.redirect(redirect);
    }
    const apiPath = path.replace(/^\/admin/, "/api/admin");
    const required = adminRoleFor(apiPath);
    if (required && !required.has(role)) {
      const redirect = new URL("/dashboard", request.url);
      redirect.searchParams.set("error", "insufficient_role");
      return NextResponse.redirect(redirect);
    }
  }

  // ─── Consultant route RBAC ────────────────────────────────────────────
  if (path.startsWith("/consultant/")) {
    // Allow onboarding + pending for anyone signed in.
    const exempt = ["/consultant/onboarding", "/consultant/pending"];
    const isExempt = exempt.some((e) => path.startsWith(e));
    if (!isExempt && !CONSULTANT_ROLES.has(role)) {
      const redirect = new URL("/consultant/onboarding", request.url);
      return NextResponse.redirect(redirect);
    }
  }

  // ─── Attach identity to request headers for downstream routes ─────────
  response.headers.set("x-user-id", user.id);
  response.headers.set("x-user-role", role);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|ico)).*)",
  ],
};

