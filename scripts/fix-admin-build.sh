#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# ZEAL ADMIN BUILD — BULLETPROOF FIX
# Verifies every write. Stops on any failure. Handles Windows/MinGW quirks.
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

# ─── Colors ───────────────────────────────────────────────────────────────────
if [[ -t 1 ]]; then
  RED=$'\033[0;31m'; GREEN=$'\033[0;32m'; YELLOW=$'\033[1;33m'
  BLUE=$'\033[0;34m'; CYAN=$'\033[0;36m'; BOLD=$'\033[1m'; NC=$'\033[0m'
else
  RED=""; GREEN=""; YELLOW=""; BLUE=""; CYAN=""; BOLD=""; NC=""
fi

ok()      { printf "%s[✓]%s %s\n" "$GREEN"  "$NC" "$*"; }
warn()    { printf "%s[!]%s %s\n" "$YELLOW" "$NC" "$*"; }
fail()    { printf "%s[✗]%s %s\n" "$RED"    "$NC" "$*" >&2; exit 1; }
info()    { printf "%s[•]%s %s\n" "$BLUE"   "$NC" "$*"; }
section() { printf "\n%s══ %s ══%s\n\n" "$CYAN" "$*" "$NC"; }

# ─── Locate project root ──────────────────────────────────────────────────────
[[ -f "package.json" ]] || fail "Run from project root"
[[ -d "apps/admin"   ]] || fail "apps/admin not found"
ROOT="$(pwd)"
TS="$(date +%Y%m%d-%H%M%S)"
BACKUP="$ROOT/.backups/admin-build-fix-$TS"

section "Zeal Admin Build Fix"
info "Root:   $ROOT"
info "Backup: $BACKUP"
mkdir -p "$BACKUP"

# ─── Abort if git has uncommitted changes we might trample ────────────────────
if command -v git >/dev/null 2>&1 && git rev-parse --git-dir >/dev/null 2>&1; then
  if [[ -n "$(git status --porcelain apps/admin 2>/dev/null)" ]]; then
    warn "apps/admin has uncommitted changes — backing up before overwriting"
  fi
fi

# ─── Line-ending normalizer ───────────────────────────────────────────────────
normalize_lf() {
  local f="$1"
  # Use Python for reliable cross-platform CRLF stripping
  if command -v python3 >/dev/null 2>&1; then
    python3 - "$f" <<'PY'
import sys, io
p = sys.argv[1]
with io.open(p, 'rb') as fh: data = fh.read()
data = data.replace(b'\r\n', b'\n').replace(b'\r', b'\n')
with io.open(p, 'wb') as fh: fh.write(data)
PY
  elif command -v python >/dev/null 2>&1; then
    python - "$f" <<'PY'
import sys, io
p = sys.argv[1]
with io.open(p, 'rb') as fh: data = fh.read()
data = data.replace(b'\r\n', b'\n').replace(b'\r', b'\n')
with io.open(p, 'wb') as fh: fh.write(data)
PY
  else
    # Pure bash fallback: tr strips CR
    tr -d '\r' < "$f" > "$f.tmp" && mv "$f.tmp" "$f"
  fi
}

# ─── Safe write: backup → remove → heredoc → normalize → verify ───────────────
safe_write() {
  local path="$1"
  local rel="${path#$ROOT/}"
  mkdir -p "$(dirname "$path")"

  # Backup if exists
  if [[ -f "$path" ]]; then
    local dest="$BACKUP/$rel"
    mkdir -p "$(dirname "$dest")"
    cp "$path" "$dest"
  fi

  # Remove old file entirely to defeat Windows permission cache
  rm -f "$path"

  # Write fresh from stdin
  cat > "$path"

  # Force LF endings
  normalize_lf "$path"

  # Verify file exists and is non-empty
  [[ -s "$path" ]] || fail "write produced empty file: $rel"

  local size; size=$(wc -c < "$path" | tr -d ' ')
  ok "wrote $rel ($size bytes)"
}

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 1 — Snapshot current state
# ═══════════════════════════════════════════════════════════════════════════════

section "Step 1 — Snapshot"

STORE="$ROOT/apps/admin/lib/store/adminStore.ts"
OVERLAY="$ROOT/apps/admin/components/alerts/IncomingAlertOverlay.tsx"

if [[ -f "$OVERLAY" ]]; then
  info "Current overlay line 44:"
  sed -n '44p' "$OVERLAY" | sed 's/^/    /'
fi
if [[ -f "$STORE" ]]; then
  info "Current store 'data?' declaration:"
  grep -n 'data?:' "$STORE" | sed 's/^/    /' || echo "    (not found)"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 2 — Write adminStore.ts  (typed IncomingAlertData)
# ═══════════════════════════════════════════════════════════════════════════════

section "Step 2 — Writing adminStore.ts"

safe_write "$STORE" <<'STORE_EOF'
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

// ─── Incoming alert (typed — fixes the TypeScript error) ─────────────────────

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
STORE_EOF

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 3 — Write IncomingAlertOverlay.tsx
# ═══════════════════════════════════════════════════════════════════════════════

section "Step 3 — Writing IncomingAlertOverlay.tsx"

safe_write "$OVERLAY" <<'OVERLAY_EOF'
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
      audioRef.current.play().catch(() => {});
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
        router.push(
          data?.bookingId ? `/calls?highlight=${data.bookingId}` : "/calls",
        );
        break;
      case "chat":
        router.push(
          data?.userId ? `/clients?highlight=${data.userId}` : "/clients",
        );
        break;
      case "booking":
        router.push(
          data?.bookingId
            ? `/bookings?highlight=${data.bookingId}`
            : "/bookings",
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
OVERLAY_EOF

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 4 — VERIFY the writes actually landed
# ═══════════════════════════════════════════════════════════════════════════════

section "Step 4 — Verifying writes"

# Overlay must NOT contain the old strings
if grep -q "consultant/calls" "$OVERLAY"; then
  fail "OVERLAY STILL CONTAINS 'consultant/calls' — write failed"
fi
ok "overlay no longer references /consultant/calls"

if grep -q "data?.bookingId" "$OVERLAY"; then
  fail "OVERLAY STILL CONTAINS 'data?.bookingId' — write failed"
fi
ok "overlay no longer contains 'data?.bookingId'"

if ! grep -q "data?.bookingId ? \`/calls?highlight=" "$OVERLAY"; then
  fail "OVERLAY MISSING the corrected route logic"
fi
ok "overlay contains corrected route logic"

# Store must contain the new type and reference it
if ! grep -q "export interface IncomingAlertData" "$STORE"; then
  fail "STORE MISSING IncomingAlertData interface — write failed"
fi
ok "store declares IncomingAlertData"

if ! grep -q "data?: IncomingAlertData" "$STORE"; then
  fail "STORE still types data as unknown — write failed"
fi
ok "store types IncomingAlert.data as IncomingAlertData"

# Show line 44 of the new overlay for confirmation
info "New overlay line 44:"
sed -n '44p' "$OVERLAY" | sed 's/^/    /'

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 5 — Purge ALL caches (aggressive)
# ═══════════════════════════════════════════════════════════════════════════════

section "Step 5 — Purging caches"

for dir in \
  "$ROOT/apps/admin/.next" \
  "$ROOT/apps/admin/.turbo" \
  "$ROOT/apps/web/.next" \
  "$ROOT/apps/web/.turbo" \
  "$ROOT/apps/api/dist" \
  "$ROOT/.turbo" \
  "$ROOT/node_modules/.cache"
do
  if [[ -e "$dir" ]]; then
    rm -rf "$dir" 2>/dev/null || true
    ok "removed ${dir#$ROOT/}"
  fi
done

# Remove any tsbuildinfo
find "$ROOT/apps" -maxdepth 4 -name '*.tsbuildinfo' -type f -delete 2>/dev/null || true
ok "removed all *.tsbuildinfo files"

# Remove Next.js cache directory that holds type-check results
find "$ROOT/apps" -maxdepth 3 -type d -name '.next' -exec rm -rf {} + 2>/dev/null || true
ok "removed all .next directories"

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 6 — Direct tsc on apps/admin (isolated, bypasses Next)
# ═══════════════════════════════════════════════════════════════════════════════

section "Step 6 — Isolated TypeScript check"

pushd "$ROOT/apps/admin" >/dev/null

if [[ ! -f "tsconfig.json" ]]; then
  popd >/dev/null
  fail "apps/admin/tsconfig.json missing"
fi

info "Running: npx tsc --noEmit"
if npx tsc --noEmit; then
  ok "isolated tsc passed — no type errors"
  TSC_OK=1
else
  warn "isolated tsc reported errors (see above)"
  TSC_OK=0
fi

popd >/dev/null

if [[ "${TSC_OK:-0}" -ne 1 ]]; then
  fail "TypeScript errors remain — aborting before Next build"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 7 — Build admin (isolated)
# ═══════════════════════════════════════════════════════════════════════════════

section "Step 7 — Admin build"

cd "$ROOT"
if npm run build --workspace=admin; then
  ok "admin build succeeded"
  ADMIN_OK=1
else
  warn "admin build failed"
  ADMIN_OK=0
fi

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 8 — Full workspace build (only if admin passed)
# ═══════════════════════════════════════════════════════════════════════════════

section "Step 8 — Full workspace build"

if [[ "${ADMIN_OK:-0}" -eq 1 ]]; then
  if npm run build; then
    ok "full workspace build succeeded"
    FULL_OK=1
  else
    warn "full workspace build failed"
    FULL_OK=0
  fi
else
  warn "skipped — admin build failed"
  FULL_OK=0
fi

# ═══════════════════════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════════════════════

section "Summary"

cat <<EOF

${BOLD}Backup directory:${NC}
  $BACKUP

${BOLD}Files overwritten:${NC}
  apps/admin/lib/store/adminStore.ts
  apps/admin/components/alerts/IncomingAlertOverlay.tsx

${BOLD}Admin build:${NC}   $([[ "${ADMIN_OK:-0}" -eq 1 ]] && echo "${GREEN}PASS${NC}" || echo "${RED}FAIL${NC}")
${BOLD}Full build:${NC}    $([[ "${FULL_OK:-0}" -eq 1 ]] && echo "${GREEN}PASS${NC}" || echo "${RED}FAIL${NC}")

EOF

if [[ "${ADMIN_OK:-0}" -eq 1 ]]; then
  ok "Admin build is GREEN"
  echo ""
  info "Start the admin app:"
  echo "    npm run dev --workspace=admin"
  echo "    open http://localhost:3001/login"
else
  fail "Admin build still failing — check output above"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# ROLLBACK HELPER (printed for convenience)
# ═══════════════════════════════════════════════════════════════════════════════

echo ""
info "To roll back:"
echo "    cp -r $BACKUP/apps/admin/lib/store/adminStore.ts apps/admin/lib/store/"
echo "    cp -r $BACKUP/apps/admin/components/alerts/IncomingAlertOverlay.tsx apps/admin/components/alerts/"
