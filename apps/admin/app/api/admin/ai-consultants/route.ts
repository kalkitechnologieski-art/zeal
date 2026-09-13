import { NextResponse } from "next/server";
import { prisma } from "@zeal/database";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const items = await prisma.aIConsultant.findMany({
      orderBy: [{ isFeatured: "desc" }, { rating: "desc" }],
    });
    return NextResponse.json({ items, total: items.length });
  } catch (error) {
    console.error("[Admin AI Consultants] Error:", error);
    return NextResponse.json({ items: [], total: 0 }, { status: 500 });
  }
}
