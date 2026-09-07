import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/errors';

export const POST = withErrorHandler(async (req: Request) => {
  const { name, birthDate } = await req.json();

  // Calculate life path number
  const numbers = birthDate.replace(/-/g, '').split('').map(Number);
  const lifePath = numbers.reduce((a: number, b: number) => a + b, 0);
  const finalNumber = lifePath > 9 ? lifePath.toString().split('').map(Number).reduce((a: number, b: number) => a + b, 0) : lifePath;

  const meanings: Record<number, string> = {
    1: 'Leader, independent, ambitious. You are a natural-born leader with a strong drive to succeed.',
    2: 'Diplomatic, cooperative, intuitive. You are a peacemaker with a deep understanding of others.',
    3: 'Creative, social, expressive. You are an artist at heart, full of ideas and enthusiasm.',
    4: 'Practical, disciplined, reliable. You are the foundation upon which others build.',
    5: 'Adventurous, versatile, freedom-loving. You are a free spirit, always seeking new experiences.',
    6: 'Caring, responsible, nurturing. You are the caregiver, always putting others first.',
    7: 'Intellectual, spiritual, analytical. You are the seeker of truth and wisdom.',
    8: 'Ambitious, authoritative, successful. You are born to lead and achieve great things.',
    9: 'Humanitarian, compassionate, visionary. You are here to make the world a better place.',
  };

  const detailedMeaning = meanings[finalNumber] || 'A unique path awaits you. Your journey is special and full of potential.';
  const nameNumber = name.length;

  // Additional numerology details
  const personalityNumber = name.length > 5 ? 'You have a strong presence that draws others to you.' : 'You are thoughtful and introspective.';
  const destinyNumber = finalNumber + nameNumber;

  return NextResponse.json({
    lifePath: finalNumber,
    meaning: detailedMeaning,
    nameNumber,
    personalityNumber,
    destinyNumber,
    advice: 'Embrace your strengths and work on your challenges. Your life path is a guide, not a destiny.',
  });
});
