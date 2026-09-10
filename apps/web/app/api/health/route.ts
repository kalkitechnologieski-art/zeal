import { NextResponse } from "next/server";
import { prisma } from "@zeal/database";

interface CheckResult {
  name: string;
  status: "ok" | "degraded" | "down";
  latencyMs?: number;
  error?: string;
}

async function timedCheck(
  name: string,
  fn: () => Promise<void>,
): Promise<CheckResult> {
  const start = Date.now();
  try {
    await fn();
    return { name, status: "ok", latencyMs: Date.now() - start };
  } catch (err) {
    return {
      name,
      status: "down",
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();
  const checks: CheckResult[] = [];

  // DB connectivity
  checks.push(
    await timedCheck("database", async () => {
      await prisma.$queryRaw`SELECT 1`;
    }),
  );

  // Supabase env
  checks.push(
    await timedCheck("env-supabase", async () => {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) throw new Error("URL missing");
      if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) throw new Error("Anon key missing");
    }),
  );

  // Realtime
  checks.push(
    await timedCheck("realtime", async () => {
      if (process.env.NEXT_PUBLIC_REALTIME_ENABLED !== "true") {
        throw new Error("Realtime not enabled");
      }
    }),
  );

  // Payments
  checks.push(
    await timedCheck("payments", async () => {
      if (!process.env.RAZORPAY_KEY_ID) throw new Error("Razorpay key missing");
    }),
  );

  const overall = checks.every((c) => c.status === "ok")
    ? "ok"
    : checks.some((c) => c.status === "down")
    ? "down"
    : "degraded";

  return NextResponse.json(
    {
      status: overall,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      region: process.env.VERCEL_REGION || "local",
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "local",
      uptime: process.uptime(),
      responseTimeMs: Date.now() - start,
      checks,
    },
    {
      status: overall === "down" ? 503 : 200,
      headers: { "Cache-Control": "no-store, max-age=0" },
    },
  );
}

// VERCEL_SETUP_APPLIED
