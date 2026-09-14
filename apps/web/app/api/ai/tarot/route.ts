import { generateFaultTolerantStream } from "@/lib/ai/router";
import { aiRateLimiter } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const { success } = await aiRateLimiter.limit(req.headers.get("x-forwarded-for") || "127.0.0.1");
    if (!success) return new Response("Rate limit exceeded.", { status: 429 });

    const { cards, spreadType } = await req.json();

    const systemPrompt = `You are an elite, intuitive Tarot reader. Interpret the following drawn cards for a '${spreadType || "3-Card (Past, Present, Future)"}' spread: ${JSON.stringify(cards)}. Maintain a profound, psychologically revealing, and modern tone akin to high-end mystic platforms. Break down the imagery, core meaning, and actionable advice.`;
    const userPrompt = "Provide my deep tarot reading based on these pulled cards.";

    return await generateFaultTolerantStream(systemPrompt, userPrompt);
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}
