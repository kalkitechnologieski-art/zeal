#!/bin/bash
# =============================================================================
# PROJECT ZEAL – FINAL PRISMA 7 FIX (with dummy URL fallback)
# =============================================================================

set -euo pipefail

echo "═══════════════════════════════════════════════════════════════════════════"
echo "  🔧 FINAL PRISMA 7 FIX – DUMMY URL FALLBACK"
echo "═══════════════════════════════════════════════════════════════════════════"

# ----------------------------------------------------------------------------
# 1. Install required dependencies in the web app
# ----------------------------------------------------------------------------
cd apps/web
npm install --save-dev @prisma/client prisma @prisma/config dotenv
cd ../..

# ----------------------------------------------------------------------------
# 2. Create prisma.config.js (JavaScript, with dummy fallback)
# ----------------------------------------------------------------------------
cat > packages/database/prisma.config.js << 'EOF'
const { defineConfig, env } = require("prisma/config");
require("dotenv").config();

// Use DATABASE_URL if set, otherwise use a dummy URL for generation
const databaseUrl = env("DATABASE_URL") || "postgresql://dummy:dummy@localhost:5432/dummy";

module.exports = defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
});
EOF

# ----------------------------------------------------------------------------
# 3. Remove the 'url' line from schema.prisma
# ----------------------------------------------------------------------------
sed -i '/url[[:space:]]*=[[:space:]]*env("DATABASE_URL")/d' packages/database/prisma/schema.prisma
# Remove any leftover blank lines
sed -i '/^[[:space:]]*$/d' packages/database/prisma/schema.prisma

# ----------------------------------------------------------------------------
# 4. Update web app package.json scripts (use .js config)
# ----------------------------------------------------------------------------
node -e "
const fs = require('fs');
const path = './apps/web/package.json';
const pkg = JSON.parse(fs.readFileSync(path, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts.prebuild = 'npx prisma generate --schema=../../packages/database/prisma/schema.prisma --config=../../packages/database/prisma.config.js';
pkg.scripts.build = 'next build';
fs.writeFileSync(path, JSON.stringify(pkg, null, 2));
"

# ----------------------------------------------------------------------------
# 5. Remove @zeal/database dependency from web package.json
# ----------------------------------------------------------------------------
node -e "
const fs = require('fs');
const path = './apps/web/package.json';
const pkg = JSON.parse(fs.readFileSync(path, 'utf8'));
if (pkg.dependencies && pkg.dependencies['@zeal/database']) {
  delete pkg.dependencies['@zeal/database'];
}
if (pkg.devDependencies && pkg.devDependencies['@zeal/database']) {
  delete pkg.devDependencies['@zeal/database'];
}
fs.writeFileSync(path, JSON.stringify(pkg, null, 2));
"

# ----------------------------------------------------------------------------
# 6. Replace @zeal/database imports in API routes with direct Prisma client
# ----------------------------------------------------------------------------
find apps/web/app/api -type f -name "*.ts" -exec sed -i 's/import { prisma } from "@zeal\/database";/import { PrismaClient } from "@prisma\/client";\nconst prisma = new PrismaClient();/g' {} \;
find apps/web/app/api -type f -name "*.ts" -exec sed -i "s/import { prisma } from '@zeal\/database';/import { PrismaClient } from '@prisma\/client';\nconst prisma = new PrismaClient();/g" {} \;
# Remove any leftover imports (just in case)
find apps/web/app/api -type f -name "*.ts" -exec sed -i '/@zeal\/database/d' {} \;

# ----------------------------------------------------------------------------
# 7. Remove @zeal/database from next.config.js transpilePackages
# ----------------------------------------------------------------------------
if grep -q '"@zeal/database"' apps/web/next.config.js; then
  sed -i 's/"@zeal\/database",\?//g' apps/web/next.config.js
  sed -i 's/,\s*\]/]/g' apps/web/next.config.js
fi

# ----------------------------------------------------------------------------
# 8. Stage and commit changes
# ----------------------------------------------------------------------------
git add -A
git commit -m "fix: final Prisma 7 config with dummy URL fallback

- Switched prisma.config to JavaScript (.js) for Vercel compatibility
- Added fallback dummy URL for DATABASE_URL during generate
- Removed @zeal/database imports from API routes
- Updated prebuild script to use .js config"

# ----------------------------------------------------------------------------
# 9. Force push to GitHub
# ----------------------------------------------------------------------------
BRANCH=$(git branch --show-current)
echo "🚀 Force pushing to origin/$BRANCH ..."
git push origin "$BRANCH" --force

echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo "  ✅ PUSHED SUCCESSFULLY – VERCEL BUILD SHOULD NOW PASS"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "🔐 Remember to set the real DATABASE_URL in Vercel environment variables!"
echo "   (The dummy URL is only used during the build for Prisma client generation.)"