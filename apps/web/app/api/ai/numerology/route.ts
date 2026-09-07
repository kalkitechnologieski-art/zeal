import { NextResponse } from "next/server";
import { withErrorHandler } from "@/lib/errors";
import { getAIResponse } from "@/lib/ai/ai-chat";
import { redis } from "@/lib/cache";

export const POST = withErrorHandler(async (req: Request) => {
  const { name, birthDate } = await req.json();

  const cacheKey = `numerology:${name}:${birthDate}`;
  const cached = await redis.get(cacheKey);
  if (cached && typeof cached === "string") {
    try {
      const parsed = JSON.parse(cached);
      return NextResponse.json({ ...parsed, cached: true });
    } catch {
      // ignore invalid cache
    }
  }

  const prompt = `Calculate the life path number for ${name} born on ${birthDate}. Provide a detailed numerology report including life path number, destiny number, personality number, and detailed meanings.`;

  const response = await getAIResponse(
    prompt,
    "",
    "You are a master numerologist with 20+ years of experience. Provide detailed, accurate numerology reports."
  );

  const numbers = birthDate.replace(/-/g, "").split("").map(Number);
  let lifePath = numbers.reduce((a: number, b: number) => a + b, 0);
  while (lifePath > 9 && lifePath !== 11 && lifePath !== 22 && lifePath !== 33) {
    lifePath = lifePath.toString().split("").map(Number).reduce((a: number, b: number) => a + b, 0);
  }

  const result = {
    lifePath,
    meaning: response.content,
    nameNumber: name.length,
    destinyNumber: lifePath + name.length,
    advice: "Embrace your strengths and work on your challenges.",
  };

  await redis.setex(cacheKey, 86400, JSON.stringify(result));
  return NextResponse.json({ ...result, cached: false });
});
