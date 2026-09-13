#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# ZEAL · BATCH 1 · FOUNDATION
# ═══════════════════════════════════════════════════════════════════════════════
# Idempotent · Reversible · Node-powered (no Python dependency)
#
# Usage:  ./batch1.sh [--dry-run] [--yes] [--skip-install] [--skip-build]
# ═══════════════════════════════════════════════════════════════════════════════

set -Eeuo pipefail

VERSION="1.1.0"

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
err()     { printf "%s[✗]%s %s\n" "$RED"     "$NC" "$*" >&2; }
info()    { printf "%s[•]%s %s\n" "$BLUE"    "$NC" "$*"; }
step()    { printf "%s→%s %s\n"   "$MAGENTA" "$NC" "$*"; }
section() { printf "\n%s══ %s ══%s\n\n" "$CYAN" "$*" "$NC"; }
rule()    { printf "%s%s%s\n" "$DIM" "─────────────────────────────────────────────────────────────" "$NC"; }
die()     { err "$*"; exit 1; }

# ─── Flags ────────────────────────────────────────────────────────────────────
DRY_RUN=0
AUTO_YES=0
SKIP_INSTALL=0
SKIP_BUILD=0

for arg in "$@"; do
  case "$arg" in
    --dry-run)      DRY_RUN=1 ;;
    --yes|-y)       AUTO_YES=1 ;;
    --skip-install) SKIP_INSTALL=1 ;;
    --skip-build)   SKIP_BUILD=1 ;;
    --help|-h)
      cat <<EOF
Zeal Batch 1 — Foundation v${VERSION}
Usage: $0 [flags]

  --dry-run        Preview changes without touching disk
  --yes, -y        Skip interactive confirmation
  --skip-install   Don't run npm install at the end
  --skip-build     Don't run build at the end
  --help, -h       Show this help
EOF
      exit 0
      ;;
    *) die "Unknown flag: $arg (use --help)" ;;
  esac
done

# ─── Project root ─────────────────────────────────────────────────────────────
PROJECT_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
cd "$PROJECT_ROOT" || die "Cannot cd to $PROJECT_ROOT"

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="${PROJECT_ROOT}/.backups/batch1-${STAMP}"

# ─── Preflight ────────────────────────────────────────────────────────────────
section "Batch 1 · Foundation · v${VERSION}"
info "Root:    $PROJECT_ROOT"
info "Backup:  $BACKUP_DIR"
info "Dry run: $([[ $DRY_RUN -eq 1 ]] && echo yes || echo no)"

[[ -f "package.json" ]] || die "package.json missing — wrong directory"
[[ -d "apps/admin"   ]] || die "apps/admin missing — wrong directory"
[[ -d "apps/web"     ]] || die "apps/web missing — wrong directory"

command -v node >/dev/null 2>&1 || die "Node.js is required but not on PATH"

if [[ $DRY_RUN -eq 0 ]] && [[ $AUTO_YES -eq 0 ]]; then
  rule
  warn "This will DELETE dead code, REWRITE configs, and CREATE 5 migrations."
  warn "Backup is taken before every change."
  echo ""
  read -r -p "Continue? [y/N] " reply
  [[ "$reply" =~ ^[Yy]$ ]] || die "Aborted by user"
fi

mkdir -p "$BACKUP_DIR" || die "Cannot create backup dir"

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 1 — DELETE DEAD CODE
# ═══════════════════════════════════════════════════════════════════════════════
section "Step 1 — Deleting dead code"

DEAD_PATHS=(
  "backups"
  "packages/shared"
  "apps/api"
  "apps/web/lib/websocket-client.ts"
  "apps/web/lib/wallet/razorpay.ts"
  "apps/web/lib/monitoring/logger.ts"
  "apps/web/lib/realtime/adapter.ts"
  "apps/web/lib/db/indexeddb.ts"
  "apps/web/components/ui/Motion.tsx"
  "apps/web/components/motion/MotionWrapper.tsx"
  "apps/web/app/api/example"
  "apps/web/app/api/debug/ai-consultants"
  "apps/admin/components/shared/NotificationBell.tsx"
  "apps/admin/components/alerts/IncomingAlert.tsx"
  "apps/admin/app/(dashboard)/finance/page.tsx"
  "apps/admin/app/(dashboard)/calls/page.tsx"
  "docker-compose.yml"
)

for p in "${DEAD_PATHS[@]}"; do
  target="$PROJECT_ROOT/$p"
  rel="${target#$PROJECT_ROOT/}"
  if [[ ! -e "$target" ]]; then
    info "skip (missing): $rel"
    continue
  fi
  if [[ $DRY_RUN -eq 1 ]]; then
    info "[dry] would delete: $rel"
    continue
  fi
  dest="$BACKUP_DIR/$rel"
  mkdir -p "$(dirname "$dest")"
  cp -r "$target" "$dest" 2>/dev/null || warn "backup partial: $rel"
  rm -rf "$target"
  ok "deleted: $rel"
done

# Sweep 0-byte .tsx placeholders
info "sweeping 0-byte .tsx placeholders…"
if [[ $DRY_RUN -eq 0 ]]; then
  count=0
  while IFS= read -r -d '' f; do
    rel="${f#$PROJECT_ROOT/}"
    dest="$BACKUP_DIR/$rel"
    mkdir -p "$(dirname "$dest")"
    cp "$f" "$dest" 2>/dev/null || true
    rm -f "$f"
    ok "deleted empty: $rel"
    count=$((count+1))
  done < <(find "$PROJECT_ROOT/apps" -type f -name '*.tsx' -size 0 \
            -not -path '*/node_modules/*' -not -path '*/.next/*' -print0 2>/dev/null || true)
  [[ $count -eq 0 ]] && info "no empty .tsx files found"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 2 — REWRITE CONFIG FILES (Node-powered, no Python)
# ═══════════════════════════════════════════════════════════════════════════════
section "Step 2 — Rewriting config files"

if [[ $DRY_RUN -eq 1 ]]; then
  info "[dry] would rewrite: .gitignore, .npmrc, vercel.json, .env.vercel.required,"
  info "                    .env.vercel.template, tsconfig.json, ci.yml, schema.prisma"
else
  node <<'NODE_CONFIG'
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const BACKUP = process.env.ZEAL_BACKUP_DIR || ('.backups/batch1-' + Date.now());

function backup(p) {
  if (!fs.existsSync(p)) return;
  const dest = path.join(BACKUP, p);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (!fs.existsSync(dest)) {
    try { fs.copyFileSync(p, dest); } catch {}
  }
}

function write(p, content) {
  backup(p);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, 'utf8');
  const size = Buffer.byteLength(content, 'utf8');
  console.log('\x1b[32m[✓]\x1b[0m wrote: ' + p + ' (' + size + ' bytes)');
}

// ─── 1. .gitignore ────────────────────────────────────────────────────────
write('.gitignore', [
  '# ═══════════════════════════════════════════════════════════════════════════',
  '# Dependencies',
  '# ═══════════════════════════════════════════════════════════════════════════',
  'node_modules/',
  'apps/*/node_modules/',
  'packages/*/node_modules/',
  '',
  '# ═══════════════════════════════════════════════════════════════════════════',
  '# Build outputs',
  '# ═══════════════════════════════════════════════════════════════════════════',
  'dist/',
  'build/',
  'out/',
  '.next/',
  '.turbo/',
  '*.tsbuildinfo',
  '',
  '# ═══════════════════════════════════════════════════════════════════════════',
  '# Environment — NEVER commit secrets',
  '# ═══════════════════════════════════════════════════════════════════════════',
  '.env',
  '.env.*',
  '!.env.example',
  '!.env.*.template',
  '.env.local.backup',
  '.env.vercel.required',
  '',
  '# ═══════════════════════════════════════════════════════════════════════════',
  '# Local backups and exports',
  '# ═══════════════════════════════════════════════════════════════════════════',
  '.backups/',
  'backups/',
  'zeal-export-*.txt',
  'zeal-repo-export*.txt',
  'project-zeal-full-export.txt',
  'audit-report*.txt',
  'ts-errors*.txt',
  'eslint-output.txt',
  'env-vars.txt',
  '',
  '# ═══════════════════════════════════════════════════════════════════════════',
  '# Logs',
  '# ═══════════════════════════════════════════════════════════════════════════',
  '*.log',
  'npm-debug.log*',
  'yarn-debug.log*',
  'yarn-error.log*',
  'pnpm-debug.log*',
  '',
  '# ═══════════════════════════════════════════════════════════════════════════',
  '# OS / IDE',
  '# ═══════════════════════════════════════════════════════════════════════════',
  '.DS_Store',
  'Thumbs.db',
  '.vscode/',
  '.idea/',
  '*.swp',
  '*.swo',
  'nul',
  'NUL',
  '',
  '# ═══════════════════════════════════════════════════════════════════════════',
  '# Prisma',
  '# ═══════════════════════════════════════════════════════════════════════════',
  'packages/database/prisma/*.db',
  'packages/database/prisma/*.db-journal',
  ''
].join('\n'));

// ─── 2. .npmrc ────────────────────────────────────────────────────────────
write('.npmrc', 'save-exact=true\nlegacy-peer-deps=true\nfund=false\naudit=false\n');

// ─── 3. vercel.json ───────────────────────────────────────────────────────
write('vercel.json', JSON.stringify({
  "$schema": "https://openapi.vercel.sh/vercel.json",
  framework: "nextjs",
  regions: ["bom1"],
  crons: [
    { path: "/api/cron/reminders", schedule: "*/5 * * * *" }
  ]
}, null, 2) + '\n');

// ─── 4. .env.vercel.required ──────────────────────────────────────────────
write('.env.vercel.required', [
  '# ═══════════════════════════════════════════════════════════════════════════',
  '# ZEAL PLATFORM — REQUIRED VERCEL ENVIRONMENT VARIABLES',
  '# ═══════════════════════════════════════════════════════════════════════════',
  '# Add ALL of these to Vercel → Project → Settings → Environment Variables',
  '# Apply to: Production, Preview, Development',
  '# ═══════════════════════════════════════════════════════════════════════════',
  '',
  '# ─── Supabase (CRITICAL) ──────────────────────────────────────────────────',
  'NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...',
  'SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...',
  '',
  '# ─── Database (CRITICAL) ──────────────────────────────────────────────────',
  'DATABASE_URL=postgresql://postgres.xxxxx:PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1',
  'DIRECT_URL=postgresql://postgres.xxxxx:PASSWORD@aws-0-region.pooler.supabase.com:5432/postgres',
  '',
  '# ─── App URLs (CRITICAL) ──────────────────────────────────────────────────',
  'NEXT_PUBLIC_APP_URL=https://zeal-web.vercel.app',
  'NEXT_PUBLIC_ADMIN_URL=https://zeal-admin.vercel.app',
  'NEXT_PUBLIC_BASE_DOMAIN=vercel.app',
  'NEXT_PUBLIC_REALTIME_ENABLED=true',
  '',
  '# ─── Razorpay (Payments) ──────────────────────────────────────────────────',
  'NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxx',
  'RAZORPAY_KEY_SECRET=xxxxxxxx',
  'RAZORPAY_WEBHOOK_SECRET=xxxxxxxx',
  '',
  '# ─── Resend (Email) ───────────────────────────────────────────────────────',
  'RESEND_API_KEY=re_xxxxxxxx',
  '',
  '# ─── Groq (AI) ────────────────────────────────────────────────────────────',
  'GROQ_API_KEY=gsk_xxxxxxxx',
  '',
  '# ─── Cloudflare R2 (Storage) ──────────────────────────────────────────────',
  'R2_ACCOUNT_ID=xxxxxxxx',
  'R2_ACCESS_KEY_ID=xxxxxxxx',
  'R2_SECRET_ACCESS_KEY=xxxxxxxx',
  'R2_BUCKET_NAME=zeal',
  'R2_PUBLIC_URL=https://pub-xxxxxxxx.r2.dev',
  '',
  '# ─── Upstash Redis (Cache) ────────────────────────────────────────────────',
  'UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io',
  'UPSTASH_REDIS_REST_TOKEN=xxxxxxxx',
  '',
  '# ─── Cron authentication ──────────────────────────────────────────────────',
  'CRON_SECRET=generate-32-char-random-string',
  '',
  '# ─── Metered (Video — optional) ───────────────────────────────────────────',
  'NEXT_PUBLIC_METERED_API_KEY=',
  'METERED_SECRET_KEY=',
  ''
].join('\n'));

// ─── 5. .env.vercel.template ──────────────────────────────────────────────
write('.env.vercel.template', [
  '# ═══════════════════════════════════════════════════════════════════════════',
  '# ZEAL PLATFORM — ENV TEMPLATE',
  '# ═══════════════════════════════════════════════════════════════════════════',
  '# Copy to .env.local and fill in. Never commit the filled version.',
  '# ═══════════════════════════════════════════════════════════════════════════',
  '',
  'NEXT_PUBLIC_SUPABASE_URL=',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
  'SUPABASE_SERVICE_ROLE_KEY=',
  '',
  'DATABASE_URL=',
  'DIRECT_URL=',
  '',
  'NEXT_PUBLIC_APP_URL=',
  'NEXT_PUBLIC_ADMIN_URL=',
  'NEXT_PUBLIC_BASE_DOMAIN=',
  'NEXT_PUBLIC_REALTIME_ENABLED=true',
  '',
  'NEXT_PUBLIC_RAZORPAY_KEY_ID=',
  'RAZORPAY_KEY_SECRET=',
  'RAZORPAY_WEBHOOK_SECRET=',
  '',
  'RESEND_API_KEY=',
  'GROQ_API_KEY=',
  '',
  'R2_ACCOUNT_ID=',
  'R2_ACCESS_KEY_ID=',
  'R2_SECRET_ACCESS_KEY=',
  'R2_BUCKET_NAME=zeal',
  'R2_PUBLIC_URL=',
  '',
  'UPSTASH_REDIS_REST_URL=',
  'UPSTASH_REDIS_REST_TOKEN=',
  '',
  'CRON_SECRET=',
  '',
  'NEXT_PUBLIC_METERED_API_KEY=',
  'METERED_SECRET_KEY=',
  ''
].join('\n'));

// ─── 6. apps/web/tsconfig.json — dedup @/* key ────────────────────────────
const tsPath = 'apps/web/tsconfig.json';
if (fs.existsSync(tsPath)) {
  let s = fs.readFileSync(tsPath, 'utf8');
  const matches = s.match(/"@\/\*"\s*:\s*\[\s*"\.\/\*"\s*\]/g);
  if (matches && matches.length > 1) {
    let first = true;
    s = s.replace(/"@\/\*"\s*:\s*\[\s*"\.\/\*"\s*\]\s*,?/g, (m) => {
      if (first) { first = false; return m.replace(/,$/, ''); }
      return '';
    });
    s = s.replace(/,(\s*[}\]])/g, '$1');
    backup(tsPath);
    fs.writeFileSync(tsPath, s);
    console.log('\x1b[32m[✓]\x1b[0m patched: tsconfig.json (removed ' + (matches.length - 1) + ' duplicate key(s))');
  } else {
    console.log('\x1b[34m[•]\x1b[0m skip: tsconfig.json (already clean)');
  }
}

// ─── 7. .github/workflows/ci.yml — disable deploy-api ─────────────────────
const ciPath = '.github/workflows/ci.yml';
if (fs.existsSync(ciPath)) {
  let s = fs.readFileSync(ciPath, 'utf8');
  if (s.includes('DISABLED — deploy-api')) {
    console.log('\x1b[34m[•]\x1b[0m skip: ci.yml (already patched)');
  } else {
    const out = [];
    let inJob = false;
    for (const line of s.split('\n')) {
      if (/^\s*deploy-api:\s*$/.test(line)) {
        out.push('  # DISABLED — deploy-api (apps/api removed in batch1)');
        inJob = true;
        continue;
      }
      if (inJob && /^  [a-zA-Z_]/.test(line)) inJob = false;
      out.push(inJob ? '  # ' + line : line);
    }
    backup(ciPath);
    fs.writeFileSync(ciPath, out.join('\n'));
    console.log('\x1b[32m[✓]\x1b[0m patched: ci.yml (deploy-api disabled)');
  }
}

// ─── 8. packages/database/prisma/schema.prisma — add datasource url ───────
const prPath = 'packages/database/prisma/schema.prisma';
if (fs.existsSync(prPath)) {
  let s = fs.readFileSync(prPath, 'utf8');
  if (/url\s*=\s*env\("DATABASE_URL"\)/.test(s)) {
    console.log('\x1b[34m[•]\x1b[0m skip: schema.prisma (url already present)');
  } else {
    s = s.replace(/datasource\s+db\s*\{([^}]*)\}/, (m, inner) => {
      if (/url/.test(inner)) return m;
      return 'datasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}';
    });
    backup(prPath);
    fs.writeFileSync(prPath, s);
    console.log('\x1b[32m[✓]\x1b[0m patched: schema.prisma (datasource url added)');
  }
}

console.log('\x1b[32m[✓]\x1b[0m config step complete');
NODE_CONFIG
fi

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 3 — MIGRATIONS + RATE-LIMIT HELPER
# ═══════════════════════════════════════════════════════════════════════════════
section "Step 3 — Creating migrations + rate-limit helper"

if [[ $DRY_RUN -eq 1 ]]; then
  info "[dry] would create 5 migrations + rate-limit helper"
else
  node <<'NODE_MIGRATIONS'
const fs = require('fs');

fs.mkdirSync('supabase/migrations', { recursive: true });

const mig1 = [
  '-- ═══════════════════════════════════════════════════════════════════════════',
  '-- 001 · RECONCILE SCHEMA',
  '-- ═══════════════════════════════════════════════════════════════════════════',
  '-- Fixes enum drift, adds AIConsultant table, white-label columns.',
  '-- Idempotent — safe to run multiple times.',
  '-- ═══════════════════════════════════════════════════════════════════════════',
  '',
  'DO $$ BEGIN',
  "  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ConsultantStatus') THEN",
  '    CREATE TYPE "ConsultantStatus" AS ENUM (\'PENDING\',\'VERIFIED\',\'REJECTED\',\'SUSPENDED\');',
  '  END IF;',
  'END $$;',
  '',
  'DO $$ BEGIN',
  "  BEGIN ALTER TYPE \"ConsultantCategory\" ADD VALUE IF NOT EXISTS 'MOTIVATIONAL_SPEAKER'; EXCEPTION WHEN duplicate_object THEN NULL; END;",
  "  BEGIN ALTER TYPE \"ConsultantCategory\" ADD VALUE IF NOT EXISTS 'SPIRITUAL_GUIDE';      EXCEPTION WHEN duplicate_object THEN NULL; END;",
  "  BEGIN ALTER TYPE \"ConsultantCategory\" ADD VALUE IF NOT EXISTS 'YOGA_INSTRUCTOR';      EXCEPTION WHEN duplicate_object THEN NULL; END;",
  'END $$;',
  '',
  'DO $$ BEGIN',
  "  BEGIN ALTER TYPE \"Role\" ADD VALUE IF NOT EXISTS 'CLIENT_ADMIN'; EXCEPTION WHEN duplicate_object THEN NULL; END;",
  "  BEGIN ALTER TYPE \"Role\" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';  EXCEPTION WHEN duplicate_object THEN NULL; END;",
  "  BEGIN ALTER TYPE \"Role\" ADD VALUE IF NOT EXISTS 'ADMIN';        EXCEPTION WHEN duplicate_object THEN NULL; END;",
  "  BEGIN ALTER TYPE \"Role\" ADD VALUE IF NOT EXISTS 'SUPPORT';      EXCEPTION WHEN duplicate_object THEN NULL; END;",
  "  BEGIN ALTER TYPE \"Role\" ADD VALUE IF NOT EXISTS 'VIEWER';       EXCEPTION WHEN duplicate_object THEN NULL; END;",
  'END $$;',
  '',
  'UPDATE "User" SET role = \'CLIENT_ADMIN\' WHERE role::text = \'HEALER\';',
  'UPDATE "User" SET role = \'SUPER_ADMIN\'  WHERE role::text = \'ADMIN\';',
  '',
  'CREATE TABLE IF NOT EXISTS "AIConsultant" (',
  '  "id" TEXT NOT NULL,',
  '  "name" TEXT NOT NULL,',
  '  "username" TEXT NOT NULL,',
  '  "avatar" TEXT NOT NULL,',
  '  "category" TEXT NOT NULL,',
  '  "isPaid" BOOLEAN NOT NULL DEFAULT false,',
  '  "perMinuteRate" INTEGER NOT NULL DEFAULT 0,',
  '  "rating" DOUBLE PRECISION NOT NULL DEFAULT 4.7,',
  '  "experience" INTEGER NOT NULL DEFAULT 100,',
  '  "totalConsultations" INTEGER NOT NULL DEFAULT 0,',
  '  "sparks" INTEGER NOT NULL DEFAULT 50000,',
  '  "bio" TEXT NOT NULL,',
  '  "specialties" TEXT[],',
  '  "languages" TEXT[],',
  '  "model" TEXT NOT NULL,',
  '  "responseTime" INTEGER NOT NULL DEFAULT 200,',
  '  "accuracy" DOUBLE PRECISION NOT NULL DEFAULT 0.95,',
  '  "isActive" BOOLEAN NOT NULL DEFAULT true,',
  '  "gender" TEXT DEFAULT \'neutral\',',
  '  "persona" TEXT,',
  '  "voiceStyle" TEXT,',
  '  "isFeatured" BOOLEAN NOT NULL DEFAULT false,',
  '  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,',
  '  "updatedAt" TIMESTAMP(3) NOT NULL,',
  '  CONSTRAINT "AIConsultant_pkey" PRIMARY KEY ("id")',
  ');',
  'CREATE UNIQUE INDEX IF NOT EXISTS "AIConsultant_username_key" ON "AIConsultant"("username");',
  'CREATE INDEX IF NOT EXISTS "AIConsultant_isActive_idx" ON "AIConsultant"("isActive","category");',
  '',
  'ALTER TABLE "Consultant" ADD COLUMN IF NOT EXISTS "status"            "ConsultantStatus" NOT NULL DEFAULT \'PENDING\';',
  'ALTER TABLE "Consultant" ADD COLUMN IF NOT EXISTS "verificationDocs"  JSONB;',
  'ALTER TABLE "Consultant" ADD COLUMN IF NOT EXISTS "rejectionReason"   TEXT;',
  'ALTER TABLE "Consultant" ADD COLUMN IF NOT EXISTS "approvedBy"        TEXT;',
  'ALTER TABLE "Consultant" ADD COLUMN IF NOT EXISTS "approvedAt"        TIMESTAMP(3);',
  'ALTER TABLE "Consultant" ADD COLUMN IF NOT EXISTS "subdomain"         TEXT;',
  'ALTER TABLE "Consultant" ADD COLUMN IF NOT EXISTS "subdomainActive"   BOOLEAN NOT NULL DEFAULT false;',
  'ALTER TABLE "Consultant" ADD COLUMN IF NOT EXISTS "whiteLabelEnabled" BOOLEAN NOT NULL DEFAULT false;',
  'ALTER TABLE "Consultant" ADD COLUMN IF NOT EXISTS "theme"             JSONB;',
  'ALTER TABLE "Consultant" ADD COLUMN IF NOT EXISTS "chatRate"          DOUBLE PRECISION DEFAULT 50;',
  'ALTER TABLE "Consultant" ADD COLUMN IF NOT EXISTS "audioRate"         DOUBLE PRECISION DEFAULT 75;',
  'ALTER TABLE "Consultant" ADD COLUMN IF NOT EXISTS "videoRate"         DOUBLE PRECISION DEFAULT 100;',
  'ALTER TABLE "Consultant" ADD COLUMN IF NOT EXISTS "physicalRate"      DOUBLE PRECISION DEFAULT 150;',
  'ALTER TABLE "Consultant" ADD COLUMN IF NOT EXISTS "bufferMinutes"     INTEGER NOT NULL DEFAULT 10;',
  'CREATE UNIQUE INDEX IF NOT EXISTS "Consultant_subdomain_key" ON "Consultant"("subdomain") WHERE "subdomain" IS NOT NULL;',
  '',
  'ALTER TABLE "CallSession" ALTER COLUMN "consultantId" DROP NOT NULL;',
  ''
].join('\n');

const mig2 = [
  '-- ═══════════════════════════════════════════════════════════════════════════',
  '-- 002 · ADMIN RBAC',
  '-- ═══════════════════════════════════════════════════════════════════════════',
  '',
  'CREATE TABLE IF NOT EXISTS "AdminAuditLog" (',
  '  id TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,',
  '  "userId" TEXT,',
  '  "email" TEXT,',
  '  action TEXT NOT NULL,',
  '  "targetType" TEXT,',
  '  "targetId" TEXT,',
  '  metadata JSONB,',
  '  ip TEXT,',
  '  "userAgent" TEXT,',
  '  success BOOLEAN NOT NULL DEFAULT true,',
  '  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()',
  ');',
  'CREATE INDEX IF NOT EXISTS "AdminAuditLog_createdAt_idx" ON "AdminAuditLog"("createdAt" DESC);',
  'CREATE INDEX IF NOT EXISTS "AdminAuditLog_userId_idx" ON "AdminAuditLog"("userId");',
  '',
  'CREATE TABLE IF NOT EXISTS "AdminInvite" (',
  '  id TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,',
  '  email TEXT NOT NULL,',
  '  role "Role" NOT NULL DEFAULT \'VIEWER\',',
  '  "tokenHash" TEXT NOT NULL UNIQUE,',
  '  "invitedBy" TEXT NOT NULL,',
  '  "expiresAt" TIMESTAMPTZ NOT NULL,',
  '  "acceptedAt" TIMESTAMPTZ,',
  '  "revokedAt" TIMESTAMPTZ,',
  '  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()',
  ');',
  'CREATE INDEX IF NOT EXISTS "AdminInvite_email_idx" ON "AdminInvite"(email);',
  '',
  'CREATE TABLE IF NOT EXISTS "AdminLoginAttempt" (',
  '  id TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,',
  '  email TEXT NOT NULL,',
  '  ip TEXT,',
  '  success BOOLEAN NOT NULL,',
  '  reason TEXT,',
  '  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()',
  ');',
  'CREATE INDEX IF NOT EXISTS "AdminLoginAttempt_email_created_idx" ON "AdminLoginAttempt"(email,"createdAt" DESC);',
  '',
  'ALTER TABLE "AdminAuditLog" ENABLE ROW LEVEL SECURITY;',
  'ALTER TABLE "AdminInvite" ENABLE ROW LEVEL SECURITY;',
  'ALTER TABLE "AdminLoginAttempt" ENABLE ROW LEVEL SECURITY;',
  '',
  'GRANT ALL ON "AdminAuditLog" TO service_role;',
  'GRANT ALL ON "AdminInvite" TO service_role;',
  'GRANT ALL ON "AdminLoginAttempt" TO service_role;',
  '',
  'CREATE OR REPLACE FUNCTION public.cleanup_admin_logs()',
  'RETURNS void LANGUAGE plpgsql AS $$',
  'BEGIN',
  '  DELETE FROM "AdminAuditLog" WHERE "createdAt" < NOW() - INTERVAL \'90 days\';',
  '  DELETE FROM "AdminLoginAttempt" WHERE "createdAt" < NOW() - INTERVAL \'90 days\';',
  '  DELETE FROM "AdminInvite" WHERE "expiresAt" < NOW() - INTERVAL \'90 days\' AND "acceptedAt" IS NULL;',
  'END;',
  '$$;',
  ''
].join('\n');

const mig3 = [
  '-- ═══════════════════════════════════════════════════════════════════════════',
  '-- 003 · CHAT',
  '-- ═══════════════════════════════════════════════════════════════════════════',
  '',
  'CREATE TABLE IF NOT EXISTS "Conversation" (',
  '  id TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,',
  '  "userAId" TEXT NOT NULL,',
  '  "userBId" TEXT NOT NULL,',
  '  "lastMessageAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),',
  '  "lastMessageText" TEXT,',
  '  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),',
  '  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),',
  '  UNIQUE("userAId","userBId")',
  ');',
  'CREATE INDEX IF NOT EXISTS "Conversation_userA_idx" ON "Conversation"("userAId","lastMessageAt" DESC);',
  'CREATE INDEX IF NOT EXISTS "Conversation_userB_idx" ON "Conversation"("userBId","lastMessageAt" DESC);',
  '',
  'CREATE TABLE IF NOT EXISTS "ChatMessage" (',
  '  id TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,',
  '  "conversationId" TEXT NOT NULL REFERENCES "Conversation"(id) ON DELETE CASCADE,',
  '  "senderId" TEXT NOT NULL,',
  '  content TEXT NOT NULL,',
  '  "readAt" TIMESTAMPTZ,',
  '  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()',
  ');',
  'CREATE INDEX IF NOT EXISTS "ChatMessage_conv_created_idx" ON "ChatMessage"("conversationId","createdAt" DESC);',
  ''
].join('\n');

const mig4 = [
  '-- ═══════════════════════════════════════════════════════════════════════════',
  '-- 004 · REALTIME PUBLICATION',
  '-- ═══════════════════════════════════════════════════════════════════════════',
  '',
  'DO $$',
  'DECLARE tbl TEXT;',
  'DECLARE tables_to_publish TEXT[] := ARRAY[',
  "  'AIConsultant','Consultant','Booking','CallSession',",
  "  'Wallet','Transaction','Notification','Post',",
  "  'ChatMessage','Conversation'",
  '];',
  'BEGIN',
  '  FOREACH tbl IN ARRAY tables_to_publish LOOP',
  '    IF NOT EXISTS (',
  '      SELECT 1 FROM pg_publication_tables',
  "      WHERE pubname = 'supabase_realtime' AND tablename = tbl",
  '    ) THEN',
  "      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', tbl);",
  '    END IF;',
  "    EXECUTE format('ALTER TABLE %I REPLICA IDENTITY FULL', tbl);",
  '  END LOOP;',
  'END $$;',
  ''
].join('\n');

const mig5 = [
  '-- ═══════════════════════════════════════════════════════════════════════════',
  '-- 005 · RLS POLICIES',
  '-- ═══════════════════════════════════════════════════════════════════════════',
  '',
  'ALTER TABLE "AIConsultant" ENABLE ROW LEVEL SECURITY;',
  'DROP POLICY IF EXISTS "public_read_ai_consultants" ON "AIConsultant";',
  'CREATE POLICY "public_read_ai_consultants" ON "AIConsultant"',
  '  FOR SELECT USING ("isActive" = true);',
  'GRANT SELECT ON "AIConsultant" TO anon;',
  'GRANT SELECT ON "AIConsultant" TO authenticated;',
  '',
  'ALTER TABLE "Consultant" ENABLE ROW LEVEL SECURITY;',
  'DROP POLICY IF EXISTS "public_read_verified_consultants" ON "Consultant";',
  'CREATE POLICY "public_read_verified_consultants" ON "Consultant"',
  "  FOR SELECT USING (status = 'VERIFIED' AND \"isActive\" = true);",
  'GRANT SELECT ON "Consultant" TO anon;',
  'GRANT SELECT ON "Consultant" TO authenticated;',
  '',
  'ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;',
  'DROP POLICY IF EXISTS "users_read_own_notifications" ON "Notification";',
  'CREATE POLICY "users_read_own_notifications" ON "Notification"',
  '  FOR SELECT USING (auth.uid()::text = "userId");',
  'DROP POLICY IF EXISTS "users_update_own_notifications" ON "Notification";',
  'CREATE POLICY "users_update_own_notifications" ON "Notification"',
  '  FOR UPDATE USING (auth.uid()::text = "userId");',
  '',
  'ALTER TABLE "ChatMessage" ENABLE ROW LEVEL SECURITY;',
  'DROP POLICY IF EXISTS "participants_read_messages" ON "ChatMessage";',
  'CREATE POLICY "participants_read_messages" ON "ChatMessage"',
  '  FOR SELECT USING (',
  '    EXISTS (',
  '      SELECT 1 FROM "Conversation" c',
  '      WHERE c.id = "ChatMessage"."conversationId"',
  '        AND (c."userAId" = auth.uid()::text OR c."userBId" = auth.uid()::text)',
  '    )',
  '  );',
  'DROP POLICY IF EXISTS "sender_insert_messages" ON "ChatMessage";',
  'CREATE POLICY "sender_insert_messages" ON "ChatMessage"',
  '  FOR INSERT WITH CHECK (auth.uid()::text = "senderId");',
  '',
  'ALTER TABLE "Conversation" ENABLE ROW LEVEL SECURITY;',
  'DROP POLICY IF EXISTS "participants_read_conversations" ON "Conversation";',
  'CREATE POLICY "participants_read_conversations" ON "Conversation"',
  '  FOR SELECT USING ("userAId" = auth.uid()::text OR "userBId" = auth.uid()::text);',
  ''
].join('\n');

fs.writeFileSync('supabase/migrations/001_reconcile_schema.sql', mig1);
fs.writeFileSync('supabase/migrations/002_admin_rbac.sql', mig2);
fs.writeFileSync('supabase/migrations/003_chat.sql', mig3);
fs.writeFileSync('supabase/migrations/004_realtime_publication.sql', mig4);
fs.writeFileSync('supabase/migrations/005_rls_policies.sql', mig5);

const rateLimit = [
  'import { NextResponse } from "next/server";',
  'import { rateLimit } from "@/lib/security";',
  '',
  '/**',
  ' * Enforce a sliding-window rate limit. Returns null on success, a 429',
  ' * NextResponse on failure — caller should return it directly.',
  ' *',
  ' *   const limited = await enforceRateLimit(`topup:${userId}`, 5, 60);',
  ' *   if (limited) return limited;',
  ' */',
  'export async function enforceRateLimit(',
  '  key: string,',
  '  limit: number,',
  '  windowSeconds: number,',
  '): Promise<NextResponse | null> {',
  '  const { success, remaining, reset } = await rateLimit(key, limit, windowSeconds);',
  '  if (success) return null;',
  '  return NextResponse.json(',
  '    { error: "Too many requests", code: "RATE_LIMIT" },',
  '    {',
  '      status: 429,',
  '      headers: {',
  '        "X-RateLimit-Limit": String(limit),',
  '        "X-RateLimit-Remaining": String(remaining),',
  '        "X-RateLimit-Reset": String(reset),',
  '        "Retry-After": String(Math.max(1, Math.ceil((reset - Date.now()) / 1000))),',
  '      },',
  '    },',
  '  );',
  '}',
  ''
].join('\n');

fs.mkdirSync('apps/web/lib/rate-limit', { recursive: true });
fs.writeFileSync('apps/web/lib/rate-limit/index.ts', rateLimit);

console.log('\x1b[32m[✓]\x1b[0m wrote: supabase/migrations/001_reconcile_schema.sql');
console.log('\x1b[32m[✓]\x1b[0m wrote: supabase/migrations/002_admin_rbac.sql');
console.log('\x1b[32m[✓]\x1b[0m wrote: supabase/migrations/003_chat.sql');
console.log('\x1b[32m[✓]\x1b[0m wrote: supabase/migrations/004_realtime_publication.sql');
console.log('\x1b[32m[✓]\x1b[0m wrote: supabase/migrations/005_rls_policies.sql');
console.log('\x1b[32m[✓]\x1b[0m wrote: apps/web/lib/rate-limit/index.ts');
NODE_MIGRATIONS
fi

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 4 — VERIFY
# ═══════════════════════════════════════════════════════════════════════════════
section "Step 4 — Verifying"

if [[ $DRY_RUN -eq 1 ]]; then
  info "[dry] skipping verification"
else
  node <<'NODE_VERIFY'
const fs = require('fs');
const checks = [];
const exists = (p) => fs.existsSync(p);
const has    = (p, n) => exists(p) && fs.readFileSync(p, 'utf8').includes(n);

// Deletions
checks.push(['backups/ deleted',              !exists('backups')]);
checks.push(['packages/shared/ deleted',      !exists('packages/shared')]);
checks.push(['apps/api/ deleted',             !exists('apps/api')]);
checks.push(['docker-compose.yml deleted',    !exists('docker-compose.yml')]);
checks.push(['websocket-client dup gone',     !exists('apps/web/lib/websocket-client.ts')]);
checks.push(['wallet/razorpay dup gone',      !exists('apps/web/lib/wallet/razorpay.ts')]);
checks.push(['monitoring/logger gone',        !exists('apps/web/lib/monitoring/logger.ts')]);
checks.push(['realtime/adapter gone',         !exists('apps/web/lib/realtime/adapter.ts')]);
checks.push(['indexeddb gone',                !exists('apps/web/lib/db/indexeddb.ts')]);
checks.push(['ui/Motion.tsx gone',            !exists('apps/web/components/ui/Motion.tsx')]);

// Config
checks.push(['.gitignore has .backups/',      has('.gitignore', '.backups/')]);
checks.push(['.npmrc has save-exact',         has('.npmrc', 'save-exact=true')]);
checks.push(['.npmrc has legacy-peer-deps',   has('.npmrc', 'legacy-peer-deps=true')]);
checks.push(['vercel.json has crons',         has('vercel.json', 'crons')]);
checks.push(['vercel.json has bom1',          has('vercel.json', 'bom1')]);
checks.push(['.env.vercel.required exists',   exists('.env.vercel.required')]);
checks.push(['.env.vercel.template exists',   exists('.env.vercel.template')]);
checks.push(['prisma has datasource url',     /url\s*=\s*env\("DATABASE_URL"\)/.test(fs.readFileSync('packages/database/prisma/schema.prisma','utf8'))]);
checks.push(['ci.yml deploy-api disabled',    has('.github/workflows/ci.yml', 'DISABLED')]);
checks.push(['rate-limit helper exists',      exists('apps/web/lib/rate-limit/index.ts')]);

// Migrations
checks.push(['migration 001',                 exists('supabase/migrations/001_reconcile_schema.sql')]);
checks.push(['migration 002',                 exists('supabase/migrations/002_admin_rbac.sql')]);
checks.push(['migration 003',                 exists('supabase/migrations/003_chat.sql')]);
checks.push(['migration 004',                 exists('supabase/migrations/004_realtime_publication.sql')]);
checks.push(['migration 005',                 exists('supabase/migrations/005_rls_policies.sql')]);

let pass = 0, fail = 0;
for (const [label, ok] of checks) {
  if (ok) { console.log('  \x1b[32m[✓]\x1b[0m ' + label); pass++; }
  else    { console.log('  \x1b[31m[✗]\x1b[0m ' + label); fail++; }
}
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
NODE_VERIFY
fi

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 5 — INSTALL + BUILD
# ═══════════════════════════════════════════════════════════════════════════════
if [[ $DRY_RUN -eq 0 ]] && [[ $SKIP_INSTALL -eq 0 ]]; then
  section "Step 5 — Installing dependencies"
  if npm install --legacy-peer-deps 2>&1 | tail -20; then
    ok "install complete"
  else
    warn "install reported issues — check output above"
  fi
else
  info "skipping install"
fi

if [[ $DRY_RUN -eq 0 ]] && [[ $SKIP_BUILD -eq 0 ]]; then
  section "Step 6 — Building workspaces"
  info "Type-checking admin…"
  if npm run type-check --workspace=admin 2>&1 | tail -10; then
    ok "admin type-check"
  else
    warn "admin type-check reported errors"
  fi
  info "Building admin…"
  if npm run build --workspace=admin 2>&1 | tail -20; then
    ok "admin build"
  else
    warn "admin build failed — likely due to remaining Batch 2 issues"
  fi
else
  info "skipping build"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════════════════════
section "Batch 1 Complete"

cat <<EOF

${BOLD}What changed:${NC}
  · Deleted ${#DEAD_PATHS[@]} dead paths + empty .tsx placeholders
  · Rewrote .gitignore, .npmrc, vercel.json, env templates
  · Patched tsconfig.json, ci.yml, schema.prisma
  · Created 5 migrations + rate-limit helper
  · Backup: ${BACKUP_DIR}

${BOLD}Next steps:${NC}

  1. Apply migrations in Supabase SQL Editor (in this order):
       supabase/migrations/001_reconcile_schema.sql
       supabase/migrations/002_admin_rbac.sql
       supabase/migrations/003_chat.sql
       supabase/migrations/004_realtime_publication.sql
       supabase/migrations/005_rls_policies.sql

  2. Confirm the DB is healthy:
       npx prisma migrate status

  3. Continue with Batch 2 (backend APIs)

${BOLD}Rollback:${NC}
  cp -r ${BACKUP_DIR}/. ${PROJECT_ROOT}/

EOF

ok "Batch 1 finished"