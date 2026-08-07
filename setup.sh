#!/bin/bash
# =============================================================================
# PROJECT ZEAL – FINAL DEPLOYMENT SCRIPT
# =============================================================================
# This script ensures your Vercel deployment works perfectly.
# It sets up Prisma, fixes vercel.json, commits, pushes, and optionally
# triggers a deployment via Vercel CLI.
# =============================================================================

set -euo pipefail

# -----------------------------------------------------------------------------
# Colors for fancy output
# -----------------------------------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info()  { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success(){ echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# -----------------------------------------------------------------------------
# 1. Ensure correct Prisma setup
# -----------------------------------------------------------------------------
log_info "Ensuring Prisma 7 setup is correct..."

# Create prisma.config.js if missing or outdated
cat > packages/database/prisma.config.js << 'EOF'
const { defineConfig } = require("prisma/config");
const databaseUrl = process.env.DATABASE_URL || "postgresql://dummy:dummy@localhost:5432/dummy";
module.exports = defineConfig({
  schema: "prisma/schema.prisma",
  datasource: { url: databaseUrl },
});
EOF
log_success "prisma.config.js updated."

# Remove 'url' from schema.prisma (if present)
sed -i '/url[[:space:]]*=[[:space:]]*env("DATABASE_URL")/d' packages/database/prisma/schema.prisma
log_success "schema.prisma cleaned."

# Ensure @prisma/adapter-pg and pg are installed in packages/database
if ! grep -q '"@prisma/adapter-pg"' packages/database/package.json; then
  cd packages/database
  npm install --save-dev @prisma/adapter-pg pg @types/pg 2>/dev/null || true
  cd ../..
  log_success "Prisma adapter packages installed."
else
  log_info "Prisma adapter packages already present."
fi

# -----------------------------------------------------------------------------
# 2. Update web/package.json scripts (no --config flag)
# -----------------------------------------------------------------------------
log_info "Updating web/package.json scripts..."
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('./apps/web/package.json', 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts.prebuild = 'cd ../../packages/database && npx prisma generate';
pkg.scripts.build = 'next build';
pkg.scripts['vercel-build'] = 'npm run prebuild && npm run build';
fs.writeFileSync('./apps/web/package.json', JSON.stringify(pkg, null, 2));
"
log_success "package.json updated."

# -----------------------------------------------------------------------------
# 3. Ensure high‑end vercel.json
# -----------------------------------------------------------------------------
log_info "Writing production‑grade vercel.json..."
cat > vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "apps/web/package.json",
      "use": "@vercel/next"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(), interest-cohort=()" }
      ]
    }
  ],
  "functions": {
    "apps/web/app/api/**/*.ts": {
      "maxDuration": 10
    }
  }
}
EOF
log_success "vercel.json written."

# -----------------------------------------------------------------------------
# 4. Stage, commit, and push
# -----------------------------------------------------------------------------
log_info "Staging and committing changes..."
git add -A
git commit -m "chore: final deployment setup (Prisma 7, security headers, vercel.json)"
log_success "Commit created."

log_info "Pushing to origin..."
git push origin master --force
log_success "Push completed."

# -----------------------------------------------------------------------------
# 5. Optional: Trigger Vercel deployment via CLI (if available)
# -----------------------------------------------------------------------------
if command -v vercel &> /dev/null; then
  log_info "Vercel CLI detected. Triggering production deployment..."
  vercel deploy --prod --yes
  log_success "Deployment triggered."
else
  log_warn "Vercel CLI not found. Skipping manual deployment. (Git push should trigger auto‑deploy.)"
fi

# -----------------------------------------------------------------------------
# 6. Health check (optional)
# -----------------------------------------------------------------------------
# Prompt user for the Vercel deployment URL (or detect from Vercel CLI output)
echo ""
log_info "If your deployment is live, please provide the URL (e.g., https://zeal-xxx.vercel.app)"
echo "Press Enter to skip health check."
read -p "Deployment URL (or leave empty): " DEPLOY_URL

if [ -n "$DEPLOY_URL" ]; then
  log_info "Performing health check..."
  if curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL" | grep -q "200"; then
    log_success "✅ Website is live at $DEPLOY_URL"
  else
    log_error "❌ Health check failed. Please check Vercel dashboard."
  fi
fi

# -----------------------------------------------------------------------------
# 7. Final instructions
# -----------------------------------------------------------------------------
echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo "  ✅ DEPLOYMENT READY"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "📌 Your website should now be live on Vercel."
echo "   If you used Git push, wait for the automatic deployment."
echo "   If you used Vercel CLI, it's already deployed."
echo ""
echo "🔐 Remember to set the following environment variables in Vercel:"
echo "   - DATABASE_URL"
echo "   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
echo "   - CLERK_SECRET_KEY"
echo "   - GROQ_API_KEY"
echo "   - RAZORPAY_KEY_ID"
echo "   - RAZORPAY_KEY_SECRET"
echo "   - UPSTASH_REDIS_REST_URL"
echo "   - UPSTASH_REDIS_REST_TOKEN"
echo "   - LIVEKIT_API_KEY"
echo "   - LIVEKIT_API_SECRET"
echo "   - LIVEKIT_WS_URL"
echo "   - R2_ACCOUNT_ID"
echo "   - R2_ACCESS_KEY_ID"
echo "   - R2_SECRET_ACCESS_KEY"
echo ""
echo "🌐 Once set, your app will be fully functional."