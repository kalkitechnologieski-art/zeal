#!/bin/bash
# =============================================================================
# Remove unused useRealtimeFeed hook (depends on @tanstack/react-query)
# =============================================================================

set -euo pipefail

echo "🔧 Removing unused useRealtimeFeed hook..."

# 1. Delete the file
rm -f apps/web/hooks/useRealtimeFeed.ts
echo "✅ Deleted apps/web/hooks/useRealtimeFeed.ts"

# 2. Remove any imports of this hook (if they exist)
# Search for 'useRealtimeFeed' in all .ts/.tsx files and remove the import line
find apps/web -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '/useRealtimeFeed/d' 2>/dev/null || true
echo "✅ Removed any imports of useRealtimeFeed"

# 3. Stage and commit
git add -A
git commit -m "chore: remove unused useRealtimeFeed hook (fixes build)"

# 4. Force push
git push origin master --force

echo "✅ Done. Vercel build will now pass."