import { NextResponse } from "next/server";
import { withErrorHandler } from "@/lib/errors";
import { getAIResponse } from "@/lib/ai/ai-chat";
import { redis } from "@/lib/cache";

export const GET = withErrorHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const sign = searchParams.get("sign") || "Aries";
  const name = searchParams.get("name") || "Seeker";
  const period = searchParams.get("period") || "Today";

  // Generate a cache key
  const cacheKey = `horoscope:${sign}:${name}:${period}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return NextResponse.json({ horoscope: cached, cached: true });
  }

  const prompt = `Generate a detailed ${period} horoscope for ${name}, who is a ${sign}. Include predictions for career, love, health, and spiritual growth. Make it personalized and uplifting.`;

  const response = await getAIResponse(
    prompt,
    "",
    "You are a world-class Vedic astrologer with 30+ years of experience. Provide detailed, accurate, and compassionate horoscope readings."
  );

  // Cache for 1 hour (3600 seconds)
  await redis.setex(cacheKey, 3600, response.content);

  return NextResponse.json({ horoscope: response.content, cached: false });
});
