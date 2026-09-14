#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# ZEAL — ROLLBACK PRISMA MIGRATION
# Restores state captured before migrate-to-supabase.sh ran.
# Backup: /d/zeal/.migration/backup-20260914-144552
# ═══════════════════════════════════════════════════════════════════════════════
set -uo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd -P)"
BACKUP="/d/zeal/.migration/backup-20260914-144552"

if [[ ! -d "$BACKUP" ]]; then
  echo "Backup not found: $BACKUP" >&2
  exit 1
fi

cd "$ROOT" || exit 1

echo "Restoring from $BACKUP ..."

if [[ -d "$BACKUP/packages-database" ]]; then
  rm -rf packages/database
  cp -R "$BACKUP/packages-database" packages/database
  echo "  ✓ restored packages/database"
fi

[[ -f "$BACKUP/root-package.json"  ]] && cp -f "$BACKUP/root-package.json"  package.json
[[ -f "$BACKUP/web-package.json"   ]] && cp -f "$BACKUP/web-package.json"   apps/web/package.json
[[ -f "$BACKUP/admin-package.json" ]] && cp -f "$BACKUP/admin-package.json" apps/admin/package.json
[[ -f "$BACKUP/prisma.config.ts"   ]] && cp -f "$BACKUP/prisma.config.ts"   prisma.config.ts

if [[ -d "$BACKUP/supabase" ]]; then
  rm -rf supabase
  cp -R "$BACKUP/supabase" supabase
  echo "  ✓ restored supabase/"
fi

echo
echo "Rollback complete. Run: npm install"
