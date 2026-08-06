#!/bin/bash
# =============================================================================
# PROJECT ZEAL – AUDIT SCRIPT
# =============================================================================

echo "🔍 Running Project Zeal audit..."

# Check dependencies
echo "📦 Checking dependencies..."
npm audit

# Check for outdated packages
echo "📦 Checking outdated packages..."
npm outdated

# Check TypeScript errors
echo "🔎 Checking TypeScript..."
npm run type-check

# Check linting
echo "🔎 Checking linting..."
npm run lint

# Check build
echo "🏗️ Checking build..."
npm run build

echo "✅ Audit complete!"
