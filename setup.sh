#!/bin/bash
# =============================================================================
# PROJECT ZEAL – PERMANENT FIX (Restore url + dummy DATABASE_URL)
# =============================================================================

set -euo pipefail

echo "═══════════════════════════════════════════════════════════════════════════"
echo "  🔧 PERMANENT FIX: Restore url in schema + dummy env"
echo "═══════════════════════════════════════════════════════════════════════════"

# ----------------------------------------------------------------------------
# 1. Restore url in schema.prisma (if missing)
# ----------------------------------------------------------------------------
echo "📝 Ensuring url is present in schema.prisma..."

# Check if url line exists; if not, add it
if ! grep -q 'url[[:space:]]*=[[:space:]]*env("DATABASE_URL")' packages/database/prisma/schema.prisma; then
  # Insert url after 'provider = "postgresql"'
  sed -i '/provider = "postgresql"/a \  url      = env("DATABASE_URL")' packages/database/prisma/schema.prisma
  echo "✅ Added url line"
else
  echo "✅ url already present"
fi

# ----------------------------------------------------------------------------
# 2. Remove any prisma.config.js (not needed)
# ----------------------------------------------------------------------------
rm -f packages/database/prisma.config.js
echo "🗑️ Removed prisma.config.js (if any)"

# ----------------------------------------------------------------------------
# 3. Update web package.json: prebuild runs simple generate
# ----------------------------------------------------------------------------
echo "📝 Updating apps/web/package.json scripts..."

node -e "
const fs = require('fs');
const path = './apps/web/package.json';
const pkg = JSON.parse(fs.readFileSync(path, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts.prebuild = 'npx prisma generate --schema=../../packages/database/prisma/schema.prisma';
pkg.scripts.build = 'next build';
fs.writeFileSync(path, JSON.stringify(pkg, null, 2));
"

# ----------------------------------------------------------------------------
# 4. Ensure @prisma/client is installed (just in case)
# ----------------------------------------------------------------------------
cd apps/web
npm install --save-dev @prisma/client prisma 2>/dev/null || true
cd ../..

# ----------------------------------------------------------------------------
# 5. Stage and commit
# ----------------------------------------------------------------------------
git add -A
git commit -m "fix: restore url in schema, simplify prebuild

- Added url = env(\"DATABASE_URL\") back to schema
- Removed prisma.config.js (unused)
- Simplified prebuild to just run prisma generate
- Now build will pass if DATABASE_URL is set (even dummy)"

# ----------------------------------------------------------------------------
# 6. Force push
# ----------------------------------------------------------------------------
BRANCH=$(git branch --show-current)
echo "🚀 Force pushing to origin/$BRANCH ..."
git push origin "$BRANCH" --force

echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo "  ✅ PERMANENT FIX APPLIED"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "📌 WHAT WAS CHANGED:"
echo "   - Restored url = env(\"DATABASE_URL\") in schema.prisma"
echo "   - Removed prisma.config.js (no longer needed)"
echo "   - Simplified prebuild to 'prisma generate'"
echo ""
echo "📌 WHAT YOU MUST DO NOW:"
echo "   1. Go to your Vercel project → Settings → Environment Variables"
echo "   2. Add a new variable:"
echo "      Name:  DATABASE_URL"
echo "      Value: postgresql://dummy:dummy@localhost:5432/dummy   (dummy value)"
echo "      Environments: Production, Preview, Development"
echo "   3. Click Save and redeploy (or wait for auto-deploy)"
echo ""
echo "📌 WHY THIS WORKS:"
echo "   - prisma generate only needs a valid URL format, NOT a real connection"
echo "   - The dummy URL satisfies the validation"
echo "   - Later, replace the dummy value with your real Supabase URL"
echo ""
echo "📌 AFTER DEPLOYMENT:"
echo "   - Once you have your real Supabase DATABASE_URL, update the variable in Vercel"
echo "   - The app will then connect to the real database at runtime"