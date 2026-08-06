#!/bin/bash
# =============================================================================
# PROJECT ZEAL – ALERTING SCRIPT
# =============================================================================
# This script checks health endpoints and sends alerts if services are down.
# Designed to be run from a cron job.

set -euo pipefail

WEB_URL="https://zeal.com/health"
API_URL="https://api.zeal.com/health"
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"

check_service() {
  local url="$1"
  local name="$2"
  local response=$(curl -s -o /dev/null -w "%{http_code}" "$url")

  if [ "$response" = "200" ] || [ "$response" = "204" ]; then
    echo "✅ $name is healthy (HTTP $response)"
    return 0
  else
    echo "❌ $name is DOWN (HTTP $response)"
    return 1
  fi
}

send_alert() {
  local message="$1"
  if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
      --data "{\"text\":\"$message\"}" \
      "$SLACK_WEBHOOK_URL"
  else
    echo "ALERT: $message"
  fi
}

# Check web
if ! check_service "$WEB_URL" "Web"; then
  send_alert "🚨 Web service is down! $WEB_URL"
fi

# Check API
if ! check_service "$API_URL" "API"; then
  send_alert "🚨 API service is down! $API_URL"
fi

# Check admin (if deployed)
# ADMIN_URL="https://admin.zeal.com/health"
# if ! check_service "$ADMIN_URL" "Admin"; then
#   send_alert "🚨 Admin service is down! $ADMIN_URL"
# fi
