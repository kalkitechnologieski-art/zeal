import { NextResponse } from 'next/server';
import { withErrorHandler, AppError } from '@/lib/errors';

// Mock data (same as above)
const consultants = [
  { id: 'ai1', name: 'AstroAI-1', username: 'astroai1', avatar: 'https://ui-avatars.com/api/?name=AI+1&background=533AFD&color=fff', category: 'ASTROLOGER', specialties: ['Vedic', 'KP'], isPaid: false, perMinuteRate: 0, rating: 4.8, totalConsultations: 5000, bio: 'Vedic Astrologer with AI precision.', isOnline: true, languages: ['English'] },
  { id: 'ai2', name: 'AstroAI-2', username: 'astroai2', avatar: 'https://ui-avatars.com/api/?name=AI+2&background=533AFD&color=fff', category: 'ASTROLOGER', specialties: ['Nadi', 'Muhurtha'], isPaid: false, perMinuteRate: 0, rating: 4.7, totalConsultations: 4000, bio: 'Nadi expert powered by AI.', isOnline: true, languages: ['English'] },
  // ... add all others for completeness
];

export const GET = withErrorHandler(async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const consultant = consultants.find(c => c.id === id);
  if (!consultant) throw new AppError('Consultant not found', 404, 'NOT_FOUND');
  return NextResponse.json(consultant);
});
