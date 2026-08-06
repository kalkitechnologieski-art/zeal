#!/bin/bash
# =============================================================================
# PROJECT ZEAL – HEALTH CHECK SCRIPT
# =============================================================================

echo "🏥 Running health check..."

# Check web app
echo "🌐 Checking web app..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health | grep 200 && echo " ✅ Web app OK" || echo " ❌ Web app failed"

# Check admin app
echo "🔧 Checking admin app..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health | grep 200 && echo " ✅ Admin app OK" || echo " ❌ Admin app failed"

# Check API
echo "🔌 Checking API..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health | grep 200 && echo " ✅ API OK" || echo " ❌ API failed"

echo "✅ Health check complete!"
