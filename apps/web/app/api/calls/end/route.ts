import { NextResponse } from "next/server";
import { createServerClientFromCookies, getUserId } from "@zeal/database";
import { withErrorHandler, AppError, ErrorCode } from "@/lib/errors";

export const dynamic = "force-dynamic";

export const POST = withErrorHandler(async (req: Request) => {
  const userId = await getUserId();
  if (!userId) throw new AppError("Unauthorized", 401, ErrorCode.AUTH_UNAUTHORIZED);

  const { sessionId } = await req.json();
  if (!sessionId) throw new AppError("sessionId required", 400, ErrorCode.VALIDATION_INPUT);

  const supabase = await createServerClientFromCookies();
  const { data, error } = await supabase.rpc("end_call_session", { p_session_id: sessionId });
  if (error) throw new AppError(error.message, 500, ErrorCode.INTERNAL_SERVER);
  return NextResponse.json(data);
});
