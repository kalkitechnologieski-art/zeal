import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const url = request.nextUrl.clone();
  
  // --- 1. WILDCARD SUBDOMAIN ROUTING ---
  const hostname = request.headers.get("host") || "";
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || "zeal.com"; // Set in Netlify ENV
  
  // Extract subdomain (e.g., 'astromohan' from 'astromohan.zeal.com')
  const isSubdomain = hostname.endsWith(`.${baseDomain}`);
  if (isSubdomain && !hostname.includes("www.")) {
    const subdomain = hostname.replace(`.${baseDomain}`, "");
    // Rewrite the request to the white-label path
    url.pathname = `/white-label/${subdomain}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // --- 2. AUTHENTICATION PROTECTION ---
  const protectedPrefixes = ['/dashboard', '/wallet', '/consultant', '/settings'];
  const isProtected = protectedPrefixes.some(prefix => url.pathname.startsWith(prefix));

  if (isProtected && !user) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && (url.pathname === '/login' || url.pathname === '/register')) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|api|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
