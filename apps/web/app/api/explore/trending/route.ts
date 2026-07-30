import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json([
    { id: "t1", label: "meditation" },
    { id: "t2", label: "yoga" },
    { id: "t3", label: "astrology" },
    { id: "t4", label: "wellness" },
  ]);
}
