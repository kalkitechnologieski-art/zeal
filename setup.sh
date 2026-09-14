#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# ZEAL · COMPLETE IDEMPOTENT AUDIT
# ═══════════════════════════════════════════════════════════════════════════════
# · Read-only — never modifies the repository
# · Zero network calls · Zero API keys
# · Idempotent — safe to run N times, identical output for identical state
# · 24 sections · colour-coded · Markdown + JSON reports
#
# Usage:
#   ./audit.sh                    # static audit (fast, ~2s)
#   ./audit.sh --typecheck        # + tsc --noEmit on both apps
#   ./audit.sh --build            # + next build on both apps (~2 min)
#   ./audit.sh --full             # + typecheck + build
#   ./audit.sh --json             # emit .audit-report.json too
#   ./audit.sh --verbose          # print every file checked
#   ./audit.sh --section N        # run only section N
# ═══════════════════════════════════════════════════════════════════════════════

set -Eeuo pipefail

VERSION="4.0.0"

# ─── Colors (auto-disable when not a TTY) ─────────────────────────────────────
if [[ -t 1 ]]; then
  RED=$'\033[0;31m'; GREEN=$'\033[0;32m'; YELLOW=$'\033[1;33m'
  BLUE=$'\033[0;34m'; CYAN=$'\033[0;36m'; MAGENTA=$'\033[0;35m'
  BOLD=$'\033[1m'; DIM=$'\033[2m'; NC=$'\033[0m'
else
  RED=""; GREEN=""; YELLOW=""; BLUE=""; CYAN=""; MAGENTA=""; BOLD=""; DIM=""; NC=""
fi

# ─── Flags ────────────────────────────────────────────────────────────────────
DO_TYPECHECK=0
DO_BUILD=0
DO_JSON=0
VERBOSE=0
ONLY_SECTION=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --typecheck) DO_TYPECHECK=1; shift ;;
    --build)     DO_BUILD=1; shift ;;
    --full)      DO_TYPECHECK=1; DO_BUILD=1; shift ;;
    --json)      DO_JSON=1; shift ;;
    --verbose|-v) VERBOSE=1; shift ;;
    --section)   ONLY_SECTION="${2:-}"; shift 2 ;;
    --help|-h)
      cat <<EOF
Zeal Complete Audit v${VERSION}
Usage: $0 [flags]

  --typecheck      Run tsc --noEmit on both apps
  --build          Run next build on both apps (~2 min)
  --full           Enable both
  --json           Also emit .audit-report.json
  --verbose, -v    Print every file checked
  --section N      Run only section N
  --help, -h       Show this help

No API keys or network access required. Read-only. Idempotent.
EOF
      exit 0
      ;;
    *) echo "Unknown flag: $1 (use --help)"; exit 1 ;;
  esac
done

# ─── Locate project root (walk up if needed) ──────────────────────────────────
find_root() {
  local dir="$PWD"
  while [[ "$dir" != "/" ]]; do
    [[ -f "$dir/package.json" && -d "$dir/apps" ]] && { echo "$dir"; return 0; }
    dir="$(dirname "$dir")"
  done
  return 1
}
ROOT="$(find_root)" || { echo "Not in a Zeal project (no package.json + apps/)"; exit 1; }
cd "$ROOT"

REPORT="$ROOT/.audit-report.md"
JSON_REPORT="$ROOT/.audit-report.json"
rm -f "$REPORT"
touch "$REPORT"

# ─── State ────────────────────────────────────────────────────────────────────
PASS=0; FAIL=0; WARN=0; INFO=0
declare -a FAILURES=()
declare -a WARNINGS=()
declare -a JSON_ENTRIES=()

# ─── Output helpers ───────────────────────────────────────────────────────────
section() {
  local n="$1" name="$2"
  if [[ -n "$ONLY_SECTION" ]] && [[ "$ONLY_SECTION" != "$n" ]]; then
    return 1
  fi
  printf "\n%s══ %s. %s ══%s\n\n" "$CYAN" "$n" "$name" "$NC"
  return 0
}

sub() { printf "\n%s── %s%s\n" "$MAGENTA" "$*" "$NC"; }
ok()   { PASS=$((PASS+1)); JSON_ENTRIES+=("PASS|$*"); printf "  %s[✓]%s %s\n" "$GREEN" "$NC" "$*"; }
bad()  { FAIL=$((FAIL+1)); FAILURES+=("$*");   JSON_ENTRIES+=("FAIL|$*"); printf "  %s[✗]%s %s\n" "$RED" "$NC" "$*"; }
warn() { WARN=$((WARN+1)); WARNINGS+=("$*");   JSON_ENTRIES+=("WARN|$*"); printf "  %s[!]%s %s\n" "$YELLOW" "$NC" "$*"; }
info() { INFO=$((INFO+1));                     JSON_ENTRIES+=("INFO|$*"); printf "  %s[•]%s %s\n" "$BLUE" "$NC" "$*"; }

R() { printf "%s\n" "$*" >> "$REPORT"; }

# Guard: run a command only if we're in the requested section
should_run() {
  [[ -z "$ONLY_SECTION" ]] || [[ "$ONLY_SECTION" == "$1" ]]
}

# ─── Reusable checks ──────────────────────────────────────────────────────────
check_file() {
  local label="$1" path="$2"
  if [[ -f "$path" ]]; then
    ok "$label"
    [[ $VERBOSE -eq 1 ]] && info "  $path"
  else
    bad "$label — missing: $path"
  fi
}

check_dir() {
  local label="$1" path="$2"
  if [[ -d "$path" ]]; then
    ok "$label"
  else
    bad "$label — missing: $path"
  fi
}

check_absent() {
  local label="$1" path="$2"
  if [[ -e "$path" ]]; then
    bad "$label — should not exist: $path"
  else
    ok "$label"
  fi
}

check_content() {
  local label="$1" file="$2" needle="$3"
  if [[ ! -f "$file" ]]; then
    bad "$label — file missing: $file"; return
  fi
  if grep -qF "$needle" "$file" 2>/dev/null; then
    ok "$label"
  else
    bad "$label — missing '$needle' in $file"
  fi
}

check_absent_content() {
  local label="$1" file="$2" needle="$3"
  if [[ ! -f "$file" ]]; then
    bad "$label — file missing: $file"; return
  fi
  if grep -qF "$needle" "$file" 2>/dev/null; then
    bad "$label — found forbidden '$needle' in $file"
  else
    ok "$label"
  fi
}

check_regex() {
  local label="$1" file="$2" pattern="$3"
  if [[ ! -f "$file" ]]; then
    bad "$label — file missing: $file"; return
  fi
  if grep -qE "$pattern" "$file" 2>/dev/null; then
    ok "$label"
  else
    bad "$label — no match for /$pattern/ in $file"
  fi
}

check_json_field() {
  local label="$1" file="$2" field="$3"
  if [[ ! -f "$file" ]]; then
    bad "$label — file missing: $file"; return
  fi
  if node -e "const j=require('./$file'); if(j.$field===undefined) process.exit(1)" 2>/dev/null; then
    ok "$label"
  else
    bad "$label — missing field '$field' in $file"
  fi
}

# ═══════════════════════════════════════════════════════════════════════════════
# Header
# ═══════════════════════════════════════════════════════════════════════════════
printf "%s╔═══════════════════════════════════════════════════════════════╗%s\n" "$BOLD" "$NC"
printf "%s║           ZEAL · COMPLETE OFFLINE AUDIT v%-15s║%s\n" "$BOLD" "$VERSION" "$NC"
printf "%s╚═══════════════════════════════════════════════════════════════╝%s\n" "$BOLD" "$NC"
printf "\n"
printf "  %sRoot:%s %s\n" "$BOLD" "$NC" "$ROOT"
printf "  %sTime:%s %s\n" "$BOLD" "$NC" "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
printf "  %sMode:%s static"
[[ $DO_TYPECHECK -eq 1 ]] && printf " + typecheck"
[[ $DO_BUILD -eq 1 ]] && printf " + build"
printf "\n\n"

R "# Zeal Complete Audit Report"
R ""
R "Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
R "Version:   $VERSION"
R "Root:      $ROOT"
R ""

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 1 — Repository Metrics
# ═══════════════════════════════════════════════════════════════════════════════
if section 1 "Repository Metrics"; then
  count() { find "$1" -type f $2 2>/dev/null | wc -l | tr -d ' '; }

  src_files=$(find apps packages -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' \) \
    -not -path '*/node_modules/*' -not -path '*/.next/*' 2>/dev/null | wc -l | tr -d ' ')
  total_lines=$(find apps packages -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' \) \
    -not -path '*/node_modules/*' -not -path '*/.next/*' -exec cat {} + 2>/dev/null | wc -l | tr -d ' ')
  total_bytes=$(find apps packages -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' \) \
    -not -path '*/node_modules/*' -not -path '*/.next/*' -exec wc -c {} + 2>/dev/null | tail -1 | awk '{print $1}')

  api_count=$(count "apps/web/app/api" "-name route.ts")
  web_pages=$(count "apps/web/app" "-name page.tsx")
  admin_pages=$(count "apps/admin/app" "-name page.tsx")
  comp_count=$(count "apps/web/components" "-name *.tsx")
  hook_count=$(count "apps/web/hooks" "-name *.ts")
  lib_count=$(count "apps/web/lib" "-name *.ts")

  info "Total source files:  $src_files"
  info "Total lines of code: $total_lines"
  info "Total bytes:         $total_bytes"
  info "API routes:          $api_count"
  info "Web pages:           $web_pages"
  info "Admin pages:         $admin_pages"
  info "Components:          $comp_count"
  info "Hooks:               $hook_count"
  info "Libraries:           $lib_count"

  # Largest files (top 10 by line count)
  sub "Largest 10 files"
  find apps packages -type f \( -name '*.ts' -o -name '*.tsx' \) \
    -not -path '*/node_modules/*' -not -path '*/.next/*' 2>/dev/null | \
    while read -r f; do
      lines=$(wc -l < "$f" 2>/dev/null | tr -d ' ')
      echo "$lines $f"
    done | sort -rn | head -10 | while read -r lines f; do
      info "$lines lines  ${f#$ROOT/}"
    done

  R ""
  R "## Repository Metrics"
  R ""
  R "| Metric | Value |"
  R "|--------|-------|"
  R "| Source files | $src_files |"
  R "| Lines of code | $total_lines |"
  R "| Bytes | $total_bytes |"
  R "| API routes | $api_count |"
  R "| Web pages | $web_pages |"
  R "| Admin pages | $admin_pages |"
  R "| Components | $comp_count |"
  R "| Hooks | $hook_count |"
  R "| Libraries | $lib_count |"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 2 — Project Structure
# ═══════════════════════════════════════════════════════════════════════════════
if section 2 "Project Structure"; then
  for d in apps packages supabase scripts; do check_dir "directory: $d" "$d"; done
  for f in package.json .gitignore .npmrc vercel.json; do check_file "file: $f" "$f"; done
  for d in backups packages/shared apps/api; do check_absent "dead workspace absent: $d" "$d"; done
  for a in apps/web apps/admin; do check_dir "app present: $a" "$a"; done
fi

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 3 — Import Resolution
# ═══════════════════════════════════════════════════════════════════════════════
if section 3 "Import Resolution"; then
  # Detect broken relative imports
  broken_imports=0
  while IFS= read -r f; do
    dir=$(dirname "$f")
    # Extract relative import paths
    grep -oE "from ['\"]\.[^'\"]+['\"]" "$f" 2>/dev/null | sed "s/from ['\"]//;s/['\"]//" | while read -r imp; do
      # Resolve against the file's directory
      target="$dir/$imp"
      # Try .ts, .tsx, /index.ts, /index.tsx
      found=0
      for candidate in "$target.ts" "$target.tsx" "$target.js" "$target.jsx" \
                       "$target/index.ts" "$target/index.tsx"; do
        if [[ -f "$candidate" ]]; then found=1; break; fi
      done
      if [[ $found -eq 0 ]]; then
        echo "BROKEN: $f -> $imp"
      fi
    done
  done < <(find apps packages -type f \( -name '*.ts' -o -name '*.tsx' \) \
    -not -path '*/node_modules/*' -not -path '*/.next/*' 2>/dev/null) > /tmp/zeal-broken-imports.txt || true

  broken_count=$(wc -l < /tmp/zeal-broken-imports.txt | tr -d ' ')
  if [[ "$broken_count" -eq 0 ]]; then
    ok "no broken relative imports detected"
  else
    bad "$broken_count broken relative import(s) — see /tmp/zeal-broken-imports.txt"
    head -10 /tmp/zeal-broken-imports.txt | while read -r line; do info "$line"; done
  fi

  # Check alias imports (@/...) resolve to real files
  alias_issues=0
  while IFS= read -r f; do
    app_root=""
    case "$f" in
      apps/web/*) app_root="apps/web" ;;
      apps/admin/*) app_root="apps/admin" ;;
      *) continue ;;
    esac
    grep -oE "from ['\"]@/[^'\"]+['\"]" "$f" 2>/dev/null | sed "s/from ['\"]@\///;s/['\"]//" | while read -r imp; do
      target="$app_root/$imp"
      found=0
      for c in "$target.ts" "$target.tsx" "$target.js" "$target/index.ts" "$target/index.tsx"; do
        [[ -f "$c" ]] && { found=1; break; }
      done
      [[ $found -eq 0 ]] && echo "BROKEN ALIAS: $f -> @/$imp"
    done
  done < <(find apps packages -type f \( -name '*.ts' -o -name '*.tsx' \) \
    -not -path '*/node_modules/*' -not -path '*/.next/*' 2>/dev/null) > /tmp/zeal-broken-aliases.txt || true

  alias_count=$(wc -l < /tmp/zeal-broken-aliases.txt | tr -d ' ')
  if [[ "$alias_count" -eq 0 ]]; then
    ok "no broken @/ alias imports"
  else
    bad "$alias_count broken alias import(s) — see /tmp/zeal-broken-aliases.txt"
    head -10 /tmp/zeal-broken-aliases.txt | while read -r line; do info "$line"; done
  fi
fi

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 4 — API Routes
# ═══════════════════════════════════════════════════════════════════════════════
if section 4 "API Routes"; then
  API_ROUTES=(
    "api/auth/sync-user"
    "api/admin/stats" "api/admin/bookings" "api/admin/users" "api/admin/consultants"
    "api/admin/consultants/[id]/stats" "api/admin/verification" "api/admin/withdrawals"
    "api/admin/broadcast" "api/admin/recordings" "api/admin/recordings/[id]/send"
    "api/admin/wallet" "api/admin/wallet/topup" "api/admin/wallet/transactions"
    "api/admin/platform-fee" "api/admin/ai-consultants" "api/admin/invites"
    "api/admin/audit" "api/admin/settings"
    "api/ai/consultants" "api/ai/consultants/[id]" "api/ai/chat" "api/ai/chat/start"
    "api/ai/chat/message" "api/ai/chat/end" "api/ai/horoscope" "api/ai/kundali"
    "api/ai/numerology" "api/ai/palmistry" "api/ai/tarot" "api/ai/assist"
    "api/bookings" "api/bookings/[id]" "api/bookings/[id]/confirm"
    "api/bookings/[id]/cancel" "api/bookings/[id]/rate" "api/bookings/availability"
    "api/calls/start" "api/calls/end" "api/calls/token" "api/calls/[id]"
    "api/calls/recording" "api/meetings/token"
    "api/chat/conversations" "api/chat/[id]" "api/chat/[id]/messages"
    "api/consultant/pulse" "api/consultant/clients" "api/consultant/earnings"
    "api/consultant/availability" "api/consultant/onboarding"
    "api/posts/feed" "api/posts/create" "api/posts/[id]" "api/posts/[id]/cheer"
    "api/posts/[id]/comments" "api/posts/[id]/report"
    "api/sparks/feed" "api/sparks/claim"
    "api/quests" "api/quests/progress" "api/quests/[questId]/complete"
    "api/users/[userId]/profile" "api/users/me/profile" "api/users/me/export"
    "api/users/me/delete" "api/users/[userId]/posts"
    "api/users/[id]/follow" "api/users/[id]/block"
    "api/wallet/balance" "api/wallet/topup" "api/wallet/transactions"
    "api/wallet/webhooks/razorpay" "api/wallet/webhooks/instamojo"
    "api/payments/create-order" "api/payments/verify"
    "api/notifications" "api/notifications/[id]/read" "api/notifications/read-all"
    "api/notifications/unread-count"
    "api/realtime/publish" "api/realtime/token"
    "api/explore/consultants" "api/explore/search" "api/explore/trending"
    "api/health" "api/upload" "api/cron/reminders" "api/cron/alerting"
    "api/debug/log"
    "api/zeal/categories" "api/zeal/chat"
    "api/referral/[userId]" "api/bazaar/listings"
  )

  missing=0
  for r in "${API_ROUTES[@]}"; do
    [[ ! -f "apps/web/app/$r/route.ts" ]] && { bad "missing route: /$r"; missing=$((missing+1)); }
  done
  [[ $missing -eq 0 ]] && ok "all ${#API_ROUTES[@]} API routes present"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 5 — Web Pages
# ═══════════════════════════════════════════════════════════════════════════════
if section 5 "Web Pages"; then
  WEB_PAGES=(
    "dashboard/page" "explore/page" "wallet/page" "notifications/page"
    "profile/page" "profile/edit/page" "post/[id]/page"
    "sparks/page" "quests/page" "referral/page" "bazaar/page" "create/page"
    "chat/page" "chat/[id]/page"
    "ai-astrologers/page" "ai-astrologers/[id]/page"
    "consultant/[id]/page" "booking/page" "bookings/page"
    "call/[bookingId]/page"
    "services/page" "services/[category]/page" "services/[category]/[service]/page"
    "services/horoscope/page" "services/tarot/page" "services/kundali/page"
    "services/numerology/page" "services/palmistry/page" "services/matchmaking/page"
    "auth/login/page" "auth/register/page" "auth/callback/page"
    "consultant/dashboard/page" "consultant/bookings/page" "consultant/clients/page"
    "consultant/earnings/page" "consultant/availability/page" "consultant/settings/page"
    "consultant/onboarding/page" "consultant/pending/page" "consultant/white-label/page"
    "white-label/[subdomain]/page" "white-label/[subdomain]/services/page"
    "white-label/[subdomain]/book/page"
    "payment/success/page" "payment/failure/page" "debug/page"
    "error" "global-error" "loading" "not-found"
  )
  missing=0
  for p in "${WEB_PAGES[@]}"; do
    [[ ! -f "apps/web/app/$p.tsx" ]] && { bad "missing web page: /$p"; missing=$((missing+1)); }
  done
  [[ $missing -eq 0 ]] && ok "all ${#WEB_PAGES[@]} web pages present"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 6 — Admin Pages
# ═══════════════════════════════════════════════════════════════════════════════
if section 6 "Admin Pages"; then
  ADMIN_PAGES=(
    "(dashboard)/dashboard/page" "(dashboard)/analytics/page"
    "(dashboard)/bookings/page" "(dashboard)/consultants/page"
    "(dashboard)/users/page" "(dashboard)/verification/page"
    "(dashboard)/withdrawals/page" "(dashboard)/broadcast/page"
    "(dashboard)/recordings/page" "(dashboard)/wallet/page"
    "(dashboard)/platform-fee/page" "(dashboard)/ai-consultants/page"
    "(dashboard)/settings/page" "(dashboard)/settings/admins/page"
    "(auth)/login/page" "(auth)/mfa/page" "(auth)/forgot-password/page"
    "(auth)/reset-password/page" "(auth)/accept-invite/page"
    "consultant/dashboard/page"
    "global-error" "loading"
  )
  missing=0
  for p in "${ADMIN_PAGES[@]}"; do
    [[ ! -f "apps/admin/app/$p.tsx" ]] && { bad "missing admin page: /$p"; missing=$((missing+1)); }
  done
  [[ $missing -eq 0 ]] && ok "all ${#ADMIN_PAGES[@]} admin pages present"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 7 — Core Libraries
# ═══════════════════════════════════════════════════════════════════════════════
if section 7 "Core Libraries"; then
  LIBS=(
    "apps/web/lib/auth/server.ts" "apps/web/lib/auth/client.ts"
    "apps/web/lib/auth/oauth.ts" "apps/web/lib/auth/admin.ts"
    "apps/web/lib/auth/rbac.ts" "apps/web/lib/auth/roles.ts"
    "apps/web/lib/auth/invites.ts"
    "apps/web/lib/audit/index.ts" "apps/web/lib/cache.ts"
    "apps/web/lib/errors.ts"
    "apps/web/lib/logger/index.ts" "apps/web/lib/logger/client.ts"
    "apps/web/lib/logger/server.ts" "apps/web/lib/logger/api-wrapper.ts"
    "apps/web/lib/observability/index.ts" "apps/web/lib/rate-limit/index.ts"
    "apps/web/lib/wallet/ledger.ts" "apps/web/lib/notifications/service.ts"
    "apps/web/lib/scheduling/index.ts" "apps/web/lib/scheduling/internal.ts"
    "apps/web/lib/scheduling/types.ts"
    "apps/web/lib/realtime/supabase-realtime.ts" "apps/web/lib/realtime/server.ts"
    "apps/web/lib/livekit/client.ts" "apps/web/lib/livekit/room.ts"
    "apps/web/lib/emails/index.ts" "apps/web/lib/emails/resend.ts"
    "apps/web/lib/emails/templates.ts"
    "apps/web/lib/payments/index.ts" "apps/web/lib/payments/razorpay.ts"
    "apps/web/lib/payments/razorpay-client.ts"
    "apps/web/lib/storage/index.ts" "apps/web/lib/storage/r2.ts"
    "apps/web/lib/supabase/client.ts" "apps/web/lib/supabase/server.ts"
    "apps/web/lib/supabase/admin.ts"
    "apps/web/lib/security.ts" "apps/web/lib/validation.ts"
  )
  missing=0
  for f in "${LIBS[@]}"; do
    [[ ! -f "$f" ]] && { bad "missing library: $f"; missing=$((missing+1)); }
  done
  [[ $missing -eq 0 ]] && ok "all ${#LIBS[@]} core libraries present"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 8 — React Hooks
# ═══════════════════════════════════════════════════════════════════════════════
if section 8 "React Hooks"; then
  HOOKS=(
    "useAiConsultants.ts" "useBooking.ts" "useCall.ts" "useChat.ts"
    "useDebounce.ts" "useFeed.ts" "useNotifications.ts" "usePresence.ts"
    "useRazorpay.ts" "useRealtime.ts" "useRealtimeNotifications.ts"
    "useScrollReveal.ts" "useSessionBilling.ts" "useSocket.ts"
    "useSupabaseAuth.ts" "useWallet.ts" "useWebSocket.ts"
  )
  missing=0
  for h in "${HOOKS[@]}"; do
    [[ ! -f "apps/web/hooks/$h" ]] && { bad "missing hook: $h"; missing=$((missing+1)); }
  done
  [[ $missing -eq 0 ]] && ok "all ${#HOOKS[@]} hooks present"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 9 — Key Components
# ═══════════════════════════════════════════════════════════════════════════════
if section 9 "Key Components"; then
  COMPONENTS=(
    "apps/web/components/providers/SupabaseAuthProvider.tsx"
    "apps/web/components/providers/RealtimeProvider.tsx"
    "apps/web/components/providers/ThemeProvider.tsx"
    "apps/web/components/providers/LoggingProvider.tsx"
    "apps/web/components/layout/TopBar.tsx"
    "apps/web/components/layout/BottomNav.tsx"
    "apps/web/components/feed/PostCard.tsx"
    "apps/web/components/feed/Feed.tsx"
    "apps/web/components/feed/CommentThread.tsx"
    "apps/web/components/chat/ChatWindow.tsx"
    "apps/web/components/chat/MessageBubble.tsx"
    "apps/web/components/chat/MessageInput.tsx"
    "apps/web/components/chat/ConversationList.tsx"
    "apps/web/components/call/CallInterface.tsx"
    "apps/web/components/call/SessionTimer.tsx"
    "apps/web/components/livekit/VideoRoom.tsx"
    "apps/web/components/booking/BookingWizard.tsx"
    "apps/web/components/booking/SlotPicker.tsx"
    "apps/web/components/bookings/BookingCard.tsx"
    "apps/web/components/shared/EmptyState.tsx"
    "apps/web/components/shared/ErrorBoundary.tsx"
    "apps/web/components/shared/FollowButton.tsx"
    "apps/web/components/shared/ConsultantCard.tsx"
    "apps/web/components/shared/ConsultantProfile.tsx"
    "apps/web/components/dev/ConnectionBadge.tsx"
    "apps/web/components/services/ConsultantGrid.tsx"
    "apps/web/components/services/ServiceFilterBar.tsx"
    "apps/web/components/payments/RazorpayButton.tsx"
    "apps/web/components/zeal/ZealChat.tsx"
    "apps/web/components/zeal/CategoryAccordion.tsx"
    "apps/admin/components/layout/AdminSidebar.tsx"
    "apps/admin/components/layout/AdminTopBar.tsx"
    "apps/admin/components/providers/SupabaseAuthProvider.tsx"
    "apps/admin/components/providers/RealtimeProvider.tsx"
    "apps/admin/components/dev/ConnectionBadge.tsx"
    "apps/admin/components/shared/ErrorBoundary.tsx"
  )
  missing=0
  for c in "${COMPONENTS[@]}"; do
    [[ ! -f "$c" ]] && { bad "missing component: $c"; missing=$((missing+1)); }
  done
  [[ $missing -eq 0 ]] && ok "all ${#COMPONENTS[@]} key components present"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 10 — Workflow Wiring
# ═══════════════════════════════════════════════════════════════════════════════
if section 10 "Workflow Wiring"; then
  check_content "middleware: proxy export"         "apps/web/proxy.ts"                "export async function proxy"
  check_content "middleware: subdomain rewrite"     "apps/web/proxy.ts"                "white-label"
  check_content "middleware: admin RBAC"            "apps/web/proxy.ts"                "ADMIN_ROLES"
  check_content "middleware: consultant gate"       "apps/web/proxy.ts"                "CONSULTANT_ROLES"
  check_content "admin middleware: proxy export"    "apps/admin/proxy.ts"              "export default async function proxy"
  check_content "rbac: requireActor"                "apps/web/lib/auth/rbac.ts"        "requireActor"
  check_content "rbac: requireRole"                 "apps/web/lib/auth/rbac.ts"        "requireRole"
  check_content "rbac: requireConsultant"           "apps/web/lib/auth/rbac.ts"        "requireConsultant"
  check_absent_content "rbac: no user_metadata read" "apps/web/lib/auth/rbac.ts"        "user_metadata"
  check_content "audit: writes AdminAuditLog"       "apps/web/lib/audit/index.ts"      "AdminAuditLog"
  check_content "audit: never throws"               "apps/web/lib/audit/index.ts"      "Never throws"
  check_content "realtime: reconnect w/ backoff"    "apps/web/lib/realtime/supabase-realtime.ts" "scheduleReconnect"
  check_content "realtime: connection metrics"      "apps/web/lib/realtime/supabase-realtime.ts" "getConnectionMetrics"
  check_content "realtime: server publish + retry"  "apps/web/lib/realtime/server.ts"  "retryDelayMs"
  check_content "ledger: idempotency"               "apps/web/lib/wallet/ledger.ts"    "getByReferenceId"
  check_content "ledger: P2034 retry"               "apps/web/lib/wallet/ledger.ts"    "P2034"
  check_content "livekit: room factory"             "apps/web/lib/livekit/client.ts"   "createCallRoom"
  check_content "livekit: connect"                  "apps/web/lib/livekit/client.ts"   "connectCallRoom"
  check_content "livekit: subscribe"                "apps/web/lib/livekit/client.ts"   "subscribeToRoom"
  check_content "bookings: tstzrange overlap"       "apps/web/app/api/bookings/route.ts" "tstzrange"
  check_content "bookings: realtime publish"        "apps/web/app/api/bookings/route.ts" "serverPublish"
  check_content "bookings: idempotency header"      "apps/web/app/api/bookings/route.ts" "Idempotency"
  check_content "calls/end: null booking guard"     "apps/web/app/api/calls/end/route.ts" "!callSession.isAI"
  check_content "razorpay: timing-safe HMAC"        "apps/web/app/api/wallet/webhooks/razorpay/route.ts" "timingSafeEqual"
  check_content "razorpay: idempotency"             "apps/web/app/api/wallet/webhooks/razorpay/route.ts" "alreadyCredited"
  check_content "instamojo: timing-safe HMAC"       "apps/web/app/api/wallet/webhooks/instamojo/route.ts" "timingSafeEqual"
  check_content "instamojo: idempotency"            "apps/web/app/api/wallet/webhooks/instamojo/route.ts" "alreadyCredited"
  check_content "chat: publish to conversation"     "apps/web/app/api/chat/[id]/messages/route.ts" 'serverPublish("chat:"'
  check_content "chat: publish to recipient"        "apps/web/app/api/chat/[id]/messages/route.ts" 'user:'
  check_content "health: DB check"                  "apps/web/app/api/health/route.ts" "database"
  check_content "health: supabase env check"        "apps/web/app/api/health/route.ts" "env-supabase"
  check_content "health: payments env check"        "apps/web/app/api/health/route.ts" "env-payments"
  check_content "health: AI env check"              "apps/web/app/api/health/route.ts" "env-ai"
  check_content "health: 503 on down"               "apps/web/app/api/health/route.ts" "503"
  check_content "cron/alerting: secret gate"        "apps/web/app/api/cron/alerting/route.ts" "CRON_SECRET"
  check_content "cron/alerting: webhook"            "apps/web/app/api/cron/alerting/route.ts" "ALERT_WEBHOOK_URL"
  check_content "cron/reminders: secret gate"       "apps/web/app/api/cron/reminders/route.ts" "CRON_SECRET"
  check_content "observability: captureError"       "apps/web/lib/observability/index.ts" "captureError"
  check_content "observability: captureMessage"     "apps/web/lib/observability/index.ts" "captureMessage"
  check_content "observability: setUser"            "apps/web/lib/observability/index.ts" "setUser"
  check_content "observability: addBreadcrumb"      "apps/web/lib/observability/index.ts" "addBreadcrumb"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 11 — Security Controls
# ═══════════════════════════════════════════════════════════════════════════════
if section 11 "Security Controls"; then
  # Env files in git
  if command -v git >/dev/null 2>&1 && git rev-parse --git-dir >/dev/null 2>&1; then
    if git ls-files 2>/dev/null | grep -E '^\.env(\.|$)' | grep -vE '\.template$|\.example$' | grep -q .; then
      bad "env files tracked in git"
    else
      ok "no env files tracked in git"
    fi
  else
    warn "not a git repo — skipping env tracking check"
  fi

  # user_metadata never used for authz
  um_sites=$(grep -rn --include='*.ts' --include='*.tsx' \
    'user_metadata.*role\|role.*user_metadata' \
    apps/web/lib apps/admin/lib apps/web/proxy.ts apps/admin/proxy.ts 2>/dev/null | \
    grep -v '//' | grep -v '\*' | wc -l | tr -d ' ')
  [[ "$um_sites" -eq 0 ]] && ok "user_metadata.role never used for authz" \
    || bad "user_metadata.role used for authz ($um_sites site(s))"

  # Timing-safe webhooks
  for w in razorpay instamojo; do
    f="apps/web/app/api/wallet/webhooks/$w/route.ts"
    if [[ -f "$f" ]] && grep -q 'timingSafeEqual' "$f"; then
      ok "$w webhook timing-safe"
    else
      bad "$w webhook not timing-safe"
    fi
  done

  # Rate limits
  grep -q 'enforceRateLimit' apps/web/app/api/wallet/topup/route.ts 2>/dev/null && \
    ok "wallet/topup is rate-limited" || warn "wallet/topup not rate-limited"
  grep -q 'enforceRateLimit' apps/web/app/api/auth/sync-user/route.ts 2>/dev/null && \
    ok "auth/sync-user is rate-limited" || warn "auth/sync-user not rate-limited"

  # Cron secret
  for c in reminders alerting; do
    f="apps/web/app/api/cron/$c/route.ts"
    if [[ -f "$f" ]] && grep -q 'CRON_SECRET' "$f"; then
      ok "cron/$c is secret-gated"
    else
      warn "cron/$c not gated"
    fi
  done

  # Debug endpoint auth
  if [[ -f "apps/web/app/api/debug/log/route.ts" ]]; then
    grep -qE 'getUserId|requireActor|requireRole' apps/web/app/api/debug/log/route.ts && \
      ok "debug/log is auth-gated" || warn "debug/log is publicly accessible"
  fi

  check_absent "public debug route removed" "apps/web/app/api/debug/ai-consultants"

  # service_role leak scan
  if [[ -d "apps/web/.next/static" ]]; then
    if grep -rq 'service_role' apps/web/.next/static 2>/dev/null; then
      bad "service_role key leaked into client bundle"
    else
      ok "service_role not in client bundle"
    fi
  else
    info "client bundle not built — skipped bundle scan"
  fi

  # .gitignore patterns
  for pattern in '.env' '.backups/'; do
    grep -qF "$pattern" .gitignore 2>/dev/null && \
      ok ".gitignore contains '$pattern'" || warn ".gitignore missing '$pattern'"
  done
fi

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 12 — Database
# ═══════════════════════════════════════════════════════════════════════════════
if section 12 "Database"; then
  mig_count=$(find supabase/migrations -name '*.sql' 2>/dev/null | wc -l | tr -d ' ')
  [[ "$mig_count" -ge 5 ]] && ok "$mig_count migrations present" \
    || warn "only $mig_count migrations (expected ≥5)"

  if [[ -f "packages/database/prisma/schema.prisma" ]]; then
    ok "Prisma schema present"
    grep -qE '^\s*url\s*=\s*env\(' packages/database/prisma/schema.prisma && \
      bad "Prisma 7: 'url' inline in datasource" || \
      ok "Prisma 7: no inline url"
    for m in User Wallet Transaction Consultant AIConsultant Booking CallSession Conversation ChatMessage Notification Post Comment Cheer; do
      grep -q "^model $m " packages/database/prisma/schema.prisma || bad "Prisma model missing: $m"
    done
    ok "Prisma core models checked"
    for tbl in AdminAuditLog AdminInvite AdminLoginAttempt; do
      grep -rq "CREATE TABLE IF NOT EXISTS \"$tbl\"" supabase/migrations/*.sql 2>/dev/null || \
        warn "SQL migration for $tbl not found"
    done
  else
    bad "Prisma schema missing"
  fi

  grep -rq 'supabase_realtime' supabase/migrations/*.sql 2>/dev/null && \
    ok "realtime publication migration present" || warn "no realtime publication migration"
  grep -rq 'ENABLE ROW LEVEL SECURITY' supabase/migrations/*.sql 2>/dev/null && \
    ok "RLS policies migration present" || warn "no RLS policies migration"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 13 — Type Safety
# ═══════════════════════════════════════════════════════════════════════════════
if section 13 "Type Safety"; then
  any_count=$(grep -rn --include='*.ts' --include='*.tsx' \
    -E ':\s*any\b|<any>|as any' \
    apps/web/app apps/web/components apps/web/hooks apps/web/lib \
    apps/admin/app apps/admin/components apps/admin/hooks apps/admin/lib \
    2>/dev/null | grep -v '//.*any' | wc -l | tr -d ' ')
  if [[ "$any_count" -eq 0 ]]; then ok "no 'any' types"
  elif [[ "$any_count" -lt 30 ]]; then warn "$any_count 'any' usages (acceptable)"
  else bad "$any_count 'any' usages (excessive)"; fi

  ts_ignore=$(grep -rn --include='*.ts' --include='*.tsx' \
    '@ts-ignore\|@ts-expect-error' \
    apps/web/app apps/web/components apps/web/hooks apps/web/lib \
    apps/admin/app apps/admin/components apps/admin/hooks apps/admin/lib \
    2>/dev/null | wc -l | tr -d ' ')
  [[ "$ts_ignore" -eq 0 ]] && ok "no @ts-* suppressions" || warn "$ts_ignore @ts-* suppressions"

  console_count=$(grep -rn --include='*.ts' --include='*.tsx' \
    'console\.log' \
    apps/web/app apps/web/components apps/web/hooks apps/web/lib \
    apps/admin/app apps/admin/components apps/admin/hooks apps/admin/lib \
    2>/dev/null | grep -v 'lib/logger' | grep -v 'lib/observability' | wc -l | tr -d ' ')
  [[ "$console_count" -eq 0 ]] && ok "no raw console.log in production code" \
    || warn "$console_count console.log call(s)"

  # Non-null assertions on user data (rule-of-thumb)
  nna_count=$(grep -rn --include='*.ts' --include='*.tsx' \
    -E 'user!\.[a-zA-Z]|\.user!\.' \
    apps/web/app apps/web/components 2>/dev/null | wc -l | tr -d ' ')
  [[ "$nna_count" -eq 0 ]] && ok "no non-null assertions on user data" \
    || warn "$nna_count non-null assertion(s) on user data"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 14 — Environment Documentation
# ═══════════════════════════════════════════════════════════════════════════════
if section 14 "Environment Documentation"; then
  REQUIRED_ENV=(
    NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY
    DATABASE_URL DIRECT_URL NEXT_PUBLIC_APP_URL NEXT_PUBLIC_ADMIN_URL
    NEXT_PUBLIC_REALTIME_ENABLED NEXT_PUBLIC_RAZORPAY_KEY_ID RAZORPAY_KEY_SECRET
    RAZORPAY_WEBHOOK_SECRET RESEND_API_KEY GROQ_API_KEY LIVEKIT_API_KEY
    LIVEKIT_API_SECRET LIVEKIT_WS_URL CRON_SECRET
  )
  documented=0
  for v in "${REQUIRED_ENV[@]}"; do
    if grep -rq "^${v}=" .env.vercel.required .env.vercel.template .env.example 2>/dev/null; then
      documented=$((documented+1))
    fi
  done
  if [[ $documented -eq ${#REQUIRED_ENV[@]} ]]; then
    ok "all ${#REQUIRED_ENV[@]} env vars documented in templates"
  elif [[ $documented -gt 0 ]]; then
    warn "$documented / ${#REQUIRED_ENV[@]} env vars documented"
  else
    warn "no env templates found"
  fi
fi

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 15 — Quality Gates
# ═══════════════════════════════════════════════════════════════════════════════
if section 15 "Quality Gates"; then
  [[ "$(wc -l < .npmrc 2>/dev/null || echo 0)" -ge 2 ]] && \
    ok ".npmrc has real newlines" || warn ".npmrc may have literal \\n"

  grep -q 'crons' vercel.json 2>/dev/null && \
    ok "vercel.json has cron schedule" || warn "vercel.json has no crons"

  empty_tsx=$(find apps -name '*.tsx' -size 0 -not -path '*/node_modules/*' -not -path '*/.next/*' 2>/dev/null | wc -l | tr -d ' ')
  [[ "$empty_tsx" -eq 0 ]] && ok "no empty .tsx files" || warn "$empty_tsx empty .tsx"

  for a in web admin; do
    check_file "apps/$a/next.config.js" "apps/$a/next.config.js"
    check_file "apps/$a/proxy.ts" "apps/$a/proxy.ts"
  done
fi

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 16 — Realtime Channels
# ═══════════════════════════════════════════════════════════════════════════════
if section 16 "Realtime Channels"; then
  check_content "user: notification channel" "apps/web/components/providers/RealtimeProvider.tsx" "user:"
  check_content "user: wallet channel"       "apps/web/hooks/useWallet.ts"        "user:"
  check_content "consultant: booking events" "apps/web/app/consultant/dashboard/page.tsx" "useRealtime"
  check_content "chat: message events"       "apps/web/hooks/useChat.ts"          "chat:"
  check_content "feed: post events"          "apps/web/components/feed/Feed.tsx"  "feed:global"
  check_content "presence: subscribe"        "apps/web/hooks/usePresence.ts"      "subscribeToPresence"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 17 — Test Coverage
# ═══════════════════════════════════════════════════════════════════════════════
if section 17 "Test Coverage"; then
  test_count=$(find . -type f \( -name '*.test.ts' -o -name '*.test.tsx' \
    -o -name '*.spec.ts' -o -name '*.spec.tsx' \) \
    -not -path '*/node_modules/*' -not -path '*/.next/*' 2>/dev/null | wc -l | tr -d ' ')
  [[ "$test_count" -gt 0 ]] && ok "$test_count test file(s)" || warn "no test files"

  grep -q '"test"' package.json 2>/dev/null && \
    ok "npm test script present" || warn "no npm test script"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 18 — Documentation
# ═══════════════════════════════════════════════════════════════════════════════
if section 18 "Documentation"; then
  for d in README.md DEPLOYMENT_CHECKLIST.md docs/api.md docs/deployment.md; do
    [[ -f "$d" ]] && ok "doc present: $d" || warn "doc missing: $d"
  done
fi

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 19 — Dependency Health
# ═══════════════════════════════════════════════════════════════════════════════
if section 19 "Dependency Health"; then
  if [[ -f package.json ]] && [[ -d node_modules ]]; then
    # Missing dependencies: listed in package.json but not installed
    missing_deps=0
    for pkg_json in package.json apps/web/package.json apps/admin/package.json; do
      [[ ! -f "$pkg_json" ]] && continue
      while IFS= read -r dep; do
        [[ -z "$dep" ]] && continue
        [[ ! -d "node_modules/$dep" ]] && { bad "missing install: $dep (from $pkg_json)"; missing_deps=$((missing_deps+1)); }
      done < <(node -e "
        const p = require('./$pkg_json');
        const deps = { ...(p.dependencies||{}), ...(p.devDependencies||{}) };
        Object.keys(deps).filter(d => !d.startsWith('@zeal/')).forEach(d => console.log(d));
      " 2>/dev/null)
    done
    [[ $missing_deps -eq 0 ]] && ok "all declared packages installed"
  else
    warn "node_modules missing — cannot check dependency health"
  fi

  # Duplicate packages across apps
  for dep in next react react-dom; do
    versions=$(grep -h "\"$dep\":" package.json apps/*/package.json 2>/dev/null | \
      sed 's/.*: *"//;s/".*//' | sort -u)
    count=$(echo "$versions" | grep -c . || echo 0)
    [[ "$count" -gt 1 ]] && warn "$dep has $count different versions across workspaces" || true
  done
fi

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 20 — Route Handlers Typed Correctly
# ═══════════════════════════════════════════════════════════════════════════════
if section 20 "Route Handler Types"; then
  # Every POST/PUT/PATCH route should parse with Zod
  unvalidated=0
  while IFS= read -r f; do
    if grep -qE 'export (async function |const )(POST|PUT|PATCH)' "$f"; then
      if ! grep -qE '\.parse\(|\.safeParse\(|schema' "$f"; then
        warn "route without validation: ${f#$ROOT/}"
        unvalidated=$((unvalidated+1))
      fi
    fi
  done < <(find apps/web/app/api apps/admin/app/api -name 'route.ts' -not -path '*/node_modules/*' 2>/dev/null)
  [[ $unvalidated -eq 0 ]] && ok "all mutating routes have validation"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 21 — Error Handling
# ═══════════════════════════════════════════════════════════════════════════════
if section 21 "Error Handling"; then
  # Every app has error.tsx and global-error.tsx
  for a in web admin; do
    [[ -f "apps/$a/app/error.tsx" ]] || [[ -f "apps/$a/app/global-error.tsx" ]] && \
      ok "$a has error boundary" || bad "$a missing error boundary"
  done

  # withErrorHandler usage in API routes
  total_routes=$(find apps/web/app/api -name 'route.ts' 2>/dev/null | wc -l | tr -d ' ')
  wrapped=$(grep -rl 'withErrorHandler' apps/web/app/api 2>/dev/null | wc -l | tr -d ' ')
  info "$wrapped / $total_routes routes use withErrorHandler"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 22 — Accessibility Basics
# ═══════════════════════════════════════════════════════════════════════════════
if section 22 "Accessibility"; then
  # Buttons without aria-label that contain only icons
  icon_buttons=$(grep -rn --include='*.tsx' '<button' apps/web/components apps/admin/components 2>/dev/null | \
    grep -v 'aria-label' | grep -v '>' | head -5 | wc -l | tr -d ' ')
  if [[ "$icon_buttons" -eq 0 ]]; then
    ok "all buttons have aria-label or text content"
  else
    warn "$icon_buttons button(s) may lack accessible labels"
  fi

  # Images without alt
  img_no_alt=$(grep -rn --include='*.tsx' '<img' apps/web/components apps/admin/components 2>/dev/null | \
    grep -v 'alt=' | wc -l | tr -d ' ')
  [[ "$img_no_alt" -eq 0 ]] && ok "all img elements have alt" \
    || warn "$img_no_alt img element(s) missing alt"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 23 — Type-check (optional)
# ═══════════════════════════════════════════════════════════════════════════════
if [[ $DO_TYPECHECK -eq 1 ]] && section 23 "Type-check (live)"; then
  if [[ ! -d "node_modules" ]]; then
    warn "node_modules missing — skipping type-check"
  else
    sub "web"
    if (cd apps/web && npx tsc --noEmit > /tmp/tsc-web.log 2>&1); then
      ok "apps/web typecheck passed"
    else
      bad "apps/web typecheck failed — see /tmp/tsc-web.log"
    fi
    sub "admin"
    if (cd apps/admin && npx tsc --noEmit > /tmp/tsc-admin.log 2>&1); then
      ok "apps/admin typecheck passed"
    else
      bad "apps/admin typecheck failed — see /tmp/tsc-admin.log"
    fi
  fi
fi

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 24 — Build (optional)
# ═══════════════════════════════════════════════════════════════════════════════
if [[ $DO_BUILD -eq 1 ]] && section 24 "Build (live)"; then
  if [[ ! -d "node_modules" ]]; then
    warn "node_modules missing — skipping build"
  else
    sub "web"
    if npm run build --workspace=web > /tmp/build-web.log 2>&1; then
      ok "web build passed"
    else
      bad "web build failed — see /tmp/build-web.log"
    fi
    sub "admin"
    if npm run build --workspace=admin > /tmp/build-admin.log 2>&1; then
      ok "admin build passed"
    else
      bad "admin build failed — see /tmp/build-admin.log"
    fi
  fi
fi

# ═══════════════════════════════════════════════════════════════════════════════
# FINAL SUMMARY
# ═══════════════════════════════════════════════════════════════════════════════
printf "\n%s══ FINAL SUMMARY ══%s\n\n" "$CYAN" "$NC"

TOTAL=$((PASS + FAIL))
PCT=0
[[ $TOTAL -gt 0 ]] && PCT=$(( PASS * 100 / TOTAL ))

printf "  %s╔══════════════════════════════════════════════╗%s\n" "$BOLD" "$NC"
printf "  %s║              AUDIT RESULTS                   ║%s\n" "$BOLD" "$NC"
printf "  %s╚══════════════════════════════════════════════╝%s\n" "$BOLD" "$NC"
printf "\n"
printf "  %sPassed:%s   %s%d%s\n" "$BOLD" "$NC" "$GREEN" "$PASS" "$NC"
printf "  %sFailed:%s   %s%d%s\n" "$BOLD" "$NC" "$([ $FAIL -gt 0 ] && echo "$RED" || echo "$GREEN")" "$FAIL" "$NC"
printf "  %sWarnings:%s %s%d%s\n" "$BOLD" "$NC" "$YELLOW" "$WARN" "$NC"
printf "  %sInfo:%s     %s%d%s\n" "$BOLD" "$NC" "$BLUE" "$INFO" "$NC"
printf "  %sReadiness:%s %d%%\n" "$BOLD" "$NC" "$PCT"
printf "\n"

if [[ ${#FAILURES[@]} -gt 0 ]]; then
  printf "  %sCRITICAL FAILURES:%s\n" "$RED$BOLD" "$NC"
  for f in "${FAILURES[@]}"; do
    printf "    %s✗%s %s\n" "$RED" "$NC" "$f"
  done
  printf "\n"
fi

if [[ ${#WARNINGS[@]} -gt 0 ]]; then
  printf "  %sWARNINGS:%s\n" "$YELLOW$BOLD" "$NC"
  for w in "${WARNINGS[@]}"; do
    printf "    %s!%s %s\n" "$YELLOW" "$NC" "$w"
  done
  printf "\n"
fi

# Write summary
R ""
R "## Summary"
R ""
R "| Metric | Value |"
R "|--------|-------|"
R "| Passed | $PASS |"
R "| Failed | $FAIL |"
R "| Warnings | $WARN |"
R "| Readiness | $PCT% |"
R ""

if [[ ${#FAILURES[@]} -gt 0 ]]; then
  R "### Failures"
  R ""
  for f in "${FAILURES[@]}"; do R "- ❌ $f"; done
  R ""
fi

if [[ ${#WARNINGS[@]} -gt 0 ]]; then
  R "### Warnings"
  R ""
  for w in "${WARNINGS[@]}"; do R "- ⚠️  $w"; done
  R ""
fi

R "---"
R ""
R "Generated by audit.sh v$VERSION"

# Verdict
if [[ $FAIL -eq 0 ]] && [[ $PCT -ge 95 ]]; then
  printf "  %s✓ PRODUCTION READY%s\n" "$GREEN$BOLD" "$NC"
elif [[ $FAIL -eq 0 ]]; then
  printf "  %s◐ PASSING WITH WARNINGS%s\n" "$YELLOW$BOLD" "$NC"
elif [[ $PCT -ge 85 ]]; then
  printf "  %s◐ NEAR READY%s\n" "$YELLOW$BOLD" "$NC"
else
  printf "  %s✗ NOT READY%s\n" "$RED$BOLD" "$NC"
fi
printf "\n"
printf "  %sReport:%s %s\n" "$BOLD" "$NC" "$REPORT"

# JSON output
if [[ $DO_JSON -eq 1 ]]; then
  {
    printf '{\n'
    printf '  "generated": "%s",\n' "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
    printf '  "version": "%s",\n' "$VERSION"
    printf '  "passed": %d,\n' "$PASS"
    printf '  "failed": %d,\n' "$FAIL"
    printf '  "warnings": %d,\n' "$WARN"
    printf '  "readiness": %d,\n' "$PCT"
    printf '  "failures": ['
    first=1
    for f in "${FAILURES[@]}"; do
      [[ $first -eq 1 ]] && first=0 || printf ','
      printf '"%s"' "$(printf '%s' "$f" | sed 's/"/\\"/g')"
    done
    printf '],\n'
    printf '  "warnings": ['
    first=1
    for w in "${WARNINGS[@]}"; do
      [[ $first -eq 1 ]] && first=0 || printf ','
      printf '"%s"' "$(printf '%s' "$w" | sed 's/"/\\"/g')"
    done
    printf ']\n'
    printf '}\n'
  } > "$JSON_REPORT"
  printf "  %sJSON:%s   %s\n" "$BOLD" "$NC" "$JSON_REPORT"
fi

printf "\n"
[[ $FAIL -gt 0 ]] && exit 1
exit 0