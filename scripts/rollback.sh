#!/bin/bash
# =============================================================================
# PROJECT ZEAL – ROLLBACK SCRIPT
# =============================================================================

set -euo pipefail

echo "⏪ Rolling back Project Zeal..."

if [ -f "vercel.json" ] && command -v vercel &> /dev/null; then
  echo "🔄 Rolling back Vercel deployment..."
  vercel rollback
else
  echo "⚠️ Manual rollback required. Please revert to previous commit."
fi

echo "✅ Rollback complete."
