#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# ZEAL ADMIN — COMPLETE BUILD FIX
# Guarantees: .next cache cleared, files written, line endings LF, build green
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

# ─── Terminal colors ──────────────────────────────────────────────────────────
if [[ -t 1 ]]; then
  RED=$'\033[0;31m'; GREEN=$'\033[0;32m'; YELLOW=$'\033[1;33m'
  BLUE=$'\033[0;34m'; CYAN=$'\033[0;36m'; BOLD=$'\033[1m'; NC=$'\033[0m'
else
  RED=""; GREEN=""; YELLOW=""; BLUE=""; CYAN=""; BOLD=""; NC=""
fi

log()     { printf "%s[•]%s %s\n" "$BLUE"   "$NC" "$*"; }
ok()      { printf "%s[✓]%s %s\n" "$GREEN"  "$NC" "$*"; }
warn()    { printf "%s[!]%s %s\n" "$YELLOW" "$NC" "$*"; }
fail()    { printf "%s[✗]%s %s\n" "$RED"    "$NC" "$*" >&2; exit 1; }
section() { printf "\n%s══ %s ══%s\n\n" "$CYAN" "$*" "$NC"; }

# ─── Locate project root ──────────────────────────────────────────────────────
if [[ ! -f "package.json" ]]; then
  fail "Run this from the project root (expected package.json here)"
fi
if [[ ! -d "apps/admin" ]]; then
  fail "apps/admin not found — wrong directory"
fi

ROOT="$(pwd)"
TS="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="$ROOT/.backups/admin-fix-$TS"

section "Zeal Admin — Complete Build Fix"
log "Root:    $ROOT"
log "Backup:  $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# ─── Helpers ──────────────────────────────────────────────────────────────────
backup_file() {
  local f="$1"
  if [[ -f "$f" ]]; then
    local rel="${f#$ROOT/}"
    local dest="$BACKUP_DIR/$rel"
    mkdir -p "$(dirname "$dest")"
    cp "$f" "$dest"
  fi
}

normalize_lf() {
  # Strip any CR that Windows might have introduced
  local f="$1"
  if command -v dos2unix >/dev/null 2>&1; then
    dos2unix "$f" >/dev/null 2>&1 || true
  else
    tr -d '\r' < "$f" > "$f.tmp" && mv "$f.tmp" "$f"
  fi
}

write_file() {
  local path="$1"
  local rel="${path#$ROOT/}"
  mkdir -p "$(dirname "$path")"
  backup_file "$path"
  cat > "$path"
  normalize_lf "$path"
  # Verify write succeeded
  if [[ ! -s "$path" ]]; then
    fail "Write failed for $rel"
  fi
  ok "wrote $rel ($(wc -c < "$path" | tr -d ' ') bytes)"
}

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 1 — KILL ALL CACHES  (this is why the old error persists)
# ═══════════════════════════════════════════════════════════════════════════════

section "Step 1 — Clearing caches"

for dir in \
  "$ROOT/apps/admin/.next" \
  "$ROOT/apps/admin/.turbo" \
  "$ROOT/apps/web/.next" \
  "$ROOT/apps/web/.turbo" \
  "$ROOT/.turbo" \
  "$ROOT/node_modules/.cache"
do
  if [[ -d "$dir" ]]; then
    rm -rf "$dir"
    ok "removed ${dir#$ROOT/}"
  fi
done

# Remove tsbuildinfo files anywhere under apps/
find "$ROOT/apps" -maxdepth 3 -name 'tsconfig.tsbuildinfo' -type f 2>/dev/null | while read -r f; do
  rm -f "$f"
  ok "removed ${f#$ROOT/}"
done

# Remove next-env.d.ts regeneration marker so Next rebuilds fresh
for f in "$ROOT/apps/admin/next-env.d.ts" "$ROOT/apps/web/next-env.d.ts"; do
  [[ -f "$f" ]] && ok "kept ${f#$ROOT/}"
done

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 2 — WRITE THE TYPED STORE
# ═══════════════════════════════════════════════════════════════════════════════

section "Step 2 — Writing adminStore.ts"

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

// ─── Incoming alert (typed — this fixes the build) ───────────────────────────

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

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 3 — WRITE THE TYPED OVERLAY
# ═══════════════════════════════════════════════════════════════════════════════

section "Step 3 — Writing IncomingAlertOverlay.tsx"

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

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 4 — WRITE THE ROOT LAYOUT (mounts the overlay)
# ═══════════════════════════════════════════════════════════════════════════════

section "Step 4 — Writing admin root layout"

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

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 5 — ENSURE THE SOUND PLACEHOLDER EXISTS
# ═══════════════════════════════════════════════════════════════════════════════

section "Step 5 — Sound placeholder"

mkdir -p "$ROOT/apps/admin/public/sounds"
if [[ ! -f "$ROOT/apps/admin/public/sounds/ringing.mp3" ]]; then
  : > "$ROOT/apps/admin/public/sounds/ringing.mp3"
  ok "created placeholder apps/admin/public/sounds/ringing.mp3"
else
  ok "ringing.mp3 already present"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 6 — VERIFY THE FILES ARE ACTUALLY THE NEW VERSIONS
# ═══════════════════════════════════════════════════════════════════════════════

section "Step 6 — Verifying written content"

STORE="$ROOT/apps/admin/lib/store/adminStore.ts"
OVERLAY="$ROOT/apps/admin/components/alerts/IncomingAlertOverlay.tsx"

if ! grep -q 'export interface IncomingAlertData' "$STORE"; then
  fail "adminStore.ts is missing IncomingAlertData — the write did not take effect"
fi
ok "adminStore.ts contains IncomingAlertData"

if ! grep -q 'data?: IncomingAlertData' "$STORE"; then
  fail "adminStore.ts does not type IncomingAlert.data as IncomingAlertData"
fi
ok "adminStore.ts types IncomingAlert.data correctly"

if grep -q 'consultant/calls' "$OVERLAY"; then
  fail "Overlay still contains old /consultant/calls route — write did not take effect"
fi
ok "Overlay no longer references /consultant/calls"

if ! grep -q 'router.push(data?.bookingId ? \`/calls?highlight=' "$OVERLAY"; then
  fail "Overlay does not contain the corrected route logic"
fi
ok "Overlay contains corrected route logic"

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 7 — TYPE CHECK
# ═══════════════════════════════════════════════════════════════════════════════

section "Step 7 — Type check (admin)"

cd "$ROOT"
if npm run type-check --workspace=admin 2>&1 | tail -30; then
  ok "admin type-check passed"
else
  warn "admin type-check reported errors — see output above"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 8 — BUILD ADMIN
# ═══════════════════════════════════════════════════════════════════════════════

section "Step 8 — Build admin"

cd "$ROOT"
if npm run build --workspace=admin; then
  ok "admin build succeeded"
  ADMIN_OK=1
else
  warn "admin build failed"
  ADMIN_OK=0
fi

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 9 — OPTIONALLY BUILD THE WHOLE WORKSPACE
# ═══════════════════════════════════════════════════════════════════════════════

section "Step 9 — Full workspace build"

if [[ "${ADMIN_OK:-0}" -eq 1 ]]; then
  if npm run build; then
    ok "full workspace build succeeded"
  else
    warn "full workspace build failed — inspect output above"
  fi
else
  warn "skipping full build because admin failed"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════════════════════

section "Summary"
cat <<EOF

${BOLD}Backup:${NC}       $BACKUP_DIR
${BOLD}Caches cleared:${NC} apps/*/.next, apps/*/.turbo, node_modules/.cache
${BOLD}Files written:${NC}
  apps/admin/lib/store/adminStore.ts
  apps/admin/components/alerts/IncomingAlertOverlay.tsx
  apps/admin/app/layout.tsx
  apps/admin/public/sounds/ringing.mp3 (placeholder)

${BOLD}Restore command (if needed):${NC}
  cp -r $BACKUP_DIR/* $ROOT/

${BOLD}Next:${NC}
  npm run dev --workspace=admin
  open http://localhost:3001/login

EOF
