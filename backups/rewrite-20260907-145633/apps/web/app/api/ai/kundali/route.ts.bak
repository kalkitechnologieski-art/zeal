import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/errors';

export const POST = withErrorHandler(async (req: Request) => {
  const { date, time, place } = await req.json();

  // Mock kundali data – in production, use astrological library or AI
  const chart = {
    ascendant: 'Taurus',
    moon: 'Cancer',
    sun: 'Leo',
    houses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => ({
      house: h,
      sign: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][h - 1],
      lord: ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'][h - 1],
    })),
  };

  return NextResponse.json({ chart });
});
