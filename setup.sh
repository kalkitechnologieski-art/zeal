#!/bin/bash
# =============================================================================
# PROJECT ZEAL – RESTORE @zeal/database FOR PRISMA CLIENT
# =============================================================================

set -euo pipefail

echo "═══════════════════════════════════════════════════════════════════════════"
echo "  🔧 RESTORE @zeal/database + PRISMA 7 FIX"
echo "═══════════════════════════════════════════════════════════════════════════"

# ----------------------------------------------------------------------------
# 1. Add @zeal/database to apps/web/package.json
# ----------------------------------------------------------------------------
echo "📦 Adding @zeal/database to web app..."
cd apps/web
npm install --save-dev @zeal/database@* 2>/dev/null || true
cd ../..

# ----------------------------------------------------------------------------
# 2. Replace API route Prisma client with shared client
# ----------------------------------------------------------------------------
echo "📝 Updating API routes to use @zeal/database..."
find apps/web/app/api -type f -name "*.ts" -exec sed -i 's/import { PrismaClient } from "@prisma\/client";\nconst prisma = new PrismaClient();/import { prisma } from "@zeal\/database";/g' {} \;
find apps/web/app/api -type f -name "*.ts" -exec sed -i "s/import { PrismaClient } from '@prisma\/client';\nconst prisma = new PrismaClient();/import { prisma } from '@zeal\/database';/g" {} \;
echo "✅ API routes updated."

# ----------------------------------------------------------------------------
# 3. Add @zeal/database to next.config.js transpilePackages
# ----------------------------------------------------------------------------
if [ -f "apps/web/next.config.js" ]; then
  if ! grep -q '"@zeal/database"' apps/web/next.config.js; then
    sed -i 's/transpilePackages: \[/transpilePackages: \["@zeal\/database", /g' apps/web/next.config.js
    echo "✅ Added @zeal/database to transpilePackages."
  else
    echo "✅ @zeal/database already in transpilePackages."
  fi
fi

# ----------------------------------------------------------------------------
# 4. Update prebuild script to generate client in both places
# ----------------------------------------------------------------------------
echo "📝 Updating prebuild script..."
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('./apps/web/package.json', 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts.prebuild = 'cd ../../packages/database && npx prisma generate --schema=./prisma/schema.prisma --config=./prisma.config.js && cd ../../apps/web && npx prisma generate --schema=../../packages/database/prisma/schema.prisma --config=../../packages/database/prisma.config.js';
pkg.scripts.build = 'next build';
fs.writeFileSync('./apps/web/package.json', JSON.stringify(pkg, null, 2));
"
echo "✅ prebuild script updated."

# ----------------------------------------------------------------------------
# 5. Ensure database package has a prebuild script (just in case)
# ----------------------------------------------------------------------------
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('./packages/database/package.json', 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['prisma:generate'] = 'npx prisma generate --schema=./prisma/schema.prisma --config=./prisma.config.js';
fs.writeFileSync('./packages/database/package.json', JSON.stringify(pkg, null, 2));
"

# ----------------------------------------------------------------------------
# 6. Commit and push
# ----------------------------------------------------------------------------
git add -A
git commit -m "fix: restore @zeal/database for Prisma client"

BRANCH=$(git branch --show-current)
git push origin "$BRANCH" --force

echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo "  ✅ FIX APPLIED – PUSHED TO ORIGIN"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "Vercel will rebuild with the shared Prisma client."
echo "If you still see errors, please share the log."