#!/usr/bin/env bash
# =============================================================================
# PROJECT ZEAL – FINAL PUBLIC-FIRST PLATFORM
# =============================================================================
# This script:
#   1. Updates proxy.ts with comprehensive public/private route definitions.
#   2. Replaces profile/page.tsx with a clean version that shows login prompt.
#   3. Adds force-dynamic to public pages.
#   4. Runs a build to verify.
#
# Usage: ./final-public-first.sh
# =============================================================================

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log_info()  { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success(){ echo -e "${GREEN}[✓]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[⚠]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }

# -----------------------------------------------------------------------------
# 1. Update proxy.ts – Public-first middleware
# -----------------------------------------------------------------------------
log_info "Writing apps/web/proxy.ts (public-first routing)..."

cat > apps/web/proxy.ts <<'EOF'
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

  // ─── AUTH CHECK ──────────────────────────────────────────────────────────────
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
EOF

log_success "proxy.ts written"

# -----------------------------------------------------------------------------
# 2. Replace profile/page.tsx (clean version with login prompt)
# -----------------------------------------------------------------------------
log_info "Writing apps/web/app/profile/page.tsx (with login prompt)..."

mkdir -p apps/web/app/profile
cat > apps/web/app/profile/page.tsx <<'EOF'
"use client";

import { useAuth } from "@/components/providers/SupabaseAuthProvider";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, LogIn, Pencil, LayoutDashboard, Check } from "lucide-react";
import { Button, Avatar, AvatarImage, AvatarFallback, Tabs, TabsList, TabsTrigger, TabsContent } from "@zeal/ui";
import { PostGrid } from "@/components/profile/PostGrid";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center py-12 text-[#B8A1D9]">Loading profile...</div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <div className="w-20 h-20 rounded-full bg-[#F4E8F7] dark:bg-gray-800 flex items-center justify-center mb-4">
          <Sparkles className="w-10 h-10 text-[#9D7DC5]" />
        </div>
        <h2 className="text-2xl font-bold text-[#5E4B8B] dark:text-white mb-2">
          Please log in to view your profile
        </h2>
        <p className="text-[#B8A1D9] dark:text-gray-400 mb-6 max-w-sm">
          Sign in to access your profile, manage consultations, and connect with healers.
        </p>
        <Link href="/auth/login">
          <Button variant="primary" className="flex items-center gap-2 btn-luxury">
            <LogIn className="w-4 h-4" /> Sign In
          </Button>
        </Link>
        <p className="mt-4 text-sm text-[#B8A1D9] dark:text-gray-400">
          Don't have an account?{" "}
          <Link href="/auth/register" className="text-[#9D7DC5] hover:underline">
            Register
          </Link>
        </p>
      </div>
    );
  }

  const profile = {
    id: user.id,
    username: user.user_metadata?.username || user.email?.split("@")[0] || "user",
    bio: user.user_metadata?.bio || "Exploring spirituality and wellness.",
    avatar: user.user_metadata?.avatar_url || user.user_metadata?.avatar || "https://ui-avatars.com/api/?name=U&background=9D7DC5&color=fff",
    sparks: 0,
    posts: 0,
    followers: 0,
    isVerified: false,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto px-4 py-6"
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <Avatar className="w-24 h-24 border-4 border-[#E1C5E7]">
            <AvatarImage src={profile.avatar} alt={profile.username} />
            <AvatarFallback>{profile.username?.[0] || "U"}</AvatarFallback>
          </Avatar>
          {profile.isVerified && (
            <div className="absolute -bottom-1 -right-1 bg-[#9D7DC5] rounded-full p-0.5">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
        <h1 className="mt-3 text-xl font-bold text-[#5E4B8B] dark:text-white">@{profile.username}</h1>
        <p className="text-sm text-[#B8A1D9] dark:text-gray-400">{profile.bio}</p>

        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-[#FFD700]" />
            <span className="font-bold text-[#5E4B8B] dark:text-white">{profile.sparks.toLocaleString()}</span>
            <span className="text-sm text-[#B8A1D9] dark:text-gray-400">Sparks</span>
          </div>
          <div className="w-px h-6 bg-[#E1C5E7]" />
          <div>
            <span className="font-bold text-[#5E4B8B] dark:text-white">{profile.posts}</span>
            <span className="text-sm text-[#B8A1D9] dark:text-gray-400 ml-1">Posts</span>
          </div>
          <div className="w-px h-6 bg-[#E1C5E7]" />
          <div>
            <span className="font-bold text-[#5E4B8B] dark:text-white">{profile.followers}</span>
            <span className="text-sm text-[#B8A1D9] dark:text-gray-400 ml-1">Followers</span>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4 w-full max-w-xs">
          <Link href="/profile/edit" className="flex-1">
            <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
              <Pencil className="w-4 h-4" /> Edit Profile
            </Button>
          </Link>
          <Link href="/dashboard" className="flex-1">
            <Button variant="primary" className="w-full flex items-center justify-center gap-2">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="posts" className="mt-6">
        <TabsList className="w-full justify-center">
          <TabsTrigger value="posts">📸 Posts</TabsTrigger>
          <TabsTrigger value="saved">💾 Saved</TabsTrigger>
          <TabsTrigger value="tagged">🏷️ Tagged</TabsTrigger>
        </TabsList>
        <TabsContent value="posts">
          <PostGrid userId={profile.id} />
        </TabsContent>
        <TabsContent value="saved">
          <div className="text-center py-12 text-[#B8A1D9] dark:text-gray-400">No saved posts yet</div>
        </TabsContent>
        <TabsContent value="tagged">
          <div className="text-center py-12 text-[#B8A1D9] dark:text-gray-400">No tagged posts yet</div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
EOF

log_success "profile/page.tsx written"

# -----------------------------------------------------------------------------
# 3. Add force-dynamic to public pages
# -----------------------------------------------------------------------------
log_info "Adding force-dynamic to public pages..."

ensure_force_dynamic() {
  local file="$1"
  if [[ -f "$file" ]]; then
    if ! grep -q "export const dynamic" "$file"; then
      echo 'export const dynamic = "force-dynamic";' >> "$file"
      log_success "Added force-dynamic to $file"
    fi
  fi
}

ensure_force_dynamic "apps/web/app/page.tsx"
ensure_force_dynamic "apps/web/app/explore/page.tsx"
ensure_force_dynamic "apps/web/app/services/page.tsx"
ensure_force_dynamic "apps/web/app/ai-astrologers/page.tsx"

# -----------------------------------------------------------------------------
# 4. Run build to verify
# -----------------------------------------------------------------------------
log_info "Running build to verify..."
if npm run build --workspace=web; then
  log_success "✅ Build passed!"
else
  log_error "❌ Build failed – check errors manually"
fi

# -----------------------------------------------------------------------------
# 5. Final summary
# -----------------------------------------------------------------------------
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Public-first platform setup complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Public pages (no login required):"
echo "  ✅ /                    – Landing"
echo "  ✅ /explore             – Browse consultants"
echo "  ✅ /services            – All services"
echo "  ✅ /ai-astrologers      – AI astrologers"
echo "  ✅ /consultant/[id]     – Consultant profiles"
echo "  ✅ /auth/*              – Login, Register, Callback"
echo ""
echo "Protected pages (login required):"
echo "  🔒 /dashboard, /profile, /bookings, /chat"
echo "  🔒 /sparks, /wallet, /referral, /quests"
echo "  🔒 /bazaar, /create, /notifications"
echo "  🔒 /api/bookings, /api/wallet, /api/calls, /api/admin"
echo ""
echo "Deploy with: vercel --prod"