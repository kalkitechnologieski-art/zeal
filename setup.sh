#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# ZEAL · BATCH 3 FIX
# ═══════════════════════════════════════════════════════════════════════════════

set -Eeuo pipefail

if [[ -t 1 ]]; then
  RED=$'\033[0;31m'; GREEN=$'\033[0;32m'; YELLOW=$'\033[1;33m'
  BLUE=$'\033[0;34m'; CYAN=$'\033[0;36m'; BOLD=$'\033[1m'; NC=$'\033[0m'
else
  RED=""; GREEN=""; YELLOW=""; BLUE=""; CYAN=""; BOLD=""; NC=""
fi
ok()      { printf "%s[✓]%s %s\n" "$GREEN"   "$NC" "$*"; }
warn()    { printf "%s[!]%s %s\n" "$YELLOW"  "$NC" "$*"; }
err()     { printf "%s[✗]%s %s\n" "$RED"     "$NC" "$*" >&2; }
info()    { printf "%s[•]%s %s\n" "$BLUE"    "$NC" "$*"; }
section() { printf "\n%s══ %s ══%s\n\n" "$CYAN" "$*" "$NC"; }
die()     { err "$*"; exit 1; }

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
cd "$ROOT" || die "Cannot cd to $ROOT"
[[ -f "package.json" ]] || die "package.json missing"

STAMP="$(date +%Y%m%d-%H%M%S)"
BK="$ROOT/.backups/batch3-fix-${STAMP}"
mkdir -p "$BK"
export ZEAL_BACKUP="$BK"

section "Batch 3 Fix · $STAMP"
info "Backup: $BK"

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 1 — Web supabase-realtime.ts — remove onOpen/onClose/onError
# ═══════════════════════════════════════════════════════════════════════════════
section "Step 1 — Web supabase-realtime.ts"

node <<'JS_WEB_CLIENT'
const fs = require('fs');
const path = require('path');
const BK = process.env.ZEAL_BACKUP;

const p = 'apps/web/lib/realtime/supabase-realtime.ts';
if (!fs.existsSync(p)) { console.error('missing: ' + p); process.exit(1); }

// Backup
const dest = path.join(BK, p);
fs.mkdirSync(path.dirname(dest), { recursive: true });
if (!fs.existsSync(dest)) fs.copyFileSync(p, dest);

let s = fs.readFileSync(p, 'utf8');

// Remove the three client.realtime.on* block calls
const patterns = [
  /\n\s*client\.realtime\.onOpen\([\s\S]*?\n\s*\}\);\n/,
  /\n\s*client\.realtime\.onClose\([\s\S]*?\n\s*\}\);\n/,
  /\n\s*client\.realtime\.onError\([\s\S]*?\n\s*\}\);\n/,
];

let removed = 0;
for (const re of patterns) {
  if (re.test(s)) { s = s.replace(re, '\n'); removed++; }
}

if (removed === 0) {
  console.log('\x1b[34m[•]\x1b[0m web supabase-realtime already clean');
} else {
  // Ensure the channel-subscribe callback still drives state
  if (!s.includes('setState("connected")')) {
    console.error('unexpected: no setState("connected") after cleanup');
    process.exit(1);
  }
  fs.writeFileSync(p, s, 'utf8');
  console.log('\x1b[32m[✓]\x1b[0m removed ' + removed + ' realtime.on* blocks from web supabase-realtime.ts');
}
JS_WEB_CLIENT

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 2 — Web lib/realtime/index.ts — full rewrite
# ═══════════════════════════════════════════════════════════════════════════════
section "Step 2 — Web lib/realtime/index.ts"

node <<'JS_WEB_INDEX'
const fs = require('fs');
const path = require('path');
const BK = process.env.ZEAL_BACKUP;

const p = 'apps/web/lib/realtime/index.ts';
const dest = path.join(BK, p);
fs.mkdirSync(path.dirname(dest), { recursive: true });
if (fs.existsSync(p) && !fs.existsSync(dest)) fs.copyFileSync(p, dest);

const content = [
  'export {',
  '  subscribeToChannel,',
  '  publishToChannel,',
  '  subscribeToPostgresChanges,',
  '  subscribeToPresence,',
  '  disconnectAllChannels,',
  '  getSupabaseRealtimeClient,',
  '  onConnectionStateChange,',
  '  getConnectionState,',
  '  getConnectionMetrics,',
  '} from "./supabase-realtime";',
  '',
  'export type { RealtimeHandler, ConnectionState } from "./supabase-realtime";',
  '',
  'export { serverPublish } from "./server";',
  '',
  'export interface RealtimeAdapter {',
  '  publish(channel: string, event: string, data: unknown): Promise<void>;',
  '}',
  '',
  'export function getRealtimeAdapter(): RealtimeAdapter {',
  '  return {',
  '    async publish(channel: string, event: string, data: unknown): Promise<void> {',
  '      if (typeof window === "undefined") {',
  '        const { serverPublish } = await import("./server");',
  '        await serverPublish(channel, event, data);',
  '        return;',
  '      }',
  '      const { publishToChannel } = await import("./supabase-realtime");',
  '      await publishToChannel(channel, event, data);',
  '    },',
  '  };',
  '}',
  ''
].join('\n');

fs.writeFileSync(p, content, 'utf8');
console.log('\x1b[32m[✓]\x1b[0m rewrote ' + p + ' (' + Buffer.byteLength(content, 'utf8') + ' B)');
JS_WEB_INDEX

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 3 — Web RealtimeProvider.tsx — 3 targeted fixes
# ═══════════════════════════════════════════════════════════════════════════════
section "Step 3 — Web RealtimeProvider.tsx"

node <<'JS_WEB_PROVIDER'
const fs = require('fs');
const path = require('path');
const BK = process.env.ZEAL_BACKUP;

const p = 'apps/web/components/providers/RealtimeProvider.tsx';
if (!fs.existsSync(p)) { console.error('missing: ' + p); process.exit(1); }

const dest = path.join(BK, p);
fs.mkdirSync(path.dirname(dest), { recursive: true });
if (!fs.existsSync(dest)) fs.copyFileSync(p, dest);

let s = fs.readFileSync(p, 'utf8');
let changed = 0;

// Fix 1: import — NotificationType → Notification
const before1 = s;
s = s.replace(
  'import { useAppStore, type NotificationType } from "@/lib/store/appStore";',
  'import { useAppStore, type Notification } from "@/lib/store/appStore";'
);
if (s !== before1) changed++;

// Fix 2: type cast — use Notification["type"] indexed access
const before2 = s;
s = s.replace(
  'type: (payload.type as NotificationType) || "system",',
  'type: (payload.type as Notification["type"]) || "system",'
);
if (s !== before2) changed++;

// Fix 3: null → undefined for optional fields
const before3 = s;
s = s.replace(
  'actorName: payload.actorName ?? null,',
  'actorName: payload.actorName ?? undefined,'
);
if (s !== before3) changed++;

const before4 = s;
s = s.replace(
  'actorAvatar: payload.actorAvatar ?? null,',
  'actorAvatar: payload.actorAvatar ?? undefined,'
);
if (s !== before4) changed++;

if (changed === 0) {
  console.log('\x1b[34m[•]\x1b[0m web RealtimeProvider already patched');
} else {
  fs.writeFileSync(p, s, 'utf8');
  console.log('\x1b[32m[✓]\x1b[0m web RealtimeProvider: ' + changed + ' fixes applied');
}
JS_WEB_PROVIDER

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 4 — Admin supabase-realtime.ts (mirror)
# ═══════════════════════════════════════════════════════════════════════════════
section "Step 4 — Admin supabase-realtime.ts"

node <<'JS_ADMIN_CLIENT'
const fs = require('fs');
const path = require('path');
const BK = process.env.ZEAL_BACKUP;

const p = 'apps/admin/lib/realtime/supabase-realtime.ts';
if (!fs.existsSync(p)) { console.error('missing: ' + p); process.exit(1); }

const dest = path.join(BK, p);
fs.mkdirSync(path.dirname(dest), { recursive: true });
if (!fs.existsSync(dest)) fs.copyFileSync(p, dest);

let s = fs.readFileSync(p, 'utf8');

const patterns = [
  /\n\s*client\.realtime\.onOpen\([\s\S]*?\n\s*\}\);\n/,
  /\n\s*client\.realtime\.onClose\([\s\S]*?\n\s*\}\);\n/,
  /\n\s*client\.realtime\.onError\([\s\S]*?\n\s*\}\);\n/,
];

let removed = 0;
for (const re of patterns) {
  if (re.test(s)) { s = s.replace(re, '\n'); removed++; }
}

if (removed === 0) {
  console.log('\x1b[34m[•]\x1b[0m admin supabase-realtime already clean');
} else {
  fs.writeFileSync(p, s, 'utf8');
  console.log('\x1b[32m[✓]\x1b[0m removed ' + removed + ' realtime.on* blocks from admin supabase-realtime.ts');
}
JS_ADMIN_CLIENT

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 5 — Admin RealtimeProvider.tsx — full rewrite
# ═══════════════════════════════════════════════════════════════════════════════
section "Step 5 — Admin RealtimeProvider.tsx"

node <<'JS_ADMIN_PROVIDER'
const fs = require('fs');
const path = require('path');
const BK = process.env.ZEAL_BACKUP;

const p = 'apps/admin/components/providers/RealtimeProvider.tsx';
const dest = path.join(BK, p);
fs.mkdirSync(path.dirname(dest), { recursive: true });
if (fs.existsSync(p) && !fs.existsSync(dest)) fs.copyFileSync(p, dest);

const L = [
  '"use client";',
  '',
  'import {',
  '  createContext,',
  '  useCallback,',
  '  useContext,',
  '  useEffect,',
  '  useRef,',
  '  useState,',
  '  type ReactNode,',
  '} from "react";',
  'import {',
  '  useAdminStore,',
  '  type NotificationType,',
  '  type IncomingAlertType,',
  '  type IncomingAlertData,',
  '} from "@/lib/store/adminStore";',
  'import {',
  '  subscribeToChannel,',
  '  disconnectAllChannels,',
  '  onConnectionStateChange,',
  '  getConnectionState,',
  '  type ConnectionState,',
  '} from "@/lib/realtime/supabase-realtime";',
  '',
  'interface RealtimeContextValue {',
  '  subscribe: <T = unknown>(',
  '    channel: string,',
  '    event: string,',
  '    handler: (data: T) => void,',
  '  ) => () => void;',
  '  connectionState: ConnectionState;',
  '  isConnected: boolean;',
  '}',
  '',
  'const RealtimeContext = createContext<RealtimeContextValue>({',
  '  subscribe: () => () => {},',
  '  connectionState: "disconnected",',
  '  isConnected: false,',
  '});',
  '',
  'export const useRealtimeContext = (): RealtimeContextValue =>',
  '  useContext(RealtimeContext);',
  '',
  'const MAX_SEEN_IDS = 500;',
  'const TRIM_SEEN_IDS_TO = 250;',
  '',
  'interface IncomingNotificationPayload {',
  '  id?: string;',
  '  type?: string;',
  '  message?: string;',
  '  redirectUrl?: string | null;',
  '  actorId?: string;',
  '  actorName?: string | null;',
  '  actorAvatar?: string | null;',
  '  data?: Record<string, unknown>;',
  '}',
  '',
  'interface IncomingAlertPayload {',
  '  id?: string;',
  '  type?: IncomingAlertType;',
  '  message?: string;',
  '  data?: IncomingAlertData;',
  '}',
  '',
  'export function RealtimeProvider({ children }: { children: ReactNode }) {',
  '  const profile = useAdminStore((s) => s.profile);',
  '  const addNotification = useAdminStore((s) => s.addNotification);',
  '  const showIncomingAlert = useAdminStore((s) => s.showIncomingAlert);',
  '  const setSocketConnected = useAdminStore((s) => s.setSocketConnected);',
  '',
  '  const [connectionState, setConnectionState] = useState<ConnectionState>(',
  '    () => getConnectionState(),',
  '  );',
  '  const seenIdsRef = useRef<Set<string>>(new Set());',
  '',
  '  useEffect(() => {',
  '    const unsub = onConnectionStateChange(setConnectionState);',
  '    return unsub;',
  '  }, []);',
  '',
  '  useEffect(() => {',
  '    setSocketConnected(connectionState === "connected");',
  '  }, [connectionState, setSocketConnected]);',
  '',
  '  useEffect(() => {',
  '    if (!profile?.id) return;',
  '    const channel = "user:" + profile.id;',
  '',
  '    const unsubNotifications = subscribeToChannel<IncomingNotificationPayload>(',
  '      channel,',
  '      "notification",',
  '      (payload) => {',
  '        if (!payload?.message) return;',
  '        const id = payload.id || ("notif-" + Date.now());',
  '        if (seenIdsRef.current.has(id)) return;',
  '        seenIdsRef.current.add(id);',
  '        if (seenIdsRef.current.size > MAX_SEEN_IDS) {',
  '          const arr = Array.from(seenIdsRef.current);',
  '          seenIdsRef.current = new Set(arr.slice(-TRIM_SEEN_IDS_TO));',
  '        }',
  '        addNotification({',
  '          id,',
  '          type: (payload.type as NotificationType) || "system",',
  '          message: payload.message,',
  '          redirectUrl: payload.redirectUrl ?? null,',
  '          read: false,',
  '          actorId: payload.actorId || "system",',
  '          actorName: payload.actorName ?? null,',
  '          actorAvatar: payload.actorAvatar ?? null,',
  '          data: payload.data,',
  '        });',
  '      },',
  '    );',
  '',
  '    const unsubAlerts = subscribeToChannel<IncomingAlertPayload>(',
  '      channel,',
  '      "incoming_alert",',
  '      (payload) => {',
  '        if (!payload?.type || !payload.message) return;',
  '        showIncomingAlert({',
  '          id: payload.id || ("alert-" + Date.now()),',
  '          type: payload.type,',
  '          message: payload.message,',
  '          data: payload.data,',
  '          read: false,',
  '        });',
  '      },',
  '    );',
  '',
  '    return () => {',
  '      unsubNotifications();',
  '      unsubAlerts();',
  '    };',
  '  }, [profile?.id, addNotification, showIncomingAlert]);',
  '',
  '  useEffect(() => {',
  '    return () => { disconnectAllChannels(); };',
  '  }, []);',
  '',
  '  const subscribe = useCallback(',
  '    <T,>(channel: string, event: string, handler: (data: T) => void) =>',
  '      subscribeToChannel<T>(channel, event, handler),',
  '    [],',
  '  );',
  '',
  '  return (',
  '    <RealtimeContext.Provider',
  '      value={{',
  '        subscribe,',
  '        connectionState,',
  '        isConnected: connectionState === "connected",',
  '      }}',
  '    >',
  '      {children}',
  '    </RealtimeContext.Provider>',
  '  );',
  '}',
  ''
];

const content = L.join('\n');
fs.writeFileSync(p, content, 'utf8');
console.log('\x1b[32m[✓]\x1b[0m rewrote ' + p + ' (' + Buffer.byteLength(content, 'utf8') + ' B)');
JS_ADMIN_PROVIDER

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 6 — Verify content
# ═══════════════════════════════════════════════════════════════════════════════
section "Step 6 — Verify"

node <<'JS_VERIFY'
const fs = require('fs');
const exists = (p) => fs.existsSync(p);
const has    = (p, n) => exists(p) && fs.readFileSync(p, 'utf8').includes(n);
const notHas = (p, n) => exists(p) && !fs.readFileSync(p, 'utf8').includes(n);

const checks = [
  ['web client: no onOpen',        notHas('apps/web/lib/realtime/supabase-realtime.ts', 'realtime.onOpen')],
  ['web client: no onClose',       notHas('apps/web/lib/realtime/supabase-realtime.ts', 'realtime.onClose')],
  ['web client: no onError',       notHas('apps/web/lib/realtime/supabase-realtime.ts', 'realtime.onError')],
  ['web index: void adapter',      has('apps/web/lib/realtime/index.ts', 'await serverPublish')],
  ['web provider: Notification',   has('apps/web/components/providers/RealtimeProvider.tsx', 'type Notification')],
  ['web provider: no NotificationType', notHas('apps/web/components/providers/RealtimeProvider.tsx', 'as NotificationType')],
  ['web provider: undefined not null', has('apps/web/components/providers/RealtimeProvider.tsx', '?? undefined')],
  ['admin client: no onOpen',      notHas('apps/admin/lib/realtime/supabase-realtime.ts', 'realtime.onOpen')],
  ['admin provider: adminStore',   has('apps/admin/components/providers/RealtimeProvider.tsx', '@/lib/store/adminStore')],
  ['admin provider: useAdminStore', has('apps/admin/components/providers/RealtimeProvider.tsx', 'useAdminStore')],
];

let pass = 0, fail = 0;
for (const [label, ok] of checks) {
  if (ok) { console.log('  \x1b[32m[✓]\x1b[0m ' + label); pass++; }
  else    { console.log('  \x1b[31m[✗]\x1b[0m ' + label); fail++; }
}
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
JS_VERIFY

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 7 — Typecheck + build
# ═══════════════════════════════════════════════════════════════════════════════
section "Step 7 — Typecheck + build"

rm -rf apps/web/.next apps/admin/.next 2>/dev/null || true
find apps -maxdepth 3 -name '*.tsbuildinfo' -delete 2>/dev/null || true

info "Type-check web…"
if (cd apps/web && npx tsc --noEmit) 2>&1 | tail -25; then
  ok "web type-check passed"; TSC_WEB=1
else
  warn "web type-check reported errors"; TSC_WEB=0
fi

info "Type-check admin…"
if (cd apps/admin && npx tsc --noEmit) 2>&1 | tail -15; then
  ok "admin type-check passed"; TSC_ADMIN=1
else
  warn "admin type-check reported errors"; TSC_ADMIN=0
fi

info "Build web…"
if npm run build --workspace=web 2>&1 | tail -20; then
  ok "web build passed"; BUILD_WEB=1
else
  warn "web build failed"; BUILD_WEB=0
fi

info "Build admin…"
if npm run build --workspace=admin 2>&1 | tail -15; then
  ok "admin build passed"; BUILD_ADMIN=1
else
  warn "admin build failed"; BUILD_ADMIN=0
fi

# ═══════════════════════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════════════════════
section "Summary"

print_row() {
  local label="$1" val="$2"
  if [[ "$val" -eq 1 ]]; then
    printf "  %-30s %s\n" "$label" "${GREEN}PASS${NC}"
  else
    printf "  %-30s %s\n" "$label" "${RED}FAIL${NC}"
  fi
}
print_row "Type-check · web"   "${TSC_WEB:-0}"
print_row "Type-check · admin" "${TSC_ADMIN:-0}"
print_row "Build · web"        "${BUILD_WEB:-0}"
print_row "Build · admin"      "${BUILD_ADMIN:-0}"

echo ""
info "Backup:   $BK"
info "Rollback: cp -r $BK/. $ROOT/"

if [[ "${TSC_WEB:-0}" -eq 1 ]] && [[ "${BUILD_WEB:-0}" -eq 1 ]]; then
  ok "Web green — batch 3 complete"
  exit 0
fi
warn "Some checks failed — review above"
exit 0