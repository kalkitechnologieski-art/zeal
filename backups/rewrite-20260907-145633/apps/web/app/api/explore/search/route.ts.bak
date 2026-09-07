import { prisma } from "@zeal/database";
import { NextResponse } from "next/server";
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const results = [
    { id: "1", type: "profile", label: "astrologer_raj", description: "Vedic Astrologer" },
    { id: "2", type: "hashtag", label: "spiritualgrowth" },
    { id: "3", type: "topic", label: "Career Guidance" },
  ].filter(item => item.label.toLowerCase().includes(q.toLowerCase()));
  return NextResponse.json(results);
}
