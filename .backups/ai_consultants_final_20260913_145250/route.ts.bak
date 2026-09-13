import { NextResponse } from "next/server";
import { prisma } from "@zeal/database";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const consultant = await prisma.aIConsultant.findUnique({ where: { id } });

    if (!consultant) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(consultant, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    console.error("[AI Consultant Detail]", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
