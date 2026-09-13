import { NextResponse } from "next/server";
import { prisma } from "@zeal/database";

export const dynamic = "force-dynamic";

/**
 * Returns recent debug logs from the database (if DebugLog table exists).
 */
export async function GET() {
  try {
    const logs = await prisma.$queryRaw`
      SELECT * FROM "DebugLog"
      ORDER BY "createdAt" DESC
      LIMIT 200
    `;

    return NextResponse.json({ logs });
  } catch (error) {
    // Table may not exist — return empty
    return NextResponse.json({
      logs: [],
      note: "DebugLog table not found. Run the SQL migration to enable database log storage.",
    });
  }
}
