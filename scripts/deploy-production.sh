#!/bin/bash
# =============================================================================
# PROJECT ZEAL – PRODUCTION DEPLOYMENT
# =============================================================================

set -euo pipefail

echo "🚀 Deploying Project Zeal to production..."

# Load environment variables
if [ -f .env.production ]; then
  source .env.production
else
  echo "⚠️ .env.production not found. Using .env.local"
  source .env.local
fi

# Run pre-deployment checks
echo "🔍 Running pre-deployment checks..."
npm run type-check
npm run build

# Deploy to Vercel (if configured)
if command -v vercel &> /dev/null; then
  echo "🚀 Deploying to Vercel..."
  vercel --prod
else
  echo "⚠️ Vercel CLI not installed. Please deploy manually."
fi

# Run post-deployment health check
echo "🏥 Running health check..."
./scripts/health-check.sh

echo "✅ Deployment complete!"
