#!/bin/bash
# =============================================================================
# PROJECT ZEAL – IMAGE OPTIMIZATION SCRIPT
# =============================================================================
# This script compresses images in the public directory.
# Requires: imagemin-cli or similar tool.

echo "🖼️ Optimizing images..."

# Check if imagemin is installed
if command -v imagemin &> /dev/null; then
  imagemin apps/web/public/images/**/*.{jpg,jpeg,png,gif,svg} --out-dir=apps/web/public/images
  echo "✅ Images optimized."
else
  echo "⚠️ imagemin not installed. Skipping image optimization."
  echo "Install with: npm install -g imagemin-cli"
fi
