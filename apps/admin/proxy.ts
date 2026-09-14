import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const ADMIN_ROLES = new Set(["SUPER_ADMIN", "ADMIN", "SUPPORT", "VIEWER"]);

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return request.cookies.get(name)?.value; },
        set(name, value, options) { response.cookies.set({ name, value, ...options }); },
        remove(name, options) { response.cookies.set({ name, value: "", ...options }); },
      },
    },
  );

  // Refresh session — required for Server Components
  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic =
    path === "/" ||
    path.startsWith("/auth/") ||
    path.startsWith("/api/health") ||
    path.startsWith("/api/ai/") ||
    path.startsWith("/api/zeal/") ||
    path.startsWith("/white-label/") ||
    path.startsWith("/api/wallet/webhooks/") ||
    path.startsWith("/api/cron/");

  if (!isPublic && !user) {
    if (path.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }
    const login = new URL("/auth/login", request.url);
    login.searchParams.set("next", path);
    return NextResponse.redirect(login);
  }

  if (path.startsWith("/admin") && user) {
    const role = (user.app_metadata?.role as string) ?? "USER";
    if (!ADMIN_ROLES.has(role)) {
      return NextResponse.redirect(new URL("/dashboard?error=not_admin", request.url));
    }
  }

  if (user) {
    response.headers.set("x-user-id", user.id);
    response.headers.set("x-user-role", (user.app_metadata?.role as string) ?? "USER");
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|webp)).*)"],
};
