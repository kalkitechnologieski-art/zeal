import { prisma } from "@zeal/database";
import { NextResponse } from "next/server";
export async function POST(request: Request) {
  const body = await request.json();
  // Integrate Instamojo here
  return NextResponse.json({ payment_url: "https://test.instamojo.com/@zeal/" + Date.now() });
}
