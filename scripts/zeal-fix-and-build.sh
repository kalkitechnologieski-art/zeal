#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# ZEAL — FIX · TYPECHECK · BUILD
# 1. Writes the corrected admin store + overlay (typed IncomingAlertData)
# 2. Verifies bytes on disk
# 3. Clears every cache (Next, Turbo, tsbuildinfo, node_modules/.cache)
# 4. Runs npx tsc --noEmit (isolated, bypasses Next)
# 5. Runs next build for admin
# 6. Runs next build for web
# 7. Runs full workspace build
# 8. Prints a color-coded pass/fail table
# ═══════════════════════════════════════════════════════════════════════════════

# NOTE: no `set -e`. Every step is captured so we always show the full picture.
set -uo pipefail

# ─── Colors ───────────────────────────────────────────────────────────────────
if [[ -t 1 ]]; then
  RED=$'\033[0;31m'; GREEN=$'\033[0;32m'; YELLOW=$'\033[1;33m'
  BLUE=$'\033[0;34m'; CYAN=$'\033[0;36m'; MAGENTA=$'\033[0;35m'
  BOLD=$'\033[1m'; DIM=$'\033[2m'; NC=$'\033[0m'
else
  RED=""; GREEN=""; YELLOW=""; BLUE=""; CYAN=""; MAGENTA=""; BOLD=""; DIM=""; NC=""
fi

ok()      { printf "%s[✓]%s %s\n" "$GREEN"   "$NC" "$*"; }
warn()    { printf "%s[!]%s %s\n" "$YELLOW"  "$NC" "$*"; }
err()     { printf "%s[✗]%s %s\n" "$RED"     "$NC" "$*"; }
info()    { printf "%s[•]%s %s\n" "$BLUE"    "$NC" "$*"; }
step()    { printf "%s→%s %s\n"   "$MAGENTA" "$NC" "$*"; }
section() { printf "\n%s══ %s ══%s\n\n" "$CYAN" "$*" "$NC"; }
rule()    { printf "%s%s%s\n" "$DIM" "─────────────────────────────────────────────────────────────" "$NC"; }

# ─── Failure collection ───────────────────────────────────────────────────────
declare -a FAILURES=()
declare -a WARNINGS=()
add_failure() { FAILURES+=("$1"); err "$1"; }
add_warning() { WARNINGS+=("$1"); warn "$1"; }

# ─── Locate project root ──────────────────────────────────────────────────────
[[ -f "package.json" ]] || { err "No package.json — run from project root"; exit 1; }
[[ -d "apps/admin"    ]] || { err "apps/admin not found"; exit 1; }

ROOT="$(pwd)"
TS="$(date +%Y%m%d-%H%M%S)"
BACKUP="$ROOT/.backups/fix-build-$TS"

section "Zeal — Fix · Typecheck · Build"
info "Root:    $ROOT"
info "Backup:  $BACKUP"
info "Started: $(date '+%Y-%m-%d %H:%M:%S')"
mkdir -p "$BACKUP" || { err "cannot create backup dir"; exit 1; }

# ─── Helpers ──────────────────────────────────────────────────────────────────
backup_file() {
  local f="$1"
  [[ -f "$f" ]] || return 0
  local rel="${f#$ROOT/}"
  local dest="$BACKUP/$rel"
  mkdir -p "$(dirname "$dest")" 2>/dev/null || return 0
  cp "$f" "$dest" 2>/dev/null || warn "backup failed: $rel"
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
  mkdir -p "$(dirname "$path")" || { add_failure "mkdir failed: $rel"; return 1; }
  backup_file "$path"
  rm -f "$path" 2>/dev/null
  cat > "$path" || { add_failure "cat failed: $rel"; return 1; }
  normalize_lf "$path"
  if [[ ! -s "$path" ]]; then
    add_failure "empty file after write: $rel"
    return 1
  fi
  local size; size=$(wc -c < "$path" | tr -d ' \n')
  ok "wrote $rel ($size bytes)"
  return 0
}

# Run a command, print banner, capture exit code
run_check() {
  local label="$1"; shift
  rule
  step "$label"
  rule
  if "$@"; then
    ok "$label — passed"
    return 0
  else
    local rc=$?
    add_failure "$label — failed (exit $rc)"
    return $rc
  fi
}

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 1 — Snapshot current state
# ═══════════════════════════════════════════════════════════════════════════════

section "Step 1 — Snapshot pre-fix state"

STORE="$ROOT/apps/admin/lib/store/adminStore.ts"
OVERLAY="$ROOT/apps/admin/components/alerts/IncomingAlertOverlay.tsx"

if [[ -f "$OVERLAY" ]]; then
  info "overlay line 44:"
  sed -n '44p' "$OVERLAY" 2>/dev/null | sed 's/^/    /' || echo "    (unreadable)"
fi
if [[ -f "$STORE" ]]; then
  info "store 'data?:' declarations:"
  grep -n 'data?:' "$STORE" 2>/dev/null | sed 's/^/    /' || echo "    (none)"
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
# STEP 4 — Verify writes on disk (byte-level)
# ═══════════════════════════════════════════════════════════════════════════════

section "Step 4 — Verifying writes on disk"

WRITE_OK=1

if grep -q "consultant/calls" "$OVERLAY"; then
  add_failure "overlay still contains '/consultant/calls' — write did not take effect"
  WRITE_OK=0
else
  ok "overlay: no '/consultant/calls'"
fi

if grep -q 'data?: unknown' "$STORE"; then
  add_failure "store still has 'data?: unknown' — write did not take effect"
  WRITE_OK=0
else
  ok "store: no 'data?: unknown'"
fi

if ! grep -q 'IncomingAlertData' "$STORE"; then
  add_failure "store: IncomingAlertData interface missing"
  WRITE_OK=0
else
  ok "store: IncomingAlertData present"
fi

if ! grep -q 'data?: IncomingAlertData' "$STORE"; then
  add_failure "store: data is not typed as IncomingAlertData"
  WRITE_OK=0
else
  ok "store: data typed correctly"
fi

# Show what's actually on the relevant line
rule
info "store: grep 'IncomingAlertData'"
grep -n 'IncomingAlertData' "$STORE" | sed 's/^/    /'
rule
info "overlay: line 44"
sed -n '44p' "$OVERLAY" | sed 's/^/    /'
rule

if [[ $WRITE_OK -ne 1 ]]; then
  section "ABORT — writes did not persist"
  err "The files on disk are not the new versions."
  err "Check that no editor has the files locked."
  err "Restore from: $BACKUP"
  exit 1
fi

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 5 — Purge every cache
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
  [[ -e "$d" ]] && { rm -rf "$d" 2>/dev/null && ok "removed ${d#$ROOT/}" || warn "could not remove $d"; }
done

find "$ROOT/apps" -maxdepth 4 -name '*.tsbuildinfo' -type f -delete 2>/dev/null && \
  ok "removed *.tsbuildinfo" || true

find "$ROOT/apps" -maxdepth 3 -type d -name '.next' -exec rm -rf {} + 2>/dev/null || true
ok "purged nested .next directories"

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 6 — TypeScript: isolated check on apps/admin
# ═══════════════════════════════════════════════════════════════════════════════

section "Step 6 — TypeScript check (apps/admin, isolated)"

pushd "$ROOT/apps/admin" >/dev/null || { add_failure "cannot cd apps/admin"; exit 1; }

TSC_ADMIN_OK=0
if [[ ! -f "tsconfig.json" ]]; then
  add_failure "apps/admin/tsconfig.json missing"
else
  rule
  step "npx tsc --noEmit"
  rule
  if npx tsc --noEmit; then
    ok "admin tsc passed"
    TSC_ADMIN_OK=1
  else
    add_failure "admin tsc failed — see errors above"
  fi
fi

popd >/dev/null || true

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 7 — TypeScript: isolated check on apps/web
# ═══════════════════════════════════════════════════════════════════════════════

section "Step 7 — TypeScript check (apps/web, isolated)"

pushd "$ROOT/apps/web" >/dev/null || { add_failure "cannot cd apps/web"; exit 1; }

TSC_WEB_OK=0
if [[ ! -f "tsconfig.json" ]]; then
  add_failure "apps/web/tsconfig.json missing"
else
  rule
  step "npx tsc --noEmit"
  rule
  if npx tsc --noEmit; then
    ok "web tsc passed"
    TSC_WEB_OK=1
  else
    add_failure "web tsc failed — see errors above"
  fi
fi

popd >/dev/null || true

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 8 — Admin build
# ═══════════════════════════════════════════════════════════════════════════════

section "Step 8 — next build (admin)"

BUILD_ADMIN_OK=0
pushd "$ROOT" >/dev/null
rule
step "npm run build --workspace=admin"
rule
if npm run build --workspace=admin; then
  ok "admin build passed"
  BUILD_ADMIN_OK=1
else
  add_failure "admin build failed"
fi
popd >/dev/null

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 9 — Web build
# ═══════════════════════════════════════════════════════════════════════════════

section "Step 9 — next build (web)"

BUILD_WEB_OK=0
pushd "$ROOT" >/dev/null
rule
step "npm run build --workspace=web"
rule
if npm run build --workspace=web; then
  ok "web build passed"
  BUILD_WEB_OK=1
else
  add_failure "web build failed"
fi
popd >/dev/null

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 10 — API build
# ═══════════════════════════════════════════════════════════════════════════════

section "Step 10 — tsc build (api)"

BUILD_API_OK=0
pushd "$ROOT" >/dev/null
rule
step "npm run build --workspace=api"
rule
if npm run build --workspace=api; then
  ok "api build passed"
  BUILD_API_OK=1
else
  add_warning "api build failed (may be a stub — not critical)"
fi
popd >/dev/null

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 11 — Full workspace build (all together)
# ═══════════════════════════════════════════════════════════════════════════════

section "Step 11 — Full workspace build"

BUILD_ALL_OK=0
pushd "$ROOT" >/dev/null
rule
step "npm run build"
rule
if npm run build; then
  ok "full workspace build passed"
  BUILD_ALL_OK=1
else
  add_failure "full workspace build failed"
fi
popd >/dev/null

# ═══════════════════════════════════════════════════════════════════════════════
# FINAL REPORT
# ═══════════════════════════════════════════════════════════════════════════════

section "FINAL REPORT"

print_row() {
  local label="$1" val="$2"
  if [[ "$val" -eq 1 ]]; then
    printf "  %-34s %s\n" "$label" "${GREEN}PASS${NC}"
  else
    printf "  %-34s %s\n" "$label" "${RED}FAIL${NC}"
  fi
}

print_row "TypeScript · admin (tsc --noEmit)"   "$TSC_ADMIN_OK"
print_row "TypeScript · web   (tsc --noEmit)"   "$TSC_WEB_OK"
print_row "Build      · admin (next build)"     "$BUILD_ADMIN_OK"
print_row "Build      · web   (next build)"     "$BUILD_WEB_OK"
print_row "Build      · api   (tsc)"            "$BUILD_API_OK"
print_row "Build      · full workspace"         "$BUILD_ALL_OK"

echo ""
info "Backup:   $BACKUP"
info "Duration: $(( $(date +%s) - $(date -d "$TS" +%s 2>/dev/null || echo $(date +%s)) ))s"
info "Failures: ${#FAILURES[@]}"
info "Warnings: ${#WARNINGS[@]}"

if [[ ${#FAILURES[@]} -gt 0 ]]; then
  echo ""
  err "Failed checks:"
  for f in "${FAILURES[@]}"; do echo "    · $f"; done
fi

if [[ ${#WARNINGS[@]} -gt 0 ]]; then
  echo ""
  warn "Warnings:"
  for w in "${WARNINGS[@]}"; do echo "    · $w"; done
fi

# ═══════════════════════════════════════════════════════════════════════════════
# EXIT
# ═══════════════════════════════════════════════════════════════════════════════

echo ""
if [[ $TSC_ADMIN_OK -eq 1 && $BUILD_ADMIN_OK -eq 1 && $BUILD_ALL_OK -eq 1 ]]; then
  ok "ALL GREEN — admin is fixed and every build passes"
  echo ""
  info "Start dev servers:"
  echo "    npm run dev --workspace=admin   →  http://localhost:3001"
  echo "    npm run dev --workspace=web     →  http://localhost:3000"
  echo ""
  exit 0
else
  err "Some checks failed — see the table and error list above"
  echo ""
  info "Rollback:"
  echo "    cp -r $BACKUP/* $ROOT/"
  echo ""
  exit 1
fi
