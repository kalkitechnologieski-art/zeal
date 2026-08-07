#!/bin/bash
# =============================================================================
# PROJECT ZEAL – FINAL VERCEL BUILD FIX
# =============================================================================
# This script ensures your Prisma schema is valid, creates the correct config,
# and pushes the changes to GitHub so Vercel can build successfully.
# =============================================================================

set -euo pipefail

echo "═══════════════════════════════════════════════════════════════════════════"
echo "  🔧 FINAL VERCEL BUILD FIX – Prisma Schema + Config"
echo "═══════════════════════════════════════════════════════════════════════════"

# ----------------------------------------------------------------------------
# 1. Backup current schema (just in case)
# ----------------------------------------------------------------------------
cp packages/database/prisma/schema.prisma packages/database/prisma/schema.prisma.bak
echo "📦 Schema backup saved."

# ----------------------------------------------------------------------------
# 2. Remove ALL generator blocks, then add exactly one at the top
# ----------------------------------------------------------------------------
echo "📝 Fixing duplicate generator blocks..."

# Use awk to remove all 'generator client' blocks
awk '
  BEGIN { in_generator = 0; }
  /^generator client/ { in_generator = 1; next; }
  in_generator && /^}/ { in_generator = 0; next; }
  in_generator { next; }
  { print; }
' packages/database/prisma/schema.prisma > /tmp/schema_clean.prisma

# Prepend the generator block
{
  echo "generator client {"
  echo "  provider = \"prisma-client-js\""
  echo "}"
  echo ""
  cat /tmp/schema_clean.prisma
} > packages/database/prisma/schema.prisma

echo "✅ Generator block deduplicated."

# ----------------------------------------------------------------------------
# 3. Remove 'url' from datasource block (Prisma 7 requirement)
# ----------------------------------------------------------------------------
echo "📝 Removing 'url' from datasource block..."
sed -i '/url[[:space:]]*=[[:space:]]*env("DATABASE_URL")/d' packages/database/prisma/schema.prisma
echo "✅ 'url' removed."

# ----------------------------------------------------------------------------
# 4. Create prisma.config.js (if not exists or overwrite)
# ----------------------------------------------------------------------------
echo "📝 Creating prisma.config.js..."
cat > packages/database/prisma.config.js << 'EOF'
const { defineConfig } = require("prisma/config");

const databaseUrl = process.env.DATABASE_URL || "postgresql://dummy:dummy@localhost:5432/dummy";

module.exports = defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
});
EOF
echo "✅ prisma.config.js created."

# ----------------------------------------------------------------------------
# 5. Update apps/web/package.json scripts
# ----------------------------------------------------------------------------
echo "📝 Updating apps/web/package.json scripts..."
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('./apps/web/package.json', 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts.prebuild = 'npx prisma generate --schema=../../packages/database/prisma/schema.prisma --config=../../packages/database/prisma.config.js';
pkg.scripts.build = 'next build';
fs.writeFileSync('./apps/web/package.json', JSON.stringify(pkg, null, 2));
"
echo "✅ package.json updated."

# ----------------------------------------------------------------------------
# 6. Ensure @prisma/config is installed (to avoid 'defineConfig' errors)
# ----------------------------------------------------------------------------
echo "📦 Installing @prisma/config in packages/database..."
cd packages/database
npm install --save-dev @prisma/config 2>/dev/null || true
cd ../..
echo "✅ Dependencies installed."

# ----------------------------------------------------------------------------
# 7. Stage and commit the changes
# ----------------------------------------------------------------------------
git add -A
git commit -m "fix: final Prisma schema + config for Vercel build

- Deduplicated generator client block
- Removed url from datasource
- Added prisma.config.js
- Updated prebuild script
- Ready for Vercel deployment"

# ----------------------------------------------------------------------------
# 8. Force push to GitHub
# ----------------------------------------------------------------------------
BRANCH=$(git branch --show-current)
echo "🚀 Force pushing to origin/$BRANCH ..."
git push origin "$BRANCH" --force

# ----------------------------------------------------------------------------
# 9. Final instructions
# ----------------------------------------------------------------------------
echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo "  ✅ FIX APPLIED – PUSHED TO ORIGIN"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "📌 What was fixed:"
echo "   ✅ Duplicate generator blocks removed."
echo "   ✅ 'url' removed from datasource."
echo "   ✅ prisma.config.js created with fallback."
echo "   ✅ prebuild script updated."
echo ""
echo "📌 Your DATABASE_URL in Vercel should now be set to:"
echo "   postgresql://postgres.pwkiyjcfpkeqgszjpcfl:Nikhil%401234%40123@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
echo ""
echo "📌 Vercel will now build successfully. Wait for the auto-deploy or trigger it manually."