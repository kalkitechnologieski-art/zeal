#!/bin/bash
# =============================================================================
# PROJECT ZEAL – CLEAN SECRETS & FORCE PUSH
# =============================================================================
# This script removes real credentials from tracked files, amends the commit,
# and force-pushes the clean history to GitHub.
# =============================================================================

set -euo pipefail

echo "═══════════════════════════════════════════════════════════════════════════"
echo "  🧹 CLEANING SECRETS & FORCE PUSHING TO ORIGIN"
echo "═══════════════════════════════════════════════════════════════════════════"

# ----------------------------------------------------------------------------
# 1. Replace real credentials with placeholders
# ----------------------------------------------------------------------------
echo "🔍 Replacing real credentials with placeholders..."

# Patterns to match – common API keys
PATTERNS=(
  "rzp_live_[a-zA-Z0-9]*"
  "rzp_test_[a-zA-Z0-9]*"
  "sk_live_[a-zA-Z0-9]*"
  "sk_test_[a-zA-Z0-9]*"
  "pk_live_[a-zA-Z0-9]*"
  "pk_test_[a-zA-Z0-9]*"
  "gsk_[a-zA-Z0-9]*"
  "AGNES_[a-zA-Z0-9]*"
  "ZHIPU_[a-zA-Z0-9]*"
  "LIVEKIT_[a-zA-Z0-9]*"
  "UPSTASH_[a-zA-Z0-9]*"
  "R2_[a-zA-Z0-9]*"
)

# Files to clean
FILES=(
  ".env.production.template"
  ".env.example"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "   Cleaning $file ..."
    for pattern in "${PATTERNS[@]}"; do
      sed -i "s/$pattern/PLACEHOLDER/g" "$file"
    done
  fi
done

# ----------------------------------------------------------------------------
# 2. Remove the generated export file and add to .gitignore
# ----------------------------------------------------------------------------
echo "🗑️ Removing generated export file..."
rm -f project-zeal-full-export.txt

echo "📝 Adding export file to .gitignore..."
if ! grep -q "project-zeal-full-export.txt" .gitignore; then
  echo "project-zeal-full-export.txt" >> .gitignore
fi

# Also ensure .env.production* is ignored (if not already)
if ! grep -q ".env.production" .gitignore; then
  echo ".env.production" >> .gitignore
  echo ".env.production.template" >> .gitignore
fi

# ----------------------------------------------------------------------------
# 3. Stage all changes
# ----------------------------------------------------------------------------
echo "📦 Staging all changes..."
git add -A

# ----------------------------------------------------------------------------
# 4. Amend the previous commit (without changing message)
# ----------------------------------------------------------------------------
echo "✏️ Amending commit to remove secrets..."
git commit --amend --no-edit

# ----------------------------------------------------------------------------
# 5. Force push to origin/master (or current branch)
# ----------------------------------------------------------------------------
BRANCH=$(git branch --show-current)
echo "🚀 Force pushing to origin/$BRANCH ..."
git push origin "$BRANCH" --force

# ----------------------------------------------------------------------------
# 6. Success message
# ----------------------------------------------------------------------------
echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo "  ✅ SUCCESS: Clean history pushed to origin/$BRANCH"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "🔐 Now add your real credentials as environment variables in Vercel,"
echo "   Fly.io, or your hosting platform – NOT in the repository."
echo ""