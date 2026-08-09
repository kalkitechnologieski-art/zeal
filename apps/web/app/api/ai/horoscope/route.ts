import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/errors';

export const GET = withErrorHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const sign = searchParams.get('sign') || 'Aries';
  const name = searchParams.get('name') || 'Seeker';

  // In production, call Groq API
  const horoscopes = {
    Aries: '🔥 Aries, today is a day of bold action. Your courage will be rewarded.',
    Taurus: '🌱 Taurus, focus on nurturing your relationships today.',
    Gemini: '💬 Gemini, communication brings clarity. Speak your truth.',
    Cancer: '🌊 Cancer, trust your intuition. Your heart knows the way.',
    Leo: '👑 Leo, your light shines bright. Lead with confidence.',
    Virgo: '📋 Virgo, organization brings peace. Tackle one thing at a time.',
    Libra: '⚖️ Libra, balance is key. Find harmony in your choices.',
    Scorpio: '🦂 Scorpio, transformation is near. Embrace the change.',
    Sagittarius: '🏹 Sagittarius, adventure calls. Step out of your comfort zone.',
    Capricorn: '🏔️ Capricorn, your discipline will open new doors.',
    Aquarius: '💡 Aquarius, innovation is your superpower. Think different.',
    Pisces: '🎨 Pisces, let your creativity flow. Dream big.',
  };

  const horoscope = `✨ ${name}, ${horoscopes[sign as keyof typeof horoscopes] || 'The stars align in your favor.'}`;

  return NextResponse.json({ horoscope });
});
