#!/bin/bash
# =============================================================================
# PROJECT ZEAL – DEPLOY SCRIPT
# =============================================================================

set -euo pipefail

echo "🚀 Starting deployment..."

# Run tests
echo "🧪 Running tests..."
npm test

# Build
echo "🏗️ Building..."
npm run build

# Deploy to Vercel (if configured)
if command -v vercel &> /dev/null; then
  echo "🚀 Deploying to Vercel..."
  vercel --prod
else
  echo "⚠️ Vercel CLI not installed. Skipping deployment."
fi

echo "✅ Deployment complete!"
