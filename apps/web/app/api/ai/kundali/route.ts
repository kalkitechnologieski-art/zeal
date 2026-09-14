import { generateFaultTolerantStream } from "@/lib/ai/router";
import { aiRateLimiter } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const { success } = await aiRateLimiter.limit(req.headers.get("x-forwarded-for") || "127.0.0.1");
    if (!success) return new Response("Rate limit exceeded.", { status: 429 });

    const { fullName, birthDate, birthTime, location } = await req.json();

    const systemPrompt = `You are a master Vedic Astrologer specializing in Janam Kundali (Birth Charts). Provide deep, structural analysis covering planetary placements (Lagna, Moon sign, Sun sign) and core life paths for ${fullName}, born in ${location} on ${birthDate} at ${birthTime}. Keep formatting ultra-clean.`;
    const userPrompt = "Analyze my Janam Kundali. Break down my ascendant, core strengths, and upcoming planetary influences.";

    return await generateFaultTolerantStream(systemPrompt, userPrompt);
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}
