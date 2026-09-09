import { getUserId } from "@/lib/auth";
import { NextResponse } from "next/server";
import { NotificationService } from "@/lib/notifications/service";

export const GET = async (req: Request) => {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }
  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const result = await NotificationService.getNotifications(userId, { limit, offset });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[Notifications] Error:", error);
    return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
  }
};

export const PUT = async (req: Request) => {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }
  try {
    await NotificationService.markAllAsRead(userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Notifications] Error marking all read:", error);
    return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
  }
};

// AUTH_ENTERPRISE_APPLIED
