import { NextResponse } from "next/server";
import { withErrorHandler } from "@/lib/errors";
import { getTarotReading } from "@/lib/ai/ai-chat";
import { redis } from "@/lib/cache";

export const POST = withErrorHandler(async (req: Request) => {
  const { question, cards } = await req.json();

  const cacheKey = `tarot:${question}`;
  const cached = await redis.get(cacheKey);
  if (cached && typeof cached === "string") {
    try {
      const parsed = JSON.parse(cached);
      return NextResponse.json({ ...parsed, cached: true });
    } catch {
      // invalid cache, ignore
    }
  }

  const reading = await getTarotReading(question);

  const cardMeanings: Record<number, string> = {
    1: "The Magician – Manifestation, power, skill",
    2: "The High Priestess – Intuition, mystery, subconscious",
    3: "The Empress – Abundance, nurturing, creation",
    4: "The Emperor – Authority, structure, protection",
    5: "The Hierophant – Tradition, wisdom, guidance",
    6: "The Lovers – Love, harmony, choices",
    7: "The Chariot – Victory, willpower, determination",
    8: "Strength – Courage, patience, inner strength",
    9: "The Hermit – Wisdom, solitude, introspection",
    10: "Wheel of Fortune – Destiny, change, opportunity",
  };

  const cardDetails = (cards || []).map((id: number) => ({
    id,
    meaning: cardMeanings[id] || "A meaningful card for your journey.",
  }));

  const result = { reading, cards: cardDetails, cached: false };
  await redis.setex(cacheKey, 3600, JSON.stringify(result));
  return NextResponse.json(result);
});
