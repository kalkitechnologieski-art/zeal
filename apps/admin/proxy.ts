import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export default async function proxy(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn("[Admin Proxy] Supabase env vars missing – skipping auth");
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

  // Admin routes: login and health are public
  const isPublicRoute = path === "/login" || path === "/api/health";

  if (isPublicRoute) return response;

  if (!session) {
    if (path.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Check admin role
  const role = session.user?.user_metadata?.role || "USER";
  if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login?error=Forbidden", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
