#!/usr/bin/env bash
# =============================================================================
# PROJECT ZEAL – FIX DUPLICATE WEBSOCKET FALLBACK
# =============================================================================
# This script rewrites calls/start/route.ts and calls/end/route.ts with
# a single WebSocket fallback definition.
#
# Usage: ./fix-websocket-files.sh
# =============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info()  { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success(){ echo -e "${GREEN}[✓]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }

# -----------------------------------------------------------------------------
# Rewrite apps/web/app/api/calls/start/route.ts
# -----------------------------------------------------------------------------
log_info "Rewriting calls/start/route.ts"

cat > apps/web/app/api/calls/start/route.ts <<'EOF'
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@zeal/database";
import { withErrorHandler, AppError, HTTP_STATUS } from "@/lib/errors";
import { generateToken } from "@/lib/livekit/room";
import { CallBilling } from "@/lib/calls/billing";
import { NotificationService } from "@/lib/notifications/service";

// WebSocket fallback for production (Vercel does not support WebSockets)
let fallbackWs: any;
try {
  fallbackWs = require("@/lib/socket/server").ws;
} catch {
  fallbackWs = {
    to: () => ({ emit: () => {} }),
    emit: () => {},
  };
}

export const POST = withErrorHandler(async (req: Request) => {
  const { userId } = await auth();
  if (!userId) throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);

  const { bookingId } = await req.json();
  if (!bookingId) throw new AppError("Booking ID required", HTTP_STATUS.BAD_REQUEST);

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { consultant: { include: { user: true } } },
  });
  if (!booking) throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND);

  if (booking.userId !== userId && booking.consultant.userId !== userId) {
    throw new AppError("Not authorized", HTTP_STATUS.FORBIDDEN);
  }

  if (booking.status !== "CONFIRMED") {
    throw new AppError("Booking not confirmed", HTTP_STATUS.BAD_REQUEST);
  }

  const session = await prisma.callSession.create({
    data: {
      bookingId: booking.id,
      userId: booking.userId!,
      consultantId: booking.consultantId,
      startTime: new Date(),
      status: "INITIATED",
      durationSeconds: 0,
      amount: 0,
    },
  });

  const roomName = `booking-${bookingId}`;
  const token = await generateToken(roomName, userId);

  CallBilling.startBilling(session.id, booking.consultant.perMinuteRate);

  // Notify the other participant via WebSocket (fallback)
  const recipientId = booking.userId === userId ? booking.consultant.userId : booking.userId;
  try {
    fallbackWs.to(`user:${recipientId}`).emit("call_started", {
      sessionId: session.id,
      bookingId: booking.id,
      caller: userId,
      roomName,
    });
  } catch (error) {
    console.error("WebSocket notification failed (non-critical):", error);
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "IN_PROGRESS" },
  });

  return NextResponse.json({ sessionId: session.id, token, roomName });
});
EOF

log_success "calls/start/route.ts rewritten"

# -----------------------------------------------------------------------------
# Rewrite apps/web/app/api/calls/end/route.ts
# -----------------------------------------------------------------------------
log_info "Rewriting calls/end/route.ts"

cat > apps/web/app/api/calls/end/route.ts <<'EOF'
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@zeal/database";
import { withErrorHandler, AppError, HTTP_STATUS } from "@/lib/errors";
import { CallBilling } from "@/lib/calls/billing";
import { uploadToR2 } from "@/lib/storage/r2";
import { NotificationService } from "@/lib/notifications/service";

// WebSocket fallback for production (Vercel does not support WebSockets)
let fallbackWs: any;
try {
  fallbackWs = require("@/lib/socket/server").ws;
} catch {
  fallbackWs = {
    to: () => ({ emit: () => {} }),
    emit: () => {},
  };
}

export const POST = withErrorHandler(async (req: Request) => {
  const { userId } = await auth();
  if (!userId) throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);

  const { sessionId, recordingFile, rating, review } = await req.json();
  if (!sessionId) throw new AppError("Session ID required", HTTP_STATUS.BAD_REQUEST);

  const session = await prisma.callSession.findUnique({
    where: { id: sessionId },
    include: { booking: { include: { consultant: true } } },
  });
  if (!session) throw new AppError("Session not found", HTTP_STATUS.NOT_FOUND);

  if (!session.booking) {
    throw new AppError("Booking not found for this session", HTTP_STATUS.NOT_FOUND);
  }

  if (session.userId !== userId) {
    throw new AppError("Not authorized", HTTP_STATUS.FORBIDDEN);
  }

  const durationSeconds = Math.floor((Date.now() - session.startTime.getTime()) / 1000);

  let recordingUrl: string | null = null;
  if (recordingFile) {
    try {
      recordingUrl = await uploadToR2(recordingFile, `recordings/${sessionId}.mp4`);
    } catch (error) {
      console.error("Recording upload failed:", error);
    }
  }

  const updatedSession = await prisma.callSession.update({
    where: { id: sessionId },
    data: {
      endTime: new Date(),
      durationSeconds,
      status: "ENDED",
      ...(recordingUrl && { recordingUrl, recordingReady: true }),
      amount: (durationSeconds / 60) * session.booking.consultant.perMinuteRate,
    },
  });

  await CallBilling.endSession(sessionId);

  await prisma.booking.update({
    where: { id: session.bookingId! },
    data: { status: "CONFIRMED" },
  });

  // TODO: Implement rating/review in a separate Review model
  if (rating && rating > 0) {
    console.log(`Rating for booking ${session.bookingId}: ${rating}, review: ${review}`);
  }

  // Notify both parties via WebSocket (fallback)
  const participants = [session.userId, session.booking.consultant.userId];
  participants.forEach((id) => {
    try {
      fallbackWs.to(`user:${id}`).emit("call_ended", {
        sessionId,
        durationSeconds,
        recordingUrl,
        rating,
      });
    } catch (error) {
      console.error(`WebSocket notification failed for user ${id}:`, error);
    }
  });

  return NextResponse.json({ session: updatedSession });
});
EOF

log_success "calls/end/route.ts rewritten"

# -----------------------------------------------------------------------------
# Also update lib/socket/client.ts with production check (idempotent)
# -----------------------------------------------------------------------------
log_info "Ensuring socket/client.ts has production check"

SOCKET_FILE="apps/web/lib/socket/client.ts"
if [[ -f "$SOCKET_FILE" ]]; then
    # Check if production check already exists
    if ! grep -q "NEXT_PUBLIC_VERCEL_ENV" "$SOCKET_FILE"; then
        # Insert production check after function start
        perl -0777 -i -pe 's/export function getSocket\(token\?: string\): Socket \| null \{\n/export function getSocket\(token\?: string\): Socket \| null \{\n  \/\/ Skip WebSocket on Vercel\n  if (process\.env\.NEXT_PUBLIC_VERCEL_ENV === "production" \|\| process\.env\.VERCEL === "1") \{\n    console\.warn\("[WebSocket] Disabled in production");\n    return null;\n  }\n/g' "$SOCKET_FILE"
        log_success "Added production check to socket/client.ts"
    else
        log_success "socket/client.ts already has production check"
    fi
else
    log_error "socket/client.ts not found"
fi

# -----------------------------------------------------------------------------
# Run a build test
# -----------------------------------------------------------------------------
log_info "Running build to verify fixes..."

if npm run build --workspace=web; then
    log_success "✅ Build passed!"
else
    log_error "❌ Build still failing – check output above"
fi

# -----------------------------------------------------------------------------
# Final message
# -----------------------------------------------------------------------------
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ All WebSocket files fixed.${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "You can now commit and push:"
echo "  git add ."
echo "  git commit -m 'fix: WebSocket fallback and production detection'"
echo "  git push origin master"
echo ""
echo "Then redeploy on Vercel:"
echo "  vercel --prod"