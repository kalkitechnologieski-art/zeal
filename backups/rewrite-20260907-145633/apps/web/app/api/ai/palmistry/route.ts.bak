import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/errors';

export const POST = withErrorHandler(async (req: Request) => {
  const formData = await req.formData();
  const image = formData.get('image');

  // Mock palm analysis – in production, use Groq Vision
  const analysis = {
    lifeLine: 'Strong and clear, indicating vitality.',
    heartLine: 'Long and curved, showing emotional depth.',
    headLine: 'Straight and long, suggesting analytical thinking.',
    fateLine: 'Present, indicating a purposeful life.',
  };

  return NextResponse.json({ analysis });
});
