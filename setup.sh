# 1. Install Prisma client in the web app
cd apps/web
npm install --save-dev @prisma/client prisma
cd ../..

# 2. Add prebuild script to generate Prisma client
# (This ensures the client is generated before Next.js builds)
node -e "
const fs = require('fs');
const pkg = require('./apps/web/package.json');
pkg.scripts = pkg.scripts || {};
pkg.scripts.prebuild = 'npx prisma generate --schema=../../packages/database/prisma/schema.prisma';
pkg.scripts.build = 'next build';
fs.writeFileSync('./apps/web/package.json', JSON.stringify(pkg, null, 2));
"

# 3. Remove @zeal/database from next.config.js transpilePackages
sed -i 's/"@zeal\/database",\?//g' apps/web/next.config.js
sed -i 's/,\s*\]/]/g' apps/web/next.config.js

# 4. Replace all imports of @zeal/database in API routes with direct Prisma import
find apps/web/app/api -type f -name "*.ts" -exec sed -i 's/import { prisma } from "@zeal\/database";/import { PrismaClient } from "@prisma\/client";\nconst prisma = new PrismaClient();/g' {} \;
find apps/web/app/api -type f -name "*.ts" -exec sed -i "s/import { prisma } from '@zeal\/database';/import { PrismaClient } from '@prisma\/client';\nconst prisma = new PrismaClient();/g" {} \;

# 5. Also handle any other imports (just in case)
find apps/web/app/api -type f -name "*.ts" -exec sed -i '/@zeal\/database/d' {} \;

# 6. Remove the dependency from package.json (optional but clean)
node -e "
const fs = require('fs');
const pkg = require('./apps/web/package.json');
if (pkg.dependencies && pkg.dependencies['@zeal/database']) {
  delete pkg.dependencies['@zeal/database'];
  fs.writeFileSync('./apps/web/package.json', JSON.stringify(pkg, null, 2));
}
"

# 7. Stage and commit the changes
git add -A
git commit -m "fix: replace @zeal/database with direct Prisma client for Vercel"

# 8. Push to GitHub
git push origin master --force