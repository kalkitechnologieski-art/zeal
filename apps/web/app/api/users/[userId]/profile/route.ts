import { prisma } from "@zeal/database";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  // Mock data – replace with real database query
  return NextResponse.json({
    id: userId,
    username: "astrologer_raj",
    bio: "Vedic Astrologer | Helping you find your path.",
    avatar: "https://ui-avatars.com/api/?name=Raj&background=9D7DC5&color=fff",
    sparks: 12500,
    posts: 87,
    followers: 340,
    isVerified: true,
    isHealer: true,
    perMinuteRate: 50,
    isAvailable: true,
  });
}
