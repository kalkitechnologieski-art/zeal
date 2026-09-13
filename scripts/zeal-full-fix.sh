#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# ZEAL ADMIN — FULL FIX + TYPE CHECK + BUILD
# Writes all files, runs tsc, runs next build, verifies every step.
# ═══════════════════════════════════════════════════════════════════════════════

set -uo pipefail
# Note: NO -e here — we handle errors explicitly and continue to gather info

# ─── Colors ───────────────────────────────────────────────────────────────────
if [[ -t 1 ]]; then
  RED=$'\033[0;31m'; GREEN=$'\033[0;32m'; YELLOW=$'\033[1;33m'
  BLUE=$'\033[0;34m'; CYAN=$'\033[0;36m'; MAGENTA=$'\033[0;35m'
  BOLD=$'\033[1m'; DIM=$'\033[2m'; NC=$'\033[0m'
else
  RED=""; GREEN=""; YELLOW=""; BLUE=""; CYAN=""; MAGENTA=""; BOLD=""; DIM=""; NC=""
fi

ok()      { printf "%s[✓]%s %s\n"   "$GREEN"   "$NC" "$*"; }
warn()    { printf "%s[!]%s %s\n"   "$YELLOW"  "$NC" "$*"; }
err()     { printf "%s[✗]%s %s\n"   "$RED"     "$NC" "$*"; }
info()    { printf "%s[•]%s %s\n"   "$BLUE"    "$NC" "$*"; }
step()    { printf "%s→%s %s\n"     "$MAGENTA" "$NC" "$*"; }
section() { printf "\n%s══ %s ══%s\n\n" "$CYAN" "$*" "$NC"; }
hr()      { printf "%s%s%s\n" "$DIM" "─────────────────────────────────────────────────────────────" "$NC"; }

# ─── Counters ─────────────────────────────────────────────────────────────────
ERRORS=0
WARNINGS=0
FAILED_STEPS=()

mark_error()   { ERRORS=$((ERRORS+1));    FAILED_STEPS+=("$1"); err "$1"; }
mark_warning() { WARNINGS=$((WARNINGS+1)); warn "$1"; }

# ─── Locate project root ──────────────────────────────────────────────────────
if [[ ! -f "package.json" ]]; then
  err "No package.json — run from the project root"
  exit 1
fi
if [[ ! -d "apps/admin" ]]; then
  err "apps/admin not found — wrong directory"
  exit 1
fi

ROOT="$(pwd)"
TS="$(date +%Y%m%d-%H%M%S)"
BACKUP="$ROOT/.backups/full-fix-$TS"

section "Zeal Full Fix · $TS"
info "Root:   $ROOT"
info "Backup: $BACKUP"
mkdir -p "$BACKUP" || { err "Cannot create backup dir"; exit 1; }

# ─── Helpers ──────────────────────────────────────────────────────────────────

backup_file() {
  local f="$1"
  if [[ -f "$f" ]]; then
    local rel="${f#$ROOT/}"
    local dest="$BACKUP/$rel"
    mkdir -p "$(dirname "$dest")" 2>/dev/null || true
    cp "$f" "$dest" 2>/dev/null || warn "backup failed: $rel"
  fi
}

normalize_lf() {
  local f="$1"
  if command -v python3 >/dev/null 2>&1; then
    python3 - "$f" <<'PY' 2>/dev/null
import sys, io
p = sys.argv[1]
with io.open(p, 'rb') as fh: data = fh.read()
data = data.replace(b'\r\n', b'\n').replace(b'\r', b'\n')
with io.open(p, 'wb') as fh: fh.write(data)
PY
  elif command -v python >/dev/null 2>&1; then
    python - "$f" <<'PY' 2>/dev/null
import sys, io
p = sys.argv[1]
with io.open(p, 'rb') as fh: data = fh.read()
data = data.replace(b'\r\n', b'\n').replace(b'\r', b'\n')
with io.open(p, 'wb') as fh: fh.write(data)
PY
  else
    tr -d '\r' < "$f" > "$f.tmp" 2>/dev/null && mv "$f.tmp" "$f"
  fi
}

safe_write() {
  local path="$1"
  local rel="${path#$ROOT/}"
  mkdir -p "$(dirname "$path")" || { mark_error "mkdir failed for $rel"; return 1; }
  backup_file "$path"
  rm -f "$path" 2>/dev/null || true
  cat > "$path" || { mark_error "cat failed for $rel"; return 1; }
  normalize_lf "$path"
  if [[ ! -s "$path" ]]; then
    mark_error "empty file after write: $rel"
    return 1
  fi
  local size; size=$(wc -c < "$path" | tr -d ' \n')
  ok "wrote $rel ($size bytes)"
  return 0
}

run_cmd() {
  # run_cmd "label" cmd args...
  local label="$1"; shift
  hr
  step "$label"
  hr
  if "$@"; then
    ok "$label — passed"
    return 0
  else
    local rc=$?
    mark_error "$label — failed (exit $rc)"
    return $rc
  fi
}

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 1 — Snapshot pre-fix state
# ═══════════════════════════════════════════════════════════════════════════════

section "Step 1 — Snapshot"

STORE="$ROOT/apps/admin/lib/store/adminStore.ts"
OVERLAY="$ROOT/apps/admin/components/alerts/IncomingAlertOverlay.tsx"

if [[ -f "$OVERLAY" ]]; then
  info "current overlay line 44:"
  sed -n '44p' "$OVERLAY" 2>/dev/null | sed 's/^/    /' || echo "    (cannot read)"
fi
if [[ -f "$STORE" ]]; then
  info "current store 'data?:' declaration:"
  grep -n 'data?:' "$STORE" 2>/dev/null | sed 's/^/    /' || echo "    (not found)"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 2 — Write adminStore.ts
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

// ─── Incoming alert (typed — fixes the TS error) ─────────────────────────────

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
# STEP 4 — Verify writes landed
# ═══════════════════════════════════════════════════════════════════════════════

section "Step 4 — Verifying writes"

FAILED=0

if grep -q "consultant/calls" "$OVERLAY"; then
  mark_error "overlay still contains /consultant/calls"
  FAILED=1
else
  ok "overlay: no /consultant/calls"
fi

if grep -q 'data?.bookingId' "$OVERLAY" && ! grep -q 'data?.bookingId ? `' "$OVERLAY"; then
  mark_error "overlay still contains raw data?.bookingId without ternary"
  FAILED=1
else
  ok "overlay: data?.bookingId usage is correct"
fi

if ! grep -q "IncomingAlertData" "$STORE"; then
  mark_error "store missing IncomingAlertData"
  FAILED=1
else
  ok "store: declares IncomingAlertData"
fi

if ! grep -q "data?: IncomingAlertData" "$STORE"; then
  mark_error "store: data is not typed as IncomingAlertData"
  FAILED=1
else
  ok "store: data is typed correctly"
fi

info "overlay line 44 now:"
sed -n '44p' "$OVERLAY" 2>/dev/null | sed 's/^/    /'

if [[ $FAILED -eq 1 ]]; then
  err "Verification failed — aborting before build"
  echo ""
  err "Restore from: $BACKUP"
  exit 1
fi

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 5 — Purge all caches
# ═══════════════════════════════════════════════════════════════════════════════

section "Step 5 — Purging caches"

for d in \
  "$ROOT/apps/admin/.next" \
  "$ROOT/apps/admin/.turbo" \
  "$ROOT/apps/web/.next" \
  "$ROOT/apps/web/.turbo" \
  "$ROOT/.turbo" \
  "$ROOT/node_modules/.cache"
do
  if [[ -e "$d" ]]; then
    rm -rf "$d" 2>/dev/null && ok "removed ${d#$ROOT/}" || warn "could not remove $d"
  fi
done

find "$ROOT/apps" -maxdepth 4 -name '*.tsbuildinfo' -type f -delete 2>/dev/null && \
  ok "removed all *.tsbuildinfo" || true

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 6 — Isolated TypeScript check (apps/admin)
# ═══════════════════════════════════════════════════════════════════════════════

section "Step 6 — Isolated tsc (apps/admin)"

cd "$ROOT/apps/admin" || { err "cannot cd to apps/admin"; exit 1; }

TSC_OK=0
if [[ -f "tsconfig.json" ]]; then
  hr
  step "npx tsc --noEmit"
  hr
  if npx tsc --noEmit; then
    ok "isolated tsc passed"
    TSC_OK=1
  else
    mark_error "isolated tsc failed"
  fi
else
  mark_error "apps/admin/tsconfig.json missing"
fi

cd "$ROOT" || exit 1

if [[ $TSC_OK -ne 1 ]]; then
  section "Abort — TypeScript errors remain"
  echo ""
  err "Fix the tsc errors above, then re-run this script."
  err "Backup: $BACKUP"
  exit 1
fi

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 7 — Admin build
# ═══════════════════════════════════════════════════════════════════════════════

section "Step 7 — Admin build"

ADMIN_OK=0
hr
step "npm run build --workspace=admin"
hr
if npm run build --workspace=admin; then
  ok "admin build passed"
  ADMIN_OK=1
else
  mark_error "admin build failed"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 8 — Web build (isolated)
# ═══════════════════════════════════════════════════════════════════════════════

section "Step 8 — Web build"

WEB_OK=0
hr
step "npm run build --workspace=web"
hr
if npm run build --workspace=web; then
  ok "web build passed"
  WEB_OK=1
else
  mark_error "web build failed"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 9 — API build
# ═══════════════════════════════════════════════════════════════════════════════

section "Step 9 — API build"

API_OK=0
hr
step "npm run build --workspace=api"
hr
if npm run build --workspace=api; then
  ok "api build passed"
  API_OK=1
else
  mark_warning "api build failed (may be expected if stub)"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 10 — Full workspace type-check
# ═══════════════════════════════════════════════════════════════════════════════

section "Step 10 — Full workspace type-check"

TYPECHECK_OK=0
hr
step "npm run type-check --workspaces --if-present"
hr
if npm run type-check --workspaces --if-present; then
  ok "full workspace type-check passed"
  TYPECHECK_OK=1
else
  mark_warning "full workspace type-check reported issues"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 11 — Full workspace build (all at once)
# ═══════════════════════════════════════════════════════════════════════════════

section "Step 11 — Full workspace build"

FULL_OK=0
hr
step "npm run build"
hr
if npm run build; then
  ok "full workspace build passed"
  FULL_OK=1
else
  mark_error "full workspace build failed"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# FINAL REPORT
# ═══════════════════════════════════════════════════════════════════════════════

section "Final Report"

print_status() {
  local label="$1" val="$2"
  if [[ "$val" -eq 1 ]]; then
    printf "  %-28s %s\n" "$label" "${GREEN}PASS${NC}"
  else
    printf "  %-28s %s\n" "$label" "${RED}FAIL${NC}"
  fi
}

print_status "Isolated tsc (admin)"   "$TSC_OK"
print_status "Admin build"            "$ADMIN_OK"
print_status "Web build"              "$WEB_OK"
print_status "API build"              "$API_OK"
print_status "Full workspace type"    "$TYPECHECK_OK"
print_status "Full workspace build"   "$FULL_OK"

echo ""
info "Backup: $BACKUP"
info "Errors: $ERRORS · Warnings: $WARNINGS"

if [[ ${#FAILED_STEPS[@]} -gt 0 ]]; then
  echo ""
  warn "Failed steps:"
  for s in "${FAILED_STEPS[@]}"; do
    echo "    - $s"
  done
fi

# ═══════════════════════════════════════════════════════════════════════════════
# EXIT CODE
# ═══════════════════════════════════════════════════════════════════════════════

echo ""
if [[ $ADMIN_OK -eq 1 ]] && [[ $WEB_OK -eq 1 ]] && [[ $FULL_OK -eq 1 ]]; then
  ok "All critical builds GREEN — project is healthy"
  echo ""
  info "Start dev servers:"
  echo "    npm run dev --workspace=admin      # http://localhost:3001"
  echo "    npm run dev --workspace=web        # http://localhost:3000"
  echo ""
  exit 0
else
  err "Some builds FAILED — review output above"
  echo ""
  info "Rollback command:"
  echo "    cp -r $BACKUP/* $ROOT/"
  echo ""
  exit 1
fi
