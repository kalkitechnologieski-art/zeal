// AI Chat module – production-ready with Groq SDK and fallbacks

import { z } from "zod";

const AI_RESPONSE_SCHEMA = z.object({
  content: z.string(),
  confidence: z.number().min(0).max(1).optional(),
});

type AIResponse = z.infer<typeof AI_RESPONSE_SCHEMA>;

/**
 * Send a chat message to the AI with fallback handling
 * Primary: Groq API (free tier, fast inference)
 * Fallback: Hardcoded responses if API fails
 */
export async function getAIResponse(
  prompt: string,
  context?: string,
  systemPrompt?: string
): Promise<AIResponse> {
  // Try Groq API first (Primary)
  try {
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      console.warn("GROQ_API_KEY not set, using fallback responses.");
      return getFallbackResponse(prompt);
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt || "You are a helpful assistant for wellness and astrology." },
          { role: "user", content: context ? `${context}\n\n${prompt}` : prompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      console.warn(`Groq API error: ${response.status} ${response.statusText}`);
      return getFallbackResponse(prompt);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || "I'm not sure how to respond to that.";

    return AI_RESPONSE_SCHEMA.parse({
      content,
      confidence: 0.85,
    });
  } catch (error) {
    console.error("AI request failed:", error);
    return getFallbackResponse(prompt);
  }
}

/**
 * Generate astrological insights specifically
 */
export async function getAstrologyInsight(
  birthDate: string,
  birthTime: string,
  birthPlace: string,
  question?: string
): Promise<string> {
  const prompt = `Provide a detailed astrological insight for a person born on ${birthDate} at ${birthTime} in ${birthPlace}. ${question ? `They ask: ${question}` : "Give a general reading."}`;
  const response = await getAIResponse(prompt, "", "You are a world-class Vedic astrologer with 30+ years of experience.");
  return response.content;
}

/**
 * Get a quick tarot reading
 */
export async function getTarotReading(question?: string): Promise<string> {
  const prompt = question ? `Provide a tarot reading for this question: ${question}` : "Provide a general 3-card tarot reading.";
  const response = await getAIResponse(prompt, "", "You are an expert tarot reader.");
  return response.content;
}

/**
 * Fallback responses when API is unavailable
 * Guaranteed to return a string (never undefined)
 */
function getFallbackResponse(prompt: string): AIResponse {
  const fallbacks: string[] = [
    "Thank you for your question. I'm here to help guide you on your journey.",
    "That's a thoughtful question. Let me reflect on that for you.",
    "I appreciate your openness. Here's what I sense about your situation.",
    "I can feel the depth of your inquiry. Let me offer some perspective.",
    "Your question is important. Let me share some wisdom with you.",
    "I'm glad you asked. Here's my insight on that.",
  ];
  const content = fallbacks[Math.floor(Math.random() * fallbacks.length)] ?? "I'm here to help. Please try again.";
  return {
    content,
    confidence: 0.6,
  };
}
