import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { withErrorHandler, AppError, HTTP_STATUS } from "@/lib/errors";
import { NotificationService } from "@/lib/notifications/service";

export const GET = withErrorHandler(async (req: Request) => {
  const supabase = createServerClientFromCookies();
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);

  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") || "50");
  const offset = parseInt(url.searchParams.get("offset") || "0");

  const result = await NotificationService.getNotifications(userId, { limit, offset });
  return NextResponse.json(result);
});

export const PUT = withErrorHandler(async (req: Request) => {
  const supabase = createServerClientFromCookies();
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);

  await NotificationService.markAllAsRead(userId);
  return NextResponse.json({ success: true });
});
