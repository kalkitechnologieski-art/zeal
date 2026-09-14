import { NextResponse } from "next/server";
import { createServerClientFromCookies, getUserId } from "@zeal/database";
import { withErrorHandler, AppError, ErrorCode } from "@/lib/errors";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const userId = await getUserId();
  if (!userId) throw new AppError("Unauthorized", 401, ErrorCode.AUTH_UNAUTHORIZED);
  const supabase = await createServerClientFromCookies();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.app_metadata?.role;
  if (role !== "SUPER_ADMIN") throw new AppError("Forbidden", 403, ErrorCode.AUTH_FORBIDDEN);
  return userId;
}

export const GET = withErrorHandler(async () => {
  await requireAdmin();
  const supabase = await createServerClientFromCookies();
  const { data, error } = await supabase
    .from("Consultant")
    .select(`id, status, category, specialties, bio, perMinuteRate, verificationDocs, createdAt,
             user:User!Consultant_userId_fkey (id, name, email, username, avatar)`)
    .eq("status", "PENDING")
    .order("createdAt", { ascending: true });
  if (error) throw new AppError(error.message, 500, ErrorCode.INTERNAL_SERVER);
  return NextResponse.json({ consultants: data || [] });
});

export const POST = withErrorHandler(async (req: Request) => {
  const adminId = await requireAdmin();
  const { consultantId, action, reason, subdomain } = await req.json();
  if (!consultantId || !action) throw new AppError("Missing fields", 400, ErrorCode.VALIDATION_INPUT);

  const supabase = await createServerClientFromCookies();
  const { data, error } = await supabase.rpc("verify_consultant", {
    p_consultant_id: consultantId,
    p_admin_id: adminId,
    p_action: action,
    p_reason: reason || null,
    p_subdomain: subdomain || null,
  });
  if (error) throw new AppError(error.message, 500, ErrorCode.INTERNAL_SERVER);
  return NextResponse.json(data);
});
