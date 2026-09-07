#!/usr/bin/env bash
# =============================================================================
# PROJECT ZEAL – FIX VERCEL DEPLOYMENT (DEXIE MISSING)
# =============================================================================
# This script adds dexie as a dependency and ensures Vercel deployment passes.
#
# Usage: ./fix-vercel-deploy.sh
# =============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info()  { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success(){ echo -e "${GREEN}[✓]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }

# -----------------------------------------------------------------------------
# 1. Add dexie to dependencies
# -----------------------------------------------------------------------------
log_info "Adding dexie to web workspace dependencies..."

# Move to the web workspace and install dexie as a production dependency
(cd apps/web && npm install dexie --save)

log_success "dexie added to dependencies"

# -----------------------------------------------------------------------------
# 2. Verify dexie is now listed in package.json
# -----------------------------------------------------------------------------
if grep -q '"dexie"' apps/web/package.json; then
    log_success "dexie is now in package.json dependencies"
else
    log_error "dexie not found in package.json – manual intervention needed"
fi

# -----------------------------------------------------------------------------
# 3. Run a fresh build to confirm fix
# -----------------------------------------------------------------------------
log_info "Running a test build to confirm the fix..."

if npm run build --workspace=web; then
    log_success "Build passed – deployment should now work on Vercel"
else
    log_error "Build still failing – check for other issues"
fi

# -----------------------------------------------------------------------------
# 4. Final message
# -----------------------------------------------------------------------------
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Fix applied. Commit and push to deploy.${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Run the following commands to deploy:"
echo "  git add apps/web/package.json package-lock.json"
echo "  git commit -m 'fix: add dexie for IndexedDB offline caching'"
echo "  git push origin master"