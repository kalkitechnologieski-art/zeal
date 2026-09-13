import { NextResponse } from "next/server";
import { prisma } from "@zeal/database";
import { getAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Debug endpoint – visit /api/debug/ai-consultants to see what's happening.
 * Returns diagnostic info about the AIConsultant table and env vars.
 */
export async function GET() {
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasDirectUrl: !!process.env.DIRECT_URL,
      nodeEnv: process.env.NODE_ENV,
    },
  };

  // Prisma count
  try {
    const count = await prisma.aIConsultant.count();
    diagnostics.prismaCount = count;

    if (count > 0) {
      const sample = await prisma.aIConsultant.findMany({
        take: 3,
        select: { id: true, name: true, category: true, isActive: true },
      });
      diagnostics.prismaSample = sample;
    }
  } catch (err) {
    diagnostics.prismaError = err instanceof Error ? err.message : String(err);
  }

  // Supabase service role count
  try {
    const admin = getAdminClient();
    if (admin) {
      const { count, error } = await admin
        .from("AIConsultant")
        .select("*", { count: "exact", head: true });

      if (error) {
        diagnostics.supabaseError = error.message;
      } else {
        diagnostics.supabaseCount = count;
      }
    } else {
      diagnostics.supabaseError = "Admin client not available (missing service key)";
    }
  } catch (err) {
    diagnostics.supabaseError = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json(diagnostics, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
