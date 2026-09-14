import { generateFaultTolerantStream } from "@/lib/ai/router";
import { aiRateLimiter } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const { success } = await aiRateLimiter.limit(req.headers.get("x-forwarded-for") || "127.0.0.1");
    if (!success) return new Response("Rate limit exceeded.", { status: 429 });

    const { fullName, birthDate } = await req.json();

    const systemPrompt = `You are a master Numerologist. Calculate and analyze the Life Path number (from DOB: ${birthDate}) and Expression/Destiny number (from Full Name: ${fullName}). Provide insights into hidden talents, core challenges, and current personal year cycles.`;
    const userPrompt = "Calculate my core numerology numbers and decode my blueprint.";

    return await generateFaultTolerantStream(systemPrompt, userPrompt);
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}
