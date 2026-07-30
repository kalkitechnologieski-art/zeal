import { NextResponse } from "next/server";
export async function POST(request: Request) {
  // Placeholder – integrate with Cloudflare R2
  return NextResponse.json({ success: true, message: "Post created successfully" });
}
