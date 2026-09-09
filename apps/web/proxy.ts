import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function proxy(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn("[Proxy] Supabase env vars missing – skipping auth");
    return NextResponse.next();
  }

  const { createServerClient } = await import("@supabase/ssr");

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name) { return request.cookies.get(name)?.value; },
      set(name, value, options) { response.cookies.set({ name, value, ...options }); },
      remove(name, options) { response.cookies.set({ name, value: "", ...options }); },
    },
  });

  const { data: { session } } = await supabase.auth.getSession();
  const path = request.nextUrl.pathname;

  // ─── PUBLIC ROUTES ──────────────────────────────────────────────────────────
  const isPublicRoute =
    path === "/" ||
    path === "/explore" ||
    path.startsWith("/explore/") ||
    path === "/services" ||
    path.startsWith("/services/") ||
    path.startsWith("/ai-astrologers") ||
    path.startsWith("/consultant/") ||
    path.startsWith("/auth/") ||
    path === "/auth/login" ||
    path === "/auth/register" ||
    path === "/auth/callback" ||
    path.startsWith("/api/health") ||
    path.startsWith("/api/ai/") ||
    path === "/api/posts/feed" ||
    path.startsWith("/api/explore/") ||
    path.startsWith("/api/webhooks") ||
    path === "/api/bazaar/listings";

  // ─── PRIVATE ROUTES (require auth) ──────────────────────────────────────────
  const isPrivateRoute =
    path.startsWith("/dashboard") ||
    path.startsWith("/profile") ||
    path.startsWith("/bookings") ||
    path.startsWith("/booking") ||
    path.startsWith("/chat") ||
    path.startsWith("/sparks") ||
    path.startsWith("/wallet") ||
    path.startsWith("/referral") ||
    path.startsWith("/quests") ||
    path.startsWith("/bazaar") ||
    path.startsWith("/create") ||
    path.startsWith("/notifications") ||
    path.startsWith("/payment") ||
    path.startsWith("/api/bookings") ||
    path.startsWith("/api/wallet") ||
    path.startsWith("/api/calls") ||
    path.startsWith("/api/admin") ||
    path.startsWith("/api/posts/create") ||
    path.startsWith("/api/notifications") ||
    path.startsWith("/api/sparks") ||
    path.startsWith("/api/referral") ||
    path.startsWith("/api/quests") ||
    path.startsWith("/api/meetings/token");

  // ─── ADMIN ROUTES (require admin role) ──────────────────────────────────────
  const isAdminRoute = path.startsWith("/admin") || path.startsWith("/api/admin");

  if (isPublicRoute) return response;

  if (isPrivateRoute && !session) {
    if (path.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && session) {
    const role = session.user?.user_metadata?.role || "USER";
    if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
