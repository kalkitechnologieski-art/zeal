#!/bin/bash
# =============================================================================
# Fix Prisma config: remove .ts, use .js, update prebuild
# =============================================================================

set -euo pipefail

echo "🔧 Fixing Prisma config file..."

# 1. Remove any existing .ts config
rm -f packages/database/prisma.config.ts

# 2. Create the .js config file
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

# 3. Ensure schema.prisma has no 'url' line
sed -i '/url[[:space:]]*=[[:space:]]*env("DATABASE_URL")/d' packages/database/prisma/schema.prisma

# 4. Update web/package.json prebuild script
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('./apps/web/package.json', 'utf8'));
pkg.scripts.prebuild = 'npx prisma generate --schema=../../packages/database/prisma/schema.prisma --config=../../packages/database/prisma.config.js';
pkg.scripts.build = 'next build';
fs.writeFileSync('./apps/web/package.json', JSON.stringify(pkg, null, 2));
"

# 5. Stage, commit, push
git add -A
git commit -m "fix: use .js Prisma config file"
git push origin master

echo "✅ Done. Vercel build should now pass."