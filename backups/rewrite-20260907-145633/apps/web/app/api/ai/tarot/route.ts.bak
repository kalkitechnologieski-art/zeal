import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/errors';

export const POST = withErrorHandler(async (req: Request) => {
  const { question, cards } = await req.json();

  const readings = [
    'The cards reveal a period of transformation. Trust your intuition and embrace the changes ahead.',
    'You are on the right path. Keep moving forward with confidence and clarity.',
    'A new opportunity is coming. Be open to change and take the leap.',
    'The universe is supporting you. Let go of fear and step into your power.',
    'Your inner wisdom is your greatest guide. Listen to your heart and trust your instincts.',
  ];

  const reading = readings[Math.floor(Math.random() * readings.length)];

  // Card meanings for selected cards
  const cardMeanings = {
    1: 'The Magician – You have all the tools you need to manifest your desires.',
    2: 'The High Priestess – Trust your intuition and hidden knowledge.',
    3: 'The Empress – Nurture yourself and others; abundance is coming.',
    4: 'The Emperor – Take charge and build structure in your life.',
    5: 'The Hierophant – Seek wisdom from tradition and trusted guides.',
    6: 'The Lovers – Follow your heart and make choices with love.',
    7: 'The Chariot – You are moving forward; stay determined.',
    8: 'Strength – You have the inner strength to overcome any challenge.',
    9: 'The Hermit – Take time for introspection and self-discovery.',
    10: 'Wheel of Fortune – Change is coming; embrace the cycle.',
  };

  const cardDetails = (cards || []).map((id: number) => ({
    id,
    meaning: cardMeanings[id as keyof typeof cardMeanings] || 'A meaningful card for your journey.',
  }));

  return NextResponse.json({
    reading,
    cards: cardDetails,
  });
});
