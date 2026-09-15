#!/usr/bin/env bash
# ==============================================================================
# PROJECT ZEAL — FINAL PRODUCTION DEPLOYMENT PIPELINE
# ==============================================================================
set -euo pipefail

INFO="\033[1;34m[INFO]\033[0m"
SUCCESS="\033[1;32m[SUCCESS]\033[0m"
ERROR="\033[1;31m[ERROR]\033[0m"

echo -e "${INFO} 1. Purging Next.js Cache..."
rm -rf apps/web/.next

echo -e "${INFO} 2. Running Strict TypeScript Type Check..."
npx tsc --noEmit --project apps/web/tsconfig.json || { echo -e "${ERROR} Type check failed! Aborting."; exit 1; }

echo -e "${INFO} 3. Running Local Production Build Audit..."
npm --workspace web run build || { echo -e "${ERROR} Local build failed! Aborting before push."; exit 1; }

echo -e "${INFO} 4. Committing and Pushing to Master..."
git add .
git commit -m "feat(services): finalize enterprise architecture, database schema, and navigation workflows"
git push origin master

echo -e "${SUCCESS} ====================================================================="
echo -e "${SUCCESS} PIPELINE PASSED! All updates successfully pushed to production."
echo -e "${SUCCESS} ====================================================================="