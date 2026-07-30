import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  // Mock data – replace with database queries
  return NextResponse.json({
    referralLink: `https://zeal.com/ref/${userId}`,
    referralCount: 12,
    sparksEarned: 600,
  });
}
