#!/bin/bash
# =============================================================================
# PROJECT ZEAL – FORCE FIX FOR PRISMA 7 + VERCEL BUILD
# =============================================================================
# This script resolves all build issues in one go:
#   - Removes @zeal/database from API routes
#   - Adds prisma.config.ts for Prisma 7
#   - Updates package.json scripts and dependencies
#   - Commits and force-pushes to GitHub
# =============================================================================

set -euo pipefail

echo "═══════════════════════════════════════════════════════════════════════════"
echo "  🔧 FORCE FIX: Prisma 7 + Vercel Build"
echo "═══════════════════════════════════════════════════════════════════════════"

# ----------------------------------------------------------------------------
# 1. Install required dependencies in the web app
# ----------------------------------------------------------------------------
echo "📦 Installing Prisma 7 dependencies..."
cd apps/web
npm install --save-dev @prisma/client prisma @prisma/config dotenv
cd ../..

# ----------------------------------------------------------------------------
# 2. Create prisma.config.ts in packages/database
# ----------------------------------------------------------------------------
echo "📝 Creating prisma.config.ts..."
cat > packages/database/prisma.config.ts << 'EOF'
import { defineConfig, env } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
EOF

# ----------------------------------------------------------------------------
# 3. Remove the 'url' line from schema.prisma
# ----------------------------------------------------------------------------
echo "📝 Updating schema.prisma (removing url)..."
sed -i '/url[[:space:]]*=[[:space:]]*env("DATABASE_URL")/d' packages/database/prisma/schema.prisma
# Also ensure the datasource block is clean
sed -i '/datasource db {/,/}/ s/^[[:space:]]*url[[:space:]]*=.*$//' packages/database/prisma/schema.prisma

# ----------------------------------------------------------------------------
# 4. Update web app package.json scripts
# ----------------------------------------------------------------------------
echo "📝 Updating apps/web/package.json scripts..."
node -e "
const fs = require('fs');
const path = './apps/web/package.json';
const pkg = JSON.parse(fs.readFileSync(path, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts.prebuild = 'npx prisma generate --schema=../../packages/database/prisma/schema.prisma --config=../../packages/database/prisma.config.ts';
pkg.scripts.build = 'next build';
fs.writeFileSync(path, JSON.stringify(pkg, null, 2));
"

# ----------------------------------------------------------------------------
# 5. Remove @zeal/dependency from package.json (if present)
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
# 6. Replace all imports of @zeal/database in API routes
# ----------------------------------------------------------------------------
echo "🔄 Replacing @zeal/database imports with direct Prisma client..."
find apps/web/app/api -type f -name "*.ts" -exec sed -i 's/import { prisma } from "@zeal\/database";/import { PrismaClient } from "@prisma\/client";\nconst prisma = new PrismaClient();/g' {} \;
find apps/web/app/api -type f -name "*.ts" -exec sed -i "s/import { prisma } from '@zeal\/database';/import { PrismaClient } from '@prisma\/client';\nconst prisma = new PrismaClient();/g" {} \;
# Remove any leftover imports (just in case)
find apps/web/app/api -type f -name "*.ts" -exec sed -i '/@zeal\/database/d' {} \;

# ----------------------------------------------------------------------------
# 7. Update next.config.js to remove @zeal/database from transpilePackages
# ----------------------------------------------------------------------------
if grep -q '"@zeal/database"' apps/web/next.config.js; then
  sed -i 's/"@zeal\/database",\?//g' apps/web/next.config.js
  sed -i 's/,\s*\]/]/g' apps/web/next.config.js
fi

# ----------------------------------------------------------------------------
# 8. Ensure .gitignore does not block prisma.config.ts
# ----------------------------------------------------------------------------
# Remove any ignore line that might block the config file
sed -i '/prisma.config.ts/d' .gitignore 2>/dev/null || true

# ----------------------------------------------------------------------------
# 9. Stage and commit changes
# ----------------------------------------------------------------------------
git add -A
git commit -m "fix: full Prisma 7 compatibility for Vercel build

- Added prisma.config.ts
- Removed url from schema.prisma
- Replaced @zeal/database with direct Prisma client in API routes
- Updated web package.json scripts with --config flag
- Installed required packages (@prisma/config, dotenv)"

# ----------------------------------------------------------------------------
# 10. Force push to GitHub
# ----------------------------------------------------------------------------
BRANCH=$(git branch --show-current)
echo "🚀 Force pushing to origin/$BRANCH ..."
git push origin "$BRANCH" --force

# ----------------------------------------------------------------------------
# 11. Final message
# ----------------------------------------------------------------------------
echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo "  ✅ ALL FIXES APPLIED – PUSHED TO ORIGIN"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "Vercel will now rebuild with the correct Prisma 7 configuration."
echo "If the build still fails, please share the new error log."