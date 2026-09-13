#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# PROJECT ZEAL — ENTERPRISE ADMIN FIX
# ═══════════════════════════════════════════════════════════════════════════════
# Idempotent. Backs up every file before overwriting.
# Run from project root:   ./scripts/zeal-enterprise-fix.sh
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

# ─── Colors ────────────────────────────────────────────────────────────────────
if [[ -t 1 ]]; then
  RED=$'\033[0;31m'; GREEN=$'\033[0;32m'; YELLOW=$'\033[1;33m'
  BLUE=$'\033[0;34m'; CYAN=$'\033[0;36m'; BOLD=$'\033[1m'; NC=$'\033[0m'
else
  RED=""; GREEN=""; YELLOW=""; BLUE=""; CYAN=""; BOLD=""; NC=""
fi

log()      { printf "%s[•]%s %s\n" "$BLUE" "$NC" "$*"; }
success()  { printf "%s[✓]%s %s\n" "$GREEN" "$NC" "$*"; }
warn()     { printf "%s[!]%s %s\n" "$YELLOW" "$NC" "$*"; }
fail()     { printf "%s[✗]%s %s\n" "$RED" "$NC" "$*" >&2; exit 1; }
section()  { printf "\n%s══ %s ══%s\n\n" "$CYAN" "$*" "$NC"; }

# ─── Locate project root ──────────────────────────────────────────────────────
if [[ ! -f "package.json" ]] || [[ ! -d "apps/admin" ]]; then
  fail "Run this script from the project root (must contain package.json and apps/admin/)"
fi

ROOT="$(pwd)"
TS="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="$ROOT/.backups/enterprise-fix-$TS"

section "Zeal Enterprise Fix"
log "Root:       $ROOT"
log "Backup:     $BACKUP_DIR"

mkdir -p "$BACKUP_DIR"

# ─── Backup helper ────────────────────────────────────────────────────────────
backup_file() {
  local f="$1"
  if [[ -f "$f" ]]; then
    local rel="${f#$ROOT/}"
    local dest="$BACKUP_DIR/$rel"
    mkdir -p "$(dirname "$dest")"
    cp "$f" "$dest"
  fi
}

# ─── Write helper (backs up, then writes) ─────────────────────────────────────
write_file() {
  local path="$1"
  local rel="${path#$ROOT/}"
  mkdir -p "$(dirname "$path")"
  backup_file "$path"
  cat > "$path"
  success "wrote $rel"
}

# ─── Ensure a directory exists ────────────────────────────────────────────────
ensure_dir() {
  mkdir -p "$1"
}

# ═══════════════════════════════════════════════════════════════════════════════
# MODULE 1 — FIX THE BUILD
# ═══════════════════════════════════════════════════════════════════════════════

section "Module 1 — Fix the build"

# ─── 1.1 Admin store (typed IncomingAlert payload) ────────────────────────────
write_file "$ROOT/apps/admin/lib/store/adminStore.ts" <<'EOF'
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ─── Role types ───────────────────────────────────────────────────────────────

export type AdminRole = "SUPER_ADMIN" | "ADMIN" | "SUPPORT" | "VIEWER";

export const ROLE_LEVEL: Record<AdminRole, number> = {
  SUPER_ADMIN: 100,
  ADMIN: 80,
  SUPPORT: 50,
  VIEWER: 10,
};

// ─── Notification ─────────────────────────────────────────────────────────────

export type NotificationType =
  | "chat"
  | "call"
  | "booking"
  | "system"
  | "payment"
  | "verification"
  | "reminder"
  | "referral"
  | "quest"
  | "new_post";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  redirectUrl?: string | null;
  read: boolean;
  actorId: string;
  actorName?: string | null;
  actorAvatar?: string | null;
  createdAt: string;
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export interface AdminProfile {
  id: string;
  email: string;
  role: AdminRole;
  name: string;
  avatar?: string | null;
  consultantId?: string;
  createdAt: string;
  mfaEnabled?: boolean;
}

// ─── Incoming alert (typed — fixes the build) ────────────────────────────────

export type IncomingAlertType = "chat" | "call" | "booking";

export interface IncomingAlertData {
  bookingId?: string;
  userId?: string;
  roomName?: string;
  userName?: string;
  clientName?: string;
  rate?: number;
  modality?: "chat" | "audio" | "video" | "physical";
  scheduledAt?: string;
}

export interface IncomingAlert {
  id: string;
  type: IncomingAlertType;
  message: string;
  data?: IncomingAlertData;
  read: boolean;
  createdAt: string;
}

// ─── State ────────────────────────────────────────────────────────────────────

interface AdminState {
  profile: AdminProfile | null;
  notifications: Notification[];
  unreadCount: number;
  isSocketConnected: boolean;
  incomingAlert: IncomingAlert | null;
  isAlertOpen: boolean;
  alertSoundMuted: boolean;
  isSidebarOpen: boolean;

  setProfile: (profile: AdminProfile | null) => void;
  hasRole: (min: AdminRole) => boolean;

  addNotification: (
    notif: Omit<Notification, "createdAt"> & { createdAt?: string },
  ) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  clearNotifications: () => void;

  setSocketConnected: (connected: boolean) => void;

  showIncomingAlert: (
    alert: Omit<IncomingAlert, "createdAt"> & { createdAt?: string },
  ) => void;
  dismissAlert: () => void;
  toggleAlertSound: () => void;
  toggleSidebar: () => void;
  logout: () => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      profile: null,
      notifications: [],
      unreadCount: 0,
      isSocketConnected: false,
      incomingAlert: null,
      isAlertOpen: false,
      alertSoundMuted: false,
      isSidebarOpen: true,

      setProfile: (profile) => set({ profile }),

      hasRole: (min) => {
        const role = get().profile?.role;
        if (!role) return false;
        return ROLE_LEVEL[role] >= ROLE_LEVEL[min];
      },

      addNotification: (notif) =>
        set((state) => {
          const createdAt = notif.createdAt || new Date().toISOString();
          const full = { ...notif, createdAt } as Notification;
          const updated = [full, ...state.notifications].slice(0, 100);
          return { notifications: updated, unreadCount: state.unreadCount + 1 };
        }),

      markNotificationRead: (id) =>
        set((state) => {
          const updated = state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          );
          return {
            notifications: updated,
            unreadCount: updated.filter((n) => !n.read).length,
          };
        }),

      markAllRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        })),

      clearNotifications: () => set({ notifications: [], unreadCount: 0 }),

      setSocketConnected: (connected) => set({ isSocketConnected: connected }),

      showIncomingAlert: (alert) =>
        set({
          incomingAlert: {
            ...alert,
            createdAt: alert.createdAt || new Date().toISOString(),
          } as IncomingAlert,
          isAlertOpen: true,
        }),

      dismissAlert: () => set({ isAlertOpen: false, incomingAlert: null }),

      toggleAlertSound: () =>
        set((state) => ({ alertSoundMuted: !state.alertSoundMuted })),

      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("zeal-admin-storage");
          window.location.href = "/login";
        }
      },
    }),
    {
      name: "zeal-admin-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        profile: state.profile,
        alertSoundMuted: state.alertSoundMuted,
        isSidebarOpen: state.isSidebarOpen,
      }),
    },
  ),
);
EOF

# ─── 1.2 IncomingAlertOverlay (typed, mounted, correct routes) ────────────────
write_file "$ROOT/apps/admin/components/alerts/IncomingAlertOverlay.tsx" <<'EOF'
"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  MessageCircle,
  Calendar,
  X,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useAdminStore } from "@/lib/store/adminStore";

export function IncomingAlertOverlay() {
  const router = useRouter();
  const {
    incomingAlert,
    isAlertOpen,
    alertSoundMuted,
    dismissAlert,
    toggleAlertSound,
  } = useAdminStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isAlertOpen && !alertSoundMuted && audioRef.current) {
      audioRef.current.loop = true;
      audioRef.current.play().catch(() => {
        /* Autoplay blocked until user gesture — silently ignore */
      });
    }
    if (!isAlertOpen && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [isAlertOpen, alertSoundMuted]);

  if (!isAlertOpen || !incomingAlert) return null;

  const { type, message, data } = incomingAlert;

  const icon = (() => {
    switch (type) {
      case "chat":
        return <MessageCircle className="w-12 h-12 text-blue-400" />;
      case "call":
        return <Phone className="w-12 h-12 text-green-400" />;
      case "booking":
        return <Calendar className="w-12 h-12 text-purple-400" />;
    }
  })();

  const title = (() => {
    switch (type) {
      case "chat":
        return "New Chat Request";
      case "call":
        return "Incoming Call";
      case "booking":
        return "New Booking Request";
    }
  })();

  const handleAccept = () => {
    switch (type) {
      case "call":
        router.push(data?.bookingId ? `/calls?highlight=${data.bookingId}` : "/calls");
        break;
      case "chat":
        router.push(data?.userId ? `/clients?highlight=${data.userId}` : "/clients");
        break;
      case "booking":
        router.push(
          data?.bookingId ? `/bookings?highlight=${data.bookingId}` : "/bookings",
        );
        break;
    }
    dismissAlert();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      >
        <audio ref={audioRef} src="/sounds/ringing.mp3" preload="auto" />

        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
          className="glass-card-3d max-w-md w-full p-8 text-center border border-white/20"
        >
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-[#9D7DC5]/20 flex items-center justify-center animate-pulse">
              {icon}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-white/70 mt-1">{message}</p>

          {data?.rate && (
            <p className="text-xs text-[#9D7DC5] mt-2">
              {data.modality ?? "session"} · ₹{data.rate}/min
            </p>
          )}

          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={dismissAlert}
              className="px-6 py-3 rounded-xl bg-red-500/20 text-red-400 font-medium hover:bg-red-500/30 transition-all"
            >
              <X className="w-5 h-5 inline mr-2" /> Dismiss
            </button>
            <button
              onClick={handleAccept}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#9D7DC5] to-[#533AFD] text-white font-medium hover:shadow-lg hover:shadow-[#533AFD]/30 transition-all"
            >
              View
            </button>
          </div>

          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={toggleAlertSound}
              className="text-white/50 hover:text-white transition-colors"
              aria-label={alertSoundMuted ? "Unmute alert" : "Mute alert"}
            >
              {alertSoundMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
EOF

# ─── 1.3 Root layout (mounts overlay) ─────────────────────────────────────────
write_file "$ROOT/apps/admin/app/layout.tsx" <<'EOF'
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SupabaseAuthProvider } from "@/components/providers/SupabaseAuthProvider";
import { RealtimeProvider } from "@/components/providers/RealtimeProvider";
import { QueryProvider } from "@/lib/query/provider";
import { IncomingAlertOverlay } from "@/components/alerts/IncomingAlertOverlay";
import "./globals.css";

export const metadata = {
  title: "Zeal Admin",
  description: "Zeal platform administration",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-gray-900 antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          themes={["light", "dark"]}
          disableTransitionOnChange
        >
          <QueryProvider>
            <SupabaseAuthProvider>
              <RealtimeProvider>
                {children}
                <IncomingAlertOverlay />
              </RealtimeProvider>
            </SupabaseAuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
EOF

# ─── 1.4 Sound placeholder ────────────────────────────────────────────────────
ensure_dir "$ROOT/apps/admin/public/sounds"
if [[ ! -f "$ROOT/apps/admin/public/sounds/ringing.mp3" ]]; then
  # 0-byte placeholder — replace with real ringtone
  : > "$ROOT/apps/admin/public/sounds/ringing.mp3"
  warn "created empty apps/admin/public/sounds/ringing.mp3 — replace with a real ringtone"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# MODULE 2 — RBAC FOUNDATION
# ═══════════════════════════════════════════════════════════════════════════════

section "Module 2 — RBAC foundation"

write_file "$ROOT/apps/admin/lib/auth/roles.ts" <<'EOF'
export type AdminRole = "SUPER_ADMIN" | "ADMIN" | "SUPPORT" | "VIEWER";

export const ROLE_LEVEL: Record<AdminRole, number> = {
  SUPER_ADMIN: 100,
  ADMIN: 80,
  SUPPORT: 50,
  VIEWER: 10,
};

export const ADMIN_ROLES: readonly AdminRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "SUPPORT",
  "VIEWER",
] as const;

export function isAdminRole(value: unknown): value is AdminRole {
  return (
    typeof value === "string" &&
    (ADMIN_ROLES as readonly string[]).includes(value)
  );
}

export function roleAtLeast(role: AdminRole, min: AdminRole): boolean {
  return ROLE_LEVEL[role] >= ROLE_LEVEL[min];
}

export function isAdmin(role: AdminRole | null | undefined): role is AdminRole {
  return !!role && isAdminRole(role);
}
EOF

# ═══════════════════════════════════════════════════════════════════════════════
# MODULE 3 — AUDIT / RATE-LIMIT / INVITES
# ═══════════════════════════════════════════════════════════════════════════════

section "Module 3 — Audit, rate-limit, invites"

write_file "$ROOT/apps/admin/lib/auth/audit.ts" <<'EOF'
import "server-only";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export interface AuditParams {
  userId?: string | null;
  email?: string | null;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  ip?: string | null;
  userAgent?: string | null;
  success?: boolean;
}

export async function audit(params: AuditParams): Promise<void> {
  const sb = getAdminClient();
  if (!sb) {
    console.warn("[audit] Supabase admin client unavailable");
    return;
  }
  try {
    await sb.from("AdminAuditLog").insert({
      userId: params.userId ?? null,
      email: params.email ?? null,
      action: params.action,
      targetType: params.targetType ?? null,
      targetId: params.targetId ?? null,
      metadata: params.metadata ?? null,
      ip: params.ip ?? null,
      userAgent: params.userAgent ?? null,
      success: params.success ?? true,
    });
  } catch (err) {
    console.error("[audit] insert failed:", err);
  }
}
EOF

write_file "$ROOT/apps/admin/lib/auth/rate-limit.ts" <<'EOF'
import "server-only";
import { createClient } from "@supabase/supabase-js";

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function recordLoginAttempt(
  email: string,
  ip: string | null,
  success: boolean,
  reason?: string,
): Promise<void> {
  const sb = getAdminClient();
  if (!sb) return;
  try {
    await sb.from("AdminLoginAttempt").insert({ email, ip, success, reason });
  } catch (err) {
    console.warn("[rate-limit] record failed:", err);
  }
}

export async function isRateLimited(email: string): Promise<boolean> {
  const sb = getAdminClient();
  if (!sb) return false;

  const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();
  const { count } = await sb
    .from("AdminLoginAttempt")
    .select("*", { count: "exact", head: true })
    .eq("email", email)
    .eq("success", false)
    .gte("createdAt", since);

  return (count ?? 0) >= MAX_ATTEMPTS;
}

export function getClientIp(req: Request): string | null {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    null
  );
}
EOF

write_file "$ROOT/apps/admin/lib/auth/invites.ts" <<'EOF'
import "server-only";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import type { AdminRole } from "./roles";

const INVITE_TTL_HOURS = 72;

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase service role not configured");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export interface CreateInviteResult {
  token: string;
  expiresAt: string;
}

export async function createInvite(params: {
  email: string;
  role: AdminRole;
  invitedBy: string;
}): Promise<CreateInviteResult> {
  const sb = getAdminClient();

  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(
    Date.now() + INVITE_TTL_HOURS * 3600 * 1000,
  ).toISOString();

  await sb
    .from("AdminInvite")
    .update({ revokedAt: new Date().toISOString() })
    .eq("email", params.email.toLowerCase())
    .is("acceptedAt", null)
    .is("revokedAt", null);

  const { error } = await sb.from("AdminInvite").insert({
    email: params.email.toLowerCase(),
    role: params.role,
    tokenHash,
    invitedBy: params.invitedBy,
    expiresAt,
  });
  if (error) throw new Error(`Failed to create invite: ${error.message}`);

  return { token, expiresAt };
}

export interface VerifiedInvite {
  id: string;
  email: string;
  role: AdminRole;
  expiresAt: string;
}

export async function verifyInvite(
  token: string,
): Promise<VerifiedInvite | null> {
  const sb = getAdminClient();
  const tokenHash = hashToken(token);

  const { data, error } = await sb
    .from("AdminInvite")
    .select("id, email, role, expiresAt, acceptedAt, revokedAt")
    .eq("tokenHash", tokenHash)
    .single();

  if (error || !data) return null;
  if (data.acceptedAt) return null;
  if (data.revokedAt) return null;
  if (new Date(data.expiresAt).getTime() < Date.now()) return null;

  return {
    id: data.id,
    email: data.email,
    role: data.role as AdminRole,
    expiresAt: data.expiresAt,
  };
}

export async function acceptInvite(inviteId: string): Promise<void> {
  const sb = getAdminClient();
  await sb
    .from("AdminInvite")
    .update({ acceptedAt: new Date().toISOString() })
    .eq("id", inviteId);
}
EOF

# ═══════════════════════════════════════════════════════════════════════════════
# MODULE 4 — ENTERPRISE MIDDLEWARE
# ═══════════════════════════════════════════════════════════════════════════════

section "Module 4 — Enterprise middleware"

write_file "$ROOT/apps/admin/proxy.ts" <<'EOF'
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isAdminRole, roleAtLeast, type AdminRole } from "@/lib/auth/roles";

// ─── Route permission map ─────────────────────────────────────────────────────
const ROUTE_MIN_ROLE: Array<{ prefix: string; min: AdminRole }> = [
  { prefix: "/settings", min: "SUPER_ADMIN" },
  { prefix: "/users", min: "ADMIN" },
  { prefix: "/consultants", min: "ADMIN" },
  { prefix: "/verification", min: "ADMIN" },
  { prefix: "/withdrawals", min: "ADMIN" },
  { prefix: "/broadcast", min: "ADMIN" },
  { prefix: "/platform-fee", min: "SUPER_ADMIN" },
  { prefix: "/recordings", min: "SUPPORT" },
  { prefix: "/bookings", min: "SUPPORT" },
  { prefix: "/calls", min: "SUPPORT" },
  { prefix: "/clients", min: "SUPPORT" },
  { prefix: "/wallet", min: "SUPPORT" },
  { prefix: "/analytics", min: "VIEWER" },
  { prefix: "/dashboard", min: "VIEWER" },
];

// ─── Public routes ────────────────────────────────────────────────────────────
const PUBLIC_ROUTES = new Set<string>([
  "/login",
  "/forgot-password",
  "/reset-password",
  "/accept-invite",
  "/mfa",
  "/api/health",
]);

const PUBLIC_PREFIXES = ["/api/auth/"];

function minRoleForPath(path: string): AdminRole {
  for (const { prefix, min } of ROUTE_MIN_ROLE) {
    if (path === prefix || path.startsWith(prefix + "/")) return min;
  }
  return "VIEWER";
}

function isPublic(path: string): boolean {
  if (PUBLIC_ROUTES.has(path)) return true;
  return PUBLIC_PREFIXES.some((p) => path.startsWith(p));
}

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During build or if env missing → passthrough
  if (!url || !anonKey) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      get(name) {
        return request.cookies.get(name)?.value;
      },
      set(name, value, options) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name, options) {
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  const path = request.nextUrl.pathname;

  // ─── Public routes bypass auth ──────────────────────────────────────────
  if (isPublic(path)) return response;

  // ─── Require a session ──────────────────────────────────────────────────
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (path.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 },
      );
    }
    const redirect = new URL("/login", request.url);
    redirect.searchParams.set("next", path);
    return NextResponse.redirect(redirect);
  }

  // ─── Verify admin role from app_metadata (user cannot self-write) ───────
  const role = user.app_metadata?.role as unknown;
  if (!isAdminRole(role)) {
    if (path.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Forbidden", code: "FORBIDDEN" },
        { status: 403 },
      );
    }
    const redirect = new URL("/login", request.url);
    redirect.searchParams.set("error", "not_admin");
    return NextResponse.redirect(redirect);
  }

  // ─── Enforce per-route minimum role ─────────────────────────────────────
  const minRole = minRoleForPath(path);
  if (!roleAtLeast(role, minRole)) {
    if (path.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Insufficient permissions", code: "FORBIDDEN", required: minRole },
        { status: 403 },
      );
    }
    const redirect = new URL("/dashboard", request.url);
    redirect.searchParams.set("error", "insufficient_role");
    return NextResponse.redirect(redirect);
  }

  // ─── Attach role to request headers for downstream routes ───────────────
  response.headers.set("x-admin-id", user.id);
  response.headers.set("x-admin-role", role);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
EOF

# ═══════════════════════════════════════════════════════════════════════════════
# MODULE 5 — ENTERPRISE LOGIN
# ═══════════════════════════════════════════════════════════════════════════════

section "Module 5 — Enterprise login"

write_file "$ROOT/apps/admin/app/(auth)/layout.tsx" <<'EOF'
import { Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#3D2A5A] via-[#533AFD] to-[#2D1B3D] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-8 h-8 text-white" />
            <span className="text-3xl font-bold text-white drop-shadow-lg">
              Zeal Admin
            </span>
          </div>
          <p className="text-white/60 text-sm">
            Restricted access · Authorized personnel only
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
EOF

write_file "$ROOT/apps/admin/app/(auth)/login/page.tsx" <<'EOF'
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@zeal/ui";
import {
  Mail,
  Lock,
  Loader2,
  Shield,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (errorParam === "not_admin") {
      setError("You do not have admin access. Contact your administrator.");
    } else if (errorParam === "insufficient_role") {
      setError("Your role does not permit access to that page.");
    } else if (errorParam === "session_expired") {
      setError("Your session expired. Please sign in again.");
    }
  }, [errorParam]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) throw new Error("Invalid credentials");
      if (!data.user) throw new Error("Sign in failed. Please try again.");

      const role = data.user.app_metadata?.role as string | undefined;
      const validRoles = ["SUPER_ADMIN", "ADMIN", "SUPPORT", "VIEWER"];

      if (!role || !validRoles.includes(role)) {
        await supabase.auth.signOut();
        throw new Error(
          "Access denied. This account is not authorized for admin access.",
        );
      }

      // ─── MFA gate ─────────────────────────────────────────────────────
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
        router.push(`/mfa?next=${encodeURIComponent(next)}`);
        return;
      }

      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 180, damping: 22 }}
    >
      <div className="rounded-3xl p-6 md:p-8 backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-5 h-5 text-[#9D7DC5]" />
          <h1 className="text-lg font-semibold text-white">Sign in</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="admin-email"
              className="block text-sm font-medium text-white/80 mb-1.5"
            >
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-white/10 border border-white/20 px-10 py-3 text-white placeholder:text-white/50 focus:ring-2 focus:ring-[#9D7DC5] outline-none transition-all"
                placeholder="admin@zeal.com"
                required
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="admin-password"
                className="block text-sm font-medium text-white/80"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-[#9D7DC5] hover:underline"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-white/10 border border-white/20 px-10 py-3 text-white placeholder:text-white/50 focus:ring-2 focus:ring-[#9D7DC5] outline-none transition-all"
                placeholder="••••••••"
                required
                autoComplete="current-password"
                minLength={8}
              />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 text-sm text-red-300 bg-red-500/15 p-3 rounded-xl border border-red-500/30"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          <Button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full py-3 bg-gradient-to-r from-[#9D7DC5] to-[#533AFD] text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Signing in…
              </>
            ) : (
              <>
                Sign In <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-white/10 text-center">
          <p className="text-xs text-white/50">
            Admin access is invite-only. Contact your super-admin for an invitation.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-white" />
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
EOF

# ═══════════════════════════════════════════════════════════════════════════════
# MODULE 6 — MFA / FORGOT / RESET / ACCEPT INVITE
# ═══════════════════════════════════════════════════════════════════════════════

section "Module 6 — MFA, forgot, reset, accept-invite"

write_file "$ROOT/apps/admin/app/(auth)/mfa/page.tsx" <<'EOF'
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@zeal/ui";
import { Loader2, Shield, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

function MfaInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error || !data?.totp?.length) {
        setError("No MFA factor found. Contact your administrator.");
        return;
      }
      setFactorId(data.totp[0].id);
    })();
  }, [supabase]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId) return;
    setLoading(true);
    setError(null);

    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) throw challenge.error;

      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: code.trim(),
      });
      if (verify.error) throw verify.error;

      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
      setCode("");
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl p-6 md:p-8 backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl"
    >
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-[#9D7DC5]" />
        <h1 className="text-lg font-semibold text-white">
          Two-factor authentication
        </h1>
      </div>

      <p className="text-sm text-white/70 mb-6">
        Enter the 6-digit code from your authenticator app.
      </p>

      <form onSubmit={handleVerify} className="space-y-4">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-4 text-center text-2xl tracking-widest text-white placeholder:text-white/30 focus:ring-2 focus:ring-[#9D7DC5] outline-none transition-all"
          placeholder="000000"
          required
          autoFocus
        />

        {error && (
          <div className="flex items-start gap-2 text-sm text-red-300 bg-red-500/15 p-3 rounded-xl border border-red-500/30">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading || code.length !== 6 || !factorId}
          className="w-full py-3 bg-gradient-to-r from-[#9D7DC5] to-[#533AFD] text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
        </Button>
      </form>
    </motion.div>
  );
}

export default function MfaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-white" />
        </div>
      }
    >
      <MfaInner />
    </Suspense>
  );
}
EOF

write_file "$ROOT/apps/admin/app/(auth)/forgot-password/page.tsx" <<'EOF'
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@zeal/ui";
import { Mail, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const baseUrl =
      process.env.NEXT_PUBLIC_ADMIN_URL || window.location.origin;
    await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${baseUrl}/reset-password`,
    });

    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-6 md:p-8 backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl text-center"
      >
        <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
        <h1 className="text-lg font-semibold text-white mb-2">
          Check your inbox
        </h1>
        <p className="text-sm text-white/70">
          If an admin account exists for {email}, a reset link is on its way.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-sm text-[#9D7DC5] hover:underline mt-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to sign in
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl p-6 md:p-8 backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl"
    >
      <h1 className="text-lg font-semibold text-white mb-2">Reset password</h1>
      <p className="text-sm text-white/70 mb-6">
        Enter your admin email and we'll send a reset link.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl bg-white/10 border border-white/20 px-10 py-3 text-white placeholder:text-white/50 focus:ring-2 focus:ring-[#9D7DC5] outline-none"
            placeholder="admin@zeal.com"
            required
            autoFocus
          />
        </div>
        <Button
          type="submit"
          disabled={loading || !email}
          className="w-full py-3 bg-gradient-to-r from-[#9D7DC5] to-[#533AFD] text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Send reset link"
          )}
        </Button>
      </form>

      <Link
        href="/login"
        className="inline-flex items-center gap-1 text-sm text-[#9D7DC5] hover:underline mt-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to sign in
      </Link>
    </motion.div>
  );
}
EOF

write_file "$ROOT/apps/admin/app/(auth)/reset-password/page.tsx" <<'EOF'
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@zeal/ui";
import { Lock, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 12, label: "At least 12 characters" },
  { test: (p: string) => /[A-Z]/.test(p), label: "One uppercase letter" },
  { test: (p: string) => /[a-z]/.test(p), label: "One lowercase letter" },
  { test: (p: string) => /[0-9]/.test(p), label: "One number" },
  { test: (p: string) => /[^A-Za-z0-9]/.test(p), label: "One special character" },
];

function ResetInner() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setError("Reset link is invalid or expired. Request a new one.");
      }
    })();
  }, [supabase]);

  const allRulesPass = PASSWORD_RULES.every((r) => r.test(password));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (!allRulesPass) {
      setError("Password does not meet requirements");
      return;
    }
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/login"), 2500);
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-6 md:p-8 backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl text-center"
      >
        <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
        <h1 className="text-lg font-semibold text-white mb-2">
          Password updated
        </h1>
        <p className="text-sm text-white/70">Redirecting you to sign in…</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl p-6 md:p-8 backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl"
    >
      <h1 className="text-lg font-semibold text-white mb-6">
        Set a new password
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl bg-white/10 border border-white/20 px-10 py-3 text-white placeholder:text-white/50 focus:ring-2 focus:ring-[#9D7DC5] outline-none"
            placeholder="New password"
            required
            autoFocus
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-xl bg-white/10 border border-white/20 px-10 py-3 text-white placeholder:text-white/50 focus:ring-2 focus:ring-[#9D7DC5] outline-none"
            placeholder="Confirm password"
            required
          />
        </div>

        <ul className="space-y-1.5 text-xs">
          {PASSWORD_RULES.map((rule) => {
            const pass = rule.test(password);
            return (
              <li
                key={rule.label}
                className={`flex items-center gap-2 ${
                  pass ? "text-green-400" : "text-white/50"
                }`}
              >
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full ${
                    pass ? "bg-green-400" : "bg-white/30"
                  }`}
                />
                {rule.label}
              </li>
            );
          })}
        </ul>

        {error && (
          <div className="flex items-start gap-2 text-sm text-red-300 bg-red-500/15 p-3 rounded-xl border border-red-500/30">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading || !allRulesPass || password !== confirm}
          className="w-full py-3 bg-gradient-to-r from-[#9D7DC5] to-[#533AFD] text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Update password"
          )}
        </Button>
      </form>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-white" />
        </div>
      }
    >
      <ResetInner />
    </Suspense>
  );
}
EOF

write_file "$ROOT/apps/admin/app/(auth)/accept-invite/page.tsx" <<'EOF'
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@zeal/ui";
import { Lock, Loader2, AlertCircle, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

interface InviteInfo {
  email: string;
  role: string;
}

function AcceptInviteInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const supabase = createClient();

  useEffect(() => {
    if (!token) {
      setError("Missing invite token");
      setLoading(false);
      return;
    }
    (async () => {
      const res = await fetch(
        `/api/auth/verify-invite?token=${encodeURIComponent(token)}`,
      );
      if (!res.ok) {
        setError("This invite is invalid, expired, or already used.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setInvite(data);
      setLoading(false);
    })();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 12) {
      setError("Password must be at least 12 characters");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body?.error?.message || "Failed to accept invite");
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: invite!.email,
        password,
      });
      if (signInError) throw signInError;

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept invite");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl p-8 backdrop-blur-xl bg-white/10 border border-white/20 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-white" />
      </div>
    );
  }

  if (error && !invite) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-8 backdrop-blur-xl bg-white/10 border border-white/20 text-center"
      >
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-white">{error}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl p-6 md:p-8 backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl"
    >
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck className="w-5 h-5 text-[#9D7DC5]" />
        <h1 className="text-lg font-semibold text-white">Accept your invite</h1>
      </div>
      <p className="text-sm text-white/70 mb-6">
        You've been invited as <strong className="text-white">{invite?.role}</strong>{" "}
        ({invite?.email}). Set a password to continue.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl bg-white/10 border border-white/20 px-10 py-3 text-white placeholder:text-white/50 focus:ring-2 focus:ring-[#9D7DC5] outline-none"
            placeholder="Password (min 12 chars)"
            required
            autoFocus
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-xl bg-white/10 border border-white/20 px-10 py-3 text-white placeholder:text-white/50 focus:ring-2 focus:ring-[#9D7DC5] outline-none"
            placeholder="Confirm password"
            required
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 text-sm text-red-300 bg-red-500/15 p-3 rounded-xl border border-red-500/30">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={submitting || !password || password !== confirm}
          className="w-full py-3 bg-gradient-to-r from-[#9D7DC5] to-[#533AFD] text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </motion.div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-white" />
        </div>
      }
    >
      <AcceptInviteInner />
    </Suspense>
  );
}
EOF

# ═══════════════════════════════════════════════════════════════════════════════
# MODULE 7 — API ROUTES
# ═══════════════════════════════════════════════════════════════════════════════

section "Module 7 — API routes"

write_file "$ROOT/apps/admin/app/api/auth/verify-invite/route.ts" <<'EOF'
import { NextResponse } from "next/server";
import { verifyInvite } from "@/lib/auth/invites";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const invite = await verifyInvite(token);
  if (!invite) {
    return NextResponse.json(
      { error: "Invalid or expired invite" },
      { status: 404 },
    );
  }

  return NextResponse.json({ email: invite.email, role: invite.role });
}
EOF

write_file "$ROOT/apps/admin/app/api/auth/accept-invite/route.ts" <<'EOF'
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyInvite, acceptInvite } from "@/lib/auth/invites";
import { audit } from "@/lib/auth/audit";
import { getClientIp } from "@/lib/auth/rate-limit";

export const dynamic = "force-dynamic";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase admin not configured");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent");

  let body: { token?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { message: "Invalid JSON" } },
      { status: 400 },
    );
  }

  const { token, password } = body;
  if (!token || !password) {
    return NextResponse.json(
      { error: { message: "Missing token or password" } },
      { status: 400 },
    );
  }
  if (password.length < 12) {
    return NextResponse.json(
      { error: { message: "Password must be at least 12 characters" } },
      { status: 400 },
    );
  }

  const invite = await verifyInvite(token);
  if (!invite) {
    await audit({
      action: "invite.accept.failure",
      email: null,
      metadata: { reason: "invalid_token" },
      ip,
      userAgent,
      success: false,
    });
    return NextResponse.json(
      { error: { message: "Invalid or expired invite" } },
      { status: 404 },
    );
  }

  const sb = getAdminClient();

  const { data: created, error: createError } = await sb.auth.admin.createUser({
    email: invite.email,
    password,
    email_confirm: true,
    app_metadata: { role: invite.role },
    user_metadata: {},
  });

  if (createError || !created.user) {
    await audit({
      action: "invite.accept.failure",
      email: invite.email,
      metadata: { reason: createError?.message ?? "create_failed" },
      ip,
      userAgent,
      success: false,
    });
    return NextResponse.json(
      { error: { message: createError?.message ?? "Failed to create account" } },
      { status: 500 },
    );
  }

  await acceptInvite(invite.id);

  await audit({
    userId: created.user.id,
    email: invite.email,
    action: "invite.accept.success",
    targetType: "admin",
    targetId: created.user.id,
    metadata: { role: invite.role },
    ip,
    userAgent,
    success: true,
  });

  return NextResponse.json({ success: true, userId: created.user.id });
}
EOF

write_file "$ROOT/apps/admin/app/api/admin/invites/route.ts" <<'EOF'
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createInvite } from "@/lib/auth/invites";
import { audit } from "@/lib/auth/audit";
import { getClientIp } from "@/lib/auth/rate-limit";
import { isAdminRole, roleAtLeast, type AdminRole } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

async function getCaller() {
  const cookieStore = await cookies();
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (n) => cookieStore.get(n)?.value,
        set: () => {},
        remove: () => {},
      },
    },
  );
  const {
    data: { user },
  } = await sb.auth.getUser();
  return user;
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent");

  const user = await getCaller();
  if (!user) {
    return NextResponse.json(
      { error: { message: "Unauthorized" } },
      { status: 401 },
    );
  }

  const callerRole = user.app_metadata?.role;
  if (!isAdminRole(callerRole) || !roleAtLeast(callerRole, "SUPER_ADMIN")) {
    await audit({
      userId: user.id,
      email: user.email,
      action: "invite.create.denied",
      ip,
      userAgent,
      success: false,
      metadata: { reason: "insufficient_role" },
    });
    return NextResponse.json(
      { error: { message: "Forbidden — SUPER_ADMIN only" } },
      { status: 403 },
    );
  }

  let body: { email?: string; role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { message: "Invalid JSON" } },
      { status: 400 },
    );
  }

  const email = body.email?.trim().toLowerCase();
  const role = body.role;

  if (!email || !isAdminRole(role)) {
    return NextResponse.json(
      { error: { message: "Invalid email or role" } },
      { status: 400 },
    );
  }

  if (!roleAtLeast(callerRole, role as AdminRole)) {
    return NextResponse.json(
      { error: { message: "Cannot invite a role higher than your own" } },
      { status: 403 },
    );
  }

  const { token, expiresAt } = await createInvite({
    email,
    role: role as AdminRole,
    invitedBy: user.id,
  });

  await audit({
    userId: user.id,
    email: user.email,
    action: "invite.create.success",
    targetType: "admin_invite",
    targetId: email,
    metadata: { role },
    ip,
    userAgent,
    success: true,
  });

  const adminBaseUrl =
    process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001";
  const inviteUrl = `${adminBaseUrl}/accept-invite?token=${encodeURIComponent(token)}`;

  return NextResponse.json({ success: true, inviteUrl, expiresAt });
}
EOF

# ─── Settings/Admins page ─────────────────────────────────────────────────────
write_file "$ROOT/apps/admin/app/(dashboard)/settings/admins/page.tsx" <<'EOF'
"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { UserPlus, Loader2, Check, Copy, Shield } from "lucide-react";

const ROLES = [
  { value: "VIEWER", label: "Viewer", desc: "Read-only analytics" },
  { value: "SUPPORT", label: "Support", desc: "Handle bookings & recordings" },
  { value: "ADMIN", label: "Admin", desc: "Manage users, consultants, verification" },
  { value: "SUPER_ADMIN", label: "Super Admin", desc: "Full platform control" },
];

export default function AdminInvitesPage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("VIEWER");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || "Failed to create invite");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setInviteUrl(data.inviteUrl);
      setEmail("");
    },
  });

  const handleCopy = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-[#5E4B8B] dark:text-white flex items-center gap-2">
        <Shield className="w-6 h-6 text-[#9D7DC5]" /> Invite Administrator
      </h1>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-3d p-5 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-[#5E4B8B] dark:text-white mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="new-admin@zeal.com"
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-[#E1C5E7] dark:border-gray-700 text-[#5E4B8B] dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#5E4B8B] dark:text-white mb-2">
            Role
          </label>
          <div className="grid grid-cols-2 gap-2">
            {ROLES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRole(r.value)}
                className={`p-3 rounded-xl text-left transition-all ${
                  role === r.value
                    ? "bg-gradient-to-br from-[#9D7DC5]/20 to-[#533AFD]/10 border-2 border-[#9D7DC5]"
                    : "bg-white dark:bg-gray-900 border-2 border-[#E1C5E7] dark:border-gray-700"
                }`}
              >
                <p className="font-medium text-sm text-[#5E4B8B] dark:text-white">
                  {r.label}
                </p>
                <p className="text-xs text-[#B8A1D9] mt-0.5">{r.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {mutation.isError && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">
            {mutation.error instanceof Error
              ? mutation.error.message
              : "Failed"}
          </div>
        )}

        <button
          onClick={() => mutation.mutate()}
          disabled={!email || mutation.isPending}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#9D7DC5] to-[#533AFD] text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Creating invite…
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" /> Create invite
            </>
          )}
        </button>

        {inviteUrl && (
          <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 space-y-2">
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              Invite created. Share this link:
            </p>
            <div className="flex gap-2">
              <input
                readOnly
                value={inviteUrl}
                className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-green-200 dark:border-green-800 text-xs font-mono"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-medium flex items-center gap-1"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="text-xs text-green-700 dark:text-green-400">
              Expires in 72 hours.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
EOF

# ═══════════════════════════════════════════════════════════════════════════════
# MODULE 8 — SIDEBAR: add "Admins" link
# ═══════════════════════════════════════════════════════════════════════════════

section "Module 8 — Sidebar patch"

SIDEBAR="$ROOT/apps/admin/components/layout/AdminSidebar.tsx"
if [[ -f "$SIDEBAR" ]]; then
  backup_file "$SIDEBAR"
  # Add Shield import if missing
  if ! grep -q 'Shield,' "$SIDEBAR"; then
    # Ensure Shield is imported (usually already is)
    warn "verify that 'Shield' is imported in AdminSidebar.tsx — it may already be"
  fi
  success "sidebar untouched (add the Admins link manually if needed)"
else
  warn "AdminSidebar.tsx not found — skipping"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# MODULE 9 — SQL MIGRATION
# ═══════════════════════════════════════════════════════════════════════════════

section "Module 9 — SQL migration file"

ensure_dir "$ROOT/supabase"

write_file "$ROOT/supabase/admin-rbac-migration.sql" <<'EOF'
-- ═══════════════════════════════════════════════════════════════════════════
-- ZEAL ADMIN RBAC — Roles, Audit, Invites, Rate Limiting
-- ═══════════════════════════════════════════════════════════════════════════
-- Run in Supabase SQL Editor. Idempotent.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Extend Role enum ───────────────────────────────────────────────────
DO $$ BEGIN
  BEGIN ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN'; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'ADMIN';       EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPPORT';     EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'VIEWER';      EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- ── 2. Sync User.role from auth.app_metadata ──────────────────────────────
UPDATE "User" u
SET role = (au.raw_app_meta_data->>'role')::"Role"
FROM auth.users au
WHERE au.id = u.id
  AND au.raw_app_meta_data->>'role' IS NOT NULL
  AND (au.raw_app_meta_data->>'role')::text <> u.role::text;

-- ── 3. Admin audit log ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "AdminAuditLog" (
  id          TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  "userId"    TEXT,
  "email"     TEXT,
  action      TEXT NOT NULL,
  "targetType" TEXT,
  "targetId"  TEXT,
  metadata    JSONB,
  ip          TEXT,
  "userAgent" TEXT,
  success     BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "AdminAuditLog_createdAt_idx" ON "AdminAuditLog"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "AdminAuditLog_userId_idx"    ON "AdminAuditLog"("userId");
CREATE INDEX IF NOT EXISTS "AdminAuditLog_action_idx"    ON "AdminAuditLog"(action);

-- ── 4. Admin invites ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "AdminInvite" (
  id          TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  email       TEXT NOT NULL,
  role        "Role" NOT NULL DEFAULT 'VIEWER',
  "tokenHash" TEXT NOT NULL UNIQUE,
  "invitedBy" TEXT NOT NULL,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "acceptedAt" TIMESTAMPTZ,
  "revokedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "AdminInvite_email_idx" ON "AdminInvite"(email);
CREATE INDEX IF NOT EXISTS "AdminInvite_tokenHash_idx" ON "AdminInvite"("tokenHash");

-- ── 5. Login attempt tracking ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "AdminLoginAttempt" (
  id          TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  email       TEXT NOT NULL,
  ip          TEXT,
  success     BOOLEAN NOT NULL,
  reason      TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "AdminLoginAttempt_email_created_idx"
  ON "AdminLoginAttempt"(email, "createdAt" DESC);

-- ── 6. RLS: lock all new tables ───────────────────────────────────────────
ALTER TABLE "AdminAuditLog"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AdminInvite"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AdminLoginAttempt" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON "AdminAuditLog"     TO service_role;
GRANT ALL ON "AdminInvite"       TO service_role;
GRANT ALL ON "AdminLoginAttempt" TO service_role;

-- ── 7. Cleanup helper ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.cleanup_admin_logs()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM "AdminAuditLog"     WHERE "createdAt" < NOW() - INTERVAL '90 days';
  DELETE FROM "AdminLoginAttempt" WHERE "createdAt" < NOW() - INTERVAL '90 days';
  DELETE FROM "AdminInvite"
    WHERE "expiresAt" < NOW() - INTERVAL '90 days'
      AND "acceptedAt" IS NULL;
END;
$$;
EOF

# ═══════════════════════════════════════════════════════════════════════════════
# FINAL — type check + summary
# ═══════════════════════════════════════════════════════════════════════════════

section "Verifying build"

if [[ -d "$ROOT/node_modules" ]]; then
  log "Running admin type-check…"
  if npm run type-check --workspace=admin 2>&1 | tail -20; then
    success "Admin type-check passed"
  else
    warn "Admin type-check reported errors — review output above"
  fi
else
  warn "node_modules missing — run: npm install --legacy-peer-deps"
fi

section "Done"
cat <<EOF

${BOLD}Files written:${NC}
  apps/admin/lib/store/adminStore.ts
  apps/admin/lib/auth/roles.ts
  apps/admin/lib/auth/audit.ts
  apps/admin/lib/auth/rate-limit.ts
  apps/admin/lib/auth/invites.ts
  apps/admin/components/alerts/IncomingAlertOverlay.tsx
  apps/admin/app/layout.tsx
  apps/admin/proxy.ts
  apps/admin/app/(auth)/layout.tsx
  apps/admin/app/(auth)/login/page.tsx
  apps/admin/app/(auth)/mfa/page.tsx
  apps/admin/app/(auth)/forgot-password/page.tsx
  apps/admin/app/(auth)/reset-password/page.tsx
  apps/admin/app/(auth)/accept-invite/page.tsx
  apps/admin/app/api/auth/verify-invite/route.ts
  apps/admin/app/api/auth/accept-invite/route.ts
  apps/admin/app/api/admin/invites/route.ts
  apps/admin/app/(dashboard)/settings/admins/page.tsx
  supabase/admin-rbac-migration.sql

${BOLD}Backup:${NC}
  $BACKUP_DIR

${BOLD}Next steps:${NC}
  1. Run the SQL migration in Supabase SQL Editor:
       supabase/admin-rbac-migration.sql
  2. Promote your account (SQL Editor):
       UPDATE auth.users
       SET raw_app_meta_data = jsonb_set(
         COALESCE(raw_app_meta_data, '{}'::jsonb),
         '{role}', '"SUPER_ADMIN"'::jsonb)
       WHERE email = 'admin@zeal.com';
  3. Ensure apps/admin/.env.local has:
       NEXT_PUBLIC_SUPABASE_URL=...
       NEXT_PUBLIC_SUPABASE_ANON_KEY=...
       SUPABASE_SERVICE_ROLE_KEY=...
       NEXT_PUBLIC_ADMIN_URL=http://localhost:3001
  4. Verify build:
       npm install --legacy-peer-deps
       npm run build --workspace=admin
  5. Start admin:
       npm run dev --workspace=admin

${GREEN}${BOLD}Enterprise admin fix complete.${NC}
EOF
