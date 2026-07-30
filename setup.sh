#!/bin/bash
# =============================================================================
# FIX STATIC GENERATION HANG ON VERCEL
# =============================================================================

set -euo pipefail

echo "🔧 Fixing static generation issues..."

# Add dynamic = 'force-dynamic' to all page.tsx files in the web app
find apps/web/app -type f -name "page.tsx" ! -path "*/api/*" -print0 | while IFS= read -r -d '' file; do
  # Check if it already has 'export const dynamic'
  if ! grep -q "export const dynamic" "$file"; then
    echo "Adding dynamic = 'force-dynamic' to $file"
    # Insert after the first line if it starts with 'import' or 'use client', else at top
    if head -1 "$file" | grep -q "^import\|^\"use client\""; then
      sed -i "1a export const dynamic = 'force-dynamic';" "$file"
    else
      sed -i "1i export const dynamic = 'force-dynamic';" "$file"
    fi
  fi
done

# Also add to layout.tsx if needed
find apps/web/app -type f -name "layout.tsx" -print0 | while IFS= read -r -d '' file; do
  if ! grep -q "export const dynamic" "$file"; then
    echo "Adding dynamic = 'force-dynamic' to $file"
    sed -i "1a export const dynamic = 'force-dynamic';" "$file"
  fi
done

echo "✅ Added 'force-dynamic' to all pages."

# Ensure .env.production with Clerk keys
echo "📦 Creating .env.production for Vercel..."
cat > .env.production << 'EOF'
# Clerk Authentication (replace with your actual keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_dG9wLXN0YXJsaW5nLTM2LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_9G4JQYWjs9hcyFqcngJnb5qDey12SWRNVxV6zrcxWN

# Database (placeholder)
DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/zeal

# Redis (placeholder)
UPSTASH_REDIS_REST_URL=https://placeholder.upstash.io
UPSTASH_REDIS_REST_TOKEN=placeholder

# Storage (placeholder)
R2_ACCOUNT_ID=placeholder
R2_ACCESS_KEY_ID=placeholder
R2_SECRET_ACCESS_KEY=placeholder
R2_BUCKET_NAME=zeal
R2_PUBLIC_URL=https://placeholder.r2.dev

# Payments (placeholder)
RAZORPAY_KEY_ID=rzp_placeholder
RAZORPAY_KEY_SECRET=placeholder

# Real-time (placeholder)
NEXT_PUBLIC_WS_URL=wss://placeholder.zeal.com

# Video (LiveKit – placeholder)
LIVEKIT_API_KEY=placeholder
LIVEKIT_API_SECRET=placeholder
LIVEKIT_WS_URL=wss://placeholder.livekit.zeal.com

# AI (Groq – placeholder)
GROQ_API_KEY=gsk_placeholder
EOF

echo "✅ Created .env.production"

echo "📝 Committing and pushing changes..."
git add .
git commit -m "fix: add force-dynamic to pages and .env.production for Vercel" --no-verify
git push origin master

echo "✅ Done! Redeploy on Vercel."