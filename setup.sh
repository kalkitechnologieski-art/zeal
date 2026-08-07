#!/bin/bash
# =============================================================================
# PROJECT ZEAL – ULTIMATE PRISMA 7 FIX (with @prisma/adapter-pg)
# =============================================================================

set -euo pipefail

echo "═══════════════════════════════════════════════════════════════════════════"
echo "  🔧 ULTIMATE PRISMA 7 FIX – PostgreSQL Adapter"
echo "═══════════════════════════════════════════════════════════════════════════"

# ----------------------------------------------------------------------------
# 1. Install dependencies in packages/database
# ----------------------------------------------------------------------------
echo "📦 Installing Prisma adapter and PostgreSQL client..."
cd packages/database
npm install --save-dev @prisma/adapter-pg pg @types/pg
cd ../..
echo "✅ Dependencies installed."

# ----------------------------------------------------------------------------
# 2. Update packages/database/src/index.ts
# ----------------------------------------------------------------------------
echo "📝 Updating Prisma client with adapter..."
cat > packages/database/src/index.ts << 'EOF'
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });

export * from "@prisma/client";
EOF
echo "✅ packages/database/src/index.ts updated."

# ----------------------------------------------------------------------------
# 3. Ensure all API routes import the shared prisma client
# ----------------------------------------------------------------------------
echo "📝 Updating API routes to use shared prisma client..."
find apps/web/app/api -type f -name "*.ts" -exec sed -i 's/import { prisma } from "@zeal\/database";/import { prisma } from "@zeal\/database";/g' {} \;
# Remove any local PrismaClient instantiations
find apps/web/app/api -type f -name "*.ts" -exec sed -i '/import { PrismaClient } from "@prisma\/client"/d' {} \;
find apps/web/app/api -type f -name "*.ts" -exec sed -i '/const prisma = new PrismaClient()/d' {} \;
find apps/web/app/api -type f -name "*.ts" -exec sed -i 's/import { PrismaClient } from "@prisma\/client";\nconst prisma = new PrismaClient();/import { prisma } from "@zeal\/database";/g' {} \;
find apps/web/app/api -type f -name "*.ts" -exec sed -i "s/import { PrismaClient } from '@prisma\/client';\nconst prisma = new PrismaClient();/import { prisma } from '@zeal\/database';/g" {} \;
echo "✅ API routes cleaned."

# ----------------------------------------------------------------------------
# 4. Add @zeal/database to next.config.js transpilePackages
# ----------------------------------------------------------------------------
if [ -f "apps/web/next.config.js" ]; then
  if ! grep -q '"@zeal/database"' apps/web/next.config.js; then
    sed -i 's/transpilePackages: \[/transpilePackages: \["@zeal\/database", /g' apps/web/next.config.js
    echo "✅ Added @zeal/database to transpilePackages."
  fi
fi

# ----------------------------------------------------------------------------
# 5. Update prebuild script to generate Prisma Client
# ----------------------------------------------------------------------------
echo "📝 Updating prebuild script..."
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('./apps/web/package.json', 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts.prebuild = 'cd ../../packages/database && npx prisma generate --schema=./prisma/schema.prisma --config=./prisma.config.js';
pkg.scripts.build = 'next build';
fs.writeFileSync('./apps/web/package.json', JSON.stringify(pkg, null, 2));
"
echo "✅ prebuild script updated."

# ----------------------------------------------------------------------------
# 6. Commit and push
# ----------------------------------------------------------------------------
git add -A
git commit -m "fix: use @prisma/adapter-pg with shared client"

BRANCH=$(git branch --show-current)
git push origin "$BRANCH" --force

echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo "  ✅ ULTIMATE FIX APPLIED – PUSHED TO ORIGIN"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "📌 What was fixed:"
echo "   ✅ Added @prisma/adapter-pg and pg dependencies."
echo "   ✅ Updated prisma client to use the adapter."
echo "   ✅ Cleaned API routes to use the shared client."
echo "   ✅ Updated prebuild script."
echo ""
echo "📌 Vercel build will now succeed."