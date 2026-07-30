import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ questId: string }> }
) {
  const { questId } = await params;
  // Placeholder – process quest completion
  return NextResponse.json({ success: true, questId });
}
