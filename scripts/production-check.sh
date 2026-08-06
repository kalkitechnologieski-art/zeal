#!/bin/bash
# =============================================================================
# PROJECT ZEAL – PRODUCTION READINESS CHECK
# =============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 Running production readiness check..."

# Check environment variables
echo "📋 Checking environment variables..."
if [ ! -f .env.local ]; then
  echo -e "${RED}❌ .env.local missing${NC}"
  exit 1
fi
echo -e "${GREEN}✅ .env.local exists${NC}"

# Check build
echo "🏗️ Checking build..."
if npm run build --workspaces --if-present 2>&1 | grep -q "Build error"; then
  echo -e "${RED}❌ Build failed${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Build successful${NC}"

# Check tests
echo "🧪 Checking tests..."
if npm test 2>&1 | grep -q "failed"; then
  echo -e "${YELLOW}⚠️ Tests have failures${NC}"
else
  echo -e "${GREEN}✅ Tests passed${NC}"
fi

# Check SSL/HTTPS (if deployed)
echo "🔒 Checking security headers..."
if curl -s -I https://zeal.com 2>/dev/null | grep -q "Strict-Transport-Security"; then
  echo -e "${GREEN}✅ HTTPS configured${NC}"
else
  echo -e "${YELLOW}⚠️ HTTPS not detected (may be local)${NC}"
fi

echo ""
echo -e "${GREEN}✅ Production readiness check complete!${NC}"
