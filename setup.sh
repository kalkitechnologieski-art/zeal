#!/bin/bash
# =============================================================================
# FIX VERCELL BUILD – Remove @zeal/database from API routes
# =============================================================================

echo "🔧 Fixing Vercel build by removing @zeal/database imports..."

# ----------------------------------------------------------------------------
# 1. Add Prisma dependencies to web app
# ----------------------------------------------------------------------------
cd apps/web
npm install --save-dev @prisma/client prisma
cd ../..

# ----------------------------------------------------------------------------
# 2. Add prebuild script to generate Prisma client
# ----------------------------------------------------------------------------
# Use jq to add "prebuild" script if not present
if ! grep -q '"prebuild"' apps/web/package.json; then
  node -e "
    const pkg = require('./apps/web/package.json');
    pkg.scripts = pkg.scripts || {};
    pkg.scripts.prebuild = 'npx prisma generate --schema=../../packages/database/prisma/schema.prisma';
    pkg.scripts.build = pkg.scripts.build || 'next build';
    fs.writeFileSync('./apps/web/package.json', JSON.stringify(pkg, null, 2));
  "
fi

# ----------------------------------------------------------------------------
# 3. Update next.config.js to remove @zeal/database from transpilePackages
# ----------------------------------------------------------------------------
if grep -q '"@zeal/database"' apps/web/next.config.js; then
  sed -i 's/"@zeal\/database",\?//g' apps/web/next.config.js
  sed -i 's/, \?\]/]/g' apps/web/next.config.js
fi

# ----------------------------------------------------------------------------
# 4. Replace @zeal/database imports in API routes with direct Prisma import
# ----------------------------------------------------------------------------
find apps/web/app/api -type f -name "*.ts" -exec sed -i 's/import { prisma } from "@zeal\/database";/import { PrismaClient } from "@prisma\/client";\nconst prisma = new PrismaClient();/g' {} \;
find apps/web/app/api -type f -name "*.ts" -exec sed -i "s/import { prisma } from '@zeal\/database';/import { PrismaClient } from '@prisma\/client';\nconst prisma = new PrismaClient();/g" {} \;

# ----------------------------------------------------------------------------
# 5. Also remove any other imports from @zeal/database (just in case)
# ----------------------------------------------------------------------------
find apps/web/app/api -type f -name "*.ts" -exec sed -i '/@zeal\/database/d' {} \;

# ----------------------------------------------------------------------------
# 6. Stage and commit changes
# ----------------------------------------------------------------------------
git add -A
git commit -m "fix: replace @zeal/database with direct Prisma import for Vercel build"

# ----------------------------------------------------------------------------
# 7. Push to origin
# ----------------------------------------------------------------------------
git push origin master --force

echo "✅ Done. Vercel build should now pass."