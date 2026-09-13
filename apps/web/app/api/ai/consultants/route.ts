import { NextResponse } from "next/server";
import { prisma } from "@zeal/database";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where: Record<string, unknown> = { isActive: true };
    if (category) where.category = category;

    const consultants = await prisma.aIConsultant.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { rating: "desc" }, { name: "asc" }],
    });

    return NextResponse.json(consultants, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    console.error("[AI Consultants API]", error);
    return NextResponse.json(
      { error: "Failed to fetch AI consultants" },
      { status: 500 },
    );
  }
}
